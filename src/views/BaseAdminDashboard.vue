<template>
  <div class="base-admin-app-layout">
    <main class="admin-main-stage">
      <div class="admin-stage-container">
        <!-- 1. HOME: Feed Publik Komunitas (Sama persis seperti User Biasa) -->
        <FeedHomeTab
          v-if="activeNav === 'home'"
          v-model="homeTab"
          :posts="homeFeedPosts"
          :loading="homeFeedLoading"
          :error="homeFeedError"
          :is-admin="true"
          :has-more="homeFeedHasMore"
          :loading-more="homeFeedLoadingMore"
          :load-more-error="homeFeedLoadMoreError"
          @like="toggleLikePost"
          @takeDown="handleTakeDownFess"
          @findMore="activeNav = 'search'"
          @retry="reloadHomeFeed"
          @loadMore="loadMoreHomeFeed"
        />

        <!-- 2. SEARCH: Jelajah Postingan & Base (Sama persis seperti User Biasa) -->
        <ExploreSearchTab
          v-else-if="activeNav === 'search'"
          v-model:query="searchQuery"
          v-model:category="selectedCategory"
          v-model:mode="searchTab"
          :bases="filteredBases"
          :categories="FEED_CATEGORIES"
          :loading="basesLoading"
          :is-following="isFollowing"
          @toggle-follow="toggleFollowBase"
        />

        <!-- 3. NOTIF: Notifikasi Pengelola Base (Sama persis dengan Notif User Biasa) -->
        <section v-else-if="activeNav === 'notif'" class="admin-tab-pane view-stage">
          <div class="stage-header-row mb-4">
            <h1 class="stage-title">Notifikasi</h1>

            <div class="segmented-tabs-container" role="tablist" aria-label="Kategori Notifikasi Admin">
              <button
                v-for="filter in ADMIN_NOTIF_FILTERS"
                :key="filter.key"
                type="button"
                role="tab"
                :aria-selected="notifFilter === filter.key"
                :class="['segmented-btn', { active: notifFilter === filter.key }]"
                @click="notifFilter = filter.key"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <p v-if="notifLoading" class="pane-sub mb-4">Memuat notifikasi…</p>

          <template v-else>
            <!-- Aksi notifikasi: baca semua -->
            <div v-if="notifItems.length" class="notif-toolbar mb-4">
              <button
                type="button"
                class="notif-toolbar-btn"
                :disabled="!adminUnreadCount || markingAllNotifsRead"
                @click="markAllAdminNotificationsRead"
              >
                <CheckCheck :size="14" />
                <span>Baca semua</span>
              </button>
            </div>

            <div v-if="filteredAdminNotifs.length" class="notif-stream-list">
              <div
                v-for="notif in filteredAdminNotifs"
                :key="notif.id"
                class="notif-card-item"
                :class="{ unread: notif.unread }"
                role="button"
                tabindex="0"
                @click="openAdminNotification(notif)"
                @keydown.enter.prevent="openAdminNotification(notif)"
              >
                <div class="notif-icon-col" :class="notif.type">
                  <component :is="notif.icon" :size="18" />
                </div>
                <div class="notif-content-col">
                  <div class="notif-title-row">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ notif.time }}</span>
                    <button
                      type="button"
                      class="notif-delete-btn"
                      title="Hapus notifikasi"
                      aria-label="Hapus notifikasi"
                      @click.stop="deleteAdminNotification(notif)"
                      @keydown.enter.stop
                    >
                      <X :size="14" />
                    </button>
                  </div>
                  <p class="notif-desc">{{ notif.desc }}</p>
                </div>
              </div>

              <!-- Lazy load: sentinel + status footer -->
              <div ref="adminNotifSentinel" class="notif-load-sentinel" aria-hidden="true"></div>
              <p v-if="notifLoadingMore" class="notif-load-hint">Memuat lebih banyak…</p>
              <button
                v-else-if="notifLoadMoreError"
                type="button"
                class="notif-load-retry"
                @click="loadMoreAdminNotifs"
              >
                Coba lagi memuat
              </button>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-aktivitas-center">
              <Inbox class="empty-icon" :size="34" :stroke-width="1.5" aria-hidden="true" />
              <p class="empty-main-text">Belum ada notifikasi.</p>
              <p class="empty-sub-text">Tidak ada notifikasi dalam kategori ini.</p>
            </div>
          </template>
        </section>

        <!-- 4. AKUN: PROFIL BASE ADMIN (Instagram Style!) -->
        <section v-else-if="activeNav === 'akun' || activeNav === 'profile'" class="admin-tab-pane">
          <BaseAdminProfileTab />
        </section>
      </div>
    </main>

    <!-- BOTTOM NAVBAR (Persistent across all 5 tabs!) -->
    <BaseAdminBottomNav
      :active="activeNav"
      @navChange="activeNav = $event === 'profile' ? 'akun' : $event"
      @changeTab="activeNav = $event === 'profile' ? 'akun' : $event"
      @openCompose="openCompose"
    />
  </div>
