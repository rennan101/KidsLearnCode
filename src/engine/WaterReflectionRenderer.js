// Water Reflection System (Zelda Wind Waker & Cel-Shaded RPG Style)
// Renders dynamic, wave-distorted reflections of flying players, dragons, NPCs, and shoreline objects (trees, rocks, houses) onto water.

export class WaterReflectionRenderer {
  constructor() {
    this.reflectionAlpha = 0.42;
    this.reflectionScaleY = -0.65; // Inverted Y perspective squish
  }

  /**
   * Check if a grid coordinate has adjacent water within 1 tile
   */
  hasNeighborWater(tileMap, tx, ty) {
    const ground = tileMap.layers.ground;
    if (!ground) return false;

    const dirs = [
      [0, 1],   // South (land above water - primary reflection direction)
      [0, -1],  // North
      [1, 0],   // East
      [-1, 0],  // West
      [1, 1],   // South-East
      [-1, 1],  // South-West
      [1, -1],  // North-East
      [-1, -1]  // North-West
    ];

    for (let i = 0; i < dirs.length; i++) {
      const nx = tx + dirs[i][0];
      const ny = ty + dirs[i][1];
      const cell = ground.get(tileMap.getKey(nx, ny));
      if (cell && (cell.tileId === 'water-wind-waker' || cell.tileId === 'water-animated' || cell.tileId.includes('water') || cell.tileId.includes('ocean'))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Main reflection render pass - strictly clipped to visible water tiles
   * @param {CanvasRenderingContext2D} ctx 
   * @param {TileMap} tileMap 
   * @param {AssetLoader} assetLoader 
   * @param {Array<{x: number, y: number, tileSize: number, tx: number, ty: number}>} visibleWaterCells 
   * @param {object} renderContext { player, dragonManager, multiplayerClient, camera, isEditor }
   * @param {number} timeMs 
   */
  renderReflections(ctx, tileMap, assetLoader, visibleWaterCells, renderContext = {}, timeMs = 0) {
    if (!visibleWaterCells || visibleWaterCells.length === 0) return;

    const timeSec = timeMs / 1000;
    const { player, dragonManager, multiplayerClient, camera, isEditor } = renderContext;

    ctx.save();

    // 1. Create Clipping Region for all visible water tiles
    ctx.beginPath();
    for (let i = 0; i < visibleWaterCells.length; i++) {
      const w = visibleWaterCells[i];
      ctx.rect(w.x, w.y, w.tileSize, w.tileSize);
    }
    ctx.clip();

    // 2. Render Shoreline Solid & Decor Tiles Reflections (Trees, Rocks, Buildings, Bushes)
    this.renderShorelineObjectReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec);

    // 3. Render Characters & NPCs Reflections near water
    this.renderNPCReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec);

    // 4. Render Wild Dragons Reflections (flying over or swimming in water)
    if (dragonManager && dragonManager.wildDragons) {
      this.renderWildDragonReflections(ctx, dragonManager, player, assetLoader, timeSec);
    }

    // 5. Render Remote Players Reflections (Multiplayer)
    if (multiplayerClient) {
      this.renderMultiplayerReflections(ctx, multiplayerClient, assetLoader, timeSec);
    }

    // 6. Render Local Player & Dragon Mount Reflection (Flying or Standing near water)
    if (player) {
      this.renderPlayerReflection(ctx, player, dragonManager, assetLoader, timeSec);
    }

    // 7. Cel-Shaded Water Wave Ripples Overlay over Reflections
    this.renderReflectionRipples(ctx, visibleWaterCells, timeSec);

    ctx.restore();
  }

  /**
   * Render inverted reflections of solid and decor objects standing on shore
   */
  renderShorelineObjectReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec) {
    const layersToReflect = ['solid', 'decor'];
    const tileSize = tileMap.tileSize || 64;

    const padding = 3;
    const camX = camera?.x || 0;
    const camY = camera?.y || 0;
    const camW = camera?.viewportWidth || 800;
    const camH = camera?.viewportHeight || 600;
    const camZ = camera?.zoom || 1.0;

    const startCol = Math.floor(camX / tileSize) - padding;
    const endCol = Math.ceil((camX + camW / camZ) / tileSize) + padding;
    const startRow = Math.floor(camY / tileSize) - padding;
    const endRow = Math.ceil((camY + camH / camZ) / tileSize) + padding;

    for (const layerName of layersToReflect) {
      const layer = tileMap.layers[layerName];
      if (!layer || layer.size === 0) continue;

      for (let ty = startRow; ty <= endRow; ty++) {
        for (let tx = startCol; tx <= endCol; tx++) {
          const cell = layer.get(tileMap.getKey(tx, ty));
          if (!cell || cell.isRoot === false) continue;

          // Check if this object is near water
          if (!this.hasNeighborWater(tileMap, tx, ty)) continue;

          const baseY = tileMap.getCellBaseY(cell, tx, ty, assetLoader);
          const destX = tx * tileSize;
          const waveSway = Math.sin(timeSec * 2.8 + (destX + baseY) * 0.04) * 2.5;

          ctx.save();
          ctx.translate(destX + waveSway, baseY);
          ctx.scale(1, this.reflectionScaleY);
          ctx.translate(-destX, -baseY);

          ctx.globalAlpha = this.reflectionAlpha * 0.75;
          tileMap.drawTileCell(ctx, cell, tx, ty, assetLoader, isEditor, false);
          ctx.restore();
        }
      }
    }
  }

