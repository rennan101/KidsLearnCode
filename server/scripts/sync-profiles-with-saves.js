/**
 * server/scripts/sync-profiles-with-saves.js
 * Sincroniza o level, XP e moedas reais gravados nos saves com a tabela profiles.
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

async function sync() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'kidsadmin',
    password: process.env.DB_PASSWORD || 'kidslearn_seguro_local',
    database: process.env.DB_NAME || 'kidslearncode'
  });

  await client.connect();
  console.log('Conectado ao PostgreSQL para sincronização de progresso...');

  const savesRes = await client.query('SELECT user_id, coding_progress, player_data FROM game_saves');

  for (const row of savesRes.rows) {
    const cp = row.coding_progress || {};
    const xp = cp.playerXP || 0;
    const gold = cp.playerGold || 100;
    
    // Cálculo do Level baseado no XP (ex: ~200 XP por level)
    const level = Math.max(1, Math.floor(xp / 200) + 1);
    const pd = row.player_data || {};
    const x = pd.x || 320;
    const y = pd.y || 320;

    await client.query(
      `UPDATE profiles SET
        level = $1,
        xp = $2,
        gold = $3,
        x = $4,
        y = $5
       WHERE id = $6`,
      [level, xp, gold, x, y, row.user_id]
    );

    console.log(`✅ Usuário ${row.user_id}: Atualizado para Level ${level}, ${xp} XP, ${gold} Ouro.`);
  }

  await client.end();
  console.log('🎉 Sincronização concluída!');
}

sync().catch(console.error);
