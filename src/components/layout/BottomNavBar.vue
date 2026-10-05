<template>
  <nav class="app-bottom-navbar" aria-label="Navigasi utama">
    <div class="bottom-nav-inner">
      <template v-for="(item, index) in ITEMS" :key="item.key">
        <!-- Center FAB sits between Search and Aktivitas -->
        <button
          v-if="index === FAB_AFTER"
          type="button"
          class="bottom-center-fab"
          title="Kirim Menfess"
          aria-label="Kirim Menfess"
          @click="$emit('openCompose')"
        >
          <Plus :size="24" :stroke-width="3" />
        </button>

        <button
          type="button"
          :class="['bottom-nav-tab', { active: active === item.key }]"
          :aria-current="active === item.key ? 'page' : undefined"
          @click="$emit('navChange', item.key)"
        >
          <span class="nav-tab-icon">
            <component :is="item.icon" :size="22" :stroke-width="2.2" />
          </span>
          <span class="nav-tab-label">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
/**
 * BottomNavBar — primary navigation for the mobile app shell.
 * Renders from config so adding a tab is a one-line change.
 * Emits `navChange(key)` and `openCompose`.
 */
import { Home, Search, Bell, UserRound, Plus } from 'lucide-vue-next';

const ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'aktivitas', label: 'Aktivitas', icon: Bell },
  { key: 'akun', label: 'Akun', icon: UserRound },
];

/** The compose FAB is rendered right after this index. */
const FAB_AFTER = 1;

defineProps({ active: { type: String, default: 'home' } });
defineEmits(['navChange', 'openCompose']);
</script>

<style scoped>
.app-bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--shell-header-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--shell-border-strong);
  padding: 8px 12px calc(12px + var(--sab, 0px));
  font-family: var(--font-sans);
}

.bottom-nav-inner {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.bottom-nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  transition: color 0.2s ease;
  flex: 1;
}

.bottom-nav-tab:hover {
  color: var(--shell-text);
}

.bottom-nav-tab.active {
  color: var(--shell-active);
}
.bottom-nav-tab.active .nav-tab-icon {
  transform: translateY(-2px);
}

.nav-tab-icon {
  display: flex;
  transition: transform 0.2s ease;
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
  background: linear-gradient(135deg, var(--shell-sub-accent) 0%, var(--brand-blue) 100%);
  color: var(--text-on-accent);
  border: 3px solid var(--shell-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -18px 8px 0;
  box-shadow: 0 8px 20px var(--shadow-color);
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.bottom-center-fab:hover {
  transform: scale(1.1);
}
</style>
