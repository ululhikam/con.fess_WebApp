import { defineStore } from 'pinia';
import { api } from '../api';

/** Safe JSON parse — returns null for missing or corrupt payloads. */
function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Plain string values (tokens) are stored unencoded. */
const readToken = () => localStorage.getItem('fess_token');

/**
 * Normalize the API User payload (snake_case) into the app user model.
 * Keeps both aliases so existing components keep working.
 */
function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    managedBases: user.managed_bases ?? user.managedBases ?? [],
    igAccount: user.ig_account ?? user.igAccount ?? null,
    followersCount: user.followers_count ?? user.followersCount ?? 0,
    followingCount: user.following_count ?? user.followingCount ?? 0,
    fessCount: user.fess_count ?? user.fessCount ?? 0,
    balance: user.balance ?? 0,
    createdAt: user.created_at ?? user.createdAt ?? null,
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
    setSession({ user, token }) {
      this.user = normalizeUser(user);
      if (token) this.token = token;
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      localStorage.setItem('fess_token', this.token);
    },

    /** Login via the backend. @param {{identifier: string, password: string, role?: string}} credentials */
    async login({ identifier, password, role = 'User' }) {
      const res = await api.login({ identifier, password, role });
      this.setSession(res);
      return this.user;
    },

    /** Social login via Google ID token. */
    async loginGoogle(payload) {
      const res = await api.loginGoogle(payload);
      this.setSession(res);
      return this.user;
    },

    /**
     * Complete a session started outside the SPA (Google OAuth redirect):
     * store the JWT, then load the profile from the backend.
     */
    async loginWithToken(token) {
      this.token = token;
      localStorage.setItem('fess_token', token);
      try {
        return await this.fetchMe();
      } catch (err) {
        this.clearSession();
        throw err;
      }
    },

    async registerUser(payload) {
      const res = await api.registerUser(payload);
      this.setSession(res);
      return this.user;
    },

    async registerBase(payload) {
      const res = await api.registerBase(payload);
      this.setSession(res);
      return this.user;
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

    clearSession() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('fess_user');
      localStorage.removeItem('fess_token');
    },

    async logout() {
      try {
        await api.logout();
      } catch {
        // Session is cleared locally even if the server call fails.
      }
      this.clearSession();
    },
  },
});
