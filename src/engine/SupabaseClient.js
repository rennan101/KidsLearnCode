/**
 * SupabaseClient - Motor de Integração Nuvem & MMORPG
 * Gerencia Autenticação (Email/Senha/Guest), Perfis PostgreSQL, Saves na Nuvem
 * e Sincronização em Tempo Real (Supabase Realtime Broadcast & Presence).
 */

import { SUPABASE_CONFIG } from '../config/supabase.js';

export class SupabaseClient {
  constructor() {
    this.url = localStorage.getItem('kidslearn_supabase_url') || SUPABASE_CONFIG.url || '';
    this.anonKey = localStorage.getItem('kidslearn_supabase_key') || SUPABASE_CONFIG.anonKey || '';
    this.client = null;
    this.user = null;
    this.profile = null;
    this.isConfigured = false;
    this.realtimeChannel = null;
    this.listeners = [];
  }

  async init() {
    try {
      // Importa dinamicamente a SDK do Supabase via ESM
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      
      const activeUrl = this.url.trim();
      const activeKey = this.anonKey.trim();

      if (activeUrl && activeUrl.startsWith('https://') && activeKey && activeKey.length > 20) {
        this.client = createClient(activeUrl, activeKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });

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

  getGuestUser() {
    let guestId = localStorage.getItem('kidslearn_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('kidslearn_guest_id', guestId);
    }
    const guestName = localStorage.getItem('kidslearn_guest_name') || `Aventureiro_${guestId.substring(6, 10)}`;
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
    localStorage.setItem('kidslearn_supabase_url', this.url);
    localStorage.setItem('kidslearn_supabase_key', this.anonKey);
    return this.init();
  }

  // ==========================================
  // Autenticação (Login / Cadastro / Guest)
  // ==========================================

  async signUp(email, password, nickname = 'Aventureiro') {
    if (!this.client) {
      return { 
        success: false, 
        error: 'Supabase não conectado. Configure a URL e a Anon Key do projeto nas configurações.' 
      };
    }

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { nickname }
        }
      });

      if (error) return { success: false, error: error.message };

      if (data.session && data.user) {
        this.user = data.user;
        await this.syncUserProfile({ nickname, heroId: 'char_wolf_hunter_m', level: 1, xp: 0, gold: 100 });
        this.notifyAuthChange();
        this.setupRealtimeChannel();
        return { success: true, user: data.user, requiresConfirmation: false };
      } else if (data.user) {
        // Confirmação de e-mail ativada no Supabase
        return { 
          success: true, 
          user: data.user, 
          requiresConfirmation: true,
          message: 'Conta criada com sucesso! Se a confirmação de e-mail estiver ativada, verifique sua caixa de entrada.' 
        };
      }

      return { success: false, error: 'Falha desconhecida no cadastro.' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signIn(email, password) {
    if (!this.client) {
      return { 
        success: false, 
        error: 'Supabase não conectado. Configure a URL e a Anon Key do projeto nas configurações.' 
      };
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { success: false, error: error.message };
      
      this.user = data.user;
      this.profile = await this.getUserProfile();
      this.notifyAuthChange();
      this.setupRealtimeChannel();
      return { success: true, user: data.user, profile: this.profile };
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
  // Saves na Nuvem (PostgreSQL game_saves)
  // ==========================================

  async saveCloudGame(payload) {
    if (!this.client || this.user?.isGuest) {
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

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async loadCloudGame() {
    if (!this.client || this.user?.isGuest) {
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('game_saves')
        .select('*')
        .eq('user_id', this.user.id)
        .single();

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
      console.warn('[SupabaseClient] Erro ao carregar save da nuvem:', err);
      return null;
    }
  }

  // ==========================================
  // Realtime MMORPG Multiplayer Broadcast
  // ==========================================

  setupRealtimeChannel(onRemotePlayerUpdate = () => {}, onChatMessage = () => {}) {
    if (!this.client) return;

    if (this.realtimeChannel) {
      try {
        this.client.removeChannel(this.realtimeChannel);
      } catch (_) {}
    }

    try {
      this.realtimeChannel = this.client.channel('island_world_mmo', {
        config: {
          broadcast: { self: false },
          presence: { key: this.user?.id || 'guest' }
        }
      });

      this.realtimeChannel
        .on('broadcast', { event: 'player_move' }, (payload) => {
          if (payload.payload && onRemotePlayerUpdate) {
            onRemotePlayerUpdate(payload.payload);
          }
        })
        .on('broadcast', { event: 'chat_message' }, (payload) => {
          if (payload.payload && onChatMessage) {
            onChatMessage(payload.payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.realtimeChannel.track({
              id: this.user?.id,
              nickname: this.user?.nickname || this.user?.user_metadata?.nickname || 'Aventureiro',
              onlineAt: new Date().toISOString()
            });
          }
        });
    } catch (err) {
      console.warn('[SupabaseClient] Falha ao assinar canal Realtime:', err);
    }
  }

  broadcastPlayerPosition(player, heroId, name, activeDragonId) {
    if (!this.realtimeChannel) return;

    this.realtimeChannel.send({
      type: 'broadcast',
      event: 'player_move',
      payload: {
        id: this.user?.id || 'guest',
        name: name || this.profile?.nickname || this.user?.user_metadata?.nickname || this.user?.nickname || 'Aventureiro',
        heroId,
        x: Math.round(player.x),
        y: Math.round(player.y),
        direction: player.direction,
        isMoving: player.isMoving,
        isSprinting: player.isSprinting,
        isMounted: player.isMounted,
        activeDragonId
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

  onAuthChange(callback) {
    this.listeners.push(callback);
  }

  notifyAuthChange() {
    this.listeners.forEach(fn => fn(this.user, this.profile));
  }
}

export default SupabaseClient;
