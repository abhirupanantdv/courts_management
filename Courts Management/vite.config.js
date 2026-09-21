import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalizeUrl(input) {
  let url = String(input || '').trim().replace(/\/+$/, '');
  if (!url) return 'http://192.168.101.125:8080';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.includes(':443') ? `https://${url}` : `http://${url}`;
  }
  // If user put https:// on local IP with port 8080/8000, normalize to http://
  if (/^https:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1|localhost):8080/i.test(url)) {
    url = url.replace(/^https:/i, 'http:');
  }
  return url;
}

function getTargetUrl() {
  if (process.env.VITE_ERPNEXT_URL) {
    return normalizeUrl(process.env.VITE_ERPNEXT_URL);
  }
  try {
    const configPath = path.resolve(__dirname, 'erpnext.config.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data.erpnextUrl) {
        return normalizeUrl(data.erpnextUrl);
      }
    }
  } catch (e) {
    console.warn('[Vite Proxy] Failed to read erpnext.config.json:', e.message);
  }
  return 'http://192.168.101.125:8080';
}

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '^/erpnext/': {
        target: getTargetUrl(),
        router: () => getTargetUrl(),
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/erpnext/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            const currentTarget = getTargetUrl();
            console.error(`[Vite Proxy Error] Proxying ${req.url} to ${currentTarget} failed:`, err.message);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              let hint = `Cannot reach ERPNext server at ${currentTarget}.`;
              if (err.code === 'ECONNREFUSED') {
                hint += ' Connection refused. Please ensure the target IP/port is reachable and Frappe/ERPNext is running.';
              } else if (err.message?.includes('wrong version number') || err.code === 'EPROTO') {
                hint += ' SSL protocol mismatch: Target uses HTTP (not HTTPS). Please use http:// in erpnext.config.json.';
              }
              res.end(JSON.stringify({ 
                error: 'Bad Gateway - ERPNext server unreachable', 
                message: hint,
                details: err.message,
                target: currentTarget 
              }));
            }
          });
        },
      },
    },
  },
});


