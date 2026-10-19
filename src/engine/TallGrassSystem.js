// TallGrassSystem.js
// 2D top-down interactive tall grass, wind foliage distortion (trees, bushes, flowers) and leaf particles.

const EXCLUDED_TERRAIN_PREFIXES = ['grass-0', 'grass-ground', 'grass-corner', 'high-grass-corner', 'dirt-', 'seedbag-'];
const SMALL_PLANTS = new Set(['sprout', 'wheat', 'corn', 'tomato', 'cabbage', 'turnip']);

export class TallGrassSystem {
  constructor(tileMap) {
    this.tileMap = tileMap;
    this.swayIntensity = 1.0; // 0.0 to 2.0 (interactive rustle and wind bend)
    this.windSpeed = 1.0;
    this.speedFriction = 0.20; // 20% speed reduction in tall grass
    this.particlesEnabled = true;

    this.windTime = 0;
    this.swayingTiles = new Map();
    this.particles = [];
    this.maxParticles = 120;

    this.isPlayerInGrass = false;
    this.lastPlayerX = null;
    this.lastPlayerY = null;
    this.lastPlayerTx = null;
    this.lastPlayerTy = null;
    this.stepRustleCooldown = 0;
  }

  isTallGrassTile(tileId) {
    if (!tileId || typeof tileId !== 'string') return false;
    const id = tileId.toLowerCase();
    return id === 'tall-grass' || id === 'tallgrass';
  }

  getFoliageType(tileId) {
    if (!tileId || typeof tileId !== 'string') return null;
    const id = tileId.toLowerCase();
    for (const prefix of EXCLUDED_TERRAIN_PREFIXES) {
      if (id.startsWith(prefix)) return null;
    }
    if (id === 'tall-grass' || id === 'tallgrass') return 'tall-grass';
    if (id.startsWith('tree-')) return 'tree';
    if (id === 'bush' || id.startsWith('bush-')) return 'bush';
    if (id.startsWith('flower-') || SMALL_PLANTS.has(id)) return 'plant';
    return null;
  }

  getInteractiveFoliageAt(tx, ty) {
    const key = this.tileMap.getKey(tx, ty);
    let foundPlant = null;

    for (const layerName of ['solid', 'decor']) {
      const cell = this.tileMap.layers[layerName]?.get(key);
      if (!cell) continue;

      if (Array.isArray(cell.stack)) {
        for (let i = cell.stack.length - 1; i >= 0; i--) {
          const stId = cell.stack[i]?.tileId;
          if (this.isTallGrassTile(stId)) return { tileId: stId, type: 'tall-grass', cell };
          const fType = this.getFoliageType(stId);
          if (fType && !foundPlant) foundPlant = { tileId: stId, type: fType, cell };
        }
      }

      if (this.isTallGrassTile(cell.tileId)) return { tileId: cell.tileId, type: 'tall-grass', cell };
      const fType = this.getFoliageType(cell.tileId);
      if (fType && !foundPlant) foundPlant = { tileId: cell.tileId, type: fType, cell };
    }
    return foundPlant;
  }

