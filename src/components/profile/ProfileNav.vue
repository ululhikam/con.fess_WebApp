<template>
  <nav class="profile-nav" aria-label="Navigasi Profil Pengguna">
    <div class="container flex items-center justify-between flex-wrap gap-3">
      <router-link to="/feed" class="brand-logo" aria-label="Fess n Curious — Kembali ke Feed">
        <div class="speech-bubble-logo">
          <img src="/logo.png" alt="Logo" class="profile-nav-logo-img" />
          <span class="logo-base">FESS</span>
          <span class="logo-club">CURIOUS</span>
        </div>
      </router-link>

      <!-- Center Nav: Clean User Navigation -->
      <div class="nav-center-actions">
        <router-link to="/feed" class="nav-back-pill">
          <ArrowLeft :size="15" />
          <span>Kembali ke Feed</span>
        </router-link>
      </div>

      <!-- Right Quick Actions: User Badge & Logout -->
      <div class="flex items-center gap-3">
        <div class="user-identity-badge">
          <span class="user-avatar-tiny">
            <UserRound :size="14" />
          </span>
          <span class="user-handle-text">{{ authStore.displayName }}</span>
        </div>

        <button type="button" class="btn-logout-pill text-xs" @click="$emit('logout')">
          <LogOut :size="13" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * ProfileNav — sticky branded navigation bar for the user profile screen.
 * Dedicated to the User experience: strictly user navigation, no admin controls.
 */
import { ArrowLeft, UserRound, LogOut } from 'lucide-vue-next';
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

.profile-nav-logo-img {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.logo-club {
  background: var(--lime-primary);
  color: var(--lime-ink);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 12px;
}

.nav-center-actions {
  display: flex;
  align-items: center;
}

.nav-back-pill {
  color: var(--brand-blue-ink);
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.nav-back-pill:hover {
  background: rgba(255, 255, 255, 0.32);
  transform: translateX(-2px);
}

.user-identity-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 12px 4px 6px;
  border-radius: var(--radius-pill);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.user-avatar-tiny {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--lime-primary);
  color: var(--lime-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-handle-text {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout-pill {
  background: rgba(255, 0, 122, 0.22);
  border: 1px solid var(--cyber-pink);
  color: var(--text-on-accent);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-logout-pill:hover {
  background: rgba(255, 0, 122, 0.5);
}
</style>