</template>

<script setup>
/**
 * BaseAdminDashboard — Dedicated app shell for Admin Base.
 * Separated from regular user FeedPage.
 *
 * 5 Navigation Tabs:
 *   1. Home   — Feed publik komunitas
 *   2. Search — Jelajah fess & base (ExploreSearchTab)
 *   3. Kirim  — Navigasi ke CreateFessPage (full-featured composer)
 *   4. Notif  — Notifikasi segmented pengelola base (ActivityTab style)
 *   5. Akun   — Profil Base Admin (Instagram-style) & Moderasi
 */
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  Inbox,
  CheckCheck,
  X,
} from 'lucide-vue-next';

import BaseAdminBottomNav from '../components/admin/BaseAdminBottomNav.vue';
import BaseAdminProfileTab from '../components/admin/BaseAdminProfileTab.vue';
import FeedHomeTab from '../components/feed/FeedHomeTab.vue';
import ExploreSearchTab from '../components/feed/ExploreSearchTab.vue';
import { useAuthStore } from '../stores/authStore';
import { useFollowBase } from '../composables/useFollowBase';
import { useFeedPosts } from '../composables/useFeedPosts';
import { useBases } from '../composables/useBases';
import { useInfiniteScroll } from '../composables/useInfiniteScroll';
import { useVisibilityRefresh } from '../composables/useVisibilityRefresh';
import { alertDialog, confirmDialog } from '../composables/useAppDialog';
import { api } from '../api';
import { formatRelativeTime } from '../utils/format';

/** UI filter enum (presentation config, not server data). */
const FEED_CATEGORIES = ['Semua', 'Kampus', 'Kota', 'Hobi'];

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isFollowing, toggleFollowBase } = useFollowBase();

const initialTab = route.query.tab;
const activeNav = ref(
  initialTab ? (initialTab === 'profile' || initialTab === 'akun' ? 'akun' : initialTab) : 'home'
);
const homeTab = ref('forYou');

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeNav.value = newTab === 'profile' || newTab === 'akun' ? 'akun' : newTab;
    }
  }
);

/* Search State (Synced with ExploreSearchTab) */
const searchQuery = ref('');
const selectedCategory = ref('Semua');
const searchTab = ref('base');

const { bases, loading: basesLoading, ensureLoaded: ensureBasesLoaded } = useBases();

const filteredBases = computed(() => {
  let list = bases.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (selectedCategory.value && selectedCategory.value !== 'Semua') {
    list = list.filter((b) => b.category === selectedCategory.value);
  }
  if (q) {
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.handle.toLowerCase().includes(q) ||
        (b.keyword && b.keyword.toLowerCase().includes(q))
    );
  }
  return list;
});

