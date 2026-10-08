/**
 * SupabaseClient - Motor de Integração Nuvem & MMORPG
 * Gerencia Autenticação (Email/Senha/Guest), Perfis PostgreSQL, Saves na Nuvem
 * e Sincronização em Tempo Real (Supabase Realtime Broadcast & Presence).
 */

import { SUPABASE_CONFIG } from '../config/supabase.js';

export class SupabaseClient {
  constructor() {
    const storedUrl = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_supabase_url')) || '';
    const storedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_supabase_key')) || '';

    this.url = (storedUrl && storedUrl.startsWith('https://')) ? storedUrl.trim() : (SUPABASE_CONFIG.url || '');
    this.anonKey = (storedKey && storedKey.length > 20) ? storedKey.trim() : (SUPABASE_CONFIG.anonKey || '');
    this.client = null;
    this.user = null;
    this.profile = null;
    this.isConfigured = false;
    this.realtimeChannel = null;
    this.listeners = [];
    this.initPromise = null;

    // Callbacks persistentes para o canal Realtime (sobrevivem a reconexões e trocas de auth)
    this.onRemotePlayerUpdateCallback = null;
    this.onChatMessageCallback = null;
    this.onMapUpdatedCallback = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    try {
      let createClientFn = null;

      // 1. Tenta carregar do escopo global se existir
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        createClientFn = window.supabase.createClient;
      } else {
        // 2. Import dinâmico com múltiplos CDNs resilientes
        try {
          const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
          createClientFn = mod.createClient;
        } catch (e1) {
          try {
            const mod2 = await import('https://esm.sh/@supabase/supabase-js@2');
            createClientFn = mod2.createClient;
          } catch (e2) {
            console.warn('[SupabaseClient] CDNs indisponíveis:', e1.message, e2.message);
          }
        }
      }

      const activeUrl = (this.url && this.url.startsWith('https://')) ? this.url.trim() : (SUPABASE_CONFIG.url || '').trim();
      const activeKey = (this.anonKey && this.anonKey.length > 20) ? this.anonKey.trim() : (SUPABASE_CONFIG.anonKey || '').trim();

      if (createClientFn && activeUrl && activeKey) {
        this.url = activeUrl;
        this.anonKey = activeKey;

        this.client = createClientFn(activeUrl, activeKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });

        // Ouvinte em tempo real para mudanças de autenticação (Confirmação de e-mail por link, Login, Logout)
        this.client.auth.onAuthStateChange(async (event, session) => {
          console.log('[SupabaseClient] onAuthStateChange:', event, session?.user?.email);
          if (session && session.user) {
            this.user = session.user;
            this.profile = await this.getUserProfile();
            this.isConfigured = true;
            this.setupRealtimeChannel();

            // Limpa parâmetros de token e hash da URL após confirmação de e-mail bem-sucedida
            if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            this.user = this.getGuestUser();
            this.profile = null;
          }
          this.notifyAuthChange(event, session);
        });

        // Trata explicitamente código de confirmação PKCE caso retorne via URL query (?code=...)
        if (typeof window !== 'undefined' && window.location?.search?.includes('code=')) {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const authCode = urlParams.get('code');
            if (authCode) {
              const { data: exchangeData, error: exchangeErr } = await this.client.auth.exchangeCodeForSession(authCode);
              if (exchangeData?.session?.user) {
                console.log('[SupabaseClient] Sessão confirmada via código PKCE:', exchangeData.session.user.email);
              } else if (exchangeErr) {
                console.warn('[SupabaseClient] Aviso na validação do código de confirmação:', exchangeErr.message);
              }
            }
          } catch (e) {
            console.warn('[SupabaseClient] Processamento de token de URL:', e.message);
          }
        }

        const { data: { session } } = await this.client.auth.getSession();
        if (session && session.user) {
          this.user = session.user;
          this.profile = await this.getUserProfile();
        } else {
          this.user = this.getGuestUser();
        }

