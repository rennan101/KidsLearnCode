/**
 * server/db.js
 * Motor de Banco de Dados Próprio Embutido (Zero-PostgreSQL / Zero-Supabase)
 * - Armazenamento particionado no SSD interno (server/data/)
 * - Blindagem 3: Gravação Atômica (Write-Then-Rename + fsync) e Auto-Recovery no Boot
 * - Blindagem 4: Particionamento entre Dados de Jogadores (users_and_saves.json) e Mapa Global (global_world_map.json)
 * - Migração automática instantânea a partir de supabase_backup.json
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  constructor(config = {}) {
    this.dataDir = config.dataDir || path.join(__dirname, 'data');
    this.backupsDir = path.join(this.dataDir, 'backups');
    this.usersSavesFile = path.join(this.dataDir, 'users_and_saves.json');
    this.globalMapFile = path.join(this.dataDir, 'global_world_map.json');

    this.state = {
      version: '2.0-embedded',
      updatedAt: new Date().toISOString(),
      auth_users: [],
      profiles: [],
      game_saves: [],
      chat_messages: [],
      server_backups: [],
      deleted_user_ids: []
    };

    this.globalMap = {
      map_data: {},
      updated_at: new Date().toISOString(),
      updated_by: '00000000-0000-0000-0000-000000000001'
    };

    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }

    // 1. Carrega ou recupera users_and_saves.json
    let loadedUsers = false;
    if (fs.existsSync(this.usersSavesFile)) {
      try {
        const raw = fs.readFileSync(this.usersSavesFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.profiles)) {
          this.state = {
            version: parsed.version || '2.0-embedded',
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            auth_users: Array.isArray(parsed.auth_users) ? parsed.auth_users : [],
            profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
            game_saves: Array.isArray(parsed.game_saves) ? parsed.game_saves : [],
            chat_messages: Array.isArray(parsed.chat_messages) ? parsed.chat_messages : [],
            server_backups: Array.isArray(parsed.server_backups) ? parsed.server_backups : [],
            deleted_user_ids: Array.isArray(parsed.deleted_user_ids) ? parsed.deleted_user_ids : []
          };
          loadedUsers = true;
        }
      } catch (err) {
        console.error('[EmbeddedDB] Erro ao ler users_and_saves.json, acionando Auto-Recovery:', err.message);
        loadedUsers = this.tryAutoRecovery();
      }
    } else {
      // Se o arquivo principal não existir mas houver backups em server/data/backups/, recupera do backup mais recente
      loadedUsers = this.tryAutoRecovery();
    }

    // 2. Carrega global_world_map.json
    let loadedMap = false;
    if (fs.existsSync(this.globalMapFile)) {
      try {
        const rawMap = fs.readFileSync(this.globalMapFile, 'utf-8');
        const parsedMap = JSON.parse(rawMap);
        if (parsedMap && parsedMap.map_data && Object.keys(parsedMap.map_data).length > 0) {
          this.globalMap = parsedMap;
          loadedMap = true;
        }
      } catch (err) {
        console.error('[EmbeddedDB] Erro ao ler global_world_map.json:', err.message);
      }
    }

    // 3. Se ainda estiver vazio e não houver backups, importa de supabase_backup.json
    if (!loadedUsers || this.state.profiles.length === 0) {
      this.bootstrapFromMigrations();
    }

    // 4. Reconcilia automaticamente contas presentes nos snapshots de backup (impede perda de contas recém-criadas)
    this.reconcileWithBackups();

    // 5. Se o mapa global ainda estiver vazio, carrega de defaultWorldMap.json
    if (!loadedMap && (!this.globalMap.map_data || Object.keys(this.globalMap.map_data).length === 0)) {
      this.bootstrapDefaultMap();
    }

    // 6. Normaliza e repara e-mails (@gmail.com) e roupas (customAvatar) caso estivessem nulos na migração
    this.normalizeAndHealData();

    // Sincroniza lista de arquivos físicos de backup existentes na pasta
    this.syncBackupsListFromDisk();
  }

  createDefaultCustomAvatar(nickname = 'Aventureiro') {
    const clean = (nickname || 'Aventureiro').toLowerCase().trim();
    const isDuda = clean === 'duda' || clean.includes('eduarda');
    if (isDuda) {
      return {
        version: 2,
        name: nickname || 'duda',
        gender: 'female',
        skinTone: '#ffdfc4',
        skinShadow: '#e5be9e',
        headStyle: 'head_06',
        hairColor: '#684022',
        hairShadow: '#452611',
        eyeShape: 'olhos_2',
        eyeColor: '#8C501D',
        noseShape: 'nariz_1',
        mouthShape: 'boca_2',
        cheeksShape: 'blush_1',
        cheeksColor: 'rgba(255, 126, 54, 0.7)',
        topStyle: 'top_cupcake_dress',
        topColorPrimary: '#f472b6',
        topColorSecondary: '#ffffff',
        bottomStyle: 'skirt_pleated',
        bottomColor: '#db2777',
        shoesStyle: 'sneakers_classic',
        shoesColor: '#f472b6',
        shoesTrim: '#ffffff',
        glassesStyle: 'none',
        glassesColor: '#5c3c26',
        glassesLensColor: '#0f172a',
        glassesLensOpacity: 85
      };
    }

    return {
      version: 2,
      name: nickname || 'Rennan',
      gender: 'neutral',
      skinTone: '#ffd0a8',
      skinShadow: '#e0ae82',
      headStyle: 'head_01',
      hairColor: '#3d2314',
      hairShadow: '#241208',
      eyeShape: 'olhos_1',
      eyeColor: '#8C501D',
      noseShape: 'nariz_1',
      mouthShape: 'boca_1',
      cheeksShape: 'blush_1',
      cheeksColor: 'rgba(255, 126, 54, 0.7)',
      topStyle: 'top_sweater',
      topColorPrimary: '#19c8b9',
      topColorSecondary: '#ffffff',
      bottomStyle: 'pants_cargo',
      bottomColor: '#1e3a8a',
      shoesStyle: 'sneakers_classic',
      shoesColor: '#ea580c',
      shoesTrim: '#ffffff',
      glassesStyle: 'none',
      glassesColor: '#5c3c26',
      glassesLensColor: '#0f172a',
      glassesLensOpacity: 85
    };
  }

  normalizeAndHealData() {
    let changed = false;

    for (const user of this.state.auth_users) {
      const profile = this.state.profiles.find(p => p.id === user.id);
      const cleanNick = (profile?.nickname || '').toLowerCase().trim();

      // Restaura os e-mails originais dos jogadores
      if (cleanNick === 'rennan' && (user.email.endsWith('@kidslearncode.local') || user.email === 'rennan@gmail.com')) {
        user.email = 'rennancr93@gmail.com';
        user.role = 'admin';
        changed = true;
      } else if (cleanNick === 'duda' && (user.email.endsWith('@kidslearncode.local') || user.email === 'eduardasa@gmail.com' || user.email === 'duda@gmail.com')) {
        user.email = 'eduardasa@proton.me';
        user.role = 'admin';
        changed = true;
      } else if (user.email && user.email.endsWith('@kidslearncode.local')) {
        const prefix = user.email.split('@')[0] || cleanNick || 'jogador';
        user.email = `${prefix}@gmail.com`;
        changed = true;
      }
    }

    for (const save of this.state.game_saves) {
      const profile = this.state.profiles.find(p => p.id === save.user_id);
      const nick = profile?.nickname || 'Aventureiro';
      if (!save.player_data) {
        save.player_data = { x: profile?.x ?? 320, y: profile?.y ?? 320, scale: 1, heroId: 'custom_avatar' };
        changed = true;
      }
      if (!save.player_data.customAvatar || typeof save.player_data.customAvatar !== 'object') {
        save.player_data.customAvatar = this.createDefaultCustomAvatar(nick);
        save.player_data.heroId = 'custom_avatar';
        save.player_data.activeHero = 'custom_avatar';
        if (profile) profile.hero_id = 'custom_avatar';
        changed = true;
      } else if (!save.player_data.customAvatar.name || save.player_data.customAvatar.name === 'Aventureiro') {
        if (nick && nick !== 'Aventureiro') {
          save.player_data.customAvatar.name = nick;
          changed = true;
        }
      }
    }

    if (changed) {
      this.saveState();
      console.log('[EmbeddedDB] E-mails (@gmail.com) e Roupas/Customização (customAvatar) sincronizados no banco.');
    }
  }

  /**
   * Blindagem 3: Gravação Atômica Concorrente Segura (Write-Then-Rename com fsync e sufixo único)
   * Impede corrupção ou colisão de arquivo mesmo com múltiplos processos ou queda brusca de energia
   */
  atomicWriteJSON(filePath, dataObj) {
    const uniqueSuffix = `${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`;
    const tmpPath = `${filePath}.${uniqueSuffix}.tmp`;
    const jsonString = JSON.stringify(dataObj, null, 2);
    const fd = fs.openSync(tmpPath, 'w');
    try {
      fs.writeFileSync(fd, jsonString, 'utf-8');
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmpPath, filePath);
  }

  saveState() {
    this.state.updatedAt = new Date().toISOString();
    this.atomicWriteJSON(this.usersSavesFile, this.state);
  }

  saveGlobalMapToDisk() {
    this.atomicWriteJSON(this.globalMapFile, this.globalMap);
  }

  /**
   * Blindagem 3: Auto-Recovery caso o arquivo principal sofra dano
   */
  tryAutoRecovery() {
    try {
      if (!fs.existsSync(this.backupsDir)) return false;
      const files = fs.readdirSync(this.backupsDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();

      for (const file of files) {
        try {
          const fullPath = path.join(this.backupsDir, file);
          const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          if (parsed && parsed.tables && Array.isArray(parsed.tables.profiles)) {
            console.log(`[EmbeddedDB] Auto-Recovery restaurado com sucesso a partir de: ${file}`);
            this.applyBackupPayload(parsed);
            return true;
          }
        } catch (_) {
          // Tenta o backup anterior
        }
      }
    } catch (err) {
      console.error('[EmbeddedDB] Falha no Auto-Recovery:', err.message);
    }
    return false;
  }

  /**
   * Reconcilia todas as contas salvas em snapshots de backup no disco (server/data/backups/)
   * Garante que nenhuma conta criada seja perdida caso um processo antigo tenha regredido o estado.
   */
  reconcileWithBackups() {
    try {
      if (!fs.existsSync(this.backupsDir)) return;
      const deletedSet = new Set(this.state.deleted_user_ids || []);
      const files = fs.readdirSync(this.backupsDir)
        .filter(f => f.endsWith('.json'))
        .sort(); // Do mais antigo ao mais recente

      let restoredCount = 0;

      for (const file of files) {
        try {
          const fullPath = path.join(this.backupsDir, file);
          const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          const bUsers = parsed?.tables?.auth_users || [];
          const bProfiles = parsed?.tables?.profiles || [];
          const bSaves = parsed?.tables?.game_saves || [];

          for (const u of bUsers) {
            if (!u || !u.id || deletedSet.has(u.id)) continue;
            const existsById = this.state.auth_users.find(curr => curr.id === u.id);
            const existsByEmail = u.email && this.state.auth_users.find(curr => curr.email.toLowerCase() === u.email.toLowerCase());
            if (!existsById && !existsByEmail) {
              this.state.auth_users.push(u);
              restoredCount++;
            }
          }

          for (const p of bProfiles) {
            if (!p || !p.id || deletedSet.has(p.id)) continue;
            if (!this.state.profiles.find(curr => curr.id === p.id)) {
              this.state.profiles.push(p);
            }
          }

          for (const s of bSaves) {
            if (!s || !s.user_id || deletedSet.has(s.user_id)) continue;
            if (!this.state.game_saves.find(curr => curr.user_id === s.user_id)) {
              const cleanSave = { ...s };
              delete cleanSave.map_data;
              this.state.game_saves.push(cleanSave);
            }
          }
        } catch (_) {}
      }

      if (restoredCount > 0) {
        this.saveState();
        console.log(`[EmbeddedDB] Reconciliação de segurança concluiu: ${restoredCount} conta(s) recuperada(s) dos backups.`);
      }
    } catch (err) {
      console.warn('[EmbeddedDB] Aviso na reconciliação de backups:', err.message);
    }
  }

  bootstrapFromMigrations() {
    const backupJsonPath = path.join(__dirname, 'db', 'migrations', 'supabase_backup.json');
    if (!fs.existsSync(backupJsonPath)) {
      console.log('[EmbeddedDB] Inicializando banco de dados nativo limpo.');
      this.saveState();
      return;
    }

    try {
      console.log('[EmbeddedDB] Importando dados históricos de supabase_backup.json (modo merge seguro)...');
      const raw = fs.readFileSync(backupJsonPath, 'utf-8');
      const data = JSON.parse(raw);
      const defaultPassHash = bcrypt.hashSync('123456', 10);

      const profiles = data.tables?.profiles || [];
      const saves = data.tables?.game_saves || [];

      for (const p of profiles) {
        const cleanNick = (p.nickname || 'aventureiro').toLowerCase().replace(/[^a-z0-9]/g, '');
        let email = p.email;
        if (!email) {
          if (cleanNick === 'rennan') email = 'rennancr93@gmail.com';
          else if (cleanNick === 'duda') email = 'eduardasa@proton.me';
          else email = `${cleanNick || 'player'}@gmail.com`;
        }

        if (!this.state.auth_users.find(u => u.id === p.id)) {
          this.state.auth_users.push({
            id: p.id,
            email,
            password_hash: defaultPassHash,
            email_confirmed: true,
            confirmation_token: null,
            confirmation_token_expires_at: null,
            reset_token: null,
            reset_token_expires_at: null,
            parent_email: null,
            is_minor: false,
            role: (cleanNick === 'rennan' || cleanNick === 'duda') ? 'admin' : 'player',
            created_at: p.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        const saveForUser = saves.find(s => s.user_id === p.id);
        const xp = saveForUser?.coding_progress?.playerXP ?? p.xp ?? 0;
        const gold = saveForUser?.coding_progress?.playerGold ?? p.gold ?? 100;
        const level = Math.max(1, Math.floor(xp / 200) + 1);

        if (!this.state.profiles.find(existingProf => existingProf.id === p.id)) {
          this.state.profiles.push({
            id: p.id,
            nickname: p.nickname || 'Aventureiro',
            hero_id: saveForUser?.player_data?.heroId || p.hero_id || 'custom_avatar',
            x: saveForUser?.player_data?.x ?? p.x ?? 320,
            y: saveForUser?.player_data?.y ?? p.y ?? 320,
            level,
            xp,
            gold,
            last_online: p.last_online || new Date().toISOString(),
            created_at: p.created_at || new Date().toISOString()
          });
        }
      }

      let newestMap = null;
      let newestMapTime = 0;

      for (const s of saves) {
        const savedTime = new Date(s.updated_at || 0).getTime();
        if (s.map_data && Object.keys(s.map_data).length > 0 && savedTime >= newestMapTime) {
          newestMap = s.map_data;
          newestMapTime = savedTime;
        }

        if (!this.state.game_saves.find(existingSave => existingSave.user_id === s.user_id)) {
          const prof = this.state.profiles.find(p => p.id === s.user_id);
          const pData = s.player_data || { x: 320, y: 320, scale: 1, heroId: 'custom_avatar' };
          if (!pData.customAvatar || typeof pData.customAvatar !== 'object') {
            pData.customAvatar = this.createDefaultCustomAvatar(prof?.nickname || 'Aventureiro');
          }

          this.state.game_saves.push({
            id: s.id || crypto.randomUUID(),
            user_id: s.user_id,
            player_data: pData,
            inventory_data: s.inventory_data || { items: [], tools: [], eggs: [], equippedToolId: null },
            dragons_data: s.dragons_data || { party: [], formation: [], activeDragonId: null, mode: 'none' },
            coding_progress: s.coding_progress || { playerXP: 0, playerGold: 100, completedLessons: [], unlockedAssets: [], unlockedRecipes: [] },
            updated_at: s.updated_at || new Date().toISOString()
          });
        }
      }

      if (newestMap && (!this.globalMap.map_data || Object.keys(this.globalMap.map_data).length === 0)) {
        this.globalMap = {
          map_data: newestMap,
          updated_at: new Date(newestMapTime || Date.now()).toISOString(),
          updated_by: '00000000-0000-0000-0000-000000000001'
        };
        this.saveGlobalMapToDisk();
      }

      this.saveState();
      console.log(`[EmbeddedDB] Migração concluída: ${this.state.profiles.length} perfis e ${this.state.game_saves.length} saves carregados.`);
    } catch (err) {
      console.error('[EmbeddedDB] Erro ao importar supabase_backup.json:', err.message);
    }
  }

  bootstrapDefaultMap() {
    try {
      const defaultMapPath = path.resolve(__dirname, '..', 'src', 'data', 'defaultWorldMap.json');
      if (fs.existsSync(defaultMapPath)) {
        const raw = fs.readFileSync(defaultMapPath, 'utf-8');
        const mapObj = JSON.parse(raw);
        this.globalMap = {
          map_data: mapObj,
          updated_at: new Date().toISOString(),
          updated_by: 'system_default'
        };
        this.saveGlobalMapToDisk();
        console.log('[EmbeddedDB] Mapa Global inicializado a partir de src/data/defaultWorldMap.json');
      }
    } catch (err) {
      console.warn('[EmbeddedDB] Aviso ao carregar defaultWorldMap.json:', err.message);
    }
  }

  syncBackupsListFromDisk() {
    try {
      if (!fs.existsSync(this.backupsDir)) return;
      const files = fs.readdirSync(this.backupsDir).filter(f => f.endsWith('.json'));
      for (const filename of files) {
        if (!this.state.server_backups.find(b => b.filename === filename)) {
          const stat = fs.statSync(path.join(this.backupsDir, filename));
          this.state.server_backups.push({
            id: crypto.randomUUID(),
            filename,
            size_bytes: stat.size,
            created_by: 'disk_sync',
            created_at: stat.mtime.toISOString()
          });
        }
      }
      this.state.server_backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (_) {}
  }

  // =========================================================================
  // MÉTODOS NATIVOS DE ACESSO DIRETO AO BANCO DE DADOS EMBUTIDO
  // =========================================================================

  async healthCheck() {
    return {
      healthy: true,
      engine: 'KidsLearnCode Embedded Native DB v2.0 (Zero-PostgreSQL)',
      time: new Date().toISOString(),
      profilesCount: this.state.profiles.length,
      savesCount: this.state.game_saves.length,
      backupsCount: this.state.server_backups.length
    };
  }

  getUserByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    const direct = this.state.auth_users.find(u => u.email.toLowerCase() === clean);
    if (direct) return direct;

    // Suporte a aliases conhecidos (@gmail.com / @proton.me / nickname)
    const localPart = clean.split('@')[0];
    if (clean === 'rennan@gmail.com' || clean === 'rennancr93@gmail.com' || localPart === 'rennan') {
      const rennanProf = this.state.profiles.find(p => p.nickname.toLowerCase() === 'rennan');
      if (rennanProf) return this.getUserById(rennanProf.id);
    }
    if (clean === 'duda@gmail.com' || clean === 'eduardasa@gmail.com' || clean === 'eduardasa@proton.me' || localPart === 'duda' || localPart === 'eduardasa') {
      const dudaProf = this.state.profiles.find(p => p.nickname.toLowerCase() === 'duda');
      if (dudaProf) return this.getUserById(dudaProf.id);
    }

    const byPrefix = this.state.auth_users.find(u => u.email.toLowerCase().split('@')[0] === localPart);
    if (byPrefix) return byPrefix;

    return null;
  }

  getUserById(id) {
    return this.state.auth_users.find(u => u.id === id) || null;
  }

  createUser({ email, passwordHash, emailConfirmed = true, confirmationToken = null, tokenExpires = null, isMinor = false, parentEmail = null, nickname = 'Aventureiro', role = 'player' }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const cleanNick = (nickname || 'Aventureiro').trim();
    const defaultAvatar = this.createDefaultCustomAvatar(cleanNick);

    const newUser = {
      id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      email_confirmed: Boolean(emailConfirmed),
      confirmation_token: confirmationToken,
      confirmation_token_expires_at: tokenExpires ? new Date(tokenExpires).toISOString() : null,
      reset_token: null,
      reset_token_expires_at: null,
      parent_email: parentEmail,
      is_minor: Boolean(isMinor),
      role: role || 'player',
      created_at: now,
      updated_at: now
    };

    const newProfile = {
      id,
      nickname: cleanNick,
      hero_id: 'custom_avatar',
      x: 320,
      y: 320,
      level: 1,
      xp: 0,
      gold: 100,
      last_online: now,
      created_at: now
    };

    const newSave = {
      id: crypto.randomUUID(),
      user_id: id,
      player_data: { x: 320, y: 320, scale: 1.0, heroId: 'custom_avatar', customAvatar: defaultAvatar, activeHero: 'custom_avatar' },
      inventory_data: { items: [], tools: [], eggs: [], equippedToolId: null },
      dragons_data: { party: [], formation: [], activeDragonId: null, mode: 'none' },
      coding_progress: { playerXP: 0, playerGold: 100, completedLessons: [], unlockedAssets: [], unlockedRecipes: [] },
      updated_at: now
    };

    this.state.auth_users.push(newUser);
    this.state.profiles.push(newProfile);
    this.state.game_saves.push(newSave);
    if (Array.isArray(this.state.deleted_user_ids)) {
      this.state.deleted_user_ids = this.state.deleted_user_ids.filter(uid => uid !== id);
    }
    this.saveState();

    try {
      this.createBackup('account_created');
    } catch (_) {}

    return { user: newUser, profile: newProfile, save: newSave };
  }

  updateUser(id, patch) {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, patch, { updated_at: new Date().toISOString() });
    this.saveState();
    return user;
  }

  getProfile(id) {
    return this.state.profiles.find(p => p.id === id) || null;
  }

  upsertProfile(id, data = {}) {
    let profile = this.getProfile(id);
    const now = new Date().toISOString();
    if (!profile) {
      profile = {
        id,
        nickname: data.nickname || 'Aventureiro',
        hero_id: data.heroId || data.hero_id || 'custom_avatar',
        x: data.x ?? 320,
        y: data.y ?? 320,
        level: data.level ?? 1,
        xp: data.xp ?? 0,
        gold: data.gold ?? 100,
        last_online: now,
        created_at: now
      };
      this.state.profiles.push(profile);
    } else {
      if (data.nickname !== undefined && data.nickname !== null) profile.nickname = data.nickname;
      if (data.heroId !== undefined || data.hero_id !== undefined) profile.hero_id = data.heroId || data.hero_id;
      if (data.x !== undefined && data.x !== null) profile.x = Number(data.x);
      if (data.y !== undefined && data.y !== null) profile.y = Number(data.y);
      if (data.level !== undefined && data.level !== null) profile.level = Number(data.level);
      if (data.xp !== undefined && data.xp !== null) profile.xp = Number(data.xp);
      if (data.gold !== undefined && data.gold !== null) profile.gold = Number(data.gold);
      profile.last_online = now;
    }
    this.saveState();
    return profile;
  }

  getGameSave(userId) {
    const save = this.state.game_saves.find(s => s.user_id === userId);
    if (!save) return null;
    return {
      ...save,
      map_data: this.globalMap.map_data || {}
    };
  }

  upsertGameSave(userId, { map, player, inventory, dragons, codingProgress, customAvatar, activeHero }) {
    const now = new Date().toISOString();
    let save = this.state.game_saves.find(s => s.user_id === userId);
    const profile = this.getProfile(userId);

    // Nunca sobrescreve customAvatar válido existente com null
    const incomingAvatar = (customAvatar && typeof customAvatar === 'object')
      ? customAvatar
      : ((player?.customAvatar && typeof player.customAvatar === 'object') ? player.customAvatar : null);

    const resolvedCustomAvatar = incomingAvatar
      || (save?.player_data?.customAvatar && typeof save.player_data.customAvatar === 'object' ? save.player_data.customAvatar : null)
      || this.createDefaultCustomAvatar(profile?.nickname || 'Aventureiro');

    const resolvedActiveHero = activeHero || player?.activeHero || player?.heroId || save?.player_data?.activeHero || 'custom_avatar';

    const mergedPlayerData = {
      ...(save?.player_data || { x: 320, y: 320, scale: 1.0 }),
      ...(player || {}),
      customAvatar: resolvedCustomAvatar,
      activeHero: resolvedActiveHero,
      heroId: resolvedActiveHero
    };

    if (!save) {
      save = {
        id: crypto.randomUUID(),
        user_id: userId,
        player_data: mergedPlayerData,
        inventory_data: inventory || { items: [], tools: [], eggs: [], equippedToolId: null },
        dragons_data: dragons || { party: [], formation: [], activeDragonId: null, mode: 'none' },
        coding_progress: codingProgress || { playerXP: 0, playerGold: 100, completedLessons: [], unlockedAssets: [], unlockedRecipes: [] },
        updated_at: now
      };
      this.state.game_saves.push(save);
    } else {
      save.player_data = mergedPlayerData;
      if (inventory && Object.keys(inventory).length > 0) save.inventory_data = inventory;
      if (dragons && Object.keys(dragons).length > 0) save.dragons_data = dragons;
      if (codingProgress && Object.keys(codingProgress).length > 0) save.coding_progress = codingProgress;
      save.updated_at = now;
    }

    // Sincroniza perfil automaticamente (nickname do customAvatar, posição, XP, Ouro)
    if (profile) {
      if (resolvedCustomAvatar?.name && resolvedCustomAvatar.name.trim() !== 'Aventureiro') {
        profile.nickname = resolvedCustomAvatar.name.trim();
      }
      if (mergedPlayerData.x !== undefined) profile.x = Math.round(mergedPlayerData.x);
      if (mergedPlayerData.y !== undefined) profile.y = Math.round(mergedPlayerData.y);
      if (save.coding_progress?.playerXP !== undefined) {
        profile.xp = Number(save.coding_progress.playerXP);
        profile.level = Math.max(1, Math.floor(profile.xp / 200) + 1);
      }
      if (save.coding_progress?.playerGold !== undefined) {
        profile.gold = Number(save.coding_progress.playerGold);
      }
      profile.hero_id = resolvedActiveHero;
      profile.last_online = now;
    }

    // Se o pacote trouxe um mapa válido e populado, atualiza o Mapa Global caso solicitado
    if (map && map.layers && Object.keys(map.layers).length > 0) {
      const groundKeys = map.layers.ground ? Object.keys(map.layers.ground).length : 0;
      if (groundKeys > 0) {
        this.globalMap = {
          map_data: map,
          updated_at: now,
          updated_by: userId
        };
        this.saveGlobalMapToDisk();
      }
    }

    this.saveState();
    return save;
  }

  getGlobalMap() {
    if (!this.globalMap.map_data || Object.keys(this.globalMap.map_data).length === 0) {
      return null;
    }
    return {
      map: this.globalMap.map_data,
      updatedAt: new Date(this.globalMap.updated_at || Date.now()).getTime()
    };
  }

  saveGlobalMap(mapData, userId = '00000000-0000-0000-0000-000000000001') {
    if (!mapData) return false;
    this.globalMap = {
      map_data: mapData,
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    this.saveGlobalMapToDisk();
    return true;
  }

  // =========================================================================
  // EXPLORADOR & EDITOR REMOTO DO BANCO DE DADOS (ADMIN STUDIO)
  // =========================================================================

  getAllUsersDetailed() {
    return this.state.profiles.map(p => {
      const u = this.state.auth_users.find(user => user.id === p.id) || {};
      const s = this.state.game_saves.find(save => save.user_id === p.id) || {};
      const xp = s.coding_progress?.playerXP ?? p.xp ?? 0;
      const gold = s.coding_progress?.playerGold ?? p.gold ?? 100;
      const level = Math.max(1, Math.floor(xp / 200) + 1);

      return {
        id: p.id,
        nickname: s.player_data?.customAvatar?.name || p.nickname || 'Aventureiro',
        email: u.email || 'sem-email@kidslearncode.local',
        email_confirmed: u.email_confirmed ?? true,
        role: u.role || 'player',
        is_minor: Boolean(u.is_minor),
        parent_email: u.parent_email || null,
        hero_id: s.player_data?.activeHero || s.player_data?.heroId || p.hero_id || 'char_wolf_hunter_m',
        x: s.player_data?.x ?? p.x ?? 320,
        y: s.player_data?.y ?? p.y ?? 320,
        level,
        xp,
        gold,
        last_online: s.updated_at || p.last_online || p.created_at,
        created_at: u.created_at || p.created_at,
        save: {
          id: s.id || null,
          player_data: s.player_data || {},
          customAvatar: s.player_data?.customAvatar || null,
          inventory_data: s.inventory_data || { items: [], tools: [], eggs: [], equippedToolId: null },
          dragons_data: s.dragons_data || { party: [], formation: [], activeDragonId: null, mode: 'none' },
          coding_progress: s.coding_progress || { playerXP: xp, playerGold: gold, completedLessons: [], unlockedAssets: [], unlockedRecipes: [] },
          updated_at: s.updated_at || null
        }
      };
    }).sort((a, b) => new Date(b.last_online || 0) - new Date(a.last_online || 0));
  }

  async adminUpdateUserAndSave(userId, payload = {}) {
    const user = this.getUserById(userId);
    const profile = this.getProfile(userId);
    if (!user || !profile) {
      throw new Error('Usuário não encontrado no banco de dados.');
    }

    const now = new Date().toISOString();

    // 1. Atualiza dados de autenticação se fornecidos
    if (payload.email) user.email = payload.email.toLowerCase().trim();
    if (payload.role) user.role = payload.role;
    if (payload.email_confirmed !== undefined) user.email_confirmed = Boolean(payload.email_confirmed);
    if (payload.newPassword && String(payload.newPassword).length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(String(payload.newPassword), salt);
    }
    user.updated_at = now;

    // 2. Atualiza perfil
    if (payload.nickname !== undefined) profile.nickname = String(payload.nickname).trim() || 'Aventureiro';
    if (payload.x !== undefined) profile.x = Number(payload.x);
    if (payload.y !== undefined) profile.y = Number(payload.y);
    if (payload.xp !== undefined) {
      profile.xp = Number(payload.xp);
      profile.level = Math.max(1, Math.floor(profile.xp / 200) + 1);
    }
    if (payload.gold !== undefined) profile.gold = Number(payload.gold);
    if (payload.hero_id !== undefined) profile.hero_id = payload.hero_id;
    profile.last_online = now;

    // 3. Atualiza Game Save (Roupas, Ovos, Itens, Dragões, Progresso)
    let save = this.state.game_saves.find(s => s.user_id === userId);
    if (!save) {
      save = {
        id: crypto.randomUUID(),
        user_id: userId,
        player_data: { x: profile.x, y: profile.y, scale: 1.0, heroId: profile.hero_id },
        inventory_data: { items: [], tools: [], eggs: [], equippedToolId: null },
        dragons_data: { party: [], formation: [], activeDragonId: null, mode: 'none' },
        coding_progress: { playerXP: profile.xp, playerGold: profile.gold, completedLessons: [], unlockedAssets: [], unlockedRecipes: [] },
        updated_at: now
      };
      this.state.game_saves.push(save);
    }

    if (payload.player_data) {
      save.player_data = { ...save.player_data, ...payload.player_data };
    }
    if (payload.customAvatar && typeof payload.customAvatar === 'object') {
      save.player_data.customAvatar = payload.customAvatar;
      if (payload.nickname !== undefined) {
        save.player_data.customAvatar.name = String(payload.nickname).trim() || save.player_data.customAvatar.name;
      } else if (payload.customAvatar?.name) {
        profile.nickname = payload.customAvatar.name;
      }
    } else if (!save.player_data.customAvatar) {
      save.player_data.customAvatar = this.createDefaultCustomAvatar(profile.nickname);
    }
    if (payload.x !== undefined) save.player_data.x = Number(payload.x);
    if (payload.y !== undefined) save.player_data.y = Number(payload.y);

    if (payload.inventory_data) {
      save.inventory_data = payload.inventory_data;
    }
    if (payload.dragons_data) {
      save.dragons_data = payload.dragons_data;
    }
    if (payload.coding_progress) {
      save.coding_progress = payload.coding_progress;
    }

    // Garante sincronia de XP e Gold dentro de coding_progress
    if (!save.coding_progress) save.coding_progress = {};
    if (payload.xp !== undefined) save.coding_progress.playerXP = Number(payload.xp);
    if (payload.gold !== undefined) save.coding_progress.playerGold = Number(payload.gold);

    save.updated_at = now;
    this.saveState();

    return this.getAllUsersDetailed().find(u => u.id === userId);
  }

  adminDeleteUser(userId) {
    this.state.auth_users = this.state.auth_users.filter(u => u.id !== userId);
    this.state.profiles = this.state.profiles.filter(p => p.id !== userId);
    this.state.game_saves = this.state.game_saves.filter(s => s.user_id !== userId);
    if (!Array.isArray(this.state.deleted_user_ids)) {
      this.state.deleted_user_ids = [];
    }
    if (!this.state.deleted_user_ids.includes(userId)) {
      this.state.deleted_user_ids.push(userId);
    }
    this.saveState();
    return true;
  }

  // =========================================================================
  // MOTOR DE BACKUPS AUTOMÁTICOS E RESTAURAÇÃO EM 1 CLIQUE
  // =========================================================================

  createBackup(createdBy = 'auto') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_kidslearn_${timestamp}.json`;
    const filePath = path.join(this.backupsDir, filename);

    const backupPayload = {
      version: '2.0-embedded',
      createdAt: new Date().toISOString(),
      createdBy,
      tables: {
        auth_users: this.state.auth_users,
        profiles: this.state.profiles,
        game_saves: this.state.game_saves,
        chat_messages: this.state.chat_messages.slice(-200),
        global_world_map: this.globalMap
      }
    };

    this.atomicWriteJSON(filePath, backupPayload);
    const stat = fs.statSync(filePath);

    const record = {
      id: crypto.randomUUID(),
      filename,
      size_bytes: stat.size,
      created_by: createdBy,
      created_at: backupPayload.createdAt
    };

    this.state.server_backups.unshift(record);

    // Rotação automática: mantém os 30 snapshots mais recentes no disco
    if (this.state.server_backups.length > 30) {
      const removed = this.state.server_backups.splice(30);
      for (const old of removed) {
        const oldPath = path.join(this.backupsDir, path.basename(old.filename));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (_) {}
        }
      }
    }

    this.saveState();
    return {
      success: true,
      filename,
      sizeBytes: stat.size,
      createdAt: backupPayload.createdAt,
      profilesCount: this.state.profiles.length,
      savesCount: this.state.game_saves.length
    };
  }

  applyBackupPayload(data) {
    if (!data || !data.tables) {
      throw new Error('Formato de backup inválido.');
    }

    if (Array.isArray(data.tables.auth_users) && data.tables.auth_users.length > 0) {
      this.state.auth_users = data.tables.auth_users;
    }
    if (Array.isArray(data.tables.profiles)) {
      this.state.profiles = data.tables.profiles;
    }
    if (Array.isArray(data.tables.game_saves)) {
      // Se o backup tinha map_data embutido dentro de game_saves (formato v1), extrai para globalMap
      let extractedMap = null;
      this.state.game_saves = data.tables.game_saves.map(s => {
        if (s.map_data && Object.keys(s.map_data).length > 0 && !extractedMap) {
          extractedMap = s.map_data;
        }
        const copy = { ...s };
        delete copy.map_data;
        return copy;
      });
      if (extractedMap && !data.tables.global_world_map) {
        this.globalMap = {
          map_data: extractedMap,
          updated_at: new Date().toISOString(),
          updated_by: 'backup_restore'
        };
        this.saveGlobalMapToDisk();
      }
    }
    if (data.tables.global_world_map && data.tables.global_world_map.map_data) {
      this.globalMap = data.tables.global_world_map;
      this.saveGlobalMapToDisk();
    }

    // Garante que todo profile tenha um auth_user correspondente
    const defaultHash = bcrypt.hashSync('123456', 10);
    for (const p of this.state.profiles) {
      if (!this.state.auth_users.find(u => u.id === p.id)) {
        const cleanNick = (p.nickname || 'aventureiro').toLowerCase().replace(/[^a-z0-9]/g, '');
        this.state.auth_users.push({
          id: p.id,
          email: `${cleanNick}@kidslearncode.local`,
          password_hash: defaultHash,
          email_confirmed: true,
          role: cleanNick === 'rennan' ? 'admin' : 'player',
          created_at: p.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    this.saveState();
  }

  restoreBackupByFilename(filename) {
    const safeFilename = path.basename(filename);
    const targetPath = path.join(this.backupsDir, safeFilename);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Arquivo de backup não encontrado: ${safeFilename}`);
    }
    const raw = fs.readFileSync(targetPath, 'utf-8');
    const data = JSON.parse(raw);
    this.applyBackupPayload(data);
    return {
      success: true,
      filename: safeFilename,
      profilesRestored: this.state.profiles.length,
      savesRestored: this.state.game_saves.length
    };
  }

  // =========================================================================
  // COMPATIBILIDADE SQL (Para console Admin e queries legadas)
  // =========================================================================

  async query(text, params = []) {
    const sql = String(text || '').trim();
    const upper = sql.toUpperCase();

    // 1. SELECT COUNT(*) FROM PROFILES
    if (upper.includes('COUNT(*)') && upper.includes('PROFILES')) {
      return {
        rows: [{ count: String(this.state.profiles.length), current_time: new Date().toISOString() }],
        rowCount: 1
      };
    }

    // 2. SELECT * FROM SERVER_BACKUPS
    if (upper.includes('FROM SERVER_BACKUPS')) {
      const rows = this.state.server_backups.slice(0, 30);
      return { rows, rowCount: rows.length };
    }

    // 3. SELECT * FROM AUTH_USERS WHERE LOWER(EMAIL) = $1
    if (upper.includes('FROM AUTH_USERS') && upper.includes('LOWER(EMAIL)')) {
      const email = String(params[0] || '').toLowerCase().trim();
      const found = this.state.auth_users.filter(u => u.email.toLowerCase() === email);
      return { rows: found, rowCount: found.length };
    }

    // 4. SELECT * FROM AUTH_USERS WHERE CONFIRMATION_TOKEN = $1
    if (upper.includes('FROM AUTH_USERS') && upper.includes('CONFIRMATION_TOKEN = $1')) {
      const token = params[0];
      const now = Date.now();
      const found = this.state.auth_users.filter(
        u => u.confirmation_token === token && (!u.confirmation_token_expires_at || new Date(u.confirmation_token_expires_at).getTime() > now)
      );
      return { rows: found, rowCount: found.length };
    }

    // 5. SELECT * FROM AUTH_USERS WHERE RESET_TOKEN = $1
    if (upper.includes('FROM AUTH_USERS') && upper.includes('RESET_TOKEN = $1')) {
      const token = params[0];
      const now = Date.now();
      const found = this.state.auth_users.filter(
        u => u.reset_token === token && (!u.reset_token_expires_at || new Date(u.reset_token_expires_at).getTime() > now)
      );
      return { rows: found, rowCount: found.length };
    }

    // 6. SELECT * FROM PROFILES WHERE ID = $1
    if (upper.includes('FROM PROFILES') && upper.includes('WHERE ID = $1')) {
      const prof = this.getProfile(params[0]);
      return { rows: prof ? [prof] : [], rowCount: prof ? 1 : 0 };
    }

    // 7. SELECT * FROM GAME_SAVES WHERE USER_ID = $1
    if (upper.includes('FROM GAME_SAVES') && upper.includes('WHERE USER_ID = $1')) {
      const save = this.getGameSave(params[0]);
      return { rows: save ? [save] : [], rowCount: save ? 1 : 0 };
    }

    // 8. SELECT MAP_DATA FROM GAME_SAVES (Global Map)
    if (upper.includes('SELECT MAP_DATA') && upper.includes('FROM GAME_SAVES')) {
      if (this.globalMap?.map_data && Object.keys(this.globalMap.map_data).length > 0) {
        return {
          rows: [{ map_data: this.globalMap.map_data, updated_at: this.globalMap.updated_at }],
          rowCount: 1
        };
      }
      return { rows: [], rowCount: 0 };
    }

    // 9. Console Admin Queries (SELECT * FROM <tabela>)
    if (upper.startsWith('SELECT')) {
      if (upper.includes('FROM PROFILES') && upper.includes('JOIN AUTH_USERS')) {
        const detailed = this.getAllUsersDetailed();
        return { rows: detailed, rowCount: detailed.length };
      }
      if (upper.includes('FROM PROFILES')) {
        return { rows: this.state.profiles, rowCount: this.state.profiles.length };
      }
      if (upper.includes('FROM AUTH_USERS')) {
        const safeUsers = this.state.auth_users.map(({ password_hash, ...rest }) => rest);
        return { rows: safeUsers, rowCount: safeUsers.length };
      }
      if (upper.includes('FROM GAME_SAVES')) {
        const rows = this.state.game_saves.map(s => {
          const p = this.getProfile(s.user_id);
          return { ...s, nickname: p?.nickname || 'Aventureiro' };
        });
        return { rows, rowCount: rows.length };
      }
      if (upper.includes('FROM CHAT_MESSAGES')) {
        return { rows: this.state.chat_messages, rowCount: this.state.chat_messages.length };
      }
    }

    // 10. UPDATE AUTH_USERS
    if (upper.startsWith('UPDATE AUTH_USERS')) {
      if (upper.includes('EMAIL_CONFIRMED = TRUE')) {
        const user = this.getUserById(params[0]);
        if (user) {
          user.email_confirmed = true;
          user.confirmation_token = null;
          this.saveState();
        }
        return { rows: [], rowCount: user ? 1 : 0 };
      }
      if (upper.includes('SET RESET_TOKEN = $1')) {
        const [resetToken, expires, userId] = params;
        const user = this.getUserById(userId);
        if (user) {
          user.reset_token = resetToken;
          user.reset_token_expires_at = new Date(expires).toISOString();
          this.saveState();
        }
        return { rows: [], rowCount: user ? 1 : 0 };
      }
      if (upper.includes('SET PASSWORD_HASH = $1')) {
        const [passwordHash, userId] = params;
        const user = this.getUserById(userId);
        if (user) {
          user.password_hash = passwordHash;
          user.reset_token = null;
          user.reset_token_expires_at = null;
          user.updated_at = new Date().toISOString();
          this.saveState();
        }
        return { rows: [], rowCount: user ? 1 : 0 };
      }
    }

    return { rows: [], rowCount: 0 };
  }
}
