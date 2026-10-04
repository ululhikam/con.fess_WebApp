import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('fess_user')) || {
      id: 'usr_7721',
      username: 'Alex_Dev99',
      handle: '@alexdev',
      role: 'Super Admin', // 'Super Admin' | 'Base Admin' | 'User'
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      level: 42,
      bio: 'Fullstack Dev & Auto-Base Enthusiast ⚡ Building anonymous tools.',
      badges: ['CHIEF ADMIN', 'EARLY ADOPTER', 'BUG HUNTER'],
      managedBases: ['@codememfess', '@indiegamedev']
    },
    token: localStorage.getItem('fess_token') || 'mock_jwt_token_9981'
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.role === 'Super Admin',
    isBaseAdmin: (state) => state.user?.role === 'Base Admin' || state.user?.role === 'Super Admin',
    isRegularUser: (state) => state.user?.role === 'User'
  },
  actions: {
    login(role = 'User') {
      const mockUsers = {
        'Super Admin': {
          id: 'usr_admin_01',
          username: 'SuperAdmin_GodMode',
          handle: '@superadmin',
          role: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
          level: 99,
          bio: 'Root Administrator of FessHub & AnonBase Engine.',
          badges: ['ROOT SUPER ADMIN', 'FOUNDER'],
          managedBases: ['@all_bases']
        },
        'Base Admin': {
          id: 'usr_base_mod',
          username: 'BaseModerator_Code',
          handle: '@code_mod',
          role: 'Base Admin',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
          level: 28,
          bio: 'Official moderator for @codememfess base.',
          badges: ['BASE MODERATOR', 'VERIFIED ADMIN'],
          managedBases: ['@codememfess']
        },
        'User': {
          id: 'usr_anon_99',
          username: 'Anon_ShadowX',
          handle: '@anon_shadow',
          role: 'User',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          level: 14,
          bio: 'Secret sender & casual reader.',
          badges: ['ANON SENDER', 'MEMBER'],
          managedBases: []
        }
      }

      this.user = mockUsers[role] || mockUsers['User']
      this.token = 'mock_jwt_token_' + Date.now()
      localStorage.setItem('fess_user', JSON.stringify(this.user))
      localStorage.setItem('fess_token', this.token)
    },
    switchRole(role) {
      this.login(role)
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('fess_user')
      localStorage.removeItem('fess_token')
    }
  }
})