/* Public Feed Posts — live from the API */
const {
  feedPosts: publicFeedPosts,
  loading: feedLoading,
  loadingMore: feedLoadingMore,
  loadMoreError: feedLoadMoreError,
  hasMore: feedHasMore,
  error: feedError,
  reload: reloadFeed,
  loadMore: loadMoreFeed,
  followingPosts,
  followingLoading,
  followingLoadingMore,
  followingLoadMoreError,
  followingHasMore,
  followingError,
  reloadFollowing,
  loadMoreFollowing,
  refresh,
  refreshFollowing,
  toggleLike,
} = useFeedPosts();

/** Home sub-tabs: "For You" (all published) / "Mengikuti" (followed bases). */
const homeFeedPosts = computed(() =>
  homeTab.value === 'mengikuti' ? followingPosts.value : publicFeedPosts.value,
);
const homeFeedLoading = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoading.value : feedLoading.value,
);
const homeFeedError = computed(() =>
  homeTab.value === 'mengikuti' ? followingError.value : feedError.value,
);
const homeFeedHasMore = computed(() =>
  homeTab.value === 'mengikuti' ? followingHasMore.value : feedHasMore.value,
);
const homeFeedLoadingMore = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoadingMore.value : feedLoadingMore.value,
);
const homeFeedLoadMoreError = computed(() =>
  homeTab.value === 'mengikuti' ? followingLoadMoreError.value : feedLoadMoreError.value,
);

watch(homeTab, (tab) => {
  if (tab === 'mengikuti') reloadFollowing().catch(() => {});
});

/** Retry handler for the Home tab — reload whichever timeline is visible. */
function reloadHomeFeed() {
  return homeTab.value === 'mengikuti'
    ? reloadFollowing().catch(() => {})
    : reloadFeed().catch(() => {});
}

/** Lazy load the next page of whichever timeline is visible. */
function loadMoreHomeFeed() {
  return homeTab.value === 'mengikuti'
    ? loadMoreFollowing().catch(() => {})
    : loadMoreFeed().catch(() => {});
}

function toggleLikePost(payload) {
  const targetId = typeof payload === 'object' && payload !== null ? payload.id : payload;
  Promise.resolve(toggleLike(targetId)).catch(() => {});
}

/**
 * Take down (admin base): hapus fess terbit dari feed publik.
 * Konfirmasi dulu karena permanen; server mencatat audit + memberi tahu author.
 */
async function handleTakeDownFess(id) {
  if (!id) return;
  const confirmed = await confirmDialog({
    title: 'Take Down Fess',
    message: 'Take down fess ini? Fess akan dihapus dari feed dan tidak bisa dikembalikan.',
    confirmLabel: 'Take Down',
    variant: 'danger',
  });
  if (!confirmed) return;
  try {
    await api.deleteFess(id);
    await reloadHomeFeed();
  } catch (e) {
    await alertDialog({
      title: 'Take Down Gagal',
      message: e?.message || 'Gagal melakukan take down. Coba lagi.',
      variant: 'danger',
    });
  }
}

/* Notifications State — loaded from GET /notifications */
const ADMIN_NOTIF_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'moderasi', label: 'Moderasi' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'sistem', label: 'Sistem' },
];

const notifFilter = ref('semua');
const notifItems = ref([]);
const notifLoading = ref(false);
const notifLoadingMore = ref(false);
const notifLoadMoreError = ref(null);
const notifError = ref(null);
const notifTotal = ref(0);
const markingAllNotifsRead = ref(false);
const adminNotifSentinel = ref(null);
let notifPage = 1;

const notifHasMore = computed(() => notifItems.value.length < notifTotal.value);
const adminUnreadCount = computed(() => notifItems.value.filter((n) => n.unread).length);

