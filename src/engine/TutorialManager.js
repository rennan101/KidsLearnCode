/**
 * TutorialManager.js - KidsLearnCode
 * 
 * Interactive, playable step-by-step onboarding tutorial designed specifically for young children.
 * Guides children through basic movement (WASD), NPC interaction, first code challenge,
 * backpack usage and object placement with animated visual pointers, keys, and mentor feedback.
 */

export class TutorialManager {
  constructor(game) {
    this.game = game;
    this.currentStep = 0; // 0 = not started, 1 = movement, 2 = mentor, 3 = coding, 4 = backpack, 5 = finished
    this.movementKeysPressed = { w: false, a: false, s: false, d: false };
    this.isCompleted = false;
    this.tutorialOverlay = null;
    this.guideArrow = null;
    this.codingCoachStep = 0; // 0 = not active, 1 = highlight block, 2 = highlight workspace, 3 = highlight lua, 4 = highlight craft btn

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
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#7a583e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    const keysVisual = document.getElementById('tutorial-movement-keys');

    if (card) card.style.display = 'flex';
    if (text) text.innerText = 'Use as teclas [W] [A] [S] [D] ou as Setas do teclado para caminhar pela Ilha!';
    if (counter) counter.innerText = 'Passo 1 de 4';
    if (keysVisual) keysVisual.style.display = 'flex';

    // Hide other steps
    document.getElementById('tutorial-guide-arrow')?.setAttribute('style', 'display: none;');
    document.getElementById('tutorial-coding-coach')?.setAttribute('style', 'display: none;');
  }

  checkMovementStepCompletion() {
    const { w, a, s, d } = this.movementKeysPressed;
    // When kid moved in at least 2 directions
    const count = (w ? 1 : 0) + (a ? 1 : 0) + (s ? 1 : 0) + (d ? 1 : 0);
    if (count >= 2) {
      setTimeout(() => {
        if (this.currentStep === 1) {
          this.advanceToStep2Mentor();
        }
      }, 700);
    }
  }

  advanceToStep2Mentor() {
    this.currentStep = 2;

    const text = document.getElementById('tutorial-text');
    const counter = document.getElementById('tutorial-step-counter');
    const keysVisual = document.getElementById('tutorial-movement-keys');
    const arrow = document.getElementById('tutorial-guide-arrow');

    if (text) text.innerText = 'Excelente! Agora aproxime-se do Bambu, o Engenheiro e pressione [E] para conversar!';
    if (counter) counter.innerText = 'Passo 2 de 4';
    if (keysVisual) keysVisual.style.display = 'none';
    if (arrow) arrow.style.display = 'flex';

    if (this.game && this.game.showToast) {
      this.game.showToast('Muito bem! Você aprendeu a andar pela ilha!', 3000);
    }
  }

  onNPCDialogueOpened(npcId) {
    if (this.currentStep === 2) {
      // Hide guide arrow
      document.getElementById('tutorial-guide-arrow')?.setAttribute('style', 'display: none;');
      const text = document.getElementById('tutorial-text');
      const counter = document.getElementById('tutorial-step-counter');
      if (text) text.innerText = 'Bambu tem uma missão mágica para você! Aceite o desafio de blocos!';
      if (counter) counter.innerText = 'Passo 3 de 4';
    }
  }

  onCodingModalOpened() {
    if (this.currentStep === 2 || this.currentStep === 3) {
      this.currentStep = 3;
      this.startCodingChallengeCoach();
    }
  }

  startCodingChallengeCoach() {
    this.codingCoachStep = 1;
    const coach = document.getElementById('tutorial-coding-coach');
    const card = document.getElementById('tutorial-card');
    if (card) card.style.display = 'none'; // Give full space to code challenge
    if (coach) coach.style.display = 'block';

    this.updateCodingCoachUI();
  }

  updateCodingCoachUI() {
    const pointer = document.getElementById('tutorial-coach-pointer');
    const message = document.getElementById('coach-message');
    if (!pointer || !message) return;

    if (this.codingCoachStep === 1) {
      // Step 1: Highlight Palette Block
      const firstBlock = document.querySelector('.codekit-palette-items .codekit-block');
      if (firstBlock) {
        const rect = firstBlock.getBoundingClientRect();
        pointer.style.top = `${rect.top + rect.height / 2}px`;
        pointer.style.left = `${rect.right + 20}px`;
        message.innerText = 'Esta é a sua peça mágica! Clique nela ou arraste para a mesa de montagem!';
        firstBlock.classList.add('tut-highlight');
      } else {
        pointer.style.top = '220px';
        pointer.style.left = '280px';
        message.innerText = 'Clique na peça de bloco na coluna da esquerda!';
      }
    } else if (this.codingCoachStep === 2) {
      // Step 2: Highlight Workspace & Lua Code
      document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
      const codeView = document.querySelector('.codekit-code-view');
      if (codeView) {
        const rect = codeView.getBoundingClientRect();
        pointer.style.top = `${rect.top + 60}px`;
        pointer.style.left = `${rect.left - 260}px`;
        message.innerText = 'Incrível! O jogo traduziu sua peça para a linguagem Lua automaticamente!';
        codeView.classList.add('tut-highlight');
      }
      // After 2.5s advance to highlight craft button
      setTimeout(() => {
        if (this.codingCoachStep === 2) {
          this.codingCoachStep = 3;
          this.updateCodingCoachUI();
        }
      }, 2500);
    } else if (this.codingCoachStep === 3) {
      // Step 3: Highlight Craft Button
      document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
      const craftBtn = document.getElementById('btn-run-lua');
      if (craftBtn) {
        const rect = craftBtn.getBoundingClientRect();
        pointer.style.top = `${rect.top - 80}px`;
        pointer.style.left = `${rect.left + rect.width / 2 - 100}px`;
        message.innerText = 'Agora clique em "Montar & Fabricar Item" para dar vida à sua criação!';
        craftBtn.classList.add('tut-highlight');
      }
    }
  }

  onBlockAddedToWorkspace() {
    if (this.codingCoachStep === 1) {
      this.codingCoachStep = 2;
      this.updateCodingCoachUI();
    }
  }

  onCodingChallengeCompleted() {
    this.codingCoachStep = 0;
    document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
    document.getElementById('tutorial-coding-coach')?.setAttribute('style', 'display: none;');

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
      // Point arrow toward Bambu NPC (usually near spawn point or around 600, 600)
      const arrow = document.getElementById('tutorial-guide-arrow');
      if (arrow) {
        const npcTargetX = 640;
        const npcTargetY = 640;
        const screenX = window.innerWidth / 2;
        const screenY = window.innerHeight - 110;
        
        arrow.style.left = `${screenX - 70}px`;
        arrow.style.top = `${screenY}px`;
      }
    }
  }
}
