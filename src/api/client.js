/**
 * src/api/client.js
 * Thin Axios-like wrapper (fetch-based) with interceptors.
 * Zero deps, ~60 lines. Swap to Axios later if needed.
 */

const DEFAULT_BASE = '/api';

/** Build full URL with base and query params. */
function buildUrl(base, path, params) {
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/** Default headers for every request. */
function defaultHeaders(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Create a request function bound to a base URL. */
export function createApiClient(baseUrl = DEFAULT_BASE, getToken = () => null) {
  const requestQueue = [];
  let isRefreshing = false;

  async function request(method, path, options = {}) {
    const { params, data, headers: extraHeaders = {}, signal, raw = false } = options;
    const token = getToken();
    const url = buildUrl(baseUrl, path, params);

    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers: { ...defaultHeaders(token), ...extraHeaders },
      body: data ? JSON.stringify(data) : undefined,
      signal,
      credentials: 'include',
    });

    if (res.status === 401 && !raw) {
      // Token expired — could implement refresh here
      throw new ApiError('Unauthorized', 401, await safeJson(res));
    }

    if (!res.ok) {
      throw new ApiError('Request failed', res.status, await safeJson(res));
    }

    if (raw) return res;
    return res.status === 204 ? null : safeJson(res);
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, data, opts) => request('POST', path, { ...opts, data }),
    put: (path, data, opts) => request('PUT', path, { ...opts, data }),
    patch: (path, data, opts) => request('PATCH', path, { ...opts, data }),
    delete: (path, opts) => request('DELETE', path, opts),
    /** Upload file (multipart). */
    upload: (path, formData, opts = {}) => {
      const token = getToken();
      const url = buildUrl(baseUrl, path);
      return fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        ...opts,
      }).then((r) => (r.ok ? r.json() : Promise.reject(r)));
    },
  };
}

/** Error class with status + payload. */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/** Reactivity helper — wraps client calls with loading/error state. */
export function useApiClient(client) {
  const loading = ref(false);
  const error = ref(null);

  async function execute(fn) {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (e) {
      error.value = e instanceof ApiError ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, execute };
}

import { ref } from 'vue';
