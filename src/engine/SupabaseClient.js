/**
 * SupabaseClient - Motor de Integração Nativa com o Servidor Dedicado (Zero-Supabase Cloud)
 * - 100% Independente do Supabase (Zero limites de cota / Zero chamadas externas ao supabase.co)
 * - Conecta exclusivamente ao Banco de Dados Nativo Embutido do Servidor KidsLearnCode
 * - Persiste sessão JWT local e restaura automaticamente perfil, roupas, ovos, itens e dragões
 */

import { SUPABASE_CONFIG, getActiveServerUrl } from '../config/supabase.js';

export class SupabaseClient {
  constructor() {
    this.url = SUPABASE_CONFIG.url || 'http://localhost:8080';
    this.anonKey = SUPABASE_CONFIG.anonKey || '';
    this.client = null;
    this.user = null;
    this.profile = null;
    this.isConfigured = true;
    this.realtimeChannel = null;
    this.listeners = [];
    this.initPromise = null;

    this.onRemotePlayerUpdateCallback = null;
    this.onChatMessageCallback = null;
    this.onMapUpdatedCallback = null;
    this.multiplayerClient = null;
    this.onlineUsersCount = 1;
    this.hasDetectedRemotePeers = false;
  }

  attachMultiplayer(multiplayerClient) {
    this.multiplayerClient = multiplayerClient;
  }

  async getServerUrl(forceRefresh = false) {
    const url = await getActiveServerUrl(forceRefresh);
    if (url) this.url = url;
    return url || this.url || 'http://localhost:8080';
  }

  getDefaultHeaders(authToken = '') {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.url && this.url.includes('.loca.lt')) {
      headers['Bypass-Tunnel-Reminder'] = 'true';
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    try {
      const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
      const cachedUserStr = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_user')) || '';

      if (authToken) {
        if (cachedUserStr) {
          try {
            this.user = JSON.parse(cachedUserStr);
          } catch (_) {}
        }

        const profile = await this.getUserProfile();
        if (profile && profile.id) {
          this.profile = profile;
          const cleanNick = (profile.nickname || 'aventureiro').toLowerCase();
          const defaultEmail = cleanNick === 'rennan' ? 'rennancr93@gmail.com' : (cleanNick === 'duda' ? 'eduardasa@gmail.com' : `${cleanNick}@gmail.com`);
          const resolvedEmail = profile.email || (this.user?.email && !this.user.email.endsWith('@kidslearncode.local') ? this.user.email : defaultEmail);
          this.user = {
            id: profile.id,
            email: resolvedEmail,
            role: profile.role || this.user?.role || ((cleanNick === 'rennan' || cleanNick === 'duda') ? 'admin' : 'player'),
            nickname: profile.nickname,
            isGuest: false
          };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('kidslearn_auth_user', JSON.stringify(this.user));
          }
          this.isConfigured = true;
          this.notifyAuthChange('SIGNED_IN', { user: this.user, token: authToken });
          return { success: true, user: this.user, isConfigured: true };
        }
      }
    } catch (err) {
      console.warn('[NativeServerClient] Aviso ao restaurar sessão:', err.message);
    }

