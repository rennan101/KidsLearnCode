// Animal Crossing Style Dialogue & In-Game Chat Bubble Queue System (Max 2 Bubbles Stack)

export class DialogueAndChatSystem {
  constructor(options = {}) {
    this.speechBubbles = new Map(); // entityId -> [{ id, text, createdAt, expiresAt, element }]
    this.maxStackedBubbles = 2;
    this.bubbleDurationMs = 5000;
    
    // Active NPC dialogue state
    this.activeDialogue = null; // { speaker, text, portrait, choices, onComplete }
    this.typewriterIndex = 0;
    this.typewriterTimer = null;
    this.audioContext = null;

    this.initAudio();
  }

  initAudio() {
    // Lazy initialize on first audio playback to respect browser autoplay policies
  }

  getAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      } catch {
        // Audio not available
      }
    }
    return this.audioContext;
  }

  playACBlip(pitch = 440) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Pitch variation based on character voice
      const randomPitch = pitch * (0.95 + Math.random() * 0.1);
      osc.frequency.setValueAtTime(randomPitch, this.audioContext.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.08);
    } catch {
      // Ignore audio glitch
    }
  }

  // Add speech bubble above character (player or NPC)
  addSpeechBubble(entityId, text, worldPos = { x: 0, y: 0 }) {
    if (!this.speechBubbles.has(entityId)) {
      this.speechBubbles.set(entityId, []);
    }

    const queue = this.speechBubbles.get(entityId);
    const now = Date.now();

    const newBubble = {
      id: `bubble_${now}_${Math.random().toString(36).substr(2, 5)}`,
      text: (text || '').trim(),
      createdAt: now,
      expiresAt: now + this.bubbleDurationMs,
      worldPos: worldPos ? { ...worldPos } : { x: 0, y: 0 }
    };

    queue.push(newBubble);

    // If there are more than 2 active bubbles, shift and remove oldest immediately
    while (queue.length > this.maxStackedBubbles) {
      queue.shift();
    }

    // Play AC squeak sound
    this.playACBlip(620);
    return newBubble;
  }

  // Compatibility alias for multiplayer bots and NPCs
  addBubble(entityId, senderName, text, heroId) {
    return this.addSpeechBubble(entityId, text);
  }

  update(worldPosMap = new Map()) {
    const now = Date.now();
    for (const [entityId, queue] of this.speechBubbles.entries()) {
      // Update entity world pos if provided
      if (worldPosMap.has(entityId)) {
        const latestPos = worldPosMap.get(entityId);
        queue.forEach(b => {
          b.worldPos.x = latestPos.x;
          b.worldPos.y = latestPos.y;
        });
      }

      // Filter expired bubbles
      const filtered = queue.filter(b => now < b.expiresAt);
      if (filtered.length === 0) {
        this.speechBubbles.delete(entityId);
      } else {
        this.speechBubbles.set(entityId, filtered);
      }
    }
  }

  // Render floating speech bubbles in screen space directly above characters (ACNH Style)
  render(ctx, camera) {
    const now = Date.now();

    for (const [, queue] of this.speechBubbles.entries()) {
      const bubbleCount = queue.length;
      queue.forEach((bubble, index) => {
        // Calculate screen coordinate
        const screenPos = camera.worldToScreen(bubble.worldPos.x + 32, bubble.worldPos.y);

        // Stacking calculation: index 0 is oldest (higher), index 1 is newest (just above head)
        const stackOffset = (bubbleCount - 1 - index) * 42; // 42px per stack level
        const bubbleY = screenPos.y - 48 - stackOffset;
        const bubbleX = screenPos.x;

        // Pop-in animation scale in the first 160ms
        const age = now - bubble.createdAt;
        let scale = 1.0;
        if (age < 160) {
          const t = age / 160;
          scale = 0.85 + Math.sin(t * Math.PI / 2) * 0.15;
        }

        // Fade-out opacity in the last 600ms
        const remainingTime = bubble.expiresAt - now;
        let opacity = 1.0;
        if (remainingTime < 600) {
          opacity = Math.max(0, remainingTime / 600);
        }

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(bubbleX, bubbleY);
        ctx.scale(scale, scale);

        // Measure text
        ctx.font = 'bold 13px "Outfit", sans-serif';
        const metrics = ctx.measureText(bubble.text);
        const paddingX = 16;
        const paddingY = 8;
        const boxWidth = Math.max(56, metrics.width + paddingX * 2);
        const boxHeight = 32;
        const boxX = -boxWidth / 2;
        const boxY = -boxHeight / 2;
        const radius = 16;

        // 1. Draw ACNH soft warm drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        // 2. Main Bubble Body - Warm Cream Fill (#fdfbf7)
        ctx.fillStyle = '#fdfbf7';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
        ctx.fill();

        // 3. Pointer tail on bottom-most bubble
        if (index === bubbleCount - 1) {
          ctx.beginPath();
          ctx.moveTo(-7, boxHeight / 2 - 1);
          ctx.lineTo(0, boxHeight / 2 + 9);
          ctx.lineTo(7, boxHeight / 2 - 1);
          ctx.closePath();
          ctx.fill();
        }

        // 4. ACNH Characteristic Warm Chocolate Outline (#7a583e)
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#7a583e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
        ctx.stroke();

        if (index === bubbleCount - 1) {
          ctx.beginPath();
          ctx.moveTo(-7, boxHeight / 2);
          ctx.lineTo(0, boxHeight / 2 + 9);
          ctx.lineTo(7, boxHeight / 2);
          ctx.stroke();

          // Patch seam between bubble and tail
          ctx.fillStyle = '#fdfbf7';
          ctx.fillRect(-6, boxHeight / 2 - 2, 12, 3);
        }

        // 5. Draw High-Contrast Dark Warm Text
        ctx.fillStyle = '#3b281c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.text, 0, 0);

        ctx.restore();
      });
    }
  }

  // Open Full Animal Crossing Style NPC Dialogue Box
  startNPCDialogue(speakerMeta, dialogueText, choices = [], onComplete = null) {
    this.activeDialogue = {
      speaker: speakerMeta,
      fullText: dialogueText,
      displayedText: '',
      choices,
      onComplete,
      isFinished: false
    };

    this.typewriterIndex = 0;
    const modalEl = document.getElementById('ac-dialogue-modal');
    const nameEl = document.getElementById('ac-dialogue-name');
    const textEl = document.getElementById('ac-dialogue-text');
    const portraitEl = document.getElementById('ac-dialogue-portrait');
    const choicesEl = document.getElementById('ac-dialogue-choices');

    if (!modalEl || !textEl) return;

    modalEl.style.display = 'flex';
    if (nameEl) nameEl.innerText = speakerMeta.name || 'Morador';
    if (portraitEl) {
      portraitEl.src = speakerMeta.portraitUrl || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
    }
    if (choicesEl) choicesEl.innerHTML = '';

    clearInterval(this.typewriterTimer);
    this.typewriterTimer = setInterval(() => {
      if (this.typewriterIndex < this.activeDialogue.fullText.length) {
        this.activeDialogue.displayedText += this.activeDialogue.fullText[this.typewriterIndex];
        textEl.innerText = this.activeDialogue.displayedText;
        this.playACBlip(speakerMeta.pitch || 520);
        this.typewriterIndex++;
      } else {
        clearInterval(this.typewriterTimer);
        this.activeDialogue.isFinished = true;
        this.renderChoices(choicesEl, choices, onComplete);
      }
    }, 28);
  }

  renderChoices(container, choices, onComplete) {
    if (!container) return;
    container.innerHTML = '';
    if (!choices || choices.length === 0) {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'ac-choice-btn';
      continueBtn.innerText = 'Entendido!';
      continueBtn.addEventListener('click', () => {
        this.closeNPCDialogue();
        if (onComplete) onComplete(null);
      });
      container.appendChild(continueBtn);
      return;
    }

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'ac-choice-btn';
      btn.innerText = choice.label;
      btn.addEventListener('click', () => {
        this.closeNPCDialogue();
        if (choice.action) choice.action();
        if (onComplete) onComplete(choice.value);
      });
      container.appendChild(btn);
    });
  }

  closeNPCDialogue() {
    clearInterval(this.typewriterTimer);
    const modalEl = document.getElementById('ac-dialogue-modal');
    if (modalEl) modalEl.style.display = 'none';
    this.activeDialogue = null;
  }
}
