/**
 * Supabase Configuration - KidsLearnCode MMORPG
 * - Arquivo público para o repositório GitHub
 * - As credenciais reais são lidas de variáveis de ambiente (Vercel)
 *   ou do arquivo local privado não rastreado (src/config/supabase.local.js)
 */

let localConfig = {};
try {
  // Carregamento dinâmico do arquivo local se existir no ambiente de dev
  const localModule = await import('./supabase.local.js').catch(() => null);
  if (localModule && localModule.LOCAL_SUPABASE_CONFIG) {
    localConfig = localModule.LOCAL_SUPABASE_CONFIG;
  }
} catch (_) {}

export const SUPABASE_CONFIG = {
  url: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_URL || window.__ENV__?.SUPABASE_URL))
    || localConfig.url
    || '',

  anonKey: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY))
    || localConfig.anonKey
    || ''
};

export default SUPABASE_CONFIG;
