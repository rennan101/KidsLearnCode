// Animal Crossing Style Dialogue & In-Game Chat Bubble Queue System (Max 2 Bubbles Stack)
import { VILLAGE_NPCS } from './CharacterRegistry.js';
import { soundFX } from './SoundFX.js';

export class DialogueAndChatSystem {
  constructor(options = {}) {
    this.speechBubbles = new Map(); // entityId -> [{ id, text, createdAt, expiresAt, element }]
    this.maxStackedBubbles = 2;
    this.bubbleDurationMs = 5000;
    
    // Active NPC dialogue pagination state
    this.activeDialogue = null; // { speaker, fullText, displayedText, isFinished }
    this.dialoguePages = [];
    this.currentPageIndex = 0;
    this.dialogueChoices = [];
    this.dialogueOnComplete = null;
    this.speakerMeta = null;

    this.typewriterIndex = 0;
    this.typewriterTimer = null;
    this.audioContext = null;

    this.initAudio();
    this.setupGlobalControls();
  }

  setupGlobalControls() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        const modalEl = document.getElementById('ac-dialogue-modal');
        if (!modalEl || modalEl.style.display === 'none') return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        
        // Advance dialogue on [E], [Space] or [Enter]
        if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.advanceDialogue();
        }
      });
    }
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

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Ignore audio glitch
    }
  }

  // Add speech bubble above character (player or NPC)
  addSpeechBubble(entityId, text, worldPos = { x: 0, y: 0 }, playSound = false) {
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

    // Play AC squeak sound only if explicitly requested (e.g. active player chat)
    if (playSound) {
      this.playACBlip(620);
    }
    return newBubble;
  }

  // Compatibility alias for multiplayer bots and NPCs
  addBubble(entityId, senderName, text, heroId) {
    return this.addSpeechBubble(entityId, text, { x: 0, y: 0 }, false);
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

  // Splits long speeches into comfortable, readable pages
  splitIntoPages(input) {
    if (Array.isArray(input)) {
      return input.map(s => String(s).trim()).filter(Boolean);
    }

    const rawStr = String(input || '').trim();
    if (!rawStr) return ['...'];

    // Split by double line breaks first
    const paragraphs = rawStr.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    const pages = [];

    paragraphs.forEach(para => {
      // If a single paragraph is too long, split by sentence boundary
      if (para.length > 175) {
        const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
        let currentChunk = '';

        sentences.forEach(sent => {
          const trimmedSent = sent.trim();
          if ((currentChunk + ' ' + trimmedSent).trim().length <= 165) {
            currentChunk = (currentChunk ? currentChunk + ' ' : '') + trimmedSent;
          } else {
            if (currentChunk) pages.push(currentChunk);
            currentChunk = trimmedSent;
          }
        });
        if (currentChunk) pages.push(currentChunk);
      } else {
        pages.push(para);
      }
    });

    return pages.length > 0 ? pages : [rawStr];
  }

  // Open Full Animal Crossing Style NPC Dialogue Box with Pagination
  startNPCDialogue(speakerMeta, dialogueInput, choices = [], onComplete = null, npcData = null) {
    if (npcData) {
      this.activeNpc = {
        ...npcData,
        worldX: npcData.worldX ?? (npcData.tx ? npcData.tx * 64 : 0),
        worldY: npcData.worldY ?? (npcData.ty ? npcData.ty * 64 : 0)
      };
    }

    this.speakerMeta = speakerMeta || { name: 'Morador', portraitUrl: 'assets/characters/char_wolf_hunter_m/portrait.jpg' };
    this.dialoguePages = this.splitIntoPages(dialogueInput);
    this.currentPageIndex = 0;
    this.dialogueChoices = choices || [];
    this.dialogueOnComplete = onComplete;

    const modalEl = document.getElementById('ac-dialogue-modal');
    const portraitEl = document.getElementById('ac-dialogue-portrait');
    const boxEl = modalEl?.querySelector('.ac-dialogue-box');

    if (!modalEl) return;

    modalEl.style.display = 'flex';

    if (portraitEl) {
      portraitEl.onerror = () => {
        portraitEl.onerror = null;
        portraitEl.src = 'assets/characters/char_wolf_hunter_m/portrait.jpg';
      };
      portraitEl.src = this.speakerMeta.portraitUrl || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
    }

    // Attach click-to-advance listener to dialogue box
    if (boxEl && !boxEl._hasAdvanceClick) {
      boxEl._hasAdvanceClick = true;
      boxEl.addEventListener('click', (e) => {
        if (e.target.closest('.ac-choice-btn')) return;
        this.advanceDialogue();
      });
    }

    if (this.onDialogueOpen) {
      this.onDialogueOpen(this.activeNpc, this.speakerMeta);
    }

    this.displayCurrentPage();
  }

  displayCurrentPage() {
    const modalEl = document.getElementById('ac-dialogue-modal');
    const nameEl = document.getElementById('ac-dialogue-name');
    const textEl = document.getElementById('ac-dialogue-text');
    const choicesEl = document.getElementById('ac-dialogue-choices');
    const indicatorEl = document.getElementById('ac-dialogue-indicator');

    if (!modalEl || !textEl) return;

    const pageText = this.dialoguePages[this.currentPageIndex] || '';
    const totalPages = this.dialoguePages.length;

    // Update name ribbon (Clean character name only, Animal Crossing Style)
    if (nameEl) {
      nameEl.innerText = this.speakerMeta.name || 'Morador';
    }

    if (indicatorEl) indicatorEl.style.display = 'none';
    if (choicesEl) choicesEl.innerHTML = '';

    this.activeDialogue = {
      speaker: this.speakerMeta,
      fullText: pageText,
      displayedText: '',
      isFinished: false
    };

    this.typewriterIndex = 0;
    clearInterval(this.typewriterTimer);

    this.typewriterTimer = setInterval(() => {
      if (this.typewriterIndex < this.activeDialogue.fullText.length) {
        const nextChar = this.activeDialogue.fullText[this.typewriterIndex];
        this.activeDialogue.displayedText += nextChar;
        textEl.innerText = this.activeDialogue.displayedText;
        
        // Cozy Animalese sound every 2 non-whitespace characters
        if (this.typewriterIndex % 2 === 0 && /\S/.test(nextChar)) {
          this.playACBlip(this.speakerMeta.pitch || 520);
        }
        this.typewriterIndex++;
      } else {
        this.finishCurrentPageTyping();
      }
    }, 42);
  }

  finishCurrentPageTyping() {
    clearInterval(this.typewriterTimer);
    const textEl = document.getElementById('ac-dialogue-text');
    const choicesEl = document.getElementById('ac-dialogue-choices');
    const indicatorEl = document.getElementById('ac-dialogue-indicator');

    if (this.activeDialogue) {
      this.activeDialogue.displayedText = this.activeDialogue.fullText;
      this.activeDialogue.isFinished = true;
      if (textEl) textEl.innerText = this.activeDialogue.fullText;
    }

    if (indicatorEl) indicatorEl.style.display = 'flex';

    const isLastPage = this.currentPageIndex >= this.dialoguePages.length - 1;

    if (!isLastPage) {
      // Intermediate page: show friendly continue button
      if (choicesEl) {
        choicesEl.innerHTML = '';
        const continueBtn = document.createElement('button');
        continueBtn.className = 'ac-choice-btn ac-continue-btn';
        continueBtn.innerHTML = `
          <span>Próximo</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        continueBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.advanceDialogue();
        });
        choicesEl.appendChild(continueBtn);
      }
    } else {
      // Final page: render actual interactive decision choices
      this.renderChoices(choicesEl, this.dialogueChoices, this.dialogueOnComplete);
    }
  }

  // Advance dialogue page or skip typewriter
  advanceDialogue() {
    const modalEl = document.getElementById('ac-dialogue-modal');
    if (!modalEl || modalEl.style.display === 'none' || !this.activeDialogue) return;

    // 1. If currently typing: fast-forward to full text of current page
    if (!this.activeDialogue.isFinished) {
      this.finishCurrentPageTyping();
      soundFX.playPop(1.2);
      return;
    }

    // 2. If finished typing and there are more pages: go to next page
    if (this.currentPageIndex < this.dialoguePages.length - 1) {
      this.currentPageIndex++;
      soundFX.playPop(1.0);
      this.displayCurrentPage();
      return;
    }

    // 3. If on last page with no interactive choices: close dialogue
    if (!this.dialogueChoices || this.dialogueChoices.length === 0) {
      this.closeNPCDialogue();
      if (this.dialogueOnComplete) this.dialogueOnComplete(null);
    }
  }

  // Update floating dialogue box position above the NPC on screen
  updateDialoguePosition(camera) {
    // In Animal Crossing, the main dialogue balloon is anchored at the bottom-center of the screen
    // Camera smoothly zooms in on the speaking NPC while balloon stays comfortably positioned at bottom.
  }

  renderChoices(container, choices, onComplete) {
    if (!container) return;
    container.innerHTML = '';
    if (!choices || choices.length === 0) {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'ac-choice-btn';
      continueBtn.innerText = 'Entendido!';
      continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
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
    this.dialoguePages = [];
    this.currentPageIndex = 0;
    if (this.onDialogueClose) {
      this.onDialogueClose();
    }
  }

  // Open complete NPC conversation with structured, paginated speech bubbles
  openNpcConversation(npcData, blocklySystem, callbacks = {}) {
    if (!npcData) return;
    this.activeNpc = {
      ...npcData,
      worldX: npcData.worldX ?? (npcData.tx ? npcData.tx * 64 : 0),
      worldY: npcData.worldY ?? (npcData.ty ? npcData.ty * 64 : 0)
    };

    const MASTER_SEQUENCE = [
      { id: 'npc_monkey_builder', name: 'Bambu, o Engenheiro' },
      { id: 'npc_bull_blacksmith', name: 'Brutus da Bigorna' },
      { id: 'npc_rabbit_farmer', name: 'Flora dos Brotos' },
      { id: 'npc_alligator_ferryman', name: 'Barnabé, o Barqueiro' },
      { id: 'npc_penguin_angler', name: 'Pingo dos Icebergs' },
      { id: 'npc_chameleon_magician', name: 'Cromos, o Tecelão de Cores' },
      { id: 'npc_shark_surfer', name: 'Kai, o Tubarão das Ondas' },
      { id: 'npc_owl_professor', name: 'Dr. Arquimedes' },
      { id: 'npc_turtle_elder', name: 'Mestre Casco' }
    ];

    const progress = blocklySystem?.getNpcProgress(npcData.id) || {
      completedCount: 0,
      totalCount: 1,
      isFinished: false,
      nextLesson: null
    };

    const resolvedPortrait = npcData.portrait || VILLAGE_NPCS.find(n => n.id === npcData.id)?.portrait || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
    const speakerMeta = {
      name: `${npcData.name} - ${npcData.role}`,
      portraitUrl: resolvedPortrait,
      pitch: 500
    };

    // Sequential Linear Progression Check:
    // If the player hasn't completed previous masters yet, guide them to the current pending master.
    const masterIdx = MASTER_SEQUENCE.findIndex(m => m.id === npcData.id);
    if (masterIdx > 0 && blocklySystem) {
      const currentUnfinishedIndex = MASTER_SEQUENCE.findIndex(m => {
        const prog = blocklySystem.getNpcProgress(m.id);
        return !prog || !prog.isFinished;
      });

      if (currentUnfinishedIndex !== -1 && masterIdx > currentUnfinishedIndex) {
        const requiredMaster = MASTER_SEQUENCE[currentUnfinishedIndex];
        
        let customLockedMessage = `Ainda não estamos prontos para trabalhar juntos! Primeiro você precisa completar todo o treinamento com ${requiredMaster.name}.`;

        if (npcData.id === 'npc_bull_blacksmith') {
          customLockedMessage = `Humpf! Antes de aprender os segredos da forja e criar ferramentas de ferro, você precisa dominar o básico com ${requiredMaster.name}! Complete as missões dele primeiro.`;
        } else if (npcData.id === 'npc_rabbit_farmer') {
          customLockedMessage = `Olá, jovem brotinho! A terra precisa de ferramentas adequadas antes de plantar. Conclua os ensinamentos com ${requiredMaster.name} antes de iniciarmos nossa horta mágica!`;
        } else if (npcData.id === 'npc_alligator_ferryman') {
          customLockedMessage = `Ora, ora... Para construirmos pontes resistentes e cercados seguros, precisamos da madeira nobre e essências de ${requiredMaster.name}! Procure-a na ilha e termine seus desafios.`;
        } else if (npcData.id === 'npc_penguin_angler') {
          customLockedMessage = `Brrr! As águas da ilha exigem pontes e caminhos seguros primeiro! Visite ${requiredMaster.name} e termine os projetos dele antes de começarmos a pescar!`;
        } else if (npcData.id === 'npc_chameleon_magician') {
          customLockedMessage = `Uma tela de arte precisa de infraestrutura e elementos aquáticos antes das cores! Conclua o treinamento com ${requiredMaster.name} antes de tecermos os pisos da ilha!`;
        } else if (npcData.id === 'npc_shark_surfer') {
          customLockedMessage = `E aí, fera! Antes de equipar a vila com grandes estruturas e rampas, aprenda a traçar todos os caminhos com ${requiredMaster.name}!`;
        } else if (npcData.id === 'npc_owl_professor') {
          customLockedMessage = `Pelas penas da sabedoria! O Grimório de Fogo e Magma requer uma base bem estruturada. Procure ${requiredMaster.name} e conclua as missões dele primeiro!`;
        } else if (npcData.id === 'npc_turtle_elder') {
          customLockedMessage = `Os dragões ancestrais só despertarão quando toda a ilha estiver em perfeita harmonia. Termine todos os ensinamentos com ${requiredMaster.name} antes de cuidarmos dos ninhos!`;
        }

        const lockedPages = [
          customLockedMessage,
          `[Mestre Atual Recomendado: ${requiredMaster.name}]\nEncontre ${requiredMaster.name} na Ilha Lua e conclua seus desafios de programação no Estúdio de Códigos para avançar na sua jornada!`
        ];

        const lockedChoices = [
          {
            label: `Entendido! Vou procurar ${requiredMaster.name.split(',')[0]}`,
            action: () => this.closeNPCDialogue()
          }
        ];

        this.startNPCDialogue(speakerMeta, lockedPages, lockedChoices, null, npcData);
        return;
      }
    }

    if (progress.isFinished) {
      // All missions for this NPC are completed
      const pages = [
        `Parabéns, grande arquiteto! Você completou todos os meus ${progress.totalCount} desafios de código na Ilha Lua!`,
        `Todas as minhas receitas de mobília, ferramentas e estruturas estão permanentemente liberadas na sua Bancada de Criação DIY!`,
        `Fique à vontade para explorar a ilha ou revisar seus desafios favoritos no Estúdio de Códigos a qualquer hora!`
      ];

      const choices = [];
      if (callbacks.onOpenCrafting) {
        choices.push({
          label: 'Abrir Bancada de Criação',
          action: () => callbacks.onOpenCrafting()
        });
      }
      if (callbacks.onOpenLesson && progress.nextLesson) {
        choices.push({
          label: 'Revisar no Estúdio',
          action: () => callbacks.onOpenLesson(progress.nextLesson.id)
        });
      }
      choices.push({
        label: 'Até logo!',
        action: () => this.closeNPCDialogue()
      });

      this.startNPCDialogue(speakerMeta, pages, choices, null, npcData);
    } else {
      // Active pending mission in the sequence
      const lesson = progress.nextLesson;
      if (!lesson) return;

      const pages = [
        npcData.greeting || 'Olá, nobre aventureiro! Que bom ver você por aqui!',
        `[Missão ${progress.completedCount + 1} de ${progress.totalCount}: ${lesson.title}]\n\n${lesson.description}`,
        `Recompensa ao Concluir: ${lesson.unlockedAssetName}\nBônus de Criação: +${lesson.rewardXP} XP e +${lesson.rewardGold} Moedas da Ilha!`
      ];

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
          label: 'Pedir Dica do Mentor',
          action: () => {
            const hintPages = [
              `Dica de ${lesson.concept}:`,
              `Arraste as peças na Mesa de Montagem para construir o script correto. Depois clique em "Executar & Fabricar"!`
            ];
            this.startNPCDialogue(speakerMeta, hintPages, [
              {
                label: `Iniciar: ${lesson.unlockedAssetName}`,
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

      this.startNPCDialogue(speakerMeta, pages, choices, null, npcData);
    }
  }
}

export default DialogueAndChatSystem;