  /**
   * Render inverted reflections for NPCs on shore
   */
  renderNPCReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec) {
    const charLayer = tileMap.layers.characters;
    if (!charLayer || charLayer.size === 0) return;

    const tileSize = tileMap.tileSize || 64;
    const padding = 3;
    const camX = camera?.x || 0;
    const camY = camera?.y || 0;
    const camW = camera?.viewportWidth || 800;
    const camH = camera?.viewportHeight || 600;
    const camZ = camera?.zoom || 1.0;

    const startCol = Math.floor(camX / tileSize) - padding;
    const endCol = Math.ceil((camX + camW / camZ) / tileSize) + padding;
    const startRow = Math.floor(camY / tileSize) - padding;
    const endRow = Math.ceil((camY + camH / camZ) / tileSize) + padding;

    for (let ty = startRow; ty <= endRow; ty++) {
      for (let tx = startCol; tx <= endCol; tx++) {
        const cell = charLayer.get(tileMap.getKey(tx, ty));
        if (!cell || cell.isRoot === false) continue;

        if (!this.hasNeighborWater(tileMap, tx, ty)) continue;

        const baseY = tileMap.getCellBaseY(cell, tx, ty, assetLoader);
        const destX = tx * tileSize;
        const waveSway = Math.sin(timeSec * 3.0 + (destX + baseY) * 0.04) * 3.0;

        ctx.save();
        ctx.translate(destX + waveSway, baseY);
        ctx.scale(1, this.reflectionScaleY);
        ctx.translate(-destX, -baseY);

        ctx.globalAlpha = this.reflectionAlpha * 0.85;
        tileMap.drawTileCell(ctx, cell, tx, ty, assetLoader, isEditor, false);
        ctx.restore();
      }
    }
  }

  /**
   * Render inverted reflection of Player (flying, mounted, or standing near water)
   */
  renderPlayerReflection(ctx, player, dragonManager, assetLoader, timeSec) {
    if (!player) return;

    const feet = player.getFeetBox();
    const groundBaseY = (feet.y + feet.h);
    const waveSway = Math.sin(timeSec * 3.2 + (player.x + groundBaseY) * 0.05) * 3.2;

    const isMounted = player.isMounted && dragonManager?.isMounted();

    ctx.save();
    ctx.translate(waveSway, groundBaseY);
    ctx.scale(1, this.reflectionScaleY);
    ctx.translate(0, -groundBaseY);

    ctx.globalAlpha = this.reflectionAlpha;

    if (isMounted) {
      try {
        dragonManager.renderMountedUnified(ctx, assetLoader, player);
      } catch (err) {
        player.render(ctx, assetLoader, false);
      }
    } else {
      player.render(ctx, assetLoader, false);
    }

    ctx.restore();
  }

  /**
   * Render wild dragons reflections
   */
  renderWildDragonReflections(ctx, dragonManager, player, assetLoader, timeSec) {
    for (const entity of dragonManager.wildDragons.values()) {
      const groundBaseY = entity.y + 52;
      const waveSway = Math.sin(timeSec * 3.0 + (entity.x + groundBaseY) * 0.05) * 3.0;

      ctx.save();
      ctx.translate(waveSway, groundBaseY);
      ctx.scale(1, this.reflectionScaleY);
      ctx.translate(0, -groundBaseY);

      ctx.globalAlpha = this.reflectionAlpha * 0.85;
      dragonManager.renderWildDragonEntityBody(ctx, entity, player);
      ctx.restore();
    }
  }

  /**
   * Render multiplayer remote players reflections
   */
  renderMultiplayerReflections(ctx, multiplayerClient, assetLoader, timeSec) {
    const listToRender = multiplayerClient.isConnected 
      ? Array.from(multiplayerClient.remotePlayers.values()) 
      : (multiplayerClient.simulatedBots || []);

    for (const remote of listToRender) {
      if (!remote || remote.x === undefined || remote.y === undefined) continue;
      const groundBaseY = remote.y + 60;
      const waveSway = Math.sin(timeSec * 3.2 + (remote.x + groundBaseY) * 0.05) * 3.0;

      ctx.save();
      ctx.translate(waveSway, groundBaseY);
      ctx.scale(1, this.reflectionScaleY);
      ctx.translate(0, -groundBaseY);

      ctx.globalAlpha = this.reflectionAlpha * 0.85;
      multiplayerClient.renderRemotePlayer(ctx, remote, assetLoader);
      ctx.restore();
    }
  }

  /**
   * Subtle water ripple bands overlaid across reflections
   */
  renderReflectionRipples(ctx, visibleWaterCells, timeSec) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.18)'; // Soft ocean tint overlay

    for (let i = 0; i < visibleWaterCells.length; i++) {
      const w = visibleWaterCells[i];
      ctx.fillRect(w.x, w.y, w.tileSize, w.tileSize);
    }

    // Subtle horizontal wave distortion lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < visibleWaterCells.length; i++) {
      const w = visibleWaterCells[i];
      const cx = w.x;
      const cy = w.y;
      const size = w.tileSize;

      const rOffset = Math.sin(timeSec * 2.5 + (cx + cy) * 0.03) * 6;
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 20 + rOffset);
      ctx.lineTo(cx + size - 6, cy + 20 + rOffset);
      ctx.moveTo(cx + 10, cy + 44 - rOffset);
      ctx.lineTo(cx + size - 10, cy + 44 - rOffset);
      ctx.stroke();
    }

    ctx.restore();
  }
}
