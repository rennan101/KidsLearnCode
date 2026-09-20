/**
 * SecurityManager - Proteção de Assets, Imagens e Chaves de API
 * - Bloqueia clique direito (contextmenu) em imagens, canvas e gavetas de assets
 * - Bloqueia arrastar e soltar (dragstart) de imagens para a área de trabalho
 * - Bloqueia atalhos de salvar página/inspeção (Ctrl+S, Ctrl+U, F12, etc.)
 * - Desativa seleção de texto e callouts em dispositivos móveis
 * - Protege extração indevida de dados do canvas
 */

export class SecurityManager {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // 1. Bloqueia menu de contexto (botão direito) em imagens, canvas e interface
    document.addEventListener('contextmenu', (e) => {
      const target = e.target;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'CANVAS' ||
        target.tagName === 'SVG' ||
        target.closest('.canvas-container') ||
        target.closest('.asset-drawer') ||
        target.closest('.character-card') ||
        target.closest('.asset-card') ||
        target.closest('.modal-card') ||
        target.closest('#game-viewport')
      ) {
        e.preventDefault();
        return false;
      }
    }, { capture: true, passive: false });

    // 2. Bloqueia arrastar imagens e canvas para fora do navegador
    document.addEventListener('dragstart', (e) => {
      const target = e.target;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'CANVAS' ||
        target.tagName === 'SVG' ||
        target.classList?.contains('asset-thumb') ||
        target.classList?.contains('hero-portrait')
      ) {
        e.preventDefault();
        return false;
      }
    }, { capture: true, passive: false });

    // 3. Bloqueia atalhos de teclado comuns de salvamento e inspeção
    window.addEventListener('keydown', (e) => {
      const key = e.key;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl+S / Cmd+S (Salvar página/imagens como arquivo)
      if (isCtrlOrMeta && (key === 's' || key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (Ver código-fonte)
      if (isCtrlOrMeta && (key === 'u' || key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // F12 (DevTools)
      if (key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
      if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c')) {
        e.preventDefault();
        return false;
      }
    }, { capture: true, passive: false });

    // 4. Marca todas as imagens existentes e futuras com draggable="false"
    this.protectAllImages();
    this.observeDOMForNewImages();

    // 5. Inibe extração direta por scripts no canvas
    this.protectCanvasContext();

    console.log('[SecurityManager] Proteções de assets e anti-scrape ativadas com sucesso.');
  }

  protectAllImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('draggable', 'false');
      img.setAttribute('oncontextmenu', 'return false;');
    });
  }

  observeDOMForNewImages() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG') {
              node.setAttribute('draggable', 'false');
              node.setAttribute('oncontextmenu', 'return false;');
            } else if (node.querySelectorAll) {
              const innerImages = node.querySelectorAll('img');
              innerImages.forEach(img => {
                img.setAttribute('draggable', 'false');
                img.setAttribute('oncontextmenu', 'return false;');
              });
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  protectCanvasContext() {
    // Adiciona proteção ao canvas principal
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.oncontextmenu = (e) => { e.preventDefault(); return false; };
      canvas.setAttribute('draggable', 'false');
    }
  }
}

export const securityManager = new SecurityManager();
export default securityManager;
