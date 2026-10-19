/**
 * Server Configuration & Instant Multi-Channel Discovery - KidsLearnCode Dedicated Server
 * - Funciona 100% tanto em localhost quanto no Vercel (https://kids-learn-code.vercel.app)
 * - Nunca faz chamadas http:// em páginas https:// (elimina bloqueio Mixed Content do Safari)
 * - Descoberta instantânea em paralelo via GitHub Contents API + DNS-over-HTTPS (0s de cache CDN)
 */

export const SUPABASE_CONFIG = {
  url: 'http://localhost:8080',
  anonKey: 'kidslearncode_native_dedicated_token_2026'
};

let cachedServerUrl = null;
let lastResolvedTime = 0;
let inFlightDiscoveryPromise = null;
const CACHE_TTL_MS = 30 * 1000; // 30 segundos (evita ficar preso em túnel antigo caso caia)

/**
 * Invalida imediatamente o cache da URL do servidor (chamado em quedas de WebSocket ou erros de rede)
 */
export function invalidateServerUrlCache() {
  cachedServerUrl = null;
  lastResolvedTime = 0;
}

/**
 * Testa se um endpoint de servidor está respondendo /health rapidamente.
 */
async function probeServerHealth(baseUrl, timeoutMs = 2400) {
  if (!baseUrl) return false;
  const clean = baseUrl.replace(/\/$/, '');

  // Proteção estrita contra Mixed Content no Safari/macOS:
  // Páginas HTTPS (como https://kids-learn-code.vercel.app) nunca devem requisitar endpoints HTTP.
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && clean.startsWith('http://')) {
    return false;
  }

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
 * Consulta o registro DNS TXT de kidslearncode.duckdns.org via Cloudflare DoH (0s de cache)
 */
async function fetchDuckDnsTunnelUrl() {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=kidslearncode.duckdns.org&type=TXT&t=${Date.now()}`,
      {
        headers: { Accept: 'application/dns-json' },
        cache: 'no-store'
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.Answer)) {
        for (const ans of data.Answer) {
          const cleanTxt = String(ans.data || '').replace(/^"+|"+$/g, '').trim();
          if (cleanTxt.startsWith('https://')) {
            return cleanTxt;
          }
        }
      }
    }
  } catch (_) {}
  return null;
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

async function resolveServerUrlInternal() {
  const now = Date.now();
  const isHttpsPage = typeof window !== 'undefined' && window.location?.protocol === 'https:';

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    if (
      window.location.port === '8080' ||
      host.endsWith('.trycloudflare.com') ||
      host.endsWith('.serveousercontent.com') ||
      host.endsWith('.lhr.life') ||
      host.endsWith('.loca.lt')
    ) {
      return window.location.origin;
    }

    // Se houver override manual salvo (apenas HTTPS se a página for HTTPS), valida se está ativo
    const customOverride = localStorage.getItem('kidslearn_custom_server_url');
    if (customOverride && customOverride.startsWith('http')) {
      const cleanCustom = customOverride.replace(/\/$/, '');
      if ((!isHttpsPage || cleanCustom.startsWith('https://')) && await probeServerHealth(cleanCustom, 1500)) {
        cachedServerUrl = cleanCustom;
        lastResolvedTime = now;
        SUPABASE_CONFIG.url = cleanCustom;
        return cleanCustom;
      } else {
        localStorage.removeItem('kidslearn_custom_server_url');
      }
    }
  }

  // Somente tenta localhost:8080 se a página NÃO for HTTPS (evita erro Mixed Content no Safari)
  if (!isHttpsPage && await probeServerHealth('http://localhost:8080', 800)) {
    cachedServerUrl = 'http://localhost:8080';
    lastResolvedTime = now;
    SUPABASE_CONFIG.url = 'http://localhost:8080';
    return 'http://localhost:8080';
  }

  // Consulta o Registro Instantâneo no GitHub (branch server-status) e o DNS TXT (DuckDNS) em paralelo
  const [info, duckTxtUrl] = await Promise.all([
    fetchLiveServerRegistry(now),
    fetchDuckDnsTunnelUrl()
  ]);

  const rawCandidates = [
    info?.cfUrl,
    duckTxtUrl,
    info?.serveoUrl,
    info?.sshUrl,
    info?.url,
    info?.ltUrl
  ]
    .filter(Boolean)
    .map(u => u.replace(/\/$/, ''))
    .filter(u => !isHttpsPage || u.startsWith('https://'));

  const uniqueCandidates = Array.from(new Set(rawCandidates));

  if (uniqueCandidates.length > 0) {
    // Testa os túneis candidatos em paralelo: o primeiro que responder /health vence imediatamente!
    try {
      const winner = await Promise.any(
        uniqueCandidates.map(async (candidate) => {
          const ok = await probeServerHealth(candidate, 2800);
          if (!ok) throw new Error('unhealthy');
          return candidate;
        })
      );
      if (winner) {
        cachedServerUrl = winner;
        lastResolvedTime = Date.now();
        SUPABASE_CONFIG.url = winner;
        return winner;
      }
    } catch (_) {}

    // Se o probe falhou por latência momentânea, usa o endereço primário publicado
    const primaryClean = uniqueCandidates[0];
    cachedServerUrl = primaryClean;
    lastResolvedTime = Date.now();
    SUPABASE_CONFIG.url = primaryClean;
    return primaryClean;
  }

  const fallbackUrl = cachedServerUrl || 'https://kidslearncode-mmorpg.loca.lt';
  cachedServerUrl = fallbackUrl;
  lastResolvedTime = Date.now();
  SUPABASE_CONFIG.url = fallbackUrl;
  return fallbackUrl;
}

/**
 * Resolve a URL ativa do servidor dedicado dinamicamente com deduplicação de chamadas concorrentes
 */
export async function getActiveServerUrl(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedServerUrl && (now - lastResolvedTime < CACHE_TTL_MS)) {
    return cachedServerUrl;
  }

  if (inFlightDiscoveryPromise && !forceRefresh) {
    return inFlightDiscoveryPromise;
  }

  inFlightDiscoveryPromise = resolveServerUrlInternal().finally(() => {
    inFlightDiscoveryPromise = null;
  });

  return inFlightDiscoveryPromise;
}

export default SUPABASE_CONFIG;
