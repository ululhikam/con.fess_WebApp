<template>
  <nav class="app-bottom-nav" aria-label="Navigasi Utama">
    <div class="bottom-nav-inner">
      <!-- 1. HOME -->
      <button
        type="button"
        class="bottom-nav-tab"
        :class="{ active: currentActive === 'home' }"
        aria-label="Home"
        @click="selectTab('home')"
      >
        <span class="nav-tab-icon">
          <Home :size="20" />
        </span>
        <span class="nav-tab-label">Home</span>
      </button>

      <!-- 2. SEARCH -->
      <button
        type="button"
        class="bottom-nav-tab"
        :class="{ active: currentActive === 'search' }"
        aria-label="Pencarian"
        @click="selectTab('search')"
      >
        <span class="nav-tab-icon">
          <Search :size="20" />
        </span>
        <span class="nav-tab-label">Search</span>
      </button>

      <!-- 3. [+] CENTER FAB BUTTON -->
      <button
        type="button"
        class="bottom-center-fab"
        aria-label="Buat Confession Baru"
        title="Kirim Fess"
        @click="$emit('openCompose')"
      >
        <Plus :size="22" stroke-width="2.6" />
      </button>

      <!-- 4. NOTIF -->
      <button
        type="button"
        class="bottom-nav-tab"
        :class="{ active: currentActive === 'notif' }"
        aria-label="Notifikasi"
        @click="selectTab('notif')"
      >
        <span class="nav-tab-icon relative">
          <Bell :size="20" />
          <span v-if="unreadCount > 0" class="notif-badge-dot" />
        </span>
        <span class="nav-tab-label">Notif</span>
      </button>

      <!-- 5. AKUN / PROFILE (Instagram Style) -->
      <button
        type="button"
        class="bottom-nav-tab"
        :class="{ active: currentActive === 'akun' || currentActive === 'profile' }"
        aria-label="Profil Akun"
        @click="selectTab('akun')"
      >
        <span class="nav-tab-icon">
          <User :size="20" />
        </span>
        <span class="nav-tab-label">Akun</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
/**
 * AppBottomNav.vue — Unified 5-element Bottom Navigation Bar for User and Base Admin.
 * 
 * 5 Navigation items:
 *   1. Home
 *   2. Search
 *   3. [+] Center FAB (Compose / Broadcast)
 *   4. Notif
 *   5. Akun (Instagram-style Profile)
 * 
 * Aesthetic:
 *   - Glassmorphic backdrop blur
 *   - Single design tokens (--shell-header-bg, --shell-border, --shell-active, --shell-sub-accent)
 *   - Micro-interaction translateY hover and active states
 */
import { computed } from 'vue';
import { Home, Search, Plus, Bell, User } from 'lucide-vue-next';

const props = defineProps({
  active: {
    type: String,
    default: 'home',
  },
  activeTab: {
    type: String,
    default: '',
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['navChange', 'changeTab', 'openCompose']);

const currentActive = computed(() => {
  const val = props.activeTab || props.active || 'home';
  if (val === 'profile') return 'akun';
  return val;
});

function selectTab(key) {
  emit('navChange', key === 'akun' ? 'profile' : key);
  emit('changeTab', key);
}
</script>

<style scoped>
.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--shell-header-bg, rgba(11, 13, 20, 0.9));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  padding: 6px 16px 8px;
  font-family: var(--font-sans);
}

.bottom-nav-inner {
  max-width: 540px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr));
  align-items: center;
}

.bottom-nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--shell-text-muted, rgba(255, 255, 255, 0.5));
  font-family: inherit;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  transition: color 0.15s ease;
}

.bottom-nav-tab:hover {
  color: var(--shell-text, #ffffff);
}

.bottom-nav-tab.active {
  color: var(--shell-active, #ffffff);
}

.bottom-nav-tab.active .nav-tab-icon {
  transform: translateY(-2px);
}

.nav-tab-icon {
  display: flex;
  transition: transform 0.2s ease;
  position: relative;
}

.nav-tab-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.bottom-center-fab {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--shell-sub-accent, #7000ff) 0%, var(--brand-blue, #0038ff) 100%);
  color: #ffffff;
  border: 3px solid var(--shell-stage, #08080c);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -18px 8px 0;
  box-shadow: 0 8px 20px var(--shadow-color, rgba(0, 0, 0, 0.45));
  cursor: pointer;
  transition: transform 0.2s ease;
}

.bottom-center-fab:hover {
  transform: scale(1.08);
}

.notif-badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid var(--shell-card);
}

@media (max-width: 480px) {
  .app-bottom-nav {
    padding: 4px 6px calc(6px + env(safe-area-inset-bottom, 0px));
  }
  .bottom-nav-inner {
    max-width: 100%;
  }
  .bottom-nav-tab {
    padding: 3px 2px;
    gap: 2px;
  }
  .nav-tab-label {
    font-size: 10px;
  }
  .bottom-center-fab {
    width: 46px;
    height: 46px;
    margin: -16px 4px 0;
  }
}
</style>
