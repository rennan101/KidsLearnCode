// TallGrassSystem.js
// Specialized 2D top-down tall grass interaction, sway dynamics and character immersion.

export class TallGrassSystem {
  constructor(tileMap) {
    this.tileMap = tileMap;
    this.swayIntensity = 1.0; // 0.0 to 2.0
    this.speedFriction = 0.20; // 20% speed reduction in tall grass (0.8x)
    this.particlesEnabled = true;

    // Active sway instances: key -> { timer: number, maxTime: number, dir: number }
    this.swayingTiles = new Map();

    // Particle pool for grass leaves
    this.particles = [];
    this.maxParticles = 60;

    // Track if local player is currently inside tall grass
    this.isPlayerInGrass = false;
  }

  isTallGrassTile(tileId) {
    if (!tileId || typeof tileId !== 'string') return false;
    const lower = tileId.toLowerCase();
    return lower === 'tall-grass' || lower.startsWith('high-grass-') || lower.startsWith('tallgrass');
  }

  triggerSway(tileX, tileY, dirX = 1) {
    const key = `${tileX},${tileY}`;
    this.swayingTiles.set(key, {
      timer: 0.35,
      maxTime: 0.35,
      dir: dirX !== 0 ? Math.sign(dirX) : 1
    });

    if (this.particlesEnabled && this.particles.length < this.maxParticles) {
      const worldX = tileX * this.tileMap.tileSize + 32;
      const worldY = tileY * this.tileMap.tileSize + 40;
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: worldX + (Math.random() - 0.5) * 24,
          y: worldY + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 40 + (dirX * 20),
          vy: -20 - Math.random() * 30,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 8,
          alpha: 1.0,
          life: 0.45 + Math.random() * 0.25,
          maxLife: 0.7,
          color: Math.random() > 0.4 ? '#4ade80' : '#22c55e',
          size: 4 + Math.random() * 3
        });
      }
    }
  }

  update(dt, player) {
    // 1. Update active sway timers
    for (const [key, sway] of this.swayingTiles.entries()) {
      sway.timer -= dt;
      if (sway.timer <= 0) {
        this.swayingTiles.delete(key);
      }
    }

    // 2. Check player interaction with tall grass
    this.isPlayerInGrass = false;
    if (player && typeof player.getFeetBox === 'function') {
      const feet = player.getFeetBox();
      const centerX = feet.x + feet.w / 2;
      const centerY = feet.y + feet.h / 2;
      const tx = Math.floor(centerX / this.tileMap.tileSize);
      const ty = Math.floor(centerY / this.tileMap.tileSize);

      // Check decor and solid layers
      const decorCell = this.tileMap.layers.decor?.get(this.tileMap.getKey(tx, ty));
      const solidCell = this.tileMap.layers.solid?.get(this.tileMap.getKey(tx, ty));

      const isGrass = (decorCell && this.isTallGrassTile(decorCell.tileId)) ||
                      (solidCell && this.isTallGrassTile(solidCell.tileId));

      if (isGrass) {
        this.isPlayerInGrass = true;
        // Trigger sway if player is moving
        const isMoving = Boolean(player.vx || player.vy || (player.state === 'walk' || player.state === 'run'));
        if (isMoving && Math.random() < 0.35) {
          this.triggerSway(tx, ty, player.vx || 1);
        }
      }
    }

    // 3. Update leaf particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt; // Gravity
      p.rot += p.vrot * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  getSpeedMultiplier() {
    if (this.isPlayerInGrass) {
      return Math.max(0.4, 1.0 - this.speedFriction);
    }
    return 1.0;
  }

  // Draw submerged grass overlay / upper tufts over player's legs
  renderSubmersionOverlay(ctx, player, assetLoader) {
    if (!this.isPlayerInGrass || !player) return;
    const feet = player.getFeetBox();
    const centerX = feet.x + feet.w / 2;
    const centerY = feet.y + feet.h / 2;
    const tx = Math.floor(centerX / this.tileMap.tileSize);
    const ty = Math.floor(centerY / this.tileMap.tileSize);

    const decorCell = this.tileMap.layers.decor?.get(this.tileMap.getKey(tx, ty));
    const solidCell = this.tileMap.layers.solid?.get(this.tileMap.getKey(tx, ty));
    const cell = (decorCell && this.isTallGrassTile(decorCell.tileId)) ? decorCell : solidCell;
    if (!cell) return;

    const img = assetLoader.getImage(cell.tileId);
    if (!img) return;

    ctx.save();
    // Render top 50% of the tall grass sprite overlapping the lower half of the player
    const tileDestX = tx * this.tileMap.tileSize;
    const tileDestY = ty * this.tileMap.tileSize;
    const grassW = img.width || 64;
    const grassH = img.height || 64;
    const sliceH = grassH * 0.55;

    // Check sway angle
    const sway = this.swayingTiles.get(`${tx},${ty}`);
    let swayOffset = 0;
    if (sway && this.swayIntensity > 0) {
      const progress = sway.timer / sway.maxTime;
      swayOffset = Math.sin(progress * Math.PI * 4) * 4 * this.swayIntensity * sway.dir;
    }

    ctx.drawImage(
      img,
      0, 0, grassW, sliceH,
      tileDestX + swayOffset, tileDestY + (this.tileMap.tileSize - 64), 64, 64 * 0.55
    );
    ctx.restore();
  }

  // Draw floating leaf particles
  renderParticles(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}
