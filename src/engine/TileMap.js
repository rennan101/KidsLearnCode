import { ModularAvatarRenderer } from './animation/ModularAvatarRenderer.js';
import { getNPCData, hasAvailableQuestForNpc } from './CharacterRegistry.js';
import { MASTER_NPC_CONFIGS } from './animation/NPCAppearanceGenerator.js';
import { DEFAULT_AVATAR_CONFIG } from './animation/AvatarConfig.js';
import { WaterWaveRenderer } from './WaterWaveRenderer.js';
import { WebGLWaterShader } from './WebGLWaterShader.js';
import { ShorelineFoamRenderer } from './ShorelineFoamRenderer.js';
import { WaterReflectionRenderer } from './WaterReflectionRenderer.js';
import { MagmaRenderer } from './MagmaRenderer.js';
import { WebGLMagmaShader } from './WebGLMagmaShader.js';
import { MagmaParticleEmitter } from './MagmaParticleEmitter.js';

export const TILE_SIZE = 64;

export class TileMap {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.avatarRenderer = new ModularAvatarRenderer();
    this.waterWaveRenderer = new WaterWaveRenderer();
    this.webGLWaterShader = new WebGLWaterShader();
    this.shorelineFoamRenderer = new ShorelineFoamRenderer();
    this.waterReflectionRenderer = new WaterReflectionRenderer();
    this.magmaRenderer = new MagmaRenderer();
    this.webGLMagmaShader = new WebGLMagmaShader();
    this.magmaParticleEmitter = new MagmaParticleEmitter();
    this.waterWaveTime = 0;
    this.lastRenderTime = performance.now();

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
    this.waterTimer = 0;
    this.waterAnimFrame = 0;
    this.waterFrameDuration = 120; // 120ms per animation frame

    // Performance Spatial Caches
    this.shorelineEdgeCache = null;
    this.reflectiveObjectsCache = null;
    this.spatialCacheDirty = true;

    // Dynamic Terrain Modification Systems (Ice Bridges, Water Evaporation, Puddles)
    this.temporaryIceTiles = new Map(); // key -> { tx, ty, originalTileId, expiresAt }
    this.temporaryPuddleTiles = new Map(); // key -> { tx, ty, expiresAt }

    // Ground Drop Items & Interactive Collectibles System ([F] to Pickup)
    this.groundItems = new Map(); // id -> { id, itemId, name, count, x, y, floatTimer, spawnTime }
    this.groundParticles = [];

    // Player default spawn position (snapped to 64px grid)
    this.spawnPoint = { x: 320, y: 320 };

