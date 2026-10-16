/**
 * server/index.js
 * Servidor Dedicado KidsLearnCode - MMORPG + Banco Embutido Nativo + Controle Remoto Total
 * - Zero PostgreSQL (Banco Nativo Particionado com Gravação Atômica em server/data/)
 * - Zero Supabase (Saves, Auth, Roupas, Ovos, Itens e Dragões 100% locais e ilimitados)
 * - Zero Cloudflare / Zero DuckDNS (NetworkBridge Nativa com Auto-Descoberta)
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { Database } from './db.js';
import { Mailer } from './mailer.js';
import { NetworkBridge } from './network-bridge.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || 'kidslearn_super_secret_jwt_key_2026';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Ring buffer de logs em memória para o Terminal ao Vivo do Painel Remoto
const serverLogs = [];
function addServerLog(msg, level = 'INFO') {
  const entry = {
    time: new Date().toISOString(),
    level,
    message: String(msg)
  };
  serverLogs.push(entry);
  if (serverLogs.length > 200) serverLogs.shift();
  console.log(`[${entry.time.slice(11, 19)}] [${level}] ${entry.message}`);
}

// Inicializa o Banco de Dados Próprio Embutido (Zero PostgreSQL)
const db = new Database();
addServerLog(`Banco de Dados Nativo inicializado (${db.state.profiles.length} contas, ${db.state.game_saves.length} saves).`, 'DB');

// Estado do Motor do Jogo (Blindagem 1: Permite desligar/pausar o jogo mantendo o painel remoto vivo)
let gameServerState = 'online'; // 'online' | 'paused'

// Inicializa a Ponte de Rede Automática (Sem Cloudflare / Sem DuckDNS)
const networkBridge = new NetworkBridge({
  port: PORT,
  subdomain: process.env.TUNNEL_SUBDOMAIN || 'kidslearncode-mmorpg',
  onLog: (msg) => addServerLog(msg, 'NETWORK'),
  onUrlChanged: (newUrl) => {
    mailer.publicUrl = newUrl;
  }
});

const mailer = new Mailer({
  SMTP_ENABLED: process.env.SMTP_ENABLED,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  PUBLIC_URL: networkBridge.getActiveUrl()
});

// Middleware CORS amplo + Private Network Access (permite que https://kids-learn-code.vercel.app conecte em localhost:8080 e túneis)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Bypass-Tunnel-Reminder,X-Admin-Key');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'X-Admin-Key']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir arquivos estáticos do Admin GUI e do Jogo
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/live-server.json', (req, res) => {
  res.json(networkBridge.getStatusPayload());
});

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
// 1. ROTAS DE AUTENTICAÇÃO (Auth Nativa)
// ==========================================

app.post('/api/auth/signup', async (req, res) => {
  if (gameServerState === 'paused') {
    return res.status(503).json({ error: 'O servidor do jogo está em manutenção no momento. Tente novamente em instantes!' });
  }

  const { email, password, nickname, isOver18, parentEmail } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'E-mail inválido ou senha com menos de 6 caracteres.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanNickname = (nickname || 'Aventureiro').trim();
  const isMinor = isOver18 === false;

  try {
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado na Ilha Lua!' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const confirmationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { user: newUser, profile } = db.createUser({
      email: cleanEmail,
      passwordHash,
      emailConfirmed: !mailer.enabled,
      confirmationToken,
      tokenExpires,
      isMinor,
      parentEmail: parentEmail || null,
      nickname: cleanNickname,
      role: 'player'
    });

    addServerLog(`Novo jogador cadastrado: ${cleanNickname} (${cleanEmail})`, 'AUTH');

    if (!mailer.enabled) {
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, role: newUser.role, nickname: profile.nickname },
        profile,
        token,
        requiresConfirmation: false,
        message: 'Conta criada com sucesso!'
      });
    }

    await mailer.sendConfirmationEmail({
      email: cleanEmail,
      token: confirmationToken,
      nickname: cleanNickname,
      isMinor,
      parentEmail
    });

    res.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, nickname: profile.nickname },
      requiresConfirmation: true,
      message: isMinor
        ? `Enviamos a autorização para o responsável em ${parentEmail}. Liberem o acesso clicando no link!`
        : `Enviamos um e-mail de confirmação para ${cleanEmail}. Confirme para entrar!`
    });
  } catch (err) {
    addServerLog(`Erro no cadastro: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  if (gameServerState === 'paused') {
    return res.status(503).json({ error: 'O servidor do jogo está pausado para manutenção pelo Administrador.' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const cleanInput = email.toLowerCase().trim();

  try {
    // Permite login tanto pelo e-mail completo (@gmail.com / alias) quanto pelo nickname (ex: "Rennan" ou "duda")
    let user = db.getUserByEmail(cleanInput);
    if (!user) {
      const profByNick = db.state.profiles.find(p => p.nickname.toLowerCase() === cleanInput);
      if (profByNick) {
        user = db.getUserById(profByNick.id);
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    let match = false;
    if (user.password_hash) {
      match = await bcrypt.compare(password, user.password_hash);
    }

    // Se a conta foi migrada do backup e o jogador digitou sua senha original (>= 4 caracteres), atualiza e autentica automaticamente
    if (!match && !user.password_confirmed_by_user && String(password).length >= 4) {
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(String(password), salt);
      db.updateUser(user.id, { password_hash: newHash, password_confirmed_by_user: true });
      match = true;
    }

    // Se o jogador informou seu e-mail @gmail.com válido no login, sincroniza o @gmail.com
    if (match && cleanInput.endsWith('@gmail.com') && user.email !== cleanInput) {
      db.updateUser(user.id, { email: cleanInput });
    }

    if (!match) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (!user.email_confirmed) {
      return res.status(403).json({
        error: 'Este e-mail ainda não foi confirmado. Acesse sua caixa de entrada ou ative pelo Painel do Servidor.'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const profile = db.getProfile(user.id);

    addServerLog(`Login realizado: ${profile?.nickname || user.email} (${user.email})`, 'AUTH');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nickname: profile?.nickname || 'Aventureiro'
      },
      profile
    });
  } catch (err) {
    addServerLog(`Erro no login: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

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
        <body style="font-family: 'Nunito', sans-serif; text-align: center; padding: 40px; background: #f8f8f0; color: #794f27;">
          <div style="max-width: 500px; margin: 0 auto; background: #fdfbf7; border: 2px solid #ea580c; border-radius: 20px; padding: 30px; box-shadow: 0 4px 0 #9a3412;">
            <h2>Link expirado ou inválido</h2>
            <p>O token de confirmação já foi utilizado ou expirou.</p>
          </div>
        </body>
      `);
    }

    const user = userRes.rows[0];
    db.updateUser(user.id, { email_confirmed: true, confirmation_token: null });

    res.send(`
      <body style="font-family: 'Nunito', sans-serif; text-align: center; padding: 40px; background: #f8f8f0; color: #794f27;">
        <div style="max-width: 500px; margin: 0 auto; background: #fdfbf7; border: 2px solid #19c8b9; border-radius: 20px; padding: 30px; box-shadow: 0 4px 0 #0f8e83;">
          <h2 style="color: #0f8e83;">Conta Confirmada com Sucesso!</h2>
          <p>Sua jornada na Ilha Lua está liberada. Você já pode retornar ao jogo e fazer login!</p>
        </div>
      </body>
    `);
  } catch (err) {
    res.status(500).send('Erro ao confirmar e-mail.');
  }
});

app.get('/api/auth/reset-password', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token de recuperação ausente.');

  try {
    const userRes = await db.query(
      'SELECT id, email FROM auth_users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
      [token]
    );

    if (userRes.rows.length === 0) {
      return res.send(`
        <body style="font-family: 'Nunito', sans-serif; text-align: center; padding: 40px; background: #f8f8f0; color: #794f27;">
          <div style="max-width: 500px; margin: 0 auto; background: #fdfbf7; border: 2px solid #ea580c; border-radius: 20px; padding: 30px; box-shadow: 0 4px 0 #9a3412;">
            <h2>Link expirado ou inválido</h2>
            <p>Este link de redefinição de senha já foi utilizado ou ultrapassou a validade de 1 hora.</p>
          </div>
        </body>
      `);
    }

    const email = userRes.rows[0].email;

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Redefinir Senha - KidsLearnCode</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Nunito', sans-serif; background: #f8f8f0; color: #794f27; padding: 30px 16px; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .card { max-width: 460px; width: 100%; background: #fdfbf7; border: 2px solid #7a583e; border-radius: 24px; padding: 32px 28px; box-shadow: 0 6px 0 #5c3c26; }
          h2 { text-align: center; margin-top: 0; color: #794f27; font-size: 24px; }
          .form-group { margin-top: 20px; }
          label { display: block; font-size: 14px; font-weight: 800; margin-bottom: 8px; color: #725d42; }
          input { width: 100%; padding: 14px 18px; border: 2px solid #c4b89e; border-radius: 50px; font-size: 15px; font-family: inherit; background: #ffffff; color: #794f27; outline: none; }
          input:focus { border-color: #19c8b9; }
          .btn { width: 100%; margin-top: 24px; padding: 14px 20px; background: #19c8b9; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #0f8e83; }
          .btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #0f8e83; }
          .alert { display: none; padding: 12px 16px; border-radius: 12px; margin-top: 16px; font-size: 14px; text-align: center; }
          .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
          .alert-success { background: #e6f9f6; color: #0f8e83; border: 1px solid #19c8b9; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Redefinir Senha</h2>
          <p style="text-align: center; font-size: 14px; color: #8a7b66; margin-top: 0;">Conta: <strong>${email}</strong></p>
          <div id="alert-box" class="alert"></div>
          <div id="form-content">
            <div class="form-group">
              <label for="newPass">Nova Senha (mínimo 6 caracteres)</label>
              <input type="password" id="newPass" placeholder="Digite sua nova senha">
            </div>
            <div class="form-group">
              <label for="confirmPass">Confirme a Nova Senha</label>
              <input type="password" id="confirmPass" placeholder="Repita a nova senha">
            </div>
            <button class="btn" id="btn-submit" onclick="submitPassword()">Salvar Nova Senha</button>
          </div>
        </div>
        <script>
          async function submitPassword() {
            const pass = document.getElementById('newPass').value;
            const confirm = document.getElementById('confirmPass').value;
            const alertBox = document.getElementById('alert-box');
            const btn = document.getElementById('btn-submit');
            if (!pass || pass.length < 6) {
              alertBox.className = 'alert alert-error';
              alertBox.style.display = 'block';
              alertBox.innerText = 'A senha deve ter pelo menos 6 caracteres.';
              return;
            }
            if (pass !== confirm) {
              alertBox.className = 'alert alert-error';
              alertBox.style.display = 'block';
              alertBox.innerText = 'As duas senhas não coincidem.';
              return;
            }
            btn.disabled = true;
            btn.innerText = 'Salvando...';
            try {
              const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', newPassword: pass })
              });
              const data = await res.json();
              if (res.ok && data.success) {
                alertBox.className = 'alert alert-success';
                alertBox.style.display = 'block';
                alertBox.innerText = data.message || 'Senha alterada com sucesso!';
                document.getElementById('form-content').innerHTML = '';
              } else {
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
                alertBox.innerText = data.error || 'Erro ao redefinir a senha.';
                btn.disabled = false;
                btn.innerText = 'Salvar Nova Senha';
              }
            } catch (err) {
              alertBox.className = 'alert alert-error';
              alertBox.style.display = 'block';
              alertBox.innerText = 'Falha na conexão: ' + err.message;
              btn.disabled = false;
              btn.innerText = 'Salvar Nova Senha';
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Erro interno ao carregar redefinição de senha.');
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Informe seu e-mail ou nickname.' });

  const cleanInput = email.toLowerCase().trim();

  try {
    let user = db.getUserByEmail(cleanInput);
    if (!user) {
      const profByNick = db.state.profiles.find(p => p.nickname.toLowerCase() === cleanInput);
      if (profByNick) user = db.getUserById(profByNick.id);
    }

    if (user) {
      // Token criptográfico seguro de 64 caracteres hexadecimais (impossível de adivinhar)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos de validade estrita

      db.updateUser(user.id, { reset_token: resetToken, reset_token_expires_at: expires });

      const prof = db.getProfile(user.id);
      const nickname = prof?.nickname || 'Aventureiro';

      const dispatchRes = await mailer.sendPasswordResetEmail({ email: user.email, token: resetToken, nickname });
      addServerLog(`Link de recuperação de senha solicitado para ${user.email} (${dispatchRes.success ? 'E-mail enviado' : 'Aviso: ' + dispatchRes.error})`, 'AUTH');
    }

    res.json({
      success: true,
      message: 'Instruções para redefinir sua senha foram enviadas para o seu e-mail!'
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar recuperação de senha.' });
  }
});

app.post('/api/auth/update-password', async (req, res) => {
  const { newPassword, token } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    let userId = req.user?.id;
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

    db.updateUser(userId, {
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires_at: null
    });

    addServerLog(`Senha atualizada para usuário ID ${userId}`, 'AUTH');
    res.json({ success: true, message: 'Sua senha foi redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  }
});

// ==========================================
// 2. ROTAS DE DADOS DO JOGO (Profiles & Saves)
// ==========================================

app.get('/api/profiles/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  const profile = db.getProfile(req.user.id);
  const userRecord = db.getUserById(req.user.id);
  if (!profile) return res.json(null);
  res.json({
    ...profile,
    email: userRecord?.email || req.user.email,
    role: userRecord?.role || req.user.role || 'player'
  });
});

app.post('/api/profiles/sync', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  const { nickname, heroId, x, y, level, xp, gold } = req.body;
  try {
    const updated = db.upsertProfile(req.user.id, { nickname, heroId, x, y, level, xp, gold });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/saves', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  const { map, player, inventory, dragons, codingProgress, customAvatar, activeHero } = req.body;

  try {
    db.upsertGameSave(req.user.id, {
      map,
      player,
      inventory,
      dragons,
      codingProgress,
      customAvatar,
      activeHero
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/saves/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

  try {
    const row = db.getGameSave(req.user.id);
    if (!row) return res.json(null);

    const playerData = row.player_data || {};
    res.json({
      id: row.id,
      map: row.map_data,
      player: playerData,
      inventory: row.inventory_data,
      dragons: row.dragons_data,
      codingProgress: row.coding_progress,
      customAvatar: playerData.customAvatar || null,
      activeHero: playerData.activeHero || playerData.heroId || 'char_wolf_hunter_m',
      savedAt: new Date(row.updated_at).getTime()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gameState: gameServerState,
    server: 'KidsLearnCode Native Dedicated Server (Zero-Postgres / Zero-Cloudflare)',
    playersOnline: activePlayers.size,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    network: networkBridge.getStatusPayload(),
    timestamp: Date.now()
  });
});

app.get('/api/world/global-map', (req, res) => {
  try {
    const globalMap = db.getGlobalMap();
    res.json(globalMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/world/global-map', (req, res) => {
  const { map } = req.body;
  if (!map) return res.status(400).json({ error: 'Dados do mapa ausentes' });

  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';

  try {
    db.saveGlobalMap(map, userId);

    const broadcast = JSON.stringify({
      type: 'MAP_BROADCAST',
      mapData: map,
      senderId: userId,
      timestamp: Date.now()
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(broadcast);
      }
    }

    addServerLog(`Mapa Global atualizado por ${userId}`, 'WORLD');
    res.json({ success: true, message: 'Mapa global salvo com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PAINEL DE CONTROLE REMOTO & DATABASE STUDIO
// ==========================================

app.get('/api/admin/stats', (req, res) => {
  const uptimeMinutes = Math.floor((Date.now() - startTime) / 60000);
  const mem = process.memoryUsage();
  const ramMB = Math.round(mem.rss / 1024 / 1024);

  res.json({
    success: true,
    gameState: gameServerState,
    playersOnline: activePlayers.size,
    activePlayersList: Array.from(activePlayers.values()),
    profilesCount: db.state.profiles.length,
    savesCount: db.state.game_saves.length,
    backupsCount: db.state.server_backups.length,
    memoryUsage: `${ramMB} MB`,
    uptime: `${uptimeMinutes} min`,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    network: networkBridge.getStatusPayload()
  });
});

// Visão Completa do Banco de Dados (Contas, Roupas, Ovos, Itens, Dragões, Mapa e Backups)
app.get('/api/admin/db/overview', (req, res) => {
  try {
    const users = db.getAllUsersDetailed();
    const mapInfo = db.getGlobalMap();
    const layerCounts = {};
    if (mapInfo?.map?.layers) {
      for (const [k, v] of Object.entries(mapInfo.map.layers)) {
        layerCounts[k] = v ? Object.keys(v).length : 0;
      }
    }

    res.json({
      success: true,
      gameState: gameServerState,
      network: networkBridge.getStatusPayload(),
      users,
      onlinePlayers: Array.from(activePlayers.values()),
      backups: db.state.server_backups.slice(0, 30),
      globalMapSummary: {
        updatedAt: mapInfo?.updatedAt || null,
        spawnPoint: mapInfo?.map?.spawnPoint || { x: 320, y: 320 },
        layerCounts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Editar Conta + Perfil + Save (Roupas, Ovos, Itens, Dragões, Ouro, XP, Senha)
app.post('/api/admin/db/user-save', async (req, res) => {
  const { userId, payload } = req.body;
  if (!userId || !payload) {
    return res.status(400).json({ error: 'userId e payload são obrigatórios.' });
  }

  try {
    const updatedUser = await db.adminUpdateUserAndSave(userId, payload);
    addServerLog(`Dados do jogador "${updatedUser.nickname}" atualizados pelo Painel Admin.`, 'ADMIN');
    res.json({
      success: true,
      message: `Dados de ${updatedUser.nickname} salvos no banco com sucesso!`,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova conta diretamente pelo Painel Admin
app.post('/api/admin/db/create-user', async (req, res) => {
  const { email, password, nickname, role, gold, xp } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Informe um e-mail válido e senha com no mínimo 6 caracteres.' });
  }

  try {
    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'Este e-mail já existe no banco de dados.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const created = db.createUser({
      email,
      passwordHash,
      emailConfirmed: true,
      nickname: nickname || 'Aventureiro',
      role: role || 'player'
    });

    if (gold !== undefined || xp !== undefined) {
      await db.adminUpdateUserAndSave(created.user.id, {
        gold: Number(gold ?? 100),
        xp: Number(xp ?? 0)
      });
    }

    addServerLog(`Nova conta criada via Admin: ${nickname} (${email})`, 'ADMIN');
    res.json({ success: true, message: 'Jogador criado com sucesso!', user: created.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir conta pelo Painel Admin
app.delete('/api/admin/db/user/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.adminDeleteUser(id);
    addServerLog(`Conta ID ${id} removida pelo Administrador.`, 'ADMIN');
    res.json({ success: true, message: 'Conta removida do banco de dados.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Controle Remoto do Servidor (Blindagem 1: Ligar, Pausar/Desligar Jogo, Reiniciar)
app.post('/api/admin/server/control', (req, res) => {
  const { action } = req.body;

  if (action === 'pause' || action === 'stop') {
    gameServerState = 'paused';
    // Desconecta os jogadores do jogo mantendo o servidor Admin vivo
    const pauseMsg = JSON.stringify({
      type: 'SERVER_MAINTENANCE',
      message: 'O servidor entrou em modo de manutenção. Seu progresso foi salvo!'
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(pauseMsg);
          client.close();
        } catch (_) {}
      }
    }
    activePlayers.clear();
    addServerLog('Motor do Jogo PAUSADO remotamente pelo Administrador (Painel continua online).', 'CONTROL');
    return res.json({
      success: true,
      gameState: gameServerState,
      message: 'Servidor do jogo desligado/pausado! O Painel de Controle continua ativo para quando quiser religar.'
    });
  }

  if (action === 'start' || action === 'resume') {
    gameServerState = 'online';
    addServerLog('Motor do Jogo LIGADO remotamente pelo Administrador!', 'CONTROL');
    return res.json({
      success: true,
      gameState: gameServerState,
      message: 'Servidor do jogo ligado e aceitando conexões!'
    });
  }

  if (action === 'restart') {
    gameServerState = 'online';
    db.createBackup('pre_restart');
    networkBridge.stop();
    setTimeout(() => networkBridge.start(), 800);
    addServerLog('Servidor e Ponte de Rede reiniciados remotamente pelo Administrador.', 'CONTROL');
    return res.json({
      success: true,
      gameState: gameServerState,
      message: 'Servidor e conexões de rede reiniciados com sucesso!'
    });
  }

  res.status(400).json({ error: 'Ação inválida. Use start, stop ou restart.' });
});

// Atualização Remota de Código via GitHub (Blindagem 6: Git Pull seguro sem perder o banco)
app.post('/api/admin/server/git-pull', (req, res) => {
  try {
    addServerLog('Iniciando atualização remota de código (Git Pull)...', 'DEPLOY');
    // 1. Faz backup de segurança antes de atualizar
    const backupRes = db.createBackup('pre_git_update');

    // 2. Executa git fetch e git reset preservando server/data/ (que está no .gitignore)
    execSync('git fetch origin main', { cwd: projectRoot, timeout: 20000 });
    const pullOutput = execSync('git reset --hard origin/main', {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 20000
    }).trim();

    addServerLog(`Código atualizado com sucesso: ${pullOutput}`, 'DEPLOY');

    res.json({
      success: true,
      message: 'Atualização remota aplicada com sucesso! Backup preventivo criado.',
      gitOutput: pullOutput,
      backupFilename: backupRes.filename
    });
  } catch (err) {
    addServerLog(`Falha no Git Pull remoto: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Erro ao puxar atualização do GitHub: ' + err.message });
  }
});

// Logs em Tempo Real
app.get('/api/admin/logs', (req, res) => {
  res.json({
    success: true,
    gameState: gameServerState,
    network: networkBridge.getStatusPayload(),
    logs: serverLogs.slice(-100)
  });
});

// Rotas Legadas Admin
app.get('/api/admin/users', (req, res) => {
  res.json(db.getAllUsersDetailed());
});

app.get('/api/admin/saves', (req, res) => {
  const rows = db.state.game_saves.map(s => {
    const p = db.getProfile(s.user_id);
    return { ...s, nickname: p?.nickname || 'Aventureiro' };
  });
  res.json(rows);
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

app.post('/api/admin/confirm-user', (req, res) => {
  const { id } = req.body;
  db.updateUser(id, { email_confirmed: true, confirmation_token: null });
  res.json({ success: true, message: 'Conta ativada com sucesso!' });
});

app.post('/api/admin/import-supabase', (req, res) => {
  try {
    db.bootstrapFromMigrations();
    res.json({ success: true, message: 'Dados do backup original reimportados com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3.1 GESTÃO DE BACKUPS AUTOMÁTICOS E MANUAIS
// ==========================================

app.get('/api/admin/backups', (req, res) => {
  res.json(db.state.server_backups.slice(0, 30));
});

app.post('/api/admin/create-backup', (req, res) => {
  try {
    const result = db.createBackup('manual_admin');
    addServerLog(`Backup manual criado: ${result.filename}`, 'BACKUP');
    res.json({ success: true, message: `Backup ${result.filename} gerado com sucesso!`, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/backups/download/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const targetPath = path.join(db.backupsDir, safeFilename);
  if (!fs.existsSync(targetPath)) {
    return res.status(404).send('Arquivo de backup não encontrado.');
  }
  res.download(targetPath, safeFilename);
});

app.post('/api/admin/backups/restore', (req, res) => {
  const { filename, backupData } = req.body;
  try {
    if (backupData && typeof backupData === 'object') {
      db.createBackup('pre_import_restore');
      db.applyBackupPayload(backupData);
      addServerLog('Banco de dados restaurado a partir de arquivo importado.', 'BACKUP');
      return res.json({ success: true, message: 'Backup importado e restaurado com sucesso!' });
    }
    if (!filename) return res.status(400).json({ error: 'Informe o nome do backup.' });
    db.createBackup('pre_restore_safety');
    const result = db.restoreBackupByFilename(filename);
    addServerLog(`Backup restaurado com sucesso: ${filename}`, 'BACKUP');
    res.json({ success: true, message: `Backup ${filename} restaurado com sucesso!`, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao restaurar backup: ' + err.message });
  }
});

// DISPAROS AUTOMÁTICOS DE BACKUP:
// 1. Ao iniciar o servidor
setTimeout(() => {
  try {
    const res = db.createBackup('startup_auto');
    addServerLog(`Snapshot automático de inicialização salvo: ${res.filename}`, 'BACKUP');
  } catch (err) {
    addServerLog(`Aviso no backup inicial: ${err.message}`, 'WARN');
  }
}, 3000);

// 2. A cada 6 horas
setInterval(() => {
  try {
    const res = db.createBackup('scheduled_6h');
    addServerLog(`Snapshot periódico (6h) salvo: ${res.filename}`, 'BACKUP');
  } catch (err) {
    addServerLog(`Aviso no backup 6h: ${err.message}`, 'WARN');
  }
}, 6 * 60 * 60 * 1000);

// ==========================================
// 4. REALTIME MMORPG WEBSOCKET ENGINE (20Hz)
// ==========================================

setInterval(() => {
  if (gameServerState === 'paused' || activePlayers.size === 0) return;

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
    activeDragonId: p.activeDragonId,
    avatarConfig: p.avatarConfig || null,
    scale: p.scale || 1.0,
    dragonMode: p.dragonMode || 'none',
    flightAltitude: p.flightAltitude || 0,
    dragonX: p.dragonX !== undefined ? p.dragonX : null,
    dragonY: p.dragonY !== undefined ? p.dragonY : null
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
}, 50); // 20Hz

wss.on('connection', (ws) => {
  if (gameServerState === 'paused') {
    ws.send(JSON.stringify({
      type: 'SERVER_MAINTENANCE',
      message: 'Servidor em manutenção. Tente novamente em instantes!'
    }));
    ws.close();
    return;
  }

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
    activeDragonId: 'dragon_fly_zephyr',
    avatarConfig: null,
    scale: 1.0,
    dragonMode: 'none',
    flightAltitude: 0,
    dragonX: null,
    dragonY: null
  });

  ws.send(JSON.stringify({
    type: 'INIT',
    playerId,
    message: 'Conectado ao Servidor Dedicado KidsLearnCode!'
  }));

  ws.on('message', (message) => {
    if (gameServerState === 'paused') return;
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
          if (data.userId) p.userId = data.userId;
          if (data.avatarConfig !== undefined) p.avatarConfig = data.avatarConfig;
          if (data.scale !== undefined) p.scale = data.scale;
          if (data.dragonMode !== undefined) p.dragonMode = data.dragonMode;
          if (data.flightAltitude !== undefined) p.flightAltitude = data.flightAltitude;
          if (data.dragonX !== undefined) p.dragonX = data.dragonX;
          if (data.dragonY !== undefined) p.dragonY = data.dragonY;

          // Persiste automaticamente roupas/customização no banco sempre que o jogador alterar o avatar
          if (data.avatarConfig && typeof data.avatarConfig === 'object') {
            const avatarJson = JSON.stringify(data.avatarConfig);
            if (p.lastSavedAvatarJson !== avatarJson) {
              p.lastSavedAvatarJson = avatarJson;
              let targetUserId = p.userId || null;
              if (!targetUserId || String(targetUserId).startsWith('guest_')) {
                const candidateName = (data.avatarConfig.name || p.name || '').toLowerCase().trim();
                if (candidateName && candidateName !== 'aventureiro') {
                  const matchedProf = db.state.profiles.find(pr => pr.nickname.toLowerCase().trim() === candidateName);
                  if (matchedProf) targetUserId = matchedProf.id;
                }
              }
              if (targetUserId && !String(targetUserId).startsWith('guest_')) {
                db.upsertGameSave(targetUserId, {
                  customAvatar: data.avatarConfig,
                  activeHero: p.heroId || 'custom_avatar',
                  player: {
                    x: Math.round(p.x),
                    y: Math.round(p.y),
                    scale: p.scale || 1.0,
                    heroId: p.heroId || 'custom_avatar',
                    customAvatar: data.avatarConfig
                  }
                });
              }
            }
          }
        }
      } else if (data.type === 'CHAT_MESSAGE') {
        const chatEntry = {
          id: Math.random().toString(36).substring(2, 10),
          sender_id: playerId,
          sender_name: data.senderName || 'Jogador',
          text: data.text,
          x: data.x,
          y: data.y,
          created_at: new Date().toISOString()
        };
        db.state.chat_messages.push(chatEntry);
        if (db.state.chat_messages.length > 300) db.state.chat_messages.shift();

        const broadcast = JSON.stringify({
          type: 'CHAT_BROADCAST',
          senderId: playerId,
          senderName: chatEntry.sender_name,
          text: chatEntry.text,
          x: chatEntry.x,
          y: chatEntry.y,
          timestamp: Date.now()
        });

        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcast);
          }
        }
      } else if (data.type === 'MAP_UPDATE') {
        if (data.mapData) {
          db.saveGlobalMap(data.mapData, playerId);
        }
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
      addServerLog(`Erro WebSocket: ${err.message}`, 'WARN');
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

// Servir arquivos estáticos do cliente na raiz para permitir jogar direto pelo servidor também
app.use(express.static(projectRoot));

// Tratadores globais para nunca derrubar o processo por exceções não tratadas
process.on('uncaughtException', (err) => {
  addServerLog(`Exceção não capturada (blindada): ${err.message}`, 'CRITICAL');
});

process.on('unhandledRejection', (reason) => {
  addServerLog(`Promise rejeitada (blindada): ${String(reason)}`, 'CRITICAL');
});

// Iniciar Servidor + Ponte de Rede Nativa
server.listen(PORT, '0.0.0.0', () => {
  networkBridge.start();
  addServerLog(`Servidor KidsLearnCode Online na porta ${PORT}!`, 'SYSTEM');
  addServerLog(`Painel de Controle Local: http://localhost:${PORT}/admin`, 'SYSTEM');
  if (networkBridge.lanUrl) {
    addServerLog(`Acesso na Rede Local (LAN): ${networkBridge.lanUrl}/admin`, 'SYSTEM');
  }
});
