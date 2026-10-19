/**
 * FirstTimeOnboarding.js - KidsLearnCode
 * Controla a primeira etapa de boas-vindas ao criar uma conta / entrar pela primeira vez:
 * 1. Tela dedicada para escolher o nome do personagem (Animal Island UI, 100% SVG, zero emojis)
 * 2. Encaminhamento imediato para a personalização de personagem (CharacterCreator)
 */

import { soundFX } from '../engine/SoundFX.js';

export class FirstTimeOnboarding {
  constructor(options = {}) {
    this.container = null;
    this.isOpen = false;
    this.onNameConfirmed = options.onNameConfirmed || null;
  }

  open(initialName = '') {
    if (this.isOpen) return;
    this.isOpen = true;

    const cleanInitial = (initialName && initialName.trim() !== 'Aventureiro')
      ? initialName.trim()
      : '';

    this.render(cleanInitial);
  }

  close() {
    this.isOpen = false;
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }

  render(initialName = '') {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const overlay = document.createElement('div');
    overlay.id = 'first-time-name-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(30, 20, 10, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10050;
      padding: 20px;
      box-sizing: border-box;
      font-family: var(--animal-font, 'Nunito', 'Outfit', sans-serif);
      animation: ccFadeIn 0.25s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        max-width: 460px;
        width: 100%;
        background: var(--animal-bg-card, #fdfbf7);
        border: 3px solid var(--animal-border-wood, #7a583e);
        border-radius: 24px;
        padding: 32px 28px 28px;
        box-shadow: 0 8px 0 0 #5c3c26, 0 20px 40px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 18px;
        position: relative;
        box-sizing: border-box;
      ">
        <!-- Badge Superior -->
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--animal-primary-bg, #e6f9f6);
          border: 2px solid var(--animal-border-mint, #3dd4c6);
          color: var(--animal-primary-dark, #0f8e83);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        ">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
          </svg>
          <span>Passaporte da Ilha Lua</span>
        </div>

        <!-- Ilustração de Identidade em SVG -->
        <div style="
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--animal-bg-content, #f7f3df);
          border: 2.5px solid var(--animal-border, #c4b89e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--animal-text, #794f27);
          box-shadow: inset 0 2px 4px rgba(121, 79, 39, 0.08);
        ">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <!-- Título e Subtítulo -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <h2 style="
            margin: 0;
            font-family: var(--animal-font-title, 'Cinzel', 'Nunito', serif);
            font-size: 1.45rem;
            font-weight: 900;
            color: var(--animal-text, #794f27);
          ">Qual será o seu nome?</h2>
          <p style="
            margin: 0;
            font-size: 0.92rem;
            font-weight: 700;
            color: var(--animal-text-body, #725d42);
            line-height: 1.45;
          ">
            Escolha como os moradores e outros aventureiros vão chamar seu personagem na Ilha Lua!
          </p>
        </div>

        <!-- Campo de Nome -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
          <input
            type="text"
            id="onboarding-character-name-input"
            maxlength="20"
            placeholder="Digite o nome do seu personagem..."
            value="${initialName.replace(/"/g, '&quot;')}"
            autocomplete="off"
            style="
              width: 100%;
              box-sizing: border-box;
              background: #ffffff;
              color: var(--animal-text, #794f27);
              border: 2.5px solid var(--animal-border, #c4b89e);
              border-radius: 50px;
              padding: 13px 20px;
              font-family: var(--animal-font, 'Nunito', sans-serif);
              font-size: 1.05rem;
              font-weight: 800;
              text-align: center;
              outline: none;
              transition: border-color 0.2s, box-shadow 0.2s;
            "
          />
          <span id="onboarding-name-error" style="
            display: none;
            font-size: 0.8rem;
            font-weight: 800;
            color: #ea580c;
          ">Por favor, digite um nome com pelo menos 2 letras.</span>
        </div>

        <!-- Botão Continuar para Personalização -->
        <button
          type="button"
          id="btn-confirm-onboarding-name"
          class="btn-equip-tool"
          style="
            width: 100%;
            padding: 13px 24px;
            border-radius: 50px;
            background: var(--animal-primary, #19c8b9);
            color: #ffffff;
            border: 2px solid var(--animal-primary-dark, #0f8e83);
            box-shadow: 0 4px 0 0 #0f8e83, 0 6px 12px rgba(17, 168, 155, 0.3);
            font-family: var(--animal-font, 'Nunito', sans-serif);
            font-size: 1rem;
            font-weight: 900;
            cursor: var(--animal-cursor-pointer, pointer);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: transform 0.1s, box-shadow 0.1s, background 0.15s;
          "
        >
          <span>Personalizar Personagem</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.container = overlay;

    const inputEl = overlay.querySelector('#onboarding-character-name-input');
    const errorEl = overlay.querySelector('#onboarding-name-error');
    const confirmBtn = overlay.querySelector('#btn-confirm-onboarding-name');

    inputEl?.addEventListener('focus', () => {
      inputEl.style.borderColor = '#19c8b9';
      inputEl.style.boxShadow = '0 0 0 4px rgba(25, 200, 185, 0.18)';
    });

    inputEl?.addEventListener('blur', () => {
      inputEl.style.borderColor = '#c4b89e';
      inputEl.style.boxShadow = 'none';
    });

    const handleConfirm = () => {
      const rawName = (inputEl?.value || '').trim();
      if (rawName.length < 2) {
        soundFX?.playPop?.(0.7);
        if (errorEl) errorEl.style.display = 'block';
        if (inputEl) {
          inputEl.style.borderColor = '#ea580c';
          inputEl.focus();
        }
        return;
      }

      soundFX?.playPop?.(1.2);
      this.close();
      if (typeof this.onNameConfirmed === 'function') {
        this.onNameConfirmed(rawName);
      }
    };

    confirmBtn?.addEventListener('click', handleConfirm);
    inputEl?.addEventListener('keydown', (e) => {
      if (errorEl && errorEl.style.display !== 'none') {
        errorEl.style.display = 'none';
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    });

    setTimeout(() => {
      inputEl?.focus();
      inputEl?.select();
    }, 80);
  }
}
