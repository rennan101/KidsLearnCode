// Procedural Water Wave Engine (Detective Fantasia style & Animal Island aesthetics)
// Renders dynamic, multi-layered pixelated and stylized ocean waves with customizable openings (aperture), amplitude, speed, and biomes.

export const WATER_PALETTES = {
  'detective-fantasia': {
    id: 'detective-fantasia',
    name: 'Detective Fantasia (Retro)',
    deep: '#143836',
    base: '#1b4d49',
    shallow: '#2a726c',
    crest: '#3dd4a7',
    foam: '#a2fbe2',
    highlight: '#e6fff8'
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
  },
  'wind-waker': {
    id: 'wind-waker',
    name: 'Zelda Wind Waker',
    deep: '#0369a1',
    base: '#0284c7',
    shallow: '#38bdf8',
    crest: '#7dd3fc',
    foam: '#ffffff',
    highlight: '#ffffff'
  }
};

export class WaterWaveRenderer {
  constructor(config = {}) {
    // Default Wave Configuration Parameters
    this.config = {
      style: 'wind-waker', // 'wind-waker' | 'detective-fantasia'
      paletteId: 'wind-waker',
      aperture: 0.35,      // Wave opening gap threshold (0.0 = continuous lines, 0.8 = tiny wave crests with huge openings)
      amplitude: 3.5,      // Wave oscillation height (pixels)
      frequency: 0.045,    // Wave density along X axis
      speed: 1.0,          // Speed of wave movement and aperture phase drift
      waveSpacing: 18,     // Vertical distance between wave rows
      foamThickness: 2.2,  // Thickness of wave foam crest
      pixelStep: 2,        // Stepping resolution for crisp retro pixel art feel
      showCaustics: true,  // Draw subtle depth shadows below crests
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

  setStyle(style) {
    this.config.style = style === 'detective-fantasia' ? 'detective-fantasia' : 'wind-waker';
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

  setAperture(val) {
    this.config.aperture = Math.max(0.0, Math.min(0.9, Number(val)));
  }

  setAmplitude(val) {
    this.config.amplitude = Math.max(0.5, Math.min(12.0, Number(val)));
  }

  setSpeed(val) {
    this.config.speed = Math.max(0.1, Math.min(4.0, Number(val)));
  }

  setFrequency(val) {
    this.config.frequency = Math.max(0.01, Math.min(0.2, Number(val)));
  }

  setWaveSpacing(val) {
    this.config.waveSpacing = Math.max(8, Math.min(40, Number(val)));
  }

  setPalette(paletteId) {
    if (WATER_PALETTES[paletteId]) {
      this.config.paletteId = paletteId;
      this.activePalette = WATER_PALETTES[paletteId];
    }
  }

  /**
   * Batch render visible water cells across the viewport
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Array<{x: number, y: number, tileSize: number}>} waterCells 
   * @param {number} timeMs Current game timestamp in milliseconds
   */
  renderBatch(ctx, waterCells, timeMs = 0) {
    if (!waterCells || waterCells.length === 0) return;

    const t = (timeMs / 1000) * this.config.speed;
    const pal = this.activePalette;
    const amp = this.config.amplitude;
    const freq = this.config.frequency;
    const spacing = this.config.waveSpacing;
    const aperture = this.config.aperture;
    const foamThick = this.config.foamThickness;
    const step = Math.max(1, this.config.pixelStep);

    // 1. Pass: Base Water Fill & Deep Shading
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
      ctx.fillRect(cx, cy, size, size);

      // Subtle water texture grid detail
      ctx.fillStyle = pal.shallow;
      ctx.fillRect(cx + 2, cy + 2, size - 4, 3);
    }

    // 2. Pass: Continuous Wave Crests with Dynamic Openings (Detective Fantasia effect)
    ctx.save();
    for (let i = 0; i < waterCells.length; i++) {
      const cell = waterCells[i];
      const cx = cell.x;
      const cy = cell.y;
      const size = cell.tileSize;

      // Clip strictly to water cell bounds to maintain clean tile boundaries
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, size, size);
      ctx.clip();

      const numWaves = Math.ceil(size / spacing) + 1;
      const startWaveY = Math.floor(cy / spacing) * spacing;

      for (let w = -1; w <= numWaves; w++) {
        const waveBaseY = startWaveY + w * spacing;
        const waveIndex = Math.floor(waveBaseY / spacing);
        const wavePhaseOffset = waveIndex * 1.73;

        let isDrawingSegment = false;
        let segmentStartX = 0;
        let segmentStartY = 0;

        for (let x = cx - 2; x <= cx + size + 2; x += step) {
          const worldX = x;
          // Primary wave vertical offset
          const sineVal = Math.sin(worldX * freq + t * 2.2 + wavePhaseOffset);
          const waveY = waveBaseY + sineVal * amp;

          // Aperture gap mask (cosine modulation determines where wave crest is open or closed)
          const gapMask = Math.cos(worldX * (freq * 0.55) - t * 1.35 + waveIndex * 2.4);

          // Threshold check: if gapMask is greater than aperture, we render the foam crest
          const isOpen = gapMask < (aperture * 1.6 - 0.3);

          if (!isOpen) {
            if (!isDrawingSegment) {
              isDrawingSegment = true;
              segmentStartX = x;
              segmentStartY = waveY;
            }

            // Draw Caustic Shadow underneath crest
            if (this.config.showCaustics) {
              ctx.fillStyle = pal.deep;
              ctx.fillRect(x, waveY + foamThick + 1, step, 1.5);
            }

            // Draw Crest Base Color
            ctx.fillStyle = pal.crest;
            ctx.fillRect(x, waveY + 0.5, step, foamThick);

            // Draw Top Foam Highlight (Pixelated tip)
            if (sineVal > 0.1 || gapMask > 0.2) {
              ctx.fillStyle = pal.foam;
              ctx.fillRect(x, waveY - 0.5, step, 1.2);
            }

            // Sparkle Highlight at crest peaks
            if (sineVal > 0.85 && ((Math.floor(worldX / 8) + waveIndex) % 4 === 0)) {
              ctx.fillStyle = pal.highlight;
              ctx.fillRect(x, waveY - 1.5, step, 1.5);
            }
          } else {
            isDrawingSegment = false;
          }
        }
      }

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Render single tile preview (for asset drawers, inventory, and thumbnails)
   */
  renderPreview(ctx, x, y, size = 64, timeMs = 0) {
    this.renderBatch(ctx, [{ x, y, tileSize: size }], timeMs);
  }
}
