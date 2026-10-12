import { defineStore } from 'pinia';

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
    login(role = 'User') {
      const mockUsers = {
        'Super Admin': {
          id: 'usr_admin_01',
          username: 'SuperAdmin_GodMode',
          handle: '@superadmin',
          role: 'Super Admin',
          avatar:
            'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
          level: 99,
          bio: 'Root Administrator of FessHub & AnonBase Engine.',
          badges: ['ROOT SUPER ADMIN', 'FOUNDER'],
          managedBases: ['@all_bases'],
        },
        'Base Admin': {
          id: 'usr_base_mod',
          username: 'BaseModerator_Code',
          handle: '@code_mod',
          role: 'Base Admin',
          avatar:
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
          level: 28,
          bio: 'Official moderator for @codememfess base.',
          badges: ['BASE MODERATOR', 'VERIFIED ADMIN'],
          managedBases: ['@codememfess'],
        },
        User: {
          id: 'usr_anon_99',
          username: 'Anon_ShadowX',
          handle: '@anon_shadow',
          role: 'User',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          level: 14,
          bio: 'Secret sender & casual reader.',
          badges: ['ANON SENDER', 'MEMBER'],
          managedBases: [],
        },
      };

      this.user = mockUsers[role] || mockUsers['User'];
      this.token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      localStorage.setItem('fess_token', this.token);
    },
    registerUser(payload = {}) {
      const rawHandle = payload.handle || payload.username || 'anon_user';
      const cleanHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      this.user = {
        id: 'usr_' + Date.now(),
        username: payload.username || 'Pengguna Anonim',
        handle: cleanHandle,
        email: payload.email || 'user@fesshub.com',
        role: 'User',
        avatar:
          payload.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        level: 1,
        bio: payload.bio || 'Secret sender & casual reader di FessHub.',
        badges: ['NEW MEMBER', 'ANON SENDER'],
        managedBases: [],
      };
      this.token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      localStorage.setItem('fess_token', this.token);
      return this.user;
    },
    registerBase(payload = {}) {
      const rawHandle = payload.handle || '@codememfess';
      const cleanHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      this.user = {
        id: 'usr_base_' + Date.now(),
        name: payload.name || 'Code & Memes Base',
        username: payload.name || 'Code & Memes Base',
        handle: cleanHandle,
        email: payload.email || 'admin@codememfess.id',
        role: 'Base Admin',
        avatar:
          payload.avatar ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        level: 1,
        bio:
          payload.bio ||
          `Base resmi komunitas ${cleanHandle}. Kirim confession anonim dengan tag keyword base!`,
        badges: ['BASE CREATOR', 'VERIFIED ADMIN'],
        managedBases: [cleanHandle],
        igAccount: payload.igAccount || '@codememfess_ig',
        followersCount: 18420,
        followingCount: 42,
        fessCount: 1284,
        balance: 24580,
        revenue: 1120000,
      };
      this.token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      localStorage.setItem('fess_token', this.token);
      return this.user;
    },
    updateProfile(updates = {}) {
      if (!this.user) return null;
      this.user = {
        ...this.user,
        ...updates,
      };
      localStorage.setItem('fess_user', JSON.stringify(this.user));
      return this.user;
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('fess_user');
      localStorage.removeItem('fess_token');
    },
  },
});
