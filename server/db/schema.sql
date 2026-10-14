-- =========================================================================
-- KidsLearnCode MMORPG - PostgreSQL Schema Nativo para Servidor Mac mini
-- =========================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Autenticação de Usuários (Substitui auth.users do Supabase)
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT,
  confirmation_token_expires_at TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  parent_email TEXT,
  is_minor BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'player', -- 'player', 'admin', 'moderator'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida de autenticação
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_auth_users_reset_token ON auth_users (reset_token);
CREATE INDEX IF NOT EXISTS idx_auth_users_conf_token ON auth_users (confirmation_token);

-- 2. Tabela de Perfis de Jogadores (MMORPG Stats)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT 'Aventureiro',
  hero_id TEXT NOT NULL DEFAULT 'char_wolf_hunter_m',
  x INTEGER NOT NULL DEFAULT 320,
  y INTEGER NOT NULL DEFAULT 320,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  last_online TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles (LOWER(nickname));

-- 3. Tabela de Game Saves (Mapa Global, Inventário, Dragões, Código)
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  map_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  player_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  inventory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  dragons_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  coding_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves (user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_updated_at ON game_saves (updated_at DESC);

-- 4. Tabela de World Tiles (Edições colaborativas no mundo)
CREATE TABLE IF NOT EXISTS world_tiles (
  id TEXT PRIMARY KEY, -- formato "layer:x:y"
  layer TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  tile_id TEXT NOT NULL,
  placed_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  placed_by_name TEXT DEFAULT 'Aventureiro',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_tiles_coords ON world_tiles (layer, x, y);

-- 5. Tabela de Chat Log Global
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  hero_id TEXT DEFAULT 'char_wolf_hunter_m',
  message TEXT NOT NULL,
  x INTEGER,
  y INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at DESC);

-- 6. Tabela de Auditoria e Backups do Servidor
CREATE TABLE IF NOT EXISTS server_backups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);