/** Infinite scroll untuk daftar notifikasi (lazy load). */
useInfiniteScroll(adminNotifSentinel, {
  onLoad: () => loadMoreAdminNotifs(),
  canLoad: () =>
    activeNav.value === 'notif' &&
    notifHasMore.value &&
    !notifLoading.value &&
    !notifLoadingMore.value &&
    !notifLoadMoreError.value,
  deps: () => [notifItems.value.length, notifHasMore.value, activeNav.value],
});

/** Presentation mapping for API notification types (icons are UI assets). */
const NOTIF_PRESENTATION = {
  moderation: { category: 'moderasi', icon: Bell, type: 'type-pending', title: 'Fess Menunggu Moderasi' },
  vote: { category: 'sistem', icon: CheckCircle2, type: 'type-success', title: 'Fess Menerima Vote' },
  comment: { category: 'sistem', icon: MessageCircle, type: 'type-alert', title: 'Komentar Baru' },
};

function mapNotification(n) {
  const pres = NOTIF_PRESENTATION[n.type] || {
    category: 'sistem',
    icon: Bell,
    type: 'type-pending',
    title: 'Notifikasi',
  };

  // Label aktor ala Instagram: prefix nama user; handle base (@...) atau
  // 'Anonim' tidak diulang karena teksnya sudah memuat konteks sendiri.
  const rawActor = String(n.actor || '').trim();
  const actorLabel =
    rawActor && rawActor !== 'Anonim' && !rawActor.startsWith('@') ? `${rawActor} ` : '';
  const desc = `${actorLabel}${n.text || ''}`.trim() || n.fess_content || '';

  return {
    id: n.id,
    category: pres.category,
    icon: pres.icon,
    type: pres.type,
    title: pres.title,
    desc,
    time: formatRelativeTime(n.created_at ?? Date.now()),
    unread: !n.read,
  };
}

async function loadNotifications() {
  notifLoading.value = true;
  notifError.value = null;
  notifLoadMoreError.value = null;
  try {
    const res = await api.getNotifications({ page: 1, limit: 20 });
    notifItems.value = (res?.data ?? []).map(mapNotification);
    notifTotal.value = res?.total ?? notifItems.value.length;
    notifPage = 1;
  } catch (e) {
    notifError.value = e;
  } finally {
    notifLoading.value = false;
  }
}

/** Lazy load halaman berikutnya pada daftar notifikasi. */
async function loadMoreAdminNotifs() {
  if (notifLoading.value || notifLoadingMore.value || !notifHasMore.value) return;
  notifLoadingMore.value = true;
  notifLoadMoreError.value = null;
  try {
    const nextPage = notifPage + 1;
    const res = await api.getNotifications({ page: nextPage, limit: 20 });
    const seen = new Set(notifItems.value.map((n) => String(n.id)));
    const extra = (res?.data ?? [])
      .filter((n) => !seen.has(String(n.id)))
      .map(mapNotification);
    notifItems.value = [...notifItems.value, ...extra];
    notifPage = nextPage;
    notifTotal.value = res?.total ?? notifTotal.value;
  } catch (e) {
    notifLoadMoreError.value = e;
  } finally {
    notifLoadingMore.value = false;
  }
}

/** Tandai semua notifikasi sudah dibaca (optimistic). */
async function markAllAdminNotificationsRead() {
  if (markingAllNotifsRead.value || !adminUnreadCount.value) return;
  const prev = notifItems.value.map((n) => n.unread);
  notifItems.value.forEach((n) => {
    n.unread = false;
  });
  markingAllNotifsRead.value = true;
  try {
    await api.markAllNotificationsRead();
  } catch {
    notifItems.value.forEach((n, idx) => {
      n.unread = prev[idx];
    });
  } finally {
    markingAllNotifsRead.value = false;
  }
}

