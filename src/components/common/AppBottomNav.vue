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
          <span v-if="effectiveUnreadCount > 0" class="notif-badge-number">
            {{ displayCount }}
          </span>
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
          <UserRound :size="20" />
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
 *   - Floating rounded pill detached from the viewport edge
 *   - Single design tokens (--shell-card, --shell-border-strong, --shell-active, --shell-sub-accent)
 *   - Active tab gets a soft chip behind the icon; micro-interaction on hover
 */
import { computed } from 'vue';
import { Home, Search, Plus, Bell, UserRound } from 'lucide-vue-next';
import { useNotifications } from '../../composables/useNotifications';

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
    default: undefined,
  },
});

const emit = defineEmits(['navChange', 'changeTab', 'openCompose']);

const notif = useNotifications();

const effectiveUnreadCount = computed(() => {
  if (typeof props.unreadCount === 'number' && props.unreadCount >= 0) {
    return props.unreadCount;
  }
  return notif.unreadCount.value;
});

const displayCount = computed(() => {
  if (effectiveUnreadCount.value <= 0) return '';
  if (effectiveUnreadCount.value > 99) return '99+';
  return String(effectiveUnreadCount.value);
});

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
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: min(520px, calc(100% - 24px));
  padding: 7px 8px;
  background: var(--shell-card, rgba(11, 13, 20, 0.9));
  border: 1px solid var(--shell-border-strong, rgba(255, 255, 255, 0.15));
  border-radius: 24px;
  box-shadow: 0 14px 34px var(--shadow-color, rgba(0, 0, 0, 0.45));
  font-family: var(--font-sans);
}

.bottom-nav-inner {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 2px;
}

.bottom-nav-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  padding: 4px 2px;
  background: transparent;
  border: none;
  border-radius: 14px;
  color: var(--shell-text-muted, rgba(255, 255, 255, 0.5));
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.18s ease;
}

.bottom-nav-tab:hover {
  color: var(--shell-text, #ffffff);
}

.bottom-nav-tab:focus-visible {
  outline: 2px solid var(--shell-active, #ffffff);
  outline-offset: 2px;
}

.bottom-nav-tab.active {
  color: var(--shell-active, #ffffff);
}

.nav-tab-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 26px;
  border-radius: var(--radius-pill, 999px);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.bottom-nav-tab.active .nav-tab-icon {
  background: var(--shell-chip, rgba(255, 255, 255, 0.08));
  transform: translateY(-1px);
}

.nav-tab-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
  line-height: 1;
}

.bottom-center-fab {
  width: 48px;
  height: 48px;
  margin: 0 6px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    var(--shell-sub-accent, #7000ff) 0%,
    var(--brand-blue, #0038ff) 100%
  );
  color: var(--brand-blue-ink, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow:
    0 8px 18px var(--shadow-color, rgba(0, 0, 0, 0.45)),
    0 0 0 4px var(--shell-chip, rgba(255, 255, 255, 0.08));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.bottom-center-fab:hover {
  transform: translateY(-1px) scale(1.05);
}

.bottom-center-fab:active {
  transform: scale(0.96);
}

.bottom-center-fab:focus-visible {
  outline: 2px solid var(--shell-active, #ffffff);
  outline-offset: 3px;
}

.notif-badge-number {
  position: absolute;
  top: -7px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4.5px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.45);
  border: 2px solid var(--shell-card, #0f111a);
  pointer-events: none;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.2px;
  animation: badge-pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes badge-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .app-bottom-nav {
    width: calc(100% - 20px);
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    padding: 6px;
    border-radius: 20px;
  }
  .bottom-nav-tab {
    padding: 3px 1px;
    gap: 1px;
  }
  .nav-tab-icon {
    width: 40px;
    height: 24px;
  }
  .nav-tab-label {
    font-size: 9.5px;
    letter-spacing: 0;
  }
  .bottom-center-fab {
    width: 44px;
    height: 44px;
    margin: 0 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bottom-nav-tab,
  .nav-tab-icon,
  .bottom-center-fab,
  .notif-badge-number {
    transition: none;
    animation: none;
  }
}
</style>
