// Editor Controller handling multi-tile placement, infinite grid navigation, and collider editing mode
import { UndoRedoManager } from '../engine/UndoRedoManager.js';

export class EditorController {
  constructor(tileMap, assetLoader, camera, onMapChange = () => {}, player = null) {
    this.tileMap = tileMap;
    this.assetLoader = assetLoader;
    this.camera = camera;
    this.onMapChange = onMapChange;
    this.player = player;

    // Undo / Redo Manager (50 states)
    this.undoManager = new UndoRedoManager(this.tileMap, () => {
      this.onMapChange();
      if (this.tileMap.spawnPoint && this.player) {
        this.player.setSpawn(this.tileMap.spawnPoint.x, this.tileMap.spawnPoint.y);
      }
    });

    // Active tool: 'brush', 'fill', 'spawn', 'eraser', 'eyedropper', 'collider'
    this.activeTool = 'brush';
    this.selectedTileId = 'water-animated';
    this.activeLayer = 'ground'; // 'ground', 'decor', 'solid'
    this.activeRotation = 0; // 0, 90, 180, 270
    this.activeFlipX = false; // Mirror horizontal

    // Collider Overlay Visibility
    this.showColliders = true;

    // Mouse states
    this.isMouseDown = false;
    this.mouseButton = 0; // 0: left, 2: right
    this.hoverTileX = 0;
    this.hoverTileY = 0;
    this.lastPaintedX = null;
    this.lastPaintedY = null;

    // Selected Map Grid Cell for inspection & layer breakdown
    this.selectedGridCell = null; // { x: number, y: number, layers: { solid: TileCell, decor: TileCell, ground: TileCell } }

    // Pan state for middle click or drag
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;

    // Interactive Collider Box Mouse Drag State
    this.isDraggingCollider = false;
    this.colliderDragHandle = null; // 'move', 'nw', 'ne', 'se', 'sw'
    this.colliderDragTile = null; // { tileId, isPlayer, rootX, rootY, initialCollider }
    this.colliderDragStartWorld = { x: 0, y: 0 };

    // Keyboard navigation in Editor Mode
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
    this.cameraNavSpeed = 450; // pixels per second
  }

  rotateActiveAsset() {
    this.activeRotation = (this.activeRotation + 90) % 360;
    window.dispatchEvent(new CustomEvent('editor-rotation-changed', { detail: { rotation: this.activeRotation } }));
    return this.activeRotation;
  }

  setRotation(rot) {
    this.activeRotation = (rot % 360 + 360) % 360;
    window.dispatchEvent(new CustomEvent('editor-rotation-changed', { detail: { rotation: this.activeRotation } }));
  }

  flipActiveAsset() {
    this.activeFlipX = !this.activeFlipX;
    window.dispatchEvent(new CustomEvent('editor-flip-changed', { detail: { flipX: this.activeFlipX } }));
    return this.activeFlipX;
  }

  setFlipX(flip) {
    this.activeFlipX = !!flip;
    window.dispatchEvent(new CustomEvent('editor-flip-changed', { detail: { flipX: this.activeFlipX } }));
  }

  undo() {
    return this.undoManager.undo();
  }

  redo() {
    return this.undoManager.redo();
  }

  recordState() {
    this.undoManager.recordState();
  }

  focusPlayer() {
    if (!this.player) return;
    const targetX = this.player.x + 32;
    const targetY = this.player.y + 32;
    this.camera.x = targetX - (this.camera.viewportWidth / this.camera.zoom) / 2;
    this.camera.y = targetY - (this.camera.viewportHeight / this.camera.zoom) / 2;
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    this.isPanning = false;
    this.isMouseDown = false;
  }

