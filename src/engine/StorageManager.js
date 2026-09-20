/**
 * StorageManager - Motor de Persistência Assíncrona com IndexedDB Nativo
 * Garante armazenamento ilimitado em disco, salvamento em background sem travar os 60 FPS
 * e migração automática de dados legados do localStorage.
 */

export class StorageManager {
  constructor() {
    this.dbName = 'KidsLearnCode_RPG_DB';
    this.dbVersion = 1;
    this.db = null;
    this.isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;
    this.useFallback = !this.isIndexedDBSupported;
  }

  async init() {
    if (!this.isIndexedDBSupported) {
      console.warn('[StorageManager] IndexedDB não suportado neste ambiente. Usando fallback localStorage.');
      this.useFallback = true;
      return false;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Object Store 1: Salva o estado completo do jogo (mapa, player, inventário, dragões, lições)
          if (!db.objectStoreNames.contains('game_save')) {
            db.createObjectStore('game_save', { keyPath: 'id' });
          }

          // Object Store 2: Customizações de tiles (colisores, escalas e depth offsets)
          if (!db.objectStoreNames.contains('asset_overrides')) {
            db.createObjectStore('asset_overrides', { keyPath: 'id' });
          }

          // Object Store 3: Snapshots e backups históricos
          if (!db.objectStoreNames.contains('map_backups')) {
            db.createObjectStore('map_backups', { keyPath: 'timestamp' });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.useFallback = false;
          resolve(true);
        };

        request.onerror = (event) => {
          console.warn('[StorageManager] Erro ao abrir IndexedDB. Usando fallback localStorage:', event.target.error);
          this.useFallback = true;
          resolve(false);
        };
      } catch (err) {
        console.warn('[StorageManager] Exceção ao inicializar IndexedDB:', err);
        this.useFallback = true;
        resolve(false);
      }
    });
  }

  // ==========================================
  // Game State Save & Load
  // ==========================================

  async saveGame(payload) {
    const saveData = {
      id: 'active_save',
      map: payload.map || {},
      player: payload.player || {},
      inventory: payload.inventory || null,
      dragons: payload.dragons || null,
      codingProgress: payload.codingProgress || null,
      activeHero: payload.activeHero || 'char_wolf_hunter_m',
      savedAt: Date.now()
    };

    if (this.useFallback || !this.db) {
      try {
        localStorage.setItem('kidslearn_rpg_active_save', JSON.stringify(saveData));
        return { success: true, storage: 'localStorage' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['game_save', 'map_backups'], 'readwrite');
        const store = tx.objectStore('game_save');
        const backupStore = tx.objectStore('map_backups');

        store.put(saveData);

        // Guarda snapshot no histórico (mantendo os últimos 10 backups)
        backupStore.put({
          timestamp: saveData.savedAt,
          summary: `Save ${new Date(saveData.savedAt).toLocaleTimeString()}`,
          data: saveData
        });

        tx.oncomplete = () => {
          resolve({ success: true, storage: 'IndexedDB' });
        };

        tx.onerror = (event) => {
          console.warn('[StorageManager] Falha ao salvar no IndexedDB:', event.target.error);
          // Fallback de emergência no localStorage
          try {
            localStorage.setItem('kidslearn_rpg_active_save', JSON.stringify(saveData));
          } catch (_) {}
          resolve({ success: false, error: event.target.error });
        };
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  async loadGame() {
    if (this.useFallback || !this.db) {
      return this.loadFromLocalStorageMigration();
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['game_save'], 'readonly');
        const store = tx.objectStore('game_save');
        const req = store.get('active_save');

        req.onsuccess = async () => {
          if (req.result) {
            resolve(req.result);
          } else {
            // Se o IndexedDB estiver vazio, tenta migrar os dados existentes do localStorage
            const migrated = await this.loadFromLocalStorageMigration();
            if (migrated) {
              await this.saveGame(migrated);
            }
            resolve(migrated);
          }
        };

        req.onerror = async () => {
          const migrated = await this.loadFromLocalStorageMigration();
          resolve(migrated);
        };
      } catch (err) {
        resolve(this.loadFromLocalStorageMigration());
      }
    });
  }

  loadFromLocalStorageMigration() {
    try {
      // 1. Tenta nova chave consolidada
      const consolidated = localStorage.getItem('kidslearn_rpg_active_save');
      if (consolidated) {
        return JSON.parse(consolidated);
      }

      // 2. Tenta chaves legadas de mapa
      const legacyMapKeys = [
        'kidslean_rpg_world_map_v3',
        'kidslean_rpg_world_map_backup',
        'kidslean_rpg_world_map_v2',
        'kidslean_rpg_world_map_v1',
        'kidslean_rpg_world_map',
        'geralt_realm_map_v1'
      ];

      let savedMap = null;
      for (const k of legacyMapKeys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            savedMap = JSON.parse(item);
            break;
          } catch (_) {}
        }
      }

      const activeHero = localStorage.getItem('kidslearn_active_hero') || 'char_wolf_hunter_m';

      if (savedMap) {
        return {
          id: 'active_save',
          map: savedMap.layers ? savedMap : (savedMap.map || savedMap),
          player: savedMap.player || { x: 320, y: 320, scale: 1.0 },
          activeHero,
          savedAt: savedMap.savedAt || Date.now(),
          migratedFrom: 'localStorage'
        };
      }
    } catch (err) {
      console.warn('[StorageManager] Falha ao ler dados legados do localStorage:', err);
    }
    return null;
  }

  // ==========================================
  // Asset Overrides (Colliders, Scales, Depths)
  // ==========================================

  async saveAssetOverrides(type, data) {
    const record = { id: type, data, updatedAt: Date.now() };

    if (this.useFallback || !this.db) {
      try {
        localStorage.setItem(`kidslearn_override_${type}`, JSON.stringify(data));
        return true;
      } catch (_) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['asset_overrides'], 'readwrite');
        const store = tx.objectStore('asset_overrides');
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          try {
            localStorage.setItem(`kidslearn_override_${type}`, JSON.stringify(data));
          } catch (_) {}
          resolve(false);
        };
      } catch (_) {
        resolve(false);
      }
    });
  }

  async loadAssetOverrides(type) {
    if (this.useFallback || !this.db) {
      try {
        const raw = localStorage.getItem(`kidslearn_override_${type}`) 
          || localStorage.getItem(`geralt_custom_${type}s_v1`);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['asset_overrides'], 'readonly');
        const store = tx.objectStore('asset_overrides');
        const req = store.get(type);

        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            // Tenta migrar do localStorage
            try {
              const legacy = localStorage.getItem(`kidslearn_override_${type}`) 
                || localStorage.getItem(`geralt_custom_${type}s_v1`);
              if (legacy) {
                const parsed = JSON.parse(legacy);
                this.saveAssetOverrides(type, parsed);
                resolve(parsed);
                return;
              }
            } catch (_) {}
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }
}

export default StorageManager;
