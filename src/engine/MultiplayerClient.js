/**
 * Multiplayer Client - Sprint 7 Real-time WebSockets Synchronization
 * Gerencia conexão com o servidor Node.js, interpolação (LERP) de jogadores remotos,
 * chat sincronizado e suporte a bots amigáveis de demonstração offline.
 */

import { ModularAvatarRenderer } from './animation/ModularAvatarRenderer.js';
import { MASTER_NPC_CONFIGS } from './animation/NPCAppearanceGenerator.js';
import { DEFAULT_AVATAR_CONFIG } from './animation/AvatarConfig.js';
import { DRAGON_CATALOG } from './DragonManager.js';

export class MultiplayerClient {
  constructor(serverUrl = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.isConnected = false;
    this.playerId = null;
    this.remotePlayers = new Map();
    this.avatarRenderer = new ModularAvatarRenderer();

    // Simulated offline bots list (empty by default - only real players and editor-placed entities exist)
    this.simulatedBots = [];

    this.supabaseClient = null;
    this.dragonManager = null;

    // Taxa de broadcast fluida em tempo real (~15 Hz no Supabase, ~30 Hz em WebSockets nativos)
    this.lastBroadcastTime = 0;
    this.broadcastIntervalMs = 66; // 66ms = ~15 updates/s (fluido e dentro da cota do Supabase)
    this.lastSentState = {
      x: null,
      y: null,
      direction: null,
      isMoving: null,
      isSprinting: null,
      isMounted: null,
      activeDragonId: null,
      dragonMode: null,
      flightAltitude: null,
      idleHeartbeatTime: 0
    };

    // Cache de sprites animados SVG de Dragões para jogadores remotos
    this.dragonSpriteFrames = {};
    this.loadDragonSpriteFrames();

    this.connect();
  }

  attachDragonManager(dragonManager) {
    if (!dragonManager) return;
    this.dragonManager = dragonManager;
    if (dragonManager.dragonSpriteFrames && Object.keys(dragonManager.dragonSpriteFrames).length > 0) {
      this.dragonSpriteFrames = dragonManager.dragonSpriteFrames;
    }
  }

  loadDragonSpriteFrames() {
    if (typeof Image === 'undefined') return;

    // 1. Dragon Storm (Volt)
    const stormSideFrames = [];
    const stormSouthFrames = [];
    const stormNorthFrames = [];
    for (let i = 1; i <= 8; i++) {
      const side = new Image();
      side.src = `assets/Dragon/dragon_fly_storm/flying/dragon_flying_frame_${i}.svg`;
      stormSideFrames.push(side);

      const south = new Image();
      south.src = `assets/Dragon/dragon_fly_storm/flying_south_front/dragon_flying_south_frame_${i}.svg`;
      stormSouthFrames.push(south);

      const north = new Image();
      north.src = `assets/Dragon/dragon_fly_storm/flying_north_back/dragon_flying_north_back_frame_${i}.svg`;
      stormNorthFrames.push(north);
    }

    this.dragonSpriteFrames['dragon_fly_storm'] = {
      flying: stormSideFrames,
      flying_side: stormSideFrames,
      flying_south: stormSouthFrames,
      flying_north: stormNorthFrames
    };

    // 2. Dragon Zephyr
    const zephyrSideFrames = [];
    const zephyrSouthFrames = [];
    const zephyrNorthFrames = [];
    for (let i = 1; i <= 8; i++) {
      const side = new Image();
      side.src = `assets/Dragon/dragon_fly_zephyr/flying/zephyr_flying_right_frame_${i}.svg`;
      zephyrSideFrames.push(side);

      const south = new Image();
      south.src = `assets/Dragon/dragon_fly_zephyr/flying_south_front/zephyr_flying_south_frame_${i}.svg`;
      zephyrSouthFrames.push(south);

      const north = new Image();
      north.src = `assets/Dragon/dragon_fly_zephyr/flying_north_back/zephyr_flying_north_frame_${i}.svg`;
      zephyrNorthFrames.push(north);
    }

    this.dragonSpriteFrames['dragon_fly_zephyr'] = {
      flying: zephyrSideFrames,
      flying_side: zephyrSideFrames,
      flying_south: zephyrSouthFrames,
      flying_north: zephyrNorthFrames
    };
  }

