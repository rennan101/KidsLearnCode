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
    const isWater = gid === 'water-animated' || gid === 'water-waves-procedural' || gid === 'water-wind-waker' || gid.includes('water') || gid.includes('ocean');

    // If ground is not water (e.g. sand, soil, grass, stone), it is land
    if (!isWater) return true;

    return false;
  }

  /**
   * Render dynamic lapping waves and foam contours along all visible water-land boundaries
   */
  renderShorelines(ctx, tileMap, visibleWaterCells, timeMs = 0, config = {}) {
    if (!visibleWaterCells || visibleWaterCells.length === 0) return;

    const reach = config.shoreLapReach !== undefined ? config.shoreLapReach : 12; // Max pixel reach onto land
    const speed = config.shoreLapSpeed !== undefined ? config.shoreLapSpeed : 1.8;
    const t = (timeMs / 1000) * speed;
    const tileSize = tileMap.tileSize || 64;

    ctx.save();

    for (let i = 0; i < visibleWaterCells.length; i++) {
      const w = visibleWaterCells[i];
      const tx = w.tx;
      const ty = w.ty;
      const cx = w.x;
      const cy = w.y;

      // Phase offset per tile coordinate for organic varying waves
      const tilePhase = (tx * 3 + ty * 7) * 0.45;
      const waveCycle = (Math.sin(t + tilePhase) + 1.0) * 0.5; // 0.0 (fully receded) to 1.0 (fully advanced)
      const lapOffset = waveCycle * reach;
      const foamAlpha = 0.35 + waveCycle * 0.55;

      // Check 4 cardinal neighbors
      const northLand = this.isLandTile(tileMap, tx, ty - 1);
      const southLand = this.isLandTile(tileMap, tx, ty + 1);
      const westLand = this.isLandTile(tileMap, tx - 1, ty);
      const eastLand = this.isLandTile(tileMap, tx + 1, ty);

      // 1. North Shoreline Lap (Water below, Land above)
      if (northLand) {
        const edgeY = cy - lapOffset;
        this.drawWaveLapBand(ctx, cx, edgeY, cx + tileSize, edgeY, 0, -1, waveCycle, foamAlpha);
      }

      // 2. South Shoreline Lap (Water above, Land below)
      if (southLand) {
        const edgeY = cy + tileSize + lapOffset;
        this.drawWaveLapBand(ctx, cx, edgeY, cx + tileSize, edgeY, 0, 1, waveCycle, foamAlpha);
      }

      // 3. West Shoreline Lap (Water right, Land left)
      if (westLand) {
        const edgeX = cx - lapOffset;
        this.drawWaveLapBand(ctx, edgeX, cy, edgeX, cy + tileSize, -1, 0, waveCycle, foamAlpha);
      }

      // 4. East Shoreline Lap (Water left, Land right)
      if (eastLand) {
        const edgeX = cx + tileSize + lapOffset;
        this.drawWaveLapBand(ctx, edgeX, cy, edgeX, cy + tileSize, 1, 0, waveCycle, foamAlpha);
      }
    }

    ctx.restore();
  }

  /**
   * Draw a stylized cel-shaded foam band that advances and undulates
   */
  drawWaveLapBand(ctx, x1, y1, x2, y2, normalX, normalY, cycle, alpha) {
    const isHorizontal = normalY !== 0;
    const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
    const startPos = isHorizontal ? Math.min(x1, x2) : Math.min(y1, y2);
    const perpBase = isHorizontal ? y1 : x1;

    // 1. Shallow Water Submersion tint under the lapping wave
    ctx.fillStyle = `rgba(204, 251, 241, ${0.15 + cycle * 0.2})`;
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

    // Primary Foam Outline (Cel-Shaded Crisp White)
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner Secondary Foam Bubbles / Highlight
    ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.75})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Tiny Dissipating Foam Bubbles (Cel-Shaded Dots)
    if (cycle > 0.4) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
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
