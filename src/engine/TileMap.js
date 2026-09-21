// Infinite/Expandable Sparse TileMap engine with exact grid unit scaling

export const TILE_SIZE = 64;

export class TileMap {
  constructor() {
    this.tileSize = TILE_SIZE;

    // Layers stored as sparse Maps keyed by `${x},${y}`:
    // 0: ground (Base water, ocean void)
    // 1: decor (Grass patches, dirt roads, flowers, crops, details)
    // 2: solid (Houses, trees base, boulders, props)
    // 3: characters (Player Geralt, NPCs, Enemies, character spawns)
    // 4: overhead (Tree canopy/tops, roofs, arches, overhead bridges - rendered above player)
    this.layers = {
      ground: new Map(),
      decor: new Map(),
      solid: new Map(),
      characters: new Map(),
      overhead: new Map(),
      colliders: new Map()
    };

    // Customizable visual rendering order (from bottom to top)
    this.layerOrder = ['ground', 'decor', 'solid', 'characters', 'overhead', 'colliders'];

    // Layer metadata with human-friendly Portuguese labels and colors
    this.layerDefinitions = {
      ground: { id: 'ground', label: 'Chão', num: 1, color: '#3b82f6', desc: 'Água / Terreno Base' },
      decor: { id: 'decor', label: 'Decoração', num: 2, color: '#10b981', desc: 'Flora / Caminhos / Detalhes' },
      solid: { id: 'solid', label: 'Sólido', num: 3, color: '#f59e0b', desc: 'Estruturas / Objetos' },
      characters: { id: 'characters', label: 'Personagens', num: 4, color: '#ec4899', desc: 'Herói / NPCs / Inimigos' },
      overhead: { id: 'overhead', label: 'Topo / Cobertura', num: 5, color: '#8b5cf6', desc: 'Copa das Árvores / Telhados / Acima do Player' },
      colliders: { id: 'colliders', label: 'Colisores', num: 6, color: '#ef4444', desc: 'Barreiras e Paredes Invisíveis' }
    };

    // Animated tile clock (for water)
    this.waterAnimFrame = 0;
    this.waterTimer = 0;
    this.waterFrameDuration = 140; // ms per frame (~7 FPS)

    // Player default spawn position (snapped to 64px grid)
    this.spawnPoint = { x: 320, y: 320 };

    // Play Mode Global Camera Zoom (Configured by admin in World Editor)
    this.playCameraZoom = 1.0;
  }

  setPlayCameraZoom(zoom) {
    this.playCameraZoom = Math.max(0.4, Math.min(3.0, Math.round(zoom * 100) / 100));
  }

  setLayerOrder(newOrder) {
    if (Array.isArray(newOrder) && newOrder.length > 0) {
      // Ensure all required layers exist in the order
      const validLayers = ['ground', 'decor', 'solid', 'characters', 'overhead', 'colliders'];
      const filtered = newOrder.filter((l) => validLayers.includes(l));
      for (const vl of validLayers) {
        if (!filtered.includes(vl)) filtered.push(vl);
      }
      this.layerOrder = filtered;
    }
  }

  moveLayer(layerId, direction) {
    const idx = this.layerOrder.indexOf(layerId);
    if (idx === -1) return false;

    if (direction === 'up' && idx < this.layerOrder.length - 1) {
      // Move up in stack (rendered later / higher)
      const temp = this.layerOrder[idx];
      this.layerOrder[idx] = this.layerOrder[idx + 1];
      this.layerOrder[idx + 1] = temp;
      return true;
    } else if (direction === 'down' && idx > 0) {
      // Move down in stack (rendered earlier / lower)
      const temp = this.layerOrder[idx];
      this.layerOrder[idx] = this.layerOrder[idx - 1];
      this.layerOrder[idx - 1] = temp;
      return true;
    }
    return false;
  }

  getKey(x, y) {
    return `${x},${y}`;
  }

  setSpawn(x, y) {
    this.spawnPoint = { x: Math.round(x), y: Math.round(y) };
  }

  setTile(layerName, x, y, tileId, isRoot = true, rootX = x, rootY = y, rotation = 0, flipX = false, collider = null, depthOffset = null) {
    const layer = this.layers[layerName];
    if (!layer) return;

    const key = this.getKey(x, y);
    if (!tileId) {
      layer.delete(key);
    } else {
      const existing = layer.get(key);
      const cellData = { 
        tileId,
        isRoot,
        rootX,
        rootY,
        rotation: rotation || 0,
        flipX: !!flipX
      };
      if (collider !== null) {
        cellData.collider = collider;
      } else if (existing && existing.tileId === tileId && existing.collider) {
        cellData.collider = existing.collider;
      }
      if (depthOffset !== null) {
        cellData.depthOffset = depthOffset;
      } else if (existing && existing.tileId === tileId && existing.depthOffset !== undefined) {
        cellData.depthOffset = existing.depthOffset;
      }
      layer.set(key, cellData);
    }
  }

