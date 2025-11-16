//import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// export const base44 = createClient({
//   appId: "6902858ca661c087fe5a0930", 
//   requiresAuth: true // Ensure authentication is required for all operations
// });

const _base44 = {
  // if other code checks this flag
  requiresAuth: false,

  // optional in-memory token for local auth mocking
  _token: null,
  setToken(token) { this._token = token; },

  async request(method, path, { body, headers } = {}) {
    const url = `http://localhost:3000${path}`;
    const init = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    };
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Local API error ${res.status}: ${text}`);
    }
    const ct = res.headers.get?.('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  },

  get(path, opts) { return this.request('GET', path, opts); },
  post(path, body, opts) { return this.request('POST', path, { body, ...opts }); },
  put(path, body, opts) { return this.request('PUT', path, { body, ...opts }); },
  delete(path, opts) { return this.request('DELETE', path, opts); }
};

_base44.entities = new Proxy({}, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    const name = String(prop);
    const base = `/entities/${name.toLowerCase()}`;
    const obj = {
      list: (opts) => _base44.get(`${base}` + (opts && opts.query ? `?${opts.query}` : '')),
      filter: (query) => _base44.post(`${base}/filter`, query),
      create: (data) => _base44.post(`${base}`, data),
      update: (id, data) => _base44.put(`${base}/${id}`, data),
      delete: (id) => _base44.delete(`${base}/${id}`)
    };
    target[prop] = obj;
    return obj;
  }
});

_base44.auth = {
  me: () => _base44.get('/auth/me'),
  isAuthenticated: async () => {
    if (_base44._token) return true;
    // fall back to pinging local auth endpoint
    try {
      const r = await _base44.get('/auth/is-authenticated');
      return !!r?.authenticated;
    } catch { return false; }
  },
  redirectToLogin: (returnPath = '/') => {
    const url = `/login${returnPath ? `?redirect=${encodeURIComponent(returnPath)}` : ''}`;
    if (typeof window !== 'undefined') window.location.assign(url);
    return url;
  },
  logout: async (redirectPath) => {
    try { await _base44.post('/auth/logout'); } catch (_) { }
    _base44.setToken(null);
    if (redirectPath && typeof window !== 'undefined') window.location.assign(redirectPath);
  },
  updateMe: (data) => _base44.put('/auth/me', data)
};

_base44.functions = new Proxy({
  invoke: (name, payload) => _base44.post(`/functions/${encodeURIComponent(name)}`, payload)
}, {
  get: (target, prop) => {
    if (prop === 'invoke') return target.invoke;
    return (payload) => target.invoke(String(prop), payload);
  }
});

_base44.integrations = {
  Core: new Proxy({}, {
    get: (_t, method) => {
      return (args) => _base44.post(`/integrations/core/${String(method)}`, args);
    }
  })
};

export const base44 = _base44;
