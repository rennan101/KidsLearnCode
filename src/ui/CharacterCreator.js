/**
 * CharacterCreator.js - KidsLearnCode
 * Controlador da interface de criação e customização de personagens em corpo inteiro.
 * 
 * Regra de Ouro: Padrão Animal Island UI, sem emojis na interface e com suporte
 * a renderização procedural por Cutout 2D em tempo real.
 */

import { ModularAvatarRenderer } from '../engine/animation/ModularAvatarRenderer.js';
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  CLOTH_PALETTES,
  DEFAULT_AVATAR_CONFIG,
  createDefaultAvatarConfig,
  randomizeAvatarConfig
} from '../engine/animation/AvatarConfig.js';
import {
  CREATOR_CATEGORIES,
  HAIR_STYLE_OPTIONS,
  EYE_SHAPE_OPTIONS,
  NOSE_OPTIONS,
  MOUTH_OPTIONS,
  CHEEKS_OPTIONS,
  TOP_OPTIONS,
  BOTTOM_OPTIONS,
  SHOES_OPTIONS,
  HAT_OPTIONS,
  GLASSES_OPTIONS
} from './CharacterCreatorAssets.js';

export class CharacterCreator {
  constructor(options = {}) {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.renderer = new ModularAvatarRenderer();
    this.currentConfig = { ...DEFAULT_AVATAR_CONFIG };
    this.currentCategory = 'skin';
    this.currentDirection = 'south';
    this.currentAnimation = 'idle';
    this.animTime = 0;
    this.lastFrameTime = performance.now();
    this.animationFrameId = null;
    this.isOpen = false;
    this.onSaveCallback = options.onSave || null;
    this.onCloseCallback = options.onClose || null;

    this.ensureStylesLoaded();
  }

  ensureStylesLoaded() {
    if (!document.getElementById('character-creator-styles')) {
      const link = document.createElement('link');
      link.id = 'character-creator-styles';
      link.rel = 'stylesheet';
      link.href = 'src/ui/CharacterCreator.css';
      document.head.appendChild(link);
    }
  }

  /**
   * Abre o criador de personagem com a configuração inicial.
   * @param {Object} initialConfig - Configuração prévia do avatar ou null
   */
  open(initialConfig = null) {
    if (initialConfig) {
      this.currentConfig = { ...DEFAULT_AVATAR_CONFIG, ...initialConfig };
    } else {
      this.currentConfig = createDefaultAvatarConfig();
    }

    this.isOpen = true;
    this.renderModal();
    this.startPreviewLoop();
  }

  close() {
    this.isOpen = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
    if (typeof this.onCloseCallback === 'function') {
      this.onCloseCallback();
    }
  }

  startPreviewLoop() {
    const loop = (timestamp) => {
      if (!this.isOpen) return;

      const dt = (timestamp - this.lastFrameTime) / 1000;
      this.lastFrameTime = timestamp;
      this.animTime += Math.min(dt, 0.1);

      this.renderPreviewFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(loop);
  }

  renderPreviewFrame() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Renderiza o personagem centralizado e ampliado no Canvas de Preview (64x64 escalado em 2.8x)
    const scale = 2.6;
    const targetX = (this.canvas.width / 2) - (32 * scale);
    const targetY = (this.canvas.height / 2) - (38 * scale);

    this.renderer.render(
      this.ctx,
      targetX,
      targetY,
      this.currentDirection,
      this.currentAnimation,
      this.animTime,
      this.currentConfig,
      scale
    );
  }

  renderModal() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const overlay = document.createElement('div');
    overlay.className = 'cc-modal-overlay';
    overlay.id = 'character-creator-modal';

