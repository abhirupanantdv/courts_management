// Automatically adapt base path:
// If running on Vite dev server (port 5173/5174/3000), route via '/erpnext' proxy.
// If installed directly on the server (port 80/443/8000/etc.), route directly to root ''.
const isViteDev = typeof window !== 'undefined' && 
  (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '3000');
const ERPNEXT_BASE_PATH = isViteDev ? '/erpnext' : '';

function getCsrfToken() {
  if (typeof window !== 'undefined') {
    if (window.frappe && window.frappe.csrf_token) {
      return window.frappe.csrf_token;
    }
    if (document && document.cookie) {
      const match = document.cookie.split('; ').find((row) => row.startsWith('csrf_token='));
      if (match) return match.split('=')[1];
    }
  }
  return null;
}

export async function request(path, options = {}) {
  const { timeoutMs = 6000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const csrfToken = getCsrfToken();

  try {
    const response = await fetch(`${ERPNEXT_BASE_PATH}${path}`, {
      ...fetchOptions,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {}),
        ...fetchOptions.headers,
      },
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && path !== '/api/method/login') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('courts:session-expired'));
        }
      }

      let message = payload?.message || payload?.error || payload?._server_messages || payload?.exc || response.statusText;
      if (payload?._server_messages) {
        try {
          const parsed = JSON.parse(payload._server_messages);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            message = parsed[0].message;
          }
        } catch {}
      }
      if (payload?.details && payload.details !== message) {
        message = `${message} (${payload.details})`;
      }
      throw new Error(Array.isArray(message) ? message.join(' ') : String(message));
    }

    return payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function loginToErpNext({ username, password }) {
  const body = new URLSearchParams();
  body.set('usr', String(username || '').trim());
  body.set('pwd', String(password || ''));

  const payload = await request('/api/method/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const user = await getLoggedInUser();
  if (!user || user === 'Guest') {
    throw new Error('Invalid login credentials. Please check your username and password.');
  }

  return {
    message: payload?.message,
    user,
  };
}

export async function logoutFromErpNext() {
  await request('/api/method/logout', { method: 'POST' });
}

export async function getLoggedInUser() {
  const payload = await request('/api/method/frappe.auth.get_logged_user');
  return payload.message;
}

export async function getResource(doctype, { fields = ['name'], filters = [], limit = 100 } = {}) {
  const params = new URLSearchParams();
  params.set('fields', JSON.stringify(fields));
  if (filters.length) params.set('filters', JSON.stringify(filters));
  params.set('limit_page_length', String(limit));
  params.set('order_by', 'modified desc');

  const payload = await request(`/api/resource/${encodeURIComponent(doctype)}?${params.toString()}`);
  return payload.data || [];
}
