// Magma Wave & Cellular Engine (MinionsArt Stylized Lava Aesthetic)
// Provides configuration management, Canvas 2D fallback rendering, and preview generation.

import { MAGMA_PALETTES } from './WebGLMagmaShader.js';

export { MAGMA_PALETTES };

export class MagmaRenderer {
  constructor(config = {}) {
    this.config = {
      paletteId: 'classic-magma',
      flowSpeed: 1.2,
      crustScale: 3.8,
      warpStrength: 0.35,
      heatIntensity: 1.15,
      ...config
    };

    this.activePalette = MAGMA_PALETTES[this.config.paletteId] || MAGMA_PALETTES['classic-magma'];
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.paletteId && MAGMA_PALETTES[newConfig.paletteId]) {
      this.activePalette = MAGMA_PALETTES[newConfig.paletteId];
    }
  }

  getConfig() {
    return { ...this.config };
  }

  // Canvas 2D Fallback Rendering for Magma Tiles
  renderBatch(ctx, cells, timeMs) {
    if (!cells || cells.length === 0) return;
    const timeSec = timeMs / 1000;
    const pal = this.activePalette;

    ctx.save();
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const x = cell.x;
      const y = cell.y;
      const size = cell.tileSize || 64;

      this.renderSingleTileFallback(ctx, x, y, size, timeSec, pal);
    }
    ctx.restore();
  }

  renderSingleTileFallback(ctx, x, y, size, timeSec, pal) {
    // 1. Base Dark Basalt Background
    ctx.fillStyle = pal.crustDark;
    ctx.fillRect(x, y, size, size);

    // 2. Animated Flowing Magma Fractures (Simulated using layered paths)
    const t = timeSec * this.config.flowSpeed;
    const wave1 = Math.sin(t * 1.5 + (x * 0.05) + (y * 0.03)) * 6;
    const wave2 = Math.cos(t * 1.8 + (x * 0.04) - (y * 0.06)) * 5;
    const pulse = 0.85 + Math.sin(t * 3.0 + x * 0.1) * 0.15;

    // Glowing Underlayer
    ctx.strokeStyle = pal.coolingCrimson;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 20 + wave1);
    ctx.bezierCurveTo(x + size * 0.3, y + 10 + wave2, x + size * 0.7, y + size * 0.8 + wave1, x + size + 4, y + size * 0.6 + wave2);
    ctx.moveTo(x + 10, y - 4);
    ctx.bezierCurveTo(x + size * 0.4 + wave2, y + size * 0.4, x + size * 0.6, y + size * 0.7 + wave1, x + size * 0.8, y + size + 4);
    ctx.stroke();

    // Active Orange Molten Stream
    ctx.strokeStyle = pal.lavaOrange;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 20 + wave1);
    ctx.bezierCurveTo(x + size * 0.3, y + 10 + wave2, x + size * 0.7, y + size * 0.8 + wave1, x + size + 4, y + size * 0.6 + wave2);
    ctx.moveTo(x + 10, y - 4);
    ctx.bezierCurveTo(x + size * 0.4 + wave2, y + size * 0.4, x + size * 0.6, y + size * 0.7 + wave1, x + size * 0.8, y + size + 4);
    ctx.stroke();

    // Incandescent Core Yellow Center
    ctx.strokeStyle = pal.coreHot;
    ctx.lineWidth = 3 * pulse;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 20 + wave1);
    ctx.bezierCurveTo(x + size * 0.3, y + 10 + wave2, x + size * 0.7, y + size * 0.8 + wave1, x + size + 4, y + size * 0.6 + wave2);
    ctx.stroke();

    // 3. Basalt Rock Plates Overlaid
    ctx.fillStyle = pal.crustLight;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.25, y + size * 0.75, size * 0.18, size * 0.14, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + size * 0.78, y + size * 0.22, size * 0.16, size * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fast UI Preview Generator
  renderPreview(ctx, x, y, size, timeMs) {
    this.renderSingleTileFallback(ctx, x, y, size, (timeMs || performance.now()) / 1000, this.activePalette);
  }
}
