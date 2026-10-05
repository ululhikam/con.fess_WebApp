<template>
  <nav class="admin-topnav" :class="{ 'admin-topnav--sticky': sticky }" aria-label="Navigasi admin">
    <div class="container flex items-center justify-between flex-wrap gap-3">
      <router-link to="/" class="brand-logo" aria-label="Beranda Base Club">
        <div class="speech-bubble-logo">
          <span class="logo-base">BASE</span>
          <span class="logo-club">CLUB</span>
        </div>
      </router-link>

      <div class="nav-pill-container">
        <router-link to="/feed" class="nav-pill">Feed</router-link>
        <router-link to="/profile" class="nav-pill">Profil Saya</router-link>
        <router-link
          to="/base-admin"
          class="nav-pill"
          :class="{ 'active-pill': active === 'base-admin' }"
          :aria-current="active === 'base-admin' ? 'page' : null"
        >
          Base Admin
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          to="/super-admin"
          class="nav-pill"
          :class="{ 'active-pill': active === 'super-admin' }"
          :aria-current="active === 'super-admin' ? 'page' : null"
        >
          Super Admin
        </router-link>
      </div>

      <div class="flex items-center gap-2">
        <div class="role-selector flex items-center px-2 py-1">
          <label for="admin-role-select" class="visually-hidden">Peran akun</label>
          <select
            id="admin-role-select"
            :value="role"
            class="role-select-dropdown"
            @change="(e) => switchRole(e.target.value)"
          >
            <option v-for="option in ROLE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button type="button" class="btn-logout text-xs" @click="logout">Keluar</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * AdminTopNav — brand chrome shared by the Base Admin & Super Admin dashboards.
 * Session behaviour (role switch, logout) comes from useAdminSession().
 */
import { useAdminSession } from '../../composables/useAdminDashboard';
import { ROLE_OPTIONS } from '../../data/adminData';

defineProps({
  /** 'base-admin' | 'super-admin' — which pill is highlighted. */
  active: { type: String, default: '' },
  sticky: { type: Boolean, default: false },
});

const { role, isSuperAdmin, switchRole, logout } = useAdminSession();
</script>

<style scoped>
.admin-topnav {
  background: var(--brand-blue);
  padding: 14px 0;
  box-shadow: 0 4px 20px var(--neon-blue-glow);
}

.admin-topnav--sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  /* White badge sitting on the brand-blue chrome: inverted on-accent colours. */
  background: var(--text-on-accent);
  color: var(--lime-ink);
  padding: 5px 12px;
  border-radius: 14px 14px 14px 2px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 900;
  font-size: 14px;
}

.logo-club {
  background: var(--lime-primary);
  color: var(--lime-ink);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 12px;
}

.nav-pill-container {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-pill);
  padding: 4px 6px;
  display: flex;
  gap: 4px;
}

.nav-pill {
  color: var(--text-on-accent);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  transition: all 0.2s;
  opacity: 0.85;
}

.nav-pill.active-pill,
.nav-pill:hover {
  background: rgba(255, 255, 255, 0.25);
  opacity: 1;
}

.role-select-dropdown {
  background: transparent;
  color: var(--lime-primary);
  border: none;
  font-size: 11px;
  font-weight: 800;
  outline: none;
  cursor: pointer;
}

.role-select-dropdown option {
  background: var(--bg-inset);
  color: var(--text-main);
}

.btn-logout {
  background: rgba(255, 0, 122, 0.22);
  border: 1px solid var(--cyber-pink);
  color: var(--text-on-accent);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Solid pink + white label is only ~3.8:1, so the hover deepens the wash
   instead — the label keeps its 7:1 contrast against brand-blue. */
.btn-logout:hover {
  background: rgba(255, 0, 122, 0.5);
  color: var(--text-on-accent);
}
</style>
