<template>
  <nav class="profile-nav">
    <div class="container flex items-center justify-between flex-wrap gap-3">
      <router-link to="/" class="brand-logo" aria-label="Base Club — beranda">
        <div class="speech-bubble-logo">
          <span class="logo-base">BASE</span>
          <span class="logo-club">CLUB</span>
        </div>
      </router-link>

      <!-- Center Nav Capsule -->
      <div class="nav-pill-container">
        <router-link to="/feed" class="nav-pill">Feed</router-link>
        <router-link to="/profile" class="nav-pill active-pill" aria-current="page"
          >Profil Saya</router-link
        >
        <router-link
          v-if="authStore.isBaseAdmin || authStore.isSuperAdmin"
          to="/base-admin"
          class="nav-pill"
          >Base Admin</router-link
        >
        <router-link v-if="authStore.isSuperAdmin" to="/super-admin" class="nav-pill"
          >Super Admin</router-link
        >
      </div>

      <!-- Right Quick Actions -->
      <div class="flex items-center gap-2">
        <!-- Role Selector Dropdown -->
        <div
          class="role-selector-wrapper flex items-center bg-black/30 border border-white/20 rounded-full px-2 py-1"
        >
          <span class="text-xs text-white/70 mr-1 hidden sm:inline">Peran:</span>
          <select
            :value="authStore.user?.role || 'User'"
            aria-label="Pilih peran"
            @change="(e) => authStore.switchRole(e.target.value)"
            class="role-select-dropdown"
          >
            <option value="User">User / Anon</option>
            <option value="Base Admin">Base Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>

        <button type="button" class="btn-logout-pill text-xs" @click="$emit('logout')">
          Keluar
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * ProfileNav — sticky branded navigation bar of the profile screen.
 * Reads the auth store for the role switcher and emits `logout` so routing
 * stays with the view.
 */
import { useAuthStore } from '../../stores/authStore';

defineEmits(['logout']);

const authStore = useAuthStore();
</script>

<style scoped>
.profile-nav {
  background-color: var(--brand-blue);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px var(--neon-blue-glow);
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  background: var(--bg-surface);
  color: var(--text-main);
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
  color: var(--brand-blue-ink);
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
  background: var(--bg-raised);
  color: var(--text-main);
}

.btn-logout-pill {
  background: rgba(255, 0, 122, 0.22);
  border: 1px solid var(--cyber-pink);
  /* Pink text on brand-blue only reaches ~2:1, so the label stays white and
     the pink shows through the border + wash. */
  color: var(--text-on-accent);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout-pill:hover {
  background: rgba(255, 0, 122, 0.5);
}
</style>