    this.user = this.getGuestUser();
    this.isConfigured = true;
    return { success: true, user: this.user, isConfigured: true };
  }

  async ensureClient() {
    return null;
  }

  getGuestUser() {
    let guestId = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_guest_id')) || '';
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      if (typeof localStorage !== 'undefined') localStorage.setItem('kidslearn_guest_id', guestId);
    }
    const guestName = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_guest_name')) || 'Aventureiro';
    return {
      id: guestId,
      email: `${guestId}@gmail.com`,
      isGuest: true,
      nickname: guestName
    };
  }

  setCredentials(url, key) {
    this.url = url.trim();
    this.anonKey = (key || '').trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kidslearn_custom_server_url', this.url);
    }
    this.initPromise = null;
    return this.init();
  }

  getRedirectUrl() {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin + (window.location.pathname || '/');
    }
    return 'http://localhost:8080/';
  }

  // ==========================================
  // Autenticação Nativa (Login / Cadastro / Recuperação)
  // ==========================================

  async signUp(email, password, nickname = 'Aventureiro', extraData = {}) {
    try {
      let activeUrl = await this.getServerUrl();
      const isMinor = extraData.isOver18 === false;
      const parentEmail = extraData.parentEmail || null;

      let res;
      try {
        res = await fetch(`${activeUrl}/api/auth/signup`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email, password, nickname, isOver18: extraData.isOver18 ?? true, parentEmail })
        });
      } catch (_) {
        activeUrl = await this.getServerUrl(true);
        res = await fetch(`${activeUrl}/api/auth/signup`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email, password, nickname, isOver18: extraData.isOver18 ?? true, parentEmail })
        });
      }

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (!data.requiresConfirmation) {
          this.user = { ...data.user, isGuest: false, nickname: data.profile?.nickname || nickname };
          this.profile = data.profile || null;
          if (typeof localStorage !== 'undefined') {
            if (data.token) localStorage.setItem('kidslearn_auth_token', data.token);
            localStorage.setItem('kidslearn_auth_user', JSON.stringify(this.user));
          }
          await this.syncUserProfile({ nickname, heroId: 'char_wolf_hunter_m', level: 1, xp: 0, gold: 100 });
          this.notifyAuthChange('SIGNED_IN', { user: this.user, token: data.token });
          return { success: true, user: this.user, requiresConfirmation: false };
        } else {
          return {
            success: true,
            user: data.user,
            requiresConfirmation: true,
            isMinor,
            confirmTarget: isMinor && parentEmail ? parentEmail : email,
            message: data.message
          };
        }
      }
      return { success: false, error: data.error || 'Não foi possível criar a conta.' };
    } catch (err) {
      return {
        success: false,
        error: 'Não foi possível conectar ao servidor dedicado. Verifique se o servidor está ligado.'
      };
    }
  }

  async signIn(email, password) {
    try {
      let activeUrl = await this.getServerUrl();
      let res;
      try {
        res = await fetch(`${activeUrl}/api/auth/signin`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email, password })
        });
      } catch (_) {
        activeUrl = await this.getServerUrl(true);
        res = await fetch(`${activeUrl}/api/auth/signin`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email, password })
        });
      }

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        this.profile = data.profile || null;
        this.user = {
          ...data.user,
          isGuest: false,
          nickname: data.profile?.nickname || data.user.nickname || 'Aventureiro'
        };
        if (typeof localStorage !== 'undefined') {
          if (data.token) localStorage.setItem('kidslearn_auth_token', data.token);
          localStorage.setItem('kidslearn_auth_user', JSON.stringify(this.user));
        }
        if (!this.profile) {
          this.profile = await this.getUserProfile();
        }
        this.notifyAuthChange('SIGNED_IN', { user: this.user, token: data.token });
        return { success: true, user: this.user, profile: this.profile };
      }
      return { success: false, error: data.error || 'E-mail ou senha incorretos.' };
    } catch (err) {
      return {
        success: false,
        error: 'Não foi possível conectar ao servidor dedicado. Verifique se o servidor está online.'
      };
    }
  }

  async resetPassword(email) {
    try {
      let activeUrl = await this.getServerUrl();
      let res;
      try {
        res = await fetch(`${activeUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email })
        });
      } catch (_) {
        activeUrl = await this.getServerUrl(true);
        res = await fetch(`${activeUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: JSON.stringify({ email })
        });
      }

      const data = await res.json();
      if (data.success || res.ok) {
        return {
          success: true,
          message: data.message || `Link de recuperação gerado para ${email}.`,
          resetLink: data.resetLink || null,
          simulated: !!data.simulated
        };
      }
      return { success: false, error: data.error || 'Não foi possível gerar recuperação de senha.' };
    } catch (err) {
      return {
        success: false,
        error: 'Não foi possível conectar ao servidor dedicado.'
      };
    }
  }

  async updatePassword(newPassword) {
    try {
      let activeUrl = await this.getServerUrl();
      const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
      const token = this._activeResetToken || null;

      let res;
      try {
        res = await fetch(`${activeUrl}/api/auth/update-password`, {
          method: 'POST',
          headers: this.getDefaultHeaders(authToken),
          body: JSON.stringify({ newPassword, token })
        });
      } catch (_) {
        activeUrl = await this.getServerUrl(true);
        res = await fetch(`${activeUrl}/api/auth/update-password`, {
          method: 'POST',
          headers: this.getDefaultHeaders(authToken),
          body: JSON.stringify({ newPassword, token })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message || 'Sua senha foi redefinida com sucesso!' };
      }
      return { success: false, error: data.error || 'Erro ao atualizar a senha.' };
    } catch (err) {
      return { success: false, error: 'Não foi possível conectar ao servidor dedicado.' };
    }
  }

  async signOut() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('kidslearn_auth_token');
      localStorage.removeItem('kidslearn_auth_user');
    }
    this.user = this.getGuestUser();
    this.profile = null;
    this.notifyAuthChange('SIGNED_OUT');
    return { success: true };
  }

  // ==========================================
  // Perfis & Saves no Banco Embutido do Servidor
  // ==========================================

  async getUserProfile() {
    const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
    if (!authToken) return null;

    try {
      const baseUrl = await this.getServerUrl();
      const res = await fetch(`${baseUrl}/api/profiles/me`, {
        headers: this.getDefaultHeaders(authToken)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          this.profile = data;
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  async syncUserProfile(profileData = {}) {
    if (this.user?.isGuest) return null;
    const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
    if (!authToken) return null;

    try {
      const baseUrl = await this.getServerUrl();
      const res = await fetch(`${baseUrl}/api/profiles/sync`, {
        method: 'POST',
        headers: this.getDefaultHeaders(authToken),
        body: JSON.stringify({
          nickname: profileData.nickname || this.profile?.nickname || this.user?.nickname || 'Aventureiro',
          heroId: profileData.heroId || 'char_wolf_hunter_m',
          x: profileData.x || 320,
          y: profileData.y || 320,
          level: profileData.level || 1,
          xp: profileData.xp || 0,
          gold: profileData.gold || 100
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          this.profile = data;
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  static GLOBAL_MAP_UUID = '00000000-0000-0000-0000-000000000001';

  isValidUUID(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !id.startsWith('guest_');
  }

  async saveGlobalWorldMap(mapData, updatedBy = null) {
    if (!mapData) return { success: false, reason: 'offline_or_invalid_map' };
    const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
    const senderId = this.multiplayerClient?.playerId || this.user?.id || null;
    const clientSessionId = this.multiplayerClient?.clientSessionId || null;
    const senderName = updatedBy || this.profile?.nickname || this.user?.nickname || 'Aventureiro';

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const baseUrl = await this.getServerUrl(attempt > 0);
        const res = await fetch(`${baseUrl}/api/world/global-map`, {
          method: 'POST',
          headers: this.getDefaultHeaders(authToken),
          body: JSON.stringify({
            map: mapData,
            senderId,
            clientSessionId,
            updatedBy: senderName
          })
        });
        if (res.ok) return { success: true };
        if (res.status < 500) break;
      } catch (_) {}
    }
    return { success: false, reason: 'offline_or_invalid_map' };
  }

  async loadGlobalWorldMap() {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const baseUrl = await this.getServerUrl(attempt > 0);
        const headers = {};
        if (baseUrl.includes('.loca.lt')) headers['Bypass-Tunnel-Reminder'] = 'true';
        const res = await fetch(`${baseUrl}/api/world/global-map`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.map) {
            return {
              map: data.map,
              updatedAt: data.updatedAt || Date.now()
            };
          }
        }
        if (res.status < 500) break;
      } catch (_) {}
    }
    return null;
  }

  async saveCloudGame(payload, force = false) {
    if (!this.user || this.user.isGuest) {
      return { success: false, reason: 'guest_or_offline' };
    }
    const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
    if (!authToken) return { success: false, reason: 'no_token' };

    // Envia apenas os dados pessoais do jogador (~1.8 KB), NUNCA o mapa global de 809 KB
    const saveBodyObj = {
      player: payload.player || {},
      inventory: payload.inventory || {},
      dragons: payload.dragons || {},
      codingProgress: payload.codingProgress || {},
      customAvatar: payload.customAvatar || payload.player?.customAvatar || null,
      activeHero: payload.activeHero || payload.player?.activeHero || 'char_wolf_hunter_m'
    };

    const bodyString = JSON.stringify(saveBodyObj);
    if (!force && this.lastSavedFingerprint === bodyString) {
      return { success: true, cached: true };
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const baseUrl = await this.getServerUrl(attempt > 0);
        const res = await fetch(`${baseUrl}/api/saves`, {
          method: 'POST',
          headers: this.getDefaultHeaders(authToken),
          body: bodyString
        });
        if (res.ok) {
          this.lastSavedFingerprint = bodyString;
          return { success: true };
        }
        if (res.status < 500) break;
      } catch (_) {}
    }
    return { success: false, reason: 'network_error' };
  }

  async loadCloudGame() {
    if (!this.user || this.user.isGuest) return null;
    const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('kidslearn_auth_token')) || '';
    if (!authToken) return null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const baseUrl = await this.getServerUrl(attempt > 0);
        const res = await fetch(`${baseUrl}/api/saves/me`, {
          headers: this.getDefaultHeaders(authToken)
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const pData = data.player || {};
            return {
              ...data,
              customAvatar: data.customAvatar || pData.customAvatar || null,
              activeHero: data.activeHero || pData.activeHero || pData.heroId || 'char_wolf_hunter_m'
            };
          }
        }
        if (res.status < 500) break;
      } catch (_) {}
    }
    return null;
  }

  // ==========================================
  // Compatibilidade de Canal (O Multiplayer real roda via WebSocket em MultiplayerClient.js)
  // ==========================================

  setupRealtimeChannel(onRemotePlayerUpdate = null, onChatMessage = null, onMapUpdated = null) {
    if (onRemotePlayerUpdate) this.onRemotePlayerUpdateCallback = onRemotePlayerUpdate;
    if (onChatMessage) this.onChatMessageCallback = onChatMessage;
    if (onMapUpdated) this.onMapUpdatedCallback = onMapUpdated;
  }

  broadcastPlayerPosition() {}
  broadcastChatMessage() {}

  broadcastMapUpdate(mapData, updatedBy = null) {
    if (this.multiplayerClient && typeof this.multiplayerClient.sendMapUpdate === 'function') {
      const senderName = updatedBy || this.profile?.nickname || this.user?.nickname || 'Aventureiro';
      this.multiplayerClient.sendMapUpdate(mapData, senderName);
    }
  }

  broadcastCustomEvent(payload) {
    if (this.multiplayerClient && typeof this.multiplayerClient.sendCustomEvent === 'function') {
      this.multiplayerClient.sendCustomEvent(payload);
    }
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
  }

  notifyAuthChange(event = 'UNKNOWN', session = null) {
    this.listeners.forEach(fn => fn(this.user, this.profile, event, session));
  }
}

export default SupabaseClient;
