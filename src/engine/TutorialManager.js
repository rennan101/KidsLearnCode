/**
 * TutorialManager.js - KidsLearnCode
 * 
 * Interactive, playable step-by-step onboarding tutorial designed specifically for young children.
 * Guides children through basic movement (WASD), NPC interaction, first code challenge with
 * full mentor dialogue tour, backpack usage and object placement with animated visual pointers.
 */

import { soundFX } from './SoundFX.js';

export class TutorialManager {
  constructor(game) {
    this.game = game;
    this.currentStep = 0; // 0 = not started, 1 = movement, 2 = mentor, 3 = coding, 4 = backpack, 5 = finished
    this.movementKeysPressed = { w: false, a: false, s: false, d: false };
    this.isCompleted = false;
    this.tutorialOverlay = null;
    this.guideArrow = null;
    this.codingCoachStep = 0;
    this.codingStudioTourStep = 0; // 0 = none, 1 = palette, 2 = workspace, 3 = code, 4 = craft

    this.init();
  }

  init() {
    // Load completion state from local storage
    const saved = localStorage.getItem('kidslearncode_tutorial_completed');
    if (saved === 'true') {
      this.isCompleted = true;
      this.currentStep = 5;
    }

    this.createTutorialDOM();
    this.setupListeners();
    this.setupCodingStudioTourEvents();
  }

