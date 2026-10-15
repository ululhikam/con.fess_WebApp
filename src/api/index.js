/**
 * src/api/index.js
 * Single API entry point. Every data operation in the app goes through this
 * module and hits the real backend (see api-contract.yml at repo root).
 */

import { createApiClient, ApiError } from './client';

const baseUrl = import.meta.env.VITE_API_BASE || '/api';

const getToken = () => localStorage.getItem('fess_token');

const client = createApiClient(baseUrl, getToken);

/** Unified API surface — components/composables import this. */
export const api = {
  /* AUTH */
  login: (payload) => client.post('/auth/login', payload),
  loginGoogle: (payload) => client.post('/auth/login/google', payload),
  registerUser: (payload) => client.post('/auth/register/user', payload),
  registerBase: (payload) => client.post('/auth/register/base', payload),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  refreshToken: () => client.post('/auth/refresh'),

  /* BASES */
  getBases: (params) => client.get('/bases', { params }),
  getBase: (handle) => client.get(`/bases/${encodeURIComponent(handle)}`),
  createBase: (payload) => client.post('/bases', payload),
  getBaseFesses: (handle, params) =>
    client.get(`/bases/${encodeURIComponent(handle)}/fesses`, { params }),
  followBase: (handle) => client.post(`/bases/${encodeURIComponent(handle)}/follow`),
  updateBaseSettings: (handle, payload) =>
    client.patch(`/bases/${encodeURIComponent(handle)}/settings`, payload),

  /* FESSES */
  getFesses: (params) => client.get('/fesses', { params }),
  getFess: (id) => client.get(`/fesses/${id}`),
  createFess: (payload) => client.post('/fesses', payload),
  voteFess: (id, type) => client.post(`/fesses/${id}/vote`, { type }),
  approveFess: (id) => client.post(`/fesses/${id}/approve`),
  rejectFess: (id) => client.post(`/fesses/${id}/reject`),
  reportFess: (id, payload) => client.post(`/fesses/${id}/report`, payload),
  deleteFess: (id) => client.delete(`/fesses/${id}/delete`),

  /* COMMENTS */
  getComments: (fessId, params) => client.get(`/fesses/${fessId}/comments`, { params }),
  addComment: (fessId, text) => client.post(`/fesses/${fessId}/comments`, { text }),

  /* NOTIFICATIONS */
  getNotifications: (params) => client.get('/notifications', { params }),
  markNotificationsRead: (ids) => client.post('/notifications/read', { ids }),
  markAllNotificationsRead: () => client.post('/notifications/read-all'),
  deleteNotification: (id) => client.delete(`/notifications/${encodeURIComponent(id)}`),

  /* USERS */
  getProfile: (userId) => client.get(`/users/${userId}`),
  updateProfile: (data) => client.patch('/users/me', data),
  getMyFesses: (params) => client.get('/users/me/fesses', { params }),
  getMyFollowing: (params) => client.get('/users/me/following', { params }),

  /* UPLOAD */
  uploadMedia: (file, type) => {
    const fd = new FormData();
    fd.append('file', file);
    if (type) fd.append('type', type);
    return client.upload('/upload', fd);
  },
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.upload('/upload/avatar', fd);
  },

  /* SONGS & TOPICS */
  getSongs: (params) => client.get('/songs', { params }),
  getTopics: () => client.get('/topics'),

  /* ADMIN — base dashboard */
  getStats: () => client.get('/admin/stats'),
  getModerationQueue: (params) => client.get('/admin/moderation', { params }),
  exportCanvas: (payload) => client.post('/admin/canvas/export', payload),

  /* ADMIN — platform connections & treasury */
  getPlatformConnections: () => client.get('/admin/connections'),
  togglePlatformConnection: (platform, payload) => client.post(`/admin/connections/${platform}`, payload),
  getTreasury: () => client.get('/admin/treasury'),
  requestPayout: (payload) => client.post('/admin/treasury/payout', payload),

  /* ADMIN — system */
  getSystemHealth: () => client.get('/admin/system/health'),
  updateSecurityControls: (payload) => client.patch('/admin/system/security', payload),
  getEngineLogs: (params) => client.get('/admin/system/logs', { params }),
  banUser: (payload) => client.post('/admin/users/ban', payload),
};

/** Re-export error class for catch handling. */
export { ApiError } from './client';

/**
 * Absolute URL that starts the backend Passport Google OAuth flow.
 * `role` selects the portal (User / Base Admin) and is round-tripped through
 * Google as the OAuth `state`.
 */
export function googleAuthUrl(role = '') {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  const path = `${baseUrl}/auth/google${query}`;
  // Top-level redirects need an absolute URL when the base is relative.
  return /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path}`;
}
