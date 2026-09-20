// Hero Player Entity with 4-Way Movement, Sprint (Shift), Crafting and Mount Support

import { PLAYABLE_HEROES } from './CharacterRegistry.js';

export class Player {
  constructor(x = 320, y = 320, heroId = 'char_wolf_hunter_m') {
    this.x = x;
    this.y = y;
    this.baseSpeed = 200; // Normal walk speed in px/s
    this.sprintSpeed = 320; // Sprint speed (+60%) with Shift
    this.speed = this.baseSpeed;
    this.width = 64;
    this.height = 64;
    this.scale = 1.0;

    // Character identity
    this.heroId = heroId;
    this.heroData = PLAYABLE_HEROES.find(h => h.id === heroId) || PLAYABLE_HEROES[0];

    // Movement & Animation States
    this.isMoving = false;
    this.isSprinting = false;
    this.isCrafting = false;
    this.isMounted = false;
    this.direction = 'south'; // 4-way: 'south', 'east', 'north', 'west'

    // Crafting timer & cloud poof effect
    this.craftTimer = 0;
    this.poofParticles = [];

    // Feet collision box (relative to player tile origin px, py)
    this.collider = {
      offsetX: 18,
      offsetY: 48,
      width: 28,
      height: 16
    };

    // Smooth movement input keys
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      Shift: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false
    };

