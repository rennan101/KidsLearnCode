// Geralt Player Entity with solid collider collision detection and continuous 8-directional movement

export class Player {
  constructor(x = 320, y = 320) {
    this.x = x;
    this.y = y;
    this.speed = 220; // Movement speed in pixels per second
    this.width = 64;
    this.height = 64;
    this.scale = 1.0; // Dynamic character size multiplier

    // Movement state
    this.isMoving = false;
    this.direction = 'south'; // south, south-east, east, north-east, north, north-west, west, south-west

    // Feet collision box (relative to player tile origin px, py)
    this.collider = {
      offsetX: 20,
      offsetY: 50,
      width: 24,
      height: 14
    };

    // Smooth movement input keys
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false
    };

    // Animation frame timing
    this.animTimer = 0;
  }

  syncCollider(assetLoader) {
    if (!assetLoader) return;
    const meta = assetLoader.getTileMetadata('character-geralt');
    if (meta) {
      if (meta.scale !== undefined) {
        this.scale = meta.scale;
      }
      if (meta.collider) {
        this.collider.offsetX = meta.collider.x ?? 20;
        this.collider.offsetY = meta.collider.y ?? 50;
        this.collider.width = meta.collider.w ?? 24;
        this.collider.height = meta.collider.h ?? 14;
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
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    this.isMoving = false;
  }

  handleKeyDown(key) {
    if (!key) return;
    const k = (typeof key === 'string' ? key : key.key || '').toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) {
      this.keys[k] = true;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = true; this.keys['w'] = true; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = true; this.keys['a'] = true; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = true; this.keys['s'] = true; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = true; this.keys['d'] = true; }
  }

  handleKeyUp(key) {
    if (!key) return;
    const k = (typeof key === 'string' ? key : key.key || '').toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) {
      this.keys[k] = false;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = false; this.keys['w'] = false; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = false; this.keys['a'] = false; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = false; this.keys['s'] = false; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = false; this.keys['d'] = false; }
  }

  getFeetBox(px = this.x, py = this.y) {
    const s = this.scale || 1.0;
    const colW = (this.collider.width || 24) * s;
    const colH = (this.collider.height || 14) * s;
    return {
      x: px + 32 - (colW / 2),
      y: py + 64 - colH,
      w: colW,
      h: colH
    };
  }

  update(deltaTime, tileMap, assetLoader) {
    const dt = Math.min(deltaTime / 1000, 0.1); // Clamp large delta drops

    let vx = 0;
    let vy = 0;

    const up = this.keys.w || this.keys.ArrowUp;
    const down = this.keys.s || this.keys.ArrowDown;
    const left = this.keys.a || this.keys.ArrowLeft;
    const right = this.keys.d || this.keys.ArrowRight;

    if (up) vy -= 1;
    if (down) vy += 1;
    if (left) vx -= 1;
    if (right) vx += 1;

    if (vx !== 0 || vy !== 0) {
      // Normalize diagonal speed vector so diagonal movement isn't faster
      if (vx !== 0 && vy !== 0) {
        const invSqrt2 = 0.70710678;
        vx *= invSqrt2;
        vy *= invSqrt2;
      }

      this.updateDirection(vx, vy);
      this.isMoving = true;

      const moveDistX = vx * this.speed * dt;
      const moveDistY = vy * this.speed * dt;

      const nextX = this.x + moveDistX;
      const nextY = this.y + moveDistY;

      // 1. Try full movement
      if (!this.checkCollision(nextX, nextY, tileMap, assetLoader)) {
        this.x = nextX;
        this.y = nextY;
      } else {
        // 2. Wall sliding: try X-only movement
        if (moveDistX !== 0 && !this.checkCollision(nextX, this.y, tileMap, assetLoader)) {
          this.x = nextX;
        }
        // 3. Wall sliding: try Y-only movement
        if (moveDistY !== 0 && !this.checkCollision(this.x, nextY, tileMap, assetLoader)) {
          this.y = nextY;
        }
      }
    } else {
      this.isMoving = false;
    }
  }

  checkCollision(testPlayerX, testPlayerY, tileMap, assetLoader) {
    if (!tileMap || !assetLoader) return false;

    const feet = this.getFeetBox(testPlayerX, testPlayerY);
    const tileSize = tileMap.tileSize;

    // Query all surrounding tiles (search range covering multi-tile structures)
    const padding = 5;
    const startTileX = Math.floor((feet.x) / tileSize) - padding;
    const endTileX = Math.ceil((feet.x + feet.w) / tileSize) + padding;
    const startTileY = Math.floor((feet.y) / tileSize) - padding;
    const endTileY = Math.ceil((feet.y + feet.h) / tileSize) + padding;

    const layersToCheck = tileMap.layerOrder || ['characters', 'solid', 'decor', 'ground'];

    for (const layerName of layersToCheck) {
      const layer = tileMap.layers[layerName];
      if (!layer) continue;

      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          const cell = layer.get(tileMap.getKey(tx, ty));
          if (!cell) continue;

          // Check collider on root cell
          if (cell.isRoot === false) continue;

          const meta = assetLoader.getTileMetadata(cell.tileId);
          const col = cell.collider || meta?.collider;
          if (!col || !col.enabled) continue;

          const rotation = cell.rotation || 0;
          const totalW = (meta.gridW || 1) * tileSize;
          const totalH = (meta.gridH || 1) * tileSize;

          // Helper to test a single rotated AABB box
          const testBoxCollision = (bX, bY, bW, bH) => {
            let relX = bX;
            let relY = bY;
            let boxW = bW;
            let boxH = bH;

            if (rotation === 90) {
              relX = totalH - (bY + bH);
              relY = bX;
              boxW = bH;
              boxH = bW;
            } else if (rotation === 180) {
              relX = totalW - (bX + bW);
              relY = totalH - (bY + bH);
            } else if (rotation === 270) {
              relX = bY;
              relY = totalW - (bX + bW);
              boxW = bH;
              boxH = bW;
            }

            const worldBoxX = tx * tileSize + relX;
            const worldBoxY = ty * tileSize + relY;

            return (
              feet.x < worldBoxX + boxW &&
              feet.x + feet.w > worldBoxX &&
              feet.y < worldBoxY + boxH &&
              feet.y + feet.h > worldBoxY
            );
          };

          if (Array.isArray(col.boxes) && col.boxes.length > 0) {
            for (const subBox of col.boxes) {
              if (testBoxCollision(subBox.x || 0, subBox.y || 0, subBox.w || tileSize, subBox.h || tileSize)) {
                return true;
              }
            }
          } else {
            const rawW = col.w || totalW;
            const rawH = col.h || totalH;
            const rawX = col.x || 0;
            const rawY = col.y || 0;
            if (testBoxCollision(rawX, rawY, rawW, rawH)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  updateDirection(vx, vy) {
    const angle = Math.atan2(vy, vx) * (180 / Math.PI); // -180 to 180

    // 8-way directional sector mapping
    if (angle >= -22.5 && angle < 22.5) {
      this.direction = 'east';
    } else if (angle >= 22.5 && angle < 67.5) {
      this.direction = 'south-east';
    } else if (angle >= 67.5 && angle < 112.5) {
      this.direction = 'south';
    } else if (angle >= 112.5 && angle < 157.5) {
      this.direction = 'south-west';
    } else if (angle >= 157.5 || angle < -157.5) {
      this.direction = 'west';
    } else if (angle >= -157.5 && angle < -112.5) {
      this.direction = 'north-west';
    } else if (angle >= -112.5 && angle < -67.5) {
      this.direction = 'north';
    } else if (angle >= -67.5 && angle < -22.5) {
      this.direction = 'north-east';
    }
  }

  render(ctx, assetLoader, showColliders = false) {
    if (!assetLoader) return;
    if (this.x === undefined || isNaN(this.x)) this.x = 320;
    if (this.y === undefined || isNaN(this.y)) this.y = 320;
    const s = (!this.scale || isNaN(this.scale)) ? 1.0 : this.scale;
    const dir = this.direction || 'south';
    const animFolder = this.isMoving ? 'running' : 'Idle';

    let sprite = assetLoader.getImage(`Geralt/${animFolder}/rotations/${dir}.png`);
    if (!sprite) {
      sprite = assetLoader.getImage(`Geralt/Idle/rotations/${dir}.png`);
    }
    if (!sprite) {
      sprite = assetLoader.getImage('Geralt/Idle/rotations/south.png');
    }
    if (!sprite) {
      for (const d of ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']) {
        sprite = assetLoader.getImage(`Geralt/Idle/rotations/${d}.png`);
        if (sprite) break;
      }
    }

    const renderW = this.width * s;
    const renderH = this.height * s;

    // In Geralt's 64x64 frame, feet contact is at local Y=60 and horizontal center is at X=32
    // We anchor the feet exactly to the grid cell base (this.y + 64) and horizontal center (this.x + 32)
    const footLocalX = 32;
    const footLocalY = 60;
    const drawX = Math.round((this.x + 32) - (footLocalX * s));
    const drawY = Math.round((this.y + 64) - (footLocalY * s));

    // Draw shadow under Geralt's feet (centered at base of the grid cell)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x + 32), Math.round(this.y + 64 - 2), Math.round(14 * s), Math.round(5 * s), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (sprite) {
      // Render Geralt sprite
      ctx.drawImage(sprite, drawX, drawY, renderW, renderH);
    } else {
      // Fallback box if sprite is still loading
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(drawX, drawY, renderW, renderH);
      ctx.restore();
    }

    // Render player feet collider if overlay is active
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
