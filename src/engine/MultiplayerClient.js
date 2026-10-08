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

    // Throttling e detecção de mudança para economizar cota do Supabase Realtime (Free Tier)
    this.lastBroadcastTime = 0;
    this.broadcastIntervalMs = 250; // 4 updates/segundo máx (interpolado suavemente por LERP no client)
    this.lastSentState = {
      x: null,
      y: null,
      direction: null,
      isMoving: null,
      isSprinting: null,
      isMounted: null,
      activeDragonId: null,
      idleHeartbeatTime: 0
    };

    this.connect();
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
    if (!existing) {
      existing = {
        ...p,
        targetX: p.x,
        targetY: p.y,
        animTimer: 0,
        avatarConfig: p.avatarConfig || null,
        scale: p.scale || 1.0,
        dragonMode: p.dragonMode || (p.isMounted ? 'mounted' : (p.activeDragonId ? 'follow' : 'none')),
        flightAltitude: p.flightAltitude || 0
      };
      this.remotePlayers.set(p.id, existing);
    } else {
      existing.targetX = p.x;
      existing.targetY = p.y;
      existing.direction = p.direction;
      existing.isMoving = p.isMoving;
      existing.isSprinting = p.isSprinting;
      existing.isMounted = p.isMounted;
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

      let existing = this.remotePlayers.get(p.id);
      if (!existing) {
        existing = {
          ...p,
          targetX: p.x,
          targetY: p.y,
          animTimer: 0
        };
        this.remotePlayers.set(p.id, existing);
      } else {
        existing.targetX = p.x;
        existing.targetY = p.y;
        existing.direction = p.direction;
        existing.isMoving = p.isMoving;
        existing.isSprinting = p.isSprinting;
        existing.isMounted = p.isMounted;
        existing.heroId = p.heroId;
        existing.name = p.name;
        existing.activeDragonId = p.activeDragonId;
        if (p.avatarConfig) existing.avatarConfig = p.avatarConfig;
        if (p.scale !== undefined) existing.scale = p.scale;
        if (p.dragonMode !== undefined) existing.dragonMode = p.dragonMode;
        if (p.flightAltitude !== undefined) existing.flightAltitude = p.flightAltitude;
      }
    }
  }

  sendLocalPlayerUpdate(player, heroId, name = 'Aventureiro', activeDragonId = null, extraData = {}) {
    const now = performance.now();
    const currentX = Math.round(player.x);
    const currentY = Math.round(player.y);
    const currentHeroId = heroId || player.heroId;

    // Detect if state actually changed
    const hasMoved = this.lastSentState.x !== currentX || this.lastSentState.y !== currentY;
    const hasActionChanged = 
      this.lastSentState.direction !== player.direction ||
      this.lastSentState.isMoving !== player.isMoving ||
      this.lastSentState.isSprinting !== player.isSprinting ||
      this.lastSentState.isMounted !== player.isMounted ||
      this.lastSentState.activeDragonId !== activeDragonId;

    const timeSinceLastSend = now - this.lastBroadcastTime;
    const shouldSendPeriodicIdle = (now - this.lastSentState.idleHeartbeatTime) > 30000; // Heartbeat a cada 30s apenas se parado

    // Send only if enough time passed AND (player moved OR action changed OR heartbeat)
    const shouldSend = (timeSinceLastSend >= this.broadcastIntervalMs && (hasMoved || hasActionChanged)) || shouldSendPeriodicIdle;

    if (!shouldSend) {
      return;
    }

    this.lastBroadcastTime = now;
    this.lastSentState.x = currentX;
    this.lastSentState.y = currentY;
    this.lastSentState.direction = player.direction;
    this.lastSentState.isMoving = player.isMoving;
    this.lastSentState.isSprinting = player.isSprinting;
    this.lastSentState.isMounted = player.isMounted;
    this.lastSentState.activeDragonId = activeDragonId;
    if (shouldSendPeriodicIdle) {
      this.lastSentState.idleHeartbeatTime = now;
    }

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'PLAYER_UPDATE',
        x: currentX,
        y: currentY,
        direction: player.direction,
        isMoving: player.isMoving,
        isSprinting: player.isSprinting,
        isMounted: player.isMounted,
        heroId: currentHeroId,
        name,
        activeDragonId,
        avatarConfig: player.customAvatarConfig || extraData.avatarConfig || null,
        scale: player.scale || 1.0,
        dragonMode: extraData.dragonMode || (player.isMounted ? 'mounted' : (activeDragonId ? 'follow' : 'none')),
        flightAltitude: extraData.flightAltitude || 0
      }));
    }

    if (this.supabaseClient) {
      this.supabaseClient.broadcastPlayerPosition(player, currentHeroId, name, activeDragonId, extraData);
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

    // 1. Update real remote players LERP
    for (const [, rp] of this.remotePlayers) {
      rp.animTimer = (rp.animTimer || 0) + dt;
      rp.x += (rp.targetX - rp.x) * Math.min(1.0, 10 * dt);
      rp.y += (rp.targetY - rp.y) * Math.min(1.0, 10 * dt);
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

  renderRemotePlayer(ctx, player, assetLoader, isReflection = false) {
    ctx.save();
    const s = player.scale || 1.0;
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    const heroId = player.heroId || 'char_wolf_hunter_m';
    const activeDragonId = player.activeDragonId;
    const isMounted = !!player.isMounted;
    const alt = player.flightAltitude || 0;
    const dir = player.direction || 'south';

    // 0. Render Companion Dragon Underlay (quando o dragão estiver em modo 'follow' ao lado do jogador)
    if (activeDragonId && !isMounted && DRAGON_CATALOG) {
      const dragonData = DRAGON_CATALOG.find(d => d.id === activeDragonId);
      if (dragonData) {
        ctx.save();
        const dragonOffset = (dir === 'east') ? { x: -36, y: -8 } : ((dir === 'west') ? { x: 36, y: -8 } : { x: -28, y: -16 });
        const dgX = drawX + dragonOffset.x;
        const dgY = drawY + dragonOffset.y + Math.sin((player.animTimer || 0) * 4) * 4;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(dgX + 24, drawY + 48, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated SVG frame or Vector Fallback
        const spritePath = dragonData.iconPath || dragonData.image;
        const dragonImg = assetLoader?.getImage(spritePath);
        if (dragonImg && dragonImg.complete && dragonImg.naturalWidth > 0) {
          ctx.drawImage(dragonImg, dgX - 24, dgY - 24, 96, 96);
        } else {
          // Vector Fallback
          ctx.fillStyle = dragonData.color || '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(dgX + 24, dgY + 24, 16, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 1. Sombra circular nos pés (omitida em reflexos ou quando montado alto)
    if (!isReflection && (!isMounted || alt <= 5)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(drawX + 32 * s, drawY + 60 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1b. Se estiver montado, renderiza a base do dragão de montaria
    if (isMounted && activeDragonId && DRAGON_CATALOG) {
      const dragonData = DRAGON_CATALOG.find(d => d.id === activeDragonId);
      if (dragonData) {
        ctx.save();
        const bounce = Math.sin((player.animTimer || 0) * (alt > 10 ? 8 : 4)) * (alt > 10 ? 6 : 4);
        const dgMountY = drawY + bounce - alt;

        // Sombra no chão em voo
        if (!isReflection) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.ellipse(drawX + 32, drawY + 54, 20 + alt * 0.1, 8 + alt * 0.05, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        const spritePath = dragonData.iconPath || dragonData.image;
        const dragonImg = assetLoader?.getImage(spritePath);
        if (dragonImg && dragonImg.complete && dragonImg.naturalWidth > 0) {
          ctx.drawImage(dragonImg, drawX - 16, dgMountY - 16, 96, 96);
        } else {
          ctx.fillStyle = dragonData.color || '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(drawX + 32, dgMountY + 36, 22, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 2. Modular Cutout Avatar Engine (Renderiza sempre o avatar fiel personalizado ou herói)
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
      // Fallback simples de emergência
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
