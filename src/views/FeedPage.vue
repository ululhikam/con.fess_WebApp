<template>
  <div class="user-app-layout">
    <main class="app-main-centered-stage">
      <div class="centered-content-wrapper">
        <!-- Tab memakai KeepAlive: state (daftar, notifikasi, hasil pencarian)
             tidak dibuang saat pindah tab — tidak ada skeleton berkedip dan
             refresh tetap berjalan senyap lewat useVisibilityRefresh. -->
        <KeepAlive>
          <!-- 1. HOME -->
          <FeedHomeTab
            v-if="activeNav === 'home'"
            v-model="homeTab"
            :posts="activeFeedPosts"
            :followed-handles="followedHandles"
            :loading="activeFeedLoading"
            :error="activeFeedError"
            :has-more="activeFeedHasMore"
            :loading-more="activeFeedLoadingMore"
            :load-more-error="activeFeedLoadMoreError"
            @like="handleLike"
            @findMore="onNavChange('search')"
            @retry="reloadHome"
            @loadMore="loadMoreHome"
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
        </KeepAlive>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import BottomNavBar from '../components/layout/BottomNavBar.vue';
import FeedHomeTab from '../components/feed/FeedHomeTab.vue';
import ExploreSearchTab from '../components/feed/ExploreSearchTab.vue';
import ActivityTab from '../components/feed/ActivityTab.vue';
import UserProfileTab from '../components/feed/UserProfileTab.vue';
import AccountPanels from '../components/feed/AccountPanels.vue';

import { useAuthStore } from '../stores/authStore';
import { useFeedPosts } from '../composables/useFeedPosts';
import { useBases } from '../composables/useBases';
import { useFollowBase } from '../composables/useFollowBase';
import { useVisibilityRefresh } from '../composables/useVisibilityRefresh';
import { useTheme } from '../composables/useTheme';

/** UI filter enums (presentation config, not server data). */
const FEED_CATEGORIES = ['Semua', 'Kampus', 'Kota', 'Hobi'];
const ACTIVITY_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'balasan', label: 'Balasan' },
];

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { mode: themeMode, setMode } = useTheme();

/* ---------- domain state ---------- */
const {
  feedPosts,
  loading,
  loadingMore,
  loadMoreError,
  hasMore,
  error,
  reload: reloadFeed,
  ensureLoaded: ensureFeedLoaded,
  loadMore,
  followingPosts,
  followingLoading,
  followingLoadingMore,
  followingLoadMoreError,
  followingHasMore,
  followingError,
  reloadFollowing,
  ensureFollowingLoaded,
  loadMoreFollowing,
  refresh,
  refreshFollowing,
  toggleLike,
} = useFeedPosts();
const { bases, ensureLoaded: ensureBasesLoaded } = useBases();
const { followedHandles, isFollowing, toggleFollowBase, syncFollowing } = useFollowBase();

/** Adapter: FessCard emits a payload object, toggleLike takes an id. */
function handleLike(payload) {
  const id = payload && typeof payload === 'object' ? payload.id : payload;
  Promise.resolve(toggleLike(id)).catch(() => {});
}

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

/* ---------- Home sub-tabs: "For You" / "Mengikuti" ---------- */
const activeFeedPosts = computed(() =>
  homeTab.value === 'mengikuti' ? followingPosts.value : feedPosts.value,
);
const activeFeedLoading = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoading.value : loading.value,
);
const activeFeedError = computed(() =>
  homeTab.value === 'mengikuti' ? followingError.value : error.value,
);
const activeFeedHasMore = computed(() =>
  homeTab.value === 'mengikuti' ? followingHasMore.value : hasMore.value,
);
const activeFeedLoadingMore = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoadingMore.value : loadingMore.value,
);
const activeFeedLoadMoreError = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoadMoreError.value : loadMoreError.value,
);

watch(homeTab, (tab) => {
  if (tab !== 'mengikuti') return;
  // Sudah ada data → segarkan senyap (tanpa skeleton). Belum ada → SWR:
  // skeleton hanya muncul saat benar-benar belum ada isi.
  if (followingPosts.value.length) refreshFollowing();
  else ensureFollowingLoaded().catch(() => {});
});

/**
 * Sync ala native app: ketika tab/app kembali aktif setelah 60 detik,
 * segarkan timeline yang sedang tampil secara senyap (tanpa skeleton).
 */
useVisibilityRefresh(() => {
  if (activeNav.value !== 'home') return;
  if (homeTab.value === 'mengikuti') refreshFollowing();
  else refresh();
});

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

const filteredBases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return bases.value.filter((base) => {
    const matchesQuery =
      !q || base.name.toLowerCase().includes(q) || base.handle.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory.value === 'Semua' || base.category === selectedCategory.value;
    return matchesQuery && matchesCategory;
  });
});

/* ---------- initial load (drives the skeleton) ---------- */
function reload() {
  return reloadFeed().catch(() => {});
}

/** Retry handler for the Home tab — reload whichever timeline is visible. */
function reloadHome() {
  return homeTab.value === 'mengikuti' ? reloadFollowing().catch(() => {}) : reload();
}

/** Lazy load the next page of whichever timeline is visible. */
function loadMoreHome() {
  return homeTab.value === 'mengikuti'
    ? loadMoreFollowing().catch(() => {})
    : loadMore().catch(() => {});
}

onMounted(() => {
  // SWR: kalau cache modul masih ada (mis. balik dari halaman Buat Fess),
  // feed lama langsung tampil dan refresh terjadi senyap di belakang.
  ensureFeedLoaded().catch(() => {});
  ensureBasesLoaded().catch(() => {});
  syncFollowing();
});

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

async function handleLogout() {
  await authStore.logout();
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
