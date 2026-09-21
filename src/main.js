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
import { TutorialManager } from './engine/TutorialManager.js';
import { soundFX } from './engine/SoundFX.js';


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
    this.tutorialManager = new TutorialManager(this);

    if (this.scratchEngine) {
      this.scratchEngine.onBlockAdded = () => {
        this.tutorialManager?.onBlockAddedToWorkspace();
      };
    }

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

    // Active NPC dialogue tracking & camera zoom
    this.activeDialogueNPC = null;
    this.dialogueSystem.onDialogueOpen = (npc) => {
      this.player.isDialogueActive = true;
      this.player.resetKeys();
      this.activeDialogueNPC = npc;
      this.tutorialManager?.onNPCDialogueOpened(npc?.id);
    };
    this.dialogueSystem.onDialogueClose = () => {
      this.player.isDialogueActive = false;
      this.activeDialogueNPC = null;
    };

    // FPS Counter
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Auto-save debouncing & persistence
    this.STORAGE_KEY = 'kidslean_rpg_world_map_v3';
    this.saveTimeout = null;
  }

  async init() {
    const hideLoader = () => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen && loadingScreen.style.display !== 'none') {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          if (loadingScreen) loadingScreen.style.display = 'none';
        }, 250);
      }
    };

    // Failsafe: hide loader after 2s under any circumstances
    const forceHideTimer = setTimeout(hideLoader, 2000);

    try {
      const safeCall = (fn, name) => {
        try {
          if (typeof fn === 'function') fn.call(this);
        } catch (e) {
          console.warn(`[Init] Non-fatal issue in ${name}:`, e);
        }
      };

      safeCall(this.setupWindowResize, 'setupWindowResize');
      safeCall(this.setupDrawerResizing, 'setupDrawerResizing');
      safeCall(this.setupColliderPanel, 'setupColliderPanel');
      safeCall(this.setupPlayCameraZoomPanel, 'setupPlayCameraZoomPanel');
      safeCall(this.setupTileInspector, 'setupTileInspector');
      safeCall(this.setupLayerManager, 'setupLayerManager');
      safeCall(this.setupChatSystem, 'setupChatSystem');
      safeCall(this.setupAuthUI, 'setupAuthUI');
      safeCall(this.setupHeroSelectionUI, 'setupHeroSelectionUI');
      safeCall(this.setupBackpackUI, 'setupBackpackUI');
      safeCall(this.setupCraftingUI, 'setupCraftingUI');
      safeCall(this.setupCodingStudioUI, 'setupCodingStudioUI');
      safeCall(this.setupQuickMountButton, 'setupQuickMountButton');
      safeCall(this.setupNetworkDisconnectionMonitor, 'setupNetworkDisconnectionMonitor');
      safeCall(this.bindDOMEvents, 'bindDOMEvents');

      // Ativa proteções de segurança
      try { securityManager.init(); } catch (e) { console.warn('SecurityManager init:', e); }

      // Initialize Storage & Supabase in parallel
      await Promise.allSettled([
        this.storageManager.init().catch(e => console.warn('StorageManager error:', e)),
        this.supabaseClient.init().catch(e => console.warn('SupabaseClient error:', e))
      ]);

      if (this.multiplayerClient) {
        this.multiplayerClient.attachSupabase(this.supabaseClient);
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

      await this.assetLoader.syncWithStorage(this.storageManager).catch(e => console.warn('AssetLoader sync:', e));

      // Preload sprites and tiles
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');

      await this.assetLoader.loadAll((progress) => {
        const pct = Math.round(progress * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.innerText = `${pct}%`;
      }).catch(e => console.warn('AssetLoader loadAll:', e));

      if (progressFill) progressFill.style.width = '100%';
      if (progressText) progressText.innerText = '100%';
    } catch (err) {
      console.error('Error during init/asset preloading:', err);
    } finally {
      clearTimeout(forceHideTimer);
      hideLoader();
    }

    // Load saved map & game state from IndexedDB (with multi-key migration/fallback)
    await this.loadGameFromStorage().catch(e => console.warn('loadGameFromStorage error:', e));

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

    // Start Interactive Kid-Friendly Tutorial
    try {
      this.tutorialManager?.startTutorial();
    } catch (tutErr) {
      console.warn('TutorialManager start error:', tutErr);
    }
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
        characters: { id: 'characters', label: 'Personagens', color: '#ec4899', desc: 'Herói / NPCs' },
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
            this.showToast(`Camada "${def.label}" movida para cima na hierarquia visual!`);
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
            this.showToast(`Camada "${def.label}" movida para baixo na hierarquia visual!`);
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
        characters: { id: 'characters', label: 'Camada 4 (Personagens)', color: '#ec4899', desc: 'Herói / NPCs' },
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
            this.showToast(`Camada ativa alterada para ${targetLayer}!`);
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
      this.showToast(`Escala do personagem alterada para ${scale}x!`);
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
        this.showToast(`Zoom da câmera de jogo definido para ${z}x!`);
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
          this.showToast('Câmera centralizada no Herói [F]');
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

    // Mouse wheel zoom in Play & Editor Mode (smooth zoom)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      // World pos before zoom
      const worldPosBefore = this.camera.screenToWorld(mouseScreenX, mouseScreenY);

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const minZoom = this.mode === 'edit' ? 0.3 : 0.6;
      const maxZoom = this.mode === 'edit' ? 3.5 : 2.5;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, this.camera.zoom * zoomFactor));
      this.camera.zoom = newZoom;

      // Reposition camera so mouse points to the exact same world coordinate
      this.camera.x = worldPosBefore.x - mouseScreenX / newZoom;
      this.camera.y = worldPosBefore.y - mouseScreenY / newZoom;
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
      if (playHint) playHint.style.display = 'flex';
      assetDrawer.classList.add('collapsed');
      assetDrawer.style.display = 'none';
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
      if (playHint) playHint.style.display = 'none';
      assetDrawer.style.display = 'flex';
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
        this.showToast('Ação desfeita (Desfazer)');
      }
    });

    document.getElementById('btn-redo')?.addEventListener('click', () => {
      if (this.editorController.redo()) {
        this.showToast('Ação refeita (Refazer)');
      }
    });

    // Focus Hero [F] Button
    document.getElementById('btn-focus-player')?.addEventListener('click', () => {
      this.editorController.focusPlayer();
      this.showToast('Câmera centralizada no Herói [F]');
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
            this.showToast(`${addedCount} novos assets encontrados e carregados!`);
          } else {
            this.showToast('Todos os assets da pasta já estão atualizados!');
          }
        } catch (err) {
          console.error('Error refreshing assets:', err);
          this.showToast('Erro ao atualizar assets da pasta.');
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

  triggerCelebrationConfetti() {
    if (typeof document === 'undefined') return;
    const container = document.createElement('div');
    container.className = 'confetti-container';

    const colors = ['#19c8b9', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#eab308'];
    const count = 45;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-particle';

      const left = Math.random() * 100;
      const width = 8 + Math.random() * 8;
      const height = 6 + Math.random() * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = 1.8 + Math.random() * 1.5;
      const delay = Math.random() * 0.4;
      const drift = (Math.random() - 0.5) * 160;
      const rot = 360 + Math.random() * 720;

      piece.style.left = `${left}vw`;
      piece.style.width = `${width}px`;
      piece.style.height = `${height}px`;
      piece.style.background = color;
      piece.style.setProperty('--fall-duration', `${duration}s`);
      piece.style.setProperty('--drift-x', `${drift}px`);
      piece.style.setProperty('--rot', `${rot}deg`);
      piece.style.animationDelay = `${delay}s`;

      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => {
      container.remove();
    }, 4000);
  }

  triggerRewardFlight(xp = 100, gold = 50) {
    if (typeof document === 'undefined') return;

    // Origin: Center of screen / modal
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2 + 40;

    // Destination: Passport bar or avatar at top
    const passportBar = document.getElementById('passport-bar') || document.querySelector('.player-profile-pill') || document.querySelector('.bottom-shortcut-bar');
    let targetX = 60;
    let targetY = 40;

    if (passportBar) {
      const rect = passportBar.getBoundingClientRect();
      targetX = rect.left + 50;
      targetY = rect.top + 20;
    }

    const flyDx = targetX - startX;
    const flyDy = targetY - startY;

    // 1. XP Badge
    const xpBadge = document.createElement('div');
    xpBadge.className = 'reward-flight-badge badge-xp';
    xpBadge.style.left = `${startX - 75}px`;
    xpBadge.style.top = `${startY}px`;
    xpBadge.style.setProperty('--fly-dx', `${flyDx}px`);
    xpBadge.style.setProperty('--fly-dy', `${flyDy}px`);
    xpBadge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span>+${xp} XP</span>
    `;

    // 2. Gold Badge
    const goldBadge = document.createElement('div');
    goldBadge.className = 'reward-flight-badge badge-gold';
    goldBadge.style.left = `${startX + 35}px`;
    goldBadge.style.top = `${startY}px`;
    goldBadge.style.setProperty('--fly-dx', `${flyDx}px`);
    goldBadge.style.setProperty('--fly-dy', `${flyDy}px`);
    goldBadge.style.animationDelay = '0.12s';
    goldBadge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v10M15 9.5c0-.83-.67-1.5-1.5-1.5H10.5c-.83 0-1.5.67-1.5 1.5 0 2 3 1.5 3 3.5 0 .83-.67 1.5-1.5 1.5H9"></path>
      </svg>
      <span>+${gold} Moedas</span>
    `;

    document.body.appendChild(xpBadge);
    document.body.appendChild(goldBadge);

    setTimeout(() => {
      soundFX.playPop(1.3);
      xpBadge.remove();
      goldBadge.remove();
    }, 1300);
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
          colBadge.innerText = tile.isInvisibleAsset ? 'BARREIRA' : 'COL';
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

      // Sincroniza em segundo plano com a Nuvem Supabase quando o usuário está autenticado
      if (this.supabaseClient) {
        if (!this.supabaseClient.user?.isGuest && this.supabaseClient.isValidUUID?.(this.supabaseClient.user?.id)) {
          this.supabaseClient.saveCloudGame(payload);
        }
        // Salva o mapa online compartilhado e transmite via broadcast apenas em saves intencionais / modo edição
        if (instant && this.mode === 'edit') {
          this.supabaseClient.saveGlobalWorldMap(mapData);
        }
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

    // 4. Asset Drawer & Editor controls strictly hidden in Play Mode
    const assetDrawer = document.getElementById('asset-drawer');
    const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
    const editorTools = document.getElementById('editor-tools');
    const playHint = document.getElementById('play-hint');

    if (!isEdit) {
      if (assetDrawer) {
        assetDrawer.classList.add('collapsed');
        assetDrawer.style.display = 'none';
      }
      if (btnToggleDrawer) btnToggleDrawer.style.display = 'none';
      if (editorTools) editorTools.style.display = 'none';
      if (playHint) playHint.style.display = 'flex';
      this.canvasWrapper?.classList.remove('editing');
    } else {
      if (assetDrawer) {
        assetDrawer.style.display = 'flex';
      }
      if (btnToggleDrawer) btnToggleDrawer.style.display = 'flex';
      if (editorTools) editorTools.style.display = 'flex';
      if (playHint) playHint.style.display = 'none';
      this.canvasWrapper?.classList.add('editing');
    }
  }

  setupAuthUI() {
    const modal = document.getElementById('auth-modal');
    const triggerBtn = document.getElementById('btn-cloud-account');
    const headerLogoutBtn = document.getElementById('btn-header-logout');
    const closeBtn = document.getElementById('btn-close-auth');
    const labelEl = document.getElementById('cloud-account-label');

    const formContainer = document.getElementById('auth-form-container');
    const confirmationNotice = document.getElementById('auth-confirmation-notice');
    const confirmTitle = document.getElementById('auth-confirm-title');
    const confirmMessage = document.getElementById('auth-confirm-message');
    const confirmBackBtn = document.getElementById('btn-confirm-back');

    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const nicknameInput = document.getElementById('auth-nickname');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const ageContainer = document.getElementById('auth-age-verification-container');
    const over18Checkbox = document.getElementById('auth-over-18');
    const parentEmailContainer = document.getElementById('auth-parent-email-container');
    const parentEmailInput = document.getElementById('auth-parent-email');
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

    // Ouvinte automático para ativação de conta via confirmação de e-mail (Redirecionamento / Realtime)
    this.supabaseClient.onAuthChange(async (user, profile, event) => {
      if (user && !user.isGuest) {
        if (confirmationNotice) confirmationNotice.style.display = 'none';
        if (formContainer) formContainer.style.display = 'flex';
        if (modal) modal.style.display = 'none';
        refreshAuthUI();
        await this.loadGameFromStorage();
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          this.showToast(`Passaporte ativado com sucesso! Bem-vindo(a) à Ilha Lua, ${user.user_metadata?.nickname || user.email}!`, 5000);
        }
      } else {
        refreshAuthUI();
      }
    });

    triggerBtn?.addEventListener('click', () => {
      refreshAuthUI();
      if (confirmationNotice) confirmationNotice.style.display = 'none';
      if (formContainer) formContainer.style.display = 'flex';
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

    confirmBackBtn?.addEventListener('click', () => {
      if (confirmationNotice) confirmationNotice.style.display = 'none';
      if (formContainer) formContainer.style.display = 'flex';
    });

    over18Checkbox?.addEventListener('change', () => {
      if (parentEmailContainer) {
        parentEmailContainer.style.display = over18Checkbox.checked ? 'none' : 'flex';
      }
    });

    tabLogin?.addEventListener('click', () => {
      mode = 'login';
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      if (nicknameInput) nicknameInput.style.display = 'none';
      if (ageContainer) ageContainer.style.display = 'none';
      if (submitBtnLabel) submitBtnLabel.innerText = 'Entrar';
    });

    tabSignup?.addEventListener('click', () => {
      mode = 'signup';
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      if (nicknameInput) nicknameInput.style.display = 'block';
      if (ageContainer) ageContainer.style.display = 'flex';
      if (parentEmailContainer) {
        parentEmailContainer.style.display = (over18Checkbox && over18Checkbox.checked) ? 'none' : 'flex';
      }
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

      let extraData = {};
      if (mode === 'signup') {
        const isOver18 = over18Checkbox ? over18Checkbox.checked : false;
        let parentEmail = '';
        if (!isOver18) {
          parentEmail = parentEmailInput ? parentEmailInput.value.trim() : '';
          const isValidEmail = parentEmail.length > 5 && parentEmail.includes('@') && parentEmail.includes('.');
          if (!isValidEmail) {
            this.showToast('Conforme o ECA, informe um e-mail válido do responsável legal para criar a conta.');
            return;
          }
        }
        extraData = { isOver18, parentEmail: isOver18 ? null : parentEmail };
      }

      submitBtn.disabled = true;
      if (submitBtnLabel) submitBtnLabel.innerText = 'Conectando...';

      let res;
      if (mode === 'signup') {
        res = await this.supabaseClient.signUp(email, password, nickname, extraData);
      } else {
        res = await this.supabaseClient.signIn(email, password);
      }

      submitBtn.disabled = false;
      if (submitBtnLabel) submitBtnLabel.innerText = mode === 'signup' ? 'Criar Conta' : 'Entrar';

      if (res.success) {
        if (res.requiresConfirmation) {
          if (formContainer) formContainer.style.display = 'none';
          if (confirmationNotice) {
            confirmationNotice.style.display = 'flex';
            if (confirmTitle) {
              confirmTitle.innerText = res.isMinor ? 'Autorização do Responsável (ECA)' : 'Confirmação de E-mail';
            }
            if (confirmMessage) {
              confirmMessage.innerText = res.isMinor
                ? `Conforme o ECA (Lei 8.069/90), enviamos um link de autorização para o responsável em ${res.confirmTarget}. O responsável deve clicar no link para aprovar seu acesso à Ilha Lua!`
                : `Enviamos um link de confirmação para ${res.confirmTarget}. Acesse sua caixa de entrada e clique no link para ativar seu Passaporte da Ilha Lua!`;
            }
          }
          this.showToast(res.message, 6000);
          refreshAuthUI();
        } else {
          this.showToast(`Bem-vindo(a), ${res.user.user_metadata?.nickname || res.user.email}!`);
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
      this.tutorialManager?.update(this.camera, this.player);

      // NPC Dialogue Camera Zoom and Anchor Positioning
      if (this.player.isDialogueActive && this.activeDialogueNPC) {
        const targetZoom = 1.55;
        this.camera.zoom += (targetZoom - this.camera.zoom) * 0.08;
        const targetWorldX = this.activeDialogueNPC.worldX ?? (this.activeDialogueNPC.tx ? this.activeDialogueNPC.tx * 64 : this.player.x);
        const targetWorldY = this.activeDialogueNPC.worldY ?? (this.activeDialogueNPC.ty ? this.activeDialogueNPC.ty * 64 : this.player.y);
        const midX = ((this.player.x + targetWorldX) / 2) + 32;
        const midY = ((this.player.y + targetWorldY) / 2) + 32;
        this.camera.follow(midX, midY, 0.08);
        this.dialogueSystem.updateDialoguePosition(this.camera);
      } else {
        const baseZoom = this.tileMap.playCameraZoom || 1.0;
        if (Math.abs(this.camera.zoom - baseZoom) > 0.005) {
          this.camera.zoom += (baseZoom - this.camera.zoom) * 0.08;
        }
        this.camera.follow(this.player.x + 32, this.player.y + 32, 0.1);
      }

      // Sync active dragon mount multiplier to player
      const activeDragon = this.dragonManager?.getActiveDragon();
      const isMounted = this.dragonManager?.isMounted();
      this.player.isMounted = isMounted;
      if (isMounted && activeDragon) {
        this.player.speed = (this.player.isSprinting ? this.player.sprintSpeed : this.player.baseSpeed) * (activeDragon.mountSpeedMultiplier || 1.6);
      }

      // Move player with collision checking against tile colliders (4-way)
      this.player.update(deltaTime, this.tileMap, this.assetLoader);

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

            // 1. Solid layer root tiles within viewport (2 blocks padding)
            const solidLayer = this.tileMap.layers.solid;
            if (solidLayer && solidLayer.size > 0) {
              const padding = 2;
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

            // 2. Characters layer tiles within viewport (2 blocks padding)
            const charLayer = this.tileMap.layers.characters;
            if (charLayer && charLayer.size > 0) {
              const padding = 2;
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
          this.multiplayerClient.render(this.ctx, this.assetLoader, this.camera);
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
    this.player.isDialogueActive = true;
    this.player.resetKeys();
    this.activeDialogueNPC = npc;
    this.dialogueSystem.openNpcConversation(npc, this.blocklySystem, {
      onOpenLesson: (lessonId) => {
        this.openCodingChallengeModal(lessonId);
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

  getItemSvgIcon(iconKey) {
    const iconMap = {
      wood: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3v12c0 1.66-3.58 3-8 3s-8-1.34-8-3V6z"/><ellipse cx="12" cy="6" rx="8" ry="3"/></svg>`,
      stone: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 14 7 5 17 5 21 14 16 20 8 20 3 14"/></svg>`,
      iron_ore: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"/></svg>`,
      coin: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`,
      seed: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z"/><path d="M12 2c0 5.52 4.48 10 10 10"/></svg>`,
      fish: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12c-4-4-10-4-14 0 4 4 10 4 14 0z"/><polygon points="18 12 22 7 22 17 18 12"/><circle cx="7" cy="12" r="1"/></svg>`,
      flower: `<svg viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="3"/><circle cx="19" cy="12" r="3"/><circle cx="12" cy="19" r="3"/><circle cx="5" cy="12" r="3"/></svg>`,
      furniture: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M5 18v2M19 18v2"/></svg>`,
      structure: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>`,
      tile: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      tool_axe: `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-4 4-6-6 4-4z"/><path d="M5 21l9-9"/></svg>`,
      tool_pickaxe: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      tool_rod: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L20 4M20 4v8M20 12c0 2-2 4-4 4"/></svg>`,
      tool_watering_can: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"/><path d="M16 14l5-3v-2l-5 3M8 6h4v4H8z"/></svg>`,
      egg_solar: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="13" rx="7" ry="9"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`,
      egg_frost: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="13" rx="7" ry="9"/><path d="M12 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></svg>`,
      package: `<svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3M12 12v5M8 12h8"/></svg>`
    };
    return iconMap[iconKey] || iconMap.package;
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
        item.className = 'ac-diy-recipe-card';
        const iconSvg = this.getItemSvgIcon(rec.iconKey || this.inventorySystem.inferIconKey(rec.id));

        item.innerHTML = `
          <div class="ac-diy-recipe-header">
            <div class="ac-diy-recipe-icon">${iconSvg}</div>
            <div>
              <div class="ac-diy-recipe-title">${rec.name}</div>
              <span style="font-size: 0.72rem; color: #f59e0b; font-weight: 700;">Custo: ${rec.apCost} AP</span>
            </div>
          </div>
          <div class="ac-diy-recipe-desc">${rec.description}</div>
          <div class="ac-diy-recipe-actions">
            <button class="ac-btn-diy-blocks" data-id="${rec.id}">
              <svg class="ui-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Montar Blocos</span>
            </button>
            <button class="ac-btn-diy-quick" data-id="${rec.id}">
              <span>Criar Rápido</span>
            </button>
          </div>
        `;

        // "Montar com Blocos" -> Opens Scratch studio configured for this recipe
        item.querySelector('.ac-btn-diy-blocks')?.addEventListener('click', () => {
          craftingModal.style.display = 'none';
          const starterCode = `-- Criando ${rec.name}\nfabricar_movel("${rec.assetId}", "carvalho")`;
          this.openCodingChallengeModal(null, {
            title: `Bancada DIY: ${rec.name}`,
            mentor: 'Bancada DIY',
            mentorRole: 'Oficina da Ilha',
            description: `Encaixe o bloco na área de montagem para fabricar ${rec.name} e guardar na sua Bolsa.`,
            reward: 'Item Pronto',
            unlock: rec.name,
            starterLua: starterCode
          });
        });

        // "Criar Rápido"
        item.querySelector('.ac-btn-diy-quick')?.addEventListener('click', () => {
          const res = this.craftingSystem.craftItem(rec.id, this.player, () => {
            this.inventorySystem.addItem(rec.assetId, 1, { name: rec.name });
            this.player.spawnCraftPoof();
            this.showToast(`${rec.name} fabricado e guardado na sua Bolsa!`);
          });
          if (res.success) {
            this.inventorySystem.addItem(rec.assetId, 1, { name: rec.name });
            this.player.spawnCraftPoof();
            this.showToast(`${rec.name} guardado na sua Bolsa!`);
            craftingModal.style.display = 'none';
          } else {
            this.showToast(res.reason || 'Materiais insuficientes!');
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
              Adotar na Mochila
            </button>
            <button id="btn-release-dragon" class="mount-btn" style="background: #334155; color: #e2e8f0;">
              Libertar na Natureza (+30 Harmonia)
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-adopt-dragon')?.addEventListener('click', () => {
        const res = this.dragonManager.adoptHatchedDragon(speciesData.id);
        if (res.success) {
          this.showToast(`${speciesData.name} foi adicionado à sua Mochila de Dragões!`);
        } else {
          this.showToast(res.reason);
        }
        hatchModal.style.display = 'none';
      });

      document.getElementById('btn-release-dragon')?.addEventListener('click', () => {
        this.showToast(`Você libertou o dragãozinho na natureza. Harmonia da ilha aumentada! (+30)`);
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
      if (e.target && e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
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
    const walletGold = document.getElementById('pocket-wallet-gold');
    const walletXp = document.getElementById('pocket-wallet-xp');

    let selectedItem = null;
    let selectedTool = null;
    let selectedEgg = null;
    let selectedDragon = null;
    let currentTab = 'items';

    const updateWalletBar = () => {
      const goldItem = this.inventorySystem.items.find(i => i.id === 'gold_coin');
      if (walletGold) walletGold.innerText = goldItem ? `${goldItem.count}` : '0';
      if (walletXp) walletXp.innerText = `Nv. 1 (100 XP)`;
    };

    // ==========================================
    // TAB 1: ITENS
    // ==========================================
    const itemsGrid = document.getElementById('backpack-items-grid');
    const itemDetailIcon = document.getElementById('pocket-detail-icon');
    const itemDetailName = document.getElementById('pocket-detail-name');
    const itemDetailDesc = document.getElementById('pocket-detail-desc');
    const itemDetailActions = document.getElementById('pocket-detail-actions');
    const btnPlaceItem = document.getElementById('btn-pocket-place');

    const updateItemDetailPanel = (item) => {
      if (!item) {
        if (itemDetailName) itemDetailName.innerText = 'Selecione um item';
        if (itemDetailDesc) itemDetailDesc.innerText = 'Clique em um dos bolsos para ver detalhes e opções.';
        if (itemDetailIcon) itemDetailIcon.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`;
        if (itemDetailActions) itemDetailActions.style.display = 'none';
        return;
      }

      const iconSvg = this.getItemSvgIcon(item.iconKey || this.inventorySystem.inferIconKey(item.id));
      if (itemDetailIcon) itemDetailIcon.innerHTML = iconSvg;
      if (itemDetailName) itemDetailName.innerText = `${item.name} (x${item.count})`;
      if (itemDetailDesc) itemDetailDesc.innerText = item.desc || 'Item coletado ou fabricado na ilha.';
      if (itemDetailActions) itemDetailActions.style.display = 'flex';
    };

    const renderItemsTab = () => {
      if (!itemsGrid) return;
      itemsGrid.innerHTML = '';
      const slots = this.inventorySystem.getPocketSlots(20);

      slots.forEach((item, slotIndex) => {
        const slotEl = document.createElement('div');
        slotEl.className = `ac-pocket-slot ${item ? 'filled' : 'empty'} ${selectedItem?.id === item?.id && item ? 'selected' : ''}`;
        slotEl.dataset.slot = slotIndex;

        if (item) {
          const iconSvg = this.getItemSvgIcon(item.iconKey || this.inventorySystem.inferIconKey(item.id));
          slotEl.innerHTML = `
            <div class="ac-pocket-slot-icon">${iconSvg}</div>
            ${item.count > 1 ? `<span class="ac-pocket-slot-badge">x${item.count}</span>` : ''}
          `;
          slotEl.title = `${item.name} (x${item.count})`;

          slotEl.addEventListener('click', () => {
            selectedItem = item;
            renderItemsTab();
            updateItemDetailPanel(item);
          });
        } else {
          slotEl.title = `Bolso Vazio ${slotIndex + 1}`;
          slotEl.addEventListener('click', () => {
            selectedItem = null;
            renderItemsTab();
            updateItemDetailPanel(null);
          });
        }

        slotEl.addEventListener('mouseenter', () => {
          soundFX.playPop(0.95 + (slotIndex % 5) * 0.04);
        });

        itemsGrid.appendChild(slotEl);
      });

      updateWalletBar();
    };

    btnPlaceItem?.addEventListener('click', () => {
      if (!selectedItem) return;
      const dirDeltas = { north: { dx: 0, dy: -1 }, south: { dx: 0, dy: 1 }, west: { dx: -1, dy: 0 }, east: { dx: 1, dy: 0 } };
      const delta = dirDeltas[this.player.direction] || { dx: 0, dy: 1 };
      const pTx = Math.floor((this.player.x + 32) / 64);
      const pTy = Math.floor((this.player.y + 32) / 64);
      const targetX = pTx + delta.dx;
      const targetY = pTy + delta.dy;

      const itemName = selectedItem.name;
      this.inventorySystem.removeItem(selectedItem.id, 1);
      this.tileMap.setTile('solid', targetX, targetY, 'crate');
      this.player.spawnCraftPoof();
      this.triggerAutoSave();
      this.showToast(`${itemName} colocado no chão da ilha!`);
      this.tutorialManager?.onItemPlacedOnGround();

      if (selectedItem.count <= 0) {
        selectedItem = null;
      }
      renderItemsTab();
      updateItemDetailPanel(selectedItem);
    });

    // ==========================================
    // TAB 2: FERRAMENTAS
    // ==========================================
    const toolsGrid = document.getElementById('backpack-tools-grid');
    const toolDetailIcon = document.getElementById('pocket-tools-icon');
    const toolDetailName = document.getElementById('pocket-tools-name');
    const toolDetailDesc = document.getElementById('pocket-tools-desc');
    const toolDetailStats = document.getElementById('pocket-tools-stats');
    const toolDetailActions = document.getElementById('pocket-tools-actions');
    const btnEquipTool = document.getElementById('btn-pocket-equip-tool');
    const btnEquipLabel = document.getElementById('btn-pocket-equip-label');

    const updateToolDetailPanel = (tool) => {
      if (!tool) {
        if (toolDetailName) toolDetailName.innerText = 'Selecione uma ferramenta';
        if (toolDetailDesc) toolDetailDesc.innerText = 'Clique em uma ferramenta para equipar e ver detalhes.';
        if (toolDetailIcon) toolDetailIcon.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
        if (toolDetailStats) toolDetailStats.style.display = 'none';
        if (toolDetailActions) toolDetailActions.style.display = 'none';
        return;
      }

      const equipped = this.inventorySystem.getEquippedTool();
      const isEquipped = equipped?.id === tool.id;
      const iconSvg = this.getItemSvgIcon(tool.iconKey || tool.id);

      if (toolDetailIcon) toolDetailIcon.innerHTML = iconSvg;
      if (toolDetailName) toolDetailName.innerText = `${tool.name} ${isEquipped ? '(Equipado)' : ''}`;
      if (toolDetailDesc) toolDetailDesc.innerText = `${tool.desc} • Poder: ${tool.power}x`;

      if (toolDetailStats) {
        const durability = tool.durability || 100;
        toolDetailStats.style.display = 'block';
        toolDetailStats.innerHTML = `
          <div class="ac-pocket-progress-wrap">
            <div class="ac-pocket-progress-label">
              <span>Durabilidade</span>
              <span>${durability}%</span>
            </div>
            <div class="ac-pocket-progress-bar">
              <div class="ac-pocket-progress-fill" style="width: ${durability}%;"></div>
            </div>
          </div>
        `;
      }

      if (toolDetailActions) {
        toolDetailActions.style.display = 'flex';
        if (btnEquipLabel) btnEquipLabel.innerText = isEquipped ? 'Equipado' : 'Equipar Ferramenta';
        if (btnEquipTool) {
          btnEquipTool.classList.toggle('secondary', isEquipped);
        }
      }
    };

    const renderToolsTab = () => {
      if (!toolsGrid) return;
      toolsGrid.innerHTML = '';

      const tools = this.inventorySystem.getTools();
      const equipped = this.inventorySystem.getEquippedTool();
      const slotsCount = 20;

      for (let i = 0; i < slotsCount; i++) {
        const tool = tools[i] || null;
        const isEquipped = tool && equipped?.id === tool.id;
        const isSelected = selectedTool?.id === tool?.id && tool;

        const slotEl = document.createElement('div');
        slotEl.className = `ac-pocket-slot ${tool ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}`;
        slotEl.dataset.slot = i;

        if (tool) {
          const iconSvg = this.getItemSvgIcon(tool.iconKey || tool.id);
          slotEl.innerHTML = `
            <div class="ac-pocket-slot-icon">${iconSvg}</div>
            ${isEquipped ? `<span class="ac-pocket-slot-badge" style="background: #10b981; border-color: #34d399;">Ativo</span>` : ''}
          `;
          slotEl.title = `${tool.name}${isEquipped ? ' (Equipado)' : ''}`;

          slotEl.addEventListener('click', () => {
            selectedTool = tool;
            renderToolsTab();
            updateToolDetailPanel(tool);
          });
        } else {
          slotEl.title = `Bolso Vazio ${i + 1}`;
          slotEl.addEventListener('click', () => {
            selectedTool = null;
            renderToolsTab();
            updateToolDetailPanel(null);
          });
        }

        slotEl.addEventListener('mouseenter', () => {
          soundFX.playPop(1.0 + (i % 5) * 0.04);
        });

        toolsGrid.appendChild(slotEl);
      }

      updateWalletBar();
    };

    btnEquipTool?.addEventListener('click', () => {
      if (!selectedTool) return;
      this.inventorySystem.equipTool(selectedTool.id);
      this.player.spawnCraftPoof();
      soundFX.playPop(1.3);
      this.showToast(`${selectedTool.name} equipado com sucesso!`);
      renderToolsTab();
      updateToolDetailPanel(selectedTool);
    });

    // ==========================================
    // TAB 3: OVOS
    // ==========================================
    const eggsGrid = document.getElementById('backpack-eggs-grid');
    const eggDetailIcon = document.getElementById('pocket-eggs-icon');
    const eggDetailName = document.getElementById('pocket-eggs-name');
    const eggDetailDesc = document.getElementById('pocket-eggs-desc');
    const eggDetailStats = document.getElementById('pocket-eggs-stats');
    const eggDetailActions = document.getElementById('pocket-eggs-actions');
    const btnWarmEgg = document.getElementById('btn-pocket-warm-egg');
    const btnWarmLabel = document.getElementById('btn-pocket-warm-label');

    const updateEggDetailPanel = (egg) => {
      if (!egg) {
        if (eggDetailName) eggDetailName.innerText = 'Selecione um ovo';
        if (eggDetailDesc) eggDetailDesc.innerText = 'Escolha um ovo de dragão para aquecer no ninho e acelerar a eclosão.';
        if (eggDetailIcon) eggDetailIcon.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="13" rx="7" ry="9"></ellipse></svg>`;
        if (eggDetailStats) eggDetailStats.style.display = 'none';
        if (eggDetailActions) eggDetailActions.style.display = 'none';
        return;
      }

      const pct = Math.min(100, Math.round((egg.warmth / egg.maxWarmth) * 100));
      const iconSvg = this.getItemSvgIcon(egg.iconKey || 'egg_solar');

      if (eggDetailIcon) eggDetailIcon.innerHTML = iconSvg;
      if (eggDetailName) eggDetailName.innerText = egg.name;
      if (eggDetailDesc) eggDetailDesc.innerText = egg.desc;

      if (eggDetailStats) {
        eggDetailStats.style.display = 'block';
        eggDetailStats.innerHTML = `
          <div class="ac-pocket-progress-wrap">
            <div class="ac-pocket-progress-label">
              <span>Calor do Ninho</span>
              <span>${pct}%</span>
            </div>
            <div class="ac-pocket-progress-bar">
              <div class="ac-pocket-progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
            </div>
          </div>
        `;
      }

      if (eggDetailActions) {
        eggDetailActions.style.display = 'flex';
        if (btnWarmLabel) {
          btnWarmLabel.innerText = pct >= 100 ? 'Chocar Dragão!' : 'Aquecer (+25%)';
        }
      }
    };

    const renderEggsTab = () => {
      if (!eggsGrid) return;
      eggsGrid.innerHTML = '';

      const eggs = this.inventorySystem.getEggs();
      const slotsCount = 20;

      for (let i = 0; i < slotsCount; i++) {
        const egg = eggs[i] || null;
        const isSelected = selectedEgg?.id === egg?.id && egg;
        const pct = egg ? Math.min(100, Math.round((egg.warmth / egg.maxWarmth) * 100)) : 0;

        const slotEl = document.createElement('div');
        slotEl.className = `ac-pocket-slot ${egg ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`;
        slotEl.dataset.slot = i;

        if (egg) {
          const iconSvg = this.getItemSvgIcon(egg.iconKey || 'egg_solar');
          slotEl.innerHTML = `
            <div class="ac-pocket-slot-icon" style="color: #f59e0b;">${iconSvg}</div>
            <span class="ac-pocket-slot-badge" style="background: #b45309; border-color: #f59e0b;">${pct}%</span>
          `;
          slotEl.title = `${egg.name} (Calor: ${pct}%)`;

          slotEl.addEventListener('click', () => {
            selectedEgg = egg;
            renderEggsTab();
            updateEggDetailPanel(egg);
          });
        } else {
          slotEl.title = `Bolso Vazio ${i + 1}`;
          slotEl.addEventListener('click', () => {
            selectedEgg = null;
            renderEggsTab();
            updateEggDetailPanel(null);
          });
        }

        slotEl.addEventListener('mouseenter', () => {
          soundFX.playPop(1.05 + (i % 5) * 0.04);
        });

        eggsGrid.appendChild(slotEl);
      }

      updateWalletBar();
    };

    btnWarmEgg?.addEventListener('click', () => {
      if (!selectedEgg) return;
      soundFX.playPop(1.2);
      const res = this.inventorySystem.warmEgg(selectedEgg.id, 25);
      if (res.success) {
        if (res.hatched) {
          soundFX.playSuccess();
          this.dragonManager.adoptHatchedDragon(selectedEgg.speciesId);
          this.inventorySystem.removeEgg(selectedEgg.id);
          this.player.spawnCraftPoof();
          this.showToast(`O ${selectedEgg.name} chocou! Um novo dragão se juntou ao seu grupo!`);
          selectedEgg = null;
          renderEggsTab();
          updateEggDetailPanel(null);
        } else {
          this.player.spawnCraftPoof();
          this.showToast(`Você aqueceu o ${selectedEgg.name}! Calor: ${res.warmth}%`);
          renderEggsTab();
          updateEggDetailPanel(selectedEgg);
        }
      }
    });

    // ==========================================
    // TAB 4: DRAGÕES
    // ==========================================
    const dragonsGrid = document.getElementById('backpack-dragons-grid');
    const dragonDetailIcon = document.getElementById('pocket-dragons-icon');
    const dragonDetailName = document.getElementById('pocket-dragons-name');
    const dragonDetailDesc = document.getElementById('pocket-dragons-desc');
    const dragonDetailStats = document.getElementById('pocket-dragons-stats');
    const dragonDetailActions = document.getElementById('pocket-dragons-actions');
    const btnMountDragon = document.getElementById('btn-pocket-mount-dragon');
    const btnMountLabel = document.getElementById('btn-pocket-mount-label');
    const btnFollowDragon = document.getElementById('btn-pocket-follow-dragon');
    const btnFollowLabel = document.getElementById('btn-pocket-follow-label');

    const updateDragonDetailPanel = (drag) => {
      if (!drag) {
        if (dragonDetailName) dragonDetailName.innerText = 'Selecione um dragão';
        if (dragonDetailDesc) dragonDetailDesc.innerText = 'Escolha um dragão do seu grupo para montar ou acompanhar sua exploração.';
        if (dragonDetailIcon) dragonDetailIcon.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        if (dragonDetailStats) dragonDetailStats.style.display = 'none';
        if (dragonDetailActions) dragonDetailActions.style.display = 'none';
        return;
      }

      const activeDragon = this.dragonManager.getActiveDragon();
      const isMounted = this.dragonManager.isMounted();
      const isActive = activeDragon?.id === drag.id;

      if (dragonDetailIcon) {
        dragonDetailIcon.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }
      if (dragonDetailName) {
        dragonDetailName.innerText = `${drag.name} (Nv. ${drag.level})`;
      }
      if (dragonDetailDesc) {
        dragonDetailDesc.innerText = `Elemento: ${drag.element} • Habilidade: ${drag.fieldMove || 'Voo Rápido'}`;
      }

      if (dragonDetailStats) {
        dragonDetailStats.style.display = 'block';
        dragonDetailStats.innerHTML = `
          <div class="ac-pocket-stat-row">
            <span class="ac-pocket-stat-label">Vida (HP)</span>
            <span class="ac-pocket-stat-val">${drag.hp}/${drag.maxHp}</span>
          </div>
          <div class="ac-pocket-stat-row">
            <span class="ac-pocket-stat-label">Amizade</span>
            <span class="ac-pocket-stat-val">${drag.bond}%</span>
          </div>
        `;
      }

      if (dragonDetailActions) {
        dragonDetailActions.style.display = 'flex';
        if (btnMountLabel) {
          btnMountLabel.innerText = isActive && isMounted ? 'Desmontar' : 'Montar Dragão';
        }
        if (btnMountDragon) {
          btnMountDragon.className = `ac-pocket-action-btn ${isActive && isMounted ? 'danger' : ''}`;
        }
        if (btnFollowLabel) {
          btnFollowLabel.innerText = isActive && !isMounted ? 'Acompanhando' : 'Acompanhar';
        }
      }
    };

    const renderDragonsTab = () => {
      if (!dragonsGrid) return;
      dragonsGrid.innerHTML = '';

      const party = this.dragonManager.getParty();
      const activeDragon = this.dragonManager.getActiveDragon();
      const isMounted = this.dragonManager.isMounted();
      const slotsCount = 20;

      for (let i = 0; i < slotsCount; i++) {
        const drag = party[i] || null;
        const isActive = drag && activeDragon?.id === drag.id;
        const isSelected = selectedDragon?.id === drag?.id && drag;

        const slotEl = document.createElement('div');
        slotEl.className = `ac-pocket-slot ${drag ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''} ${isActive ? 'equipped' : ''}`;
        slotEl.dataset.slot = i;

        if (drag) {
          slotEl.innerHTML = `
            <div class="ac-pocket-slot-icon" style="color: #38bdf8;">
              <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span class="ac-pocket-slot-badge" style="background: #0369a1; border-color: #38bdf8;">Nv.${drag.level}</span>
          `;
          slotEl.title = `${drag.name} (Nv.${drag.level})${isActive ? (isMounted ? ' - Montado' : ' - Acompanhando') : ''}`;

          slotEl.addEventListener('click', () => {
            selectedDragon = drag;
            renderDragonsTab();
            updateDragonDetailPanel(drag);
          });
        } else {
          slotEl.title = `Bolso Vazio ${i + 1}`;
          slotEl.addEventListener('click', () => {
            selectedDragon = null;
            renderDragonsTab();
            updateDragonDetailPanel(null);
          });
        }

        slotEl.addEventListener('mouseenter', () => {
          soundFX.playPop(1.1 + (i % 5) * 0.04);
        });

        dragonsGrid.appendChild(slotEl);
      }

      updateWalletBar();
    };

    btnMountDragon?.addEventListener('click', () => {
      if (!selectedDragon) return;
      const activeDragon = this.dragonManager.getActiveDragon();
      const isMounted = this.dragonManager.isMounted();
      const isActive = activeDragon?.id === selectedDragon.id;

      this.dragonManager.setActiveDragon(selectedDragon.id);
      if (isActive && isMounted) {
        this.dragonManager.setMode('follow');
        this.showToast(`Você desmontou de ${selectedDragon.name}.`);
      } else {
        this.dragonManager.setMode('mounted');
        this.showToast(`Você montou em ${selectedDragon.name}! (+Velocidade)`);
      }
      renderDragonsTab();
      updateDragonDetailPanel(selectedDragon);
    });

    btnFollowDragon?.addEventListener('click', () => {
      if (!selectedDragon) return;
      this.dragonManager.setActiveDragon(selectedDragon.id);
      this.dragonManager.setMode('follow');
      this.showToast(`${selectedDragon.name} agora está te acompanhando!`);
      renderDragonsTab();
      updateDragonDetailPanel(selectedDragon);
    });

    // ==========================================
    // TAB SWITCHER
    // ==========================================
    const switchTab = (tabName) => {
      currentTab = tabName;
      document.querySelectorAll('.backpack-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
      });

      const contents = ['items', 'tools', 'eggs', 'dragons'];
      contents.forEach(name => {
        const el = document.getElementById(`tab-content-${name}`);
        if (el) el.style.display = (name === tabName) ? 'flex' : 'none';
      });

      if (tabName === 'items') {
        renderItemsTab();
        updateItemDetailPanel(selectedItem);
      } else if (tabName === 'tools') {
        renderToolsTab();
        updateToolDetailPanel(selectedTool);
      } else if (tabName === 'eggs') {
        renderEggsTab();
        updateEggDetailPanel(selectedEgg);
      } else if (tabName === 'dragons') {
        renderDragonsTab();
        updateDragonDetailPanel(selectedDragon);
      }
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
      this.tutorialManager?.onBackpackOpened();
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
          this.openBackpackModal('items');
        }
      }
    });
  }

  openCodingChallengeModal(lessonIdOrIndex = null, customOptions = null) {
    const modal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
    if (!modal) return;

    const titleEl = document.getElementById('coding-studio-title');
    const mentorNameEl = document.getElementById('coding-mentor-name');
    const lessonDesc = document.getElementById('lesson-desc');
    const unlockIconEl = document.getElementById('lesson-unlock-icon');
    const unlockNameEl = document.getElementById('lesson-unlock-name');
    const xpTextEl = document.getElementById('lesson-xp-text');
    const goldTextEl = document.getElementById('lesson-gold-text');
    const codeEditor = document.getElementById('lua-code-editor');
    const consoleOut = document.getElementById('lua-console-output');

    if (customOptions) {
      if (titleEl) titleEl.innerText = customOptions.title || 'Estúdio de Códigos';
      if (mentorNameEl) mentorNameEl.innerText = customOptions.mentor || 'Bancada DIY';
      if (lessonDesc) lessonDesc.innerText = customOptions.description || 'Encaixe o bloco no tabuleiro para fabricar o item!';
      if (xpTextEl) xpTextEl.innerText = '+100 XP';
      if (goldTextEl) goldTextEl.innerText = '+50 Moedas';
      if (unlockNameEl) unlockNameEl.innerText = customOptions.unlock || 'Novo Item';
      if (unlockIconEl) {
        const iconKey = customOptions.iconKey || this.inventorySystem.inferIconKey(customOptions.unlockId || 'crate');
        unlockIconEl.innerHTML = this.getItemSvgIcon(iconKey);
      }
      if (codeEditor) codeEditor.value = customOptions.starterLua || '';
      if (this.scratchEngine) {
        this.scratchEngine.loadLessonBlocks(customOptions.blocks || null, customOptions.starterLua || '', null);
      }
      if (consoleOut) {
        consoleOut.innerText = `> Estúdio de Códigos pronto!\n> Arraste a peça para a área de montagem e clique em 'Montar & Fabricar'.`;
      }
    } else {
      let lesson = null;
      if (lessonIdOrIndex !== null && lessonIdOrIndex !== undefined) {
        lesson = this.blocklySystem.setLesson(lessonIdOrIndex);
      } else {
        lesson = this.blocklySystem.getCurrentLesson();
      }

      if (!lesson) {
        lesson = this.blocklySystem.setLesson(0);
      }

      if (lesson) {
        if (titleEl) titleEl.innerText = 'Estúdio de Códigos';
        if (mentorNameEl) mentorNameEl.innerText = lesson.mentor || 'Mestre da Ilha';
        if (lessonDesc) lessonDesc.innerText = lesson.description;
        if (xpTextEl) xpTextEl.innerText = `+${lesson.rewardXP} XP`;
        if (goldTextEl) goldTextEl.innerText = `+${lesson.rewardGold} Moedas`;
        if (unlockNameEl) unlockNameEl.innerText = lesson.unlockedAssetName || 'Item Especial';
        if (unlockIconEl) {
          const iconKey = lesson.unlockedAssetId || this.inventorySystem.inferIconKey(lesson.unlockedAssetId);
          unlockIconEl.innerHTML = this.getItemSvgIcon(iconKey);
        }

        const mentorAvatarEl = document.getElementById('lesson-mentor-avatar');
        if (mentorAvatarEl) {
          const npcId = lesson.npcId || 'npc_monkey_builder';
          const npcPortrait = CharacterRegistry.VILLAGE_NPCS.find(n => n.id === npcId)?.portrait || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
          mentorAvatarEl.innerHTML = `<img src="${npcPortrait}" alt="Mentor" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }

        const tutAvatarEl = document.getElementById('coding-tutorial-img');
        if (tutAvatarEl) {
          const npcId = lesson.npcId || 'npc_monkey_builder';
          const npcPortrait = CharacterRegistry.VILLAGE_NPCS.find(n => n.id === npcId)?.portrait || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
          tutAvatarEl.src = npcPortrait;
        }

        if (codeEditor) codeEditor.value = lesson.starterLua;
        if (this.scratchEngine) {
          this.scratchEngine.loadLessonBlocks(lesson.blocks, lesson.starterLua, lesson);
        }
        if (consoleOut) {
          consoleOut.innerHTML = `> Desafio carregado: <strong>${lesson.title}</strong>\n> Objetivo: <strong>${lesson.unlockedAssetName}</strong>\n> Arraste o bloco de encaixe para a direita e clique em 'Montar & Fabricar'!`;
        }
      }
    }

    modal.style.display = 'flex';
    this.tutorialManager?.onCodingModalOpened();
  }

  setupCodingStudioUI() {
    const modal = document.getElementById('coding-modal') || document.getElementById('coding-studio-modal');
    const closeBtn = document.getElementById('btn-close-coding');
    const codeEditor = document.getElementById('lua-code-editor');
    const consoleOut = document.getElementById('lua-console-output');
    const btnRun = document.getElementById('btn-run-lua');
    const btnReset = document.getElementById('btn-reset-lua');
    const btnClearWorkspace = document.getElementById('btn-clear-workspace');
    const paletteEl = document.getElementById('scratch-palette');
    const workspaceEl = document.getElementById('scratch-workspace');

    const syntaxDisplayEl = document.getElementById('codekit-syntax-display');

    if (!modal || !codeEditor) return;

    if (this.scratchEngine) {
      if (paletteEl) this.scratchEngine.setPaletteContainer(paletteEl);
      if (workspaceEl) this.scratchEngine.setWorkspaceContainer(workspaceEl);
      if (codeEditor) this.scratchEngine.setCodeOutputContainer(codeEditor, syntaxDisplayEl);
    }

    // Clear Workspace Button
    btnClearWorkspace?.addEventListener('click', () => {
      if (this.scratchEngine) {
        this.scratchEngine.clearWorkspace();
      }
    });

    // Ask Help (Dica do Mentor)
    const btnAskHelp = document.getElementById('btn-ask-help');
    const helpModal = document.getElementById('coding-help-modal');
    const btnCloseHelp = document.getElementById('btn-close-help');
    const btnUnderstoodHelp = document.getElementById('btn-understood-help');
    const helpMentorName = document.getElementById('coding-help-mentor-name');
    const helpText = document.getElementById('coding-help-text');
    const helpStepBox = document.getElementById('coding-help-step-box');
    const helpAvatar = document.getElementById('coding-help-avatar');

    const openHelpModal = () => {
      soundFX.playPop(1.1);
      const lesson = this.blocklySystem.getCurrentLesson();
      if (!lesson) return;

      if (helpMentorName) helpMentorName.innerText = lesson.mentor || 'Mestre da Ilha';
      if (helpText) helpText.innerText = `Como resolver: "${lesson.title}"`;

      if (helpAvatar) {
        const npcId = lesson.npcId || 'npc_monkey_builder';
        const npcPortrait = CharacterRegistry.VILLAGE_NPCS.find(n => n.id === npcId)?.portrait || 'assets/characters/char_wolf_hunter_m/portrait.jpg';
        helpAvatar.innerHTML = `<img src="${npcPortrait}" onerror="this.src='assets/characters/char_wolf_hunter_m/portrait.jpg'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Mentor">`;
      }

      if (helpStepBox) {
        helpStepBox.innerHTML = `
          <div class="coding-help-step-item">
            <div class="coding-help-step-num">1</div>
            <div>${lesson.description || 'Observe os blocos da missão na Paleta de Peças à esquerda.'}</div>
          </div>
          <div class="coding-help-step-item">
            <div class="coding-help-step-num">2</div>
            <div>Arraste ou clique nas peças para conectá-las na Mesa de Montagem.</div>
          </div>
          <div class="coding-help-step-item">
            <div class="coding-help-step-num">3</div>
            <div>Confira o código gerado à direita e clique no botão <strong>Montar & Fabricar Item</strong>!</div>
          </div>
        `;
      }

      if (helpModal) helpModal.style.display = 'flex';
    };

    btnAskHelp?.addEventListener('click', openHelpModal);
    btnCloseHelp?.addEventListener('click', () => {
      soundFX.playPop(0.9);
      if (helpModal) helpModal.style.display = 'none';
    });
    btnUnderstoodHelp?.addEventListener('click', () => {
      soundFX.playPop(1.2);
      if (helpModal) helpModal.style.display = 'none';
    });

    const btnDemonstrateHelp = document.getElementById('btn-demonstrate-help');
    btnDemonstrateHelp?.addEventListener('click', () => {
      soundFX.playPop(1.1);
      if (helpModal) helpModal.style.display = 'none';
      if (this.scratchEngine) {
        this.scratchEngine.snapNextBlockWithAnimation(() => {
          this.showToast('Dica do Mentor: Peça encaixada na mesa de montagem!', 3000);
        });
      }
    });

    closeBtn?.addEventListener('click', () => {
      soundFX.playPop(0.85);
      modal.style.display = 'none';
    });

    // Run code & execute physical item crafting / inventory deposit
    btnRun?.addEventListener('click', () => {
      const code = codeEditor.value;
      const res = this.blocklySystem.runScript(code);

      if (consoleOut) {
        let outHtml = `> Montagem validada com sucesso!\n`;
        if (res.logs && res.logs.length > 0) {
          outHtml += res.logs.map(l => `> [OK] ${l}`).join('\n') + '\n';
        }
        outHtml += `> ${res.message}\n`;
        consoleOut.innerText = outHtml;
        consoleOut.scrollTop = consoleOut.scrollHeight;
      }

      if (res.success) {
        soundFX.playSuccess();
        this.showToast(res.message, 4500);
        this.tutorialManager?.onCodingChallengeCompleted();

        // Trigger celebratory confetti and floating reward badges
        this.triggerCelebrationConfetti();
        const currentLesson = this.blocklySystem.getCurrentLesson();
        const xpAmount = currentLesson?.rewardXp || 100;
        const goldAmount = currentLesson?.rewardGold || 50;
        this.triggerRewardFlight(xpAmount, goldAmount);

        if (res.unlockedAssetId && this.craftingSystem) {
          this.craftingSystem.unlockRecipe(res.unlockedAssetId);
          // Auto add 1 item to inventory so player can immediately test/decorate
          this.inventorySystem.addItem(res.unlockedAssetId, 1, { name: res.unlockedAssetName || res.unlockedAssetId });
        }

        // Spawn visual craft poof on player
        this.player.spawnCraftPoof();
        this.triggerAutoSave();

        // Auto close after 1.8 seconds of visual celebration
        setTimeout(() => {
          if (modal.style.display !== 'none') {
            modal.style.display = 'none';
          }
        }, 1800);
      } else {
        soundFX.playPop(0.7);
        this.showToast(res.message, 4000);
      }
    });

    // Reset code & blocks
    btnReset?.addEventListener('click', () => {
      const lesson = this.blocklySystem.getCurrentLesson();
      if (lesson) {
        if (codeEditor) codeEditor.value = lesson.starterLua;
        if (this.scratchEngine) {
          this.scratchEngine.loadLessonBlocks(lesson.blocks, lesson.starterLua, lesson);
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
          this.openCodingChallengeModal();
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
        this.showToast('Conexão restaurada com sucesso! Bem-vindo de volta!');
      } else {
        showDisconnection('Ainda offline. Verifique seu Wi-Fi/rede local.');
        this.showToast('Sem conexão com a internet. Verifique sua rede e tente novamente.', 3500);
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

// Resilient Bootstrap Application on page load
function bootstrapApp() {
  try {
    const app = new RPGApplication();
    window.app = app;
    app.init().catch(err => {
      console.error('[RPGApplication] Erro durante inicialização:', err);
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) loadingScreen.style.display = 'none';
    });
  } catch (err) {
    console.error('[RPGApplication] Erro fatal ao instanciar aplicação:', err);
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
  } else {
    bootstrapApp();
  }
}
