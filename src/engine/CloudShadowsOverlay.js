// CloudShadowsOverlay.js
// Dual-layer procedural cloud shadow overlay with varied organic silhouettes and accurate px/s UV drift.

export class CloudShadowsOverlay {
  constructor() {
    this.enabled = true;
    this.speed = 12; // True world pixels per second
    this.angle = -Math.PI / 4; // Northeast drift (-45 deg in canvas coords: +X right, -Y up)
    this.opacity = 0.22; // 22% atmospheric darkening
    this.scale = 2.0; // Base world scale multiplier
    this.patternType = 'varied'; // 'varied' | 'cumulus' | 'cirrus' | 'dappled'

    // Dual-layer parallax offsets for non-repeating morphing shadows
    this.offsetAX = 0;
    this.offsetAY = 0;
    this.offsetBX = 340;
    this.offsetBY = 190;

    this.patternSize = 1024;
    this.canvasA = null;
    this.canvasB = null;
    this.patternA = null;
    this.patternB = null;

    this.initPatterns();
  }

  setPatternType(type) {
    if (!type || this.patternType === type) return;
    this.patternType = type;
    this.patternA = null;
    this.patternB = null;
    this.initPatterns();
  }

  // Deterministic PRNG for organic cloud cluster generation
  seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  initPatterns() {
    this.canvasA = document.createElement('canvas');
    this.canvasA.width = this.patternSize;
    this.canvasA.height = this.patternSize;

    this.canvasB = document.createElement('canvas');
    this.canvasB.width = this.patternSize;
    this.canvasB.height = this.patternSize;

    this.generateCloudLayer(this.canvasA.getContext('2d'), 1337, 'primary');
    this.generateCloudLayer(this.canvasB.getContext('2d'), 7919, 'secondary');
  }

  generateCloudLayer(ctx, seed, layerRole) {
    const size = this.patternSize;
    ctx.clearRect(0, 0, size, size);
    const rand = this.seededRandom(seed);

    // Configure cluster distribution based on selected pattern style
    let clusterSpecs = [];
    if (this.patternType === 'cumulus') {
      clusterSpecs = [
        { count: 4, minR: 95, maxR: 150, puffs: 9, stretch: 1.25, rot: 0.2 },
        { count: 6, minR: 55, maxR: 85, puffs: 6, stretch: 1.15, rot: -0.15 }
      ];
    } else if (this.patternType === 'cirrus') {
      clusterSpecs = [
        { count: 7, minR: 70, maxR: 130, puffs: 8, stretch: 2.35, rot: -0.55 },
        { count: 8, minR: 40, maxR: 75, puffs: 5, stretch: 2.6, rot: -0.65 }
      ];
    } else if (this.patternType === 'dappled') {
      clusterSpecs = [
        { count: 14, minR: 35, maxR: 68, puffs: 5, stretch: 1.3, rot: 0.3 },
        { count: 10, minR: 22, maxR: 42, puffs: 3, stretch: 1.2, rot: -0.4 }
      ];
    } else {
      // 'varied': rich mix of giant cumulus, medium drifting clouds, elongated wisps, and small puffs
      clusterSpecs = [
        { count: 2, minR: 115, maxR: 165, puffs: 11, stretch: 1.35, rot: 0.15 }, // Giant billowy cloud
        { count: 4, minR: 70, maxR: 105, puffs: 7, stretch: 1.55, rot: -0.35 },  // Medium asymmetric cloud
        { count: 4, minR: 50, maxR: 85, puffs: 6, stretch: 2.1, rot: -0.6 },     // Wind-stretched wisp
        { count: 6, minR: 28, maxR: 48, puffs: 4, stretch: 1.2, rot: 0.4 }       // Small scattered puff
      ];
    }

    const alphaScale = layerRole === 'primary' ? 1.0 : 0.72;

    for (const spec of clusterSpecs) {
      for (let c = 0; c < spec.count; c++) {
        const centerX = rand() * size;
        const centerY = rand() * size;
        const baseRadius = spec.minR + rand() * (spec.maxR - spec.minR);
        const clusterAngle = spec.rot + (rand() - 0.5) * 0.6;

        // Build each cloud from multiple overlapping organic puffs of varied sizes
        for (let p = 0; p < spec.puffs; p++) {
          const distRatio = p === 0 ? 0 : (0.25 + rand() * 0.85);
          const puffAngle = clusterAngle + (rand() - 0.5) * 2.2;
          const spreadX = Math.cos(puffAngle) * baseRadius * distRatio * spec.stretch;
          const spreadY = Math.sin(puffAngle) * baseRadius * distRatio;

          const puffRadius = baseRadius * (p === 0 ? 0.85 : (0.35 + rand() * 0.55));
          const aspectX = (1.05 + rand() * 0.45) * (spec.stretch > 1.8 ? 1.4 : 1.0);
          const aspectY = 0.75 + rand() * 0.35;
          const puffRot = clusterAngle + (rand() - 0.5) * 0.4;
          const puffDensity = (0.22 + rand() * 0.18) * alphaScale;

          this.drawSeamlessPuff(
            ctx,
            (centerX + spreadX + size) % size,
            (centerY + spreadY + size) % size,
            puffRadius,
            aspectX,
            aspectY,
            puffRot,
            puffDensity
          );
        }
      }
    }
  }

