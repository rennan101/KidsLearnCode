// Magma Particle & Ember FX System
// Spawns floating incandescent sparks (embers), rising heat particles, and bursting magma bubbles over active magma tiles.

export class MagmaParticleEmitter {
  constructor(maxParticles = 120) {
    this.maxParticles = maxParticles;
    this.particles = [];
    this.bubbles = [];
    this.spawnTimer = 0;
  }

  update(dt, visibleMagmaTiles = [], camera = null) {
    if (!visibleMagmaTiles || visibleMagmaTiles.length === 0) {
      this.particles = [];
      this.bubbles = [];
      return;
    }

    // 1. Spawn New Embers / Sparks over visible tiles
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.04 && this.particles.length < this.maxParticles) {
      this.spawnTimer = 0;
      const countToSpawn = Math.min(3, Math.ceil(visibleMagmaTiles.length * 0.15));
      for (let i = 0; i < countToSpawn; i++) {
        const tile = visibleMagmaTiles[Math.floor(Math.random() * visibleMagmaTiles.length)];
        const tileSize = tile.tileSize || 64;
        
        // Spawn ember
        this.particles.push({
          x: tile.x + Math.random() * tileSize,
          y: tile.y + Math.random() * tileSize,
          vx: (Math.random() - 0.5) * 18,
          vy: -(22 + Math.random() * 35), // Rising velocity
          size: 1.5 + Math.random() * 2.2,
          life: 0,
          maxLife: 1.2 + Math.random() * 1.6,
          hue: 25 + Math.random() * 25, // Golden-orange to yellow
          swayFreq: 3 + Math.random() * 4,
          swayAmp: 12 + Math.random() * 10
        });

        // Rare magma bubble spawn
        if (Math.random() < 0.08 && this.bubbles.length < 15) {
          this.bubbles.push({
            x: tile.x + (0.2 + Math.random() * 0.6) * tileSize,
            y: tile.y + (0.2 + Math.random() * 0.6) * tileSize,
            radius: 0.5,
            maxRadius: 3.5 + Math.random() * 3.5,
            life: 0,
            duration: 0.8 + Math.random() * 0.7,
            popped: false
          });
        }
      }
    }

    // 2. Update Embers
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += (p.vx + Math.sin(p.life * p.swayFreq) * p.swayAmp) * dt;
      p.y += p.vy * dt;
      p.size = Math.max(0.2, p.size - dt * 0.4);
    }

    // 3. Update Magma Bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.life += dt;
      const progress = b.life / b.duration;
      if (progress >= 1.0) {
        // Bubble pop into mini spark burst
        if (!b.popped) {
          b.popped = true;
          for (let k = 0; k < 4; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 20 + Math.random() * 25;
            this.particles.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 15,
              size: 2.0,
              life: 0,
              maxLife: 0.4,
              hue: 45,
              swayFreq: 1,
              swayAmp: 0
            });
          }
        }
        this.bubbles.splice(i, 1);
        continue;
      }

      b.radius = Math.sin(progress * Math.PI * 0.5) * b.maxRadius;
    }
  }

  render(ctx) {
    if (this.particles.length === 0 && this.bubbles.length === 0) return;

    ctx.save();

    // 1. Render Magma Bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      const alpha = 1.0 - (b.life / b.duration) * 0.4;
      
      // Outer Orange Glow Rim
      ctx.fillStyle = `rgba(234, 88, 12, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent Yellow Core
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // White Hot Center Specular
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, Math.max(0.5, b.radius * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Render Embers / Sparks (Additive Blend for fiery glow)
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const alpha = Math.max(0, 1.0 - (p.life / p.maxLife));
      
      // Soft radial ember glow
      ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Sharp bright core
      ctx.fillStyle = `rgba(255, 255, 230, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
