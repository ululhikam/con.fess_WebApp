<template>
  <header class="app-top-header">
    <div class="top-header-inner">
      <router-link to="/" class="brand-logo" aria-label="Beranda Base Confess">
        <span class="speech-bubble-logo">
          <span class="logo-icon"><MessageSquare :size="18" /></span>
          <span class="logo-base">BASE</span>
          <span class="logo-club">CONFESS</span>
        </span>
      </router-link>

      <div class="header-right-actions">
        <ThemeToggle class="header-theme" />

        <router-link
          v-if="authStore.isBaseAdmin || authStore.isSuperAdmin"
          to="/base-admin"
          class="btn-admin-chip"
        >
          Admin Portal
        </router-link>

        <button type="button" class="btn-header-kirim" @click="$emit('openCompose')">
          <Plus :size="14" /> Kirim Fess
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * AppHeader — sticky app chrome for the feed shell.
 * Presentational; the parent handles the `openCompose` action.
 */
import { MessageSquare, Plus } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore';
import ThemeToggle from '../ui/ThemeToggle.vue';

defineEmits(['openCompose']);
const authStore = useAuthStore();
</script>

<style scoped>
.app-top-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: var(--shell-header-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--shell-border-strong);
  padding: 12px 20px;
  font-family: var(--font-sans);
}

.top-header-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--shell-text);
  color: var(--shell-bg);
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  font-weight: 900;
  font-size: 14.5px;
  box-shadow: 0 4px 16px var(--shadow-color);
}

.logo-icon {
  display: flex;
  align-items: center;
}
.logo-base {
  color: inherit;
}

.logo-club {
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 900;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-theme {
  color: var(--shell-text);
}

.btn-admin-chip {
  color: var(--shell-active);
  border: 1.5px solid currentColor;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  font-size: 12px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-admin-chip:hover {
  background: var(--shell-chip);
}

.btn-header-kirim {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 14px var(--shadow-color);
  transition: transform 0.15s ease;
}

.btn-header-kirim:hover {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .speech-bubble-logo {
    padding: 5px 12px;
    font-size: 13px;
  }
  .btn-header-kirim {
    padding: 6px 14px;
    font-size: 12px;
  }
}
</style>
