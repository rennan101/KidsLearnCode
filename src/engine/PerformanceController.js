/**
 * PerformanceController.js - KidsLearnCode
 * Gerenciador central de desempenho, taxa de quadros e qualidade visual gráfica.
 * 
 * Padrão Animal Island UI: zero emojis, persistência em localStorage e
 * predefinições otimizadas para hardware (4GB / 8GB / 16GB+).
 */

export class PerformanceController {
  constructor() {
    this.STORAGE_KEY = 'kidslearn_perf_config_v2';

    // Configurações padrão (Preset 8GB / Balanceado)
    this.settings = {
      preset: '8gb',               // '4gb' | '8gb' | '16gb' | 'custom'
      targetFps: 60,                // 30 | 60 | 120
      waterReflections: 'medium',   // 'low' | 'medium' | 'high'
      minimapFps: 20,               // 10 | 20 | 60
      lightingQuality: 'gradient',  // 'flat' | 'gradient'
      showFpsCounter: false         // true | false
    };

    // Métricas de FPS em tempo real
    this.currentFps = 60;
    this.frameTime = 16.6;
    this.fpsHistory = new Float32Array(30);
    this.fpsIndex = 0;
    this.lastFrameTime = performance.now();
    this.lastMinimapRenderTime = 0;
    this.lastFpsHudUpdateTime = 0;

    // Callbacks de evento
    this.onSettingsChanged = null;

    this.loadFromStorage();
  }

  /**
   * Carrega configurações salvas do localStorage
   */
  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.settings = { ...this.settings, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar configurações de desempenho:', e);
    }
  }

  /**
   * Salva configurações no localStorage
   */
  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      }
      if (typeof this.onSettingsChanged === 'function') {
        this.onSettingsChanged(this.settings);
      }
    } catch (e) {
      console.warn('Erro ao salvar configurações de desempenho:', e);
    }
  }

  /**
   * Aplica predefinições rápidas baseadas no perfil de memória / hardware
   * @param {'4gb' | '8gb' | '16gb'} preset 
   */
  applyPreset(preset) {
    if (preset === '4gb') {
      this.settings.preset = '4gb';
      this.settings.targetFps = 60;
      this.settings.waterReflections = 'low';
      this.settings.minimapFps = 10;
      this.settings.lightingQuality = 'flat';
    } else if (preset === '8gb') {
      this.settings.preset = '8gb';
      this.settings.targetFps = 60;
      this.settings.waterReflections = 'medium';
      this.settings.minimapFps = 20;
      this.settings.lightingQuality = 'gradient';
    } else if (preset === '16gb') {
      this.settings.preset = '16gb';
      this.settings.targetFps = 120;
      this.settings.waterReflections = 'high';
      this.settings.minimapFps = 60;
      this.settings.lightingQuality = 'gradient';
    }
    this.saveToStorage();
  }

  /**
   * Atualiza uma chave individual e marca como 'custom' se diferir do preset
   */
  setSetting(key, value) {
    if (this.settings[key] !== value) {
      this.settings[key] = value;
      this.settings.preset = 'custom';
      this.saveToStorage();
    }
  }

  /**
   * Atualiza a contagem de FPS a cada frame
   * @param {number} timestamp 
   */
  update(timestamp) {
    const dt = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    if (dt > 0) {
      this.frameTime = dt;
      const instantFps = Math.min(240, 1000 / dt);
      this.fpsHistory[this.fpsIndex] = instantFps;
      this.fpsIndex = (this.fpsIndex + 1) % 30;

      // Média móvel
      let sum = 0;
      for (let i = 0; i < 30; i++) {
        sum += this.fpsHistory[i];
      }
      this.currentFps = Math.round(sum / 30);
    }
  }

  /**
   * Verifica se o Minimapa deve renderizar neste frame de acordo com o throttling
   * @param {number} now 
   * @returns {boolean}
   */
  shouldRenderMinimap(now) {
    const interval = 1000 / (this.settings.minimapFps || 20);
    if (now - this.lastMinimapRenderTime >= interval) {
      this.lastMinimapRenderTime = now;
      return true;
    }
    return false;
  }
}
