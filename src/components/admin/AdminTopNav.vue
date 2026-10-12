<template>
  <nav class="admin-topnav" :class="{ 'admin-topnav--sticky': sticky }" aria-label="Navigasi portal admin">
    <div class="container flex items-center justify-between flex-wrap gap-3">
      <!-- Admin Portal Brand -->
      <router-link to="/base-admin" class="brand-logo" aria-label="Portal Admin — Beranda">
        <div class="speech-bubble-logo">
          <img src="/logo.png" alt="Logo" class="admin-logo-img" />
          <span class="logo-base">BASE</span>
          <span class="logo-admin">ADMIN PORTAL</span>
        </div>
      </router-link>

      <!-- Center: Dedicated Admin Navigation -->
      <div class="nav-pill-container" role="navigation" aria-label="Menu Admin">
        <router-link
          to="/base-admin"
          class="nav-pill"
          :class="{ 'active-pill': active === 'base-admin' }"
          :aria-current="active === 'base-admin' ? 'page' : null"
        >
          <LayoutDashboard :size="14" />
          <span>Dasbor Base</span>
        </router-link>

        <router-link
          v-if="isSuperAdmin"
          to="/super-admin"
          class="nav-pill"
          :class="{ 'active-pill': active === 'super-admin' }"
          :aria-current="active === 'super-admin' ? 'page' : null"
        >
          <ShieldAlert :size="14" />
          <span>Super Admin</span>
        </router-link>
      </div>

      <!-- Right: Admin Profile Info & Logout -->
      <div class="flex items-center gap-3">
        <div class="admin-identity-badge">
          <span class="admin-role-tag">
            {{ isSuperAdmin ? 'SUPER ADMIN' : 'MODERATOR' }}
          </span>
          <span class="admin-name">{{ authStore.displayName }}</span>
        </div>

        <button type="button" class="btn-logout text-xs" @click="logout" aria-label="Keluar dari portal admin">
          <LogOut :size="13" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * AdminTopNav — brand chrome dedicated strictly to Base Admin & Super Admin dashboards.
 * Completely decoupled from user consumer feed navigation and role switches.
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Shield, ShieldAlert, LayoutDashboard, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore';

defineProps({
  /** 'base-admin' | 'super-admin' — which pill is highlighted. */
  active: { type: String, default: 'base-admin' },
  sticky: { type: Boolean, default: false },
});

const authStore = useAuthStore();
const router = useRouter();

const isSuperAdmin = computed(() => authStore.isSuperAdmin);

function logout() {
  authStore.logout();
  router.push('/login');
}
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
  background: var(--text-on-accent);
  color: var(--lime-ink);
  padding: 5px 12px;
  border-radius: 14px 14px 14px 2px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 900;
  font-size: 14px;
}

.admin-logo-img {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.logo-admin {
  background: var(--lime-primary);
  color: var(--lime-ink);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
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
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  transition: all 0.2s;
  opacity: 0.85;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nav-pill.active-pill,
.nav-pill:hover {
  background: rgba(255, 255, 255, 0.25);
  opacity: 1;
}

.admin-identity-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 4px 12px 4px 8px;
  border-radius: var(--radius-pill);
  color: #fff;
}

.admin-role-tag {
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-size: 10px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.5px;
}

.admin-name {
  font-size: 12px;
  font-weight: 700;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: rgba(255, 0, 122, 0.5);
  color: var(--text-on-accent);
}
</style>