    // Animation frame timing
    this.animTimer = 0;
    this.currentFrame = 0;
  }

  setHero(heroId) {
    const found = PLAYABLE_HEROES.find(h => h.id === heroId);
    if (found) {
      this.heroId = heroId;
      this.heroData = found;
    }
  }

  setCrafting(active = true) {
    this.isCrafting = active;
    if (active) {
      this.isMoving = false;
      this.craftTimer = 0;
      this.spawnCraftPoof();
    }
  }

  spawnCraftPoof() {
    this.poofParticles = [];
    for (let i = 0; i < 6; i++) {
      this.poofParticles.push({
        x: (Math.random() - 0.5) * 30,
        y: -15 + (Math.random() - 0.5) * 20,
        r: 8 + Math.random() * 8,
        alpha: 0.9,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4
      });
    }
  }

  syncCollider(assetLoader) {
    if (!assetLoader) return;
    const meta = assetLoader.getTileMetadata(this.heroId) || assetLoader.getTileMetadata('character-geralt');
    if (meta) {
      if (meta.scale !== undefined) this.scale = meta.scale;
      if (meta.collider) {
        this.collider.offsetX = meta.collider.x ?? 18;
        this.collider.offsetY = meta.collider.y ?? 48;
        this.collider.width = meta.collider.w ?? 28;
        this.collider.height = meta.collider.h ?? 16;
      }
    }
  }

  setScale(scale) {
    this.scale = Math.max(0.2, Math.min(5.0, scale));
  }

  setSpawn(x, y) {
    this.x = x;
    this.y = y;
    this.isMoving = false;
    this.isCrafting = false;
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    this.isMoving = false;
    this.isSprinting = false;
  }

  handleKeyDown(key) {
    if (!key) return;
    const k = (typeof key === 'string' ? key : key.key || '').toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) this.keys[k] = true;
    if (k === 'shift' || key === 'Shift') {
      this.keys['Shift'] = true;
      this.isSprinting = true;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = true; this.keys['w'] = true; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = true; this.keys['a'] = true; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = true; this.keys['s'] = true; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = true; this.keys['d'] = true; }
  }

  handleKeyUp(key) {
    if (!key) return;
    const k = (typeof key === 'string' ? key : key.key || '').toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) this.keys[k] = false;
    if (k === 'shift' || key === 'Shift') {
      this.keys['Shift'] = false;
      this.isSprinting = false;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = false; this.keys['w'] = false; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = false; this.keys['a'] = false; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = false; this.keys['s'] = false; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = false; this.keys['d'] = false; }
  }

  getFeetBox(px = this.x, py = this.y) {
    const s = this.scale || 1.0;
    const colW = (this.collider.width || 28) * s;
    const colH = (this.collider.height || 16) * s;
    return {
      x: px + 32 - (colW / 2),
      y: py + 64 - colH,
      w: colW,
      h: colH
    };
  }

  update(deltaTime, tileMap, assetLoader) {
    const dt = Math.min(deltaTime / 1000, 0.1);
    this.animTimer += dt;

    // Se estiver craftando, atualiza as partículas de poof de construção
    if (this.isCrafting) {
      this.craftTimer += dt;
      for (const p of this.poofParticles) {
        p.life += dt;
        p.y -= 12 * dt;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      }
      if (this.craftTimer > 0.6) {
        this.spawnCraftPoof();
        this.craftTimer = 0;
      }
      return;
    }

    let vx = 0;
    let vy = 0;

    const up = this.keys.w || this.keys.ArrowUp;
    const down = this.keys.s || this.keys.ArrowDown;
    const left = this.keys.a || this.keys.ArrowLeft;
    const right = this.keys.d || this.keys.ArrowRight;
    this.isSprinting = !!this.keys.Shift;
    this.speed = this.isSprinting ? this.sprintSpeed : this.baseSpeed;

    if (up) vy -= 1;
    if (down) vy += 1;
    if (left) vx -= 1;
    if (right) vx += 1;

    if (vx !== 0 || vy !== 0) {
      if (vx !== 0 && vy !== 0) {
        const invSqrt2 = 0.70710678;
        vx *= invSqrt2;
        vy *= invSqrt2;
      }

      this.update4WayDirection(vx, vy);
      this.isMoving = true;

      const moveDistX = vx * this.speed * dt;
      const moveDistY = vy * this.speed * dt;

      const nextX = this.x + moveDistX;
      const nextY = this.y + moveDistY;

      // 1. Movimento completo
      if (!this.checkCollision(nextX, nextY, tileMap, assetLoader)) {
        this.x = nextX;
        this.y = nextY;
      } else {
        // 2. Deslizamento de parede X
        if (moveDistX !== 0 && !this.checkCollision(nextX, this.y, tileMap, assetLoader)) {
          this.x = nextX;
        }
        // 3. Deslizamento de parede Y
        if (moveDistY !== 0 && !this.checkCollision(this.x, nextY, tileMap, assetLoader)) {
          this.y = nextY;
        }
      }
    } else {
      this.isMoving = false;
    }
  }

  update4WayDirection(vx, vy) {
    // Prioriza a direção cardinal mais dominante
    if (Math.abs(vy) > Math.abs(vx)) {
      this.direction = vy > 0 ? 'south' : 'north';
    } else if (Math.abs(vx) > 0) {
      this.direction = vx > 0 ? 'east' : 'west';
    }
  }

  checkCollision(testPlayerX, testPlayerY, tileMap, assetLoader) {
    if (!tileMap || !assetLoader) return false;

    const feet = this.getFeetBox(testPlayerX, testPlayerY);
    const tileSize = tileMap.tileSize;

    const padding = 5;
    const startTileX = Math.floor(feet.x / tileSize) - padding;
    const endTileX = Math.ceil((feet.x + feet.w) / tileSize) + padding;
    const startTileY = Math.floor(feet.y / tileSize) - padding;
    const endTileY = Math.ceil((feet.y + feet.h) / tileSize) + padding;

    const layersToCheck = tileMap.layerOrder || ['characters', 'solid', 'decor', 'ground'];

    for (const layerName of layersToCheck) {
      const layer = tileMap.layers[layerName];
      if (!layer) continue;

      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          const cell = layer.get(tileMap.getKey(tx, ty));
          if (!cell || cell.isRoot === false) continue;

          const meta = assetLoader.getTileMetadata(cell.tileId);
          const col = cell.collider || meta?.collider;
          if (!col || !col.enabled) continue;

          const rotation = cell.rotation || 0;
          const totalW = (meta.gridW || 1) * tileSize;
          const totalH = (meta.gridH || 1) * tileSize;

          let relX = col.x || 0;
          let relY = col.y || 0;
          let boxW = col.w || tileSize;
          let boxH = col.h || tileSize;

          if (rotation === 90) {
            relX = totalH - (col.y + col.h);
            relY = col.x;
            boxW = col.h;
            boxH = col.w;
          } else if (rotation === 180) {
            relX = totalW - (col.x + col.w);
            relY = totalH - (col.y + col.h);
          } else if (rotation === 270) {
            relX = col.y;
            relY = totalW - (col.x + col.w);
            boxW = col.h;
            boxH = col.w;
          }

          const worldBoxX = tx * tileSize + relX;
          const worldBoxY = ty * tileSize + relY;

          if (
            feet.x < worldBoxX + boxW &&
            feet.x + feet.w > worldBoxX &&
            feet.y < worldBoxY + boxH &&
            feet.y + feet.h > worldBoxY
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  render(ctx, assetLoader, showColliders = false) {
    if (!assetLoader) return;
    if (this.x === undefined || isNaN(this.x)) this.x = 320;
    if (this.y === undefined || isNaN(this.y)) this.y = 320;
    const s = (!this.scale || isNaN(this.scale)) ? 1.0 : this.scale;
    const dir = this.direction || 'south';

    const renderW = this.width * s;
    const renderH = this.height * s;
    const drawX = Math.round(this.x);
    const drawY = Math.round(this.y);

    // 1. Sombra circular nos pés
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 32 * s), Math.round(this.y + 60 * s), Math.round(16 * s), Math.round(6 * s), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Determina o frame recortado transparente da pasta frames
    // Mapeamento de linhas: south=0, east=1, north=2, west=3
    const rowMap = { south: 0, east: 1, north: 2, west: 3 };
    const row = rowMap[dir] ?? 0;
    let col = 0;

    if (this.isCrafting) {
      col = 7; // Coluna de Crafting (em pé movendo os braços)
    } else if (this.isSprinting && this.isMoving) {
      col = 5 + (Math.floor(this.animTimer * 12) % 2); // Run cols 5, 6
    } else if (this.isMoving) {
      col = 2 + (Math.floor(this.animTimer * 8) % 3); // Walk cols 2, 3, 4
    } else {
      col = Math.floor(this.animTimer * 3) % 2; // Idle cols 0, 1
    }

    const frameUrl = `assets/characters/${this.heroId}/frames/wolf_hunter_r${row}_c${col}.png`;
    let sprite = assetLoader.getImage(frameUrl) || assetLoader.getImage(`assets/characters/${this.heroId}/portrait.jpg`);

    if (sprite) {
      ctx.drawImage(sprite, drawX, drawY, renderW, renderH);
    } else {
      // Fallback
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.fillRect(drawX, drawY, renderW, renderH);
      ctx.restore();
    }

    // 3. Efeito de Nuvem Poof de Construção no Workbench estilo Animal Crossing
    if (this.isCrafting && this.poofParticles.length > 0) {
      ctx.save();
      for (const p of this.poofParticles) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.strokeStyle = `rgba(229, 216, 184, ${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 32 * s + p.x, this.y + 20 * s + p.y, p.r * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Colisor se ativado
    if (showColliders) {
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      const feet = this.getFeetBox();
      ctx.fillRect(feet.x, feet.y, feet.w, feet.h);
      ctx.strokeRect(feet.x, feet.y, feet.w, feet.h);
      ctx.restore();
    }
  }
}