  // Multi-tile placement placing root and occupation references across grid area (accounting for rotation, flipX, and custom collider)
  placeMultiTile(layerName, startX, startY, tileMeta, rotation = 0, flipX = false, collider = null, depthOffset = null) {
    const baseW = tileMeta.gridW || 1;
    const baseH = tileMeta.gridH || 1;
    const isRotated90or270 = (rotation === 90 || rotation === 270);
    const gridW = isRotated90or270 ? baseH : baseW;
    const gridH = isRotated90or270 ? baseW : baseH;

    for (let dy = 0; dy < gridH; dy++) {
      for (let dx = 0; dx < gridW; dx++) {
        const tx = startX + dx;
        const ty = startY + dy;
        const isRoot = (dx === 0 && dy === 0);
        this.setTile(layerName, tx, ty, tileMeta.id, isRoot, startX, startY, rotation, flipX, isRoot ? collider : null, isRoot ? depthOffset : null);
      }
    }
  }

  getTile(layerName, x, y) {
    const layer = this.layers[layerName];
    if (!layer) return null;
    return layer.get(this.getKey(x, y)) || null;
  }

  // Erases from top to bottom according to dynamic layer order
  deleteTile(x, y, activeLayer = 'all', assetLoader = null) {
    // 1. If activeLayer is 'all', check if there is an invisible barrier/collider at this cell first
    if (activeLayer === 'all') {
      // Check colliders layer or any layer containing an invisible collider
      const layersToCheckColliders = ['colliders', ...this.layerOrder];
      for (const layerName of layersToCheckColliders) {
        const layer = this.layers[layerName];
        if (!layer) continue;
        const cell = layer.get(this.getKey(x, y));
        if (cell) {
          const meta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;
          const isInvisible = (cell.tileId && cell.tileId.startsWith('invisible-collider')) || (meta && meta.isInvisibleAsset);
          if (isInvisible || layerName === 'colliders') {
            const rootX = (cell.rootX !== undefined) ? cell.rootX : x;
            const rootY = (cell.rootY !== undefined) ? cell.rootY : y;
            let gw = 1;
            let gh = 1;
            if (meta) {
              const isRotated90or270 = (cell.rotation === 90 || cell.rotation === 270);
              gw = isRotated90or270 ? (meta.gridH || 1) : (meta.gridW || 1);
              gh = isRotated90or270 ? (meta.gridW || 1) : (meta.gridH || 1);
            }
            for (let dy = 0; dy < gh; dy++) {
              for (let dx = 0; dx < gw; dx++) {
                layer.delete(this.getKey(rootX + dx, rootY + dy));
              }
            }
            return; // Successfully deleted ONLY the invisible collider!
          }
        }
      }
    }

    // 2. Standard layer deletion
    const topToBottom = [...this.layerOrder].reverse();
    const layersToCheck = (activeLayer === 'all') 
      ? topToBottom 
      : [activeLayer, ...topToBottom];

    const checkedLayers = new Set();

    for (const layerName of layersToCheck) {
      if (checkedLayers.has(layerName)) continue;
      checkedLayers.add(layerName);

      const layer = this.layers[layerName];
      if (!layer) continue;

      const cell = layer.get(this.getKey(x, y));
      if (cell) {
        const rootX = (cell.rootX !== undefined) ? cell.rootX : x;
        const rootY = (cell.rootY !== undefined) ? cell.rootY : y;
        
        let gw = 1;
        let gh = 1;

        if (assetLoader) {
          const meta = assetLoader.getTileMetadata(cell.tileId);
          if (meta) {
            const isRotated90or270 = (cell.rotation === 90 || cell.rotation === 270);
            gw = isRotated90or270 ? (meta.gridH || 1) : (meta.gridW || 1);
            gh = isRotated90or270 ? (meta.gridW || 1) : (meta.gridH || 1);
          }
        }

        // Clear all grid cells occupied by this structure
        for (let dy = 0; dy < gh; dy++) {
          for (let dx = 0; dx < gw; dx++) {
            const ox = rootX + dx;
            const oy = rootY + dy;
            layer.delete(this.getKey(ox, oy));
          }
        }
        return;
      }
    }
  }

  update(deltaTime) {
    this.waterTimer += deltaTime;
    if (this.waterTimer >= this.waterFrameDuration) {
      this.waterTimer = 0;
      this.waterAnimFrame = (this.waterAnimFrame + 1) % 8; // 8 water frames
    }
  }