/** Hapus satu notifikasi supaya tidak menumpuk (optimistic). */
async function deleteAdminNotification(notif) {
  const idx = notifItems.value.findIndex((n) => String(n.id) === String(notif.id));
  if (idx < 0) return;
  const [removed] = notifItems.value.splice(idx, 1);
  notifTotal.value = Math.max(0, notifTotal.value - 1);
  try {
    await api.deleteNotification(notif.id);
  } catch {
    notifItems.value.splice(idx, 0, removed);
    notifTotal.value += 1;
  }
}

const filteredAdminNotifs = computed(() => {
  if (notifFilter.value === 'semua') return notifItems.value;
  return notifItems.value.filter((n) => n.category === notifFilter.value);
});

/**
 * Klik notifikasi: tandai sudah dibaca lalu arahkan ke lokasi tindakannya —
 * tab profil base berisi antrean moderasi (setujui/tolak) fess.
 */
function openAdminNotification(notif) {
  if (notif.unread) {
    notif.unread = false; // optimistic — rollback kalau request gagal
    api.markNotificationsRead([notif.id]).catch(() => {
      notif.unread = true;
    });
  }
  router.replace({ query: { ...route.query, tab: 'akun' } });
}

/** Refresh senyap notifikasi halaman 1 (tanpa skeleton). */
async function refreshAdminNotifications() {
  try {
    const res = await api.getNotifications({ page: 1, limit: 20 });
    notifItems.value = (res?.data ?? []).map(mapNotification);
    notifTotal.value = res?.total ?? notifItems.value.length;
    notifPage = 1;
  } catch {
    // Diamkan — data lama tetap ditampilkan.
  }
}

/* Compose navigation */
function openCompose() {
  router.push('/create');
}

onMounted(() => {
  if (route.query.token) {
    const token = String(route.query.token);
    localStorage.setItem('fess_token', token);
    authStore.token = token;
    authStore.fetchCurrentUser?.().catch(() => {});
  }

  if (route.query.ig_connected === 'true') {
    const igUser = route.query.ig_user ? String(route.query.ig_user) : '';
    alertDialog({
      title: 'Instagram Terhubung',
      message: `Akun Instagram ${igUser} berhasil dihubungkan via Meta OAuth! Fitur auto-post canvas confession (Feed/Reels) siap digunakan.`,
    });
    const nextQ = { ...route.query };
    delete nextQ.ig_connected;
    delete nextQ.ig_user;
    delete nextQ.token;
    router.replace({ query: nextQ });
  }

  reloadFeed().catch(() => {});
  ensureBasesLoaded().catch(() => {});
  loadNotifications();
});

/**
 * Sync ala native app: saat tab/app kembali aktif, segarkan data yang sedang
 * tampil secara senyap — feed home atau daftar notifikasi admin.
 */
useVisibilityRefresh(() => {
  if (activeNav.value === 'home') {
    if (homeTab.value === 'mengikuti') refreshFollowing();
    else refresh();
  } else if (activeNav.value === 'notif') {
    refreshAdminNotifications();
  }
});
</script>

<style scoped>
.base-admin-app-layout {
  min-height: 100vh;
  background-color: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  padding-bottom: 84px; /* room for the bottom nav */
}

/* Main stage */
.admin-main-stage {
  flex: 1;
  padding: 20px 16px 36px;
  background: var(--shell-stage);
  display: flex;
  justify-content: center;
}

.admin-stage-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.pane-headline {
  text-align: left;
}

.pane-title {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
  color: var(--shell-text);
}

.pane-sub {
  font-size: 13px;
  color: var(--shell-text-muted);
  margin-top: 3px;
}

/* Quick status */
.quick-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-status-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-num {
  font-size: 20px;
  font-weight: 900;
}

.text-lime { color: var(--shell-text); }
.text-blue { color: var(--shell-text); }
.text-pink { color: var(--shell-text); }

.status-lbl {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

/* Filter pills */
.filter-pills-row {
  display: flex;
  gap: 8px;
}

.filter-pill-btn {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill-btn.active {
  background: var(--shell-sub-accent);
  color: #ffffff;
  border-color: var(--shell-sub-accent);
}

/* Feed stream */
.admin-feed-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-feed-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.card-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sender-anon-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
}

.anon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--shell-sub-accent);
}

