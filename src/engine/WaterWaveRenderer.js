// Water Wave Engine (Zelda Wind Waker style & Animal Island aesthetics)
// Provides configuration and fallback 2D canvas rendering for Zelda Wind Waker water and shore foam.

export const WATER_PALETTES = {
  'wind-waker': {
    id: 'wind-waker',
    name: 'Zelda Wind Waker',
    deep: '#0369a1',
    base: '#0284c7',
    shallow: '#38bdf8',
    crest: '#7dd3fc',
    foam: '#ffffff',
    highlight: '#ffffff'
  },
  'tropical-mint': {
    id: 'tropical-mint',
    name: 'Menta Tropical (Animal Island)',
    deep: '#0f766e',
    base: '#0d9488',
    shallow: '#14b8a6',
    crest: '#2dd4bf',
    foam: '#99f6e4',
    highlight: '#f0fdfa'
  },
  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Oceano Profundo',
    deep: '#0c4a6e',
    base: '#0369a1',
    shallow: '#0284c7',
    crest: '#38bdf8',
    foam: '#bae6fd',
    highlight: '#f0f9ff'
  },
  'golden-sunset': {
    id: 'golden-sunset',
    name: 'Pôr do Sol Dourado',
    deep: '#7c2d12',
    base: '#c2410c',
    shallow: '#ea580c',
    crest: '#fb923c',
    foam: '#fed7aa',
    highlight: '#fff7ed'
  },
  'crystal-lagoon': {
    id: 'crystal-lagoon',
    name: 'Lagoa Cristalina',
    deep: '#1e3a8a',
    base: '#2563eb',
    shallow: '#3b82f6',
    crest: '#60a5fa',
    foam: '#dbeafe',
    highlight: '#eff6ff'
  }
};

export class WaterWaveRenderer {
  constructor(config = {}) {
    this.config = {
      style: 'wind-waker',
      paletteId: 'wind-waker',
      voronoiScale: 1.5,   // Scale of Wind Waker voronoi caustic mesh
      distortionSpeed: 1.6,// Speed of Wind Waker dual-harmonic distortion
      shoreLapReach: 14,   // Max pixel reach of wave lapping onto shore
      shoreLapSpeed: 1.8,  // Speed of shoreline wave lapping cycle
      ...config
    };

    this.activePalette = WATER_PALETTES[this.config.paletteId] || WATER_PALETTES['wind-waker'];
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.paletteId && WATER_PALETTES[newConfig.paletteId]) {
      this.activePalette = WATER_PALETTES[newConfig.paletteId];
    }
  }

  getConfig() {
    return { ...this.config };
  }

  setVoronoiScale(val) {
    this.config.voronoiScale = Math.max(0.5, Math.min(6.0, Number(val)));
  }

  setDistortionSpeed(val) {
    this.config.distortionSpeed = Math.max(0.2, Math.min(5.0, Number(val)));
  }

  setShoreLapReach(val) {
    this.config.shoreLapReach = Math.max(0, Math.min(32, Number(val)));
  }

  setShoreLapSpeed(val) {
    this.config.shoreLapSpeed = Math.max(0.2, Math.min(5.0, Number(val)));
  }

  setPalette(paletteId) {
    if (WATER_PALETTES[paletteId]) {
      this.config.paletteId = paletteId;
      this.activePalette = WATER_PALETTES[paletteId];
    }
  }

  /**
   * Fallback 2D canvas batch render visible water cells across the viewport
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Array<{x: number, y: number, tileSize: number}>} waterCells 
   * @param {number} timeMs Current game timestamp in milliseconds
   */
  renderBatch(ctx, waterCells, timeMs = 0) {
    if (!waterCells || waterCells.length === 0) return;

    const t = (timeMs / 1000) * this.config.distortionSpeed;
    const pal = this.activePalette;

    // Base Water Fill & Deep Shading
    for (let i = 0; i < waterCells.length; i++) {
      const cell = waterCells[i];
      const cx = cell.x;
      const cy = cell.y;
      const size = cell.tileSize;

      // Base water gradient
      const grad = ctx.createLinearGradient(cx, cy, cx, cy + size);
      grad.addColorStop(0, pal.base);
      grad.addColorStop(1, pal.deep);
      ctx.fillStyle = grad;
      ctx.fillRect(cx, cy, size + 0.5, size + 0.5);

      // Cel-shaded rings & wave outlines
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, size, size);
      ctx.clip();

      const pulse = Math.sin(t * 1.5 + (cx + cy) * 0.02) * 3;
      ctx.strokeStyle = pal.crest;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 22, Math.max(2, 14 + pulse), 0, Math.PI * 2);
      ctx.arc(cx + 46, cy + 38, Math.max(2, 16 - pulse), 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = pal.foam;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 22, Math.max(1, 10 + pulse), 0, Math.PI * 2);
      ctx.arc(cx + 46, cy + 38, Math.max(1, 12 - pulse), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }

  /**
   * Render single tile preview (for asset drawers, inventory, and thumbnails)
   */
  renderPreview(ctx, x, y, size = 64, timeMs = 0) {
    this.renderBatch(ctx, [{ x, y, tileSize: size }], timeMs);
  }
}
