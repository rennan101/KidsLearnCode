/**
 * SupabaseClient - Motor de Integração Nuvem & MMORPG
 * Gerencia Autenticação (Email/Google/Guest), Saves na Nuvem PostgreSQL
 * e Sincronização em Tempo Real (Supabase Realtime Broadcast & Presence).
 */

const DEFAULT_SUPABASE_URL = 'https://xyzcompany.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Placeholder público demo

export class SupabaseClient {
  constructor() {
    this.url = localStorage.getItem('kidslearn_supabase_url') || DEFAULT_SUPABASE_URL;
    this.anonKey = localStorage.getItem('kidslearn_supabase_key') || DEFAULT_SUPABASE_KEY;
    this.client = null;
    this.user = null;
    this.isConfigured = false;
    this.realtimeChannel = null;
    this.listeners = [];
  }

  async init() {
    try {
      // Importa dinamicamente a SDK do Supabase via ESM
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      
      // Valida se a URL é um endpoint válido de projeto Supabase
      if (this.url && this.url.startsWith('https://') && this.anonKey && this.anonKey.length > 20) {
        this.client = createClient(this.url, this.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });

        const { data: { session } } = await this.client.auth.getSession();
        if (session && session.user) {
          this.user = session.user;
        } else {
          // Se não houver sessão ativa, cria/restaura conta de Convidado (Guest)
          this.user = this.getGuestUser();
        }

        this.isConfigured = true;
        this.setupRealtimeChannel();
        return { success: true, user: this.user };
      }
    } catch (err) {
      console.warn('[SupabaseClient] Modo Nuvem offline/local:', err.message);
    }

    this.user = this.getGuestUser();
    return { success: false, user: this.user };
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
    if (!this.client) return { success: false, error: 'Supabase não conectado.' };

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { nickname }
        }
      });

      if (error) return { success: false, error: error.message };
      this.user = data.user;
      this.notifyAuthChange();
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signIn(email, password) {
    if (!this.client) return { success: false, error: 'Supabase não conectado.' };

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { success: false, error: error.message };
      this.user = data.user;
      this.notifyAuthChange();
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async signOut() {
    if (this.client && !this.user?.isGuest) {
      await this.client.auth.signOut();
    }
    this.user = this.getGuestUser();
    this.notifyAuthChange();
    return { success: true };
  }

  // ==========================================
  // Saves na Nuvem (PostgreSQL)
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
        .subscribe();
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
        name: name || this.user?.nickname || 'Aventureiro',
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
        senderName: senderName || this.user?.nickname || 'Aventureiro',
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
    this.listeners.forEach(fn => fn(this.user));
  }
}

export default SupabaseClient;