    // Play Mode Global Camera Zoom & Visual Lens Effects (Configured by admin in World Editor)
    this.playCameraZoom = 1.0;
    this.tiltShiftBlur = 5; // Desfoque miniatura 2.5D (px)
  }

  setPlayCameraZoom(zoom) {
    this.playCameraZoom = Math.max(0.4, Math.min(3.0, Math.round(zoom * 100) / 100));
  }

  setTiltShiftBlur(blur) {
    this.tiltShiftBlur = Math.max(0, Math.min(20, Math.round(blur)));
  }

  /**
   * Remove automaticamente quaisquer NPCs ou Heróis posicionados em células de água.
   */
  removeCharactersOnWater(assetLoader = null) {
    const removed = [];
    const charLayer = this.layers.characters;
    if (charLayer) {
      for (const [key, cell] of charLayer.entries()) {
        const [tx, ty] = key.split(',').map(Number);
        const worldX = tx * this.tileSize + this.tileSize / 2;
        const worldY = ty * this.tileSize + this.tileSize / 2;
        if (this.isWaterAt(worldX, worldY, assetLoader)) {
          charLayer.delete(key);
          removed.push({ layer: 'characters', key, tx, ty });
        }
      }
    }

    for (const layerName of ['solid', 'decor']) {
      const layer = this.layers[layerName];
      if (!layer) continue;
      for (const [key, cell] of layer.entries()) {
        const tileId = cell?.tileId || (typeof cell === 'string' ? cell : '');
        if (tileId && (tileId.startsWith('npc_') || tileId.startsWith('char_') || tileId.startsWith('hero_'))) {
          const [tx, ty] = key.split(',').map(Number);
          const worldX = tx * this.tileSize + this.tileSize / 2;
          const worldY = ty * this.tileSize + this.tileSize / 2;
          if (this.isWaterAt(worldX, worldY, assetLoader)) {
            layer.delete(key);
            removed.push({ layer: layerName, key, tx, ty });
          }
        }
      }
    }
    return removed;
  }

  /**
   * Remove todos os NPCs e Heróis de todas as camadas do mapa para inserção limpa pelo Admin.
   */
  clearAllCharacters() {
    let count = 0;
    for (const layerName of ['characters', 'solid', 'decor']) {
      const layer = this.layers[layerName];
      if (!layer) continue;
      for (const [key, cell] of layer.entries()) {
        const tileId = cell?.tileId || (typeof cell === 'string' ? cell : '');
        if (tileId && (tileId.startsWith('npc_') || tileId.startsWith('char_') || tileId.startsWith('hero_') || tileId.startsWith('character-'))) {
          layer.delete(key);
          count++;
        }
      }
    }
    this.invalidateSpatialCaches();
    return count;
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

  setTile(layerName, x, y, tileId, isRoot = true, rootX = x, rootY = y, rotation = 0, flipX = false, collider = null, depthOffset = null, extraProps = null) {
    let actualLayerName = layerName;
    if (tileId === 'water-wind-waker' || tileId === 'water-animated' || tileId === 'magma-animated' || tileId === 'magma-stylized') {
      actualLayerName = 'ground';
      if (layerName !== 'ground' && this.layers[layerName]) {
        this.layers[layerName].delete(this.getKey(x, y));
      }
    }
    const layer = this.layers[actualLayerName];
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
      if (extraProps && extraProps.level !== undefined) {
        cellData.level = extraProps.level;
      } else if (existing && existing.tileId === tileId && existing.level !== undefined) {
        cellData.level = existing.level;
      }
      if (extraProps && Array.isArray(extraProps.stack)) {
        cellData.stack = extraProps.stack;
      } else if (existing && Array.isArray(existing.stack) && existing.tileId === tileId) {
        cellData.stack = existing.stack;
      }
      layer.set(key, cellData);
    }
    this.invalidateSpatialCaches();
  }

  // ==========================================
  // Tibia-Style Object Stacking System
  // ==========================================

  pushStackTile(layerName, x, y, tileId, rotation = 0, flipX = false, collider = null, depthOffset = null, extraProps = null) {
    const layer = this.layers[layerName];
    if (!layer) return false;
    const key = this.getKey(x, y);
    const existing = layer.get(key);

    if (!existing || !existing.tileId) {
      // Nenhum objeto existente: coloca como base
      this.setTile(layerName, x, y, tileId, true, x, y, rotation, flipX, collider, depthOffset, extraProps);
      return true;
    }

    // Inicializa a pilha se ainda não existir
    if (!Array.isArray(existing.stack)) {
      existing.stack = [];
    }

    // Limite máximo de até 4 itens empilhados
    if (existing.stack.length >= 3) {
      return false;
    }

    existing.stack.push({
      tileId,
      rotation: rotation || 0,
      flipX: !!flipX,
      collider,
      depthOffset,
      extraProps
    });

    this.invalidateSpatialCaches();
    return true;
  }

  popStackTile(layerName, x, y, assetLoader = null) {
    const layer = this.layers[layerName];
    if (!layer) return null;
    const key = this.getKey(x, y);
    const cell = layer.get(key);
    if (!cell) return null;

    // Se houver itens na pilha, remove o do topo (LIFO)
    if (Array.isArray(cell.stack) && cell.stack.length > 0) {
      const topItem = cell.stack.pop();
      const meta = assetLoader ? assetLoader.getTileMetadata(topItem.tileId) : null;
      this.invalidateSpatialCaches();
      return {
        isStacked: true,
        tileId: topItem.tileId,
        cellData: topItem,
        meta,
        stackHeight: cell.stack.length + 1
      };
    }

    // Caso contrário, remove o item base
    const meta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;
    this.deleteTile(x, y, layerName, assetLoader);
    return {
      isStacked: false,
      tileId: cell.tileId,
      cellData: cell,
      meta,
      stackHeight: 0
    };
  }

  getStackCount(layerName, x, y) {
    const layer = this.layers[layerName];
    if (!layer) return 0;
    const key = this.getKey(x, y);
    const cell = layer.get(key);
    if (!cell || !cell.tileId) return 0;
    return 1 + (Array.isArray(cell.stack) ? cell.stack.length : 0);
  }

  getTopStackedTile(layerName, x, y, assetLoader = null) {
    const layer = this.layers[layerName];
    if (!layer) return null;
    const key = this.getKey(x, y);
    const cell = layer.get(key);
    if (!cell || !cell.tileId) return null;

    if (Array.isArray(cell.stack) && cell.stack.length > 0) {
      const topItem = cell.stack[cell.stack.length - 1];
      const meta = assetLoader ? assetLoader.getTileMetadata(topItem.tileId) : null;
      return {
        isTopStacked: true,
        tileId: topItem.tileId,
        cellData: topItem,
        meta,
        stackIndex: cell.stack.length,
        totalStack: cell.stack.length + 1
      };
    }

    const meta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;
    return {
      isTopStacked: false,
      tileId: cell.tileId,
      cellData: cell,
      meta,
      stackIndex: 0,
      totalStack: 1
    };
  }

  // Invalidate pre-calculated spatial caches
  invalidateSpatialCaches() {
    this.spatialCacheDirty = true;
    this.shorelineEdgeCache = null;
    this.magmaShorelineEdgeCache = null;
    this.reflectiveObjectsCache = null;
  }

  // Pre-calculate and cache shoreline boundary cells for high performance foam rendering
  getShorelineEdges(forMagma = false) {
    const cacheKey = forMagma ? 'magmaShorelineEdgeCache' : 'shorelineEdgeCache';
    if (this[cacheKey] && !this.spatialCacheDirty) {
      return this[cacheKey];
    }

    const ground = this.layers.ground;
    if (!ground) return [];

    const edges = [];
    const isTargetLiquid = (tx, ty) => {
      const cell = ground.get(this.getKey(tx, ty));
      if (!cell || !cell.tileId) return false;
      const gid = cell.tileId.toLowerCase();
      if (forMagma) {
        return gid === 'magma-animated' || gid === 'magma-stylized' || gid.includes('magma') || gid.includes('lava');
      }
      return gid === 'water-animated' || gid === 'water-wind-waker' || gid.includes('water') || gid.includes('ocean');
    };

    const isDifferentLand = (tx, ty) => {
      return !isTargetLiquid(tx, ty);
    };

    for (const [key, cell] of ground.entries()) {
      if (!cell || !cell.tileId) continue;
      const [tx, ty] = key.split(',').map(Number);
      if (!isTargetLiquid(tx, ty)) continue;

      const north = isDifferentLand(tx, ty - 1);
      const south = isDifferentLand(tx, ty + 1);
      const west = isDifferentLand(tx - 1, ty);
      const east = isDifferentLand(tx + 1, ty);

      if (north || south || west || east) {
        edges.push({
          tx, ty,
          x: tx * this.tileSize,
          y: ty * this.tileSize,
          north, south, west, east
        });
      }
    }

    this[cacheKey] = edges;
    return edges;
  }

  // Pre-calculate and cache upright physical objects near water for reflections
  getReflectiveUprightObjects(assetLoader) {
    if (this.reflectiveObjectsCache && !this.spatialCacheDirty) {
      return this.reflectiveObjectsCache;
    }

    const ground = this.layers.ground;
    if (!ground) return [];

    const isWater = (tx, ty) => {
      const cell = ground.get(this.getKey(tx, ty));
      if (!cell || !cell.tileId) return false;
      const gid = cell.tileId.toLowerCase();
      return gid === 'water-animated' || gid === 'water-wind-waker' || gid.includes('water') || gid.includes('ocean');
    };

    const hasWaterNeighbor = (tx, ty) => {
      return isWater(tx, ty + 1) || isWater(tx, ty - 1) || isWater(tx + 1, ty) || isWater(tx - 1, ty) ||
             isWater(tx + 1, ty + 1) || isWater(tx - 1, ty + 1) || isWater(tx + 1, ty - 1) || isWater(tx - 1, ty - 1);
    };

    const reflectiveObjects = [];
    const layersToCheck = ['solid', 'decor'];

    for (const layerName of layersToCheck) {
      const layer = this.layers[layerName];
      if (!layer) continue;

      for (const [key, cell] of layer.entries()) {
        if (!cell || cell.isRoot === false || !cell.tileId) continue;
        const [tx, ty] = key.split(',').map(Number);

        const tileMeta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;
        if (!this.waterReflectionRenderer || !this.waterReflectionRenderer.isReflectiveUprightObject(cell.tileId, tileMeta)) continue;

        if (hasWaterNeighbor(tx, ty)) {
          const baseY = this.getCellBaseY(cell, tx, ty, assetLoader);
          reflectiveObjects.push({
            cell,
            tx,
            ty,
            destX: tx * this.tileSize,
            baseY
          });
        }
      }
    }

    this.reflectiveObjectsCache = reflectiveObjects;
    this.spatialCacheDirty = false;
    return reflectiveObjects;
  }

  // Multi-tile placement placing root and occupation references across grid area (accounting for rotation, flipX, and custom collider)
  placeMultiTile(layerName, startX, startY, tileMeta, rotation = 0, flipX = false, collider = null, depthOffset = null, extraProps = null) {
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
        this.setTile(layerName, tx, ty, tileMeta.id, isRoot, startX, startY, rotation, flipX, isRoot ? collider : null, isRoot ? depthOffset : null, isRoot ? extraProps : null);
      }
    }
  }

  getTile(layerName, x, y) {
    const layer = this.layers[layerName];
    if (!layer) return null;
    return layer.get(this.getKey(x, y)) || null;
  }

  // Check if world coordinate is over water (for water dragons, swimming and terrain filtering)
  isWaterAt(worldX, worldY, assetLoader = null) {
    const tx = Math.floor(worldX / this.tileSize);
    const ty = Math.floor(worldY / this.tileSize);
    const key = this.getKey(tx, ty);

    // If temporarily frozen with ice, it acts as solid ice surface (not water)
    if (this.temporaryIceTiles && this.temporaryIceTiles.has(key)) {
      return false;
    }

    // Check if there is ANY non-water covering tile on top of this coordinate (bridge, pier, solid, decor, top)
    const upperLayers = ['solid', 'decor', 'top'];
    for (const layerName of upperLayers) {
      const cell = this.layers[layerName]?.get(key);
      if (cell && cell.tileId) {
        const id = cell.tileId.toLowerCase();
        // If it's a bridge, platform, path, or any non-water structure, it covers the water
        const isWaterTile = id === 'water-wind-waker' || id === 'water-animated' || id.includes('water');
        if (!isWaterTile) {
          return false; // Covered by bridge, dock, path, roof, or object
        }
      }
    }

    const groundCell = this.layers.ground?.get(key);
    if (groundCell && groundCell.tileId) {
      const id = groundCell.tileId.toLowerCase();
      if (id === 'water-wind-waker' || id === 'water-animated' || id.includes('water') || id.includes('ocean') || id.includes('river')) {
        return true;
      }
      if (assetLoader) {
        const meta = assetLoader.getTileMetadata(groundCell.tileId);
        if (meta && (meta.category === 'Water' || meta.isWater)) return true;
      }
    }

    return false;
  }

  // Check if world coordinate is over magma/lava (for fire dragons, heat damage, embers, and physics)
  isMagmaAt(worldX, worldY, assetLoader = null) {
    const tx = Math.floor(worldX / this.tileSize);
    const ty = Math.floor(worldY / this.tileSize);
    const key = this.getKey(tx, ty);

    // Check if covered by bridges or solid structures
    const upperLayers = ['solid', 'decor', 'top', 'overhead'];
    for (const layerName of upperLayers) {
      const cell = this.layers[layerName]?.get(key);
      if (cell && cell.tileId) {
        const id = cell.tileId.toLowerCase();
        const isMagmaTile = id === 'magma-animated' || id === 'magma-stylized' || id.includes('magma') || id.includes('lava');
        if (!isMagmaTile) return false;
      }
    }

    const groundCell = this.layers.ground?.get(key);
    if (groundCell && groundCell.tileId) {
      const id = groundCell.tileId.toLowerCase();
      if (id === 'magma-animated' || id === 'magma-stylized' || id.includes('magma') || id.includes('lava')) {
        return true;
      }
      if (assetLoader) {
        const meta = assetLoader.getTileMetadata(groundCell.tileId);
        if (meta && (meta.isMagma || meta.category === 'Magma' || meta.category === 'Lava')) return true;
      }
    }

    return false;
  }

  // Move an asset (single or multi-tile) placed at (x, y) from fromLayer to toLayer
  moveTileLayer(x, y, fromLayer, toLayer, assetLoader = null) {
    if (!this.layers[fromLayer] || !this.layers[toLayer] || fromLayer === toLayer) return false;

    const cell = this.getTile(fromLayer, x, y);
    if (!cell) return false;

    const rootX = (cell.rootX !== undefined) ? cell.rootX : x;
    const rootY = (cell.rootY !== undefined) ? cell.rootY : y;
    const rootCell = this.getTile(fromLayer, rootX, rootY) || cell;
    const tileMeta = assetLoader ? assetLoader.getTileMetadata(rootCell.tileId) : null;
    const rotation = rootCell.rotation || 0;
    const flipX = !!rootCell.flipX;
    const collider = rootCell.collider || null;
    const depthOffset = (rootCell.depthOffset !== undefined) ? rootCell.depthOffset : null;
    const tileId = rootCell.tileId;

    // 1. Delete from old layer
    this.deleteTile(rootX, rootY, fromLayer, assetLoader);

    // 2. Place in new layer
    if (tileMeta && ((tileMeta.gridW && tileMeta.gridW > 1) || (tileMeta.gridH && tileMeta.gridH > 1))) {
      this.placeMultiTile(toLayer, rootX, rootY, tileMeta, rotation, flipX, collider, depthOffset);
    } else {
      this.setTile(toLayer, rootX, rootY, tileId, true, rootX, rootY, rotation, flipX, collider, depthOffset);
    }

    return true;
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
        this.invalidateSpatialCaches();
        return;
      }
    }
    this.invalidateSpatialCaches();
  }

  update(deltaTime) {
    this.waterTimer += deltaTime;
    this.waterWaveTime += deltaTime;
    if (this.waterTimer >= this.waterFrameDuration) {
      this.waterTimer = 0;
      this.waterAnimFrame = (this.waterAnimFrame + 1) % 8; // 8 water frames
    }

    // Update Temporary Ice Bridges Melting & Puddles Drying Cycle
    const now = Date.now();
    for (const [key, ice] of this.temporaryIceTiles.entries()) {
      if (now >= ice.expiresAt) {
        // Revert back to original water tile
        this.setTile('ground', ice.tx, ice.ty, ice.originalTileId || 'water-animated');
        this.temporaryIceTiles.delete(key);
      }
    }

    for (const [key, puddle] of this.temporaryPuddleTiles.entries()) {
      if (now >= puddle.expiresAt) {
        this.temporaryPuddleTiles.delete(key);
      }
    }

    // Update Ground Items floating physics & sparkle particles
    const dt = Math.min(deltaTime / 1000, 0.1);
    this.updateGroundItems(dt);
  }

  // =========================================================================
  // GROUND ITEMS & COLLECTIBLES SYSTEM ([F] to Pickup)
  // =========================================================================

  spawnGroundItem(itemId = 'stone', name = 'Pedra', count = 1, worldX = 0, worldY = 0) {
    const id = `drop_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.groundItems.set(id, {
      id,
      itemId,
      name,
      count,
      x: worldX,
      y: worldY,
      floatTimer: Math.random() * Math.PI * 2,
      spawnTime: Date.now()
    });

    // Particle burst upon spawning item
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 35;
      this.groundParticles.push({
        x: worldX,
        y: worldY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 20,
        color: itemId === 'stone' ? '#a8a29e' : '#19c8b9',
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3
      });
    }
    return id;
  }

  pickupNearbyGroundItem(playerX, playerY, inventorySystem = null, soundFX = null, radius = 64) {
    if (!this.groundItems || this.groundItems.size === 0) return { success: false };

    const px = playerX + 32;
    const py = playerY + 32;
    let closestItem = null;
    let closestDist = radius;

    for (const item of this.groundItems.values()) {
      const dist = Math.hypot(item.x - px, item.y - py);
      if (dist <= closestDist) {
        closestDist = dist;
        closestItem = item;
      }
    }

    if (closestItem) {
      this.groundItems.delete(closestItem.id);

      if (inventorySystem) {
        inventorySystem.addItem(closestItem.itemId, closestItem.count, {
          name: closestItem.name,
          category: 'resource',
          desc: 'Recurso mineral obtido de rochas da ilha.'
        });
      }

      if (soundFX) {
        if (typeof soundFX.playPop === 'function') soundFX.playPop(1.4);
        else if (typeof soundFX.playPickUp === 'function') soundFX.playPickUp();
      }

      // Pickup poof sparkle particles
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 40;
        this.groundParticles.push({
          x: closestItem.x,
          y: closestItem.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 25,
          color: '#fbbf24',
          size: 2.5 + Math.random() * 2.5,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.25
        });
      }

      return { success: true, item: closestItem };
    }

    return { success: false };
  }

  updateGroundItems(dt) {
    if (this.groundItems && this.groundItems.size > 0) {
      for (const item of this.groundItems.values()) {
        item.floatTimer += dt;
      }
    }

    if (this.groundParticles && this.groundParticles.length > 0) {
      for (let i = this.groundParticles.length - 1; i >= 0; i--) {
        const p = this.groundParticles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          this.groundParticles.splice(i, 1);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 60 * dt; // Gravity
        }
      }
    }
  }

  renderGroundItems(ctx, assetLoader, camera, playerX, playerY) {
    if (!this.groundItems || this.groundItems.size === 0) {
      // Render particles even if items are picked up
      if (this.groundParticles && this.groundParticles.length > 0) {
        this.renderGroundParticles(ctx);
      }
      return;
    }

    const px = playerX + 32;
    const py = playerY + 32;

    for (const item of this.groundItems.values()) {
      const bobY = Math.sin(item.floatTimer * 3.8) * 3.5;
      const drawX = item.x;
      const drawY = item.y + bobY;

      ctx.save();

      // 1. Soft ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
      ctx.beginPath();
      ctx.ellipse(item.x, item.y + 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render 3D Stylized Item on Ground
      if (item.itemId === 'stone') {
        // 3D Cel-Shade Stone Pebble
        ctx.save();
        ctx.translate(drawX, drawY);

        // Stone Base Body
        ctx.fillStyle = '#78716c';
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 4);
        ctx.lineTo(-6, -8);
        ctx.lineTo(6, -10);
        ctx.lineTo(12, -2);
        ctx.lineTo(8, 8);
        ctx.lineTo(-4, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Stone Facet Highlight
        ctx.fillStyle = '#a8a29e';
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(6, -10);
        ctx.lineTo(2, -1);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();

        // Shiny Top Edge
        ctx.strokeStyle = '#e7e5e4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-4, -7);
        ctx.lineTo(5, -9);
        ctx.stroke();

        ctx.restore();
      } else {
        // Generic round token
        ctx.fillStyle = '#19c8b9';
        ctx.strokeStyle = '#0f8e83';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 3. Proximity Interactive Pill Indicator (Animal Island UI Standard)
      const distToPlayer = Math.hypot(item.x - px, item.y - py);
      if (distToPlayer <= 64) {
        const pillY = drawY - 26;
        const text = `Pegar ${item.name}`;

        ctx.font = 'bold 11px "Nunito", sans-serif';
        const textMetrics = ctx.measureText(text);
        const pillW = textMetrics.width + 36;
        const pillH = 22;
        const pillX = drawX - pillW / 2;

        // 3D Depth Shadow
        ctx.fillStyle = '#0f8e83';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY + 2.5, pillW, pillH, 50);
        ctx.fill();

        // Main Parchment Pill
        ctx.fillStyle = '#fdfbf7';
        ctx.strokeStyle = '#19c8b9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 50);
        ctx.fill();
        ctx.stroke();

        // Key [F] Badge
        ctx.fillStyle = '#19c8b9';
        ctx.beginPath();
        ctx.roundRect(pillX + 3, pillY + 3, 16, 16, 50);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Nunito", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', pillX + 11, pillY + 11);

        // Prompt Label
        ctx.fillStyle = '#7a583e';
        ctx.font = 'bold 11px "Nunito", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, pillX + 23, pillY + 11);
      }

      ctx.restore();
    }

    if (this.groundParticles && this.groundParticles.length > 0) {
      this.renderGroundParticles(ctx);
    }
  }

  renderGroundParticles(ctx) {
    ctx.save();
    for (const p of this.groundParticles) {
      const alpha = 1.0 - (p.life / p.maxLife);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = p.color || '#fbbf24';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // ELEMENTAL DRAGON TERRAIN INTERACTIONS (ECOLOGICAL & REVERSIBLE)
  // =========================================================================

  // 1. Stone / Earth Dragon Strikes (Break into small rocks -> drop stones with [F] Pickup)
  interactStoneDragonAt(worldX, worldY, radius = 48, assetLoader = null) {
    const affected = [];
    const minTx = Math.floor((worldX - radius) / this.tileSize);
    const maxTx = Math.floor((worldX + radius) / this.tileSize);
    const minTy = Math.floor((worldY - radius) / this.tileSize);
    const maxTy = Math.floor((worldY + radius) / this.tileSize);

    const layers = ['solid', 'decor'];
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const cx = tx * this.tileSize + 32;
        const cy = ty * this.tileSize + 32;
        if (Math.hypot(cx - worldX, cy - worldY) <= radius) {
          for (const layerName of layers) {
            const cell = this.getTile(layerName, tx, ty);
            if (cell && cell.tileId) {
              const id = cell.tileId.toLowerCase();

              // Stage 1: Large Rock / Boulder -> Break into Smaller Rock ('rock-2')
              if (id === 'rock-1' || id.includes('boulder') || id.includes('rock_large') || id.includes('rock-large')) {
                this.setTile(layerName, tx, ty, 'rock-2');
                affected.push({ x: cx, y: cy, from: cell.tileId, to: 'rock-2', stage: 1 });

                // Dust and pebble particles
                for (let k = 0; k < 6; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() - 0.5) * 40,
                    vy: -15 - Math.random() * 25,
                    color: '#78716c',
                    size: 2.5 + Math.random() * 2,
                    life: 0,
                    maxLife: 0.4
                  });
                }
                break;
              }
              // Stage 2: Small Rock ('rock-2' or small stone) -> Break tile & Spawn Collectible Drop Item
              else if (id === 'rock-2' || id.includes('rock') || id.includes('stone') || id.includes('ore') || id.includes('mineral')) {
                this.deleteTile(tx, ty, layerName, assetLoader);
                this.spawnGroundItem('stone', 'Pedra', 1, cx, cy);
                affected.push({ x: cx, y: cy, from: cell.tileId, spawned: 'stone', stage: 2 });

                // Fracturing rock particles
                for (let k = 0; k < 10; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() - 0.5) * 60,
                    vy: -20 - Math.random() * 30,
                    color: '#a8a29e',
                    size: 3 + Math.random() * 2.5,
                    life: 0,
                    maxLife: 0.5
                  });
                }
                break;
              }
            }
          }
        }
      }
    }
    return affected;
  }

  // 2. Wind Dragon Strikes (Trees -> Stumps -> Sprouts, Flowers -> Small Flowers, Bushes -> Plain Bushes)
  interactWindDragonAt(worldX, worldY, radius = 48, assetLoader = null) {
    const affected = [];
    const minTx = Math.floor((worldX - radius) / this.tileSize);
    const maxTx = Math.floor((worldX + radius) / this.tileSize);
    const minTy = Math.floor((worldY - radius) / this.tileSize);
    const maxTy = Math.floor((worldY + radius) / this.tileSize);

    const layers = ['solid', 'decor', 'overhead'];
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const cx = tx * this.tileSize + 32;
        const cy = ty * this.tileSize + 32;
        if (Math.hypot(cx - worldX, cy - worldY) <= radius) {
          for (const layerName of layers) {
            const cell = this.getTile(layerName, tx, ty);
            if (cell && cell.tileId) {
              const id = cell.tileId.toLowerCase();

              // 1. Trees ('tree-1', 'tree-2', pines) -> Shaken by wind into Stumps ('stump')
              if (id.includes('tree') || id.includes('pine') || id.includes('palm')) {
                this.setTile(layerName, tx, ty, 'stump');
                affected.push({ x: cx, y: cy, from: cell.tileId, to: 'stump' });

                // Swirling leaf particles
                for (let k = 0; k < 8; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy - 20,
                    vx: (Math.random() - 0.5) * 50,
                    vy: -20 - Math.random() * 20,
                    color: '#15803d',
                    size: 3 + Math.random() * 2,
                    life: 0,
                    maxLife: 0.6
                  });
                }
                break;
              }
              // 2. Stumps ('stump') -> Pruned/germinated by wind into Sprouts ('sprout')
              else if (id.includes('stump')) {
                this.setTile(layerName, tx, ty, 'sprout');
                affected.push({ x: cx, y: cy, from: cell.tileId, to: 'sprout' });

                for (let k = 0; k < 6; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() - 0.5) * 35,
                    vy: -15 - Math.random() * 15,
                    color: '#84cc16',
                    size: 2.5 + Math.random() * 2,
                    life: 0,
                    maxLife: 0.5
                  });
                }
                break;
              }
              // 3. Flowers ('flower-blue', 'flower-red', 'flower-white') -> Small Flowers ('flower-small-1')
              else if (id.includes('flower') && !id.includes('small')) {
                this.setTile(layerName, tx, ty, 'flower-small-1');
                affected.push({ x: cx, y: cy, from: cell.tileId, to: 'flower-small-1' });

                for (let k = 0; k < 6; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() - 0.5) * 40,
                    vy: -15 - Math.random() * 20,
                    color: '#f472b6',
                    size: 2.5 + Math.random() * 2,
                    life: 0,
                    maxLife: 0.5
                  });
                }
                break;
              }
              // 4. Colorful Bushes ('bush-blue', 'bush-red', 'bush-white') -> Standard Green Bush ('bush')
              else if (id.startsWith('bush-') || (id.includes('bush') && id !== 'bush')) {
                this.setTile(layerName, tx, ty, 'bush');
                affected.push({ x: cx, y: cy, from: cell.tileId, to: 'bush' });

                for (let k = 0; k < 6; k++) {
                  this.groundParticles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() - 0.5) * 40,
                    vy: -15 - Math.random() * 20,
                    color: '#10b981',
                    size: 2.5 + Math.random() * 2,
                    life: 0,
                    maxLife: 0.5
                  });
                }
                break;
              }
            }
          }
        }
      }
    }
    return affected;
  }

  // Backwards-compatible terrain aliases that redirect safely to ecological interactions
  destroyVegetationAt(worldX, worldY, radius = 48, assetLoader = null) {
    return this.interactWindDragonAt(worldX, worldY, radius, assetLoader);
  }

  destroyRockAt(worldX, worldY, radius = 48, assetLoader = null) {
    return this.interactStoneDragonAt(worldX, worldY, radius, assetLoader);
  }

  // 3. Evaporate Water & Puddles into Dry Soil (Fire, Solar Heat)
  evaporateWaterAt(worldX, worldY, radius = 48, assetLoader = null) {
    const evaporated = [];
    const minTx = Math.floor((worldX - radius) / this.tileSize);
    const maxTx = Math.floor((worldX + radius) / this.tileSize);
    const minTy = Math.floor((worldY - radius) / this.tileSize);
    const maxTy = Math.floor((worldY + radius) / this.tileSize);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const cx = tx * this.tileSize + 32;
        const cy = ty * this.tileSize + 32;
        if (Math.hypot(cx - worldX, cy - worldY) <= radius) {
          const key = this.getKey(tx, ty);
          if (this.temporaryPuddleTiles.has(key)) {
            this.temporaryPuddleTiles.delete(key);
            evaporated.push({ x: cx, y: cy, type: 'puddle' });
          }
          const groundCell = this.layers.ground?.get(key);
          if (groundCell && groundCell.tileId) {
            const id = groundCell.tileId.toLowerCase();
            if (id === 'water-animated' || id.includes('water') || id.includes('river') || id.includes('ocean')) {
              this.setTile('ground', tx, ty, 'soil-01');
              evaporated.push({ x: cx, y: cy, type: 'water' });
            }
          }
        }
      }
    }
    return evaporated;
  }

  // 4. Freeze Water into Solid Walkable Ice Bridges (Ice, Frost)
  freezeWaterAt(worldX, worldY, radius = 48, durationSeconds = 10, assetLoader = null) {
    const frozen = [];
    const minTx = Math.floor((worldX - radius) / this.tileSize);
    const maxTx = Math.floor((worldX + radius) / this.tileSize);
    const minTy = Math.floor((worldY - radius) / this.tileSize);
    const maxTy = Math.floor((worldY + radius) / this.tileSize);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const cx = tx * this.tileSize + 32;
        const cy = ty * this.tileSize + 32;
        if (Math.hypot(cx - worldX, cy - worldY) <= radius) {
          const key = this.getKey(tx, ty);
          const groundCell = this.layers.ground?.get(key);
          if (groundCell && groundCell.tileId) {
            const id = groundCell.tileId.toLowerCase();
            if (id === 'water-animated' || id.includes('water') || id.includes('river') || id.includes('ocean')) {
              this.temporaryIceTiles.set(key, {
                tx,
                ty,
                originalTileId: groundCell.tileId,
                expiresAt: Date.now() + durationSeconds * 1000
              });
              frozen.push({ x: cx, y: cy, tx, ty });
            }
          }
        }
      }
    }
    return frozen;
  }

  // 5. Create Water Puddles on Soil / Grass (Water, Ocean, Rain)
  createPuddleAt(worldX, worldY, radius = 48, durationSeconds = 14) {
    const puddles = [];
    const minTx = Math.floor((worldX - radius) / this.tileSize);
    const maxTx = Math.floor((worldX + radius) / this.tileSize);
    const minTy = Math.floor((worldY - radius) / this.tileSize);
    const maxTy = Math.floor((worldY + radius) / this.tileSize);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const cx = tx * this.tileSize + 32;
        const cy = ty * this.tileSize + 32;
        if (Math.hypot(cx - worldX, cy - worldY) <= radius) {
          const key = this.getKey(tx, ty);
          this.temporaryPuddleTiles.set(key, {
            tx,
            ty,
            expiresAt: Date.now() + durationSeconds * 1000
          });
          puddles.push({ x: cx, y: cy, tx, ty });
        }
      }
    }
    return puddles;
  }

  /**
   * Universal AABB Collision checker against tile map colliders, solid layers, and water.
   * Used by Player, NPCs, Dragons, and projectiles.
   */
  checkCollision(boxX, boxY, boxW, boxH, assetLoader = null, ignoreWater = false, customLayers = null, ignoreCharacters = false) {
    const tileSize = this.tileSize || 64;
    const padding = 2;
    const startTileX = Math.floor(boxX / tileSize) - padding;
    const endTileX = Math.ceil((boxX + boxW) / tileSize) + padding;
    const startTileY = Math.floor(boxY / tileSize) - padding;
    const endTileY = Math.ceil((boxY + boxH) / tileSize) + padding;

    // Check water on ground layer if not explicitly ignored
    if (!ignoreWater) {
      const centerBoxX = boxX + boxW / 2;
      const centerBoxY = boxY + boxH / 2;
      if (this.isWaterAt(centerBoxX, centerBoxY, assetLoader)) {
        return true; // Water blocks walking entities
      }
    }

    const layersToCheck = customLayers || ['colliders', 'solid', 'characters', 'decor', 'ground', 'overhead'];
    for (const layerName of layersToCheck) {
      const layer = this.layers[layerName];
      if (!layer || layer.size === 0) continue;

      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          const cell = layer.get(this.getKey(tx, ty));
          if (!cell) continue;

          const meta = assetLoader ? assetLoader.getTileMetadata(cell.tileId) : null;

          // Se ignoreCharacters estiver ativo, ignora células que representam NPCs/Heróis dinâmicos
          if (ignoreCharacters) {
            const lowerId = (cell.tileId || '').toLowerCase();
            if (
              layerName === 'characters' ||
              cell.isCharacter ||
              meta?.isCharacter ||
              lowerId.startsWith('char_') ||
              lowerId.startsWith('npc_') ||
              lowerId.startsWith('hero_') ||
              lowerId.startsWith('char-') ||
              lowerId.startsWith('npc-') ||
              lowerId.startsWith('hero-')
            ) {
              continue;
            }
          }

          const isInvisibleCollider = (cell.tileId && cell.tileId.startsWith('invisible-collider')) || (cell.tileId && cell.tileId.includes('invisible'));
          if (cell.isRoot === false && !isInvisibleCollider) continue;

          let col = cell.collider || meta?.collider;

          // Fallback for invisible colliders
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
          const baseGridW = meta?.gridW || 1;
          const baseGridH = meta?.gridH || 1;
          const totalW = (isRotated90or270 ? baseGridH : baseGridW) * tileSize;
          const totalH = (isRotated90or270 ? baseGridW : baseGridH) * tileSize;

          const boxesToTest = (Array.isArray(col.boxes) && col.boxes.length > 0)
            ? col.boxes
            : [{ x: col.x || 0, y: col.y || 0, w: col.w || tileSize, h: col.h || tileSize }];

          for (const b of boxesToTest) {
            let relX = b.x || 0;
            let relY = b.y || 0;
            let bW = b.w || tileSize;
            let bH = b.h || tileSize;

            if (rotation === 90) {
              relX = totalH - ((b.y || 0) + (b.h || tileSize));
              relY = b.x || 0;
              bW = b.h || tileSize;
              bH = b.w || tileSize;
            } else if (rotation === 180) {
              relX = totalW - ((b.x || 0) + (b.w || tileSize));
              relY = totalH - ((b.y || 0) + (b.h || tileSize));
            } else if (rotation === 270) {
              relX = b.y || 0;
              relY = totalW - ((b.x || 0) + (b.w || tileSize));
              bW = b.h || tileSize;
              bH = b.w || tileSize;
            }

            const worldBoxX = tx * tileSize + relX;
            const worldBoxY = ty * tileSize + relY;

            if (
              boxX < worldBoxX + bW &&
              boxX + boxW > worldBoxX &&
              boxY < worldBoxY + bH &&
              boxY + boxH > worldBoxY
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  drawTileCell(ctx, cell, x, y, assetLoader, isEditor = false, showColliders = true, isReflection = false) {
    if (!cell || !cell.tileId) return;

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

    // Special Dragon Entity Canvas Renderer with Level Badge (Play Mode uses dynamic FSM in DragonManager)
    if (tileMeta.isDragon || cell.tileId.startsWith('dragon_')) {
      if (!isEditor) {
        return; // Rendered dynamically by DragonManager FSM
      }
      const dragonData = tileMeta.dragonData || {};
      const bodyColor = dragonData.color || '#38bdf8';
      const accentColor = dragonData.secondaryColor || '#fef08a';
      const level = cell.level || 1;

      ctx.save();
      const isFlipped = !!cell.flipX;
      if (isFlipped) {
        ctx.translate(destX + occW, destY);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(destX, destY);
      }

      // 1. Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(32, 54, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Wings with subtle animation
      const wingFlap = Math.sin((Date.now() / 200) + (x * 2 + y * 3)) * 4;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.ellipse(14, 28 + wingFlap, 11, 7, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(50, 28 - wingFlap, 11, 7, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Body & Belly
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(32, 36, 17, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.ellipse(32, 38, 10, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Head & Horns
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(32, 22, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(25, 14);
      ctx.lineTo(21, 5);
      ctx.lineTo(29, 12);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(39, 14);
      ctx.lineTo(43, 5);
      ctx.lineTo(35, 12);
      ctx.fill();

      // 5. Big Eyes & Sparkles
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(27, 21, 3, 0, Math.PI * 2);
      ctx.arc(37, 21, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, 20, 1.1, 0, Math.PI * 2);
      ctx.arc(36, 20, 1.1, 0, Math.PI * 2);
      ctx.fill();

      // 6. Rosy cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.beginPath();
      ctx.arc(23, 25, 2.4, 0, Math.PI * 2);
      ctx.arc(41, 25, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Overhead Level Badge (Animal Island UI 3D Pill, not flipped - omitted in reflections)
      if (!isReflection) {
        ctx.save();
        const lvlText = `Nv. ${level}`;
        ctx.font = 'bold 11px "Nunito", sans-serif';
        const textMetrics = ctx.measureText(lvlText);
        const badgeW = Math.max(38, textMetrics.width + 12);
        const badgeH = 17;
        const badgeX = destX + 32 - badgeW / 2;
        const badgeY = destY - 28;

        // Badge shadow 3D
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY + 2, badgeW, badgeH, 8);
        } else {
          ctx.rect(badgeX, badgeY + 2, badgeW, badgeH);
        }
        ctx.fill();

        // Badge body
        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#7a583e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lvlText, destX + 32, badgeY + badgeH / 2);
        ctx.restore();
      }

      return;
    }

    // Modular NPC Entity Cutout Renderer (Human/Anime Stylized with AvatarConfig)
    if ((cell.tileId.startsWith('npc_') || cell.tileId.startsWith('char_') || tileMeta.isNPC || tileMeta.isCharacter) && !tileMeta.isDragon && !cell.tileId.startsWith('dragon_')) {
      // No Modo Play, os NPCs e Heróis vivos são atualizados e renderizados dinamicamente pelo NPCManager
      if (!isEditor) {
        return;
      }

      const npcData = getNPCData(cell.tileId);
      const avatarConfig = npcData?.avatarConfig || MASTER_NPC_CONFIGS[cell.tileId] || (cell.tileId.startsWith('npc_') || cell.tileId.startsWith('char_') ? DEFAULT_AVATAR_CONFIG : null);
      if (avatarConfig && this.avatarRenderer) {
        const avatarScale = 0.33;
        const targetX = destX + 32;
        const targetY = destY + 60 - (265 * avatarScale);
        const animTime = performance.now() / 1000;

        // Render modular animated avatar (idle state)
        this.avatarRenderer.render(
          ctx,
          targetX,
          targetY,
          'south',
          'idle',
          animTime,
          avatarConfig,
          avatarScale
        );

        // Overhead NPC Name Badge & Quest Indicators (omitted in reflections)
        if (!isReflection) {
          ctx.save();
          const nameText = npcData.name || 'NPC';
          ctx.font = 'bold 10.5px "Nunito", sans-serif';
          const textMetrics = ctx.measureText(nameText);
          const badgeW = Math.max(44, textMetrics.width + 16);
          const badgeH = 18;
          const badgeX = destX + 32 - badgeW / 2;
          const badgeY = destY - 58; // Posicionado confortavelmente acima do avatar/cabeça

          // Badge shadow 3D
          ctx.fillStyle = '#7a583e';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY + 2.5, badgeW, badgeH, 9);
          } else {
            ctx.rect(badgeX, badgeY + 2.5, badgeW, badgeH);
          }
          ctx.fill();

          // Badge body
          ctx.fillStyle = '#fffdf5';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
          } else {
            ctx.rect(badgeX, badgeY, badgeW, badgeH);
          }
          ctx.fill();

          ctx.strokeStyle = '#c4b89e';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.fillStyle = '#794f27';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nameText, destX + 32, badgeY + badgeH / 2);
          ctx.restore();

          // Active Mission Indicator ("!" Animal Island UI Golden Quest Bubble - Apenas quando houver quest disponível agora)
          let hasActiveQuest = false;
          if (!isEditor) {
            const blockly = (typeof window !== 'undefined') ? window.gameBlocklySystem : null;
            hasActiveQuest = hasAvailableQuestForNpc(cell.tileId, blockly);
          }

          if (hasActiveQuest) {
            ctx.save();
            const qBob = Math.sin(animTime * 4.5 + (x * 2 + y)) * 3;
            const qX = destX + 32;
            const qY = badgeY - 16 + qBob;
            const qR = 10;

            // Quest shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.beginPath();
            ctx.arc(qX, qY + 2.5, qR, 0, Math.PI * 2);
            ctx.fill();

            // Quest 3D bottom edge
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(qX, qY + 1.5, qR, 0, Math.PI * 2);
            ctx.fill();

            // Quest bubble body
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(qX, qY, qR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Exclamation Mark "!"
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 13px "Outfit", "Nunito", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', qX, qY + 0.5);
            ctx.restore();
          }
        }

        return;
      }
    }

    // Wind Waker Water Tile
    if (tileMeta.isWaterWaves || cell.tileId === 'water-wind-waker') {
      if (this.waterWaveRenderer) {
        this.waterWaveRenderer.renderPreview(ctx, destX, destY, this.tileSize, this.waterWaveTime || performance.now());
      } else if (tileMeta.src) {
        const img = assetLoader.getImage(tileMeta.src);
        if (img) ctx.drawImage(img, destX, destY, rawW, rawH);
      }
      return;
    } else if (tileMeta.isMagma || cell.tileId === 'magma-animated' || cell.tileId === 'magma-stylized') {
      // MinionsArt Stylized Magma Tile
      if (this.magmaRenderer) {
        this.magmaRenderer.renderPreview(ctx, destX, destY, this.tileSize, this.waterWaveTime || performance.now());
      } else if (tileMeta.src) {
        const img = assetLoader.getImage(tileMeta.src);
        if (img) ctx.drawImage(img, destX, destY, rawW, rawH);
      }
      return;
    } else {
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
          // Add micro 0.5px overlap to guarantee zero sub-pixel seam lines between adjacent tiles
          const seamPad = (rawW === 64 && rawH === 64) ? 0.5 : 0;
          ctx.drawImage(img, destX, destY, rawW + seamPad, rawH + seamPad);
        }
      }
    }

    // Dynamic Frozen Ice Crystal Overlay on Water
    const cellKey = this.getKey(x, y);
    if (this.temporaryIceTiles && this.temporaryIceTiles.has(cellKey)) {
      ctx.save();
      // Frosted ice base
      ctx.fillStyle = 'rgba(186, 230, 253, 0.72)';
      ctx.fillRect(destX, destY, this.tileSize, this.tileSize);

      // Ice crystal borders & highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(destX + 1, destY + 1, this.tileSize - 2, this.tileSize - 2);

      // Geometric frost cracks
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(destX + 8, destY + 12);
      ctx.lineTo(destX + 28, destY + 32);
      ctx.lineTo(destX + 44, destY + 20);
      ctx.moveTo(destX + 28, destY + 32);
      ctx.lineTo(destX + 24, destY + 54);
      ctx.moveTo(destX + 38, destY + 42);
      ctx.lineTo(destX + 56, destY + 48);
      ctx.stroke();

      // Ice sparkle diamond
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(destX + 48, destY + 16, 2.5, 0, Math.PI * 2);
      ctx.arc(destX + 16, destY + 46, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dynamic Water Puddle Overlay
    if (this.temporaryPuddleTiles && this.temporaryPuddleTiles.has(cellKey)) {
      ctx.save();
      const wavePhase = (Date.now() / 400 + (x * 3 + y * 5)) % (Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.beginPath();
      ctx.ellipse(destX + 32, destY + 32, 24 + Math.sin(wavePhase) * 2, 16 + Math.cos(wavePhase) * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(destX + 32, destY + 32, 20 + Math.sin(wavePhase + 1) * 3, 12 + Math.cos(wavePhase + 1) * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Tibia-Style Render for Stacked Objects
    if (Array.isArray(cell.stack) && cell.stack.length > 0) {
      for (let sIdx = 0; sIdx < cell.stack.length; sIdx++) {
        const stackItem = cell.stack[sIdx];
        if (!stackItem || !stackItem.tileId) continue;
        const stackMeta = assetLoader.getTileMetadata(stackItem.tileId);
        if (!stackMeta) continue;

        // Cada item empilhado sobe visualmente 16px no eixo Y
        const stackOffsetY = -16 * (sIdx + 1);
        const sRot = stackItem.rotation || 0;
        const sRot90or270 = (sRot === 90 || sRot === 270);
        const sBaseGridW = stackMeta.gridW || 1;
        const sBaseGridH = stackMeta.gridH || 1;
        const sOccGridW = sRot90or270 ? sBaseGridH : sBaseGridW;
        const sOccGridH = sRot90or270 ? sBaseGridW : sBaseGridH;

        const sDestX = destX;
        const sDestY = destY + stackOffsetY;
        const sOccW = sOccGridW * this.tileSize;
        const sOccH = sOccGridH * this.tileSize;
        const sRawW = sBaseGridW * this.tileSize;
        const sRawH = sBaseGridH * this.tileSize;

        let sImg = null;
        if (stackMeta.isAnimated && stackMeta.frames) {
          sImg = assetLoader.getImage(stackMeta.frames[0]);
        } else if (stackMeta.src) {
          sImg = assetLoader.getImage(stackMeta.src);
        }

        if (sImg) {
          ctx.save();
          // Leve sombra sob o objeto empilhado para dar profundidade tátil
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.beginPath();
          ctx.ellipse(sDestX + sOccW / 2, sDestY + sOccH - 4, sOccW * 0.38, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          const sScale = stackMeta.scale || 1.0;
          const sDrawW = sRawW * sScale;
          const sDrawH = sRawH * sScale;
          const sFlipped = !!stackItem.flipX;

          if (sRot !== 0 || sScale !== 1.0 || sFlipped) {
            ctx.translate(sDestX + sOccW / 2, sDestY + sOccH / 2);
            if (sRot !== 0) ctx.rotate((sRot * Math.PI) / 180);
            if (sFlipped) ctx.scale(-1, 1);
            ctx.drawImage(sImg, -sDrawW / 2, -sDrawH / 2, sDrawW, sDrawH);
          } else {
            ctx.drawImage(sImg, sDestX, sDestY, sRawW, sRawH);
          }
          ctx.restore();
        }
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

  renderLayer(ctx, layerName, assetLoader, camera, isEditor = false, showColliders = true, renderContext = {}) {
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

    // Auto-migrate any stray water tiles on non-ground layers to ground
    if (layerName !== 'ground') {
      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const key = this.getKey(x, y);
          const cell = layer.get(key);
          if (cell && (cell.tileId === 'water-wind-waker' || cell.tileId === 'water-animated')) {
            layer.delete(key);
            if (this.layers.ground) {
              this.layers.ground.set(key, cell);
            }
          }
        }
      }
    }

    // Optimized batch rendering for procedural ocean waves
    if (layerName === 'ground' && this.waterWaveRenderer) {
      // Dynamically sync ocean water palette based on the time of day ONLY if explicitly configured
      if (this.waterWaveRenderer.config.autoDayNightPalette && renderContext?.dayNightSystem && typeof renderContext.dayNightSystem.getWaterPalette === 'function' && !isEditor) {
        const timePalette = renderContext.dayNightSystem.getWaterPalette();
        if (timePalette && this.waterWaveRenderer.config.paletteId !== timePalette) {
          this.waterWaveRenderer.setConfig({ paletteId: timePalette });
        }
      }

      const proceduralWaveCells = [];
      const magmaCells = [];
      const regularGroundCells = [];

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const cell = layer.get(this.getKey(x, y));
          if (!cell || cell.isRoot === false) continue;
          if (cell.tileId === 'water-wind-waker') {
            proceduralWaveCells.push({ x: x * this.tileSize, y: y * this.tileSize, tileSize: this.tileSize, cell, tx: x, ty: y });
          } else if (cell.tileId === 'magma-animated' || cell.tileId === 'magma-stylized') {
            magmaCells.push({ x: x * this.tileSize, y: y * this.tileSize, tileSize: this.tileSize, cell, tx: x, ty: y });
          } else {
            regularGroundCells.push({ x, y, cell });
          }
        }
      }

      if (proceduralWaveCells.length > 0) {
        let renderedWithWebGL = false;
        const config = this.waterWaveRenderer ? this.waterWaveRenderer.getConfig() : {};

        if (this.webGLWaterShader && this.webGLWaterShader.isSupported) {
          const timeSec = (this.waterWaveTime || performance.now()) / 1000;
          const shaderCanvas = this.webGLWaterShader.render(camW, camH, camX, camY, camZ, timeSec, config);

          if (shaderCanvas) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < proceduralWaveCells.length; i++) {
              const w = proceduralWaveCells[i];
              ctx.rect(w.x, w.y, w.tileSize + 0.5, w.tileSize + 0.5);
            }
            ctx.clip();
            ctx.drawImage(shaderCanvas, camX, camY, camW / camZ, camH / camZ);
            ctx.restore();
            renderedWithWebGL = true;
          }
        }

        if (!renderedWithWebGL && this.waterWaveRenderer) {
          this.waterWaveRenderer.renderBatch(ctx, proceduralWaveCells, this.waterWaveTime || performance.now());
        }

        // Render Dynamic Water Reflections (Flying Player, Dragons, NPCs, Shoreline Trees/Rocks)
        if (this.waterReflectionRenderer) {
          this.waterReflectionRenderer.renderReflections(
            ctx,
            this,
            assetLoader,
            proceduralWaveCells,
            { ...renderContext, camera, isEditor },
            this.waterWaveTime || performance.now()
          );
        }

        // Render overlays (ice/puddle/colliders) for wave cells
        for (let i = 0; i < proceduralWaveCells.length; i++) {
          const w = proceduralWaveCells[i];
          const cellKey = this.getKey(w.tx, w.ty);
          if (this.temporaryIceTiles && this.temporaryIceTiles.has(cellKey)) {
            this.drawTileCell(ctx, w.cell, w.tx, w.ty, assetLoader, isEditor, showColliders);
          }
        }
      }

      // MinionsArt Stylized Magma Batch Rendering
      if (magmaCells.length > 0) {
        let renderedMagmaWithWebGL = false;
        const magmaConfig = this.magmaRenderer ? this.magmaRenderer.getConfig() : {};
        const nowMs = this.waterWaveTime || performance.now();
        const dt = Math.min(0.1, (nowMs - (this.lastRenderTime || nowMs)) / 1000);
        this.lastRenderTime = nowMs;

        if (this.webGLMagmaShader && this.webGLMagmaShader.isSupported) {
          const timeSec = nowMs / 1000;
          const shaderCanvas = this.webGLMagmaShader.render(camW, camH, camX, camY, camZ, timeSec, magmaConfig);

          if (shaderCanvas) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < magmaCells.length; i++) {
              const m = magmaCells[i];
              ctx.rect(m.x, m.y, m.tileSize + 0.5, m.tileSize + 0.5);
            }
            ctx.clip();
            ctx.drawImage(shaderCanvas, camX, camY, camW / camZ, camH / camZ);
            ctx.restore();
            renderedMagmaWithWebGL = true;
          }
        }

        if (!renderedMagmaWithWebGL && this.magmaRenderer) {
          this.magmaRenderer.renderBatch(ctx, magmaCells, nowMs);
        }
      }

      for (let i = 0; i < regularGroundCells.length; i++) {
        const item = regularGroundCells[i];
        this.drawTileCell(ctx, item.cell, item.x, item.y, assetLoader, isEditor, showColliders);
      }
      return;
    }

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

    const serializeGroundItems = () => {
      const items = [];
      if (!this.groundItems) return items;
      for (const item of this.groundItems.values()) {
        items.push({
          id: item.id,
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          x: item.x,
          y: item.y
        });
      }
      return items;
    };

    return {
      version: '3.4',
      tileSize: this.tileSize,
      spawnPoint: this.spawnPoint,
      playCameraZoom: this.playCameraZoom || 1.0,
      tiltShiftBlur: (this.tiltShiftBlur !== undefined) ? this.tiltShiftBlur : 5,
      layerOrder: this.layerOrder,
      waterConfig: this.waterWaveRenderer ? this.waterWaveRenderer.getConfig() : null,
      magmaConfig: this.magmaRenderer ? this.magmaRenderer.getConfig() : null,
      groundItems: serializeGroundItems(),
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
    if (data.tiltShiftBlur !== undefined) {
      this.setTiltShiftBlur(data.tiltShiftBlur);
    }
    if (data.layerOrder && Array.isArray(data.layerOrder)) {
      this.setLayerOrder(data.layerOrder);
    }
    if (data.waterConfig && this.waterWaveRenderer) {
      this.waterWaveRenderer.setConfig(data.waterConfig);
    }
    if (data.magmaConfig && this.magmaRenderer) {
      this.magmaRenderer.setConfig(data.magmaConfig);
    }

    if (data.groundItems && Array.isArray(data.groundItems)) {
      this.groundItems = new Map();
      for (const item of data.groundItems) {
        if (item && item.id) {
          this.groundItems.set(item.id, {
            id: item.id,
            itemId: item.itemId || 'stone',
            name: item.name || 'Pedra',
            count: item.count || 1,
            x: item.x || 0,
            y: item.y || 0,
            floatTimer: Math.random() * Math.PI * 2,
            spawnTime: Date.now()
          });
        }
      }
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

    // Auto-migrate and strengthen any invisible colliders across all layers
    const ensureColliderDef = (cell) => {
      if (!cell || !cell.tileId) return;
      if (cell.tileId.startsWith('invisible-collider') || cell.tileId.includes('invisible')) {
        cell.isRoot = true;
        if (!cell.collider || !cell.collider.enabled) {
          if (cell.tileId === 'invisible-collider-top') {
            cell.collider = { enabled: true, x: 0, y: 0, w: 64, h: 20 };
          } else if (cell.tileId === 'invisible-collider-bottom') {
            cell.collider = { enabled: true, x: 0, y: 44, w: 64, h: 20 };
          } else if (cell.tileId === 'invisible-collider-left') {
            cell.collider = { enabled: true, x: 0, y: 0, w: 20, h: 64 };
          } else if (cell.tileId === 'invisible-collider-right') {
            cell.collider = { enabled: true, x: 44, y: 0, w: 20, h: 64 };
          } else if (cell.tileId === 'invisible-collider-corner-tl') {
            cell.collider = { enabled: true, x: 0, y: 0, w: 64, h: 20, boxes: [{ x: 0, y: 0, w: 64, h: 20 }, { x: 0, y: 20, w: 20, h: 44 }] };
          } else if (cell.tileId === 'invisible-collider-corner-tr') {
            cell.collider = { enabled: true, x: 0, y: 0, w: 64, h: 20, boxes: [{ x: 0, y: 0, w: 64, h: 20 }, { x: 44, y: 20, w: 20, h: 44 }] };
          } else if (cell.tileId === 'invisible-collider-corner-bl') {
            cell.collider = { enabled: true, x: 0, y: 44, w: 64, h: 20, boxes: [{ x: 0, y: 44, w: 64, h: 20 }, { x: 0, y: 0, w: 20, h: 44 }] };
          } else if (cell.tileId === 'invisible-collider-corner-br') {
            cell.collider = { enabled: true, x: 0, y: 44, w: 64, h: 20, boxes: [{ x: 0, y: 44, w: 64, h: 20 }, { x: 44, y: 0, w: 20, h: 44 }] };
          } else if (cell.tileId === 'invisible-collider-2x2') {
            cell.collider = { enabled: true, x: 0, y: 0, w: 128, h: 128 };
          } else {
            cell.collider = { enabled: true, x: 0, y: 0, w: 64, h: 64 };
          }
        }
      }
    };

    for (const [, cell] of this.layers.colliders.entries()) {
      ensureColliderDef(cell);
    }

    // Auto-migrate any invisible colliders in legacy layers to the dedicated colliders layer
    for (const [layerKey, layerMap] of Object.entries(this.layers)) {
      if (layerKey === 'colliders') continue;
      for (const [coordKey, cell] of layerMap.entries()) {
        if (cell && cell.tileId && (cell.tileId.startsWith('invisible-collider') || cell.tileId.includes('invisible'))) {
          ensureColliderDef(cell);
          if (!this.layers.colliders.has(coordKey)) {
            this.layers.colliders.set(coordKey, cell);
          }
          layerMap.delete(coordKey);
        }
      }
    }

    if (!this.layerOrder.includes('colliders')) {
      this.layerOrder.push('colliders');
    }

    this.invalidateSpatialCaches();
    return true;
  }
}
