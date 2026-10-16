/**
 * Server Configuration & Instant Zero-DNS Discovery - KidsLearnCode Dedicated Server
 * - Zero Cloudflare / Zero DuckDNS / Zero Supabase Cloud
 * - Resolve automaticamente o endereço do servidor via GitHub Live Status (0s de cache)
 *   ou subdomínio determinístico nativo (kidslearncode-mmorpg.loca.lt)
 */

export const SUPABASE_CONFIG = {
  url: 'https://kidslearncode-mmorpg.loca.lt',
  anonKey: 'kidslearncode_native_dedicated_token_2026'
};

let cachedServerUrl = null;
let lastResolvedTime = 0;
const CACHE_TTL_MS = 25 * 1000; // 25 segundos

/**
 * Testa se um endpoint de servidor está respondendo /health rapidamente
 */
async function probeServerHealth(baseUrl, timeoutMs = 2500) {
  if (!baseUrl) return false;
  const clean = baseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${clean}/health?t=${Date.now()}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      return data && data.status === 'ok';
    }
  } catch (_) {
    clearTimeout(timer);
  }
  return false;
}

/**
 * Resolve a URL ativa do servidor dedicado dinamicamente:
 * 1. Override manual salvo no navegador (se configurado)
 * 2. Localhost (http://localhost:8080) quando rodando no próprio Mac
 * 3. Registro instantâneo live-server.json na branch 'server-status' do GitHub (Zero DNS / Zero Cache)
 * 4. Subdomínio fixo nativo https://kidslearncode-mmorpg.loca.lt
 */
export async function getActiveServerUrl(forceRefresh = false) {
  if (typeof window !== 'undefined') {
    const customOverride = localStorage.getItem('kidslearn_custom_server_url');
    if (customOverride && customOverride.startsWith('http')) {
      return customOverride.replace(/\/$/, '');
    }

    if (window.location) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:8080';
      }
      // Se o jogo foi aberto diretamente pelo link ou IP LAN do servidor
      if (window.location.port === '8080' || host.endsWith('.loca.lt') || host.endsWith('.lhr.life')) {
        return window.location.origin;
      }
    }
  }

  const now = Date.now();
  if (!forceRefresh && cachedServerUrl && (now - lastResolvedTime < CACHE_TTL_MS)) {
    return cachedServerUrl;
  }

  // 1. Consulta o Registro Instantâneo no GitHub (branch server-status, 0s de cache)
  try {
    const statusUrl = `https://raw.githubusercontent.com/rennan101/KidsLearnCode/server-status/live-server.json?t=${now}`;
    const res = await fetch(statusUrl, { cache: 'no-store' });
    if (res.ok) {
      const info = await res.json();
      const candidates = [info.sshUrl, info.url, info.ltUrl, info.lanUrl].filter(Boolean);
      for (const candidate of candidates) {
        const clean = candidate.replace(/\/$/, '');
        if (await probeServerHealth(clean, 2500)) {
          cachedServerUrl = clean;
          lastResolvedTime = now;
          SUPABASE_CONFIG.url = clean;
          return clean;
        }
      }
      if (info.url) {
        const fallbackClean = info.url.replace(/\/$/, '');
        cachedServerUrl = fallbackClean;
        lastResolvedTime = now;
        SUPABASE_CONFIG.url = fallbackClean;
        return fallbackClean;
      }
    }
  } catch (_) {}

  // 2. Fallback para o Subdomínio Fixo Nativo
  const deterministicUrl = 'https://kidslearncode-mmorpg.loca.lt';
  cachedServerUrl = deterministicUrl;
  lastResolvedTime = now;
  SUPABASE_CONFIG.url = deterministicUrl;
  return deterministicUrl;
}

export default SUPABASE_CONFIG;
