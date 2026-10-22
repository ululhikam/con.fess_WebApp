import { defineStore } from 'pinia';
import { api } from '../api';
import { getTokenExpiry, isTokenExpired, parseJwtPayload } from '../utils/authToken';

/** Safe JSON parse — returns null for missing or corrupt payloads. */
function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Timer modul-level agar hanya ada satu jadwal kedaluwarsa per tab.
let expiryTimer = null;

/** Plain string values (tokens) are stored unencoded. */
const readToken = () => localStorage.getItem('fess_token');

/**
 * Normalize the API User payload (snake_case) into the app user model.
 * Keeps both aliases so existing components keep working.
 */
function normalizeUser(user) {
  if (!user) return null;
  const handleChangeAvailableAt =
    user.handle_change_available_at ?? user.handleChangeAvailableAt ?? null;
  const handleChangeCooldownDays =
    user.handle_change_cooldown_days ?? user.handleChangeCooldownDays ?? 7;
  return {
    ...user,
    emailVerified: Boolean(user.email_verified ?? user.emailVerified),
    managedBases: user.managed_bases ?? user.managedBases ?? [],
    igAccount: user.ig_account ?? user.igAccount ?? null,
    followersCount: user.followers_count ?? user.followersCount ?? 0,
    followingCount: user.following_count ?? user.followingCount ?? 0,
    fessCount: user.fess_count ?? user.fessCount ?? 0,
    balance: user.balance ?? 0,
    createdAt: user.created_at ?? user.createdAt ?? null,
    handleChangedAt: user.handle_changed_at ?? user.handleChangedAt ?? null,
    handleChangeAvailableAt,
    handleChangeCooldownDays,
    canChangeHandle:
      user.can_change_handle ??
      user.canChangeHandle ??
      (!handleChangeAvailableAt || Date.now() >= Number(handleChangeAvailableAt)),
  };
}

export const useAuthStore = defineStore('auth', {
  /**
   * No implicit session: both values come straight from storage, so the
   * `requiresAuth` / `roles` route guards actually mean something.
   * Signing in is the only way to populate them (see `login()`).
   */
  state: () => ({
    user: readJson('fess_user'),
    token: readToken(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.role === 'Super Admin',
    isBaseAdmin: (state) => ['Base Admin', 'Super Admin'].includes(state.user?.role),
    isRegularUser: (state) => state.user?.role === 'User',
    /** Safe accessor — never assume `user` exists. */
    displayName: (state) => state.user?.username ?? 'Anonim',
    initials: (state) => (state.user?.username ?? 'AN').slice(0, 2).toUpperCase(),
  },
  actions: {
    /** Persist a session returned by the API ({ user, token }). */
    setSession({ user, token } = {}) {
      if (user) this.user = normalizeUser(user);
      if (token) {
        this.token = token;
        this.scheduleSessionExpiry(token);
      }
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      if (this.token) localStorage.setItem('fess_token', this.token);
    },

    /**
     * Login via the backend. Bila email belum terverifikasi, backend tidak
     * mengirim token; hasilnya diteruskan ke halaman verifikasi.
     */
    async login({ identifier, password, role = 'User' }) {
      const res = await api.login({ identifier, password, role });
      if (res?.token) this.setSession(res);
      return res;
    },

    /** Social login via Google ID token. */
    async loginGoogle(payload) {
      const res = await api.loginGoogle(payload);
      if (res?.token) this.setSession(res);
      return res;
    },

    /**
     * Complete a session started outside the SPA (Google OAuth redirect):
     * store the JWT, then load the profile from the backend.
     */
    async loginWithToken(token) {
      if (isTokenExpired(token)) {
        this.expireSession('expired');
        throw new Error('Sesi login sudah kedaluwarsa. Silakan masuk kembali.');
      }

      this.token = token;
      localStorage.setItem('fess_token', token);
      this.scheduleSessionExpiry(token);

      // Fast-path: ekstrak payload dasar (id, role, handle, email) dari JWT
      const payload = parseJwtPayload(token);
      if (payload) {
        this.user = normalizeUser({
          id: payload.sub,
          role: payload.role || 'User',
          handle: payload.handle,
          email: payload.email,
        });
        localStorage.setItem('fess_user', JSON.stringify(this.user));
      }

      try {
        return await this.fetchMe();
      } catch (err) {
        // Event global 401/403 sudah menghapus token; jangan lanjut sebagai
        // user lama hanya karena payload JWT sempat diisi.
        if (!this.token) {
          this.clearSession();
          throw err;
        }
        console.warn('Gagal fetch profile via /auth/me, memakai data token JWT:', err);
        // Jika token valid dan user memiliki role, tetap izinkan masuk
        if (this.user?.role) {
          return this.user;
        }
        this.clearSession();
        throw err;
      }
    },

    async registerUser(payload) {
      const res = await api.registerUser(payload);
      if (res?.token) this.setSession(res);
      return res;
    },

    async registerBase(payload) {
      const res = await api.registerBase(payload);
      if (res?.token) this.setSession(res);
      return res;
    },

    /** Refresh the cached profile from the backend. */
    async fetchMe() {
      const res = await api.me();
      const user = res?.user ?? res;
      this.user = normalizeUser({ ...this.user, ...user });
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      return this.user;
    },

    /** Persist profile changes through the API, then update local state. */
    async updateProfile(updates = {}) {
      const res = await api.updateProfile(updates);
      const user = res?.user ?? res;
      if (user && typeof user === 'object') {
        this.user = normalizeUser({ ...this.user, ...user });
      } else {
        this.user = normalizeUser({ ...this.user, ...updates });
      }
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      return this.user;
    },

    /** Jadwalkan logout otomatis tepat saat `exp` JWT terlewati. */
    scheduleSessionExpiry(token = this.token) {
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = null;
      }
      if (!token || typeof window === 'undefined') return;

      const expiry = getTokenExpiry(token);
      if (!expiry) {
        this.expireSession('expired');
        return;
      }

      const delay = expiry - Date.now();
      if (delay <= 0) {
        this.expireSession('expired');
        return;
      }

      // setTimeout dibatasi ±24,8 hari; JWT kita hanya 1 hari.
      expiryTimer = window.setTimeout(() => {
        expiryTimer = null;
        if (this.token === token) this.expireSession('expired');
      }, Math.min(delay, 2_147_483_647));
    },

    /** Dipanggil App saat mount: cek token tersimpan + muat profil terbaru. */
    async startSessionWatch() {
      if (!this.token) return;
      if (isTokenExpired(this.token)) {
        this.expireSession('expired');
        return;
      }
      this.scheduleSessionExpiry(this.token);
      try {
        await this.fetchMe();
      } catch {
        // 401/403 ditangani listener global di App.vue.
      }
    },

    /** Akhiri sesi lokal lalu beri tahu App untuk mengarahkan ke login. */
    expireSession(reason = 'expired') {
      this.clearSession();
      try {
        localStorage.setItem('fess_session_reason', reason);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:session-ended', { detail: { reason } })
        );
      }
    },

    clearSession() {
      this.user = null;
      this.token = null;
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = null;
      }
      try {
        localStorage.removeItem('fess_user');
        localStorage.removeItem('fess_token');
        sessionStorage.clear();
      } catch {
        // Storage not available
      }
    },

    async logout() {
      this.clearSession();
      try {
        await api.logout();
      } catch {
        // Session is cleared locally even if the server call fails.
      }
    },
  },
});