  attachSupabase(supabaseClient) {
    if (!supabaseClient) return;
    this.supabaseClient = supabaseClient;

    this.supabaseClient.setupRealtimeChannel(
      (remotePlayer) => {
        this.handleRemotePlayerUpdate(remotePlayer);
      },
      (chatMsg) => {
        if (this.onChatReceived) {
          this.onChatReceived(chatMsg);
        }
      },
      (mapPayload) => {
        if (this.onMapUpdated) {
          this.onMapUpdated(mapPayload);
        }
      }
    );
  }

  handleRemotePlayerUpdate(p) {
    if (!p || p.id === this.supabaseClient?.user?.id || p.id === this.playerId) return;

    let existing = this.remotePlayers.get(p.id);
    const targetX = p.x;
    const targetY = p.y;
    const defaultDragonX = (p.dragonX !== null && p.dragonX !== undefined) ? p.dragonX : (targetX - 28);
    const defaultDragonY = (p.dragonY !== null && p.dragonY !== undefined) ? p.dragonY : (targetY - 14);

    if (!existing) {
      existing = {
        ...p,
        x: targetX,
        y: targetY,
        prevX: targetX,
        prevY: targetY,
        targetX,
        targetY,
        vx: p.vx || 0,
        vy: p.vy || 0,
        animTimer: 0,
        dragonAnimTimer: 0,
        dragonX: defaultDragonX,
        dragonY: defaultDragonY,
        dragonTargetX: defaultDragonX,
        dragonTargetY: defaultDragonY,
        avatarConfig: p.avatarConfig || null,
        scale: p.scale || 1.0,
        dragonMode: p.dragonMode || (p.isMounted ? 'mounted' : (p.activeDragonId ? 'follow' : 'none')),
        flightAltitude: p.flightAltitude || 0
      };
      this.remotePlayers.set(p.id, existing);
    } else {
      const dist = Math.hypot(targetX - existing.x, targetY - existing.y);
      if (dist > 250) {
        // Snap imediato em caso de teleporte / portal / respawn
        existing.x = targetX;
        existing.y = targetY;
        existing.prevX = targetX;
        existing.prevY = targetY;
        existing.targetX = targetX;
        existing.targetY = targetY;
        existing.dragonX = defaultDragonX;
        existing.dragonY = defaultDragonY;
      } else {
        existing.prevX = existing.x;
        existing.prevY = existing.y;
        existing.targetX = targetX;
        existing.targetY = targetY;
      }

      existing.vx = p.vx !== undefined ? p.vx : (targetX - existing.prevX) / 0.066;
      existing.vy = p.vy !== undefined ? p.vy : (targetY - existing.prevY) / 0.066;
      existing.dragonTargetX = defaultDragonX;
      existing.dragonTargetY = defaultDragonY;
      if (existing.dragonX === undefined) {
        existing.dragonX = defaultDragonX;
        existing.dragonY = defaultDragonY;
      }

      existing.direction = p.direction;
      existing.isMoving = Boolean(p.isMoving);
      existing.isSprinting = Boolean(p.isSprinting);
      existing.isMounted = Boolean(p.isMounted);
      existing.heroId = p.heroId;
      existing.name = p.name;
      existing.activeDragonId = p.activeDragonId;
      if (p.avatarConfig) existing.avatarConfig = p.avatarConfig;
      if (p.scale !== undefined) existing.scale = p.scale;
      if (p.dragonMode !== undefined) existing.dragonMode = p.dragonMode;
      if (p.flightAltitude !== undefined) existing.flightAltitude = p.flightAltitude;
    }
  }

