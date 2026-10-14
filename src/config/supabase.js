/**
 * Supabase Configuration - KidsLearnCode MMORPG
 * - Exportação síncrona segura para navegadores sem bundler
 */

export const SUPABASE_CONFIG = {
  url: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_URL || window.__ENV__?.SUPABASE_URL))
    || 'https://baltimore-ste-rod-loves.trycloudflare.com',

  anonKey: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY))
    || 'kidslearncode_macmini_dedicated_token_2026'
};

export default SUPABASE_CONFIG;
