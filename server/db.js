/**
 * db.js
 * Gerenciador de conexão com o PostgreSQL nativo do Mac mini (pg Pool)
 */

import pg from 'pg';

const { Pool } = pg;

export class Database {
  constructor(config = {}) {
    this.pool = new Pool({
      host: config.DB_HOST || '127.0.0.1',
      port: parseInt(config.DB_PORT || '5432', 10),
      database: config.DB_NAME || 'kidslearncode',
      user: config.DB_USER || 'kidsadmin',
      password: config.DB_PASSWORD || 'kidslearn_seguro_local',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    this.pool.on('error', (err) => {
      console.error('[PostgreSQL] Erro inesperado no pool de conexões:', err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development' && duration > 50) {
        console.log(`[PostgreSQL] Query lenta (${duration}ms):`, text);
      }
      return res;
    } catch (err) {
      console.error('[PostgreSQL] Falha na execução da query:', err.message, text);
      throw err;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async healthCheck() {
    try {
      const res = await this.query('SELECT NOW() as current_time, count(*) from profiles');
      return {
        healthy: true,
        time: res.rows[0].current_time,
        profilesCount: parseInt(res.rows[0].count, 10)
      };
    } catch (err) {
      return {
        healthy: false,
        error: err.message
      };
    }
  }
}