    overlay.innerHTML = `
      <div class="cc-window">
        <!-- Header -->
        <div class="cc-header">
          <div class="cc-title-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cc-title-icon">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <div>
              <h2 class="cc-title">Criador de Personagem</h2>
              <p class="cc-subtitle">Personalize seu herói para explorar e programar na Ilha Lua</p>
            </div>
          </div>
          <button class="cc-close-btn" id="cc-btn-close" title="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="ui-icon icon-sm">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="cc-body">
          <!-- Left Stage -->
          <div class="cc-stage-panel">
            <div class="cc-preview-stage">
              <canvas id="cc-preview-canvas" width="220" height="240" class="cc-canvas"></canvas>
            </div>

            <div class="cc-stage-controls">
              <!-- Directions -->
              <div class="cc-direction-pills">
                <button class="cc-dir-btn ${this.currentDirection === 'south' ? 'active' : ''}" data-dir="south">Frente</button>
                <button class="cc-dir-btn ${this.currentDirection === 'east' ? 'active' : ''}" data-dir="east">Direita</button>
                <button class="cc-dir-btn ${this.currentDirection === 'north' ? 'active' : ''}" data-dir="north">Costas</button>
                <button class="cc-dir-btn ${this.currentDirection === 'west' ? 'active' : ''}" data-dir="west">Esquerda</button>
              </div>

              <!-- Animations -->
              <div class="cc-anim-pills">
                <button class="cc-anim-btn ${this.currentAnimation === 'idle' ? 'active' : ''}" data-anim="idle">Parado</button>
                <button class="cc-anim-btn ${this.currentAnimation === 'walk' ? 'active' : ''}" data-anim="walk">Andando</button>
                <button class="cc-anim-btn ${this.currentAnimation === 'run' ? 'active' : ''}" data-anim="run">Correndo</button>
                <button class="cc-anim-btn ${this.currentAnimation === 'celebrate' ? 'active' : ''}" data-anim="celebrate">Comemorar</button>
              </div>

              <!-- Randomize Button -->
              <button class="cc-random-btn" id="cc-btn-random">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ui-icon icon-sm">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 8h.01M8 8h.01M8 16h.01M16 16h.01M12 12h.01"/>
                </svg>
                Aleatório
              </button>
            </div>
          </div>

          <!-- Right Customization Options -->
          <div class="cc-options-panel">
            <!-- Tabs -->
            <div class="cc-category-nav" id="cc-category-nav">
              ${CREATOR_CATEGORIES.map(cat => `
                <button class="cc-tab-btn ${this.currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                  ${cat.iconSvg}
                  ${cat.label}
                </button>
              `).join('')}
            </div>

            <!-- Content -->
            <div class="cc-tab-content" id="cc-tab-content">
              <!-- Renderizado dinamicamente -->
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="cc-footer">
          <div class="cc-name-input-group">
            <span class="cc-name-label">Nome do Herói:</span>
            <input type="text" id="cc-name-input" class="cc-name-input" value="${this.currentConfig.name || 'Aventureiro'}" maxlength="20" placeholder="Seu nome...">
          </div>
          <button class="cc-save-btn" id="cc-btn-save">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ui-icon">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Pronto para a Aventura!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.container = overlay;

    this.canvas = overlay.querySelector('#cc-preview-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents(overlay);
    this.renderCategoryContent();
  }

  bindEvents(overlay) {
    // Fechar
    overlay.querySelector('#cc-btn-close')?.addEventListener('click', () => this.close());

    // Direções
    overlay.querySelectorAll('.cc-dir-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.cc-dir-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDirection = btn.dataset.dir;
      });
    });

    // Animações
    overlay.querySelectorAll('.cc-anim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.cc-anim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentAnimation = btn.dataset.anim;
        this.animTime = 0;
      });
    });

    // Botão Aleatório
    overlay.querySelector('#cc-btn-random')?.addEventListener('click', () => {
      const nameInput = overlay.querySelector('#cc-name-input');
      const currentName = nameInput ? nameInput.value : this.currentConfig.name;
      this.currentConfig = randomizeAvatarConfig(currentName);
      this.renderCategoryContent();
    });

    // Troca de Abas
    overlay.querySelectorAll('.cc-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.cc-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.cat;
        this.renderCategoryContent();
      });
    });

    // Input de Nome
    const nameInput = overlay.querySelector('#cc-name-input');
    nameInput?.addEventListener('input', (e) => {
      this.currentConfig.name = e.target.value.trim() || 'Aventureiro';
    });

    // Botão Salvar
    overlay.querySelector('#cc-btn-save')?.addEventListener('click', () => {
      const finalName = nameInput ? nameInput.value.trim() : this.currentConfig.name;
      this.currentConfig.name = finalName || 'Aventureiro';

      if (typeof this.onSaveCallback === 'function') {
        this.onSaveCallback({ ...this.currentConfig });
      }
      this.close();
    });
  }

  renderCategoryContent() {
    const container = this.container?.querySelector('#cc-tab-content');
    if (!container) return;

    container.innerHTML = '';

    switch (this.currentCategory) {
      case 'skin':
        this.renderSkinTab(container);
        break;
      case 'hair':
        this.renderHairTab(container);
        break;
      case 'face':
        this.renderFaceTab(container);
        break;
      case 'top':
        this.renderTopTab(container);
        break;
      case 'bottom':
        this.renderBottomTab(container);
        break;
      case 'shoes':
        this.renderShoesTab(container);
        break;
      case 'accessories':
        this.renderAccessoriesTab(container);
        break;
    }
  }

  renderSkinTab(container) {
    const section = document.createElement('div');
    section.innerHTML = `
      <div class="cc-section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ui-icon icon-sm"><circle cx="12" cy="12" r="10"/></svg>
        Tom de Pele Acolhedor
      </div>
      <div class="cc-swatches-grid">
        ${SKIN_TONES.map(s => `
          <button class="cc-swatch ${this.currentConfig.skinTone === s.color ? 'active' : ''}" 
                  style="background: ${s.color};" 
                  data-skin="${s.color}" 
                  data-shadow="${s.shadow}" 
                  title="${s.name}"></button>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        section.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.skinTone = sw.dataset.skin;
        this.currentConfig.skinShadow = sw.dataset.shadow;
      });
    });

    container.appendChild(section);
  }

  renderHairTab(container) {
    const sectionColors = document.createElement('div');
    sectionColors.innerHTML = `
      <div class="cc-section-title">Cor do Cabelo</div>
      <div class="cc-swatches-grid">
        ${HAIR_COLORS.map(h => `
          <button class="cc-swatch ${this.currentConfig.hairColor === h.color ? 'active' : ''}" 
                  style="background: ${h.color};" 
                  data-color="${h.color}" 
                  data-shadow="${h.shadow}" 
                  title="${h.name}"></button>
        `).join('')}
      </div>
    `;

    sectionColors.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        sectionColors.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.hairColor = sw.dataset.color;
        this.currentConfig.hairShadow = sw.dataset.shadow;
      });
    });

    const sectionStyles = document.createElement('div');
    sectionStyles.innerHTML = `
      <div class="cc-section-title" style="margin-top: 16px;">Estilo de Penteado</div>
      <div class="cc-items-grid">
        ${HAIR_STYLE_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.hairStyle === opt.id ? 'active' : ''}" data-style="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    sectionStyles.querySelectorAll('.cc-item-card').forEach(card => {
      card.addEventListener('click', () => {
        sectionStyles.querySelectorAll('.cc-item-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.hairStyle = card.dataset.style;
      });
    });

    container.appendChild(sectionColors);
    container.appendChild(sectionStyles);
  }

  renderFaceTab(container) {
    // 1. Olhos
    const sectionEyes = document.createElement('div');
    sectionEyes.innerHTML = `
      <div class="cc-section-title">Cor dos Olhos (Íris)</div>
      <div class="cc-swatches-grid">
        ${EYE_COLORS.map(e => `
          <button class="cc-swatch ${this.currentConfig.eyeColor === e.color ? 'active' : ''}" 
                  style="background: ${e.color};" 
                  data-color="${e.color}" 
                  title="${e.name}"></button>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Formato dos Olhos</div>
      <div class="cc-items-grid">
        ${EYE_SHAPE_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.eyeShape === opt.id ? 'active' : ''}" data-eye="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    sectionEyes.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        sectionEyes.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.eyeColor = sw.dataset.color;
      });
    });

    sectionEyes.querySelectorAll('.cc-item-card').forEach(card => {
      card.addEventListener('click', () => {
        sectionEyes.querySelectorAll('.cc-item-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.eyeShape = card.dataset.eye;
      });
    });

    // 2. Nariz & Boca
    const sectionMouth = document.createElement('div');
    sectionMouth.innerHTML = `
      <div class="cc-section-title" style="margin-top: 16px;">Boca & Expressão</div>
      <div class="cc-items-grid">
        ${MOUTH_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.mouthShape === opt.id ? 'active' : ''}" data-mouth="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Bochechas & Detalhes</div>
      <div class="cc-items-grid">
        ${CHEEKS_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.cheeksShape === opt.id ? 'active' : ''}" data-cheeks="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    sectionMouth.querySelectorAll('[data-mouth]').forEach(card => {
      card.addEventListener('click', () => {
        sectionMouth.querySelectorAll('[data-mouth]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.mouthShape = card.dataset.mouth;
      });
    });

    sectionMouth.querySelectorAll('[data-cheeks]').forEach(card => {
      card.addEventListener('click', () => {
        sectionMouth.querySelectorAll('[data-cheeks]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.cheeksShape = card.dataset.cheeks;
      });
    });

    container.appendChild(sectionEyes);
    container.appendChild(sectionMouth);
  }

  renderTopTab(container) {
    const section = document.createElement('div');
    section.innerHTML = `
      <div class="cc-section-title">Paleta de Cores do Tronco</div>
      <div class="cc-swatches-grid">
        ${CLOTH_PALETTES.map(p => `
          <button class="cc-swatch ${this.currentConfig.topColorPrimary === p.primary ? 'active' : ''}" 
                  style="background: ${p.primary};" 
                  data-primary="${p.primary}" 
                  data-secondary="${p.secondary}" 
                  title="${p.name}"></button>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Estilo da Camisa / Roupa Superior</div>
      <div class="cc-items-grid">
        ${TOP_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.topStyle === opt.id ? 'active' : ''}" data-top="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        section.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.topColorPrimary = sw.dataset.primary;
        this.currentConfig.topColorSecondary = sw.dataset.secondary;
      });
    });

    section.querySelectorAll('.cc-item-card').forEach(card => {
      card.addEventListener('click', () => {
        section.querySelectorAll('.cc-item-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.topStyle = card.dataset.top;
      });
    });

    container.appendChild(section);
  }

  renderBottomTab(container) {
    const section = document.createElement('div');
    section.innerHTML = `
      <div class="cc-section-title">Cor da Calça / Shorts</div>
      <div class="cc-swatches-grid">
        ${CLOTH_PALETTES.map(p => `
          <button class="cc-swatch ${this.currentConfig.bottomColor === p.primary ? 'active' : ''}" 
                  style="background: ${p.primary};" 
                  data-color="${p.primary}" 
                  title="${p.name}"></button>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Modelo Inferior</div>
      <div class="cc-items-grid">
        ${BOTTOM_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.bottomStyle === opt.id ? 'active' : ''}" data-bottom="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        section.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.bottomColor = sw.dataset.color;
      });
    });

    section.querySelectorAll('.cc-item-card').forEach(card => {
      card.addEventListener('click', () => {
        section.querySelectorAll('.cc-item-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.bottomStyle = card.dataset.bottom;
      });
    });

    container.appendChild(section);
  }

  renderShoesTab(container) {
    const section = document.createElement('div');
    section.innerHTML = `
      <div class="cc-section-title">Cor dos Calçados</div>
      <div class="cc-swatches-grid">
        ${CLOTH_PALETTES.map(p => `
          <button class="cc-swatch ${this.currentConfig.shoesColor === p.primary ? 'active' : ''}" 
                  style="background: ${p.primary};" 
                  data-color="${p.primary}" 
                  title="${p.name}"></button>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Tipo de Calçado</div>
      <div class="cc-items-grid">
        ${SHOES_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.shoesStyle === opt.id ? 'active' : ''}" data-shoes="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('.cc-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        section.querySelectorAll('.cc-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        this.currentConfig.shoesColor = sw.dataset.color;
      });
    });

    section.querySelectorAll('.cc-item-card').forEach(card => {
      card.addEventListener('click', () => {
        section.querySelectorAll('.cc-item-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.shoesStyle = card.dataset.shoes;
      });
    });

    container.appendChild(section);
  }

  renderAccessoriesTab(container) {
    const section = document.createElement('div');
    section.innerHTML = `
      <div class="cc-section-title">Chapéus & Tiaras</div>
      <div class="cc-items-grid">
        ${HAT_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.hatStyle === opt.id ? 'active' : ''}" data-hat="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>

      <div class="cc-section-title" style="margin-top: 16px;">Óculos & Acessórios Faciais</div>
      <div class="cc-items-grid">
        ${GLASSES_OPTIONS.map(opt => `
          <div class="cc-item-card ${this.currentConfig.glassesStyle === opt.id ? 'active' : ''}" data-glasses="${opt.id}">
            <div class="cc-item-name">${opt.name}</div>
            <div class="cc-item-desc">${opt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('[data-hat]').forEach(card => {
      card.addEventListener('click', () => {
        section.querySelectorAll('[data-hat]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.hatStyle = card.dataset.hat;
      });
    });

    section.querySelectorAll('[data-glasses]').forEach(card => {
      card.addEventListener('click', () => {
        section.querySelectorAll('[data-glasses]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentConfig.glassesStyle = card.dataset.glasses;
      });
    });

    container.appendChild(section);
  }
}