        this.isConfigured = true;
        this.setupRealtimeChannel();
        return { success: true, user: this.user, isConfigured: true };
      }
    } catch (err) {
      console.warn('[SupabaseClient] Modo Nuvem offline/local:', err.message);
    }

    this.user = this.getGuestUser();
    return { success: false, user: this.user, isConfigured: false };
  }

  async ensureClient() {
    if (this.client) return this.client;
    await this.init();
    return this.client;
  }

  getGuestUser() {
    let guestId = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_guest_id')) || '';
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      if (typeof localStorage !== 'undefined') localStorage.setItem('kidslearn_guest_id', guestId);
    }
    const guestName = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_guest_name')) || `Aventureiro_${guestId.substring(6, 10)}`;
    return {
      id: guestId,
      email: `${guestId}@kidslearncode.local`,
      isGuest: true,
      nickname: guestName
    };
  }

  setCredentials(url, key) {
    this.url = url.trim();
    this.anonKey = key.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kidslearn_supabase_url', this.url);
      localStorage.setItem('kidslearn_supabase_key', this.anonKey);
    }
    this.initPromise = null;
    return this.init();
  }

  getRedirectUrl() {
    if (typeof window !== 'undefined' && window.location?.origin) {
      if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
        return window.location.origin + (window.location.pathname || '/');
      }
    }
    return 'https://kids-learn-code.vercel.app/';
  }

  // ==========================================
  // Autenticação (Login / Cadastro / Guest)
  // ==========================================

  async signUp(email, password, nickname = 'Aventureiro', extraData = {}) {
    await this.ensureClient();
    if (!this.client) {
      return { 
        success: false, 
        error: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.' 
      };
    }

    try {
      const redirectUrl = this.getRedirectUrl();
      const isMinor = extraData.isOver18 === false;
      const parentEmail = extraData.parentEmail || null;

      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            nickname,
            isOver18: extraData.isOver18 ?? true,
            parentEmail,
            game: 'Kids Learn Code - Ilha Lua'
          }
        }
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('rate limit') || msg.includes('over quota') || msg.includes('Email rate limit')) {
          msg = 'Limite temporário de e-mails do Supabase atingido. Para permitir cadastros ilimitados sem bloqueios, desative a opção "Confirm email" no painel do Supabase.';
        } else if (msg.includes('already registered') || msg.includes('already exists')) {
          msg = 'Este e-mail já está cadastrado na Ilha Lua! Tente entrar ou recupere sua senha.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'A senha precisa ter pelo menos 6 caracteres.';
        }
        return { success: false, error: msg };
      }

      if (data.session && data.user) {
        this.user = data.user;
        await this.syncUserProfile({ nickname, heroId: 'char_wolf_hunter_m', level: 1, xp: 0, gold: 100 });
        this.notifyAuthChange('SIGNED_IN', data.session);
        this.setupRealtimeChannel();
        return { success: true, user: data.user, requiresConfirmation: false };
      } else if (data.user) {
        const confirmTarget = isMinor && parentEmail ? parentEmail : email;
        const msg = isMinor 
          ? `Conforme o ECA (Lei 8.069/90), enviamos um e-mail de autorização para o responsável em ${confirmTarget}. O responsável deve clicar no link para liberar o acesso à Ilha Lua!`
          : `Enviamos um e-mail de confirmação para ${email}. Acesse sua caixa de entrada e confirme para acessar a Ilha Lua!`;

        return { 
          success: true, 
          user: data.user, 
          requiresConfirmation: true,
          isMinor,
          confirmTarget,
          message: msg
        };
      }

      return { success: false, error: 'Falha desconhecida no cadastro.' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signIn(email, password) {
    await this.ensureClient();
    if (!this.client) {
      return { 
        success: false, 
        error: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.' 
      };
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'E-mail ou senha incorretos. Verifique os dados digitados.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Este e-mail ainda não foi confirmado. Acesse sua caixa de entrada ou solicite a liberação imediata ao administrador desmarcando "Confirm email" no Supabase.';
        }
        return { success: false, error: msg };
      }
      
      this.user = data.user;
      this.profile = await this.getUserProfile();
      this.notifyAuthChange('SIGNED_IN', data.session);
      this.setupRealtimeChannel();
      return { success: true, user: data.user, profile: this.profile };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async resetPassword(email) {
    await this.ensureClient();
    if (!this.client) {
      return { 
        success: false, 
        error: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.' 
      };
    }

    try {
      const redirectUrl = this.getRedirectUrl();
      const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) return { success: false, error: error.message };

      return { 
        success: true, 
        message: `Instruções de recuperação foram enviadas para ${email}. Verifique sua caixa de entrada!` 
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async updatePassword(newPassword) {
    await this.ensureClient();
    if (!this.client) {
      return { 
        success: false, 
        error: 'Não foi possível conectar ao servidor.' 
      };
    }

    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });

      if (error) return { success: false, error: error.message };

      return { 
        success: true, 
        message: 'Sua senha foi redefinida com sucesso!' 
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signOut() {
    if (this.client && !this.user?.isGuest) {
      await this.client.auth.signOut();
    }
    this.user = this.getGuestUser();
    this.profile = null;
    this.notifyAuthChange();
    this.setupRealtimeChannel();
    return { success: true };
  }

  // ==========================================
  // Perfis no Banco PostgreSQL (Tabela profiles)
  // ==========================================

  async getUserProfile() {
    await this.ensureClient();
    if (!this.client || this.user?.isGuest) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single();

      if (error) {
        // Se ainda não existir registro de perfil, cria um novo
        return await this.syncUserProfile({
          nickname: this.user.user_metadata?.nickname || this.user.email.split('@')[0],
          heroId: 'char_wolf_hunter_m'
        });
      }

      return data;
    } catch {
      return null;
    }
  }

  async syncUserProfile(profileData = {}) {
    await this.ensureClient();
    if (!this.client || this.user?.isGuest) return null;

    try {
      const payload = {
        id: this.user.id,
        nickname: profileData.nickname || this.user.user_metadata?.nickname || this.user.email.split('@')[0],
        hero_id: profileData.heroId || 'char_wolf_hunter_m',
        x: profileData.x || 320,
        y: profileData.y || 320,
        level: profileData.level || 1,
        xp: profileData.xp || 0,
        gold: profileData.gold || 100,
        last_online: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        this.profile = data;
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseClient] Falha ao sincronizar perfil:', err);
    }
    return null;
  }

  // ==========================================
  // Saves na Nuvem (PostgreSQL game_saves & Global World Map)
  // ==========================================

  // Global map uses a fixed UUID to comply with Postgres UUID constraints
  static GLOBAL_MAP_UUID = '00000000-0000-0000-0000-000000000001';

  isValidUUID(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  async saveGlobalWorldMap(mapData) {
    await this.ensureClient();
    if (!this.client || !mapData) {
      return { success: false, reason: 'offline_or_invalid_map' };
    }

    try {
      // 1. Dispara broadcast em tempo real para todos os jogadores conectados
      this.broadcastMapUpdate(mapData);

      // 2. Salva no banco compartilhado
      // Se autenticado com UUID válido (admin ou jogador), atualiza a tabela game_saves
      if (this.user && !this.user.isGuest && this.isValidUUID(this.user.id)) {
        const payload = {
          user_id: this.user.id,
          map_data: mapData,
          player_data: { x: mapData.spawnPoint?.x || 320, y: mapData.spawnPoint?.y || 320 },
          updated_at: new Date().toISOString()
        };

        const { error } = await this.client
          .from('game_saves')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) {
          console.warn('[SupabaseClient] Erro ao salvar mapa na nuvem:', error.message);
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async loadGlobalWorldMap() {
    await this.ensureClient();
    if (!this.client) return null;

    try {
      // 1. Tenta buscar prioritariamente o save do administrador rennancr93@gmail.com ou eduardasa@proton.me
      // Busca profiles correspondentes para obter os user_ids dos administradores
      try {
        const { data: adminProfiles } = await this.client
          .from('profiles')
          .select('id, nickname')
          .limit(50);

        // Busca nos game_saves o mapa mais recente
        const { data: savesList, error: savesErr } = await this.client
          .from('game_saves')
          .select('user_id, map_data, updated_at')
          .not('map_data', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (!savesErr && Array.isArray(savesList) && savesList.length > 0) {
          // Se o usuário atual for o admin ou se houver um save recente, utiliza o mais atualizado
          const latestSave = savesList[0];
          if (latestSave && latestSave.map_data) {
            return {
              map: latestSave.map_data,
              updatedAt: new Date(latestSave.updated_at).getTime()
            };
          }
        }
      } catch (errAdmin) {
        console.warn('[SupabaseClient] Consulta a saves de admin:', errAdmin);
      }

      // 2. Fallback geral: busca o mapa mais recente salvo globalmente no banco por qualquer usuário
      const { data, error } = await this.client
        .from('game_saves')
        .select('map_data, updated_at')
        .not('map_data', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data || !data.map_data) return null;

      return {
        map: data.map_data,
        updatedAt: new Date(data.updated_at).getTime()
      };
    } catch (err) {
      return null;
    }
  }

  async saveCloudGame(payload) {
    await this.ensureClient();
    if (!this.client || !this.user || this.user.isGuest || !this.isValidUUID(this.user.id)) {
      return { success: false, reason: 'guest_or_offline' };
    }

    try {
      const { data, error } = await this.client
        .from('game_saves')
        .upsert({
          user_id: this.user.id,
          map_data: payload.map || {},
          player_data: payload.player || {},
          inventory_data: payload.inventory || {},
          dragons_data: payload.dragons || {},
          coding_progress: payload.codingProgress || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async loadCloudGame() {
    await this.ensureClient();
    if (!this.client || !this.user || this.user.isGuest || !this.isValidUUID(this.user.id)) {
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('game_saves')
        .select('*')
        .eq('user_id', this.user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: 'active_save',
        map: data.map_data,
        player: data.player_data,
        inventory: data.inventory_data,
        dragons: data.dragons_data,
        codingProgress: data.coding_progress,
        savedAt: new Date(data.updated_at).getTime()
      };
    } catch (err) {
      return null;
    }
  }

  // ==========================================
  // Realtime MMORPG Multiplayer Broadcast
  // ==========================================

  setupRealtimeChannel(onRemotePlayerUpdate = null, onChatMessage = null, onMapUpdated = null) {
    if (!this.client) return;

    if (onRemotePlayerUpdate) this.onRemotePlayerUpdateCallback = onRemotePlayerUpdate;
    if (onChatMessage) this.onChatMessageCallback = onChatMessage;
    if (onMapUpdated) this.onMapUpdatedCallback = onMapUpdated;

    if (this.realtimeChannel) {
      try {
        this.client.removeChannel(this.realtimeChannel);
      } catch (_) {}
    }

    this.onlineUsersCount = 1;
    this.hasDetectedRemotePeers = false;
    const uniqueId = (this.user && !this.user.isGuest && this.user.id) ? this.user.id : this.getGuestUser().id;

    try {
      this.realtimeChannel = this.client.channel('island_world_mmo', {
        config: {
          broadcast: { self: false },
          presence: { key: uniqueId }
        }
      });

      const updatePresenceCount = () => {
        const state = this.realtimeChannel?.presenceState() || {};
        const count = Object.keys(state).length;
        this.onlineUsersCount = count;
        if (count > 1) {
          this.hasDetectedRemotePeers = true;
        }
      };

      this.realtimeChannel
        .on('presence', { event: 'sync' }, updatePresenceCount)
        .on('presence', { event: 'join' }, updatePresenceCount)
        .on('presence', { event: 'leave' }, updatePresenceCount)
        .on('broadcast', { event: 'player_move' }, (payload) => {
          if (payload.payload && this.onRemotePlayerUpdateCallback) {
            this.hasDetectedRemotePeers = true;
            this.onRemotePlayerUpdateCallback(payload.payload);
          }
        })
        .on('broadcast', { event: 'chat_message' }, (payload) => {
          if (payload.payload && this.onChatMessageCallback) {
            this.onChatMessageCallback(payload.payload);
          }
        })
        .on('broadcast', { event: 'map_update' }, (payload) => {
          if (payload.payload && this.onMapUpdatedCallback) {
            this.onMapUpdatedCallback(payload.payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.realtimeChannel.track({
              id: uniqueId,
              nickname: this.user?.nickname || this.user?.user_metadata?.nickname || this.getGuestUser().nickname,
              onlineAt: new Date().toISOString()
            });
          }
        });
    } catch (err) {
      console.warn('[SupabaseClient] Falha ao assinar canal Realtime:', err);
    }
  }

  broadcastPlayerPosition(player, heroId, name, activeDragonId, extraData = {}) {
    if (!this.realtimeChannel) return;
    const uniqueId = (this.user && !this.user.isGuest && this.user.id) ? this.user.id : this.getGuestUser().id;

    this.realtimeChannel.send({
      type: 'broadcast',
      event: 'player_move',
      payload: {
        id: uniqueId,
        name: name || this.profile?.nickname || this.user?.user_metadata?.nickname || this.getGuestUser().nickname,
        heroId,
        x: Math.round(player.x),
        y: Math.round(player.y),
        vx: Math.round(extraData.vx || 0),
        vy: Math.round(extraData.vy || 0),
        direction: player.direction,
        isMoving: Boolean(player.isMoving),
        isSprinting: Boolean(player.isSprinting),
        isMounted: Boolean(player.isMounted),
        activeDragonId: activeDragonId || null,
        avatarConfig: player.customAvatarConfig || extraData.avatarConfig || null,
        scale: player.scale || 1.0,
        dragonMode: extraData.dragonMode || (player.isMounted ? 'mounted' : (activeDragonId ? 'follow' : 'none')),
        flightAltitude: Math.round(extraData.flightAltitude || 0),
        dragonX: extraData.dragonX !== undefined ? Math.round(extraData.dragonX) : null,
        dragonY: extraData.dragonY !== undefined ? Math.round(extraData.dragonY) : null,
        t: Date.now()
      }
    });
  }

  broadcastChatMessage(text, player, senderName) {
    if (!this.realtimeChannel) return;

    this.realtimeChannel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: {
        id: this.user?.id || 'guest',
        senderName: senderName || this.profile?.nickname || this.user?.user_metadata?.nickname || this.user?.nickname || 'Aventureiro',
        text,
        x: Math.round(player.x),
        y: Math.round(player.y)
      }
    });
  }

  broadcastMapUpdate(mapData) {
    if (!this.realtimeChannel || !mapData) return;

    this.realtimeChannel.send({
      type: 'broadcast',
      event: 'map_update',
      payload: {
        id: this.user?.id || 'guest',
        updatedBy: this.profile?.nickname || this.user?.user_metadata?.nickname || this.user?.nickname || 'Aventureiro',
        map: mapData,
        timestamp: Date.now()
      }
    });
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
  }

  notifyAuthChange(event = 'UNKNOWN', session = null) {
    this.listeners.forEach(fn => fn(this.user, this.profile, event, session));
  }
}

export default SupabaseClient;
