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
      const randomPitch = pitch * (0.96 + Math.random() * 0.08);
      osc.frequency.setValueAtTime(randomPitch, ctx.currentTime);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
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
  startNPCDialogue(speakerMeta, dialogueText, choices = [], onComplete = null, npcData = null) {
    if (npcData) {
      this.activeNpc = {
        ...npcData,
        worldX: npcData.worldX ?? (npcData.tx ? npcData.tx * 64 : 0),
        worldY: npcData.worldY ?? (npcData.ty ? npcData.ty * 64 : 0)
      };
    }

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
    const indicatorEl = document.getElementById('ac-dialogue-indicator');

    if (!modalEl || !textEl) return;

    modalEl.style.display = 'flex';
    if (indicatorEl) indicatorEl.style.display = 'none';
    if (nameEl) nameEl.innerText = speakerMeta.name || 'Morador';
    if (portraitEl) {
      portraitEl.onerror = () => {
        portraitEl.onerror = null;
        portraitEl.src = 'assets/characters/char_wolf_hunter_m/portrait.jpg';
      };
      portraitEl.src = speakerMeta.portraitUrl || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
    }
    if (choicesEl) choicesEl.innerHTML = '';

    if (this.onDialogueOpen) {
      this.onDialogueOpen(this.activeNpc, speakerMeta);
    }

    clearInterval(this.typewriterTimer);
    this.typewriterTimer = setInterval(() => {
      if (this.typewriterIndex < this.activeDialogue.fullText.length) {
        const nextChar = this.activeDialogue.fullText[this.typewriterIndex];
        this.activeDialogue.displayedText += nextChar;
        textEl.innerText = this.activeDialogue.displayedText;
        
        // Cozy Animalese sound every 2 non-whitespace characters
        if (this.typewriterIndex % 2 === 0 && /\S/.test(nextChar)) {
          this.playACBlip(speakerMeta.pitch || 520);
        }
        this.typewriterIndex++;
      } else {
        clearInterval(this.typewriterTimer);
        this.activeDialogue.isFinished = true;
        if (indicatorEl) indicatorEl.style.display = 'flex';
        this.renderChoices(choicesEl, choices, onComplete);
      }
    }, 48);
  }

  // Update floating dialogue box position above the NPC on screen
  updateDialoguePosition(camera) {
    if (!this.activeDialogue || !this.activeNpc || !camera) return;
    const modalEl = document.getElementById('ac-dialogue-modal');
    const boxEl = modalEl?.querySelector('.ac-dialogue-box');
    if (!modalEl || !boxEl || modalEl.style.display === 'none') return;

    const screenPos = camera.worldToScreen(this.activeNpc.worldX + 32, this.activeNpc.worldY);
    if (!screenPos) return;

    const boxW = boxEl.offsetWidth || 620;
    const boxH = boxEl.offsetHeight || 140;
    const pad = 16;
    const halfW = boxW / 2;

    const targetX = screenPos.x;
    const targetY = screenPos.y - 30; // Float 30px above NPC head

    const clampedX = Math.max(halfW + pad, Math.min(window.innerWidth - halfW - pad, targetX));
    const clampedY = Math.max(boxH + pad, Math.min(window.innerHeight - pad, targetY));

    boxEl.style.position = 'absolute';
    boxEl.style.left = `${clampedX}px`;
    boxEl.style.top = `${clampedY}px`;
    boxEl.style.transform = 'translate(-50%, -100%)';

    const tailOffset = Math.max(-halfW + 40, Math.min(halfW - 40, targetX - clampedX));
    boxEl.style.setProperty('--tail-offset-x', `${tailOffset}px`);
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
    const indicatorEl = document.getElementById('ac-dialogue-indicator');
    if (indicatorEl) indicatorEl.style.display = 'none';
    if (modalEl) modalEl.style.display = 'none';
    this.activeDialogue = null;
    this.activeNpc = null;
    if (this.onDialogueClose) {
      this.onDialogueClose();
    }
  }

  // Open complete NPC conversation with progressive multi-mission branching and asset unlocking
  openNpcConversation(npcData, blocklySystem, callbacks = {}) {
    if (!npcData) return;
    this.activeNpc = {
      ...npcData,
      worldX: npcData.worldX ?? (npcData.tx ? npcData.tx * 64 : 0),
      worldY: npcData.worldY ?? (npcData.ty ? npcData.ty * 64 : 0)
    };

    const progress = blocklySystem?.getNpcProgress(npcData.id) || {
      completedCount: 0,
      totalCount: 1,
      isFinished: false,
      nextLesson: null
    };

    const speakerMeta = {
      name: `${npcData.name} - ${npcData.role}`,
      portraitUrl: npcData.portrait || `assets/characters/${npcData.id}/portrait.jpg`,
      pitch: 500
    };

    if (progress.isFinished) {
      // All missions for this NPC are completed
      const text = npcData.masterDialogue || `Parabéns! Você completou todos os meus ${progress.totalCount} desafios de código! Todos os objetos correspondentes estão totalmente liberados para você construir a ilha!`;
      const choices = [];

      if (callbacks.onOpenCrafting) {
        choices.push({
          label: 'Abrir Bancada de Criação',
          action: () => callbacks.onOpenCrafting()
        });
      }

      if (callbacks.onOpenLesson && progress.nextLesson) {
        choices.push({
          label: 'Revisar Desafios no Grimório',
          action: () => callbacks.onOpenLesson(progress.nextLesson.id)
        });
      }

      choices.push({
        label: 'Até logo!',
        action: () => this.closeNPCDialogue()
      });

      this.startNPCDialogue(speakerMeta, text, choices, null, npcData);
    } else {
      // There is an active pending mission in the sequence
      const lesson = progress.nextLesson;
      if (!lesson) return;

      const progressTag = `[Etapa ${progress.completedCount + 1} de ${progress.totalCount}]`;
      const text = `${npcData.greeting || ''}\n\n${progressTag} ${lesson.title}\n${lesson.description}\n\nRecompensa de Criação: ${lesson.unlockedAssetName}`;

      const choices = [
        {
          label: `Aceitar: ${lesson.unlockedAssetName}`,
          action: () => {
            if (callbacks.onOpenLesson) {
              callbacks.onOpenLesson(lesson.id);
            }
          }
        },
        {
          label: 'Pedir Dica',
          action: () => {
            const hintText = `Dica de ${lesson.concept}: Escreva o script de acordo com os parâmetros necessários e clique em "Executar Código" no Grimório Lua!`;
            this.startNPCDialogue(speakerMeta, hintText, [
              {
                label: `Iniciar Desafio (${lesson.unlockedAssetName})`,
                action: () => {
                  if (callbacks.onOpenLesson) {
                    callbacks.onOpenLesson(lesson.id);
                  }
                }
              },
              {
                label: 'Entendido!',
                action: () => this.closeNPCDialogue()
              }
            ], null, npcData);
          }
        },
        {
          label: 'Agora não',
          action: () => this.closeNPCDialogue()
        }
      ];

      this.startNPCDialogue(speakerMeta, text, choices, null, npcData);
    }
  }
}

export default DialogueAndChatSystem;
