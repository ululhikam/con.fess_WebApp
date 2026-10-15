/**
 * src/api/client.js
 * Thin fetch-based HTTP client with JSON handling, auth header and uploads.
 * Zero deps, ~90 lines. Swap to Axios later if needed.
 */

import { ref } from 'vue';

const DEFAULT_BASE = '/api';

/** Build full URL with base and query params. Works with absolute or relative bases. */
function buildUrl(base, path, params) {
  let url;
  try {
    url = new URL(path, base);
  } catch {
    // Relative base (e.g. "/api") — resolve against the current origin.
    const root = String(base).replace(/\/$/, '');
    const clean = path.startsWith('/') ? path : `/${path}`;
    url = new URL(`${root}${clean}`, window.location.origin);
  }
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

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
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

/** Create a request function bound to a base URL. */
export function createApiClient(baseUrl = DEFAULT_BASE, getToken = () => null) {
  async function request(method, path, options = {}) {
    const { params, data, headers: extraHeaders = {}, signal, raw = false } = options;
    const token = getToken();
    const url = buildUrl(baseUrl, path, params);

    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers: { ...defaultHeaders(token), ...extraHeaders },
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal,
      credentials: 'include',
    });

    if (!res.ok) {
      const payload = await safeJson(res);
      throw new ApiError(payload?.message || 'Request failed', res.status, payload);
    }

    if (raw) return res;
    return res.status === 204 ? null : safeJson(res);
  }

  /** Upload multipart FormData with proper error handling. */
  async function upload(path, formData, opts = {}) {
    const token = getToken();
    const url = buildUrl(baseUrl, path);
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
      ...opts,
    });

    if (!res.ok) {
      const payload = await safeJson(res);
      throw new ApiError(payload?.message || 'Upload failed', res.status, payload);
    }
    return res.status === 204 ? null : safeJson(res);
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, data, opts) => request('POST', path, { ...opts, data }),
    put: (path, data, opts) => request('PUT', path, { ...opts, data }),
    patch: (path, data, opts) => request('PATCH', path, { ...opts, data }),
    delete: (path, opts) => request('DELETE', path, opts),
    upload,
  };
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