  handleKeyDown(e) {
    const key = typeof e === 'string' ? e : e.key;
    const isEvent = typeof e === 'object';

    // Undo / Redo Shortcuts
    if (isEvent && (e.ctrlKey || e.metaKey)) {
      const lowerKey = (e.key || '').toLowerCase();
      if (lowerKey === 'z') {
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
        e.preventDefault();
        return;
      } else if (lowerKey === 'y') {
        this.redo();
        e.preventDefault();
        return;
      }
    }

    const k = (key || '').toLowerCase();

    // Tool switching shortcuts
    if (k === 'v') {
      this.setTool('select');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'select' } }));
      return;
    } else if (k === 'b') {
      this.setTool('brush');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'brush' } }));
      return;
    } else if (k === 'g') {
      this.setTool('fill');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'fill' } }));
      return;
    } else if (k === 'p') {
      this.setTool('spawn');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'spawn' } }));
      return;
    } else if (k === 'c') {
      this.showColliders = !this.showColliders;
      if (this.showColliders) {
        this.setTool('collider');
        window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'collider', showColliders: true } }));
      } else {
        if (this.activeTool === 'collider') {
          this.setTool('brush');
          window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'brush', showColliders: false } }));
        } else {
          window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: this.activeTool, showColliders: false } }));
        }
      }
      return;
    } else if (k === 'e') {
      this.setTool('eraser');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'eraser' } }));
      return;
    } else if (k === 'i') {
      this.setTool('eyedropper');
      window.dispatchEvent(new CustomEvent('editor-tool-activated', { detail: { tool: 'eyedropper' } }));
      return;
    } else if (k === 'r') {
      this.rotateActiveAsset();
      return;
    } else if (k === 'h' || k === 'x') {
      this.flipActiveAsset();
      return;
    } else if (key === '1') {
      this.setLayer('ground');
      return;
    } else if (key === '2') {
      this.setLayer('decor');
      return;
    } else if (key === '3') {
      this.setLayer('solid');
      return;
    } else if (key === '4') {
      this.setLayer('characters');
      return;
    } else if (key === '5') {
      this.setLayer('overhead');
      return;
    } else if (k === 'f') {
      this.focusPlayer();
      return;
    } else if (key === 'Escape') {
      this.selectedGridCell = null;
      const inspectorPanel = document.getElementById('tile-inspector-panel');
      if (inspectorPanel) inspectorPanel.classList.remove('active');
      return;
    }

    if (['w', 'a', 's', 'd'].includes(k)) {
      this.keys[k] = true;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = true; this.keys['w'] = true; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = true; this.keys['a'] = true; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = true; this.keys['s'] = true; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = true; this.keys['d'] = true; }
  }

  handleKeyUp(key) {
    const k = (typeof key === 'string' ? key : key?.key || '').toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) {
      this.keys[k] = false;
    }
    if (key === 'ArrowUp' || k === 'arrowup') { this.keys['ArrowUp'] = false; this.keys['w'] = false; }
    if (key === 'ArrowLeft' || k === 'arrowleft') { this.keys['ArrowLeft'] = false; this.keys['a'] = false; }
    if (key === 'ArrowDown' || k === 'arrowdown') { this.keys['ArrowDown'] = false; this.keys['s'] = false; }
    if (key === 'ArrowRight' || k === 'arrowright') { this.keys['ArrowRight'] = false; this.keys['d'] = false; }
  }

  update(deltaTime) {
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

    if (vx !== 0 && vy !== 0) {
      const length = Math.SQRT2;
      vx /= length;
      vy /= length;
    }

    if (vx !== 0 || vy !== 0) {
      const moveDist = (this.cameraNavSpeed / this.camera.zoom) * (deltaTime / 1000);
      this.camera.x += vx * moveDist;
      this.camera.y += vy * moveDist;
    }
  }

  setLayer(layer) {
    if (!['ground', 'decor', 'solid', 'characters', 'overhead', 'colliders'].includes(layer)) return;
    this.activeLayer = layer;

    // Update UI button segment states
    document.querySelectorAll('.layer-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.layer === layer);
    });

    // Update status bar
    const statusLayer = document.getElementById('status-layer');
    if (statusLayer) {
      const names = { ground: 'CHÃO', decor: 'DECORAÇÃO', solid: 'SÓLIDO', characters: 'PERSONAGENS', overhead: 'TOPO', colliders: 'COLISORES' };
      statusLayer.innerText = names[layer] || layer.toUpperCase();
    }
  }

  setTool(tool) {
    this.activeTool = tool;
  }

  setSelectedTile(tileId) {
    this.selectedTileId = tileId;
  }

  getTileCoordsFromEvent(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldPos = this.camera.screenToWorld(clientX, clientY);
    const tileX = Math.floor(worldPos.x / this.tileMap.tileSize);
    const tileY = Math.floor(worldPos.y / this.tileMap.tileSize);
    return { tileX, tileY, clientX, clientY, worldX: worldPos.x, worldY: worldPos.y };
  }

  handleMouseDown(e, canvas) {
    const { tileX, tileY, clientX, clientY, worldX, worldY } = this.getTileCoordsFromEvent(e, canvas);

    if (e.button === 1 || e.spaceKey) {
      // Middle click pan
      this.isPanning = true;
      this.panStartX = clientX;
      this.panStartY = clientY;
      return;
    }

    // Record undo state before modifying map
    if (e.button === 0 || e.button === 2) {
      if (['brush', 'fill', 'spawn', 'eraser'].includes(this.activeTool) || e.button === 2) {
        this.recordState();
      }
    }

    this.isMouseDown = true;
    this.mouseButton = e.button;
    this.hoverTileX = tileX;
    this.hoverTileY = tileY;

    if (this.activeTool === 'collider' && e.button === 0) {
      // Handle interactive collider dragging & resizing on the map
      if (this.startColliderInteraction(worldX, worldY)) {
        return;
      }
    }

    this.applyAction(tileX, tileY, e.button === 2);
  }

  startColliderInteraction(worldX, worldY) {
    const tileSize = this.tileMap.tileSize;
    const handleRadius = 14 / this.camera.zoom;

    // 1. Check if clicking on Player (Geralt) collider
    if (this.player) {
      const meta = this.assetLoader.getTileMetadata('character-geralt');
      const col = meta?.collider || { enabled: true, x: 20, y: 46, w: 24, h: 16 };
      const boxX = this.player.x + (col.x || 0);
      const boxY = this.player.y + (col.y || 0);
      const boxW = col.w || 24;
      const boxH = col.h || 16;

      const hitSE = Math.abs(worldX - (boxX + boxW)) < handleRadius && Math.abs(worldY - (boxY + boxH)) < handleRadius;
      const hitNW = Math.abs(worldX - boxX) < handleRadius && Math.abs(worldY - boxY) < handleRadius;
      const hitBody = (worldX >= boxX && worldX <= boxX + boxW && worldY >= boxY && worldY <= boxY + boxH) ||
                      (worldX >= this.player.x && worldX <= this.player.x + 64 && worldY >= this.player.y && worldY <= this.player.y + 64);

      if (hitSE || hitNW || hitBody) {
        this.isDraggingCollider = true;
        this.colliderDragHandle = hitSE ? 'se' : (hitNW ? 'nw' : 'move');
        this.colliderDragTile = {
          tileId: 'character-geralt',
          isPlayer: true,
          rootX: this.player.x,
          rootY: this.player.y,
          initialCollider: { ...col }
        };
        this.colliderDragStartWorld = { x: worldX, y: worldY };

        this.setSelectedTile('character-geralt');
        window.dispatchEvent(new CustomEvent('tile-collider-selected', { detail: { tileId: 'character-geralt' } }));
        return true;
      }
    }

    // 2. Check world tiles (including invisible colliders & structures)
    const layers = ['solid', 'decor', 'ground'];
    for (const layerName of layers) {
      const layer = this.tileMap.layers[layerName];
      if (!layer) continue;

      for (const [key, cell] of layer.entries()) {
        if (!cell || cell.isRoot === false) continue;
        const [tx, ty] = key.split(',').map(Number);
        const meta = this.assetLoader.getTileMetadata(cell.tileId);
        if (!meta || !meta.collider) continue;

        const col = cell.collider || meta.collider;
        const boxX = tx * tileSize + (col.x || 0);
        const boxY = ty * tileSize + (col.y || 0);
        const boxW = col.w || (meta.gridW * tileSize);
        const boxH = col.h || (meta.gridH * tileSize);

        // Check if click hit resize handle or box body
        const hitSE = Math.abs(worldX - (boxX + boxW)) < handleRadius && Math.abs(worldY - (boxY + boxH)) < handleRadius;
        const hitNW = Math.abs(worldX - boxX) < handleRadius && Math.abs(worldY - boxY) < handleRadius;
        const hitBody = worldX >= boxX && worldX <= boxX + boxW && worldY >= boxY && worldY <= boxY + boxH;

        if (hitSE || hitNW || hitBody) {
          this.isDraggingCollider = true;
          this.colliderDragHandle = hitSE ? 'se' : (hitNW ? 'nw' : 'move');
          this.colliderDragTile = {
            tileId: cell.tileId,
            isPlayer: false,
            layerName,
            rootX: tx,
            rootY: ty,
            initialCollider: { ...col }
          };
          this.colliderDragStartWorld = { x: worldX, y: worldY };

          // Select this tile and notify inspector
          this.setSelectedTile(cell.tileId);
          window.dispatchEvent(new CustomEvent('tile-collider-selected', { 
            detail: { 
              tileId: cell.tileId,
              layerName,
              x: tx,
              y: ty,
              collider: { ...col }
            } 
          }));
          return true;
        }
      }
    }
    return false;
  }

  handleMouseMove(e, canvas) {
    if (!canvas) return;
    const coords = this.getTileCoordsFromEvent(e, canvas);
    if (!coords) return;
    const { tileX, tileY, clientX, clientY, worldX, worldY } = coords;

    if (isNaN(tileX) || isNaN(tileY)) return;

    if (this.isPanning) {
      const dx = clientX - this.panStartX;
      const dy = clientY - this.panStartY;
      if (!isNaN(dx) && !isNaN(dy)) {
        this.camera.x -= dx / this.camera.zoom;
        this.camera.y -= dy / this.camera.zoom;
      }
      this.panStartX = clientX;
      this.panStartY = clientY;
      return;
    }

    if (this.isDraggingCollider && this.colliderDragTile) {
      const dx = worldX - this.colliderDragStartWorld.x;
      const dy = worldY - this.colliderDragStartWorld.y;
      const init = this.colliderDragTile.initialCollider;
      const meta = this.assetLoader.getTileMetadata(this.colliderDragTile.tileId);

      const maxW = (meta?.gridW || 1) * this.tileMap.tileSize;
      const maxH = (meta?.gridH || 1) * this.tileMap.tileSize;

      let newX = init.x ?? 0;
      let newY = init.y ?? 0;
      let newW = init.w ?? maxW;
      let newH = init.h ?? maxH;

      if (this.colliderDragHandle === 'move') {
        newX = Math.max(0, Math.min(maxW - newW, Math.round(init.x + dx)));
        newY = Math.max(0, Math.min(maxH - newH, Math.round(init.y + dy)));
      } else if (this.colliderDragHandle === 'se') {
        newW = Math.max(8, Math.min(maxW - newX, Math.round(init.w + dx)));
        newH = Math.max(8, Math.min(maxH - newY, Math.round(init.h + dy)));
      } else if (this.colliderDragHandle === 'nw') {
        const potentialX = Math.round(init.x + dx);
        const potentialY = Math.round(init.y + dy);
        if (potentialX >= 0 && potentialX < init.x + init.w - 8) {
          newX = potentialX;
          newW = init.w - (potentialX - init.x);
        }
        if (potentialY >= 0 && potentialY < init.y + init.h - 8) {
          newY = potentialY;
          newH = init.h - (potentialY - init.y);
        }
      }

      const updatedCol = {
        enabled: true,
        x: newX,
        y: newY,
        w: newW,
        h: newH
      };

      if (this.colliderDragTile.isPlayer) {
        this.assetLoader.setTileCollider('character-geralt', updatedCol);
        if (this.player) {
          this.player.syncCollider(this.assetLoader);
        }
      } else {
        // Update individual placed tile cell collider
        const { layerName, rootX, rootY } = this.colliderDragTile;
        const layer = this.tileMap.layers[layerName];
        if (layer) {
          const cell = layer.get(this.tileMap.getKey(rootX, rootY));
          if (cell) {
            cell.collider = updatedCol;
            this.onMapChange();
          }
        }
      }

      window.dispatchEvent(new CustomEvent('tile-collider-updated', { 
        detail: { 
          tileId: this.colliderDragTile.tileId,
          layerName: this.colliderDragTile.layerName,
          x: this.colliderDragTile.rootX,
          y: this.colliderDragTile.rootY,
          collider: updatedCol
        } 
      }));
      return;
    }

    this.hoverTileX = tileX;
    this.hoverTileY = tileY;

    if (this.isMouseDown) {
      if (this.hoverTileX !== this.lastPaintedX || this.hoverTileY !== this.lastPaintedY) {
        this.applyAction(this.hoverTileX, this.hoverTileY, this.mouseButton === 2);
      }
    }
  }

  handleMouseUp() {
    this.isMouseDown = false;
    this.isPanning = false;
    this.isDraggingCollider = false;
    this.colliderDragTile = null;
    this.lastPaintedX = null;
    this.lastPaintedY = null;
  }

  applyAction(tileX, tileY, isRightClick = false) {
    this.lastPaintedX = tileX;
    this.lastPaintedY = tileY;

    if (isRightClick || this.activeTool === 'eraser') {
      this.tileMap.deleteTile(tileX, tileY, 'all', this.assetLoader);
      this.onMapChange();
      return;
    }

    if (this.activeTool === 'spawn' || (this.activeTool === 'brush' && this.selectedTileId === 'character-geralt')) {
      const spawnX = tileX * this.tileMap.tileSize;
      const spawnY = tileY * this.tileMap.tileSize;
      this.tileMap.setSpawn(spawnX, spawnY);
      if (this.player) {
        this.player.setSpawn(spawnX, spawnY);
      }
      this.onMapChange();
      return;
    }

    if (this.activeTool === 'brush') {
      const meta = this.assetLoader.getTileMetadata(this.selectedTileId);
      if (meta) {
        const targetLayer = this.activeLayer || meta.layer || 'decor';
        if ((meta.gridW && meta.gridW > 1) || (meta.gridH && meta.gridH > 1)) {
          this.tileMap.placeMultiTile(targetLayer, tileX, tileY, meta, this.activeRotation, this.activeFlipX);
        } else {
          this.tileMap.setTile(targetLayer, tileX, tileY, this.selectedTileId, true, tileX, tileY, this.activeRotation, this.activeFlipX);
        }
        this.onMapChange();
      }
    } else if (this.activeTool === 'fill') {
      if (this.selectedTileId === 'character-geralt') return;
      const meta = this.assetLoader.getTileMetadata(this.selectedTileId);
      const targetLayer = this.activeLayer || meta?.layer || 'decor';
      this.floodFill(tileX, tileY, targetLayer, this.selectedTileId);
      this.onMapChange();
    } else if (this.activeTool === 'select') {
      this.inspectTileAt(tileX, tileY);
    } else if (this.activeTool === 'eyedropper' || this.activeTool === 'collider') {
      // Check player first
      if (this.player) {
        const px = Math.floor(this.player.x / this.tileMap.tileSize);
        const py = Math.floor(this.player.y / this.tileMap.tileSize);
        if (tileX === px && tileY === py) {
          this.setSelectedTile('character-geralt');
          window.dispatchEvent(new CustomEvent('tile-collider-selected', { detail: { tileId: 'character-geralt' } }));
          return;
        }
      }

      const layers = this.tileMap.layerOrder ? [...this.tileMap.layerOrder].reverse() : ['characters', 'solid', 'decor', 'ground'];
      for (const l of layers) {
        const tile = this.tileMap.getTile(l, tileX, tileY);
        if (tile && tile.tileId) {
          this.setSelectedTile(tile.tileId);
          if (this.activeTool === 'eyedropper') {
            this.setTool('brush');
          }
          window.dispatchEvent(new CustomEvent('tile-collider-selected', { detail: { tileId: tile.tileId } }));
          break;
        }
      }
    }
  }

  inspectTileAt(tileX, tileY) {
    const layers = this.tileMap.layerOrder ? [...this.tileMap.layerOrder].reverse() : ['characters', 'solid', 'decor', 'ground'];
    const layerData = {};
    let primaryTileId = null;

    for (const l of layers) {
      const tile = this.tileMap.getTile(l, tileX, tileY);
      if (tile) {
        const meta = this.assetLoader.getTileMetadata(tile.tileId);
        layerData[l] = {
          tileId: tile.tileId,
          isRoot: tile.isRoot,
          rootX: tile.rootX,
          rootY: tile.rootY,
          rotation: tile.rotation || 0,
          meta: meta || null
        };
        if (!primaryTileId && tile.tileId) {
          primaryTileId = tile.tileId;
        }
      } else {
        layerData[l] = null;
      }
    }

    this.selectedGridCell = {
      x: tileX,
      y: tileY,
      layers: layerData
    };

    if (primaryTileId) {
      this.setSelectedTile(primaryTileId);
      window.dispatchEvent(new CustomEvent('tile-collider-selected', { detail: { tileId: primaryTileId } }));
    }

    // Dispatch custom event for UI inspector panel
    window.dispatchEvent(new CustomEvent('map-cell-inspected', {
      detail: {
        x: tileX,
        y: tileY,
        layers: layerData
      }
    }));
  }

  floodFill(startX, startY, layerName, newTileId) {
    const targetTile = this.tileMap.getTile(layerName, startX, startY);
    const targetId = targetTile ? targetTile.tileId : null;
    if (targetId === newTileId) return;

    const queue = [[startX, startY]];
    const visited = new Set();
    const maxFill = 2000;
    let filled = 0;

    while (queue.length > 0 && filled < maxFill) {
      const [x, y] = queue.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const current = this.tileMap.getTile(layerName, x, y);
      const curId = current ? current.tileId : null;

      if (curId === targetId) {
        this.tileMap.setTile(layerName, x, y, newTileId);
        filled++;

        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }
  }

  renderEditorOverlay(ctx) {
    const tileSize = this.tileMap.tileSize || 64;

    // Infinite Viewport grid outline
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;

    const zoom = Math.max(0.1, this.camera.zoom || 1.0);
    const rawStartCol = Math.floor(this.camera.x / tileSize) - 1;
    const rawEndCol = Math.ceil((this.camera.x + this.camera.viewportWidth / zoom) / tileSize) + 1;
    const rawStartRow = Math.floor(this.camera.y / tileSize) - 1;
    const rawEndRow = Math.ceil((this.camera.y + this.camera.viewportHeight / zoom) / tileSize) + 1;

    // Guard against infinity or NaN
    const startCol = isFinite(rawStartCol) ? rawStartCol : -20;
    const endCol = isFinite(rawEndCol) ? Math.min(startCol + 200, rawEndCol) : startCol + 40;
    const startRow = isFinite(rawStartRow) ? rawStartRow : -20;
    const endRow = isFinite(rawEndRow) ? Math.min(startRow + 200, rawEndRow) : startRow + 40;

    for (let x = startCol; x <= endCol; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, startRow * tileSize);
      ctx.lineTo(x * tileSize, (endRow + 1) * tileSize);
      ctx.stroke();
    }
    for (let y = startRow; y <= endRow; y++) {
      ctx.beginPath();
      ctx.moveTo(startCol * tileSize, y * tileSize);
      ctx.lineTo((endCol + 1) * tileSize, y * tileSize);
      ctx.stroke();
    }

    // World origin reference crosshair (0,0)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, tileSize, tileSize);

    // Glowing Runic Player Spawn Indicator in Editor Mode
    if (this.tileMap.spawnPoint) {
      const sp = this.tileMap.spawnPoint;
      const cx = sp.x + tileSize / 2;
      const cy = sp.y + tileSize / 2;
      const time = performance.now() * 0.002;

      ctx.save();

      // Outer radial pulse halo
      const pulse = Math.sin(time * 2.5) * 0.12 + 0.88;
      const radGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 38 * pulse);
      radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      radGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.2)');
      radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Outer Runic Dash Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6, 3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Counter-rotating Inner Rune Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 1.6);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4-point Cardinal Star
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx + 3, cy - 3);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx + 3, cy + 3);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx - 3, cy + 3);
      ctx.lineTo(cx - 12, cy);
      ctx.lineTo(cx - 3, cy - 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tile bounding border
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sp.x, sp.y, tileSize, tileSize);
      ctx.setLineDash([]);

      // Top Banner Plaque
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      const tagW = 96;
      const tagH = 18;
      ctx.fillRect(cx - tagW / 2, sp.y - 22, tagW, tagH);
      ctx.strokeRect(cx - tagW / 2, sp.y - 22, tagW, tagH);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPAWN DO HERÓI', cx, sp.y - 13);

      ctx.restore();
    }

    // Render Tile Collider Boxes Overlay (when Colliders visibility is turned on)
    if (this.showColliders) {
      this.renderCollidersOverlay(ctx, startCol, endCol, startRow, endRow);
    }

    // Render Persistent Selected Grid Cell Box
    if (this.selectedGridCell) {
      const sx = this.selectedGridCell.x * tileSize;
      const sy = this.selectedGridCell.y * tileSize;
      const time = performance.now() * 0.003;

      ctx.save();
      // Glowing Cyan/Amber Pulsing Box
      const pulse = Math.sin(time * 3) * 0.15 + 0.85;
      ctx.fillStyle = `rgba(6, 182, 212, ${0.18 * pulse})`;
      ctx.fillRect(sx, sy, tileSize, tileSize);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -time * 20;
      ctx.strokeRect(sx, sy, tileSize, tileSize);
      ctx.setLineDash([]);

      // Corner Accents
      const cornerLen = 10;
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(sx, sy + cornerLen);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx + cornerLen, sy);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(sx + tileSize - cornerLen, sy);
      ctx.lineTo(sx + tileSize, sy);
      ctx.lineTo(sx + tileSize, sy + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(sx, sy + tileSize - cornerLen);
      ctx.lineTo(sx, sy + tileSize);
      ctx.lineTo(sx + cornerLen, sy + tileSize);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(sx + tileSize - cornerLen, sy + tileSize);
      ctx.lineTo(sx + tileSize, sy + tileSize);
      ctx.lineTo(sx + tileSize, sy + tileSize - cornerLen);
      ctx.stroke();

      ctx.restore();
    }

    // Hover indicator with exact footprint dimensions
    const hx = this.hoverTileX * tileSize;
    const hy = this.hoverTileY * tileSize;

    if (this.activeTool === 'select') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.fillRect(hx, hy, tileSize, tileSize);
      ctx.strokeRect(hx, hy, tileSize, tileSize);
    } else if (this.activeTool === 'eraser') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(hx, hy, tileSize, tileSize);
      ctx.strokeRect(hx, hy, tileSize, tileSize);
    } else if (this.activeTool === 'spawn') {
      ctx.save();
      const cx = hx + tileSize / 2;
      const cy = hy + tileSize / 2;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(hx, hy, tileSize, tileSize);
      ctx.strokeRect(hx, hy, tileSize, tileSize);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('DEFINIR SPAWN', cx, hy - 4);
      ctx.restore();
    } else if (this.activeTool === 'brush') {
      const meta = this.assetLoader.getTileMetadata(this.selectedTileId);
      const baseGridW = meta?.gridW || 1;
      const baseGridH = meta?.gridH || 1;
      const rot = this.activeRotation || 0;
      const isRot90or270 = (rot === 90 || rot === 270);
      const occGridW = isRot90or270 ? baseGridH : baseGridW;
      const occGridH = isRot90or270 ? baseGridW : baseGridH;

      const occW = occGridW * tileSize;
      const occH = occGridH * tileSize;
      const rawW = baseGridW * tileSize;
      const rawH = baseGridH * tileSize;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.fillRect(hx, hy, occW, occH);
      ctx.strokeRect(hx, hy, occW, occH);

      // Multi-tile Brush ghost preview (with rotation)
      if (meta) {
        ctx.globalAlpha = 0.55;
        let img = null;
        if (meta.isAnimated && meta.frames) {
          img = this.assetLoader.getImage(meta.frames[0]);
        } else if (meta.src) {
          img = this.assetLoader.getImage(meta.src);
        }

        if (img) {
          const isFlipped = !!this.activeFlipX;
          if (rot !== 0 || isFlipped) {
            ctx.save();
            ctx.translate(hx + occW / 2, hy + occH / 2);
            if (rot !== 0) {
              ctx.rotate((rot * Math.PI) / 180);
            }
            if (isFlipped) {
              ctx.scale(-1, 1);
            }
            ctx.drawImage(img, -rawW / 2, -rawH / 2, rawW, rawH);
            ctx.restore();
          } else {
            ctx.drawImage(img, hx, hy, rawW, rawH);
          }
        }
        ctx.globalAlpha = 1.0;

        // Draw rotation / flip badges
        let badgeOffsetX = 2;
        if (rot !== 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.fillRect(hx + badgeOffsetX, hy + 2, 34, 16);
          ctx.strokeStyle = '#f59e0b';
          ctx.strokeRect(hx + badgeOffsetX, hy + 2, 34, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${rot}°`, hx + badgeOffsetX + 17, hy + 10);
          ctx.restore();
          badgeOffsetX += 38;
        }
        if (this.activeFlipX) {
          ctx.save();
          ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
          ctx.fillRect(hx + badgeOffsetX, hy + 2, 44, 16);
          ctx.strokeStyle = '#c084fc';
          ctx.strokeRect(hx + badgeOffsetX, hy + 2, 44, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⇄ FLIP', hx + badgeOffsetX + 22, hy + 10);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  renderCollidersOverlay(ctx, startCol, endCol, startRow, endRow) {
    const tileSize = this.tileMap.tileSize;
    const layers = this.tileMap.layerOrder || ['characters', 'solid', 'decor', 'ground'];

    ctx.save();

    // 1. Render Player (Geralt) Collider Handles if Geralt is selected or collider tool active
    if (this.player) {
      const meta = this.assetLoader.getTileMetadata('character-geralt');
      const col = meta?.collider || { enabled: true, x: 20, y: 46, w: 24, h: 16 };
      const s = this.player.scale || 1.0;
      const boxX = this.player.x + ((col.x || 0) * s);
      const boxY = this.player.y + ((col.y || 0) * s);
      const boxW = (col.w || 24) * s;
      const boxH = (col.h || 16) * s;

      const isSelected = this.selectedTileId === 'character-geralt';

      ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      if (isSelected && this.activeTool === 'collider') {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        const hr = 5;

        // NW handle
        ctx.fillRect(boxX - hr, boxY - hr, hr * 2, hr * 2);
        ctx.strokeRect(boxX - hr, boxY - hr, hr * 2, hr * 2);

        // SE handle
        ctx.fillRect(boxX + boxW - hr, boxY + boxH - hr, hr * 2, hr * 2);
        ctx.strokeRect(boxX + boxW - hr, boxY + boxH - hr, hr * 2, hr * 2);
      }
    }

    // 2. Render Map Tiles & Invisible Colliders
    for (const layerName of layers) {
      const layer = this.tileMap.layers[layerName];
      if (!layer) continue;

      for (let ty = startRow; ty <= endRow; ty++) {
        for (let tx = startCol; tx <= endCol; tx++) {
          const cell = layer.get(this.tileMap.getKey(tx, ty));
          if (!cell || cell.isRoot === false) continue;

          const meta = this.assetLoader.getTileMetadata(cell.tileId);
          const col = cell.collider || meta?.collider;
          if (!col || !col.enabled) continue;

          const rotation = cell.rotation || 0;
          const totalW = (meta?.gridW || 1) * tileSize;
          const totalH = (meta?.gridH || 1) * tileSize;

          const isSelected = this.selectedTileId === cell.tileId;

          const renderSingleBox = (rawX, rawY, rawW, rawH, drawHandles = false) => {
            let relX = rawX;
            let relY = rawY;
            let boxW = rawW;
            let boxH = rawH;

            if (rotation === 90) {
              relX = totalH - (rawY + rawH);
              relY = rawX;
              boxW = rawH;
              boxH = rawW;
            } else if (rotation === 180) {
              relX = totalW - (rawX + rawW);
              relY = totalH - (rawY + rawH);
            } else if (rotation === 270) {
              relX = rawY;
              relY = totalW - (rawX + rawW);
              boxW = rawH;
              boxH = rawW;
            }

            const boxX = tx * tileSize + relX;
            const boxY = ty * tileSize + relY;

            // Draw semi-transparent collider box
            ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.18)';
            ctx.strokeStyle = isSelected ? '#ff4d4d' : 'rgba(239, 68, 68, 0.8)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.setLineDash(isSelected ? [] : [4, 4]);

            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.setLineDash([]);

            // Draw interactive resize handles if selected
            if (drawHandles && isSelected && this.activeTool === 'collider') {
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              const hr = 5;

              // NW handle
              ctx.fillRect(boxX - hr, boxY - hr, hr * 2, hr * 2);
              ctx.strokeRect(boxX - hr, boxY - hr, hr * 2, hr * 2);

              // SE handle
              ctx.fillRect(boxX + boxW - hr, boxY + boxH - hr, hr * 2, hr * 2);
              ctx.strokeRect(boxX + boxW - hr, boxY + boxH - hr, hr * 2, hr * 2);
            }
          };

          if (Array.isArray(col.boxes) && col.boxes.length > 0) {
            col.boxes.forEach((b, idx) => {
              renderSingleBox(b.x || 0, b.y || 0, b.w || tileSize, b.h || tileSize, idx === 0);
            });
          } else {
            const rawW = col.w || totalW;
            const rawH = col.h || totalH;
            const rawX = col.x || 0;
            const rawY = col.y || 0;
            renderSingleBox(rawX, rawY, rawW, rawH, true);
          }
        }
      }
    }
    ctx.restore();
  }
}
