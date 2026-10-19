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
  const root = String(base || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const full = `${root}/${cleanPath}`;

  try {
    if (/^https?:\/\//i.test(full)) {
      url = new URL(full);
    } else {
      const clean = full.startsWith('/') ? full : `/${full}`;
      url = new URL(clean, window.location.origin);
    }
  } catch {
    const clean = full.startsWith('/') ? full : `/${full}`;
    url = new URL(clean, window.location.origin);
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
      // Reuse TCP/TLS connections across sequential requests (GET only)
      keepalive: method.toUpperCase() === 'GET',
    });

    if (!res.ok) {
      const payload = await safeJson(res);
      throw new ApiError(payload?.message || 'Request failed', res.status, payload);
    }

    if (raw) return res;
    return res.status === 204 ? null : safeJson(res);
  }

  /** Upload multipart FormData with real-time progress, timeout, and abort support. */
  function upload(path, formData, opts = {}) {
    return new Promise((resolve, reject) => {
      const token = getToken();
      const url = buildUrl(baseUrl, path);
      const xhr = new XMLHttpRequest();

      xhr.open('POST', url, true);
      xhr.withCredentials = true;

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Upload progress event
      if (xhr.upload && typeof opts.onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            // Skalakan progres byte client dari 0% ke 85%,
            // sisa 85%-99% untuk pemrosesan backend & upload ke Supabase Storage
            const percent = Math.min(85, Math.round((event.loaded / event.total) * 85));
            opts.onProgress(percent, event.loaded, event.total);
          }
        };
      }

      // Timeout (default 120 detik untuk file media besar)
      xhr.timeout = opts.timeout ?? 120000;

      xhr.onload = () => {
        let payload = null;
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          payload = null;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          if (typeof opts.onProgress === 'function') {
            opts.onProgress(100);
          }
          resolve(xhr.status === 204 ? null : payload);
        } else {
          const msg = payload?.message || `Upload gagal dengan kode status ${xhr.status}`;
          reject(new ApiError(msg, xhr.status, payload));
        }
      };

      xhr.onerror = () => {
        reject(
          new ApiError(
            'Koneksi jaringan terputus atau gagal terhubung ke server saat mengunggah.',
            0
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new ApiError(
            'Waktu unggah habis (timeout). File terlalu besar atau koneksi internet lambat.',
            408
          )
        );
      };

      xhr.onabort = () => {
        reject(new ApiError('Unggahan media dibatalkan.', 0));
      };

      if (opts.signal) {
        opts.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload file langsung ke URL bertanda tangan (Supabase Storage signed
   * upload) via PUT, dengan progres real-time & abort. Dipakai agar file besar
   * (video >4,5MB) tidak melewati batas body request serverless Vercel.
   */
  function putToSignedUrl(signedUrl, file, opts = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl, true);

      // Header mengikuti protokol signed upload Supabase Storage.
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.setRequestHeader('cache-control', 'max-age=3600');
      if (file?.type) {
        xhr.setRequestHeader('content-type', file.type);
      }

      if (xhr.upload && typeof opts.onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 99));
            opts.onProgress(percent, event.loaded, event.total);
          }
        };
      }

      // Timeout (default 180 detik untuk video besar)
      xhr.timeout = opts.timeout ?? 180000;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (typeof opts.onProgress === 'function') opts.onProgress(100);
          resolve(true);
        } else {
          let message = `Unggah ke storage gagal (kode ${xhr.status}).`;
          try {
            const payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            if (payload?.message) message = payload.message;
          } catch {
            /* body bukan JSON — pakai pesan default */
          }
          reject(new ApiError(message, xhr.status, null));
        }
      };

      xhr.onerror = () => {
        reject(
          new ApiError(
            'Koneksi terputus saat mengunggah ke storage. Periksa koneksi internet lalu coba lagi.',
            0
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new ApiError(
            'Waktu unggah habis (timeout). File terlalu besar atau koneksi internet lambat.',
            408
          )
        );
      };

      xhr.onabort = () => {
        reject(new ApiError('Unggahan media dibatalkan.', 0));
      };

      if (opts.signal) {
        opts.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.send(file);
    });
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, data, opts) => request('POST', path, { ...opts, data }),
    put: (path, data, opts) => request('PUT', path, { ...opts, data }),
    patch: (path, data, opts) => request('PATCH', path, { ...opts, data }),
    delete: (path, opts) => request('DELETE', path, opts),
    upload,
    putToSignedUrl,
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
