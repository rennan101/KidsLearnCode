// High-fantasy RPG Circular & Expanded Minimap Engine (Real Asset Colors & Clean Animal Island UI)

export class Minimap {
  constructor(tileMap, assetLoader, player, camera) {
    this.tileMap = tileMap;
    this.assetLoader = assetLoader;
    this.player = player;
    this.camera = camera;

    // DOM Elements
    this.container = document.getElementById('minimap-hud');
    this.canvas = document.getElementById('minimap-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.expandedModal = document.getElementById('expanded-map-modal');
    this.expandedCanvas = document.getElementById('expanded-map-canvas');
    this.expandedCtx = this.expandedCanvas ? this.expandedCanvas.getContext('2d') : null;

    // State
    this.isExpanded = false;
    this.expandedZoom = 1.0;
    this.expandedPan = { x: 0, y: 0 };
    this.isPanningExpanded = false;
    this.panStart = { x: 0, y: 0 };

    // Dynamic tile color cache for real sampled colors
    this.tileColorCache = new Map();

    // Default base fallback palette
    this.tileColorMap = {
      'magma-animated': '#ea580c',
      'magma-stylized': '#ea580c',
      'water-wind-waker': '#0284c7',
      'water-animated': '#2563eb',
      'grass': '#5d9948',
      'grass-detail-1': '#68ab52',
      'grass-detail-2': '#4e853c',
      'stump': '#78350f',
      'bush-green': '#2d6a4f',
      'bush-red': '#991b1b',
      'bush-blue': '#1e40af',
      'bush-white': '#e2e8f0',
      'rock-1': '#64748b',
      'rock-2': '#94a3b8',
      'mushroom-1': '#dc2626',
      'mushroom-2': '#854d0e',
      'mushroom-3': '#b45309',
      'flower-blue': '#38bdf8',
      'flower-red': '#f43f5e',
      'flower-white': '#f8fafc',
      'flower-small-1': '#60a5fa',
      'flower-small-2': '#facc15',
      'house-1': '#b91c1c',
      'house-2': '#9a3412',
      'crate': '#92400e',
      'sign': '#a16207',
      'haybale': '#eab308',
      'tree-1': '#1b4332',
      'tree-2': '#2d6a4f',
      'cabbage': '#4ade80',
      'corn': '#fde047',
      'pumpkin': '#f97316',
      'tomato': '#ef4444',
      'turnip': '#c084fc',
      'wheat': '#facc15',
      'invisible-collider': 'rgba(239, 68, 68, 0.4)',
      'invisible-collider-2x2': 'rgba(239, 68, 68, 0.4)',
      'character-geralt': '#f59e0b',
      'character-npc-villager': '#10b981',
      'character-enemy-guard': '#dc2626'
    };

    this.initDOM();
  }

  initDOM() {
    // Setup Canvas Sizes
    if (this.canvas) {
      this.canvas.width = 180;
      this.canvas.height = 180;
    }
    if (this.expandedCanvas) {
      this.expandedCanvas.width = 640;
      this.expandedCanvas.height = 640;
    }

    // Toggle Expand Buttons
    const btnExpand = document.getElementById('btn-minimap-expand');
    const btnCloseExpanded = document.getElementById('btn-close-expanded-map');
    const btnZoomIn = document.getElementById('btn-map-zoom-in');
    const btnZoomOut = document.getElementById('btn-map-zoom-out');
    const btnZoomReset = document.getElementById('btn-map-zoom-reset');

    btnExpand?.addEventListener('click', () => this.toggleExpand());
    btnCloseExpanded?.addEventListener('click', () => this.setExpanded(false));

    btnZoomIn?.addEventListener('click', () => {
      this.expandedZoom = Math.min(3.0, this.expandedZoom + 0.25);
    });
    btnZoomOut?.addEventListener('click', () => {
      this.expandedZoom = Math.max(0.5, this.expandedZoom - 0.25);
    });
    btnZoomReset?.addEventListener('click', () => {
      this.expandedZoom = 1.0;
      this.expandedPan = { x: 0, y: 0 };
    });

    // Panning & Clicking in Expanded Map
    if (this.expandedCanvas) {
      this.expandedCanvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          this.isPanningExpanded = true;
          this.panStart = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isPanningExpanded) return;
        const dx = e.clientX - this.panStart.x;
        const dy = e.clientY - this.panStart.y;
        this.expandedPan.x += dx;
        this.expandedPan.y += dy;
        this.panStart = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => {
        this.isPanningExpanded = false;
      });

      // Double-click to fast-travel / pan
      this.expandedCanvas.addEventListener('dblclick', (e) => {
        const rect = this.expandedCanvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left - this.expandedCanvas.width / 2 - this.expandedPan.x;
        const clickY = e.clientY - rect.top - this.expandedCanvas.height / 2 - this.expandedPan.y;

        const targetWorldX = (clickX / (this.expandedZoom * 0.2)) + (this.player ? this.player.x : 0);
        const targetWorldY = (clickY / (this.expandedZoom * 0.2)) + (this.player ? this.player.y : 0);

        if (this.player) {
          this.player.x = Math.round(targetWorldX);
          this.player.y = Math.round(targetWorldY);
        }
        if (this.camera) {
          this.camera.x = targetWorldX - this.camera.viewportWidth / 2;
          this.camera.y = targetWorldY - this.camera.viewportHeight / 2;
        }
      });

      // Wheel to zoom expanded map (only when modal is active/open)
      this.expandedCanvas.addEventListener('wheel', (e) => {
        if (!this.isExpanded) return;
        e.preventDefault();
        e.stopPropagation();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        this.expandedZoom = Math.max(0.4, Math.min(3.5, this.expandedZoom * factor));
      }, { passive: false });
    }

