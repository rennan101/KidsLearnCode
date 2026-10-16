/**
 * Server Configuration & Instant Zero-DNS Discovery - KidsLearnCode Dedicated Server
 * - Zero Cloudflare / Zero DuckDNS / Zero Supabase Cloud
 * - Funciona 100% tanto em localhost quanto no Vercel (https://kids-learn-code.vercel.app)
 * - Fast-path direto para localhost:8080 quando aberto no próprio Mac mini (mesmo pelo link do Vercel)
 * - Descoberta instantânea via GitHub Contents API (0s de cache CDN) para outros computadores/celulares
 */

export const SUPABASE_CONFIG = {
  url: 'http://localhost:8080',
  anonKey: 'kidslearncode_native_dedicated_token_2026'
};

let cachedServerUrl = null;
let lastResolvedTime = 0;
const CACHE_TTL_MS = 20 * 1000; // 20 segundos

/**
 * Testa se um endpoint de servidor está respondendo /health rapidamente.
 * Não envia headers customizados em .lhr.life ou localhost para evitar preflight CORS OPTIONS.
 */
async function probeServerHealth(baseUrl, timeoutMs = 2200) {
  if (!baseUrl) return false;
  const clean = baseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const fetchOptions = {
      signal: controller.signal,
      cache: 'no-store'
    };
    if (clean.includes('.loca.lt')) {
      fetchOptions.headers = { 'Bypass-Tunnel-Reminder': 'true' };
    }
    const res = await fetch(`${clean}/health?t=${Date.now()}`, fetchOptions);
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.status === 'ok');
    }
  } catch (_) {
    clearTimeout(timer);
  }
  return false;
}

/**
 * Busca o JSON de status ativo sem sofrer com o cache de 5 minutos do raw.githubusercontent.com
 */
async function fetchLiveServerRegistry(now) {
  // 1. GitHub Contents API (0 segundos de cache de CDN, resposta imediata)
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/rennan101/KidsLearnCode/contents/live-server.json?ref=server-status&t=${now}`,
      { cache: 'no-store' }
    );
    if (apiRes.ok) {
      const meta = await apiRes.json();
      if (meta && meta.content) {
        const decoded = atob(meta.content.replace(/\s/g, ''));
        return JSON.parse(decoded);
      }
    }
  } catch (_) {}

  // 2. Fallback: GitHub Raw
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/rennan101/KidsLearnCode/server-status/live-server.json?t=${now}`,
      { cache: 'no-store' }
    );
    if (rawRes.ok) {
      return await rawRes.json();
    }
  } catch (_) {}

  return null;
}

/**
 * Resolve a URL ativa do servidor dedicado dinamicamente:
 * 1. Localhost direto se estiver em localhost / 127.0.0.1
 * 2. Origin direta se aberto pelo próprio servidor (:8080 / .lhr.life / .loca.lt)
 * 3. Fast-path para http://localhost:8080 mesmo quando aberto pelo Vercel no próprio Mac mini!
 * 4. Descoberta instantânea via GitHub API (branch server-status) para acesso remoto no Vercel
 */
export async function getActiveServerUrl(forceRefresh = false) {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    if (window.location.port === '8080' || host.endsWith('.loca.lt') || host.endsWith('.lhr.life')) {
      return window.location.origin;
    }

    // Se houver override manual salvo, valida se ainda está ativo; se estiver morto, limpa automaticamente
    const customOverride = localStorage.getItem('kidslearn_custom_server_url');
    if (customOverride && customOverride.startsWith('http')) {
      const cleanCustom = customOverride.replace(/\/$/, '');
      if (await probeServerHealth(cleanCustom, 1500)) {
        return cleanCustom;
      } else {
        localStorage.removeItem('kidslearn_custom_server_url');
      }
    }
  }

  const now = Date.now();
  if (!forceRefresh && cachedServerUrl && (now - lastResolvedTime < CACHE_TTL_MS)) {
    return cachedServerUrl;
  }

  // Fast-path: Mesmo abrindo pelo Vercel (https://kids-learn-code.vercel.app),
  // se o jogador estiver no próprio Mac onde o servidor roda, conecta direto em localhost:8080 (0ms)!
  if (await probeServerHealth('http://localhost:8080', 900)) {
    cachedServerUrl = 'http://localhost:8080';
    lastResolvedTime = now;
    SUPABASE_CONFIG.url = 'http://localhost:8080';
    return 'http://localhost:8080';
  }

  // Consulta o Registro Instantâneo no GitHub (branch server-status)
  const info = await fetchLiveServerRegistry(now);
  if (info) {
    const candidates = [info.sshUrl, info.url, info.ltUrl].filter(Boolean);
    for (const candidate of candidates) {
      const clean = candidate.replace(/\/$/, '');
      if (await probeServerHealth(clean, 2800)) {
        cachedServerUrl = clean;
        lastResolvedTime = now;
        SUPABASE_CONFIG.url = clean;
        return clean;
      }
    }
    if (info.sshUrl || info.url) {
      const fallbackClean = (info.sshUrl || info.url).replace(/\/$/, '');
      cachedServerUrl = fallbackClean;
      lastResolvedTime = now;
      SUPABASE_CONFIG.url = fallbackClean;
      return fallbackClean;
    }
  }

  // Fallback para o Subdomínio Fixo Nativo
  const deterministicUrl = 'https://kidslearncode-mmorpg.loca.lt';
  cachedServerUrl = deterministicUrl;
  lastResolvedTime = now;
  SUPABASE_CONFIG.url = deterministicUrl;
  return deterministicUrl;
}

export default SUPABASE_CONFIG;
