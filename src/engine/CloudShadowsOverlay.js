// CloudShadowsOverlay.js
// Atmospheric procedural cloud shadows scrolling seamlessly across the map in world space.

export class CloudShadowsOverlay {
  constructor() {
    this.enabled = true;
    this.speed = 22; // Pixels per second
    this.angle = Math.PI / 4; // 45 degrees (Northeast drift)
    this.opacity = 0.22; // 22% darkening
    this.scale = 2.2; // Cloud scale multiplier

    this.offsetX = 0;
    this.offsetY = 0;

    // Offscreen seamless cloud texture pattern
    this.patternCanvas = null;
    this.patternCtx = null;
    this.pattern = null;
    this.patternSize = 512;

    this.initPattern();
  }

  initPattern() {
    this.patternCanvas = document.createElement('canvas');
    this.patternCanvas.width = this.patternSize;
    this.patternCanvas.height = this.patternSize;
    this.patternCtx = this.patternCanvas.getContext('2d');

    const ctx = this.patternCtx;
    ctx.clearRect(0, 0, this.patternSize, this.patternSize);

    // Generate soft, organic procedural cloud blobs that tile seamlessly
    const numClouds = 14;
    for (let i = 0; i < numClouds; i++) {
      const cx = (i * 137.5) % this.patternSize;
      const cy = (i * 223.7) % this.patternSize;
      const radius = 60 + ((i * 31) % 55);

      this.drawSeamlessRadialBlob(ctx, cx, cy, radius);
    }
  }

  // Draw radial gradient blob wrapped across canvas edges for seamless tiling
  drawSeamlessRadialBlob(ctx, cx, cy, radius) {
    const offsets = [-this.patternSize, 0, this.patternSize];
    for (const ox of offsets) {
      for (const oy of offsets) {
        const x = cx + ox;
        const y = cy + oy;
        if (x + radius < 0 || x - radius > this.patternSize || y + radius < 0 || y - radius > this.patternSize) {
          continue;
        }

        const grad = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
        // Soft dark cloud core fading outward
        grad.addColorStop(0, 'rgba(12, 28, 48, 0.42)');
        grad.addColorStop(0.5, 'rgba(15, 32, 54, 0.24)');
        grad.addColorStop(1, 'rgba(18, 36, 60, 0.0)');

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 1.35, radius * 0.85, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  update(dt) {
    if (!this.enabled || this.speed <= 0) return;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;

    const effectiveSize = this.patternSize * this.scale;
    this.offsetX = (this.offsetX + vx * dt) % effectiveSize;
    this.offsetY = (this.offsetY + vy * dt) % effectiveSize;
  }

  render(ctx, camera) {
    if (!this.enabled || this.opacity <= 0.01) return;

    const camX = isFinite(camera.x) ? camera.x : 0;
    const camY = isFinite(camera.y) ? camera.y : 0;
    const camW = camera.viewportWidth || ctx.canvas.width;
    const camH = camera.viewportHeight || ctx.canvas.height;
    const camZ = camera.zoom || 1.0;

    ctx.save();
    // Use multiply or source-over with darkening alpha
    ctx.globalAlpha = Math.min(0.6, Math.max(0, this.opacity));
    ctx.globalCompositeOperation = 'multiply';

    // Create pattern once or reuse
    if (!this.pattern) {
      this.pattern = ctx.createPattern(this.patternCanvas, 'repeat');
    }

    if (this.pattern) {
      ctx.save();
      const effectiveSize = this.patternSize * this.scale;
      // World space offset synchronized with camera
      const shiftX = (this.offsetX - (camX % effectiveSize) + effectiveSize) % effectiveSize;
      const shiftY = (this.offsetY - (camY % effectiveSize) + effectiveSize) % effectiveSize;

      ctx.translate(camX + shiftX - effectiveSize, camY + shiftY - effectiveSize);
      ctx.scale(this.scale, this.scale);
      ctx.fillStyle = this.pattern;
      // Fill entire camera view quad with padding
      ctx.fillRect(-effectiveSize, -effectiveSize, (camW / camZ) + effectiveSize * 3, (camH / camZ) + effectiveSize * 3);
      ctx.restore();
    }

    ctx.restore();
  }
}
