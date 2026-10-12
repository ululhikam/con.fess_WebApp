<template>
  <div class="user-app-layout">
    <main class="app-main-centered-stage">
      <div class="centered-content-wrapper">
        <!-- 1. HOME -->
        <FeedHomeTab
          v-if="activeNav === 'home'"
          v-model="homeTab"
          :posts="feedPosts"
          :followed-handles="followedHandles"
          :loading="loading"
          :error="error"
          @like="toggleLike"
          @findMore="onNavChange('search')"
          @retry="reload"
        />

        <!-- 2. SEARCH -->
        <ExploreSearchTab
          v-else-if="activeNav === 'search'"
          v-model:query="searchQuery"
          v-model:category="selectedCategory"
          v-model:mode="searchTab"
          :bases="filteredBases"
          :categories="FEED_CATEGORIES"
          :loading="loading"
          :is-following="isFollowing"
          @toggle-follow="toggleFollowBase"
        />

        <!-- 3. NOTIF -->
        <ActivityTab
          v-else-if="activeNav === 'notif' || activeNav === 'aktivitas'"
          v-model="aktivitasTab"
          :filters="ACTIVITY_FILTERS"
          :loading="loading"
          :error="error"
          @retry="reload"
        />

        <!-- 4. USER PROFILE (Instagram Style) -->
        <UserProfileTab
          v-else-if="activeNav === 'profile' || activeNav === 'akun'"
          :theme-mode="themeMode"
          @setTheme="setMode"
          @logout="handleLogout"
          @openCompose="openComposePage"
          @openSubPanel="handleAccountAction"
        />
      </div>
    </main>

    <!-- Bottom Navigation Bar (Persistent across all tabs) -->
    <BottomNavBar
      :active="activeNav"
      @navChange="onNavChange"
      @openCompose="openComposePage"
    />

    <!-- Account Sub-Page Slide-in Panels -->
    <AccountPanels
      v-model="activePanel"
      :user="authStore.user"
    />
  </div>
</template>

<script setup>
/**
 * FeedPage — primary application shell for regular users.
 * 5-element mobile navigation:
 *   1. Home
 *   2. Search
 *   3. [+] (Compose FAB)
 *   4. Notif
 *   5. Profil (Instagram-style with top hamburger, settings, center avatar, 3 tabs)
 *
 * Persistent Bottom Navigation stays visible across all 5 tabs.
 */
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import BottomNavBar from '../components/layout/BottomNavBar.vue';
import FeedHomeTab from '../components/feed/FeedHomeTab.vue';
import ExploreSearchTab from '../components/feed/ExploreSearchTab.vue';
import ActivityTab from '../components/feed/ActivityTab.vue';
import UserProfileTab from '../components/feed/UserProfileTab.vue';
import AccountPanels from '../components/feed/AccountPanels.vue';

import { useAuthStore } from '../stores/authStore';
import { useFeedPosts } from '../composables/useFeedPosts';
import { useFollowBase } from '../composables/useFollowBase';
import { useTheme } from '../composables/useTheme';
import { useAsyncData } from '../composables/useAsyncData';
import { ALL_BASES, FEED_CATEGORIES } from '../data/bases';
import { ACTIVITY_FILTERS } from '../data/mockPosts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { mode: themeMode, setMode } = useTheme();

/* ---------- domain state ---------- */
const { feedPosts, toggleLike, publish } = useFeedPosts();
const { followedHandles, isFollowing, toggleFollowBase } = useFollowBase(['@ustfess']);

/* ---------- navigation ---------- */
const VALID_TABS = ['home', 'search', 'notif', 'profile'];
const initialTab = VALID_TABS.includes(route.query.tab)
  ? route.query.tab
  : route.query.tab === 'akun'
    ? 'profile'
    : 'home';

const activeNav = ref(initialTab);
const activePanel = ref(null);
const homeTab = ref('forYou');
const searchTab = ref('base');
const aktivitasTab = ref('semua');

function onNavChange(key) {
  activeNav.value = key;
  router.replace({
    query: key === 'home' ? {} : { ...route.query, tab: key },
  });
}

watch(
  () => route.query.tab,
  (tab) => {
    if (tab && VALID_TABS.includes(tab)) {
      activeNav.value = tab;
    } else if (tab === 'akun') {
      activeNav.value = 'profile';
    }
  },
);

/* ---------- discovery ---------- */
const searchQuery = ref('');
const selectedCategory = ref('Semua');

const exploreBases = ALL_BASES;

const filteredBases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return ALL_BASES.filter((base) => {
    const matchesQuery =
      !q || base.name.toLowerCase().includes(q) || base.handle.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory.value === 'Semua' || base.category === selectedCategory.value;
    return matchesQuery && matchesCategory;
  });
});

/* ---------- initial load (drives the skeleton) ---------- */
const { loading, error, reload } = useAsyncData(
  async () => {
    await Promise.resolve();
    return true;
  },
  { delay: 650 },
);

/* ---------- actions ---------- */
function openComposePage() {
  router.push('/create');
}

function handleAccountAction(action) {
  const PANEL_ACTIONS = [
    'topup',
    'security',
    'my-fess',
    'following',
    'notifications',
    'help',
    'report',
    'terms',
    'privacy',
  ];
  if (PANEL_ACTIONS.includes(action)) {
    activePanel.value = action;
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.user-app-layout {
  min-height: 100vh;
  background-color: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  padding-bottom: 84px; /* room for the fixed bottom nav */
}

.app-main-centered-stage {
  flex: 1;
  padding: 24px 16px 40px;
  background: var(--shell-stage);
  display: flex;
  justify-content: center;
}

.centered-content-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .user-app-layout {
    padding-bottom: 78px;
  }
  .app-main-centered-stage {
    padding: 16px 12px 32px;
  }
}
</style>
