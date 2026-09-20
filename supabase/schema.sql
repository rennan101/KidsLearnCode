-- =========================================================================
-- KidsLearnCode MMORPG - Supabase Database Schema (PostgreSQL)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Player Accounts & MMORPG Stats)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null default 'Aventureiro',
  hero_id text not null default 'char_wolf_hunter_m',
  x integer not null default 320,
  y integer not null default 320,
  level integer not null default 1,
  xp integer not null default 0,
  gold integer not null default 100,
  last_online timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Game Saves Table (Full Unified Cloud Saves: Map, Inventory, Dragons & Code)
create table if not exists public.game_saves (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  map_data jsonb not null default '{}'::jsonb,
  player_data jsonb not null default '{}'::jsonb,
  inventory_data jsonb not null default '{}'::jsonb,
  dragons_data jsonb not null default '{}'::jsonb,
  coding_progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. World Shared Tiles (MMORPG Synchronized World Modifications)
create table if not exists public.world_tiles (
  id text primary key, -- formatted as "layer:x:y"
  layer text not null,
  x integer not null,
  y integer not null,
  tile_id text not null,
  placed_by uuid references auth.users on delete set null,
  placed_by_name text default 'Aventureiro',
  updated_at timestamptz default now()
);

-- 4. Chat Messages Table (Global MMO Chat Log)
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  sender_name text not null,
  hero_id text default 'char_wolf_hunter_m',
  message text not null,
  x integer,
  y integer,
  created_at timestamptz default now()
);

-- =========================================================================
-- Row Level Security (RLS) Policies
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;
alter table public.world_tiles enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles: Anyone can read, user can update their own
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Game Saves: User can only read and write their own save
create policy "Users can view their own game save" 
  on public.game_saves for select using (auth.uid() = user_id);

create policy "Users can insert their own game save" 
  on public.game_saves for insert with check (auth.uid() = user_id);

create policy "Users can update their own game save" 
  on public.game_saves for update using (auth.uid() = user_id);

-- World Tiles: Public read, authenticated or guest insert/update
create policy "World tiles viewable by everyone" 
  on public.world_tiles for select using (true);

create policy "Authenticated users can modify world tiles" 
  on public.world_tiles for all using (true);

-- Chat Messages: Public read, authenticated/guest insert
create policy "Chat messages viewable by everyone" 
  on public.chat_messages for select using (true);

create policy "Anyone can send chat messages" 
  on public.chat_messages for insert with check (true);

-- =========================================================================
-- Realtime Replication
-- =========================================================================

-- Enable Realtime for live player movement, chat and world tile changes
alter publication supabase_realtime add table public.world_tiles;
alter publication supabase_realtime add table public.chat_messages;