  drawTileCell(ctx, cell, x, y, assetLoader, isEditor = false, showColliders = true) {
    const tileMeta = assetLoader.getTileMetadata(cell.tileId);
    if (!tileMeta) return;

    const rotation = cell.rotation || 0;
    const isRotated90or270 = (rotation === 90 || rotation === 270);

    const baseGridW = tileMeta.gridW || 1;
    const baseGridH = tileMeta.gridH || 1;
    const occGridW = isRotated90or270 ? baseGridH : baseGridW;
    const occGridH = isRotated90or270 ? baseGridW : baseGridH;

    const destX = x * this.tileSize;
    const destY = y * this.tileSize;
    const occW = occGridW * this.tileSize;
    const occH = occGridH * this.tileSize;
    const rawW = baseGridW * this.tileSize;
    const rawH = baseGridH * this.tileSize;

    // Invisible Collider assets: Only render in Editor mode when showColliders is active (as semi-transparent barrier)
    if (tileMeta.isInvisibleAsset) {
      if (isEditor && showColliders) {
        ctx.save();
        const col = cell.collider || tileMeta.collider;
        const boxesToRender = (col && Array.isArray(col.boxes) && col.boxes.length > 0)
          ? col.boxes
          : [{ x: col?.x || 0, y: col?.y || 0, w: col?.w || occW, h: col?.h || occH }];

        for (const b of boxesToRender) {
          const bx = destX + (b.x || 0);
          const by = destY + (b.y || 0);
          const bw = b.w || occW;
          const bh = b.h || occH;

          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Barrier diagonal stripes
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 2;
          for (let offset = -bh; offset < bw + bh; offset += 14) {
            ctx.beginPath();
            ctx.moveTo(bx + Math.max(0, offset), by + Math.max(0, -offset));
            ctx.lineTo(bx + Math.min(bw, offset + bh), by + Math.min(bh, bh - (offset + bh - bw)));
            ctx.stroke();
          }
        }

        // Center tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let tagText = 'BARRIER';
        if (tileMeta.id.includes('top')) tagText = 'TOP';
        else if (tileMeta.id.includes('bottom')) tagText = 'BOT';
        else if (tileMeta.id.includes('left')) tagText = 'LEFT';
        else if (tileMeta.id.includes('right')) tagText = 'RIGHT';
        else if (tileMeta.id.includes('corner-tl')) tagText = '┌ L-TL';
        else if (tileMeta.id.includes('corner-tr')) tagText = '┐ L-TR';
        else if (tileMeta.id.includes('corner-bl')) tagText = '└ L-BL';
        else if (tileMeta.id.includes('corner-br')) tagText = '┘ L-BR';
        ctx.fillText(tagText, destX + occW / 2, destY + occH / 2);
        ctx.restore();
      }
      return;
    }

    let img = null;
    if (tileMeta.isAnimated && tileMeta.frames) {
      const framePath = tileMeta.frames[this.waterAnimFrame];
      img = assetLoader.getImage(framePath);
    } else if (tileMeta.src) {
      img = assetLoader.getImage(tileMeta.src);
    }

    if (img) {
      const scaleMultiplier = tileMeta.scale || 1.0;
      const drawW = rawW * scaleMultiplier;
      const drawH = rawH * scaleMultiplier;
      const isFlipped = !!cell.flipX;

      if (rotation !== 0 || scaleMultiplier !== 1.0 || isFlipped) {
        ctx.save();
        // Translate to center of occupied bounding box
        ctx.translate(destX + occW / 2, destY + occH / 2);
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        if (isFlipped) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        ctx.drawImage(img, destX, destY, rawW, rawH);
      }
    }
  }

  // Get calculated base Y (feet/depth sort origin) for a tile cell
  getCellBaseY(cell, x, y, assetLoader) {
    const tileMeta = assetLoader.getTileMetadata(cell.tileId);
    if (!tileMeta) return (y + 1) * this.tileSize;

    const rotation = cell.rotation || 0;
    const isRotated90or270 = (rotation === 90 || rotation === 270);
    const baseGridW = tileMeta.gridW || 1;
    const baseGridH = tileMeta.gridH || 1;
    const occGridH = isRotated90or270 ? baseGridW : baseGridH;
    const destY = y * this.tileSize;
    const occH = occGridH * this.tileSize;

    // 1. Derive from collider bottom if collider exists (e.g. tree trunks, house base)
    const col = cell.collider || tileMeta.collider;
    if (col && col.enabled && col.y !== undefined && col.h !== undefined) {
      return destY + col.y + col.h;
    }

    // 2. Default to bottom edge of tile footprint
    return destY + occH;
  }

