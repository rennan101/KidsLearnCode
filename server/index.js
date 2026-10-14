/**
 * server/index.js
 * Servidor Dedicado KidsLearnCode - MMORPG + Auth + REST API + Admin GUI
 * Executa nativamente no Mac mini Intel (macOS Sequoia)
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { Database } from './db.js';
import { Mailer } from './mailer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'kidslearn_super_secret_jwt_key_2026';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const db = new Database({
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'kidslearncode',
  DB_USER: process.env.DB_USER || 'kidsadmin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'kidslearn_seguro_local'
});

const mailer = new Mailer({
  SMTP_ENABLED: process.env.SMTP_ENABLED,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  PUBLIC_URL
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Servir arquivos estáticos do Admin GUI
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Map de jogadores conectados via WebSocket
const activePlayers = new Map();
const startTime = Date.now();

// Middleware de Autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
}

app.use(authenticateToken);

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO (Auth)
// ==========================================

// Cadastro de novo usuário
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, nickname, isOver18, parentEmail } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'E-mail inválido ou senha com menos de 6 caracteres.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanNickname = (nickname || 'Aventureiro').trim();
  const isMinor = isOver18 === false;

  try {
    const existing = await db.query('SELECT id FROM auth_users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado na Ilha Lua!' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const confirmationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Inserção do usuário
    const userRes = await db.query(
      `INSERT INTO auth_users (email, password_hash, email_confirmed, confirmation_token, confirmation_token_expires_at, is_minor, parent_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, email_confirmed, role, created_at`,
      [cleanEmail, passwordHash, !mailer.enabled, confirmationToken, tokenExpires, isMinor, parentEmail || null]
    );

    const newUser = userRes.rows[0];

    // Criação do perfil inicial
    await db.query(
      `INSERT INTO profiles (id, nickname, hero_id, level, xp, gold)
       VALUES ($1, $2, 'char_wolf_hunter_m', 1, 0, 100)`,
      [newUser.id, cleanNickname]
    );

    // Se SMTP estiver desativado, conta já nasce ativa
    if (!mailer.enabled) {
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        user: newUser,
        token,
        requiresConfirmation: false,
        message: 'Conta criada com sucesso!'
      });
    }

    // Dispara e-mail de ativação via SMTP
    await mailer.sendConfirmationEmail({
      email: cleanEmail,
      token: confirmationToken,
      nickname: cleanNickname,
      isMinor,
      parentEmail
    });

    res.json({
      success: true,
      user: newUser,
      requiresConfirmation: true,
      message: isMinor 
        ? `Enviamos a autorização para o responsável em ${parentEmail}. Liberem o acesso clicando no link!`
        : `Enviamos um e-mail de confirmação para ${cleanEmail}. Confirme para entrar!`
    });
  } catch (err) {
    console.error('[API Auth] Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
  }
});

// Login
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const userRes = await db.query('SELECT * FROM auth_users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (!user.email_confirmed) {
      return res.status(403).json({
        error: 'Este e-mail ainda não foi confirmado. Acesse sua caixa de entrada ou contate o administrador.'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Busca dados de perfil
    const profRes = await db.query('SELECT * FROM profiles WHERE id = $1', [user.id]);
    const profile = profRes.rows[0] || null;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (err) {
    console.error('[API Auth] Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Confirmação de E-mail via link GET
app.get('/api/auth/confirm-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token inválido.');

  try {
    const userRes = await db.query(
      'SELECT id, email FROM auth_users WHERE confirmation_token = $1 AND confirmation_token_expires_at > NOW()',
      [token]
    );

    if (userRes.rows.length === 0) {
      return res.send(`
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8f8f0; color: #794f27;">
          <h2>❌ Link expirado ou inválido</h2>
          <p>O token de confirmação já foi utilizado ou expirou.</p>
        </body>
      `);
    }

    const user = userRes.rows[0];
    await db.query(
      'UPDATE auth_users SET email_confirmed = TRUE, confirmation_token = NULL WHERE id = $1',
      [user.id]
    );

    res.send(`
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8f8f0; color: #794f27;">
        <div style="max-width: 500px; margin: 0 auto; background: #fdfbf7; border: 2px solid #7a583e; border-radius: 20px; padding: 30px; box-shadow: 0 4px 0 #5c3c26;">
          <h2>🎉 Conta Confirmada com Sucesso!</h2>
          <p>Sua jornada na Ilha Lua está liberada. Você já pode retornar ao jogo e fazer login!</p>
        </div>
      </body>
    `);
  } catch (err) {
    res.status(500).send('Erro ao confirmar e-mail.');
  }
});

// Solicitar Redefinição de Senha
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Informe seu e-mail.' });

  const cleanEmail = email.toLowerCase().trim();

  try {
    const userRes = await db.query('SELECT id, email FROM auth_users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userRes.rows.length === 0) {
      // Retorna sucesso por segurança para evitar enumeração de emails
      return res.json({ success: true, message: 'Se o e-mail existir, você receberá o link de recuperação.' });
    }

    const user = userRes.rows[0];
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await db.query(
      'UPDATE auth_users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
      [resetToken, expires, user.id]
    );

    const prof = await db.query('SELECT nickname FROM profiles WHERE id = $1', [user.id]);
    const nickname = prof.rows[0]?.nickname || 'Aventureiro';

    await mailer.sendPasswordResetEmail({ email: cleanEmail, token: resetToken, nickname });

    res.json({ success: true, message: 'Instruções de recuperação foram enviadas ao seu e-mail!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar recuperação de senha.' });
  }
});

// Atualizar Senha (com usuário autenticado ou via token)
app.post('/api/auth/update-password', async (req, res) => {
  const { newPassword, token } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    let userId = req.user?.id;

    // Se veio token de recuperação
    if (!userId && token) {
      const userRes = await db.query(
        'SELECT id FROM auth_users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
        [token]
      );
      if (userRes.rows.length === 0) {
        return res.status(400).json({ error: 'Token de recuperação expirado ou inválido.' });
      }
      userId = userRes.rows[0].id;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado para alterar a senha.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE auth_users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    res.json({ success: true, message: 'Sua senha foi redefinida com sucesso!' });
  } catch (err) {
    console.error('[API Auth] Erro ao atualizar senha:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  }
});

// ==========================================
// 2. ROTAS DE DADOS DO JOGO (Profiles & Saves)
// ==========================================

// Obter / Salvar Perfil do Jogador
app.get('/api/profiles/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

  try {
    const data = await db.query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
    res.json(data.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profiles/sync', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  const { nickname, heroId, x, y, level, xp, gold } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO profiles (id, nickname, hero_id, x, y, level, xp, gold, last_online)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         nickname = COALESCE($2, profiles.nickname),
         hero_id = COALESCE($3, profiles.hero_id),
         x = COALESCE($4, profiles.x),
         y = COALESCE($5, profiles.y),
         level = COALESCE($6, profiles.level),
         xp = COALESCE($7, profiles.xp),
         gold = COALESCE($8, profiles.gold),
         last_online = NOW()
       RETURNING *`,
      [req.user.id, nickname, heroId, x || 320, y || 320, level || 1, xp || 0, gold || 100]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salvar / Carregar Game Save Unificado
app.post('/api/saves', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  const { map, player, inventory, dragons, codingProgress } = req.body;

  try {
    await db.query(
      `INSERT INTO game_saves (user_id, map_data, player_data, inventory_data, dragons_data, coding_progress, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         map_data = EXCLUDED.map_data,
         player_data = EXCLUDED.player_data,
         inventory_data = EXCLUDED.inventory_data,
         dragons_data = EXCLUDED.dragons_data,
         coding_progress = EXCLUDED.coding_progress,
         updated_at = NOW()`,
      [req.user.id, map || {}, player || {}, inventory || {}, dragons || {}, codingProgress || {}]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/saves/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

  try {
    const result = await db.query('SELECT * FROM game_saves WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.json(null);

    const row = result.rows[0];
    res.json({
      id: row.id,
      map: row.map_data,
      player: row.player_data,
      inventory: row.inventory_data,
      dragons: row.dragons_data,
      codingProgress: row.coding_progress,
      savedAt: new Date(row.updated_at).getTime()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mapa Global Compartilhado Mais Recente
app.get('/api/world/global-map', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT map_data, updated_at FROM game_saves 
       WHERE map_data IS NOT NULL AND map_data::text != '{}' 
       ORDER BY updated_at DESC LIMIT 1`
    );

    if (result.rows.length === 0) return res.json(null);

    res.json({
      map: result.rows[0].map_data,
      updatedAt: new Date(result.rows[0].updated_at).getTime()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ROTAS DO PAINEL ADMINISTRATIVO (GUI)
// ==========================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    const usersCountRes = await db.query('SELECT count(*) FROM profiles');
    const uptimeMinutes = Math.floor((Date.now() - startTime) / 60000);
    const mem = process.memoryUsage();
    const ramMB = Math.round(mem.rss / 1024 / 1024);

    res.json({
      success: true,
      playersOnline: activePlayers.size,
      profilesCount: parseInt(usersCountRes.rows[0]?.count || '0', 10),
      memoryUsage: `${ramMB} MB`,
      uptime: `${uptimeMinutes} min`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.nickname, p.hero_id, p.x, p.y,
              COALESCE((s.coding_progress->>'playerXP')::int / 200 + 1, p.level) AS level,
              COALESCE((s.coding_progress->>'playerGold')::int, p.gold) AS gold,
              COALESCE((s.coding_progress->>'playerXP')::int, p.xp) AS xp,
              p.last_online,
              u.email, u.email_confirmed, u.is_minor, u.role
       FROM profiles p
       JOIN auth_users u ON u.id = p.id
       LEFT JOIN game_saves s ON s.user_id = p.id
       ORDER BY p.last_online DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/saves', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.user_id, s.updated_at, p.nickname
       FROM game_saves s
       LEFT JOIN profiles p ON p.id = s.user_id
       ORDER BY s.updated_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query vazia' });

  try {
    const result = await db.query(query);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/confirm-user', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE auth_users SET email_confirmed = TRUE, confirmation_token = NULL WHERE id = $1', [id]);
    res.json({ success: true, message: 'Conta ativada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/import-supabase', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, 'db/migrations/supabase_migration.sql');
    if (!fs.existsSync(sqlPath)) {
      return res.status(404).json({ error: 'Arquivo de migração não encontrado.' });
    }
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await db.query(sql);
    res.json({ success: true, message: 'Dados do Supabase reimportados com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. REALTIME MMORPG WEBSOCKET ENGINE (20Hz)
// ==========================================

setInterval(() => {
  if (activePlayers.size === 0) return;

  const playerList = Array.from(activePlayers.values()).map(p => ({
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
}, 50); // 20Hz (50ms)

wss.on('connection', (ws) => {
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);

  activePlayers.set(playerId, {
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

  ws.send(JSON.stringify({
    type: 'INIT',
    playerId,
    message: 'Conectado ao Servidor Nativo Mac mini (KidsLearnCode)!'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'PLAYER_UPDATE') {
        const p = activePlayers.get(playerId);
        if (p) {
          p.x = data.x ?? p.x;
          p.y = data.y ?? p.y;
          p.direction = data.direction ?? p.direction;
          p.isMoving = !!data.isMoving;
          p.isSprinting = !!data.isSprinting;
          p.isMounted = !!data.isMounted;
          p.heroId = data.heroId || p.heroId;
          p.name = data.name || p.name;
          p.activeDragonId = data.activeDragonId || p.activeDragonId;
        }
      } else if (data.type === 'CHAT_MESSAGE') {
        const broadcast = JSON.stringify({
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
            client.send(broadcast);
          }
        }
      } else if (data.type === 'MAP_UPDATE') {
        // Broadcast de edição de mapa no modo criativo
        const broadcast = JSON.stringify({
          type: 'MAP_BROADCAST',
          mapData: data.mapData,
          senderId: playerId,
          timestamp: Date.now()
        });

        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcast);
          }
        }
      }
    } catch (err) {
      console.error('[WebSocket] Erro ao processar pacote:', err.message);
    }
  });

  ws.on('close', () => {
    activePlayers.delete(playerId);
    const disconnectMsg = JSON.stringify({ type: 'PLAYER_DISCONNECT', playerId });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(disconnectMsg);
      }
    }
  });
});

// Iniciar Servidor
server.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🏰 KidsLearnCode Servidor MMORPG & Database Online!`);
  console.log(`📡 Porta: ${PORT} | WebSocket: 20Hz Ativo`);
  console.log(`🖥️  Painel Administrativo GUI: ${PUBLIC_URL}/admin`);
  console.log('========================================================');
});
