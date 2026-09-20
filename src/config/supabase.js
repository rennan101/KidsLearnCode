/**
 * Supabase Configuration - KidsLearnCode MMORPG
 * - Exportação síncrona segura para navegadores sem bundler
 */

export const SUPABASE_CONFIG = {
  url: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_URL || window.__ENV__?.SUPABASE_URL))
    || 'https://ouvkqvgnqezstgafnyto.supabase.co',

  anonKey: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY))
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmtxdmducWV6c3RnYWZueXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzAyODAsImV4cCI6MjEwNTUwNjI4MH0.kgFaffwAzESQwbvSDj2vv1HNPbUvxVDjPQJuKgeaS-M'
};

export default SUPABASE_CONFIG;
