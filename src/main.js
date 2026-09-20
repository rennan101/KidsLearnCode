// Main game entrypoint & loop coordinator with resizable drawer and collider panel sync

import { AssetLoader } from './engine/AssetLoader.js';
import { TileMap } from './engine/TileMap.js';
import { Player } from './engine/Player.js';
import { Camera } from './engine/Camera.js';
import { EditorController } from './editor/EditorController.js';
import { Minimap } from './engine/Minimap.js';

class RPGApplication {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWrapper = document.getElementById('canvas-wrapper');

    // Subsystems
    this.assetLoader = new AssetLoader();
    this.tileMap = new TileMap();
    this.player = new Player(320, 320);
    this.camera = new Camera();
    this.minimap = new Minimap(this.tileMap, this.assetLoader, this.player, this.camera);
    this.editorController = new EditorController(
      this.tileMap,
      this.assetLoader,
      this.camera,
      () => this.triggerAutoSave(),
      this.player
    );

    // Mode: 'play' or 'edit'
    this.mode = 'play';

    // FPS Counter
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Auto-save debouncing & persistence
    this.STORAGE_KEY = 'kidslean_rpg_world_map_v3';
    this.saveTimeout = null;
  }

  async init() {
    this.setupWindowResize();
    this.setupDrawerResizing();
    this.setupColliderPanel();
    this.setupPlayCameraZoomPanel();
    this.setupTileInspector();
    this.setupLayerManager();
    this.bindDOMEvents();

    // Preload all sprites and tiles
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    await this.assetLoader.loadAll((progress) => {
      const pct = Math.round(progress * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (progressText) progressText.innerText = `${pct}%`;
    });

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => (loadingScreen.style.display = 'none'), 400);
    }

    // Load saved map from local storage if present (with multi-key migration/fallback)
    this.loadFromLocalStorage();

    // Sync player collider and position with loaded data
    this.player.syncCollider(this.assetLoader);
    if (this.tileMap.spawnPoint) {
      this.player.setSpawn(this.tileMap.spawnPoint.x, this.tileMap.spawnPoint.y);
    }
    this.camera.follow(this.player.x + 32, this.player.y + 32, 1.0);

    // Populate the asset drawer
    this.populateAssetDrawer();

    // Periodic background auto-save (every 4 seconds)
    setInterval(() => this.saveToLocalStorage(true), 4000);

    // Auto-save on page unload/close/hide
    window.addEventListener('beforeunload', () => this.saveToLocalStorage(true));
    window.addEventListener('pagehide', () => this.saveToLocalStorage(true));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveToLocalStorage(true);
    });

    // Start game loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupWindowResize() {
    const resize = () => {
      const rect = this.canvasWrapper.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.canvas.width = Math.round(rect.width);
        this.canvas.height = Math.round(rect.height);
        this.camera.resize(this.canvas.width, this.canvas.height);
      }
    };
    window.addEventListener('resize', resize);
    this.updateCanvasDimensions = resize;
    resize();
  }

  // Mouse adjustable drawer on the left edge / corner
  setupDrawerResizing() {
    const resizer = document.getElementById('drawer-resizer');
    const drawer = document.getElementById('asset-drawer');
    if (!resizer || !drawer) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizer.classList.add('dragging');
      document.body.style.cursor = 'ew-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(260, Math.min(window.innerWidth * 0.7, window.innerWidth - e.clientX));
      drawer.style.width = `${newWidth}px`;
      const rect = this.canvasWrapper.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.camera.resize(rect.width, rect.height);
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
      }
    });
  }

  setupLayerManager() {
    const toggleBtn = document.getElementById('btn-toggle-layer-manager');
    const managerPanel = document.getElementById('layer-manager-panel');
    const listEl = document.getElementById('layer-manager-list');

    if (toggleBtn && managerPanel) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = managerPanel.style.display === 'none';
        managerPanel.style.display = isHidden ? 'flex' : 'none';
        toggleBtn.classList.toggle('active', isHidden);
        if (isHidden) {
          this.renderLayerManagerList();
        }
      });
    }

    this.renderLayerManagerList = () => {
      if (!listEl) return;
      listEl.innerHTML = '';

      const defs = this.tileMap.layerDefinitions || {
        characters: { id: 'characters', label: 'Personagens', color: '#ec4899', desc: 'Geralt / NPCs' },
        solid: { id: 'solid', label: 'Sólido', color: '#f59e0b', desc: 'Estruturas' },
        decor: { id: 'decor', label: 'Decoração', color: '#10b981', desc: 'Flora / Caminhos' },
        ground: { id: 'ground', label: 'Chão', color: '#3b82f6', desc: 'Água / Base' }
      };

      // Display from top to bottom (highest render index first)
      const displayOrder = [...this.tileMap.layerOrder].reverse();

      displayOrder.forEach((layerId, displayIdx) => {
        const actualIdx = this.tileMap.layerOrder.indexOf(layerId);
        const def = defs[layerId] || { label: layerId, color: '#94a3b8', desc: '' };
        const isTop = (actualIdx === this.tileMap.layerOrder.length - 1);
        const isBottom = (actualIdx === 0);

        const item = document.createElement('div');
        item.className = 'layer-order-item';
        item.innerHTML = `
          <div class="layer-order-left">
            <span class="layer-order-badge" style="background: ${def.color}20; color: ${def.color}; border: 1px solid ${def.color}50;">
              ${def.label}
            </span>
            <span class="layer-order-desc">${def.desc}</span>
          </div>
          <div class="layer-order-buttons">
            <button class="layer-move-btn btn-layer-up" title="Mover camada para cima (Ficar por cima)" ${isTop ? 'disabled' : ''}>▲</button>
            <button class="layer-move-btn btn-layer-down" title="Mover camada para baixo (Ficar por baixo)" ${isBottom ? 'disabled' : ''}>▼</button>
          </div>
        `;

        item.querySelector('.btn-layer-up')?.addEventListener('click', () => {
          if (this.tileMap.moveLayer(layerId, 'up')) {
            this.triggerAutoSave();
            this.renderLayerManagerList();
            this.showToast(`⬆️ Camada "${def.label}" movida para cima na hierarquia visual!`);
            // Refresh inspector if open
            if (this.editorController.selectedGridCell) {
              const { x, y } = this.editorController.selectedGridCell;
              this.editorController.inspectTileAt(x, y);
            }
          }
        });

        item.querySelector('.btn-layer-down')?.addEventListener('click', () => {
          if (this.tileMap.moveLayer(layerId, 'down')) {
            this.triggerAutoSave();
            this.renderLayerManagerList();
            this.showToast(`⬇️ Camada "${def.label}" movida para baixo na hierarquia visual!`);
            // Refresh inspector if open
            if (this.editorController.selectedGridCell) {
              const { x, y } = this.editorController.selectedGridCell;
              this.editorController.inspectTileAt(x, y);
            }
          }
        });

        listEl.appendChild(item);
      });
    };
  }

  setupTileInspector() {
    const inspectorPanel = document.getElementById('tile-inspector-panel');
    const titleEl = document.getElementById('inspector-coords-title');
    const listEl = document.getElementById('inspector-layers-list');
    const closeBtn = document.getElementById('btn-close-inspector');

    if (closeBtn && inspectorPanel) {
      closeBtn.addEventListener('click', () => {
        inspectorPanel.classList.remove('active');
        this.editorController.selectedGridCell = null;
      });
    }

    window.addEventListener('map-cell-inspected', (e) => {
      const { x, y, layers } = e.detail;
      if (!inspectorPanel || !listEl) return;

      inspectorPanel.classList.add('active');
      if (titleEl) {
        titleEl.innerText = `Célula [X: ${x}, Y: ${y}]`;
      }

      listEl.innerHTML = '';

      const defs = this.tileMap.layerDefinitions || {
        overhead: { id: 'overhead', label: 'Camada 5 (Topo)', color: '#8b5cf6', desc: 'Copa das Árvores / Telhados' },
        characters: { id: 'characters', label: 'Camada 4 (Personagens)', color: '#ec4899', desc: 'Geralt / NPCs' },
        solid: { id: 'solid', label: 'Camada 3 (Sólido)', color: '#f59e0b', desc: 'Estruturas / Barreiras' },
        decor: { id: 'decor', label: 'Camada 2 (Decoração)', color: '#10b981', desc: 'Flora / Caminhos' },
        ground: { id: 'ground', label: 'Camada 1 (Chão)', color: '#3b82f6', desc: 'Água / Terreno Base' }
      };

      // Top to bottom inspection matching visual hierarchy
      const displayLayers = [...(this.tileMap.layerOrder || ['ground', 'decor', 'solid', 'characters', 'overhead'])].reverse();

      displayLayers.forEach((key) => {
        const def = defs[key] || { label: key, color: '#94a3b8', desc: '' };
        const label = def.label;
        const color = def.color;
        const defaultName = def.desc || 'Vazio';

        const item = document.createElement('div');
        item.className = 'inspector-layer-item';

        const data = layers[key];
        const hasTile = !!data;
        const meta = data?.meta;

        let previewHtml = '';
        if (hasTile && meta) {
          const imgSrc = meta.isAnimated && meta.frames ? meta.frames[0] : meta.src;
          previewHtml = `<div class="layer-item-preview"><img src="${imgSrc}" alt="${meta.name}"></div>`;
        } else {
          previewHtml = `<div class="layer-item-preview empty"><span>∅</span></div>`;
        }

        const tileName = hasTile ? (meta?.name || data.tileId) : 'Vazio (Nenhum tile)';
        const rot = data?.rotation || 0;
        const details = hasTile 
          ? `${meta?.category || 'Geral'} • ${meta?.gridW || 1}x${meta?.gridH || 1}${rot ? ` • 🔄 ${rot}°` : ''}${meta?.collider?.enabled ? ' • [COL]' : ''}`
          : defaultName;

        item.innerHTML = `
          <div class="layer-item-header">
            <span class="layer-item-badge" style="background: ${color}20; color: ${color}; border-color: ${color}50;">${label}</span>
            <div class="layer-item-actions">
              ${hasTile ? `
                <button class="layer-action-btn rotate-layer-btn" title="Girar este tile (+90°)" data-x="${x}" data-y="${y}" data-layer="${key}" data-tile="${data.tileId}">
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                </button>
                <button class="layer-action-btn select-btn" title="Selecionar este asset para pintar" data-tile="${data.tileId}" data-layer="${key}" data-rot="${rot}">
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path>
                    <path d="M7.07 14.94c-1.66 0-3 1.34-3 3 0 1.5 1.5 2.06 2.5 3.06.4.4.9.6 1.43.6 1.7 0 3.07-1.37 3.07-3.06v-1.6"></path>
                  </svg>
                </button>
                <button class="layer-action-btn delete-btn" title="Apagar apenas este tile desta camada" data-x="${x}" data-y="${y}" data-layer="${key}">
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              ` : `
                <button class="layer-action-btn place-btn" title="Mudar camada ativa para ${key}" data-layer="${key}">
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              `}
            </div>
          </div>
          <div class="layer-item-body ${hasTile ? 'has-content' : 'empty'}">
            ${previewHtml}
            <div class="layer-item-info">
              <div class="layer-item-title">${tileName}</div>
              <div class="layer-item-sub">${details}</div>
            </div>
          </div>
        `;

        // Bind quick buttons
        const rotateBtn = item.querySelector('.rotate-layer-btn');
        if (rotateBtn) {
          rotateBtn.addEventListener('click', () => {
            const targetLayer = rotateBtn.dataset.layer;
            const tx = parseInt(rotateBtn.dataset.x, 10);
            const ty = parseInt(rotateBtn.dataset.y, 10);
            const cell = this.tileMap.getTile(targetLayer, tx, ty);
            if (cell) {
              const currentRot = cell.rotation || 0;
              const nextRot = (currentRot + 90) % 360;
              this.editorController.recordState();
              
              const rootX = (cell.rootX !== undefined) ? cell.rootX : tx;
              const rootY = (cell.rootY !== undefined) ? cell.rootY : ty;
              const tileMeta = this.assetLoader.getTileMetadata(cell.tileId);

              // If multi-tile, delete old footprint and re-place rotated
              if (tileMeta && ((tileMeta.gridW && tileMeta.gridW > 1) || (tileMeta.gridH && tileMeta.gridH > 1))) {
                this.tileMap.deleteTile(rootX, rootY, targetLayer, this.assetLoader);
                this.tileMap.placeMultiTile(targetLayer, rootX, rootY, tileMeta, nextRot);
              } else {
                this.tileMap.setTile(targetLayer, tx, ty, cell.tileId, true, tx, ty, nextRot);
              }

              this.triggerAutoSave();
              this.editorController.inspectTileAt(tx, ty);
              this.showToast(`🔄 Asset rotacionado para ${nextRot}°!`);
            }
          });
        }

        const selectBtn = item.querySelector('.select-btn');
        if (selectBtn) {
          selectBtn.addEventListener('click', () => {
            const tileId = selectBtn.dataset.tile;
            const targetLayer = selectBtn.dataset.layer;
            const targetRot = parseInt(selectBtn.dataset.rot, 10) || 0;
            this.editorController.setSelectedTile(tileId);
            this.editorController.setLayer(targetLayer);
            this.editorController.setRotation(targetRot);
            this.editorController.setTool('brush');
            document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
            document.getElementById('tool-brush')?.classList.add('active');
            this.showToast(`🖌️ Asset "${tileName}" selecionado (${targetRot}°) para pintar na camada ${targetLayer}!`);
          });
        }

        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            const targetLayer = deleteBtn.dataset.layer;
            const tx = parseInt(deleteBtn.dataset.x, 10);
            const ty = parseInt(deleteBtn.dataset.y, 10);
            this.editorController.recordState();
            this.tileMap.setTile(targetLayer, tx, ty, null);
            this.triggerAutoSave();
            this.editorController.inspectTileAt(tx, ty);
            this.showToast(`🗑️ Tile removido da camada ${targetLayer}!`);
          });
        }

        const placeBtn = item.querySelector('.place-btn');
        if (placeBtn) {
          placeBtn.addEventListener('click', () => {
            const targetLayer = placeBtn.dataset.layer;
            this.editorController.setLayer(targetLayer);
            this.showToast(`🎯 Camada ativa alterada para ${targetLayer}!`);
          });
        }

        listEl.appendChild(item);
      });
    });
  }

  setupColliderPanel() {
    const titleEl = document.getElementById('collider-tile-title');
    const enableCb = document.getElementById('collider-enable-cb');
    const inX = document.getElementById('collider-input-x');
    const inY = document.getElementById('collider-input-y');
    const inW = document.getElementById('collider-input-w');
    const inH = document.getElementById('collider-input-h');

    const scalePanel = document.getElementById('character-scale-panel');
    const scaleVal = document.getElementById('character-scale-val');
    const scaleSlider = document.getElementById('character-scale-slider');
    const scalePresetBtns = document.querySelectorAll('.scale-btn');

    const updateScaleUI = (scale) => {
      const s = Math.round(scale * 100) / 100;
      if (scaleVal) scaleVal.innerText = `${s}x`;
      if (scaleSlider) scaleSlider.value = s;
      scalePresetBtns.forEach((btn) => {
        const btnVal = parseFloat(btn.dataset.scale);
        btn.classList.toggle('active', Math.abs(btnVal - s) < 0.04);
      });
    };

    let selectedCellContext = null; // { tileId, layerName, x, y }

    const updatePanelForTile = (tileId, detail = null) => {
      const meta = this.assetLoader.getTileMetadata(tileId);
      if (!meta) return;

      selectedCellContext = detail ? { ...detail } : null;

      if (titleEl) {
        if (selectedCellContext && selectedCellContext.x !== undefined) {
          titleEl.innerText = `Collider: ${meta.name} [X: ${selectedCellContext.x}, Y: ${selectedCellContext.y}]`;
        } else {
          titleEl.innerText = `Collider: ${meta.name} (Padrão)`;
        }
      }

      // Show/Hide Character Scale section
      if (scalePanel) {
        if (meta.isCharacter) {
          scalePanel.style.display = 'flex';
          updateScaleUI(meta.scale || 1.0);
        } else {
          scalePanel.style.display = 'none';
        }
      }

      let col = detail?.collider;
      if (selectedCellContext?.layerName && selectedCellContext?.x !== undefined) {
        const cell = this.tileMap.getTile(selectedCellContext.layerName, selectedCellContext.x, selectedCellContext.y);
        if (cell && !col) {
          col = cell.collider;
        }
      }
      if (!col) {
        col = meta.collider || {
          enabled: false,
          x: 0,
          y: 0,
          w: (meta.gridW || 1) * 64,
          h: (meta.gridH || 1) * 64
        };
      }

      if (enableCb) enableCb.checked = !!col.enabled;
      if (inX) inX.value = col.x || 0;
      if (inY) inY.value = col.y || 0;
      if (inW) inW.value = col.w || (meta.gridW || 1) * 64;
      if (inH) inH.value = col.h || (meta.gridH || 1) * 64;
    };

    const saveScale = (scale) => {
      const tileId = this.editorController.selectedTileId;
      const meta = this.assetLoader.getTileMetadata(tileId);
      if (!meta || !meta.isCharacter) return;

      this.assetLoader.setCharacterScale(tileId, scale);
      updateScaleUI(scale);

      if (tileId === 'character-geralt' && this.player) {
        this.player.setScale(scale);
      }
      this.showToast(`📏 Escala do personagem alterada para ${scale}x!`);
    };

    // Slider input
    scaleSlider?.addEventListener('input', (e) => {
      saveScale(parseFloat(e.target.value) || 1.0);
    });

    // Preset buttons
    scalePresetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = parseFloat(btn.dataset.scale) || 1.0;
        saveScale(s);
      });
    });

    const saveColliderFromInputs = () => {
      const tileId = this.editorController.selectedTileId;
      const meta = this.assetLoader.getTileMetadata(tileId);
      if (!meta) return;

      const enabled = enableCb.checked;
      const x = Math.max(0, parseInt(inX.value, 10) || 0);
      const y = Math.max(0, parseInt(inY.value, 10) || 0);
      const w = Math.max(4, parseInt(inW.value, 10) || 64);
      const h = Math.max(4, parseInt(inH.value, 10) || 64);

      const colData = { enabled, x, y, w, h };

      if (selectedCellContext && selectedCellContext.layerName && selectedCellContext.x !== undefined) {
        // Apply to this individual tile instance
        const layer = this.tileMap.layers[selectedCellContext.layerName];
        if (layer) {
          const cell = layer.get(this.tileMap.getKey(selectedCellContext.x, selectedCellContext.y));
          if (cell) {
            cell.collider = colData;
            this.triggerAutoSave();
          }
        }
      } else {
        // Fallback default prototype
        this.assetLoader.setTileCollider(tileId, colData);
        if (tileId === 'character-geralt') {
          this.player.syncCollider(this.assetLoader);
        }
        this.populateAssetDrawer(); // refresh badges
      }
    };

    [enableCb, inX, inY, inW, inH].forEach((input) => {
      input?.addEventListener('input', saveColliderFromInputs);
      input?.addEventListener('change', saveColliderFromInputs);
    });

    window.addEventListener('tile-collider-selected', (e) => {
      if (e.detail?.tileId) updatePanelForTile(e.detail.tileId, e.detail);
    });

    window.addEventListener('tile-collider-updated', (e) => {
      if (e.detail?.tileId) updatePanelForTile(e.detail.tileId, e.detail);
    });
  }

  setupPlayCameraZoomPanel() {
    const zoomValEl = document.getElementById('play-camera-zoom-val');
    const zoomSlider = document.getElementById('play-camera-zoom-slider');
    const presetBtns = document.querySelectorAll('.cam-preset-btn');

    this.updatePlayCameraZoomUI = (zoom) => {
      const z = Math.round((zoom || 1.0) * 100) / 100;
      if (zoomValEl) zoomValEl.innerText = `${z.toFixed(2)}x`;
      if (zoomSlider) zoomSlider.value = z;
      presetBtns.forEach((btn) => {
        const btnVal = parseFloat(btn.dataset.zoom);
        btn.classList.toggle('active', Math.abs(btnVal - z) < 0.04);
      });
    };

    const applyZoom = (zoom) => {
      const clamped = Math.max(0.4, Math.min(3.0, zoom));
      this.tileMap.setPlayCameraZoom(clamped);
      this.updatePlayCameraZoomUI(clamped);
      if (this.mode === 'play') {
        this.camera.zoom = clamped;
      }
      this.triggerAutoSave();
    };

    zoomSlider?.addEventListener('input', (e) => {
      applyZoom(parseFloat(e.target.value) || 1.0);
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const z = parseFloat(btn.dataset.zoom) || 1.0;
        applyZoom(z);
        this.showToast(`🎥 Zoom da câmera de jogo definido para ${z}x!`);
      });
    });

    // Initialize UI with current tileMap setting
    this.updatePlayCameraZoomUI(this.tileMap.playCameraZoom || 1.0);
  }

  bindDOMEvents() {
    // Blur any active input when clicking canvas so WASD always works
    this.canvas.addEventListener('mousedown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
      if (this.mode === 'edit') {
        this.editorController.handleMouseDown(e, this.canvas);
      }
    });

    // Reset keys on window blur so keys never get stuck
    window.addEventListener('blur', () => {
      this.player.resetKeys();
      this.editorController.resetKeys();
    });

    // Keyboard input handling for Play (Geralt) and Edit (Camera Pan & Shortcuts)
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;

      if (this.mode === 'play') {
        if (e.key === 'f' || e.key === 'F') {
          this.camera.follow(this.player.x + 32, this.player.y + 32, 1.0);
          this.showToast('🎯 Câmera centralizada no Geralt [F]');
          return;
        }
        this.player.handleKeyDown(e.key);
      } else if (this.mode === 'edit') {
        this.editorController.handleKeyDown(e);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.mode === 'play') {
        this.player.handleKeyUp(e.key);
      } else if (this.mode === 'edit') {
        this.editorController.handleKeyUp(e.key);
      }
    });

    // Mouse events for editor
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.mode === 'edit') {
        this.editorController.handleMouseMove(e, this.canvas);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.mode === 'edit') {
        this.editorController.handleMouseUp();
      }
    });

    // Mouse wheel zoom in Editor Mode (smooth cursor-anchored zoom)
    this.canvas.addEventListener('wheel', (e) => {
      if (this.mode === 'edit') {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseScreenX = e.clientX - rect.left;
        const mouseScreenY = e.clientY - rect.top;

        // World pos before zoom
        const worldPosBefore = this.camera.screenToWorld(mouseScreenX, mouseScreenY);

        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
        const newZoom = Math.max(0.3, Math.min(3.5, this.camera.zoom * zoomFactor));
        this.camera.zoom = newZoom;

        // Reposition camera so mouse points to the exact same world coordinate
        this.camera.x = worldPosBefore.x - mouseScreenX / newZoom;
        this.camera.y = worldPosBefore.y - mouseScreenY / newZoom;
      }
    }, { passive: false });

    // Prevent context menu in editor for right click erasing
    this.canvas.addEventListener('contextmenu', (e) => {
      if (this.mode === 'edit') {
        e.preventDefault();
      }
    });

    // Mode Toggle Buttons
    const btnPlay = document.getElementById('btn-mode-play');
    const btnEdit = document.getElementById('btn-mode-edit');
    const editorTools = document.getElementById('editor-tools');
    const playHint = document.getElementById('play-hint');
    const assetDrawer = document.getElementById('asset-drawer');
    const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
    const statusMode = document.getElementById('status-mode');
    const btnToggleColliders = document.getElementById('btn-toggle-colliders');

    btnPlay.addEventListener('click', () => {
      this.mode = 'play';
      this.player.resetKeys();
      this.editorController.resetKeys();
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      // Apply the configured Play Mode camera zoom
      this.camera.zoom = this.tileMap.playCameraZoom || 1.0;

      btnPlay.classList.add('active');
      btnEdit.classList.remove('active');
      editorTools.style.display = 'none';
      playHint.style.display = 'flex';
      assetDrawer.classList.add('collapsed');
      btnToggleDrawer.style.display = 'none';
      this.canvasWrapper.classList.remove('editing');
      if (statusMode) statusMode.innerText = 'PLAY';

      if (this.updateCanvasDimensions) {
        this.updateCanvasDimensions();
      }

      // Snap camera directly onto Geralt so playmode never starts on empty black space
      this.camera.follow(this.player.x + 32, this.player.y + 32, 1.0);
      this.saveToLocalStorage(true);
    });

    btnEdit.addEventListener('click', () => {
      this.mode = 'edit';
      this.player.resetKeys();
      this.editorController.resetKeys();
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      btnEdit.classList.add('active');
      btnPlay.classList.remove('active');
      editorTools.style.display = 'flex';
      playHint.style.display = 'none';
      assetDrawer.classList.remove('collapsed');
      btnToggleDrawer.style.display = 'flex';
      this.canvasWrapper.classList.add('editing');
      if (statusMode) statusMode.innerText = 'EDIT';

      if (this.updateCanvasDimensions) {
        this.updateCanvasDimensions();
      }

      // Center camera immediately on Geralt in Editor Mode so player is 100% visible and centered
      this.editorController.focusPlayer();

      this.saveToLocalStorage(true);
    });

    // Toggle Colliders Overlay
    btnToggleColliders?.addEventListener('click', () => {
      this.editorController.showColliders = !this.editorController.showColliders;
      btnToggleColliders.classList.toggle('active', this.editorController.showColliders);
      const toolColBtn = document.getElementById('tool-collider');
      if (toolColBtn) toolColBtn.classList.toggle('active', this.editorController.showColliders);
      this.showToast(this.editorController.showColliders ? '🛡️ Colisores visíveis no mapa!' : '👁️ Colisores ocultados!');
    });

    // Drawer toggle button
    btnToggleDrawer.addEventListener('click', () => {
      assetDrawer.classList.toggle('collapsed');
    });

    // Editor Tools Selection
    const tools = ['select', 'brush', 'fill', 'spawn', 'collider', 'eraser', 'eyedropper'];
    const setActiveToolUI = (toolName) => {
      tools.forEach((t) => {
        const b = document.getElementById(`tool-${t}`);
        if (b) {
          if (t === 'collider') {
            b.classList.toggle('active', this.editorController.showColliders);
          } else {
            b.classList.toggle('active', t === toolName);
          }
        }
      });
    };

    tools.forEach((toolName) => {
      const btn = document.getElementById(`tool-${toolName}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (toolName === 'collider') {
            // Toggle collider visibility on/off
            this.editorController.showColliders = !this.editorController.showColliders;
            btn.classList.toggle('active', this.editorController.showColliders);
            if (btnToggleColliders) btnToggleColliders.classList.toggle('active', this.editorController.showColliders);
            this.showToast(this.editorController.showColliders ? '🛡️ Colisores visíveis no mapa!' : '👁️ Colisores ocultados!');
            
            if (this.editorController.showColliders) {
              this.editorController.setTool('collider');
            } else if (this.editorController.activeTool === 'collider') {
              this.editorController.setTool('brush');
              setActiveToolUI('brush');
            }
          } else {
            setActiveToolUI(toolName);
            this.editorController.setTool(toolName);
          }
        });
      }
    });

    // Sync tool UI on keyboard activation
    window.addEventListener('editor-tool-activated', (e) => {
      if (e.detail?.tool) {
        setActiveToolUI(e.detail.tool);
      }
      if (e.detail?.showColliders !== undefined) {
        if (btnToggleColliders) btnToggleColliders.classList.toggle('active', e.detail.showColliders);
        this.showToast(e.detail.showColliders ? '🛡️ Colisores visíveis no mapa!' : '👁️ Colisores ocultados!');
      }
    });

    // Rotate Tool Button
    const btnRotate = document.getElementById('tool-rotate');
    btnRotate?.addEventListener('click', () => {
      const newRot = this.editorController.rotateActiveAsset();
      this.showToast(`🔄 Rotação do pincel: ${newRot}°`);
    });

    // Flip / Mirror Tool Button
    const btnFlip = document.getElementById('tool-flip');
    btnFlip?.addEventListener('click', () => {
      const isFlipped = this.editorController.flipActiveAsset();
      btnFlip.classList.toggle('active', isFlipped);
      this.showToast(isFlipped ? '⇄ Asset espelhado horizontalmente!' : '⇄ Asset restaurado ao normal!');
    });

    window.addEventListener('editor-flip-changed', (e) => {
      if (btnFlip && e.detail?.flipX !== undefined) {
        btnFlip.classList.toggle('active', !!e.detail.flipX);
      }
    });

    // Undo / Redo Buttons
    document.getElementById('btn-undo')?.addEventListener('click', () => {
      if (this.editorController.undo()) {
        this.showToast('↩️ Ação desfeita (Undo)');
      }
    });

    document.getElementById('btn-redo')?.addEventListener('click', () => {
      if (this.editorController.redo()) {
        this.showToast('↪️ Ação refeita (Redo)');
      }
    });

    // Focus Geralt [F] Button
    document.getElementById('btn-focus-player')?.addEventListener('click', () => {
      this.editorController.focusPlayer();
      this.showToast('🎯 Câmera centralizada no Geralt [F]');
    });

    // Layer segment buttons in drawer
    document.querySelectorAll('.layer-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const layer = btn.dataset.layer;
        if (layer) {
          this.editorController.setLayer(layer);
        }
      });
    });

    // Zoom buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.camera.zoom = Math.min(3.0, this.camera.zoom + 0.25);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.camera.zoom = Math.max(0.5, this.camera.zoom - 0.25);
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.camera.zoom = 1.0;
    });

    // Map Save / Load JSON
    document.getElementById('btn-save-json')?.addEventListener('click', () => this.exportMapJSON());
    const fileInput = document.getElementById('file-input-json');
    document.getElementById('btn-load-json')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => this.importMapJSON(e));

    // Clear Map (Resets to Black Void)
    document.getElementById('btn-clear-map')?.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja limpar todo o mapa do mundo?')) {
        this.editorController.recordState();
        this.tileMap = new TileMap();
        this.editorController.tileMap = this.tileMap;
        this.minimap.tileMap = this.tileMap;
        this.editorController.undoManager.tileMap = this.tileMap;
        this.saveToLocalStorage(true);
        this.showToast('🗑️ Mapa limpo com sucesso!');
      }
    });

    // Refresh / Scan New Assets Button
    const btnRefresh = document.getElementById('btn-refresh-assets');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        btnRefresh.classList.add('spinning');
        try {
          const addedCount = await this.assetLoader.refreshAssets();
          this.populateAssetDrawer();
          if (addedCount > 0) {
            this.showToast(`✅ ${addedCount} novos assets encontrados e carregados!`);
          } else {
            this.showToast('✨ Todos os assets da pasta já estão atualizados!');
          }
        } catch (err) {
          console.error('Error refreshing assets:', err);
          this.showToast('⚠️ Erro ao atualizar assets da pasta.');
        } finally {
          btnRefresh.classList.remove('spinning');
        }
      });
    }
  }

  showToast(message, duration = 3200) {
    const toast = document.getElementById('rpg-toast');
    if (!toast) return;
    toast.innerHTML = `<span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  populateAssetDrawer() {
    const grid = document.getElementById('tile-drawer-grid');
    const tabsContainer = document.getElementById('category-tabs');
    if (!grid || !tabsContainer) return;

    const renderGrid = (filterCat = 'All') => {
      grid.innerHTML = '';
      const tiles = this.assetLoader.overworldTiles.filter(
        (t) => filterCat === 'All' || t.category === filterCat
      );

      tiles.forEach((tile) => {
        const card = document.createElement('div');
        card.className = `tile-card ${this.editorController.selectedTileId === tile.id ? 'selected' : ''}`;
        card.dataset.id = tile.id;

        const previewBox = document.createElement('div');
        previewBox.className = 'tile-preview-box';

        const img = document.createElement('img');
        img.src = tile.isAnimated && tile.frames ? tile.frames[0] : tile.src;
        img.alt = tile.name;
        previewBox.appendChild(img);

        const name = document.createElement('div');
        name.className = 'tile-name';
        name.innerText = tile.name;

        card.appendChild(previewBox);
        card.appendChild(name);

        if (tile.isAnimated) {
          const badge = document.createElement('span');
          badge.className = 'animated-badge';
          badge.innerText = 'ANIM';
          card.appendChild(badge);
        } else if (tile.isCharacter) {
          const badge = document.createElement('span');
          badge.className = 'character-badge';
          badge.innerText = tile.characterType === 'player' ? 'SPAWN' : 'NPC';
          card.appendChild(badge);
        }

        if (tile.collider && tile.collider.enabled) {
          const colBadge = document.createElement('span');
          colBadge.className = 'collider-badge';
          colBadge.innerText = tile.isInvisibleAsset ? 'BARRIER' : 'COL';
          card.appendChild(colBadge);
        }

        card.addEventListener('click', () => {
          document.querySelectorAll('.tile-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.editorController.setSelectedTile(tile.id);

          const statusTile = document.getElementById('status-tile');
          if (statusTile) statusTile.innerText = tile.name;

          window.dispatchEvent(new CustomEvent('tile-collider-selected', { detail: { tileId: tile.id } }));

          // Switch back to brush tool if eraser or eyedropper was active
          if (this.editorController.activeTool === 'eraser') {
            this.editorController.setTool('brush');
            document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
            document.getElementById('tool-brush')?.classList.add('active');
          }
        });

        grid.appendChild(card);
      });
    };

    // Category Tabs click
    tabsContainer.querySelectorAll('.cat-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderGrid(tab.dataset.cat);
      });
    });

    renderGrid('All');
  }

  triggerAutoSave() {
    this.updateSaveIndicator('saving');
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveToLocalStorage(false);
    }, 300);
  }

  saveToLocalStorage(instant = false) {
    try {
      const mapData = this.tileMap.toJSON();
      const payload = {
        ...mapData,
        player: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          scale: this.player.scale || 1.0
        },
        savedAt: Date.now()
      };

      const json = JSON.stringify(payload);
      localStorage.setItem(this.STORAGE_KEY, json);
      // Secondary backup key for safety
      localStorage.setItem('kidslean_rpg_world_map_backup', json);

      this.updateSaveIndicator('saved');
    } catch (err) {
      console.warn('Failed to auto-save to localStorage:', err);
      this.updateSaveIndicator('error');
    }
  }

  updateSaveIndicator(state) {
    const indicator = document.getElementById('save-status');
    if (!indicator) return;

    if (state === 'saving') {
      indicator.className = 'save-status saving';
      indicator.innerHTML = `
        <span class="save-dot pulse"></span>
        <span>Saving...</span>
      `;
    } else if (state === 'saved') {
      indicator.className = 'save-status saved';
      indicator.innerHTML = `
        <span class="save-dot"></span>
        <span>Auto-saved</span>
      `;
    } else if (state === 'error') {
      indicator.className = 'save-status error';
      indicator.innerHTML = `
        <span class="save-dot red"></span>
        <span>Save failed</span>
      `;
    }
  }

  loadFromLocalStorage() {
    try {
      const keysToSearch = [
        this.STORAGE_KEY,
        'kidslean_rpg_world_map_backup',
        'kidslean_rpg_world_map_v2',
        'kidslean_rpg_world_map_v1',
        'kidslean_rpg_world_map',
        'geralt_realm_map_v1'
      ];

      let saved = null;
      for (const k of keysToSearch) {
        saved = localStorage.getItem(k);
        if (saved) break;
      }

      if (saved) {
        const data = JSON.parse(saved);
        if (this.tileMap.fromJSON(data)) {
          if (data.player) {
            if (data.player.x !== undefined && data.player.y !== undefined) {
              this.player.x = data.player.x;
              this.player.y = data.player.y;
            }
            if (data.player.scale) {
              this.player.setScale(data.player.scale);
            }
          }
          if (this.updatePlayCameraZoomUI) {
            this.updatePlayCameraZoomUI(this.tileMap.playCameraZoom || 1.0);
          }
          if (this.mode === 'play') {
            this.camera.zoom = this.tileMap.playCameraZoom || 1.0;
          }
          this.updateSaveIndicator('saved');
        }
      }
    } catch (err) {
      console.warn('Failed to load from localStorage:', err);
    }
  }

  exportMapJSON() {
    const data = this.tileMap.toJSON();
    data.player = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      scale: this.player.scale || 1.0
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-map-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importMapJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (this.tileMap.fromJSON(data)) {
          if (data.player) {
            if (data.player.x !== undefined && data.player.y !== undefined) {
              this.player.x = data.player.x;
              this.player.y = data.player.y;
            }
            if (data.player.scale) {
              this.player.setScale(data.player.scale);
            }
          }
          if (this.updatePlayCameraZoomUI) {
            this.updatePlayCameraZoomUI(this.tileMap.playCameraZoom || 1.0);
          }
          if (this.mode === 'play') {
            this.camera.zoom = this.tileMap.playCameraZoom || 1.0;
          }
          this.minimap.tileMap = this.tileMap;
          this.saveToLocalStorage(true);
          this.showToast('✅ Mapa importado com sucesso!');
        } else {
          alert('Formato de mapa inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    // Update FPS
    this.frameCount++;
    this.fpsTimer += deltaTime;
    if (this.fpsTimer >= 1000) {
      const statusFps = document.getElementById('status-fps');
      if (statusFps) statusFps.innerText = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // Auto sync canvas resolution to actual DOM wrapper size if changed
    const rect = this.canvasWrapper.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const rw = Math.round(rect.width);
      const rh = Math.round(rect.height);
      if (this.canvas.width !== rw || this.canvas.height !== rh) {
        this.canvas.width = rw;
        this.canvas.height = rh;
        this.camera.resize(rw, rh);
      }
    }

    // Update animations
    this.tileMap.update(deltaTime);

    if (this.mode === 'play') {
      // Move player with collision checking against tile colliders
      this.player.update(deltaTime, this.tileMap, this.assetLoader);
      this.camera.follow(this.player.x + 32, this.player.y + 32, 0.1);

      const statusPos = document.getElementById('status-pos');
      if (statusPos) {
        statusPos.innerText = `X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`;
      }
    } else if (this.mode === 'edit') {
      this.editorController.update(deltaTime);

      const statusPos = document.getElementById('status-pos');
      if (statusPos) {
        const centerWorld = this.camera.screenToWorld(this.canvas.width / 2, this.canvas.height / 2);
        statusPos.innerText = `Cam: X: ${Math.round(centerWorld.x)}, Y: ${Math.round(centerWorld.y)}`;
      }
    }

    // Render pass
    this.render();

    // Render Minimap pass
    this.minimap.render(this.mode === 'edit');

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    try {
      // Pixel art crisp interpolation
      this.ctx.imageSmoothingEnabled = false;

      // Validate camera numbers
      if (isNaN(this.camera.x) || !isFinite(this.camera.x)) this.camera.x = 0;
      if (isNaN(this.camera.y) || !isFinite(this.camera.y)) this.camera.y = 0;
      if (isNaN(this.camera.zoom) || this.camera.zoom <= 0.1) this.camera.zoom = 1.0;

      // Apply camera transformation
      this.ctx.scale(this.camera.zoom, this.camera.zoom);
      this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

      const isEditor = this.mode === 'edit';
      const showColliders = isEditor && !!this.editorController?.showColliders;
      let playerRendered = false;

      const defaultLayerOrder = ['ground', 'decor', 'solid', 'characters', 'overhead'];
      const rawLayerOrder = this.tileMap.layerOrder || defaultLayerOrder;

      // Check if standard hierarchy is active (where solid and characters are rendered in sequence)
      const hasSolidAndCharacters = rawLayerOrder.includes('solid') && rawLayerOrder.includes('characters');
      const isSolidBeforeCharacters = rawLayerOrder.indexOf('solid') < rawLayerOrder.indexOf('characters');

      if (hasSolidAndCharacters && isSolidBeforeCharacters) {
        // Advanced 2.5D Y-Sort Depth Sorting for all solid objects and characters
        for (const layerName of rawLayerOrder) {
          if (layerName === 'solid') {
            // Collect visible solid tiles and characters entities for unified Y-sorting
            const ySortEntities = [];

            // 1. Solid layer root tiles within viewport
            const solidLayer = this.tileMap.layers.solid;
            if (solidLayer && solidLayer.size > 0) {
              const padding = 6;
              const startCol = Math.floor(this.camera.x / this.tileMap.tileSize) - padding;
              const endCol = Math.ceil((this.camera.x + this.camera.viewportWidth / this.camera.zoom) / this.tileMap.tileSize) + padding;
              const startRow = Math.floor(this.camera.y / this.tileMap.tileSize) - padding;
              const endRow = Math.ceil((this.camera.y + this.camera.viewportHeight / this.camera.zoom) / this.tileMap.tileSize) + padding;

              for (let y = startRow; y <= endRow; y++) {
                for (let x = startCol; x <= endCol; x++) {
                  const cell = solidLayer.get(this.tileMap.getKey(x, y));
                  if (!cell || cell.isRoot === false) continue;
                  const baseY = this.tileMap.getCellBaseY(cell, x, y, this.assetLoader);
                  ySortEntities.push({
                    type: 'tile',
                    layerName: 'solid',
                    cell,
                    x,
                    y,
                    baseY
                  });
                }
              }
            }

            // 2. Characters layer tiles within viewport (if any)
            const charLayer = this.tileMap.layers.characters;
            if (charLayer && charLayer.size > 0) {
              const padding = 6;
              const startCol = Math.floor(this.camera.x / this.tileMap.tileSize) - padding;
              const endCol = Math.ceil((this.camera.x + this.camera.viewportWidth / this.camera.zoom) / this.tileMap.tileSize) + padding;
              const startRow = Math.floor(this.camera.y / this.tileMap.tileSize) - padding;
              const endRow = Math.ceil((this.camera.y + this.camera.viewportHeight / this.camera.zoom) / this.tileMap.tileSize) + padding;

              for (let y = startRow; y <= endRow; y++) {
                for (let x = startCol; x <= endCol; x++) {
                  const cell = charLayer.get(this.tileMap.getKey(x, y));
                  if (!cell || cell.isRoot === false) continue;
                  const baseY = this.tileMap.getCellBaseY(cell, x, y, this.assetLoader);
                  ySortEntities.push({
                    type: 'tile',
                    layerName: 'characters',
                    cell,
                    x,
                    y,
                    baseY
                  });
                }
              }
            }

            // 3. Player entity (Geralt) Y-Sort Base Position (Feet center)
            const playerFeet = this.player.getFeetBox();
            const playerBaseY = playerFeet.y + playerFeet.h;
            ySortEntities.push({
              type: 'player',
              baseY: playerBaseY
            });

            // Sort all entities strictly by baseY (lower Y rendered first, higher Y in front)
            ySortEntities.sort((a, b) => a.baseY - b.baseY);

            // Draw all entities in correct depth order
            for (const item of ySortEntities) {
              try {
                if (item.type === 'player') {
                  this.player.render(this.ctx, this.assetLoader, showColliders);
                  playerRendered = true;
                } else if (item.type === 'tile') {
                  this.tileMap.drawTileCell(this.ctx, item.cell, item.x, item.y, this.assetLoader, isEditor, showColliders);
                }
              } catch (itemErr) {
                console.error('Error in Y-Sort rendering item:', itemErr);
              }
            }
          } else if (layerName === 'characters') {
            // Handled during solid layer Y-Sort grouping above
            continue;
          } else {
            // Ground, Decor, Overhead layers render normally
            try {
              this.tileMap.renderLayer(this.ctx, layerName, this.assetLoader, this.camera, isEditor, showColliders);
            } catch (layerErr) {
              console.error(`Error rendering layer "${layerName}":`, layerErr);
            }
          }
        }
      } else {
        // Fallback custom user stack order
        for (const layerName of rawLayerOrder) {
          try {
            if (layerName === 'characters') {
              this.player.render(this.ctx, this.assetLoader, showColliders);
              playerRendered = true;
              this.tileMap.renderLayer(this.ctx, 'characters', this.assetLoader, this.camera, isEditor, showColliders);
            } else {
              this.tileMap.renderLayer(this.ctx, layerName, this.assetLoader, this.camera, isEditor, showColliders);
            }
          } catch (layerErr) {
            console.error(`Error rendering layer "${layerName}":`, layerErr);
          }
        }
      }

      // Safety fallback: if player was not rendered, draw player
      if (!playerRendered) {
        try {
          this.player.render(this.ctx, this.assetLoader, showColliders);
        } catch (pErr) {
          console.error('Error rendering player fallback:', pErr);
        }
      }

      // Render Editor Overlays (Infinite Grid, Hover Ghost, Colliders wireframes, Resize handles)
      if (isEditor) {
        try {
          this.editorController.renderEditorOverlay(this.ctx);
        } catch (editorOverlayErr) {
          console.error('Error rendering editor overlay:', editorOverlayErr);
        }
      }
    } catch (renderErr) {
      console.error('Fatal rendering error in game loop:', renderErr);
    } finally {
      this.ctx.restore();
    }
  }
}

// Bootstrap application on page load
window.addEventListener('DOMContentLoaded', () => {
  const app = new RPGApplication();
  app.init();
});
