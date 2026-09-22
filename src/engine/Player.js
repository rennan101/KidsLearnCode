// Hero Player Entity with 4-Way Movement, Sprint (Shift), Crafting and Mount Support

import { PLAYABLE_HEROES } from './CharacterRegistry.js';
import { ModularAvatarRenderer } from './animation/ModularAvatarRenderer.js';
import { DEFAULT_AVATAR_CONFIG } from './animation/AvatarConfig.js';

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

    // Modular Cutout Avatar support
    this.modularAvatarRenderer = new ModularAvatarRenderer();
    this.customAvatarConfig = null;

    // Character identity
    this.heroId = heroId;
    this.heroData = PLAYABLE_HEROES.find(h => h.id === heroId) || PLAYABLE_HEROES[0];
    this.dragonManager = null;

    // Movement & Animation States
    this.isMoving = false;
    this.isSprinting = false;
    this.isCrafting = false;
    this.isMounted = false;
    this.isDialogueActive = false;
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

    // Smooth movement input keys (WASD / Arrows / Flight Q/E)
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      q: false,
      e: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false
    };

    // Strict 4-way direction stack (most recent active cardinal direction has priority, no diagonal)
    this.moveStack = [];

    // Animation frame timing
    this.animTimer = 0;
    this.currentFrame = 0;
  }

  setHero(heroId) {
    if (heroId === 'custom_avatar') {
      this.heroId = 'custom_avatar';
      this.heroData = {
        id: 'custom_avatar',
        name: this.customAvatarConfig?.name || 'Aventureiro',
        species: 'human',
        gender: this.customAvatarConfig?.gender || 'neutral',
        archetype: 'adventurer',
        passive: { id: 'creative_spirit', name: 'Espírito Criativo', desc: 'Avatar exclusivo com animação procedural por recorte 2D.' }
      };
      return;
    }

    const found = PLAYABLE_HEROES.find(h => h.id === heroId);
    if (found) {
      this.heroId = heroId;
      this.heroData = found;
    }
  }

  setCustomAvatar(config) {
    if (!config) return;
    this.customAvatarConfig = { ...DEFAULT_AVATAR_CONFIG, ...config };
    this.setHero('custom_avatar');
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
    this.moveStack = [];
    this.isMoving = false;
    this.isSprinting = false;
  }

  getCardinalDirection(k) {
    if (k === 'w' || k === 'arrowup') return 'north';
    if (k === 's' || k === 'arrowdown') return 'south';
    if (k === 'a' || k === 'arrowleft') return 'west';
    if (k === 'd' || k === 'arrowright') return 'east';
    return null;
  }

  handleKeyDown(key) {
    if (!key) return;
    const raw = (typeof key === 'string' ? key : key.key || '');
    const k = raw.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) this.keys[k] = true;
    if (raw === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = true; this.keys['w'] = true; }
    if (raw === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = true; this.keys['a'] = true; }
    if (raw === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = true; this.keys['s'] = true; }
    if (raw === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = true; this.keys['d'] = true; }

    const dir = this.getCardinalDirection(k);
    if (dir) {
      const idx = this.moveStack.indexOf(dir);
      if (idx !== -1) this.moveStack.splice(idx, 1);
      this.moveStack.push(dir);
    }
  }

  handleKeyUp(key) {
    if (!key) return;
    const raw = (typeof key === 'string' ? key : key.key || '');
    const k = raw.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) this.keys[k] = false;
    if (raw === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = false; this.keys['w'] = false; }
    if (raw === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = false; this.keys['a'] = false; }
    if (raw === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = false; this.keys['s'] = false; }
    if (raw === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = false; this.keys['d'] = false; }

    const dir = this.getCardinalDirection(k);
    if (dir) {
      let stillHeld = false;
      if (dir === 'north' && (this.keys.w || this.keys.ArrowUp)) stillHeld = true;
      if (dir === 'south' && (this.keys.s || this.keys.ArrowDown)) stillHeld = true;
      if (dir === 'west' && (this.keys.a || this.keys.ArrowLeft)) stillHeld = true;
      if (dir === 'east' && (this.keys.d || this.keys.ArrowRight)) stillHeld = true;

      if (!stillHeld) {
        const idx = this.moveStack.indexOf(dir);
        if (idx !== -1) this.moveStack.splice(idx, 1);
      }
    }
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

    // Se estiver em diálogo com NPC, trava o movimento imediatamente
    if (this.isDialogueActive) {
      this.isMoving = false;
      this.moveStack = [];
      return;
    }

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

    // Sistema de Velocidade Dinâmica Conforme Montaria & Terreno (Água vs Terra vs Voo)
    const activeDragon = this.dragonManager?.getActiveDragon();
    const isMounted = this.isMounted && !!activeDragon;
    this.isSprinting = isMounted;

    if (isMounted) {
      const category = activeDragon.category;
      const flightAlt = this.dragonManager.flightAltitude || 0;
      const onWater = tileMap ? tileMap.isWaterAt(this.x + 32, this.y + 56, assetLoader) : false;

      let speedMult = activeDragon.mountSpeedMultiplier || 1.8;

      if (category === 'water') {
        // Dragão aquático: rápido e ágil na água (2.0x), mas lento na terra (0.72x) e sem poder voar
        speedMult = onWater ? 2.0 : 0.72;
      } else if (category === 'fly') {
        // Dragão voador: ágil em voo (2.0x), mas lento na terra quando pousado (0.75x) e não nada
        speedMult = flightAlt > 10 ? 2.0 : 0.75;
      } else if (category === 'land') {
        // Dragão terrestre: ágil e robusto na terra (1.75x), não nada e não voa
        speedMult = 1.75;
      } else if (category === 'mythic') {
        // Dragão mítico (Astra): supremo em todos os terrenos e no ar (2.1x)
        speedMult = 2.1;
      }

      this.speed = this.baseSpeed * speedMult;
    } else {
      this.speed = this.baseSpeed;
    }

    // Limpa direções que não estão mais pressionadas
    this.moveStack = this.moveStack.filter(dir => {
      if (dir === 'north') return this.keys.w || this.keys.ArrowUp;
      if (dir === 'south') return this.keys.s || this.keys.ArrowDown;
      if (dir === 'west') return this.keys.a || this.keys.ArrowLeft;
      if (dir === 'east') return this.keys.d || this.keys.ArrowRight;
      return false;
    });

    let activeDir = null;
    if (this.moveStack.length > 0) {
      activeDir = this.moveStack[this.moveStack.length - 1];
    }

    let vx = 0;
    let vy = 0;

    // Movimento estritamente 4-Way (NUNCA diagonal)
    if (activeDir === 'north') {
      vy = -1;
      this.direction = 'north';
    } else if (activeDir === 'south') {
      vy = 1;
      this.direction = 'south';
    } else if (activeDir === 'west') {
      vx = -1;
      this.direction = 'west';
    } else if (activeDir === 'east') {
      vx = 1;
      this.direction = 'east';
    }

    if (vx !== 0 || vy !== 0) {
      this.isMoving = true;

      const moveDistX = vx * this.speed * dt;
      const moveDistY = vy * this.speed * dt;

      const nextX = this.x + moveDistX;
      const nextY = this.y + moveDistY;

      // Movimento 4-way direto com teste de colisão
      if (!this.checkCollision(nextX, nextY, tileMap, assetLoader)) {
        this.x = nextX;
        this.y = nextY;
      }
    } else {
      this.isMoving = false;
    }
  }

  checkCollision(testPlayerX, testPlayerY, tileMap, assetLoader) {
    if (!tileMap || !assetLoader) return false;

    const activeDragon = this.dragonManager?.getActiveDragon();
    const isMounted = this.isMounted && !!activeDragon;
    const isMountedFly = isMounted && this.dragonManager?.canActiveDragonFly();
    const isMountedWater = isMounted && (activeDragon.category === 'water' || activeDragon.category === 'mythic');
    const flightAlt = isMountedFly ? (this.dragonManager.flightAltitude || 0) : 0;

    // Se voo alto (>= 60), sobrevoa todos os colisores de terreno e obstáculos do mapa (montanhas, rochas, árvores)
    if (flightAlt >= 60) {
      return false;
    }

    const feet = this.getFeetBox(testPlayerX, testPlayerY);
    const tileSize = tileMap.tileSize;

    const padding = 4;
    const startTileX = Math.floor(feet.x / tileSize) - padding;
    const endTileX = Math.ceil((feet.x + feet.w) / tileSize) + padding;
    const startTileY = Math.floor(feet.y / tileSize) - padding;
    const endTileY = Math.ceil((feet.y + feet.h) / tileSize) + padding;

    // Determina camadas a checar conforme a altitude de voo
    let layersToCheck = ['colliders', 'solid', 'characters', 'decor', 'ground', 'overhead'];
    if (flightAlt >= 30) {
      // Voo médio: sobrevoa montanhas, sólidos terrestres, construções e árvores
      layersToCheck = ['colliders'];
    } else if (flightAlt >= 15) {
      // Voo rasante: sobrevoa água e arbustos (ground e decor)
      layersToCheck = ['colliders', 'solid', 'characters'];
    }

    for (const layerName of layersToCheck) {
      const layer = tileMap.layers[layerName];
      if (!layer || layer.size === 0) continue;

      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          const cell = layer.get(tileMap.getKey(tx, ty));
          if (!cell) continue;

          // Se montado em dragão aquático, ignora colisores e tiles de água para nadar livremente
          if (isMountedWater) {
            const isWaterTile = cell.tileId === 'water-animated' || 
              (cell.tileId && (cell.tileId.includes('water') || cell.tileId.includes('ocean') || cell.tileId.includes('river')));
            const isCellOnWater = tileMap.isWaterAt(tx * tileSize + 32, ty * tileSize + 32, assetLoader);
            if (isWaterTile || isCellOnWater) {
              continue; // Dragão aquático ignora colisão na água
            }
          }

          const isInvisibleCollider = (cell.tileId && cell.tileId.startsWith('invisible-collider')) || (cell.tileId && cell.tileId.includes('invisible'));
          if (cell.isRoot === false && !isInvisibleCollider) continue;

          const meta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;
          let col = cell.collider || meta?.collider;

          // Fallback robusto garantido para qualquer variante de colisor invisível
          if (isInvisibleCollider && (!col || !col.enabled)) {
            if (cell.tileId === 'invisible-collider-top') col = { enabled: true, x: 0, y: 0, w: 64, h: 20 };
            else if (cell.tileId === 'invisible-collider-bottom') col = { enabled: true, x: 0, y: 44, w: 64, h: 20 };
            else if (cell.tileId === 'invisible-collider-left') col = { enabled: true, x: 0, y: 0, w: 20, h: 64 };
            else if (cell.tileId === 'invisible-collider-right') col = { enabled: true, x: 44, y: 0, w: 20, h: 64 };
            else if (cell.tileId === 'invisible-collider-corner-tl') col = { enabled: true, x: 0, y: 0, w: 64, h: 20, boxes: [{ x: 0, y: 0, w: 64, h: 20 }, { x: 0, y: 20, w: 20, h: 44 }] };
            else if (cell.tileId === 'invisible-collider-corner-tr') col = { enabled: true, x: 0, y: 0, w: 64, h: 20, boxes: [{ x: 0, y: 0, w: 64, h: 20 }, { x: 44, y: 20, w: 20, h: 44 }] };
            else if (cell.tileId === 'invisible-collider-corner-bl') col = { enabled: true, x: 0, y: 44, w: 64, h: 20, boxes: [{ x: 0, y: 44, w: 64, h: 20 }, { x: 0, y: 0, w: 20, h: 44 }] };
            else if (cell.tileId === 'invisible-collider-corner-br') col = { enabled: true, x: 0, y: 44, w: 64, h: 20, boxes: [{ x: 0, y: 44, w: 64, h: 20 }, { x: 44, y: 0, w: 20, h: 44 }] };
            else if (cell.tileId === 'invisible-collider-2x2') col = { enabled: true, x: 0, y: 0, w: 128, h: 128 };
            else col = { enabled: true, x: 0, y: 0, w: 64, h: 64 };
          }

          if (!col || !col.enabled) continue;

          const rotation = cell.rotation || 0;
          const isRotated90or270 = (rotation === 90 || rotation === 270);
          const baseGridW = meta.gridW || 1;
          const baseGridH = meta.gridH || 1;
          const totalW = (isRotated90or270 ? baseGridH : baseGridW) * tileSize;
          const totalH = (isRotated90or270 ? baseGridW : baseGridH) * tileSize;

          const boxesToTest = (Array.isArray(col.boxes) && col.boxes.length > 0)
            ? col.boxes
            : [{ x: col.x || 0, y: col.y || 0, w: col.w || tileSize, h: col.h || tileSize }];

          for (const b of boxesToTest) {
            let relX = b.x || 0;
            let relY = b.y || 0;
            let boxW = b.w || tileSize;
            let boxH = b.h || tileSize;

            if (rotation === 90) {
              relX = totalH - ((b.y || 0) + (b.h || tileSize));
              relY = b.x || 0;
              boxW = b.h || tileSize;
              boxH = b.w || tileSize;
            } else if (rotation === 180) {
              relX = totalW - ((b.x || 0) + (b.w || tileSize));
              relY = totalH - ((b.y || 0) + (b.h || tileSize));
            } else if (rotation === 270) {
              relX = b.y || 0;
              relY = totalW - ((b.x || 0) + (b.w || tileSize));
              boxW = b.h || tileSize;
              boxH = b.w || tileSize;
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

    const alt = (this.isMounted && this.dragonManager) ? (this.dragonManager.flightAltitude || 0) : 0;
    const bounce = (this.isMounted && this.dragonManager) ? Math.sin(this.dragonManager.floatTimer * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4) : 0;
    const drawX = Math.round(this.x);
    const drawY = Math.round(this.y + bounce - alt);

    // 1. Sombra circular nos pés (omitida quando montado no dragão para ter SOMBRA ÚNICA unificada no chão renderizada pelo DragonManager)
    if (!this.isMounted && this.heroId !== 'custom_avatar') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(Math.round(this.x + 32 * s), Math.round(this.y + 60 * s), Math.round(16 * s), Math.round(6 * s), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Se for o Avatar Customizável do Jogador, renderiza via Modular Cutout Engine
    if (this.heroId === 'custom_avatar' && this.modularAvatarRenderer) {
      let animState = 'idle';
      if (this.isCrafting) {
        animState = 'craft';
      } else if (this.isMounted) {
        animState = 'riding';
      } else if (this.isSprinting && this.isMoving) {
        animState = 'run';
      } else if (this.isMoving) {
        animState = 'walk';
      }

      this.modularAvatarRenderer.render(
        ctx,
        drawX,
        drawY,
        dir,
        animState,
        this.animTimer,
        this.customAvatarConfig || DEFAULT_AVATAR_CONFIG,
        s
      );

      // Efeito de Nuvem Poof de Construção no Workbench estilo Animal Crossing
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
      return;
    }

    // 3. Determina o frame recortado transparente da pasta frames (para Heróis fixos)
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

    let flipX = false;
    let targetRow = row;
    let sprite = null;

    // Check if hero has dedicated Walk_Down / Walk_Up animations (char_wolf_hunter_m)
    if (this.heroId === 'char_wolf_hunter_m' && !this.isCrafting) {
      if (dir === 'south' || (dir === 'north' && !this.isMoving && row === 0)) {
        if (this.isMoving) {
          const fps = this.isSprinting ? 18 : 12;
          const frameNum = (Math.floor(this.animTimer * fps) % 17) + 1;
          const frameIdx = String(frameNum).padStart(3, '0');
          sprite = assetLoader.getImage(`assets/characters/char_wolf_hunter_m/Walk_Down/sprite_${frameIdx}.png`);
        } else {
          // Idle facing south
          sprite = assetLoader.getImage(`assets/characters/char_wolf_hunter_m/Walk_Down/sprite_001.png`);
        }
      } else if (dir === 'north') {
        if (this.isMoving) {
          const fps = this.isSprinting ? 18 : 12;
          const frameNum = (Math.floor(this.animTimer * fps) % 15) + 1;
          const frameIdx = String(frameNum).padStart(3, '0');
          sprite = assetLoader.getImage(`assets/characters/char_wolf_hunter_m/Walk_Up/sprite_${frameIdx}.png`);
        } else {
          // Idle facing north
          sprite = assetLoader.getImage(`assets/characters/char_wolf_hunter_m/Walk_Up/sprite_001.png`);
        }
      }
    }

    if (!sprite) {
      let frameUrl = `assets/characters/${this.heroId}/frames/wolf_hunter_r${row}_c${col}.png`;
      sprite = assetLoader.getImage(frameUrl);

      // Se a direção for 'west' e não houver frame específico de west (row 3), usa o frame de 'east' (row 1) espelhado
      if (!sprite && dir === 'west') {
        const eastUrl = `assets/characters/${this.heroId}/frames/wolf_hunter_r1_c${col}.png`;
        sprite = assetLoader.getImage(eastUrl);
        if (sprite) {
          flipX = true;
        }
      }
    }

    if (!sprite) {
      sprite = assetLoader.getImage(`assets/characters/${this.heroId}/portrait.jpg`)
        || (this.isMoving ? assetLoader.getImage(`Geralt/running/rotations/${dir}.png`) : assetLoader.getImage(`Geralt/Idle/rotations/${dir}.png`));
    }

    if (sprite) {
      if (flipX) {
        ctx.save();
        ctx.translate(drawX + renderW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, 0, 0, renderW, renderH);
        ctx.restore();
      } else {
        ctx.drawImage(sprite, drawX, drawY, renderW, renderH);
      }
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
