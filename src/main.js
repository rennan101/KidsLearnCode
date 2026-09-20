import { AssetLoader } from './engine/AssetLoader.js';
import { TileMap } from './engine/TileMap.js';
import { Player } from './engine/Player.js';
import { Camera } from './engine/Camera.js';
import { EditorController } from './editor/EditorController.js';
import { Minimap } from './engine/Minimap.js';
import { DayNightSystem } from './engine/DayNightSystem.js';
import { DialogueAndChatSystem } from './engine/DialogueAndChatSystem.js';
import { CraftingSystem } from './engine/CraftingSystem.js';
import { DragonManager } from './engine/DragonManager.js';
import { BlocklyLuaSystem } from './engine/BlocklyLuaSystem.js';
import { MultiplayerClient } from './engine/MultiplayerClient.js';
import { CharacterRegistry, PLAYABLE_HEROES } from './engine/CharacterRegistry.js';
import { InventorySystem } from './engine/InventorySystem.js';
import { StorageManager } from './engine/StorageManager.js';
import { SupabaseClient } from './engine/SupabaseClient.js';
import { securityManager } from './engine/SecurityManager.js';
import { ScratchBlockEngine } from './engine/ScratchBlockEngine.js';


class RPGApplication {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWrapper = document.getElementById('canvas-wrapper');

    // Persistence & Storage Engine (IndexedDB & Supabase Cloud)
    this.storageManager = new StorageManager();
    this.supabaseClient = new SupabaseClient();

    // Subsystems
    this.dayNightSystem = new DayNightSystem();
    this.dialogueSystem = new DialogueAndChatSystem();
    this.craftingSystem = new CraftingSystem(this.dayNightSystem);
    this.dragonManager = new DragonManager();
    this.inventorySystem = new InventorySystem();
    this.blocklySystem = new BlocklyLuaSystem();
    this.scratchEngine = new ScratchBlockEngine();
    this.multiplayerClient = new MultiplayerClient();