  connect() {
    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INIT') {
            this.playerId = data.playerId;
          } else if (data.type === 'WORLD_TICK') {
            this.handleWorldTick(data.players);
          } else if (data.type === 'CHAT_BROADCAST') {
            if (this.onChatReceived) {
              this.onChatReceived(data);
            }
          } else if (data.type === 'PLAYER_DISCONNECT') {
            this.remotePlayers.delete(data.playerId);
          }
        } catch (err) {
          console.error('Error handling websocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  handleWorldTick(playerList) {
    if (!Array.isArray(playerList)) return;

    for (const p of playerList) {
      if (p.id === this.playerId) continue; // Skip local player
      this.handleRemotePlayerUpdate(p);
    }
  }

  sendLocalPlayerUpdate(player, heroId, name = 'Aventureiro', activeDragonId = null, extraData = {}) {
    const now = performance.now();
    const currentX = Math.round(player.x);
    const currentY = Math.round(player.y);
    const currentHeroId = heroId || player.heroId;
    const currentDragonMode = extraData.dragonMode || (player.isMounted ? 'mounted' : (activeDragonId ? 'follow' : 'none'));
    const currentAltitude = Math.round(extraData.flightAltitude || 0);

    // Detecção de mudança de estado crítico (início/fim de movimento, virar de direção, montar, trocar dragão)
    const isMovingChanged = this.lastSentState.isMoving !== Boolean(player.isMoving);
    const directionChanged = this.lastSentState.direction !== player.direction;
    const mountChanged = this.lastSentState.isMounted !== Boolean(player.isMounted);
    const dragonChanged = this.lastSentState.activeDragonId !== activeDragonId || this.lastSentState.dragonMode !== currentDragonMode;
    const sprintChanged = this.lastSentState.isSprinting !== Boolean(player.isSprinting);
    const altitudeChanged = Math.abs((this.lastSentState.flightAltitude || 0) - currentAltitude) > 4;

    const isCriticalStateChange = isMovingChanged || directionChanged || mountChanged || dragonChanged || sprintChanged || altitudeChanged;

    const hasMoved = this.lastSentState.x !== currentX || this.lastSentState.y !== currentY;
    const timeSinceLastSend = now - this.lastBroadcastTime;
    const shouldSendPeriodicIdle = (now - this.lastSentState.idleHeartbeatTime) > 30000;

    // Intervalo adaptativo: 33ms em WebSockets dedicados, 66ms no Supabase Realtime
    const targetInterval = (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) ? 33 : this.broadcastIntervalMs;

    // Disparo imediato se houve mudança crítica (com debounce mínimo de 20ms) OU se atingiu o intervalo de movimento regular
    const shouldSend = (isCriticalStateChange && timeSinceLastSend >= 20) ||
      (timeSinceLastSend >= targetInterval && (hasMoved || player.isMoving)) ||
      shouldSendPeriodicIdle;

    if (!shouldSend) {
      return;
    }

    const dtSeconds = Math.max(0.016, timeSinceLastSend / 1000);
    const vx = hasMoved && this.lastSentState.x !== null ? Math.round((currentX - this.lastSentState.x) / dtSeconds) : 0;
    const vy = hasMoved && this.lastSentState.y !== null ? Math.round((currentY - this.lastSentState.y) / dtSeconds) : 0;

    const fullExtraData = {
      ...extraData,
      vx,
      vy,
      dragonMode: currentDragonMode,
      flightAltitude: currentAltitude
    };

    this.lastBroadcastTime = now;
    this.lastSentState.x = currentX;
    this.lastSentState.y = currentY;
    this.lastSentState.direction = player.direction;
    this.lastSentState.isMoving = Boolean(player.isMoving);
    this.lastSentState.isSprinting = Boolean(player.isSprinting);
    this.lastSentState.isMounted = Boolean(player.isMounted);
    this.lastSentState.activeDragonId = activeDragonId;
    this.lastSentState.dragonMode = currentDragonMode;
    this.lastSentState.flightAltitude = currentAltitude;

    if (shouldSendPeriodicIdle) {
      this.lastSentState.idleHeartbeatTime = now;
    }

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'PLAYER_UPDATE',
        x: currentX,
        y: currentY,
        vx,
        vy,
        direction: player.direction,
        isMoving: Boolean(player.isMoving),
        isSprinting: Boolean(player.isSprinting),
        isMounted: Boolean(player.isMounted),
        heroId: currentHeroId,
        name,
        activeDragonId,
        avatarConfig: player.customAvatarConfig || extraData.avatarConfig || null,
        scale: player.scale || 1.0,
        dragonMode: currentDragonMode,
        flightAltitude: currentAltitude,
        dragonX: extraData.dragonX !== undefined ? Math.round(extraData.dragonX) : null,
        dragonY: extraData.dragonY !== undefined ? Math.round(extraData.dragonY) : null
      }));
    }

    if (this.supabaseClient) {
      this.supabaseClient.broadcastPlayerPosition(player, currentHeroId, name, activeDragonId, fullExtraData);
    }
  }

  sendChatMessage(text, player, senderName = 'Aventureiro') {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        senderName,
        text,
        x: player.x,
        y: player.y
      }));
    }

    if (this.supabaseClient) {
      this.supabaseClient.broadcastChatMessage(text, player, senderName);
    }
  }

  update(deltaTime, dialogueSystem) {
    const dt = Math.min(deltaTime / 1000, 0.1);

    // 1. Update real remote players Velocity LERP (Anti-Teletransporte)
    for (const [, rp] of this.remotePlayers) {
      rp.animTimer = (rp.animTimer || 0) + dt;
      rp.dragonAnimTimer = (rp.dragonAnimTimer || 0) + dt;

      const lerpSpeed = rp.isSprinting ? 22 : 18;
      const step = Math.min(1.0, lerpSpeed * dt);

      // Aproximação contínua e suave em direção ao alvo
      rp.x += (rp.targetX - rp.x) * step;
      rp.y += (rp.targetY - rp.y) * step;

      // Suavização da posição do Dragão Remoto
      if (rp.dragonTargetX !== undefined && rp.dragonTargetY !== undefined) {
        if (rp.isMounted) {
          rp.dragonX = rp.x;
          rp.dragonY = rp.y;
        } else {
          rp.dragonX = (rp.dragonX || rp.x) + (rp.dragonTargetX - (rp.dragonX || rp.x)) * Math.min(1.0, 14 * dt);
          rp.dragonY = (rp.dragonY || rp.y) + (rp.dragonTargetY - (rp.dragonY || rp.y)) * Math.min(1.0, 14 * dt);
        }
      }
    }

    // 2. Update simulated offline bots
    if (!this.isConnected) {
      for (const bot of this.simulatedBots) {
        bot.timer += dt;
        bot.animTimer += dt;
        bot.chatCooldown -= dt;

        // Periodic roaming
        if (bot.timer > 4.0) {
          bot.timer = 0;
          const moves = [
            { dx: 64, dy: 0, dir: 'east' },
            { dx: -64, dy: 0, dir: 'west' },
            { dx: 0, dy: 64, dir: 'south' },
            { dx: 0, dy: -64, dir: 'north' },
            { dx: 0, dy: 0, dir: 'south' }
          ];
          const chosen = moves[Math.floor(Math.random() * moves.length)];
          bot.targetX = bot.x + chosen.dx;
          bot.targetY = bot.y + chosen.dy;
          bot.direction = chosen.dir;
          bot.isMoving = chosen.dx !== 0 || chosen.dy !== 0;
        }

        bot.x += (bot.targetX - bot.x) * Math.min(1.0, 4.0 * dt);
        bot.y += (bot.targetY - bot.y) * Math.min(1.0, 4.0 * dt);

        if (Math.hypot(bot.targetX - bot.x, bot.targetY - bot.y) < 2) {
          bot.isMoving = false;
        }

        // Friendly bot occasional chat
        if (bot.chatCooldown <= 0 && dialogueSystem) {
          bot.chatCooldown = 15.0 + Math.random() * 10;
          const phrases = [
            'Olá amigo! Bem-vindo à Ilha Lua!',
            'Estou treinando meu dragão para voar sobre o mar.',
            'Você já programou seus feitiços com o Dr. Arquimedes?',
            'O dia está lindo hoje para coletar sementes!',
            'Aperte [1] para esquivar durante as batalhas!'
          ];
          const phrase = phrases[Math.floor(Math.random() * phrases.length)];
          if (typeof dialogueSystem.addBubble === 'function') {
            dialogueSystem.addBubble(bot.id, bot.name, phrase, bot.heroId);
          } else if (typeof dialogueSystem.addSpeechBubble === 'function') {
            dialogueSystem.addSpeechBubble(bot.id, phrase, { x: bot.x, y: bot.y });
          }
        }
      }
    }
  }

  render(ctx, assetLoader, camera = null) {
    const remoteList = Array.from(this.remotePlayers.values());
    const listToRender = (remoteList.length > 0 || this.isConnected || this.supabaseClient)
      ? remoteList
      : this.simulatedBots;

    const tileSize = 64;
    const padding = 2 * tileSize;

    for (const p of listToRender) {
      if (camera && typeof camera.x === 'number' && typeof camera.y === 'number') {
        const zoom = camera.zoom || 1.0;
        const viewW = camera.viewportWidth / zoom;
        const viewH = camera.viewportHeight / zoom;
        if (
          p.x + 64 < camera.x - padding ||
          p.x > camera.x + viewW + padding ||
          p.y + 64 < camera.y - padding ||
          p.y > camera.y + viewH + padding
        ) {
          continue; // Outside camera + 2 blocks
        }
      }
      this.renderRemotePlayer(ctx, p, assetLoader);
    }
  }

  // Renderiza um dragão remoto com animações completas SVG, direção, sombra e flutuação
  renderRemoteDragonVisual(ctx, dragonId, drawX, drawY, dir, alt, animTimer, isMounted, assetLoader, isReflection = false) {
    const dragonData = DRAGON_CATALOG ? DRAGON_CATALOG.find(d => d.id === dragonId) : null;
    const isWest = dir === 'west';
    const isFrontOrBack = dir === 'north' || dir === 'south';
    const bounce = Math.sin((animTimer || 0) * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4);
    const dgDrawY = drawY + bounce - alt;

    // 1. Sombra do Dragão no Chão
    if (!isReflection) {
      ctx.save();
      const shadowScaleX = 20 + (alt * 0.14);
      const shadowScaleY = 8 + (alt * 0.06);
      const shadowAlpha = isMounted ? Math.max(0.12, 0.38 - (alt / 120) * 0.20) : 0.28;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(drawX + 32, drawY + (isMounted ? 54 : 44), shadowScaleX, shadowScaleY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Animação de Frames SVG com Direção
    const spriteSet = this.dragonSpriteFrames?.[dragonId] || this.dragonManager?.dragonSpriteFrames?.[dragonId];
    if (spriteSet) {
      let frames = spriteSet.flying_side || spriteSet.flying;
      if (dir === 'north' && spriteSet.flying_north?.length) {
        frames = spriteSet.flying_north;
      } else if (dir === 'south' && spriteSet.flying_south?.length) {
        frames = spriteSet.flying_south;
      }

      if (frames && frames.length > 0) {
        const frameIdx = Math.floor(((animTimer || 0) * 10) % frames.length);
        const frameImg = frames[frameIdx];

        if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(drawX + 32, dgDrawY + 28);
          if (isWest) {
            ctx.scale(-1, 1);
          }
          const spriteSize = isFrontOrBack ? 104 : 112;
          const halfSize = spriteSize / 2;
          ctx.drawImage(frameImg, -halfSize, -halfSize, spriteSize, spriteSize);
          ctx.restore();
          return;
        }
      }
    }

    // 3. Fallback: Sprite estático do catálogo
    const spritePath = dragonData?.iconPath || dragonData?.image;
    const staticImg = assetLoader?.getImage(spritePath);
    if (staticImg && staticImg.complete && staticImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(drawX + 32, dgDrawY + 28);
      if (isWest) ctx.scale(-1, 1);
      ctx.drawImage(staticImg, -48, -48, 96, 96);
      ctx.restore();
      return;
    }

    // 4. Fallback Vetorial com Asas Batendo
    ctx.save();
    if (isWest) {
      ctx.translate(drawX + 64, dgDrawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(drawX, dgDrawY);
    }
    const bodyColor = dragonData?.color || '#38bdf8';
    const accentColor = dragonData?.secondaryColor || '#fef08a';
    const flapFreq = alt > 10 ? 14 : 7;
    const flapAmp = alt > 10 ? 9 : 5;
    const wingFlap = Math.sin((animTimer || 0) * flapFreq) * flapAmp;

    // Asas
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(22, 28 - wingFlap, 14, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(42, 28 + wingFlap, 14, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Corpo
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(32, 34, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.beginPath();
    ctx.arc(42, 26, 10, 0, Math.PI * 2);
    ctx.fill();

    // Olho
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(45, 24, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#794f27';
    ctx.beginPath();
    ctx.arc(46, 24, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderRemotePlayer(ctx, player, assetLoader, isReflection = false) {
    ctx.save();
    const s = player.scale || 1.0;
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    const heroId = player.heroId || 'char_wolf_hunter_m';
    const activeDragonId = player.activeDragonId;
    const isMounted = Boolean(player.isMounted);
    const alt = player.flightAltitude || 0;
    const dir = player.direction || 'south';
    const animTimer = player.dragonAnimTimer || player.animTimer || 0;

    // 0. Render Companion Dragon Underlay (quando em modo 'follow' acompanhando o jogador)
    if (activeDragonId && !isMounted) {
      const dgX = player.dragonX !== undefined ? Math.round(player.dragonX) : (drawX - 28);
      const dgY = player.dragonY !== undefined ? Math.round(player.dragonY) : (drawY - 14);
      this.renderRemoteDragonVisual(ctx, activeDragonId, dgX, dgY, dir, 0, animTimer, false, assetLoader, isReflection);
    }

    // 1. Sombra circular nos pés do jogador (omitida em reflexos ou quando montado alto)
    if (!isReflection && (!isMounted || alt <= 5)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(drawX + 32 * s, drawY + 60 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1b. Se estiver montado, renderiza o Dragão sob o avatar
    if (isMounted && activeDragonId) {
      this.renderRemoteDragonVisual(ctx, activeDragonId, drawX, drawY, dir, alt, animTimer, true, assetLoader, isReflection);
    }

    // 2. Modular Cutout Avatar Engine (Renderiza o avatar fiel do jogador ou herói)
    const avatarConfig = player.avatarConfig || MASTER_NPC_CONFIGS[heroId] || DEFAULT_AVATAR_CONFIG;
    if (this.avatarRenderer) {
      let animState = 'idle';
      if (isMounted) animState = 'riding';
      else if (player.isSprinting && player.isMoving) animState = 'run';
      else if (player.isMoving) animState = 'walk';

      const avatarScale = 0.33 * s;
      const targetX = drawX + (32 * s);
      const targetY = drawY + (60 * s) - (265 * avatarScale) - (isMounted ? alt : 0);

      this.avatarRenderer.render(
        ctx,
        targetX,
        targetY,
        dir,
        animState,
        player.animTimer || performance.now() / 1000,
        avatarConfig,
        avatarScale
      );
    } else {
      // Fallback simples
      const rowMap = { south: 0, east: 1, north: 2, west: 3 };
      const row = rowMap[dir] ?? 0;
      let col = player.isMoving ? 2 : 0;
      const frameUrl = `assets/characters/char_wolf_hunter_m/frames/wolf_hunter_r${row}_c${col}.png`;
      const sprite = assetLoader?.getImage(frameUrl);
      if (sprite) {
        ctx.drawImage(sprite, drawX, drawY, 64 * s, 64 * s);
      }
    }

    // 3. Overhead Name Badge (Animal Island UI 3D)
    if (!isReflection) {
      ctx.save();
      const nameText = player.name || 'Aventureiro';
      ctx.font = 'bold 10.5px "Nunito", sans-serif';
      const textMetrics = ctx.measureText(nameText);
      const badgeW = Math.max(44, textMetrics.width + 16);
      const badgeH = 18;
      const badgeX = drawX + (32 * s) - badgeW / 2;
      const badgeY = drawY - 58 - (isMounted ? alt : 0);

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
      ctx.fillStyle = '#fdfbf7';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      // Badge border mint
      ctx.strokeStyle = '#19c8b9';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Badge text
      ctx.fillStyle = '#794f27';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nameText, drawX + (32 * s), badgeY + badgeH / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}