  renderLayer(ctx, layerName, assetLoader, camera, isEditor = false, showColliders = true) {
    const layer = this.layers[layerName];
    if (!layer || layer.size === 0) return;

    const camX = (camera && typeof camera.x === 'number' && isFinite(camera.x)) ? camera.x : 0;
    const camY = (camera && typeof camera.y === 'number' && isFinite(camera.y)) ? camera.y : 0;
    const camZ = (camera && typeof camera.zoom === 'number' && isFinite(camera.zoom) && camera.zoom > 0.05) ? camera.zoom : 1.0;
    const camW = (camera && typeof camera.viewportWidth === 'number' && isFinite(camera.viewportWidth) && camera.viewportWidth > 0) ? camera.viewportWidth : 800;
    const camH = (camera && typeof camera.viewportHeight === 'number' && isFinite(camera.viewportHeight) && camera.viewportHeight > 0) ? camera.viewportHeight : 600;

    // Viewport bounds culling (strict 2 blocks margin around visible camera)
    const padding = 2;
    const startCol = Math.floor(camX / this.tileSize) - padding;
    const endCol = Math.ceil((camX + camW / camZ) / this.tileSize) + padding;
    const startRow = Math.floor(camY / this.tileSize) - padding;
    const endRow = Math.ceil((camY + camH / camZ) / this.tileSize) + padding;

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const cell = layer.get(this.getKey(x, y));
        if (!cell || cell.isRoot === false) continue;
        this.drawTileCell(ctx, cell, x, y, assetLoader, isEditor, showColliders);
      }
    }
  }

  getBounds() {
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    let hasTiles = false;

    for (const layer of Object.values(this.layers)) {
      for (const key of layer.keys()) {
        const [x, y] = key.split(',').map(Number);
        if (!hasTiles) {
          minX = maxX = x;
          minY = maxY = y;
          hasTiles = true;
        } else {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    return { minX, maxX, minY, maxY, hasTiles };
  }

  toJSON() {
    const serializeLayer = (map) => {
      const obj = {};
      if (!map) return obj;
      for (const [k, v] of map.entries()) {
        obj[k] = v;
      }
      return obj;
    };

    return {
      version: '3.4',
      tileSize: this.tileSize,
      spawnPoint: this.spawnPoint,
      playCameraZoom: this.playCameraZoom || 1.0,
      layerOrder: this.layerOrder,
      layers: {
        ground: serializeLayer(this.layers.ground),
        decor: serializeLayer(this.layers.decor),
        solid: serializeLayer(this.layers.solid),
        characters: serializeLayer(this.layers.characters),
        overhead: serializeLayer(this.layers.overhead),
        colliders: serializeLayer(this.layers.colliders)
      }
    };
  }

  fromJSON(data) {
    if (!data || !data.layers) return false;
    this.tileSize = data.tileSize || TILE_SIZE;
    if (data.spawnPoint) {
      this.spawnPoint = {
        x: data.spawnPoint.x ?? 300,
        y: data.spawnPoint.y ?? 300
      };
    }
    if (data.playCameraZoom !== undefined) {
      this.setPlayCameraZoom(data.playCameraZoom);
    }
    if (data.layerOrder && Array.isArray(data.layerOrder)) {
      this.setLayerOrder(data.layerOrder);
    }

    const deserializeLayer = (source) => {
      const map = new Map();
      if (!source) return map;
      if (Array.isArray(source)) {
        const cols = data.cols || 40;
        source.forEach((cell, idx) => {
          if (cell) {
            const x = idx % cols;
            const y = Math.floor(idx / cols);
            map.set(this.getKey(x, y), cell);
          }
        });
      } else {
        for (const [k, v] of Object.entries(source)) {
          if (v) map.set(k, v);
        }
      }
      return map;
    };

    this.layers = {
      ground: deserializeLayer(data.layers.ground),
      decor: deserializeLayer(data.layers.decor),
      solid: deserializeLayer(data.layers.solid),
      characters: deserializeLayer(data.layers.characters || data.layers.player),
      overhead: deserializeLayer(data.layers.overhead),
      colliders: deserializeLayer(data.layers.colliders)
    };

    // Auto-migrate any invisible colliders in legacy layers to the dedicated colliders layer
    for (const [layerKey, layerMap] of Object.entries(this.layers)) {
      if (layerKey === 'colliders') continue;
      for (const [coordKey, cell] of layerMap.entries()) {
        if (cell && cell.tileId && cell.tileId.startsWith('invisible-collider')) {
          if (!this.layers.colliders.has(coordKey)) {
            this.layers.colliders.set(coordKey, cell);
          }
          layerMap.delete(coordKey);
        }
      }
    }

    return true;
  }
}
