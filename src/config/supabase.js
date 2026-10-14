/**
 * Supabase Configuration & Dynamic Discovery - KidsLearnCode Dedicated Server
 * - Resolve dinamicamente a URL ativa do servidor Mac mini via DNS TXT (DuckDNS)
 * - Compatível com navegadores sem bundler (ESM nativo)
 */

export const SUPABASE_CONFIG = {
  url: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_URL || window.__ENV__?.SUPABASE_URL))
    || 'https://early-lives-demanding-calculations.trycloudflare.com',

  anonKey: (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY))
    || (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY))
    || 'kidslearncode_macmini_dedicated_token_2026'
};

let cachedTunnelUrl = null;
let lastResolvedTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 segundos de cache

/**
 * Resolve a URL ativa do servidor Mac mini dinamicamente:
 * 1. Se estiver rodando localmente (localhost / 127.0.0.1), usa http://localhost:8080
 * 2. Em produção (Vercel ou outro dispositivo), consulta o registro TXT de kidslearncode.duckdns.org
 *    usando DNS-over-HTTPS (Google DoH ou Cloudflare DoH) com CORS liberado.
 */
export async function getActiveServerUrl(forceRefresh = false) {
  // 1. Se em ambiente local do desenvolvedor ou no próprio Mac mini
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
  }

  // 2. Se temos cache em memória válido
  const now = Date.now();
  if (!forceRefresh && cachedTunnelUrl && (now - lastResolvedTime < CACHE_TTL_MS)) {
    return cachedTunnelUrl;
  }

  // 3. Consulta DoH (Google e Cloudflare como fallback)
  const dohEndpoints = [
    { url: 'https://dns.google/resolve?name=kidslearncode.duckdns.org&type=TXT', isGoogle: true },
    { url: 'https://cloudflare-dns.com/dns-query?name=kidslearncode.duckdns.org&type=TXT', isGoogle: false }
  ];

  for (const endpoint of dohEndpoints) {
    try {
      const headers = endpoint.isGoogle ? {} : { 'Accept': 'application/dns-json' };
      const res = await fetch(endpoint.url, { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const answer = json?.Answer?.find(a => a.type === 16);
        if (answer && answer.data) {
          let resolved = answer.data.replace(/^"+|"+$/g, '').trim();
          if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
            cachedTunnelUrl = resolved;
            lastResolvedTime = now;
            SUPABASE_CONFIG.url = resolved;
            return resolved;
          }
        }
      }
    } catch (_) {
      // Tenta próximo provedor DoH
    }
  }

  // 4. Fallback caso DNS esteja temporariamente indisponível
  if (cachedTunnelUrl) return cachedTunnelUrl;
  return SUPABASE_CONFIG.url;
}

export default SUPABASE_CONFIG;
