// Shoreline Wave Lap & Coastal Foam System (Wind Waker & Animal Crossing style)
// Detects shore boundaries where water meets land/sand and renders rhythmic lapping wave crests with foam dissipation.

export class ShorelineFoamRenderer {
  constructor() {
    this.foamColor = 'rgba(255, 255, 255, 0.88)';
    this.foamShadowColor = 'rgba(14, 116, 144, 0.45)';
    this.shallowTint = 'rgba(45, 212, 191, 0.25)';
  }

  /**
   * Check if a neighbor tile is land (ground tile that is not water, or decor/solid present)
   */
  isLandTile(tileMap, tx, ty) {
    const key = tileMap.getKey(tx, ty);
    const groundCell = tileMap.layers.ground?.get(key);
    if (!groundCell || !groundCell.tileId) return false;

    const gid = groundCell.tileId.toLowerCase();
    const isWater = gid === 'water-animated' || gid === 'water-wind-waker' || gid.includes('water') || gid.includes('ocean');

    // If ground is not water (e.g. sand, soil, grass, stone), it is land
    if (!isWater) return true;

    return false;
  }

  /**
   * Render dynamic lapping waves and foam contours along all visible water/magma-land boundaries
   */
  renderShorelines(ctx, tileMap, visibleCells, timeMs = 0, config = {}) {
    if (!visibleCells || visibleCells.length === 0) return;

    const isMagma = !!config.isMagma;
    const edges = tileMap.getShorelineEdges ? tileMap.getShorelineEdges(isMagma) : null;
    if (!edges || edges.length === 0) return;

    const reach = config.shoreLapReach !== undefined ? config.shoreLapReach : (isMagma ? 10 : 12);
    const speed = config.shoreLapSpeed !== undefined ? config.shoreLapSpeed : (isMagma ? 1.4 : 1.8);
    const t = (timeMs / 1000) * speed;
    const tileSize = tileMap.tileSize || 64;

    // Viewport bounds from visible liquid cells
    let minTx = Infinity, maxTx = -Infinity, minTy = Infinity, maxTy = -Infinity;
    for (let i = 0; i < visibleCells.length; i++) {
      const c = visibleCells[i];
      if (c.tx < minTx) minTx = c.tx;
      if (c.tx > maxTx) maxTx = c.tx;
      if (c.ty < minTy) minTy = c.ty;
      if (c.ty > maxTy) maxTy = c.ty;
    }

    ctx.save();

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.tx < minTx - 1 || e.tx > maxTx + 1 || e.ty < minTy - 1 || e.ty > maxTy + 1) {
        continue;
      }

      const cx = e.x;
      const cy = e.y;
      const tilePhase = (e.tx * 3 + e.ty * 7) * 0.45;
      const waveCycle = (Math.sin(t + tilePhase) + 1.0) * 0.5; // 0.0 to 1.0
      const lapOffset = waveCycle * reach;
      const foamAlpha = 0.35 + waveCycle * 0.55;

      // 1. North Shoreline Lap
      if (e.north) {
        const edgeY = cy - lapOffset;
        this.drawWaveLapBand(ctx, cx, edgeY, cx + tileSize, edgeY, 0, -1, waveCycle, foamAlpha, isMagma);
      }

      // 2. South Shoreline Lap
      if (e.south) {
        const edgeY = cy + tileSize + lapOffset;
        this.drawWaveLapBand(ctx, cx, edgeY, cx + tileSize, edgeY, 0, 1, waveCycle, foamAlpha, isMagma);
      }

      // 3. West Shoreline Lap
      if (e.west) {
        const edgeX = cx - lapOffset;
        this.drawWaveLapBand(ctx, edgeX, cy, edgeX, cy + tileSize, -1, 0, waveCycle, foamAlpha, isMagma);
      }

      // 4. East Shoreline Lap
      if (e.east) {
        const edgeX = cx + tileSize + lapOffset;
        this.drawWaveLapBand(ctx, edgeX, cy, edgeX, cy + tileSize, 1, 0, waveCycle, foamAlpha, isMagma);
      }
    }

    ctx.restore();
  }

  /**
   * Draw a stylized cel-shaded foam band that advances and undulates
   */
  drawWaveLapBand(ctx, x1, y1, x2, y2, normalX, normalY, cycle, alpha, isMagma = false) {
    const isHorizontal = normalY !== 0;
    const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
    const startPos = isHorizontal ? Math.min(x1, x2) : Math.min(y1, y2);
    const perpBase = isHorizontal ? y1 : x1;

    // 1. Shallow Submersion tint under the lapping wave
    if (isMagma) {
      ctx.fillStyle = `rgba(255, 90, 0, ${0.18 + cycle * 0.22})`;
    } else {
      ctx.fillStyle = `rgba(204, 251, 241, ${0.15 + cycle * 0.2})`;
    }
    if (isHorizontal) {
      const topY = normalY > 0 ? perpBase - 14 : perpBase;
      ctx.fillRect(startPos, topY, length, 14);
    } else {
      const leftX = normalX > 0 ? perpBase - 14 : perpBase;
      ctx.fillRect(leftX, startPos, 14, length);
    }

    // 2. Undulating Cel-Shaded Foam Contour
    ctx.beginPath();
    const step = 4;
    let first = true;

    for (let p = 0; p <= length; p += step) {
      const worldP = startPos + p;
      // Multi-sine wave undulation on the foam crest
      const undulation = Math.sin(worldP * 0.18 + cycle * 4.0) * 2.5 + Math.cos(worldP * 0.09) * 1.5;

      const px = isHorizontal ? worldP : perpBase + undulation * normalX;
      const py = isHorizontal ? perpBase + undulation * normalY : worldP;

      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }

    // Primary Foam Outline
    if (isMagma) {
      ctx.strokeStyle = `rgba(255, 110, 0, ${alpha})`;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 6;
    } else {
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 0;
    }
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner Secondary Foam Bubbles / Highlight
    if (isMagma) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.9})`;
    } else {
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.75})`;
    }
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Tiny Dissipating Foam Bubbles (Cel-Shaded Dots)
    if (cycle > 0.4) {
      ctx.fillStyle = isMagma ? `rgba(255, 140, 0, ${alpha * 0.9})` : `rgba(255, 255, 255, ${alpha * 0.85})`;
      for (let p = 6; p < length; p += 14) {
        const worldP = startPos + p;
        const bOffset = (normalY !== 0) ? (normalY * (cycle * 4)) : (normalX * (cycle * 4));
        const bx = isHorizontal ? worldP : perpBase - bOffset;
        const by = isHorizontal ? perpBase - bOffset : worldP;
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
