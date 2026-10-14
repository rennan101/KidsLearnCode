/**
 * export-supabase.js
 * Script para extrair todas as tabelas e dados salvos no Supabase atual
 * e gerar um arquivo de backup JSON e SQL para migração no Mac mini.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ouvkqvgnqezstgafnyto.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmtxdmducWV6c3RnYWZueXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzAyODAsImV4cCI6MjEwNTUwNjI4MH0.kgFaffwAzESQwbvSDj2vv1HNPbUvxVDjPQJuKgeaS-M';

const TABLES = ['profiles', 'game_saves', 'world_tiles', 'chat_messages'];

async function fetchTable(table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  console.log(`[Export] Baixando dados da tabela ${table}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Export] Aviso na tabela ${table}: ${res.status} - ${errText}`);
      return [];
    }

    const data = await res.json();
    console.log(`[Export] ${table}: ${Array.isArray(data) ? data.length : 0} registros encontrados.`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`[Export] Erro ao buscar tabela ${table}:`, err.message);
    return [];
  }
}

async function run() {
  console.log('====================================================');
  console.log('📦 KidsLearnCode - Exportador de Migração Supabase');
  console.log(`Origem: ${SUPABASE_URL}`);
  console.log('====================================================\n');

  const exportData = {
    exportedAt: new Date().toISOString(),
    sourceUrl: SUPABASE_URL,
    tables: {}
  };

  for (const table of TABLES) {
    exportData.tables[table] = await fetchTable(table);
  }

  const outDir = path.resolve(__dirname, '../db/migrations');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Salva arquivo JSON completo
  const jsonPath = path.join(outDir, 'supabase_backup.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf-8');
  console.log(`\n✅ Backup JSON gerado com sucesso em: ${jsonPath}`);

  // 2. Gera script SQL de inserção para o PostgreSQL local
  let sqlContent = `-- =========================================================================\n`;
  sqlContent += `-- Migração dos dados do Supabase para o PostgreSQL Local do Mac mini\n`;
  sqlContent += `-- Data da extração: ${exportData.exportedAt}\n`;
  sqlContent += `-- =========================================================================\n\n`;

  // Migração de Users e Profiles
  const profiles = exportData.tables.profiles || [];
  if (profiles.length > 0) {
    sqlContent += `-- 1. Inserir Usuários e Perfis\n`;
    for (const p of profiles) {
      const email = `${p.nickname.toLowerCase().replace(/[^a-z0-9]/g, '')}@kidslearncode.local`;
      sqlContent += `INSERT INTO auth_users (id, email, password_hash, email_confirmed, role, created_at)
VALUES ('${p.id}', '${email}', '$2b$10$defaultPlaceholderHashNeedsPasswordReset', TRUE, 'player', '${p.created_at || new Date().toISOString()}')
ON CONFLICT (id) DO NOTHING;\n`;

      sqlContent += `INSERT INTO profiles (id, nickname, hero_id, x, y, level, xp, gold, last_online, created_at)
VALUES ('${p.id}', '${p.nickname.replace(/'/g, "''")}', '${(p.hero_id || 'char_wolf_hunter_m').replace(/'/g, "''")}', ${p.x || 320}, ${p.y || 320}, ${p.level || 1}, ${p.xp || 0}, ${p.gold || 100}, '${p.last_online || new Date().toISOString()}', '${p.created_at || new Date().toISOString()}')
ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  hero_id = EXCLUDED.hero_id,
  x = EXCLUDED.x,
  y = EXCLUDED.y,
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  gold = EXCLUDED.gold,
  last_online = EXCLUDED.last_online;\n\n`;
    }
  }

  // Migração de Game Saves
  const saves = exportData.tables.game_saves || [];
  if (saves.length > 0) {
    sqlContent += `-- 2. Inserir Game Saves Unificados (Mapas, Inventários, Dragões e Código)\n`;
    for (const s of saves) {
      const mapJson = JSON.stringify(s.map_data || {}).replace(/'/g, "''");
      const playerJson = JSON.stringify(s.player_data || {}).replace(/'/g, "''");
      const invJson = JSON.stringify(s.inventory_data || {}).replace(/'/g, "''");
      const dragonsJson = JSON.stringify(s.dragons_data || {}).replace(/'/g, "''");
      const codeJson = JSON.stringify(s.coding_progress || {}).replace(/'/g, "''");

      sqlContent += `INSERT INTO game_saves (id, user_id, map_data, player_data, inventory_data, dragons_data, coding_progress, updated_at)
VALUES ('${s.id}', '${s.user_id}', '${mapJson}'::jsonb, '${playerJson}'::jsonb, '${invJson}'::jsonb, '${dragonsJson}'::jsonb, '${codeJson}'::jsonb, '${s.updated_at || new Date().toISOString()}')
ON CONFLICT (user_id) DO UPDATE SET
  map_data = EXCLUDED.map_data,
  player_data = EXCLUDED.player_data,
  inventory_data = EXCLUDED.inventory_data,
  dragons_data = EXCLUDED.dragons_data,
  coding_progress = EXCLUDED.coding_progress,
  updated_at = EXCLUDED.updated_at;\n\n`;
    }
  }

  const sqlPath = path.join(outDir, 'supabase_migration.sql');
  fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
  console.log(`✅ Script SQL gerado com sucesso em: ${sqlPath}`);
  console.log('====================================================\n');
}

run();