  // Draw a soft radial puff wrapped across all 4 canvas boundaries for 100% seamless tiling
  drawSeamlessPuff(ctx, cx, cy, radius, aspectX, aspectY, rot, coreAlpha) {
    const size = this.patternSize;
    const maxExtent = radius * Math.max(aspectX, aspectY) * 1.1;
    const offsets = [-size, 0, size];

    for (const ox of offsets) {
      const x = cx + ox;
      if (x + maxExtent < 0 || x - maxExtent > size) continue;

      for (const oy of offsets) {
        const y = cy + oy;
        if (y + maxExtent < 0 || y - maxExtent > size) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.scale(aspectX, aspectY);

        const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, `rgba(12, 26, 46, ${coreAlpha.toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(15, 32, 54, ${(coreAlpha * 0.52).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(18, 36, 60, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  update(dtRaw) {
    if (!this.enabled || this.speed <= 0) return;
    // Normalize deltaTime: main.js passes milliseconds (~16.6ms), convert to seconds
    const dt = dtRaw > 1.0 ? Math.min(0.1, dtRaw / 1000) : Math.min(0.1, Math.max(0.001, dtRaw));

    // Layer A drifts along main wind vector
    const vxA = Math.cos(this.angle) * this.speed;
    const vyA = Math.sin(this.angle) * this.speed;
    const sizeA = this.patternSize * this.scale;
    this.offsetAX = (this.offsetAX + vxA * dt) % sizeA;
    this.offsetAY = (this.offsetAY + vyA * dt) % sizeA;

    // Layer B drifts at a slightly different angle & speed so cloud formations evolve organically
    const angleB = this.angle + 0.22;
    const vxB = Math.cos(angleB) * (this.speed * 0.68);
    const vyB = Math.sin(angleB) * (this.speed * 0.68);
    const sizeB = this.patternSize * (this.scale * 1.35);
    this.offsetBX = (this.offsetBX + vxB * dt) % sizeB;
    this.offsetBY = (this.offsetBY + vyB * dt) % sizeB;
  }

  render(ctx, camera) {
    if (!this.enabled || this.opacity <= 0.01) return;

    const camX = isFinite(camera.x) ? camera.x : 0;
    const camY = isFinite(camera.y) ? camera.y : 0;
    const camW = camera.viewportWidth || ctx.canvas.width;
    const camH = camera.viewportHeight || ctx.canvas.height;
    const camZ = camera.zoom || 1.0;

    if (!this.patternA && this.canvasA) {
      this.patternA = ctx.createPattern(this.canvasA, 'repeat');
    }
    if (!this.patternB && this.canvasB) {
      this.patternB = ctx.createPattern(this.canvasB, 'repeat');
    }

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    // Render Primary Cloud Shadow Layer
    if (this.patternA) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.65, Math.max(0, this.opacity));
      const effA = this.patternSize * this.scale;
      const shiftAX = ((this.offsetAX % effA) + effA) % effA;
      const shiftAY = ((this.offsetAY % effA) + effA) % effA;

      ctx.translate(shiftAX, shiftAY);
      ctx.scale(this.scale, this.scale);
      ctx.fillStyle = this.patternA;
      ctx.fillRect(
        (camX - shiftAX) / this.scale - this.patternSize,
        (camY - shiftAY) / this.scale - this.patternSize,
        (camW / camZ) / this.scale + this.patternSize * 2,
        (camH / camZ) / this.scale + this.patternSize * 2
      );
      ctx.restore();
    }

    // Render Secondary Morphing Cloud Shadow Layer
    if (this.patternB) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.55, Math.max(0, this.opacity * 0.75));
      const scaleB = this.scale * 1.35;
      const effB = this.patternSize * scaleB;
      const shiftBX = ((this.offsetBX % effB) + effB) % effB;
      const shiftBY = ((this.offsetBY % effB) + effB) % effB;

      ctx.translate(shiftBX, shiftBY);
      ctx.scale(scaleB, scaleB);
      ctx.fillStyle = this.patternB;
      ctx.fillRect(
        (camX - shiftBX) / scaleB - this.patternSize,
        (camY - shiftBY) / scaleB - this.patternSize,
        (camW / camZ) / scaleB + this.patternSize * 2,
        (camH / camZ) / scaleB + this.patternSize * 2
      );
      ctx.restore();
    }

    ctx.restore();
  }
}