  createTutorialDOM() {
    // Main Tutorial Container
    const container = document.createElement('div');
    container.id = 'tutorial-hud-container';
    container.className = 'tutorial-hud-container';
    container.style.display = 'none';

    container.innerHTML = `
      <!-- Tutorial Banner Card (Top Center) -->
      <div id="tutorial-card" class="tutorial-card">
        <div class="tutorial-mentor-avatar">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="tutorial-content">
          <div class="tutorial-title-row">
            <span class="tutorial-badge">Aprenda a Jogar</span>
            <span id="tutorial-step-counter" class="tutorial-step-counter">Passo 1 de 4</span>
          </div>
          <p id="tutorial-text" class="tutorial-text">Use as teclas [W] [A] [S] [D] ou as Setas do teclado para caminhar pela Ilha!</p>
        </div>
      </div>

      <!-- Step 1: Animated Movement Keys Visualizer -->
      <div id="tutorial-movement-keys" class="tutorial-movement-keys" style="display: none;">
        <div class="tutorial-key-row">
          <div class="tut-key" id="tut-key-w">W</div>
        </div>
        <div class="tutorial-key-row">
          <div class="tut-key" id="tut-key-a">A</div>
          <div class="tut-key" id="tut-key-s">S</div>
          <div class="tut-key" id="tut-key-d">D</div>
        </div>
        <span class="tut-keys-hint">Pressione as teclas para dar seus primeiros passos!</span>
      </div>

      <!-- Directional Guide Arrow pointing to NPC -->
      <div id="tutorial-guide-arrow" class="tutorial-guide-arrow" style="display: none;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
        <span id="tutorial-arrow-label">Siga até Bambu</span>
      </div>

      <!-- Interactive Coding Challenge Coach Overlay -->
      <div id="tutorial-coding-coach" class="tutorial-coding-coach" style="display: none;">
        <div id="tutorial-coach-pointer" class="tutorial-coach-pointer">
          <div class="coach-hand">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#7a583e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
            </svg>
          </div>
          <div id="coach-speech-bubble" class="coach-speech-bubble">
            <span id="coach-message">Esta é a sua peça de bloco mágica! Clique nela para adicionar à Mesa de Montagem!</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.tutorialOverlay = container;
  }

  setupListeners() {
    // Movement key listeners for Step 1
    window.addEventListener('keydown', (e) => {
      if (this.currentStep === 1) {
        const key = e.key.toLowerCase();
        let changed = false;

        if (key === 'w' || key === 'arrowup') {
          this.movementKeysPressed.w = true;
          document.getElementById('tut-key-w')?.classList.add('pressed');
          changed = true;
        } else if (key === 'a' || key === 'arrowleft') {
          this.movementKeysPressed.a = true;
          document.getElementById('tut-key-a')?.classList.add('pressed');
          changed = true;
        } else if (key === 's' || key === 'arrowdown') {
          this.movementKeysPressed.s = true;
          document.getElementById('tut-key-s')?.classList.add('pressed');
          changed = true;
        } else if (key === 'd' || key === 'arrowright') {
          this.movementKeysPressed.d = true;
          document.getElementById('tut-key-d')?.classList.add('pressed');
          changed = true;
        }

        if (changed) {
          this.checkMovementStepCompletion();
        }
      }
    });
  }

  setupCodingStudioTourEvents() {
    const btnNext = document.getElementById('btn-tutorial-next');
    const btnSkip = document.getElementById('btn-tutorial-skip');

    btnNext?.addEventListener('click', () => {
      soundFX.playPop(1.1);
      this.advanceCodingStudioTour();
    });

    btnSkip?.addEventListener('click', () => {
      soundFX.playPop(0.8);
      this.closeCodingStudioTour();
    });
  }

  startTutorial() {
    if (this.isCompleted) return;
    this.currentStep = 1;
    this.showStep1Movement();
  }

  showStep1Movement() {
    if (!this.tutorialOverlay) return;
    this.tutorialOverlay.style.display = 'block';

    const card = document.getElementById('tutorial-card');
    const text = document.getElementById('tutorial-text');
    const counter = document.getElementById('tutorial-step-counter');
    const keysVisualizer = document.getElementById('tutorial-movement-keys');

    if (card) card.style.display = 'flex';
    if (counter) counter.innerText = 'Passo 1 de 4';
    if (text) text.innerText = 'Use as teclas [W] [A] [S] [D] ou as Setas do teclado para caminhar pela Ilha!';
    if (keysVisualizer) keysVisualizer.style.display = 'flex';
  }

  checkMovementStepCompletion() {
    const { w, a, s, d } = this.movementKeysPressed;
    if (w && a && s && d) {
      soundFX.playSuccess();
      const keysVisualizer = document.getElementById('tutorial-movement-keys');
      if (keysVisualizer) {
        keysVisualizer.style.opacity = '0';
        setTimeout(() => (keysVisualizer.style.display = 'none'), 400);
      }

      setTimeout(() => {
        this.advanceToStep2NPC();
      }, 600);
    }
  }

  advanceToStep2NPC() {
    this.currentStep = 2;
    const text = document.getElementById('tutorial-text');
    const counter = document.getElementById('tutorial-step-counter');
    const arrow = document.getElementById('tutorial-guide-arrow');

    if (counter) counter.innerText = 'Passo 2 de 4';
    if (text) text.innerText = 'Excelente! Encontre Bambu, o Engenheiro na Ilha e pressione [E] para falar com ele!';
    if (arrow) arrow.style.display = 'flex';
  }

  onNPCDialogueOpened(npcId) {
    if (this.currentStep === 2) {
      const arrow = document.getElementById('tutorial-guide-arrow');
      if (arrow) arrow.style.display = 'none';

      const text = document.getElementById('tutorial-text');
      if (text) text.innerText = 'Ouça as orientações do mentor e aceite a primeira missão para abrir o Estúdio!';
    }
  }

  onCodingModalOpened() {
    // When code studio opens, start the guided mentor tour
    const tourAlreadyDone = localStorage.getItem('kidslearncode_coding_tour_done') === 'true';
    if (!tourAlreadyDone || this.currentStep === 2 || this.currentStep === 3) {
      this.currentStep = 3;
      this.startCodingStudioTour();
    }
  }

  startCodingStudioTour() {
    this.codingStudioTourStep = 1;
    const overlay = document.getElementById('coding-tutorial-overlay');
    if (overlay) overlay.style.display = 'block';
    this.renderCodingStudioTourStep();
  }

  advanceCodingStudioTour() {
    this.codingStudioTourStep++;
    if (this.codingStudioTourStep > 4) {
      this.closeCodingStudioTour();
    } else {
      this.renderCodingStudioTourStep();
    }
  }

  renderCodingStudioTourStep() {
    const tag = document.getElementById('coding-tutorial-step-tag');
    const msg = document.getElementById('coding-tutorial-text');
    const btnNext = document.getElementById('btn-tutorial-next');

    // Clear previous spotlights
    document.querySelectorAll('.tutorial-spotlight-panel').forEach(el => el.classList.remove('tutorial-spotlight-panel'));

    const paletteCol = document.querySelector('.codekit-palette-col');
    const workspaceCol = document.querySelector('.codekit-workspace-col');
    const codeCol = document.querySelector('.codekit-code-col');
    const craftBtn = document.getElementById('btn-run-lua');

    if (this.codingStudioTourStep === 1) {
      if (tag) tag.innerText = 'Passo 1 de 4: Paleta de Peças';
      if (msg) msg.innerText = 'À esquerda fica a Paleta de Peças: aqui você encontra as peças mágicas de variáveis, ações e feitiços!';
      if (btnNext) btnNext.innerText = 'Próximo';
      if (paletteCol) paletteCol.classList.add('tutorial-spotlight-panel');
    } else if (this.codingStudioTourStep === 2) {
      if (tag) tag.innerText = 'Passo 2 de 4: Mesa de Montagem';
      if (msg) msg.innerText = 'No centro fica a Mesa de Montagem: arraste ou clique nas peças da paleta para conectá-las como um quebra-cabeça!';
      if (btnNext) btnNext.innerText = 'Próximo';
      if (workspaceCol) workspaceCol.classList.add('tutorial-spotlight-panel');
    } else if (this.codingStudioTourStep === 3) {
      if (tag) tag.innerText = 'Passo 3 de 4: Código Lua em Tempo Real';
      if (msg) msg.innerText = 'À direita fica o Código Lua: cada bloco que você conecta é traduzido na mesma hora para código de programação real!';
      if (btnNext) btnNext.innerText = 'Próximo';
      if (codeCol) codeCol.classList.add('tutorial-spotlight-panel');
    } else if (this.codingStudioTourStep === 4) {
      if (tag) tag.innerText = 'Passo 4 de 4: Montar e Fabricar';
      if (msg) msg.innerText = 'Quando as peças estiverem encaixadas, clique em "Montar & Fabricar Item" para dar vida à sua criação na Ilha!';
      if (btnNext) btnNext.innerText = 'Vamos Começar!';
      if (craftBtn) craftBtn.classList.add('tutorial-spotlight-panel');
    }
  }

  closeCodingStudioTour() {
    this.codingStudioTourStep = 0;
    localStorage.setItem('kidslearncode_coding_tour_done', 'true');
    document.querySelectorAll('.tutorial-spotlight-panel').forEach(el => el.classList.remove('tutorial-spotlight-panel'));
    const overlay = document.getElementById('coding-tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  onBlockAddedToWorkspace() {
    soundFX.playSnap();
  }

  onCodingChallengeCompleted() {
    this.closeCodingStudioTour();
    document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));

    // Advance to Step 4: Backpack
    this.currentStep = 4;
    const card = document.getElementById('tutorial-card');
    const text = document.getElementById('tutorial-text');
    const counter = document.getElementById('tutorial-step-counter');

    if (card) card.style.display = 'flex';
    if (text) text.innerText = 'Você fabricou a Cadeira! Pressione [B] para abrir sua Bolsa e ver seu novo item!';
    if (counter) counter.innerText = 'Passo 4 de 4';
  }

  onBackpackOpened() {
    if (this.currentStep === 4) {
      const text = document.getElementById('tutorial-text');
      if (text) text.innerText = 'Selecione o item no bolso e clique em "Colocar no Chão" para decorar a Ilha!';
    }
  }

  onItemPlacedOnGround() {
    if (this.currentStep === 4) {
      this.finishTutorial();
    }
  }

  finishTutorial() {
    this.currentStep = 5;
    this.isCompleted = true;
    localStorage.setItem('kidslearncode_tutorial_completed', 'true');

    const card = document.getElementById('tutorial-card');
    const text = document.getElementById('tutorial-text');
    const counter = document.getElementById('tutorial-step-counter');

    if (counter) counter.innerText = 'Tutorial Concluído!';
    if (text) text.innerText = 'Parabéns, Jovem Engenheiro! Explore a Ilha Lua, converse com outros mentores e crie o que quiser!';

    soundFX.playSuccess();
    if (this.game && this.game.showToast) {
      this.game.showToast('Tutorial Concluído! A Ilha Lua agora é sua!', 4000);
    }

    setTimeout(() => {
      if (this.tutorialOverlay) {
        this.tutorialOverlay.style.opacity = '0';
        this.tutorialOverlay.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
          this.tutorialOverlay.style.display = 'none';
        }, 600);
      }
    }, 4500);
  }

  update(camera, player) {
    if (this.currentStep === 2 && player) {
      const arrow = document.getElementById('tutorial-guide-arrow');
      if (arrow) {
        const screenX = window.innerWidth / 2;
        const screenY = window.innerHeight - 110;
        arrow.style.left = `${screenX - 70}px`;
        arrow.style.top = `${screenY}px`;
      }
    }
  }
}
