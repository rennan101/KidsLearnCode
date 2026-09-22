/**
 * Multiplayer Client - Sprint 7 Real-time WebSockets Synchronization
 * Gerencia conexão com o servidor Node.js, interpolação (LERP) de jogadores remotos,
 * chat sincronizado e suporte a bots amigáveis de demonstração offline.
 */

export class MultiplayerClient {
  constructor(serverUrl = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.isConnected = false;
    this.playerId = null;
    this.remotePlayers = new Map();

    // Simulated offline bots for rich lively island when running standalone
    this.simulatedBots = [
      {
        id: 'bot_lyra',
        name: 'Lyra (Caçadora)',
        heroId: 'char_wolf_hunter_f',
        x: 380,
        y: 350,
        targetX: 380,
        targetY: 350,
        direction: 'south',
        isMoving: false,
        isSprinting: false,
        isMounted: false,
        activeDragonId: 'dragon_land_forest',
        timer: 0,
        animTimer: 0,
        chatCooldown: 8.0
      },
      {
        id: 'bot_vlad',
        name: 'Vlad (Morcego)',
        heroId: 'char_bat_vampire_m',
        x: 260,
        y: 400,
        targetX: 260,
        targetY: 400,
        direction: 'east',
        isMoving: false,
        isSprinting: false,
        isMounted: true,
        activeDragonId: 'dragon_fly_storm',
        timer: 0,
        animTimer: 0,
        chatCooldown: 12.0
      }
    ];

    this.supabaseClient = null;
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
      }
    }
  }

  sendLocalPlayerUpdate(player, heroId, name = 'Aventureiro', activeDragonId = null) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'PLAYER_UPDATE',
        x: Math.round(player.x),
        y: Math.round(player.y),
        direction: player.direction,
        isMoving: player.isMoving,
        isSprinting: player.isSprinting,
        isMounted: player.isMounted,
        heroId: heroId || player.heroId,
        name,
        activeDragonId
      }));
    }

    if (this.supabaseClient) {
      this.supabaseClient.broadcastPlayerPosition(player, heroId || player.heroId, name, activeDragonId);
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
    const listToRender = this.isConnected 
      ? Array.from(this.remotePlayers.values()) 
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

  renderRemotePlayer(ctx, player, assetLoader) {
    ctx.save();
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);

    // 1. Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(drawX + 32, drawY + 60, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sprite Frame
    const rowMap = { south: 0, east: 1, north: 2, west: 3 };
    const row = rowMap[player.direction] ?? 0;
    let col = 0;
    if (player.isMoving) {
      col = 2 + (Math.floor(player.animTimer * 8) % 3);
    } else {
      col = Math.floor(player.animTimer * 3) % 2;
    }

    const heroId = player.heroId || 'char_wolf_hunter_m';
    let sprite = null;

    if (heroId === 'char_wolf_hunter_m') {
      if (player.direction === 'south') {
        if (player.isMoving) {
          const frameNum = (Math.floor((player.animTimer || 0) * 12) % 17) + 1;
          const frameIdx = String(frameNum).padStart(3, '0');
          sprite = assetLoader?.getImage(`assets/characters/char_wolf_hunter_m/Walk_Down/sprite_${frameIdx}.png`);
        } else {
          sprite = assetLoader?.getImage(`assets/characters/char_wolf_hunter_m/Walk_Down/sprite_001.png`);
        }
      } else if (player.direction === 'north') {
        if (player.isMoving) {
          const frameNum = (Math.floor((player.animTimer || 0) * 12) % 15) + 1;
          const frameIdx = String(frameNum).padStart(3, '0');
          sprite = assetLoader?.getImage(`assets/characters/char_wolf_hunter_m/Walk_Up/sprite_${frameIdx}.png`);
        } else {
          sprite = assetLoader?.getImage(`assets/characters/char_wolf_hunter_m/Walk_Up/sprite_001.png`);
        }
      }
    }

    if (!sprite) {
      const frameUrl = `assets/characters/${heroId}/frames/wolf_hunter_r${row}_c${col}.png`;
      sprite = assetLoader?.getImage(frameUrl) 
        || assetLoader?.getImage(`assets/characters/${heroId}/portrait.jpg`)
        || (player.isMoving ? assetLoader?.getImage(`Geralt/running/rotations/${player.direction}.png`) : assetLoader?.getImage(`Geralt/Idle/rotations/${player.direction}.png`));
    }

    if (sprite) {
      ctx.drawImage(sprite, drawX, drawY, 64, 64);
    } else {
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(drawX + 16, drawY + 16, 32, 48);
    }

    // 3. Name Tag and Online Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(drawX + 4, drawY - 14, 56, 14, 4);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 8px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, drawX + 32, drawY - 4);

    ctx.restore();
  }
}