.fess-date {
  color: var(--shell-text-muted);
}

.fess-badge {
  font-size: 10.5px;
  font-weight: 900;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.badge-green {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.fess-body-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--shell-text);
  margin: 0 0 14px;
}

.card-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--shell-border);
  padding-top: 12px;
}

.metrics-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.actions-group {
  display: flex;
  gap: 8px;
}

.btn-approve {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: #10b981;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-reject {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

/* Search pane */
.search-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-ico {
  position: absolute;
  left: 14px;
  color: var(--shell-text-muted);
}

.admin-search-field {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border-radius: var(--radius-pill);
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
}

.admin-search-field:focus {
  border-color: var(--shell-sub-accent);
}

.keywords-tag-cloud {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.keywords-label {
  color: var(--shell-text-muted);
  font-weight: 700;
}

.keyword-chip {
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  color: var(--shell-text);
}

/* Notification header & tabs */
.stage-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.stage-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
}

.segmented-tabs-container {
  display: flex;
  background: var(--shell-card);
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  gap: 2px;
}

.segmented-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  padding: 6px 14px;
  font-weight: 700;
  font-size: 12.5px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.segmented-btn.active {
  background: var(--shell-chip);
  color: var(--shell-text);
}

/* Notif toolbar (baca semua) */
.notif-toolbar {
  display: flex;
  justify-content: flex-end;
}

.notif-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.notif-toolbar-btn:hover:not(:disabled) {
  color: var(--shell-text);
  border-color: var(--shell-border-strong);
}

.notif-toolbar-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* Hapus notifikasi per kartu */
.notif-delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--shell-text-dim);
  cursor: pointer;
  padding: 2px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.notif-delete-btn:hover {
  color: #ef4444;
}

/* Lazy-load footer notifikasi */
.notif-load-sentinel {
  height: 1px;
  width: 100%;
}

.notif-load-hint {
  text-align: center;
  font-size: 12.5px;
  color: var(--shell-text-muted);
  padding: 10px 0 4px;
  margin: 0;
}

.notif-load-retry {
  display: block;
  margin: 8px auto 0;
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  border-radius: 999px;
  padding: 7px 16px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.notif-load-retry:hover {
  color: var(--shell-text);
  border-color: var(--shell-border-strong);
}

/* Notif stream */
.notif-stream-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-card-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px 16px;
  transition: border-color 0.15s ease;
  cursor: pointer;
}

.notif-card-item.unread {
  border-color: var(--shell-border-strong);
  background: var(--shell-card-subtle);
}

.notif-icon-col {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.type-ig { background: rgba(225, 48, 108, 0.15); color: #e1306c; }
.type-success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.type-alert { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.notif-content-col {
  flex: 1;
}

.notif-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.notif-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.notif-time {
  font-size: 11px;
  color: var(--shell-text-muted);
}

.notif-desc {
  font-size: 12.5px;
  color: var(--shell-text-muted);
  margin: 0;
  line-height: 1.45;
}

.empty-aktivitas-center {
  background: var(--shell-card);
  border-radius: 20px;
  border: 1px dashed var(--shell-border-strong);
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: var(--shell-text-muted);
  margin-bottom: 12px;
}

.empty-main-text {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--shell-text);
}

.empty-sub-text {
  font-size: 12.5px;
  color: var(--shell-text-dim);
  margin: 0;
}

@media (max-width: 520px) {
  .stage-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .stage-header-row .segmented-tabs-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .stage-header-row .segmented-btn {
    flex: 1;
    padding: 6px 4px;
    font-size: 11.5px;
    text-align: center;
  }
  .notif-card-item {
    padding: 12px;
    gap: 10px;
  }
}
</style>