  triggerSway(tileX, tileY, dirX = 1, tileId = 'tall-grass', count = 5) {
    this.swayingTiles.set(`${tileX},${tileY}`, {
      timer: 0.65,
      maxTime: 0.65,
      dir: dirX !== 0 ? Math.sign(dirX) : (Math.random() > 0.5 ? 1 : -1)
    });

    if (!this.particlesEnabled || this.particles.length >= this.maxParticles) return;

    const worldX = tileX * this.tileMap.tileSize + 32;
    const worldY = tileY * this.tileMap.tileSize + 38;
    const idLower = (tileId || '').toLowerCase();

    let colors = ['#4ade80', '#22c55e', '#86efac', '#16a34a'];
    if (idLower.includes('red') || idLower === 'tomato') colors = ['#4ade80', '#22c55e', '#f87171', '#fb7185'];
    else if (idLower.includes('blue')) colors = ['#4ade80', '#22c55e', '#60a5fa', '#93c5fd'];
    else if (idLower.includes('white')) colors = ['#4ade80', '#22c55e', '#fef08a', '#ffffff'];
    else if (idLower === 'wheat' || idLower === 'corn') colors = ['#facc15', '#eab308', '#4ade80', '#86efac'];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.4;
      const speed = 35 + Math.random() * 55;
      this.particles.push({
        x: worldX + (Math.random() - 0.5) * 34,
        y: worldY + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * speed + (dirX * 28),
        vy: Math.sin(angle) * speed - 25,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 9,
        flutterPhase: Math.random() * Math.PI * 2,
        alpha: 1.0,
        life: 0.65 + Math.random() * 0.45,
        maxLife: 1.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5.5 + Math.random() * 3.5
      });
    }
  }

  update(dtRaw, player) {
    // Convert main.js deltaTime from milliseconds (~16.6ms) to seconds (~0.0166s)
    const dt = dtRaw > 1.0 ? Math.min(0.1, dtRaw / 1000) : Math.min(0.1, Math.max(0.001, dtRaw));
    this.windTime += dt * this.windSpeed;

    for (const [key, sway] of this.swayingTiles.entries()) {
      sway.timer -= dt;
      if (sway.timer <= 0) this.swayingTiles.delete(key);
    }

    this.isPlayerInGrass = false;
    if (player && typeof player.getFeetBox === 'function') {
      const feet = player.getFeetBox();
      const centerX = feet.x + feet.w / 2;
      const centerY = feet.y + feet.h / 2;
      const tx = Math.floor(centerX / this.tileMap.tileSize);
      const ty = Math.floor(centerY / this.tileMap.tileSize);

      const movedDist = (this.lastPlayerX !== null)
        ? Math.hypot(player.x - this.lastPlayerX, player.y - this.lastPlayerY)
        : 0;
      const isMoving = Boolean(player.isMoving || movedDist > 0.4);
      const dirX = player.direction === 'west' ? -1 : (player.direction === 'east' ? 1 : ((player.x - (this.lastPlayerX ?? player.x)) >= 0 ? 1 : -1));

      const foliage = this.getInteractiveFoliageAt(tx, ty);
      if (foliage) {
        if (foliage.type === 'tall-grass') this.isPlayerInGrass = true;

        const enteredNewTile = (tx !== this.lastPlayerTx || ty !== this.lastPlayerTy);
        this.stepRustleCooldown -= dt;

        if (enteredNewTile && isMoving) {
          this.triggerSway(tx, ty, dirX, foliage.tileId, 6);
          this.stepRustleCooldown = 0.16;
        } else if (isMoving && this.stepRustleCooldown <= 0) {
          this.triggerSway(tx, ty, dirX, foliage.tileId, 3);
          this.stepRustleCooldown = 0.18;
        }
      }

      if (isMoving && this.stepRustleCooldown <= 0) {
        for (const [nx, ny] of [[tx - 1, ty], [tx + 1, ty], [tx, ty - 1], [tx, ty + 1]]) {
          const nFoliage = this.getInteractiveFoliageAt(nx, ny);
          if (nFoliage && (nFoliage.type === 'bush' || nFoliage.type === 'tall-grass')) {
            if (Math.hypot(centerX - (nx * 64 + 32), centerY - (ny * 64 + 32)) < 46) {
              this.triggerSway(nx, ny, dirX, nFoliage.tileId, 2);
              this.stepRustleCooldown = 0.22;
              break;
            }
          }
        }
      }

      this.lastPlayerX = player.x;
      this.lastPlayerY = player.y;
      this.lastPlayerTx = tx;
      this.lastPlayerTy = ty;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.flutterPhase += dt * 7;
      p.x += (p.vx + Math.sin(p.flutterPhase) * 22 + 12 * this.swayIntensity) * dt;
      p.y += p.vy * dt;
      p.vy += 85 * dt;
      p.rot += p.vrot * dt;
      p.alpha = Math.min(1, (p.life / p.maxLife) * 1.4);
    }
  }

  getFoliageTransform(tileId, tx, ty) {
    if (this.swayIntensity <= 0.01) return null;
    const type = this.getFoliageType(tileId);
    if (!type) return null;

    const phase = this.windTime * 2.4 + (tx * 0.85) + (ty * 0.55);
    const gust = 0.75 + 0.35 * Math.sin(this.windTime * 0.9 + tx * 0.2);

    let shearX = 0;
    let scaleY = 1.0;

    if (type === 'tree') {
      const treeWave = Math.sin(this.windTime * 1.85 + tx * 0.7 + ty * 0.5) * gust;
      shearX = treeWave * 0.055 * this.swayIntensity;
      scaleY = 1.0 + Math.cos(this.windTime * 3.7 + tx) * 0.012 * this.swayIntensity;
    } else if (type === 'bush') {
      const bushWave = Math.sin(phase * 1.15) * gust;
      shearX = bushWave * 0.085 * this.swayIntensity;
      scaleY = 1.0 - Math.abs(bushWave) * 0.025 * this.swayIntensity;
    } else if (type === 'tall-grass') {
      const grassWave = Math.sin(phase * 1.3) * gust;
      shearX = grassWave * 0.12 * this.swayIntensity;
      scaleY = 1.0 - Math.abs(grassWave) * 0.03 * this.swayIntensity;
    } else {
      const plantWave = Math.sin(phase * 1.25) * gust;
      shearX = plantWave * 0.095 * this.swayIntensity;
      scaleY = 1.0 - Math.abs(plantWave) * 0.02 * this.swayIntensity;
    }

    const sway = this.swayingTiles.get(`${tx},${ty}`);
    if (sway) {
      const t = sway.timer / sway.maxTime;
      const spring = Math.sin((1 - t) * Math.PI * 5) * t;
      shearX += spring * 0.26 * sway.dir * Math.max(0.5, this.swayIntensity);
      scaleY -= Math.abs(spring) * 0.10 * Math.max(0.5, this.swayIntensity);
    }

    return { shearX, scaleY };
  }

  getSpeedMultiplier() {
    return this.isPlayerInGrass ? Math.max(0.4, 1.0 - this.speedFriction) : 1.0;
  }

  renderSubmersionOverlay(ctx, player, assetLoader) {
    if (!this.isPlayerInGrass || !player || !assetLoader) return;
    const feet = player.getFeetBox();
    const tx = Math.floor((feet.x + feet.w / 2) / this.tileMap.tileSize);
    const ty = Math.floor((feet.y + feet.h / 2) / this.tileMap.tileSize);

    const foliage = this.getInteractiveFoliageAt(tx, ty);
    if (!foliage || foliage.type !== 'tall-grass') return;

    const tileMeta = assetLoader.getTileMetadata(foliage.tileId);
    const img = assetLoader.getImage(tileMeta?.src || foliage.tileId);
    if (!img) return;

    const tileDestX = tx * this.tileMap.tileSize;
    const tileDestY = ty * this.tileMap.tileSize;
    const grassW = img.width || 64;
    const grassH = img.height || 64;
    const sliceRatio = 0.62;
    const tf = this.getFoliageTransform(foliage.tileId, tx, ty);

    ctx.save();
    ctx.translate(tileDestX + 32, tileDestY + 64);
    if (tf) ctx.transform(1, 0, tf.shearX, tf.scaleY, 0, 0);
    ctx.drawImage(img, 0, 0, grassW, grassH * sliceRatio, -32, -64, 64, 64 * sliceRatio);
    ctx.restore();
  }

  renderParticles(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(20, 83, 45, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.65, 0);
      ctx.lineTo(p.size * 0.65, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