    this.assetLoader = new AssetLoader();
    this.tileMap = new TileMap();
    this.player = new Player(320, 320);
    this.camera = new Camera();
    this.minimap = new Minimap(this.tileMap, this.assetLoader, this.player, this.camera, this.dayNightSystem);
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
    try {
      this.setupWindowResize();
      this.setupDrawerResizing();
      this.setupColliderPanel();
      this.setupPlayCameraZoomPanel();
      this.setupTileInspector();
      this.setupLayerManager();
      this.setupChatSystem();
      this.setupAuthUI();
      this.setupHeroSelectionUI();
      this.setupBackpackUI();
      this.setupCraftingUI();
      this.setupCodingStudioUI();
      this.setupQuickMountButton();
      this.setupNetworkDisconnectionMonitor();
      this.bindDOMEvents();

      // Ativa proteções de segurança, anti-scrape e bloqueio de download de assets
      securityManager.init();

      // Initialize IndexedDB Storage Engine & Supabase Cloud
      await this.storageManager.init();
      await this.supabaseClient.init();
      this.multiplayerClient.attachSupabase(this.supabaseClient);

      if (this.multiplayerClient) {
        this.multiplayerClient.onMapUpdated = (payload) => {
          if (payload && payload.map) {
            console.log('[Multiplayer] Recebido mapa atualizado em tempo real por:', payload.updatedBy);
            this.tileMap.fromJSON(payload.map);
            this.minimap.tileMap = this.tileMap;
            this.editorController.tileMap = this.tileMap;
            this.showToast(`Mapa atualizado online por ${payload.updatedBy || 'outro jogador'}!`, 4000);
          }
        };
      }

      await this.assetLoader.syncWithStorage(this.storageManager);

      // Preload all sprites and tiles
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');

      await this.assetLoader.loadAll((progress) => {
        const pct = Math.round(progress * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.innerText = `${pct}%`;
      });
    } catch (err) {
      console.error('Error during init/asset preloading:', err);
    } finally {
      // Guarantee loading screen always hides
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => (loadingScreen.style.display = 'none'), 300);
      }
    }

    // Load saved map & game state from IndexedDB (with multi-key migration/fallback)
    await this.loadGameFromStorage();

    // Sync player collider and position with loaded data
    this.player.syncCollider(this.assetLoader);
    if (this.tileMap.spawnPoint) {
      this.player.setSpawn(this.tileMap.spawnPoint.x, this.tileMap.spawnPoint.y);
    }
    this.camera.follow(this.player.x + 32, this.player.y + 32, 1.0);

    // Populate the asset drawer
    this.populateAssetDrawer();

    // Sincroniza visibilidade de controles admin e modo
    this.updateAdminAndModeUI();

    // Se o usuário não estiver logado com e-mail/senha, apresenta a tela inicial de Login / Criar Conta
    if (!this.supabaseClient.user || this.supabaseClient.user.isGuest) {
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.style.display = 'flex';
      }
    }

    // Periodic background auto-save (every 4 seconds) non-blocking via IndexedDB
    setInterval(() => this.saveGameToStorage(true), 4000);

    // Auto-save on page unload/close/hide
    window.addEventListener('beforeunload', () => this.saveGameToStorage(true));
    window.addEventListener('pagehide', () => this.saveGameToStorage(true));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveGameToStorage(true);
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
        colliders: { id: 'colliders', label: 'Colisores', color: '#ef4444', desc: 'Barreiras / Paredes Invisíveis' },
        overhead: { id: 'overhead', label: 'Topo / Cobertura', color: '#8b5cf6', desc: 'Copa das Árvores / Telhados' },
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
        colliders: { id: 'colliders', label: 'Camada 6 (Colisores)', color: '#ef4444', desc: 'Barreiras e Paredes Invisíveis' },
        overhead: { id: 'overhead', label: 'Camada 5 (Topo)', color: '#8b5cf6', desc: 'Copa das Árvores / Telhados' },
        characters: { id: 'characters', label: 'Camada 4 (Personagens)', color: '#ec4899', desc: 'Geralt / NPCs' },
        solid: { id: 'solid', label: 'Camada 3 (Sólido)', color: '#f59e0b', desc: 'Estruturas / Objetos' },
        decor: { id: 'decor', label: 'Camada 2 (Decoração)', color: '#10b981', desc: 'Flora / Caminhos' },
        ground: { id: 'ground', label: 'Camada 1 (Chão)', color: '#3b82f6', desc: 'Água / Terreno Base' }
      };

      // Top to bottom inspection matching visual hierarchy
      const displayLayers = [...(this.tileMap.layerOrder || ['ground', 'decor', 'solid', 'characters', 'overhead', 'colliders'])].reverse();

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
          ? `${meta?.category || 'Geral'} • ${meta?.gridW || 1}x${meta?.gridH || 1}${rot ? ` • ${rot}°` : ''}${meta?.collider?.enabled ? ' • [COL]' : ''}`
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
              this.showToast(`Asset rotacionado para ${nextRot}°!`);
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
            this.showToast(`Asset "${tileName}" selecionado (${targetRot}°) para pintar na camada ${targetLayer}!`);
          });
        }

        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            const targetLayer = deleteBtn.dataset.layer;
            const tx = parseInt(deleteBtn.dataset.x, 10);
            const ty = parseInt(deleteBtn.dataset.y, 10);
            this.editorController.recordState();
            this.tileMap.deleteTile(tx, ty, targetLayer, this.assetLoader);
            this.triggerAutoSave();
            this.editorController.inspectTileAt(tx, ty);
            this.showToast(`Tile removido da camada ${targetLayer}!`);
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
      } else if (this.mode === 'play') {
        // Allow clicking directly on nearby NPCs to start conversation
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        const clickedNpc = this.findNearbyNPC(worldPos.x - 32, worldPos.y - 32, 60);
        if (clickedNpc) {
          const pDist = Math.hypot(clickedNpc.worldX - this.player.x, clickedNpc.worldY - this.player.y);
          if (pDist <= 140) {
            this.interactWithNPC(clickedNpc);
          } else {
            this.showToast(`Aproxime-se de ${clickedNpc.name.split(',')[0]} para conversar.`);
          }
        }
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
          this.showToast('Câmera centralizada no Geralt [F]');
          return;
        }

        // Key R: Quick Mount / Dismount on Active Dragon
        if (e.key === 'r' || e.key === 'R') {
          if (this.toggleQuickMount) {
            this.toggleQuickMount();
          }
          return;
        }

        // Key 1: Tactical Dodge (Sprint 5)
        if (e.key === '1') {
          const res = this.dragonManager.triggerTacticalDodge();
          if (res.success) {
            this.showToast(`Esquiva Tática! ${res.abilityName}`);
          } else if (res.reason) {
            this.showToast(res.reason);
          }
          return;
        }

        // Key E: Interact with NPC, Wild Nest or Trigger Active Dragon Field Move (Sprint 5 & 6)
        if (e.key === 'e' || e.key === 'E') {
          // 1. Check proximity to placed NPCs on TileMap ('characters' layer)
          const nearbyNpc = this.findNearbyNPC(this.player.x, this.player.y, 90);
          if (nearbyNpc) {
            this.interactWithNPC(nearbyNpc);
            return;
          }

          // 2. Check proximity to wild nests
          const nearbyNest = this.dragonManager.wildNests.find(n => {
            return Math.hypot(n.x - this.player.x, n.y - this.player.y) < 70;
          });

          if (nearbyNest) {
            const nestRes = this.dragonManager.interactWithNest(nearbyNest.id);
            if (nestRes.hatched) {
              this.openEggHatchModal(nestRes.speciesData, nearbyNest);
            } else {
              this.showToast(nestRes.message || nestRes.reason);
            }
            return;
          }

          // 3. Otherwise trigger active dragon Field Move
          const fieldRes = this.dragonManager.triggerFieldMove(this.tileMap, this.player.x, this.player.y);
          if (fieldRes.success) {
            this.showToast(fieldRes.message);
          } else {
            this.showToast(fieldRes.reason);
          }
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
      this.updateAdminAndModeUI();
      this.saveGameToStorage(true);
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
      this.updateAdminAndModeUI();
      this.saveGameToStorage(true);
    });

    // Toggle Colliders Overlay
    btnToggleColliders?.addEventListener('click', () => {
      this.editorController.showColliders = !this.editorController.showColliders;
      btnToggleColliders.classList.toggle('active', this.editorController.showColliders);
      const toolColBtn = document.getElementById('tool-collider');
      if (toolColBtn) toolColBtn.classList.toggle('active', this.editorController.showColliders);
      this.showToast(this.editorController.showColliders ? 'Colisores visíveis no mapa!' : 'Colisores ocultados!');
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
            this.showToast(this.editorController.showColliders ? 'Colisores visíveis no mapa!' : 'Colisores ocultados!');
            
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
        this.showToast(e.detail.showColliders ? 'Colisores visíveis no mapa!' : 'Colisores ocultados!');
      }
    });

    // Rotate Tool Button
    const btnRotate = document.getElementById('tool-rotate');
    btnRotate?.addEventListener('click', () => {
      const newRot = this.editorController.rotateActiveAsset();
      this.showToast(`Rotação do pincel: ${newRot}°`);
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
        this.saveGameToStorage(true);
        this.showToast('Mapa limpo com sucesso!');
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
          badge.innerText = tile.characterType === 'player' ? 'SPAWN' : (tile.characterType === 'hero' ? 'HERÓI' : (tile.characterType === 'enemy' ? 'GUARDA' : 'NPC'));
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
      this.saveGameToStorage(false);
    }, 250);
  }

  async saveGameToStorage(instant = false) {
    try {
      const mapData = this.tileMap.toJSON();
      const payload = {
        map: mapData,
        player: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          scale: this.player.scale || 1.0,
          heroId: this.player.heroId || 'char_wolf_hunter_m'
        },
        inventory: {
          items: this.inventorySystem.getItems(),
          tools: this.inventorySystem.getTools(),
          eggs: this.inventorySystem.getEggs(),
          equippedToolId: this.inventorySystem.equippedToolId
        },
        dragons: {
          party: this.dragonManager.getParty(),
          activeDragonId: this.dragonManager.getActiveDragon()?.id,
          mode: this.dragonManager.mode
        },
        codingProgress: {
          completedLessons: Array.from(this.blocklySystem.completedLessons),
          playerXP: this.blocklySystem.playerXP,
          playerGold: this.blocklySystem.playerGold
        },
        activeHero: this.player.heroId,
        savedAt: Date.now()
      };

      const res = await this.storageManager.saveGame(payload);
      if (res && res.success) {
        const isCloudActive = this.supabaseClient && !this.supabaseClient.user?.isGuest;
        const engineLabel = isCloudActive ? 'Nuvem + DB' : (res.storage || 'IndexedDB');
        this.updateSaveIndicator('saved', engineLabel);
      } else {
        this.updateSaveIndicator('error');
      }

      // Sincroniza em segundo plano com a Nuvem Supabase e transmite para outros jogadores online
      if (this.supabaseClient) {
        if (!this.supabaseClient.user?.isGuest) {
          this.supabaseClient.saveCloudGame(payload);
        }
        // Sempre salva o mapa online compartilhado e transmite via broadcast para outros players
        this.supabaseClient.saveGlobalWorldMap(mapData);
      }
    } catch (err) {
      console.warn('Failed to auto-save to StorageManager:', err);
      this.updateSaveIndicator('error');
    }
  }

  updateSaveIndicator(state, engine = 'IndexedDB') {
    const indicator = document.getElementById('save-status');
    if (!indicator) return;

    if (state === 'saving') {
      indicator.className = 'save-status saving';
      indicator.innerHTML = `
        <span class="save-dot pulse"></span>
        <span>Salvando...</span>
      `;
    } else if (state === 'saved') {
      indicator.className = 'save-status saved';
      indicator.innerHTML = `
        <span class="save-dot"></span>
        <span>${engine} Salvo</span>
      `;
    } else if (state === 'error') {
      indicator.className = 'save-status error';
      indicator.innerHTML = `
        <span class="save-dot red"></span>
        <span>Falha no Save</span>
      `;
    }
  }

  async loadGameFromStorage() {
    try {
      let data = await this.storageManager.loadGame();

      // Se autenticado na nuvem, verifica se o save do Supabase é mais recente
      if (this.supabaseClient && !this.supabaseClient.user?.isGuest) {
        const cloudData = await this.supabaseClient.loadCloudGame();
        if (cloudData && (!data || (cloudData.savedAt && cloudData.savedAt > (data.savedAt || 0)))) {
          data = cloudData;
          await this.storageManager.saveGame(cloudData);
        }
      }

      // Se conectado ao Supabase, verifica se há um mapa global online compartilhado
      if (this.supabaseClient) {
        const globalOnlineMap = await this.supabaseClient.loadGlobalWorldMap();
        if (globalOnlineMap && globalOnlineMap.map) {
          if (!data || (globalOnlineMap.updatedAt && globalOnlineMap.updatedAt > (data.savedAt || 0))) {
            if (!data) data = { id: 'active_save', player: { x: 320, y: 320 }, activeHero: 'char_wolf_hunter_m' };
            data.map = globalOnlineMap.map;
            data.savedAt = globalOnlineMap.updatedAt;
          }
        }
      }

      if (!data) {
        // Se nenhum save local ou nuvem existir, restaura o mapa oficial padrão construído pelo usuário
        try {
          const resp = await fetch('src/data/defaultWorldMap.json');
          if (resp.ok) {
            const defaultMap = await resp.json();
            data = {
              id: 'active_save',
              map: defaultMap,
              player: defaultMap.spawnPoint ? { x: defaultMap.spawnPoint.x, y: defaultMap.spawnPoint.y, scale: 1.0 } : { x: 2048, y: 0, scale: 1.0 },
              activeHero: 'char_wolf_hunter_m',
              savedAt: Date.now()
            };
            await this.storageManager.saveGame(data);
            console.log('[Game] Mapa original base defaultWorldMap.json restaurado com sucesso no IndexedDB.');
          }
        } catch (fetchErr) {
          console.warn('[Game] Falha ao carregar defaultWorldMap.json:', fetchErr);
        }
      }

      if (data) {
        // 1. Restaurar TileMap
        const mapPayload = data.map ? data.map : data;
        if (this.tileMap.fromJSON(mapPayload)) {
          if (this.updatePlayCameraZoomUI) {
            this.updatePlayCameraZoomUI(this.tileMap.playCameraZoom || 1.0);
          }
          if (this.mode === 'play') {
            this.camera.zoom = this.tileMap.playCameraZoom || 1.0;
          }
        }

        // 2. Restaurar Player
        if (data.player) {
          if (data.player.x !== undefined && data.player.y !== undefined) {
            this.player.x = data.player.x;
            this.player.y = data.player.y;
          }
          if (data.player.scale) {
            this.player.setScale(data.player.scale);
          }
          if (data.player.heroId || data.activeHero) {
            const hId = data.player.heroId || data.activeHero;
            this.player.setHero(hId);
            if (this.updateHeroHeaderBadge) {
              this.updateHeroHeaderBadge(hId);
            }
          }
        }

        // 3. Restaurar Inventário & Mochila
        if (data.inventory) {
          if (data.inventory.items && Array.isArray(data.inventory.items)) {
            this.inventorySystem.items = data.inventory.items;
          }
          if (data.inventory.tools && Array.isArray(data.inventory.tools)) {
            this.inventorySystem.tools = data.inventory.tools;
          }
          if (data.inventory.eggs && Array.isArray(data.inventory.eggs)) {
            this.inventorySystem.eggs = data.inventory.eggs;
          }
          if (data.inventory.equippedToolId) {
            this.inventorySystem.equippedToolId = data.inventory.equippedToolId;
          }
          this.inventorySystem.notify();
        }

        // 4. Restaurar Dragões
        if (data.dragons) {
          if (data.dragons.party && Array.isArray(data.dragons.party)) {
            this.dragonManager.party = data.dragons.party;
          }
          if (data.dragons.activeDragonId) {
            this.dragonManager.setActiveDragon(data.dragons.activeDragonId);
          }
          if (data.dragons.mode) {
            this.dragonManager.setMode(data.dragons.mode);
          }
        }

        // 5. Restaurar Progresso de Código Blockly / Lua
        if (data.codingProgress) {
          if (data.codingProgress.completedLessons && Array.isArray(data.codingProgress.completedLessons)) {
            this.blocklySystem.completedLessons = new Set(data.codingProgress.completedLessons);
          }
          if (data.codingProgress.playerXP !== undefined) {
            this.blocklySystem.playerXP = data.codingProgress.playerXP;
          }
          if (data.codingProgress.playerGold !== undefined) {
            this.blocklySystem.playerGold = data.codingProgress.playerGold;
          }
        }

        const isCloud = this.supabaseClient && !this.supabaseClient.user?.isGuest;
        this.updateSaveIndicator('saved', isCloud ? 'Nuvem + DB' : (this.storageManager.useFallback ? 'localStorage' : 'IndexedDB'));
      }
    } catch (err) {
      console.warn('Failed to load game from StorageManager:', err);
    }
  }

  isAdminUser() {
    const email = this.supabaseClient?.user?.email;
    return email === 'rennancr93@gmail.com';
  }

  updateAdminAndModeUI() {
    const isEdit = this.mode === 'edit';
    const isAdmin = this.isAdminUser();

    // 1. Badge de status de persistência (Apenas no Modo de Edição)
    const saveStatus = document.getElementById('save-status');
    if (saveStatus) {
      saveStatus.style.display = isEdit ? 'flex' : 'none';
    }

    // 2. Opções admin / desenvolvedor (Colliders, Save JSON, Load JSON, Clear Map)
    // Só devem aparecer no modo de edição para a conta com o e-mail rennancr93@gmail.com
    const adminButtons = [
      'btn-toggle-colliders',
      'btn-save-json',
      'btn-load-json',
      'btn-clear-map'
    ];

    adminButtons.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = (isEdit && isAdmin) ? 'inline-flex' : 'none';
      }
    });

    // 3. Atualiza botão de login / sair no header (sem exibir o nome do usuário após logar)
    const cloudBtn = document.getElementById('btn-cloud-account');
    const headerLogoutBtn = document.getElementById('btn-header-logout');
    const labelEl = document.getElementById('cloud-account-label');
    const user = this.supabaseClient?.user;
    const isLogged = user && !user.isGuest;

    if (isLogged) {
      if (cloudBtn) cloudBtn.style.display = 'none';
      if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-flex';
    } else {
      if (cloudBtn) cloudBtn.style.display = 'inline-flex';
      if (labelEl) labelEl.innerText = 'Entrar';
      if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
    }
  }

  setupAuthUI() {
    const modal = document.getElementById('auth-modal');
    const triggerBtn = document.getElementById('btn-cloud-account');
    const headerLogoutBtn = document.getElementById('btn-header-logout');
    const closeBtn = document.getElementById('btn-close-auth');
    const labelEl = document.getElementById('cloud-account-label');

    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const nicknameInput = document.getElementById('auth-nickname');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const submitBtn = document.getElementById('btn-submit-auth');
    const guestBtn = document.getElementById('btn-guest-auth');
    const signoutBtn = document.getElementById('btn-signout-auth');

    const statusBadge = document.getElementById('auth-badge-status');
    const userNameEl = document.getElementById('auth-user-name');
    const userEmailEl = document.getElementById('auth-user-email');

    let mode = 'login'; // 'login' or 'signup'

    const refreshAuthUI = () => {
      const user = this.supabaseClient.user;
      const isGuest = user?.isGuest ?? true;

      this.updateAdminAndModeUI();

      if (statusBadge) {
        statusBadge.innerText = isGuest ? 'Modo Offline' : 'Conta Conectada';
        statusBadge.style.background = isGuest ? '#334155' : '#047857';
      }

      if (userNameEl) {
        userNameEl.innerText = user?.user_metadata?.nickname || (isGuest ? (user?.nickname || 'Aventureiro') : user.email.split('@')[0]);
      }

      if (userEmailEl) {
        userEmailEl.innerText = user?.email || 'offline@kidslearncode.local';
      }

      if (signoutBtn) {
        signoutBtn.style.display = isGuest ? 'none' : 'block';
      }
    };

    refreshAuthUI();

    triggerBtn?.addEventListener('click', () => {
      refreshAuthUI();
      modal.style.display = 'flex';
    });

    headerLogoutBtn?.addEventListener('click', async () => {
      await this.supabaseClient.signOut();
      refreshAuthUI();
      this.showToast('Você saiu da conta.');
    });

    const submitBtnLabel = document.getElementById('btn-submit-auth-label');

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    tabLogin?.addEventListener('click', () => {
      mode = 'login';
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      if (nicknameInput) nicknameInput.style.display = 'none';
      if (submitBtnLabel) submitBtnLabel.innerText = 'Entrar';
    });

    tabSignup?.addEventListener('click', () => {
      mode = 'signup';
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      if (nicknameInput) nicknameInput.style.display = 'block';
      if (submitBtnLabel) submitBtnLabel.innerText = 'Criar Conta';
    });

    submitBtn?.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const nickname = nicknameInput ? nicknameInput.value.trim() : 'Aventureiro';

      if (!email || !password) {
        this.showToast('Preencha e-mail e senha.');
        return;
      }

      submitBtn.disabled = true;
      if (submitBtnLabel) submitBtnLabel.innerText = 'Conectando...';

      let res;
      if (mode === 'signup') {
        res = await this.supabaseClient.signUp(email, password, nickname);
      } else {
        res = await this.supabaseClient.signIn(email, password);
      }

      submitBtn.disabled = false;
      if (submitBtnLabel) submitBtnLabel.innerText = mode === 'signup' ? 'Criar Conta' : 'Entrar';

      if (res.success) {
        if (res.requiresConfirmation) {
          this.showToast(res.message, 6000);
          refreshAuthUI();
          modal.style.display = 'none';
        } else {
          this.showToast(`Bem-vindo, ${res.user.user_metadata?.nickname || res.user.email}!`);
          refreshAuthUI();
          await this.loadGameFromStorage();
          modal.style.display = 'none';
        }
      } else {
        this.showToast(res.error || 'Falha ao autenticar.');
      }
    });

    guestBtn?.addEventListener('click', () => {
      this.supabaseClient.signOut();
      refreshAuthUI();
      this.showToast('Modo Offline ativado.');
      modal.style.display = 'none';
    });

    signoutBtn?.addEventListener('click', async () => {
      await this.supabaseClient.signOut();
      refreshAuthUI();
      this.showToast('Desconectado da conta.');
    });
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
          this.saveGameToStorage(true);
          this.showToast('Mapa importado com sucesso!');
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

  // Safety compatibility alias
  saveToLocalStorage(instant = false) {
    return this.saveGameToStorage(instant);
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

    // Freeze gameplay update when disconnected from network
    if (this.isNetworkDisconnected) {
      this.render();
      requestAnimationFrame((t) => this.gameLoop(t));
      return;
    }

    // Update animations & floating chat bubbles
    this.tileMap.update(deltaTime);
    if (this.dialogueSystem && this.player) {
      this.dialogueSystem.update(new Map([['player', { x: this.player.x, y: this.player.y }]]));
    }

    if (this.mode === 'play') {
      // Sync active dragon mount multiplier to player
      const activeDragon = this.dragonManager?.getActiveDragon();
      const isMounted = this.dragonManager?.isMounted();
      this.player.isMounted = isMounted;
      if (isMounted && activeDragon) {
        this.player.speed = (this.player.isSprinting ? this.player.sprintSpeed : this.player.baseSpeed) * (activeDragon.mountSpeedMultiplier || 1.6);
      }

      // Move player with collision checking against tile colliders (4-way)
      this.player.update(deltaTime, this.tileMap, this.assetLoader);
      this.camera.follow(this.player.x + 32, this.player.y + 32, 0.1);

      // Update Dragon Manager (Pet Follow AI, Combat, Particles)
      if (this.dragonManager) {
        this.dragonManager.update(deltaTime, this.player, this.tileMap);
      }

      // Update Multiplayer Client & Broadcast Local Movement
      if (this.multiplayerClient) {
        this.multiplayerClient.update(deltaTime, this.dialogueSystem);
        this.multiplayerClient.sendLocalPlayerUpdate(
          this.player,
          this.player.heroId,
          this.player.heroData?.name || 'Aventureiro',
          this.dragonManager?.getActiveDragon()?.id
        );
      }

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
    this.ctx.fillStyle = '#1b3b5f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

      // Render Remote Players (Multiplayer)
      if (this.multiplayerClient && this.mode === 'play') {
        try {
          this.multiplayerClient.render(this.ctx, this.assetLoader);
        } catch (mpErr) {
          console.error('Error rendering multiplayer entities:', mpErr);
        }
      }

      // Render Dragon Companion, Targets, Particles and Wild Nests
      if (this.dragonManager && this.mode === 'play') {
        try {
          this.dragonManager.render(this.ctx, this.assetLoader, this.player);
        } catch (dragonErr) {
          console.error('Error rendering dragon entity:', dragonErr);
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

    // 1. Day / Night Atmospheric Lighting Tint Overlay (Play Mode)
    if (this.mode === 'play' && this.dayNightSystem) {
      const ambient = this.dayNightSystem.getAmbientLight();
      if (ambient.alpha > 0.02) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(${ambient.r}, ${ambient.g}, ${ambient.b}, ${ambient.alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
    }

    // 2. Animal Crossing Floating Speech Bubbles (Rendered in screen space)
    if (this.dialogueSystem) {
      this.dialogueSystem.render(this.ctx, this.camera);
    }

    // 3. Floating Interaction Prompt for Nearby NPCs (Play Mode)
    if (this.mode === 'play') {
      const nearbyNpc = this.findNearbyNPC(this.player.x, this.player.y, 110);
      if (nearbyNpc) {
        const screenPos = this.camera.worldToScreen(nearbyNpc.worldX + 32, nearbyNpc.worldY - 14);
        this.ctx.save();
        this.ctx.font = 'bold 12px "Outfit", sans-serif';
        const promptText = `[E] Conversar com ${nearbyNpc.name.split(',')[0]}`;
        const metrics = this.ctx.measureText(promptText);
        const w = metrics.width + 24;
        const h = 26;
        const x = screenPos.x - w / 2;
        const y = screenPos.y - h;

        // Soft drop shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetY = 2;

        // Background pill
        this.ctx.fillStyle = '#090c12';
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 1.6;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, w, h, 13);
        this.ctx.fill();
        this.ctx.stroke();

        // Small indicator notch pointing down to NPC
        this.ctx.fillStyle = '#090c12';
        this.ctx.beginPath();
        this.ctx.moveTo(screenPos.x - 5, y + h);
        this.ctx.lineTo(screenPos.x, y + h + 4);
        this.ctx.lineTo(screenPos.x + 5, y + h);
        this.ctx.fill();

        this.ctx.fillStyle = '#f8fafc';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(promptText, screenPos.x, y + h / 2);
        this.ctx.restore();
      }
    }
  }

  findNearbyNPC(worldX, worldY, radius = 110) {
    if (!this.tileMap || !this.tileMap.layers) return null;

    let nearest = null;
    let minDistance = radius;

    const layersToCheck = ['characters', 'solid', 'decor'];
    for (const layerName of layersToCheck) {
      const layer = this.tileMap.layers[layerName];
      if (!layer) continue;

      for (const [key, cell] of layer.entries()) {
        const tileId = (typeof cell === 'object' && cell !== null) ? cell.tileId : (typeof cell === 'string' ? cell : null);
        if (tileId && typeof tileId === 'string' && tileId.startsWith('npc_')) {
          const [tx, ty] = key.split(',').map(Number);
          const npcWorldX = tx * 64 + 32;
          const npcWorldY = ty * 64 + 32;
          const dist = Math.hypot(npcWorldX - (worldX + 32), npcWorldY - (worldY + 32));
          if (dist <= minDistance) {
            minDistance = dist;
            const npcData = CharacterRegistry.VILLAGE_NPCS.find(n => n.id === tileId);
            if (npcData) {
              nearest = {
                ...npcData,
                tx,
                ty,
                worldX: tx * 64,
                worldY: ty * 64
              };
            }
          }
        }
      }
    }
    return nearest;
  }

  interactWithNPC(npc) {
    if (!npc) return;
    this.dialogueSystem.openNpcConversation(npc, this.blocklySystem, {
      onOpenLesson: (lessonId) => {
        const codingModal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
        const lessonSelect = document.getElementById('select-lua-lesson');
        if (codingModal && this.blocklySystem) {
          this.blocklySystem.setLesson(lessonId);
          if (lessonSelect) {
            const idx = this.blocklySystem.lessons.findIndex(l => l.id === lessonId);
            if (idx !== -1) lessonSelect.value = idx;
          }
          const lesson = this.blocklySystem.getCurrentLesson();
          const lessonDesc = document.getElementById('lesson-desc');
          const rewardBadge = document.getElementById('lesson-reward-badge');
          const unlockBadge = document.getElementById('lesson-unlock-target');
          const codeEditor = document.getElementById('lua-code-editor');
          const consoleOut = document.getElementById('lua-console-output');

          if (lessonDesc) lessonDesc.innerText = `${lesson.mentor} (${lesson.mentorRole}): ${lesson.description}`;
          if (rewardBadge) rewardBadge.innerText = `+${lesson.rewardXP} XP / +${lesson.rewardGold} Moedas`;
          if (unlockBadge) unlockBadge.innerText = `Desbloqueio: ${lesson.unlockedAssetName || 'Item Especial'}`;
          if (codeEditor) codeEditor.value = lesson.starterLua;
          if (this.scratchEngine) {
            this.scratchEngine.loadLessonBlocks(lesson.blocks, lesson.starterLua);
          }
          if (consoleOut) {
            consoleOut.innerHTML = `> Lição carregada: <strong>${lesson.title}</strong> (${lesson.concept})\n> Objeto a Desbloquear: <strong>${lesson.unlockedAssetName}</strong>\n> Arraste os blocos na área central e clique em 'Executar Montagem & Fabricar'.`;
          }
          codingModal.style.display = 'flex';
        }
      },
      onOpenCrafting: () => {
        if (this.openCraftingModal) {
          this.openCraftingModal();
        }
      }
    });
  }

  handleAccessFeature(featureId, npcData) {
    switch (featureId) {
      case 'feature_lua_terminal': {
        const codingModal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
        if (codingModal) codingModal.style.display = 'flex';
        break;
      }
      case 'feature_furniture_crafting':
      case 'feature_tier2_forge': {
        if (this.openCraftingModal) this.openCraftingModal();
        break;
      }
      case 'feature_farming_system': {
        if (this.openBackpackModal) this.openBackpackModal();
        this.showToast('Agricultura Ativa: Use o Regador Real e Sementes nos canteiros da ilha!');
        break;
      }
      case 'feature_fishing_minigame': {
        this.inventorySystem.equipTool('tool_rod');
        this.showToast('Vara de Pesca Pronta! Aproxime-se das margens ou recifes para pescar.');
        break;
      }
      case 'feature_water_mount': {
        this.showToast('Montaria Aquática: Pressione [R] sobre a água para surfar com seu dragão!');
        break;
      }
      case 'feature_fast_travel_ferry': {
        this.showToast('Balsa e Viagem Rápida: Travessia entre os portos autorizada!');
        break;
      }
      case 'feature_color_dye_studio': {
        this.showToast('Ateliê de Tinturas: Cores e personalização disponíveis.');
        break;
      }
      case 'feature_mythic_flight': {
        this.showToast('Voo Mítico dos Dragões: Elevação máxima autorizada sobre a Ilha Lua!');
        break;
      }
      default: {
        this.showToast(`Recurso ${npcData.unlockedTitle || featureId} pronto para uso!`);
        break;
      }
    }
  }

  setupChatSystem() {
    const chatBar = document.getElementById('game-chat-bar');
    const chatInput = document.getElementById('game-chat-input');
    const sendBtn = document.getElementById('btn-send-chat');

    const toggleChat = () => {
      if (this.mode !== 'play') return;
      const isVisible = chatBar.style.display !== 'none';
      if (isVisible) {
        chatBar.style.display = 'none';
        chatInput.blur();
        this.canvas.focus();
      } else {
        chatBar.style.display = 'flex';
        chatInput.value = '';
        chatInput.focus();
      }
    };

    const sendMsg = () => {
      const text = chatInput.value.trim();
      if (text.length > 0) {
        this.dialogueSystem.addSpeechBubble('player', text, { x: this.player.x, y: this.player.y });
        if (this.multiplayerClient) {
          this.multiplayerClient.sendChatMessage(text, this.player, this.player.heroData?.name || 'Aventureiro');
        }
        chatInput.value = '';
        chatBar.style.display = 'none';
        this.canvas.focus();
      }
    };

    if (this.multiplayerClient) {
      this.multiplayerClient.onChatReceived = (data) => {
        this.dialogueSystem.addSpeechBubble(data.senderId, data.text, { x: data.x, y: data.y });
      };
    }

    sendBtn?.addEventListener('click', sendMsg);

    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMsg();
      } else if (e.key === 'Escape') {
        chatBar.style.display = 'none';
        this.canvas.focus();
      }
      e.stopPropagation();
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (this.mode === 'play' && e.key === 'Enter') {
        toggleChat();
        e.preventDefault();
      }
    });
  }

  setupCraftingUI() {
    const craftingModal = document.getElementById('crafting-modal');
    const closeBtn = document.getElementById('btn-close-crafting');
    const recipeList = document.getElementById('crafting-recipe-list');

    closeBtn?.addEventListener('click', () => {
      craftingModal.style.display = 'none';
    });

    this.openCraftingModal = () => {
      if (!craftingModal || !recipeList) return;
      craftingModal.style.display = 'flex';
      recipeList.innerHTML = '';

      const recipes = this.craftingSystem.getRecipes();
      recipes.forEach((rec) => {
        const item = document.createElement('div');
        item.className = 'craft-recipe-item';
        item.innerHTML = `
          <div class="recipe-info">
            <span class="recipe-icon">${rec.icon}</span>
            <div class="recipe-details">
              <h4>${rec.name} (${rec.apCost} AP)</h4>
              <p>${rec.description}</p>
            </div>
          </div>
          <button class="craft-btn" data-id="${rec.id}">Fabricar 🔨</button>
        `;

        item.querySelector('.craft-btn')?.addEventListener('click', () => {
          const res = this.craftingSystem.craftItem(rec.id, this.player, () => {
            this.showToast(`💨 ${rec.name} fabricado na bancada!`);
          });
          if (res.success) {
            this.showToast(res.message);
            craftingModal.style.display = 'none';
          } else {
            this.showToast(`⚠️ ${res.reason}`);
          }
        });

        recipeList.appendChild(item);
      });
    };

    // Shortcut 'C' in Play Mode to open Crafting
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (this.mode === 'play' && (e.key === 'c' || e.key === 'C')) {
        const isVisible = craftingModal.style.display !== 'none';
        if (isVisible) {
          craftingModal.style.display = 'none';
        } else {
          this.openCraftingModal();
        }
      }
    });
  }

  setupDragonPartyUI() {
    const dragonModal = document.getElementById('dragon-party-modal');
    const closeBtn = document.getElementById('btn-close-dragons');
    const partyList = document.getElementById('dragon-party-list');

    const hatchModal = document.getElementById('dragon-hatch-modal');
    const closeHatchBtn = document.getElementById('btn-close-hatch');
    const hatchBody = document.getElementById('dragon-hatch-body');

    closeBtn?.addEventListener('click', () => {
      dragonModal.style.display = 'none';
    });

    closeHatchBtn?.addEventListener('click', () => {
      hatchModal.style.display = 'none';
    });

    this.openEggHatchModal = (speciesData, nest) => {
      if (!hatchModal || !hatchBody) return;
      hatchModal.style.display = 'flex';
      hatchBody.innerHTML = `
        <div style="text-align: center; padding: 12px 0;">
          <div style="font-size: 3.5rem; margin-bottom: 8px; animation: pulse 1s infinite;">${speciesData.icon}</div>
          <h3 style="color: #fef08a; font-family: 'Cinzel', serif; font-size: 1.2rem; margin-bottom: 4px;">${speciesData.name}</h3>
          <span style="display: inline-block; background: #1e293b; color: #38bdf8; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px;">${speciesData.element} • Categoria: ${speciesData.category.toUpperCase()}</span>
          <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 16px; line-height: 1.4;">${speciesData.desc}</p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-adopt-dragon" class="mount-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff;">
              Adotar na Bag B 🐉
            </button>
            <button id="btn-release-dragon" class="mount-btn" style="background: #334155; color: #e2e8f0;">
              Libertar na Natureza 🕊️ (+30 Karma)
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-adopt-dragon')?.addEventListener('click', () => {
        const res = this.dragonManager.adoptHatchedDragon(speciesData.id);
        if (res.success) {
          this.showToast(`🎉 ${speciesData.name} foi adicionado à sua Mochila de Dragões!`);
        } else {
          this.showToast(`⚠️ ${res.reason}`);
        }
        hatchModal.style.display = 'none';
      });

      document.getElementById('btn-release-dragon')?.addEventListener('click', () => {
        this.showToast(`🕊️ Você libertou o dragãozinho na natureza. Karma e harmonia da ilha aumentados! (+30)`);
        hatchModal.style.display = 'none';
      });
    };
  }

  setupHeroSelectionUI() {
    const modal = document.getElementById('hero-selection-modal');
    const closeBtn = document.getElementById('btn-close-hero-selection');
    const grid = document.getElementById('hero-selection-grid');
    const profileBtn = document.getElementById('btn-hero-profile');

    this.updateHeroHeaderBadge = (heroId) => {
      const hero = PLAYABLE_HEROES.find(h => h.id === heroId) || PLAYABLE_HEROES[0];
      const avatarEl = document.getElementById('header-hero-avatar');
      const nameEl = document.getElementById('header-hero-name');
      const passiveEl = document.getElementById('header-hero-passive');

      if (avatarEl) avatarEl.src = `assets/characters/${hero.id}/portrait.jpg`;
      if (nameEl) nameEl.innerText = hero.name.split(' (')[0];
      if (passiveEl) passiveEl.innerText = hero.passive.name;
    };

    this.openHeroSelectionModal = () => {
      if (!modal || !grid) return;
      grid.innerHTML = '';
      modal.style.display = 'flex';

      PLAYABLE_HEROES.forEach((hero) => {
        const isCurrent = this.player.heroId === hero.id;
        const card = document.createElement('div');
        card.className = `hero-card ${isCurrent ? 'selected' : ''}`;

        card.innerHTML = `
          <img src="assets/characters/${hero.id}/portrait.jpg" alt="${hero.name}" class="hero-card-portrait">
          <div class="hero-card-name">${hero.name}</div>
          <div class="hero-card-tags">
            <span class="hero-badge archetype">${hero.archetype}</span>
            <span class="hero-badge gender">${hero.gender === 'male' ? 'Masc' : 'Fem'}</span>
          </div>
          <div class="hero-passive-box">
            <span class="hero-passive-title">${hero.passive.name}</span>
            <span>${hero.passive.desc}</span>
          </div>
          <button class="hero-select-btn ${isCurrent ? 'active' : ''}">
            ${isCurrent ? 'Herói Atual' : 'Escolher Herói'}
          </button>
        `;

        card.querySelector('.hero-select-btn')?.addEventListener('click', () => {
          this.player.setHero(hero.id);
          localStorage.setItem('kidslearn_active_hero', hero.id);
          this.updateHeroHeaderBadge(hero.id);
          this.triggerAutoSave();
          this.player.spawnCraftPoof();
          this.showToast(`Você agora é ${hero.name}! Habilidade Ativa: ${hero.passive.name}`);
          modal.style.display = 'none';
        });

        grid.appendChild(card);
      });
    };

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    profileBtn?.addEventListener('click', () => {
      this.openHeroSelectionModal();
    });

    // Shortcut 'P' in Play Mode to open Hero Selection
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (this.mode === 'play' && (e.key === 'p' || e.key === 'P')) {
        const isVisible = modal.style.display !== 'none';
        if (isVisible) {
          modal.style.display = 'none';
        } else {
          this.openHeroSelectionModal();
        }
      }
    });

    // Initialize saved hero or default
    const savedHero = localStorage.getItem('kidslearn_active_hero') || 'char_wolf_hunter_m';
    this.player.setHero(savedHero);
    this.updateHeroHeaderBadge(savedHero);
  }

  setupBackpackUI() {
    const modal = document.getElementById('backpack-modal');
    const closeBtn = document.getElementById('btn-close-backpack');
    const quickBackpackBtn = document.getElementById('btn-open-backpack');
    const tabsContainer = document.getElementById('backpack-tabs');

    let currentTab = 'items';

    const renderItemsTab = () => {
      const grid = document.getElementById('backpack-items-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const items = this.inventorySystem.getItems();

      items.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'backpack-slot';
        slot.title = item.desc;
        slot.innerHTML = `
          <span class="backpack-slot-count">x${item.count}</span>
          <span class="backpack-slot-icon">${item.icon}</span>
          <span class="backpack-slot-name">${item.name}</span>
          <span class="backpack-slot-category">${item.category}</span>
        `;
        grid.appendChild(slot);
      });
    };

    const renderToolsTab = () => {
      const list = document.getElementById('backpack-tools-list');
      if (!list) return;
      list.innerHTML = '';
      const tools = this.inventorySystem.getTools();
      const equipped = this.inventorySystem.getEquippedTool();

      tools.forEach(tool => {
        const isEquipped = equipped?.id === tool.id;
        const card = document.createElement('div');
        card.className = 'tool-card';
        const pct = Math.round((tool.durability / tool.maxDurability) * 100);

        card.innerHTML = `
          <div class="tool-info">
            <span class="tool-icon">${tool.icon}</span>
            <div class="tool-details">
              <h4>${tool.name} ${isEquipped ? '<span style="font-size: 0.72rem; color: #10b981;">[Equipado]</span>' : ''}</h4>
              <p>${tool.desc} • Poder: ${tool.power}x</p>
            </div>
          </div>
          <div class="durability-bar-wrapper">
            <div class="durability-label">
              <span>Durabilidade</span>
              <span>${tool.durability}/${tool.maxDurability}</span>
            </div>
            <div class="durability-bar">
              <div class="durability-fill" style="width: ${pct}%"></div>
            </div>
          </div>
          <button class="btn-equip-tool ${isEquipped ? 'equipped' : ''}" data-id="${tool.id}">
            ${isEquipped ? 'Equipado ✅' : 'Equipar 🛠️'}
          </button>
        `;

        card.querySelector('.btn-equip-tool')?.addEventListener('click', () => {
          if (!isEquipped) {
            this.inventorySystem.equipTool(tool.id);
            this.player.spawnCraftPoof();
            this.showToast(`🛠️ ${tool.name} equipado com sucesso!`);
            renderToolsTab();
          }
        });

        list.appendChild(card);
      });
    };

    const renderEggsTab = () => {
      const list = document.getElementById('backpack-eggs-list');
      if (!list) return;
      list.innerHTML = '';
      const eggs = this.inventorySystem.getEggs();

      if (eggs.length === 0) {
        list.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #94a3b8;">
            <p style="font-size: 2rem; margin-bottom: 8px;">🪹</p>
            <p>Seu ninho está vazio no momento. Explore a Ilha Lua e use 'E' perto de ninhos selvagens para coletar novos ovos de dragão!</p>
          </div>
        `;
        return;
      }

      eggs.forEach(egg => {
        const card = document.createElement('div');
        card.className = 'egg-card';
        const pct = Math.round((egg.warmth / egg.maxWarmth) * 100);

        card.innerHTML = `
          <div class="egg-info">
            <span class="egg-icon">${egg.icon}</span>
            <div class="egg-details">
              <h4>${egg.name}</h4>
              <p>${egg.desc}</p>
            </div>
          </div>
          <div class="warmth-bar-wrapper">
            <div class="warmth-label">
              <span>Incubação / Calor</span>
              <span>${pct}%</span>
            </div>
            <div class="warmth-bar">
              <div class="warmth-fill" style="width: ${pct}%"></div>
            </div>
          </div>
          <button class="btn-warm-egg" data-id="${egg.id}">
            🔥 Aquecer (+25%)
          </button>
        `;

        card.querySelector('.btn-warm-egg')?.addEventListener('click', () => {
          const res = this.inventorySystem.warmEgg(egg.id, 25);
          if (res.success) {
            if (res.hatched) {
              this.dragonManager.adoptHatchedDragon(egg.speciesId);
              this.inventorySystem.removeEgg(egg.id);
              this.player.spawnCraftPoof();
              this.showToast(`🥚✨ O ${egg.name} chocou! Um novo dragão se juntou ao seu grupo!`);
              renderEggsTab();
            } else {
              this.player.spawnCraftPoof();
              this.showToast(`🔥 Você aqueceu o ${egg.name}! Calor: ${res.warmth}%`);
              renderEggsTab();
            }
          }
        });

        list.appendChild(card);
      });
    };

    const renderDragonsTab = () => {
      const list = document.getElementById('backpack-dragons-list');
      if (!list) return;
      list.innerHTML = '';

      const party = this.dragonManager.getParty();
      const activeDragon = this.dragonManager.getActiveDragon();
      const isMounted = this.dragonManager.isMounted();

      party.forEach((drag) => {
        const item = document.createElement('div');
        item.className = 'dragon-party-item';
        const isActive = activeDragon?.id === drag.id;

        item.innerHTML = `
          <div class="dragon-info">
            <div class="dragon-details">
              <h4>${drag.name} <span style="font-size: 0.75rem; color: #f59e0b; background: #1e293b; padding: 2px 6px; border-radius: 4px;">Lv.${drag.level}</span></h4>
              <p><strong>${drag.element}</strong> • HP: ${drag.hp}/${drag.maxHp} • Amizade: ${drag.bond}%</p>
              <p style="color: #94a3b8; font-size: 0.72rem;">Especial: ${drag.fieldMove}</p>
              <p style="color: #38bdf8; font-size: 0.72rem;">Esquiva [1]: ${drag.dodgeAbility}</p>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <button class="mount-btn btn-toggle-mount" data-id="${drag.id}" style="${isActive && isMounted ? 'background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff;' : ''}">
              ${isActive && isMounted ? 'Desmontar' : 'Montar'}
            </button>
            <button class="mount-btn btn-toggle-follow" data-id="${drag.id}" style="background: ${isActive && !isMounted ? '#10b981' : '#334155'}; color: #fff; font-size: 0.72rem; padding: 4px 8px;">
              ${isActive && !isMounted ? 'Acompanhando' : 'Acompanhar'}
            </button>
          </div>
        `;

        item.querySelector('.btn-toggle-mount')?.addEventListener('click', () => {
          this.dragonManager.setActiveDragon(drag.id);
          if (isActive && isMounted) {
            this.dragonManager.setMode('follow');
            this.showToast(`Você desmontou de ${drag.name}.`);
          } else {
            this.dragonManager.setMode('mounted');
            this.showToast(`Você montou em ${drag.name}! (+Velocidade de Corrida)`);
          }
          renderDragonsTab();
        });

        item.querySelector('.btn-toggle-follow')?.addEventListener('click', () => {
          this.dragonManager.setActiveDragon(drag.id);
          this.dragonManager.setMode('follow');
          this.showToast(`${drag.name} agora está te acompanhando!`);
          renderDragonsTab();
        });

        list.appendChild(item);
      });
    };

    const switchTab = (tabName) => {
      currentTab = tabName;
      document.querySelectorAll('.backpack-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
      });

      const contents = ['items', 'tools', 'eggs', 'dragons'];
      contents.forEach(name => {
        const el = document.getElementById(`tab-content-${name}`);
        if (el) el.style.display = (name === tabName) ? 'block' : 'none';
      });

      if (tabName === 'items') renderItemsTab();
      if (tabName === 'tools') renderToolsTab();
      if (tabName === 'eggs') renderEggsTab();
      if (tabName === 'dragons') renderDragonsTab();
    };

    tabsContainer?.querySelectorAll('.backpack-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    this.openBackpackModal = (initialTab = 'items') => {
      if (!modal) return;
      modal.style.display = 'flex';
      switchTab(initialTab);
    };

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    quickBackpackBtn?.addEventListener('click', () => {
      this.openBackpackModal('items');
    });

    // Shortcut 'B' and 'I' in Play Mode to toggle Backpack
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (this.mode === 'play' && (e.key === 'b' || e.key === 'B' || e.key === 'i' || e.key === 'I')) {
        const isVisible = modal.style.display !== 'none';
        if (isVisible) {
          modal.style.display = 'none';
        } else {
          this.openBackpackModal(e.key.toLowerCase() === 'b' ? 'items' : 'items');
        }
      }
    });
  }

  setupCodingStudioUI() {
    const modal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
    const closeBtn = document.getElementById('btn-close-coding');
    const lessonSelect = document.getElementById('select-lua-lesson');
    const lessonDesc = document.getElementById('lesson-desc');
    const rewardBadge = document.getElementById('lesson-reward-badge');
    const unlockBadge = document.getElementById('lesson-unlock-target');
    const codeEditor = document.getElementById('lua-code-editor');
    const consoleOut = document.getElementById('lua-console-output');
    const btnRun = document.getElementById('btn-run-lua');
    const btnReset = document.getElementById('btn-reset-lua');
    const btnClearWorkspace = document.getElementById('btn-clear-workspace');
    const paletteEl = document.getElementById('scratch-palette');
    const workspaceEl = document.getElementById('scratch-workspace');

    if (!modal || !lessonSelect || !codeEditor) return;

    if (this.scratchEngine) {
      if (paletteEl) this.scratchEngine.setPaletteContainer(paletteEl);
      if (workspaceEl) this.scratchEngine.setWorkspaceContainer(workspaceEl);
      if (codeEditor) this.scratchEngine.setCodeOutputContainer(codeEditor);
    }

    // Category buttons filter
    document.querySelectorAll('.scratch-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scratch-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.category || 'all';
        if (this.scratchEngine) {
          this.scratchEngine.setFilterCategory(cat);
        }
      });
    });

    // Clear Workspace Button
    btnClearWorkspace?.addEventListener('click', () => {
      if (this.scratchEngine) {
        this.scratchEngine.clearWorkspace();
      }
    });

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    const populateLessons = () => {
      lessonSelect.innerHTML = '';
      this.blocklySystem.lessons.forEach((l, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        const isDone = this.blocklySystem.completedLessons.has(l.id);
        opt.innerText = `${isDone ? '[Concluído] ' : ''}${l.title}`;
        lessonSelect.appendChild(opt);
      });
    };

    const loadLesson = (idx) => {
      const lesson = this.blocklySystem.setLesson(idx);
      if (!lesson) return;

      if (lessonDesc) lessonDesc.innerText = `${lesson.mentor} (${lesson.mentorRole}): ${lesson.description}`;
      if (rewardBadge) rewardBadge.innerText = `+${lesson.rewardXP} XP / +${lesson.rewardGold} Moedas`;
      if (unlockBadge) unlockBadge.innerText = `Desbloqueio: ${lesson.unlockedAssetName || 'Item Especial'}`;
      if (codeEditor) codeEditor.value = lesson.starterLua;
      if (this.scratchEngine) {
        this.scratchEngine.loadLessonBlocks(lesson.blocks, lesson.starterLua);
      }
      if (consoleOut) {
        consoleOut.innerHTML = `> Lição carregada: <strong>${lesson.title}</strong> (${lesson.concept})\n> Objeto a Desbloquear: <strong>${lesson.unlockedAssetName}</strong>\n> Arraste os blocos ou edite os valores e clique em 'Executar Montagem & Fabricar'.`;
      }
    };

    populateLessons();
    loadLesson(0);

    lessonSelect.addEventListener('change', (e) => {
      loadLesson(parseInt(e.target.value, 10));
    });

    // Run code & execute physical Map Grid spawning (Step 2)
    btnRun?.addEventListener('click', () => {
      const code = codeEditor.value;
      const res = this.blocklySystem.runScript(code);

      if (consoleOut) {
        let outHtml = `> Executando montagem e script Lua...\n`;
        if (res.logs && res.logs.length > 0) {
          outHtml += res.logs.map(l => `> [LOG] ${l}`).join('\n') + '\n';
        }
        outHtml += `> ${res.message}\n`;
        consoleOut.innerText = outHtml;
        consoleOut.scrollTop = consoleOut.scrollHeight;
      }

      if (res.success) {
        this.showToast(res.message, 4500);
        populateLessons();

        if (res.unlockedAssetId && this.craftingSystem) {
          this.craftingSystem.unlockRecipe(res.unlockedAssetId);
        }

        // Physical Map Grid Spawning in front of Player
        const dirDeltas = { north: { dx: 0, dy: -1 }, south: { dx: 0, dy: 1 }, west: { dx: -1, dy: 0 }, east: { dx: 1, dy: 0 } };
        const delta = dirDeltas[this.player.direction] || { dx: 0, dy: 1 };
        const pTx = Math.floor((this.player.x + 32) / 64);
        const pTy = Math.floor((this.player.y + 32) / 64);
        const targetX = pTx + delta.dx;
        const targetY = pTy + delta.dy;

        if (res.logs && res.logs.length > 0) {
          for (const log of res.logs) {
            if (log.startsWith('movel_fabricado:') || log.startsWith('mesa_fabricada:') || log.startsWith('cama_fabricada:') || log.startsWith('cama_nobre_fabricada:') || log.startsWith('tenda_erguida:') || log.startsWith('casa_concluida:')) {
              this.tileMap.setTile('solid', targetX, targetY, 'crate');
              this.inventorySystem.addItem('wood', 10);
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('ferramenta_forjada:') || log.startsWith('machado_forjado:') || log.startsWith('picareta_forjada:')) {
              this.inventorySystem.addItem('iron_ore', 5);
              if (log.includes('pickaxe')) this.inventorySystem.equipTool('tool_pickaxe');
              if (log.includes('axe')) this.inventorySystem.equipTool('tool_axe');
              this.player.spawnCraftPoof();
            } else if (log.startsWith('regador_pronto:') || log.startsWith('sementes_embaladas:') || log.startsWith('arbusto_plantado:') || log.startsWith('arvore_cultivada:') || log.startsWith('pinheiro_plantado:')) {
              this.tileMap.setTile('decor', targetX, targetY, 'flower-magic');
              this.inventorySystem.addItem('pumpkin_seed', 5);
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('cerca_fincada:') || log.startsWith('portao_montado:') || log.startsWith('ponte_h_construida:') || log.startsWith('ponte_v_construida:')) {
              this.tileMap.setTile('solid', targetX, targetY, 'crate');
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('vara_montada:') || log.startsWith('rede_tecida:') || log.startsWith('agua_animada:') || log.startsWith('cachoeira_gerada:')) {
              this.inventorySystem.addItem('sea_bass', 2);
              this.player.spawnCraftPoof();
            } else if (log.startsWith('piso_assentado:') || log.startsWith('paralelepipedo_encaixado:') || log.startsWith('tabuado_pregado:') || log.startsWith('grama_florida_semeada:') || log.startsWith('praia_criada:') || log.startsWith('mosaico_polido:')) {
              this.tileMap.setTile('ground', targetX, targetY, 'grass');
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('poste_aceso:') || log.startsWith('poco_erguido:') || log.startsWith('degraus_entalhados:') || log.startsWith('rampa_esculpida:')) {
              this.tileMap.setTile('solid', targetX, targetY, 'crate');
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('fogueira_acesa:') || log.startsWith('magma_borbulhante:')) {
              this.tileMap.setTile('decor', targetX, targetY, 'flower-magic');
              this.player.spawnCraftPoof();
              this.triggerAutoSave();
            } else if (log.startsWith('ninho_aquecido_criado:') || log.startsWith('apito_entalhado:') || log.startsWith('ovo_desperto:') || log.startsWith('ovo_sagrado_desperto:')) {
              this.dragonManager.adoptHatchedDragon('dragon_fly_solar');
              this.player.spawnCraftPoof();
            }
          }
        }
      } else {
        this.showToast(res.message, 4000);
      }
    });

    // Reset code & blocks
    btnReset?.addEventListener('click', () => {
      const lesson = this.blocklySystem.getCurrentLesson();
      if (lesson) {
        if (codeEditor) codeEditor.value = lesson.starterLua;
        if (this.scratchEngine) {
          this.scratchEngine.loadLessonBlocks(lesson.blocks, lesson.starterLua);
        }
        if (consoleOut) consoleOut.innerText = '> Desafio restaurado ao estado inicial.';
      }
    });

    // Shortcut 'K' in Play Mode to open Coding Studio
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (this.mode === 'play' && (e.key === 'k' || e.key === 'K')) {
        const isVisible = modal.style.display !== 'none';
        if (isVisible) {
          modal.style.display = 'none';
        } else {
          modal.style.display = 'flex';
          loadLesson(this.blocklySystem.activeLessonIndex);
        }
      }
    });
  }

  setupQuickMountButton() {
    this.toggleQuickMount = () => {
      if (this.mode !== 'play') return;
      const res = this.dragonManager.toggleMount();
      if (res.success) {
        const isMounted = res.mounted;
        const btn = document.getElementById('btn-quick-mount');
        const label = document.getElementById('quick-mount-label');
        if (btn) btn.classList.toggle('mounted', isMounted);
        if (label) {
          label.innerText = isMounted ? 'Desmontar [R]' : 'Montar [R]';
        }
        this.player.isMounted = isMounted;
        this.player.mountSpeedMultiplier = res.dragon?.mountSpeedMultiplier || 1.8;
        if (isMounted) {
          this.showToast(`Você montou em ${res.dragon.name}! (+Velocidade de Corrida)`);
        } else {
          this.showToast(`Você desmontou de ${res.dragon.name}.`);
        }
      } else {
        this.showToast(res.reason || 'Nenhum dragão disponível para montaria.');
      }
    };

    const btn = document.getElementById('btn-quick-mount');
    if (btn) {
      btn.addEventListener('click', () => this.toggleQuickMount());
    }
  }

  setupNetworkDisconnectionMonitor() {
    const overlay = document.getElementById('disconnection-overlay');
    const retryBtn = document.getElementById('btn-retry-connection');
    const statusText = document.getElementById('disconnection-status-text');

    const showDisconnection = (reason = 'Sem conexão com a internet') => {
      this.isNetworkDisconnected = true;
      this.player.resetKeys();
      if (overlay) {
        overlay.style.display = 'flex';
      }
      if (statusText) {
        statusText.innerText = reason;
      }
    };

    const tryReconnect = () => {
      if (navigator.onLine) {
        this.isNetworkDisconnected = false;
        if (overlay) overlay.style.display = 'none';
        if (this.multiplayerClient) {
          this.multiplayerClient.connect();
        }
        this.showToast('🌐 Conexão restaurada com sucesso! Bem-vindo de volta!');
      } else {
        showDisconnection('Ainda offline. Verifique seu Wi-Fi/rede local.');
        this.showToast('⚠️ Sem conexão com a internet. Verifique sua rede e tente novamente.', 3500);
      }
    };

    window.addEventListener('offline', () => {
      showDisconnection('Conexão com a internet perdida');
    });

    window.addEventListener('online', () => {
      tryReconnect();
    });

    retryBtn?.addEventListener('click', () => {
      tryReconnect();
    });

    // Check initial online status
    if (!navigator.onLine) {
      showDisconnection('Você está sem conexão com a internet.');
    }
  }
}

// Bootstrap application on page load
window.addEventListener('DOMContentLoaded', () => {
  const app = new RPGApplication();
  app.init();
});