    // Keyboard shortcut 'M'
    window.addEventListener('keydown', (e) => {
      if (!e) return;
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.key === 'm' || e.key === 'M') {
        this.toggleExpand();
      } else if (e.key === 'Escape' && this.isExpanded) {
        this.setExpanded(false);
      }
    });
  }

  toggleExpand() {
    this.setExpanded(!this.isExpanded);
  }

  setExpanded(expanded) {
    this.isExpanded = expanded;
    const skillBar = document.getElementById('dragon-skill-bar');
    const quickHud = document.getElementById('quick-actions-hud');
    const dragonQuickHud = document.getElementById('dragon-quick-hud');

    if (this.expandedModal) {
      if (this.isExpanded) {
        this.expandedModal.classList.add('active');
        this.expandedPan = { x: 0, y: 0 };
        if (skillBar) skillBar.style.display = 'none';
        if (quickHud) quickHud.style.display = 'none';
        if (dragonQuickHud) dragonQuickHud.style.display = 'none';
      } else {
        this.expandedModal.classList.remove('active');
        if (skillBar) skillBar.style.display = 'flex';
        if (quickHud) quickHud.style.display = 'flex';
        if (dragonQuickHud) dragonQuickHud.style.display = 'flex';
      }
    }
  }

  /**
   * Extrai ou calcula a cor real e autêntica de cada asset para renderizar no mapa
   * @param {string} tileId 
   * @param {object} meta 
   * @returns {string} Cor CSS
   */
  getTileColor(tileId, meta = null) {
    if (this.tileColorCache.has(tileId)) {
      return this.tileColorCache.get(tileId);
    }

    // Cores específicas por ID ou Categoria
    if (this.tileColorMap[tileId]) {
      this.tileColorCache.set(tileId, this.tileColorMap[tileId]);
      return this.tileColorMap[tileId];
    }

    if (!meta && this.assetLoader) {
      meta = this.assetLoader.getTileMetadata(tileId);
    }

    let color = '#475569';

    if (tileId.includes('water') || tileId.includes('ocean') || tileId.includes('sea') || meta?.category === 'Water') {
      color = '#0284c7'; // Azul vibrante da água
    } else if (tileId.startsWith('dirt-') || tileId.startsWith('sprite_001-') || tileId.startsWith('dirt-edge-') || tileId.includes('sand') || tileId.includes('path') || tileId.includes('soil')) {
      color = '#c68a4c'; // Areia e caminho de terra real
    } else if (tileId.startsWith('flower-') || tileId.includes('rose') || tileId.includes('tulip')) {
      color = '#f43f5e'; // Flor vibrante
    } else if (tileId.startsWith('seedbag-')) {
      color = '#d97706';
    } else if (tileId.startsWith('tree-') || tileId.includes('pine') || tileId.includes('oak')) {
      color = '#1b4332'; // Copa da árvore verde musgo profundo
    } else if (tileId.startsWith('bush-') || tileId.includes('foliage')) {
      color = '#2d6a4f'; // Arbustos vivos
    } else if (tileId.startsWith('house-') || tileId.includes('roof') || tileId.includes('building')) {
      color = '#b91c1c'; // Telhados
    } else if (tileId.startsWith('rock-') || tileId.includes('stone') || tileId.includes('cliff')) {
      color = '#64748b'; // Rochas e pedras
    } else if (tileId.startsWith('fence') || tileId.startsWith('stump') || tileId.startsWith('wood')) {
      color = '#78350f'; // Madeira
    } else if (tileId.includes('grass')) {
      color = '#5d9948'; // Grama viva
    }

    // Se temos imagem carregada, tentamos amostrar a cor média real
    if (meta && meta.src && this.assetLoader) {
      const img = this.assetLoader.getImage(meta.src);
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          const sampleCanvas = document.createElement('canvas');
          sampleCanvas.width = 1;
          sampleCanvas.height = 1;
          const sctx = sampleCanvas.getContext('2d');
          sctx.drawImage(img, 0, 0, 1, 1);
          const p = sctx.getImageData(0, 0, 1, 1).data;
          if (p[3] > 60) {
            color = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
          }
        } catch {
          // Fallback para mapeamento heurístico se houver restrição de segurança
        }
      }
    }

    this.tileColorCache.set(tileId, color);
    return color;
  }

  render(isEditor = false) {
    if (this.container) {
      this.container.style.display = isEditor ? 'none' : 'block';
    }

    if (isEditor) {
      // In Editor Mode, compact minimap is hidden to not obstruct toolbars
      if (this.isExpanded && this.expandedCtx && this.expandedCanvas) {
        this.renderMinimapView(
          this.expandedCtx,
          this.expandedCanvas.width,
          this.expandedCanvas.height,
          0.2 * this.expandedZoom,
          isEditor,
          true
        );
      }
      return;
    }

    // 1. Render Compact Circular Minimap
    if (this.ctx && this.canvas) {
      this.renderMinimapView(this.ctx, this.canvas.width, this.canvas.height, 0.12, isEditor, false);
    }

    // 2. Render Expanded Tactical Map if Open
    if (this.isExpanded && this.expandedCtx && this.expandedCanvas) {
      this.renderMinimapView(
        this.expandedCtx,
        this.expandedCanvas.width,
        this.expandedCanvas.height,
        0.2 * this.expandedZoom,
        isEditor,
        true
      );
    }
  }

  renderMinimapView(ctx, width, height, scale, isEditor, isExpandedMode) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // In expanded mode apply user pan offset
    const panOffsetX = isExpandedMode ? this.expandedPan.x : 0;
    const panOffsetY = isExpandedMode ? this.expandedPan.y : 0;

    // Determine focus center point (Player in Play mode, Camera or Player in Edit mode)
    let focusX = this.player ? this.player.x + 32 : 0;
    let focusY = this.player ? this.player.y + 32 : 0;

    if (isEditor && this.camera && !isExpandedMode) {
      focusX = this.camera.x + (this.camera.viewportWidth / this.camera.zoom) / 2;
      focusY = this.camera.y + (this.camera.viewportHeight / this.camera.zoom) / 2;
    }

    // Fundo aconchegante pergaminho/oceano profundo
    ctx.fillStyle = isExpandedMode ? '#0c1017' : 'rgba(12, 16, 23, 0.85)';
    ctx.fillRect(0, 0, width, height);

    // World to minimap screen transform
    ctx.translate(centerX + panOffsetX, centerY + panOffsetY);

    const tileSize = this.tileMap.tileSize;
    const scaledTileSize = Math.max(1, tileSize * scale);

    // Calculate visible tile range
    const maxRadiusWorld = (Math.max(width, height) / 2) / scale + tileSize * 4;
    const minTileX = Math.floor((focusX - maxRadiusWorld) / tileSize);
    const maxTileX = Math.ceil((focusX + maxRadiusWorld) / tileSize);
    const minTileY = Math.floor((focusY - maxRadiusWorld) / tileSize);
    const maxTileY = Math.ceil((focusY + maxRadiusWorld) / tileSize);

    // Render Layers from bottom to top according to layerOrder
    const order = this.tileMap.layerOrder || ['ground', 'decor', 'solid', 'characters'];
    for (const layerName of order) {
      this.renderTileLayer(ctx, layerName, focusX, focusY, scale, minTileX, maxTileX, minTileY, maxTileY, isEditor);
    }

    // Render Spawn Point Marker
    if (this.tileMap.spawnPoint) {
      const sp = this.tileMap.spawnPoint;
      const sx = (sp.x - focusX) * scale;
      const sy = (sp.y - focusY) * scale;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sx + scaledTileSize / 2, sy + scaledTileSize / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Camera Viewport Rectangle in Editor mode or Expanded View
    if (this.camera && (isEditor || isExpandedMode)) {
      const camWorldX = this.camera.x;
      const camWorldY = this.camera.y;
      const camWorldW = this.camera.viewportWidth / this.camera.zoom;
      const camWorldH = this.camera.viewportHeight / this.camera.zoom;

      const camMinimapX = (camWorldX - focusX) * scale;
      const camMinimapY = (camWorldY - focusY) * scale;
      const camMinimapW = camWorldW * scale;
      const camMinimapH = camWorldH * scale;

      ctx.strokeStyle = isEditor ? 'rgba(59, 130, 246, 0.85)' : 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(camMinimapX, camMinimapY, camMinimapW, camMinimapH);
      ctx.fillStyle = isEditor ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.04)';
      ctx.fillRect(camMinimapX, camMinimapY, camMinimapW, camMinimapH);
    }

    // Render Player Compass / Position Indicator
    if (this.player) {
      const px = (this.player.x + 32 - focusX) * scale;
      const py = (this.player.y + 32 - focusY) * scale;

      ctx.save();
      ctx.translate(px, py);

      // Player glowing pulse circle
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      // Rotate arrow towards player direction
      const angle = this.getDirectionAngle(this.player.direction);
      ctx.rotate(angle);

      // Directional Arrow Chevron
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();

    // Feathered circular mask on compact minimap
    if (!isExpandedMode) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      const maskGrad = ctx.createRadialGradient(centerX, centerY, width * 0.36, centerX, centerY, width * 0.5);
      maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      maskGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.95)');
      maskGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.45)');
      maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = maskGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Delicate warm gold/cream inner border ring
      ctx.save();
      ctx.strokeStyle = 'rgba(253, 251, 247, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, width * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  renderTileLayer(ctx, layerName, focusX, focusY, scale, minTileX, maxTileX, minTileY, maxTileY, isEditor) {
    const layer = this.tileMap.layers[layerName];
    if (!layer || layer.size === 0) return;

    const tileSize = this.tileMap.tileSize;

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const cell = layer.get(this.tileMap.getKey(tx, ty));
        if (!cell || cell.isRoot === false) continue;

        const meta = this.assetLoader.getTileMetadata(cell.tileId);
        if (!meta) continue;

        // Skip invisible colliders in non-editor mode
        if (meta.isInvisibleAsset && !isEditor) continue;

        const gw = meta.gridW || 1;
        const gh = meta.gridH || 1;

        const worldX = tx * tileSize;
        const worldY = ty * tileSize;
        const widthPx = gw * tileSize;
        const heightPx = gh * tileSize;

        const mapX = (worldX - focusX) * scale;
        const mapY = (worldY - focusY) * scale;
        const mapW = widthPx * scale;
        const mapH = heightPx * scale;

        if (cell.tileId && (cell.tileId.startsWith('npc_') || cell.tileId.startsWith('char_') || meta.isNPC)) {
          // NPC indicator dot
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(mapX + mapW / 2, mapY + mapH / 2, Math.max(3.5, mapW * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        const color = this.getTileColor(cell.tileId, meta);
        ctx.fillStyle = color;

        if (layerName === 'solid' && (cell.tileId.startsWith('tree-') || cell.tileId.startsWith('bush-'))) {
          // Foliage circular crowns
          ctx.beginPath();
          ctx.arc(mapX + mapW / 2, mapY + mapH / 2, Math.max(2, mapW / 2), 0, Math.PI * 2);
          ctx.fill();
        } else if (cell.tileId.startsWith('house-')) {
          // Clean solid roof structure block without grid lines
          ctx.fillRect(mapX - 0.25, mapY - 0.25, mapW + 0.5, mapH + 0.5);
        } else {
          ctx.fillRect(mapX - 0.25, mapY - 0.25, Math.max(1, mapW + 0.5), Math.max(1, mapH + 0.5));
        }
      }
    }
  }

  getDirectionAngle(direction) {
    switch (direction) {
      case 'north': return 0;
      case 'north-east': return Math.PI * 0.25;
      case 'east': return Math.PI * 0.5;
      case 'south-east': return Math.PI * 0.75;
      case 'south': return Math.PI;
      case 'south-west': return Math.PI * 1.25;
      case 'west': return Math.PI * 1.5;
      case 'north-west': return Math.PI * 1.75;
      default: return Math.PI;
    }
  }
}
