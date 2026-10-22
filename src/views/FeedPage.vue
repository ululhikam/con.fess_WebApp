<template>
  <div class="user-app-layout">
    <!-- Floating "Ada Fess Baru" Pill (Instagram/X style) -->
    <Transition name="fade-slide-down">
      <button
        v-if="hasNewPosts && activeNav === 'home'"
        type="button"
        class="new-posts-pill"
        @click="scrollToTopAndRefresh"
      >
        <ArrowUp :size="14" />
        <span>Ada fess terbaru</span>
      </button>
    </Transition>

    <main class="app-main-centered-stage">
      <div class="centered-content-wrapper">
        <!-- Tab memakai KeepAlive: state (daftar, notifikasi, hasil pencarian)
             tidak dibuang saat pindah tab — tidak ada skeleton berkedip dan
             refresh tetap berjalan senyap lewat useVisibilityRefresh.
             CATATAN: jangan menaruh komentar HTML di dalam <KeepAlive> —
             kompilasi dev menghitung setiap komentar sebagai child sehingga
             gagal "expects exactly one child component" (di build komentar
             dibuang, makanya error ini hanya muncul saat `vite dev`).
             Urutan tab: home → search → notif/aktivitas → profile/akun. -->
        <KeepAlive>
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

          <ExploreSearchTab
            v-else-if="activeNav === 'search'"
            v-model:query="searchQuery"
            v-model:category="selectedCategory"
            v-model:mode="searchTab"
            :bases="filteredBases"
            :categories="FEED_CATEGORIES"
            :loading="loading"
            :is-following="isFollowing"
            @toggle-follow="handleToggleFollow"
          />

          <ActivityTab
            v-else-if="activeNav === 'notif' || activeNav === 'aktivitas'"
            v-model="aktivitasTab"
            :filters="ACTIVITY_FILTERS"
            :loading="loading"
            :error="error"
            @retry="reload"
          />

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
      :unread-count="notif.unreadCount.value"
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
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowUp } from 'lucide-vue-next';
import { api } from '../api';
import { toast } from '../composables/useToast';

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
import { useNotifications } from '../composables/useNotifications';

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
const notif = useNotifications();

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

async function handleToggleFollow(handle) {
  const name = String(handle || '').startsWith('@') ? String(handle) : `@${handle}`;
  if (!authStore.isAuthenticated) {
    toast.info('Masuk dulu untuk mengikuti base ini.');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  try {
    const nowFollowing = await toggleFollowBase(name);
    toast.success(
      nowFollowing ? `Berhasil mengikuti ${name}` : `Berhenti mengikuti ${name}`,
    );
  } catch {
    toast.error('Gagal memperbarui status ikuti. Coba lagi.');
  }
}

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

/* ---------- global toast notification ---------- */
function showFeedToast(message, type = 'success', duration) {
  toast.show(message, { type, duration });
}

// Respon otomatis saat user kembali dari halaman Buat Fess
watch(
  () => route.query.postSuccess,
  (status) => {
    if (!status) return;
    if (status === 'pending') {
      showFeedToast(
        'Fess terkirim! Fess tersimpan di antrean moderasi admin base.',
        'pending',
        5000
      );
    } else {
      showFeedToast('Fess berhasil diterbitkan dan langsung tayang!', 'success', 3500);
    }
    // Bersihkan query param agar refresh tidak memunculkan toast lagi
    const nextQuery = { ...route.query };
    delete nextQuery.postSuccess;
    router.replace({ query: nextQuery });
  },
  { immediate: true }
);

/* ---------- Instagram/X style auto-refresh & new posts pill ---------- */
const hasNewPosts = ref(false);
let autoPollTimer = null;

async function checkForNewPosts() {
  if (activeNav.value !== 'home' || document.hidden) return;
  try {
    const isMengikuti = homeTab.value === 'mengikuti';
    const params = {
      sort: 'newest',
      limit: 1,
      page: 1,
      ...(isMengikuti ? { following: 'true' } : {}),
    };
    const res = await api.getFesses(params);
    const newestServer = (res?.data || [])[0];
    if (!newestServer) return;

    const currentList = isMengikuti ? followingPosts.value : feedPosts.value;
    const currentTopId = currentList[0]?.id;

    if (currentTopId && String(newestServer.id) !== String(currentTopId)) {
      // User di puncak halaman (scrollY <= 40) → auto-update senyap ala Instagram
      if (window.scrollY <= 40) {
        if (isMengikuti) refreshFollowing();
        else refresh();
        hasNewPosts.value = false;
      } else {
        // User sedang membaca fess lama di bawah → tampilkan pill floating "Ada fess terbaru"
        hasNewPosts.value = true;
      }
    }
  } catch {
    // Non-blocking
  }
}

function scrollToTopAndRefresh() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  hasNewPosts.value = false;
  if (homeTab.value === 'mengikuti') refreshFollowing();
  else refresh();
}

onMounted(() => {
  // SWR: kalau cache modul masih ada (mis. balik dari halaman Buat Fess),
  // feed lama langsung tampil dan refresh terjadi senyap di belakang.
  ensureFeedLoaded().catch(() => {});
  ensureBasesLoaded().catch(() => {});
  syncFollowing();
  notif.startPolling();

  // Background polling setiap 25 detik untuk update kilat ala Instagram/X
  autoPollTimer = setInterval(checkForNewPosts, 25000);
});

onUnmounted(() => {
  clearInterval(autoPollTimer);
  notif.stopPolling();
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
  position: relative;
  overflow-x: hidden;
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

/* NEW POSTS PILL (Instagram / X style) */
.new-posts-pill {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 250;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  background: var(--shell-accent, #0055ff);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 85, 255, 0.45);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.new-posts-pill:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 85, 255, 0.65);
}

/* TRANSITIONS */
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-14px);
}

</style>
