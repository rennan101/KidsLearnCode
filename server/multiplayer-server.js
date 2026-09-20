/**
 * Universo RPG - Sprint 7 WebSocket Multiplayer Server
 * Servidor em tempo real para sincronização de avatares, montarias, dragões e chat.
 * Ticks/s: 20Hz (a cada 50ms)
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Universo 2D MMORPG WebSocket Server is running.\n');
});

const wss = new WebSocketServer({ server });
const players = new Map();

// 20Hz World Broadcast Tick Loop
setInterval(() => {
  if (players.size === 0) return;

  const playerList = Array.from(players.values()).map(p => ({
    id: p.id,
    name: p.name,
    heroId: p.heroId,
    x: Math.round(p.x),
    y: Math.round(p.y),
    direction: p.direction,
    isMoving: p.isMoving,
    isSprinting: p.isSprinting,
    isMounted: p.isMounted,
    activeDragonId: p.activeDragonId
  }));

  const payload = JSON.stringify({
    type: 'WORLD_TICK',
    timestamp: Date.now(),
    players: playerList
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}, 50);

wss.on('connection', (ws) => {
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  
  // Default Player State
  players.set(playerId, {
    id: playerId,
    name: 'Aventureiro',
    heroId: 'char_wolf_hunter_m',
    x: 320,
    y: 320,
    direction: 'south',
    isMoving: false,
    isSprinting: false,
    isMounted: false,
    activeDragonId: 'dragon_fly_zephyr'
  });

  // Welcome packet
  ws.send(JSON.stringify({
    type: 'INIT',
    playerId,
    message: 'Conectado à Ilha Lua Multiplayer!'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'PLAYER_UPDATE') {
        const player = players.get(playerId);
        if (player) {
          player.x = data.x ?? player.x;
          player.y = data.y ?? player.y;
          player.direction = data.direction ?? player.direction;
          player.isMoving = !!data.isMoving;
          player.isSprinting = !!data.isSprinting;
          player.isMounted = !!data.isMounted;
          player.heroId = data.heroId || player.heroId;
          player.name = data.name || player.name;
          player.activeDragonId = data.activeDragonId || player.activeDragonId;
        }
      } else if (data.type === 'CHAT_MESSAGE') {
        // Broadcast speech bubble to all connected players
        const broadcastMsg = JSON.stringify({
          type: 'CHAT_BROADCAST',
          senderId: playerId,
          senderName: data.senderName || 'Jogador',
          text: data.text,
          x: data.x,
          y: data.y,
          timestamp: Date.now()
        });

        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMsg);
          }
        }
      }
    } catch (err) {
      console.error('Error processing network packet:', err);
    }
  });

  ws.on('close', () => {
    players.delete(playerId);
    // Broadcast player disconnect
    const disconnectMsg = JSON.stringify({
      type: 'PLAYER_DISCONNECT',
      playerId
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(disconnectMsg);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Universo MMORPG WebSocket Server rodando na porta ${PORT}`);
});
