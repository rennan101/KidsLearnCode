// Water Reflection System (Zelda Wind Waker & Cel-Shaded RPG Style)
// Renders dynamic, wave-distorted reflections of flying players, dragons, NPCs, and shoreline upright objects (trees, rocks, houses) onto water.
// Excludes flat ground surfaces, dialogue boxes, overhead name pills, level badges, and interaction prompts.

export class WaterReflectionRenderer {
  constructor() {
    this.reflectionAlpha = 0.42;
    this.reflectionScaleY = -0.65; // Inverted Y perspective squish
  }

  /**
   * Determine if a tile represents an upright physical object (e.g. Trees, Rocks, Houses, Bushes, Buildings)
   * Flat ground-level surfaces (Grass, Sand, Dirt paths, Farmland, Puddles, Soil) must NEVER be reflected.
   */
  isReflectiveUprightObject(tileId, tileMeta) {
    if (!tileId) return false;
    const id = tileId.toLowerCase();

    // 1. Explicitly ignore flat terrain & ground surfaces
    if (
      id.startsWith('grass') || id.startsWith('sand') || id.startsWith('dirt') ||
      id.startsWith('soil') || id.startsWith('path') || id.startsWith('road') ||
      id.startsWith('water') || id.startsWith('floor') || id.startsWith('puddle') ||
      id.startsWith('ground') || id.startsWith('tile-') || id.startsWith('cliff-flat') ||
      id.includes('pavement') || id.includes('pebble') || id.includes('farmland') ||
      id.includes('field') || id.includes('mud') || id.includes('carpet') || id.includes('rug')
    ) {
      return false;
    }

    if (tileMeta) {
      // Ground layer tiles are never upright
      if (tileMeta.layer === 'ground') return false;
      if (tileMeta.isFloor || tileMeta.isPath || tileMeta.isTerrain) return false;

      // Multi-tile height or custom colliders indicate physical objects
      if (tileMeta.gridH && tileMeta.gridH > 1) return true;
      if (tileMeta.isTree || tileMeta.isHouse || tileMeta.isBuilding || tileMeta.isRock || tileMeta.isNPC || tileMeta.isCharacter) return true;
    }

    // 2. Allow upright objects (Trees, Rocks, Bushes, Buildings, Props, Statues, Fences)
    if (
      id.includes('tree') || id.includes('pine') || id.includes('palm') || id.includes('stump') || id.includes('trunk') ||
      id.includes('rock') || id.includes('boulder') || id.includes('stone') || id.includes('crystal') || id.includes('ore') ||
      id.includes('house') || id.includes('building') || id.includes('roof') || id.includes('wall') || id.includes('castle') ||
      id.includes('tower') || id.includes('arch') || id.includes('chimney') || id.includes('barn') || id.includes('tent') || id.includes('well') ||
      id.includes('fence') || id.includes('gate') || id.includes('pillar') || id.includes('column') || id.includes('statue') ||
      id.includes('monument') || id.includes('lamp') || id.includes('torch') || id.includes('sign') || id.includes('pole') ||
      id.includes('barrel') || id.includes('crate') || id.includes('chest') || id.includes('table') || id.includes('bench') ||
      id.includes('wagon') || id.includes('cart') || id.includes('pot') || id.includes('urn') || id.includes('bush') ||
      id.includes('plant') || id.includes('flower') || id.includes('shrub') || id.includes('cactus') || id.includes('bamboo') ||
      id.includes('reed')
    ) {
      return true;
    }

    return false;
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

    // 1. Create Clipping Region for all visible water tiles (guarantees zero leak onto land)
    ctx.beginPath();
    for (let i = 0; i < visibleWaterCells.length; i++) {
      const w = visibleWaterCells[i];
      ctx.rect(w.x, w.y, w.tileSize, w.tileSize);
    }
    ctx.clip();

    // 2. Render Shoreline Solid & Decor Upright Objects Reflections (Trees, Rocks, Buildings, Bushes)
    this.renderShorelineObjectReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec);

    // 3. Render Characters & NPCs Reflections near water (pure body, no overhead name badges or prompts)
    this.renderNPCReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec);

    // 4. Render Wild Dragons Reflections (flying over or swimming in water)
    if (dragonManager && dragonManager.wildDragons) {
      this.renderWildDragonReflections(ctx, dragonManager, player, assetLoader, timeSec);
    }

    // 5. Render Remote Players Reflections (Multiplayer - pure body, no overhead tags)
    if (multiplayerClient) {
      this.renderMultiplayerReflections(ctx, multiplayerClient, assetLoader, timeSec);
    }

    // 6. Render Local Player & Dragon Mount Reflection (Flying or Standing near water)
    if (player) {
      this.renderPlayerReflection(ctx, player, dragonManager, assetLoader, timeSec);
    }

    ctx.restore();
  }

  /**
   * Render inverted reflections of solid and decor upright objects standing on shore (never flat ground)
   */
  renderShorelineObjectReflections(ctx, tileMap, assetLoader, camera, isEditor, timeSec) {
    const shorelineObjects = tileMap.getReflectiveUprightObjects ? tileMap.getReflectiveUprightObjects(assetLoader) : null;
    if (!shorelineObjects || shorelineObjects.length === 0) return;

    const padding = 64;
    const camX = (camera?.x || 0) - padding;
    const camY = (camera?.y || 0) - padding;
    const camW = (camera?.viewportWidth || 800) + padding * 2;
    const camH = (camera?.viewportHeight || 600) + padding * 2;
    const camZ = camera?.zoom || 1.0;
    const viewMaxX = camX + camW / camZ;
    const viewMaxY = camY + camH / camZ;

    for (let i = 0; i < shorelineObjects.length; i++) {
      const obj = shorelineObjects[i];
      if (obj.destX < camX || obj.destX > viewMaxX || obj.baseY < camY || obj.baseY > viewMaxY) {
        continue;
      }

      const waveSway = Math.sin(timeSec * 2.8 + (obj.destX + obj.baseY) * 0.04) * 2.5;

      ctx.save();
      ctx.translate(obj.destX + waveSway, obj.baseY);
      ctx.scale(1, this.reflectionScaleY);
      ctx.translate(-obj.destX, -obj.baseY);

      ctx.globalAlpha = this.reflectionAlpha * 0.75;
      tileMap.drawTileCell(ctx, obj.cell, obj.tx, obj.ty, assetLoader, isEditor, false, true);
      ctx.restore();
    }
  }

  /**
   * Render inverted reflections for NPCs on shore (without overhead badges or prompts)
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
        tileMap.drawTileCell(ctx, cell, tx, ty, assetLoader, isEditor, false, true);
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
        player.render(ctx, assetLoader, false, true);
      }
    } else {
      player.render(ctx, assetLoader, false, true);
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
   * Render multiplayer remote players reflections (omits overhead name tags)
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
      multiplayerClient.renderRemotePlayer(ctx, remote, assetLoader, true);
      ctx.restore();
    }
  }
}
