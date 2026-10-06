/**
 * src/api/index.js
 * Main API entry point. Switches between mock and real implementation
 * based on VITE_USE_MOCK env var (default: true in dev).
 */

import { createApiClient, ApiError } from './client';
import { mockApi } from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/** Real API client (lazy-initialized). */
let realClient = null;
function getRealClient() {
  if (!realClient) {
    const baseUrl = import.meta.env.VITE_API_BASE || '/api';
    const getToken = () => {
      // Token bisa dari authStore, localStorage, atau cookie
      return localStorage.getItem('fess_token');
    };
    realClient = createApiClient(baseUrl, getToken);
  }
  return realClient;
}

/** Thin wrapper to make real client match mockApi interface. */
function createRealApi() {
  const client = getRealClient();
  return {
    /* AUTH */
    login: (role) => client.post('/auth/login', { role }),
    logout: () => client.post('/auth/logout'),
    me: () => client.get('/auth/me'),
    refreshToken: () => client.post('/auth/refresh'),

    /* BASES */
    getBases: (params) => client.get('/bases', { params }),
    getBase: (handle) => client.get(`/bases/${handle}`),
    followBase: (handle) => client.post(`/bases/${handle}/follow`),

    /* FESSES */
    getFesses: (params) => client.get('/fesses', { params }),
    getFess: (id) => client.get(`/fesses/${id}`),
    createFess: (payload) => client.post('/fesses', payload),
    voteFess: (id, type) => client.post(`/fesses/${id}/vote`, { type }),
    approveFess: (id) => client.post(`/fesses/${id}/approve`),
    rejectFess: (id) => client.post(`/fesses/${id}/reject`),

    /* COMMENTS */
    getComments: (fessId) => client.get(`/fesses/${fessId}/comments`),
    addComment: (fessId, text) => client.post(`/fesses/${fessId}/comments`, { text }),

    /* NOTIFICATIONS */
    getNotifications: (params) => client.get('/notifications', { params }),
    markNotificationsRead: (ids) => client.post('/notifications/read', { ids }),

    /* PROFILE */
    getProfile: (userId) => client.get(`/users/${userId}`),
    updateProfile: (data) => client.patch('/users/me', data),

    /* ADMIN */
    getStats: () => client.get('/admin/stats'),
    getModerationQueue: (params) => client.get('/admin/moderation', { params }),
  };
}

/** Unified API — components import this, not mock/real directly. */
export const api = USE_MOCK ? mockApi : createRealApi();

/** Re-export error class for catch handling. */
export { ApiError } from './client';

/** Helper to check if we're in mock mode. */
export const isMockMode = () => USE_MOCK;

/** Switch at runtime (e.g., for testing in dev). */
export function setMockMode(enabled) {
  // Note: only affects subsequent imports; modules already imported keep old refs.
  // Use this in tests or dev console: `import { setMockMode } from '@/api'; setMockMode(false)`
  Object.assign(api, enabled ? mockApi : createRealApi());
}
