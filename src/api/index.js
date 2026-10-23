/**
 * src/api/index.js
 * Single API entry point. Every data operation in the app goes through this
 * module and hits the real backend (see api-contract.yml at repo root).
 */

import { createApiClient, ApiError } from './client';

const baseUrl = import.meta.env.VITE_API_BASE || '/api';

// URL absolut ke backend — HANYA untuk OAuth redirect (bukan fetch/XHR).
// VITE_API_BASE bisa relatif (/api) karena fetch diproxy Vite, tapi browser redirect
// tidak melewati proxy sehingga harus URL absolut langsung ke backend.
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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

  /* AUTH — reset kata sandi via OTP email (3 langkah) */
  forgotPassword: (payload) => client.post('/auth/forgot-password', payload),
  verifyResetOtp: (payload) => client.post('/auth/verify-reset-otp', payload),
  resetPassword: (payload) => client.post('/auth/reset-password', payload),

  /* AUTH — verifikasi email akun via OTP (tanpa sesi login) */
  verifyEmail: (payload) => client.post('/auth/email-verification/verify', payload),
  resendEmailVerification: (payload) => client.post('/auth/email-verification/resend', payload),
  changeVerificationEmail: (payload) =>
    client.post('/auth/email-verification/change-email', payload),

  /* BASES */
  getBases: (params) => client.get('/bases', { params }),
  getBase: (handle) => client.get(`/bases/${encodeURIComponent(handle)}`),
  createBase: (payload) => client.post('/bases', payload),
  getBaseFesses: (handle, params) =>
    client.get(`/bases/${encodeURIComponent(handle)}/fesses`, { params }),
  getBaseFollowers: (handle, params) =>
    client.get(`/bases/${encodeURIComponent(handle)}/followers`, { params }),
  followBase: (handle) => client.post(`/bases/${encodeURIComponent(handle)}/follow`),
  updateBaseSettings: (handle, payload) =>
    client.patch(`/bases/${encodeURIComponent(handle)}/settings`, payload),

  /* FESSES */
  getFesses: (params) => client.get('/fesses', { params }),
  getFess: (id) => client.get(`/fesses/${id}`),
  getFessIgStatus: (id) => client.get(`/fesses/${id}/instagram-status`),
  createFess: (payload, idempotencyKey) =>
    client.post(
      '/fesses',
      payload,
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
    ),
  voteFess: (id, type) => client.post(`/fesses/${id}/vote`, { type }),
  bookmarkFess: (id) => client.post(`/fesses/${id}/bookmark`),
  unbookmarkFess: (id) => client.delete(`/fesses/${id}/bookmark`),
  approveFess: (id) => client.post(`/fesses/${id}/approve`),
  rejectFess: (id) => client.post(`/fesses/${id}/reject`),
  reportFess: (id, payload) => client.post(`/fesses/${id}/report`, payload),
  deleteFess: (id) => client.delete(`/fesses/${id}/delete`),
  postFessToInstagram: (id, payload) => client.post(`/fesses/${id}/instagram-post`, payload),
  previewFessCanvas: (payload) => client.post('/fesses/canvas/preview', payload),

  /* COMMENTS */
  getComments: (fessId, params) => client.get(`/fesses/${fessId}/comments`, { params }),
  addComment: (fessId, text) => client.post(`/fesses/${fessId}/comments`, { text }),

  /* NOTIFICATIONS */
  getNotifications: (params) => client.get('/notifications', { params }),
  getUnreadNotificationCount: () => client.get('/notifications/unread-count'),
  markNotificationsRead: (ids) => client.post('/notifications/read', { ids }),
  markAllNotificationsRead: () => client.post('/notifications/read-all'),
  deleteNotification: (id) => client.delete(`/notifications/${encodeURIComponent(id)}`),

  /* USERS */
  getProfile: (userId) => client.get(`/users/${userId}`),
  updateProfile: (data) => client.patch('/users/me', data),
  getMyFesses: (params) => client.get('/users/me/fesses', { params }),
  getMyBookmarks: (params) => client.get('/users/me/bookmarks', { params }),
  getMyFollowing: (params) => client.get('/users/me/following', { params }),

  /* UPLOAD */
  uploadMedia: (file, type, onProgress, signal) => {
    const fd = new FormData();
    fd.append('file', file);
    if (type) fd.append('type', type);
    return client.upload('/upload', fd, { onProgress, signal });
  },
  /** Minta URL unggah bertanda tangan agar file besar diunggah langsung ke storage. */
  signMediaUpload: (payload) => client.post('/upload/sign', payload),
  /** Unggah file langsung ke URL bertanda tangan (tanpa lewat backend). */
  uploadToSignedUrl: (signedUrl, file, onProgress, signal) =>
    client.putToSignedUrl(signedUrl, file, { onProgress, signal }),
  uploadAvatar: (file, onProgress, signal) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.upload('/upload/avatar', fd, { onProgress, signal });
  },

  /* PAYMENTS & CTF WALLET */
  getPaymentPackages: () => client.get('/payments/packages'),
  getPaymentOrders: (params) => client.get('/payments/orders', { params }),
  getPaymentOrder: (orderId, params) =>
    client.get(`/payments/orders/${encodeURIComponent(orderId)}`, { params }),
  createPaymentOrder: (payload, idempotencyKey) =>
    client.post('/payments/orders', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  /* SONGS & TOPICS */
  getSongs: (params) => client.get('/songs', { params }),
  getTopics: () => client.get('/topics'),

  /* ADMIN — base dashboard */
  getStats: () => client.get('/admin/stats'),
  getModerationQueue: (params) => client.get('/admin/moderation', { params }),
  exportCanvas: (payload) => client.post('/admin/canvas/export', payload),

  /* ADMIN - platform connections */
  getPlatformConnections: () => client.get('/admin/connections'),
  getInstagramInsights: () => client.get('/admin/instagram-insights'),
  getInstagramMediaInsights: () => client.get('/admin/instagram-media-insights'),
  togglePlatformConnection: (platform, payload) =>
    client.post(`/admin/connections/${platform}`, payload),

  /* ADMIN — IDR base revenue & manual payout workflow */
  getBaseRevenue: (params) => client.get('/admin/base-revenue', { params }),
  getBasePayouts: (params) => client.get('/admin/base-revenue/payouts', { params }),
  requestBasePayout: (payload, idempotencyKey) =>
    client.post('/admin/base-revenue/payouts', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  reviewBasePayout: (id, payload) =>
    client.post(`/admin/base-revenue/payouts/${encodeURIComponent(id)}/review`, payload),
  updateBaseBank: (payload) => client.put('/admin/base-revenue/bank', payload),
  setBaseKyc: (payload) => client.post('/admin/base-revenue/kyc', payload),
  setBaseFreeForever: (payload) => client.post('/admin/base-revenue/free-forever', payload),

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
  // Gunakan backendUrl (absolute) bukan baseUrl (relative).
  // Browser redirect OAuth tidak bisa lewat Vite proxy — harus langsung ke backend.
  return `${backendUrl}/api/auth/google${query}`;
}

/**
 * Absolute URL that starts the Meta Instagram OAuth flow.
 * Passes token (if logged in), optional base handle, and origin context
 * ('onboarding', 'register', or 'connections').
 */
export function instagramAuthUrl({ token = '', base = '', origin = 'connections' } = {}) {
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (base) params.set('base', base);
  if (origin) params.set('origin', origin);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return `${backendUrl}/api/auth/instagram${qs}`;
}
