import erpConfig from '../../erpnext.config.json';

export function normalizeErpNextUrl(input) {
  let url = String(input || '').trim().replace(/\/+$/, '');
  if (!url) return 'https://192.168.101.125:8080';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.includes(':443') ? `https://${url}` : `http://${url}`;
  }
  // Auto-correct https:// on local IP:8080 / :8000 where SSL is not present
  if (/^https:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1|localhost):8080/i.test(url)) {
    url = url.replace(/^https:/i, 'http:');
  }
  return url;
}

// Single source of truth: Reads from erpnext.config.json, VITE_ERPNEXT_URL,
// or automatically detects current server IP / DNS when running on an installed server.
export const ERPNEXT_URL = (() => {
  // 1. If running in browser on an installed server (production/ERP port, not local Vite dev 5173/5174/3000)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const port = window.location.port;
    if (port !== '5173' && port !== '5174' && port !== '3000') {
      return normalizeErpNextUrl(window.location.origin);
    }
  }

  // 2. Local development fallback: read env or config file
  const raw = import.meta.env.VITE_ERPNEXT_URL || erpConfig.erpnextUrl || 'http://192.168.101.125:8080';
  return normalizeErpNextUrl(raw);
})();

export const ERPNEXT_HOST = (() => {
  try {
    return new URL(ERPNEXT_URL).hostname;
  } catch {
    return ERPNEXT_URL;
  }
})();


