<template>
  <div class="base-admin-app-layout">
    <main class="admin-main-stage">
      <div class="admin-stage-container">
        <!-- 1. HOME: Feed Publik Komunitas (Sama persis seperti User Biasa) -->
        <FeedHomeTab
          v-if="activeNav === 'home'"
          v-model="homeTab"
          :posts="publicFeedPosts"
          :loading="false"
          @like="toggleLikePost"
          @findMore="activeNav = 'search'"
        />

        <!-- 2. SEARCH: Jelajah Postingan & Base (Sama persis seperti User Biasa) -->
        <ExploreSearchTab
          v-else-if="activeNav === 'search'"
          v-model:query="searchQuery"
          v-model:category="selectedCategory"
          v-model:mode="searchTab"
          :bases="filteredBases"
          :categories="FEED_CATEGORIES"
          :loading="false"
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

          <div v-if="filteredAdminNotifs.length" class="notif-stream-list">
            <div
              v-for="notif in filteredAdminNotifs"
              :key="notif.id"
              class="notif-card-item"
              :class="{ unread: notif.unread }"
            >
              <div class="notif-icon-col" :class="notif.type">
                <component :is="notif.icon" :size="18" />
              </div>
              <div class="notif-content-col">
                <div class="notif-title-row">
                  <span class="notif-title">{{ notif.title }}</span>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
                <p class="notif-desc">{{ notif.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-aktivitas-center">
            <Inbox class="empty-icon" :size="34" :stroke-width="1.5" aria-hidden="true" />
            <p class="empty-main-text">Belum ada notifikasi.</p>
            <p class="empty-sub-text">Tidak ada notifikasi dalam kategori ini.</p>
          </div>
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
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Instagram,
  Flag,
  Inbox,
} from 'lucide-vue-next';

import BaseAdminBottomNav from '../components/admin/BaseAdminBottomNav.vue';
import BaseAdminProfileTab from '../components/admin/BaseAdminProfileTab.vue';
import FeedHomeTab from '../components/feed/FeedHomeTab.vue';
import ExploreSearchTab from '../components/feed/ExploreSearchTab.vue';
import { FEED_POSTS } from '../data/mockPosts';
import { ALL_BASES, FEED_CATEGORIES } from '../data/bases';
import { useAuthStore } from '../stores/authStore';
import { useFollowBase } from '../composables/useFollowBase';

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

const filteredBases = computed(() => {
  let list = ALL_BASES;
  const q = searchQuery.value.trim().toLowerCase();
  if (selectedCategory.value && selectedCategory.value !== 'Semua') {
    list = list.filter((b) => b.category === selectedCategory.value);
  }
  if (q) {
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.handle.toLowerCase().includes(q) ||
        b.keyword.toLowerCase().includes(q)
    );
  }
  return list;
});

/* Public Feed Posts */
const publicFeedPosts = ref([...FEED_POSTS]);

function toggleLikePost(payload) {
  const targetId = typeof payload === 'object' && payload !== null ? payload.id : payload;
  const item = publicFeedPosts.value.find((p) => p.id === targetId);
  if (item) {
    item.isLiked = !item.isLiked;
    item.likes += item.isLiked ? 1 : -1;
  }
}

/* Notifications State (Harmonized with user's ActivityTab) */
const ADMIN_NOTIF_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'moderasi', label: 'Moderasi' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'sistem', label: 'Sistem' },
];

const notifFilter = ref('semua');

const NOTIF_ITEMS = ref([
  {
    id: 'notif_1',
    category: 'moderasi',
    icon: Bell,
    type: 'type-pending',
    title: 'Confession Baru Membutuhkan Moderasi',
    desc: 'Pengirim anonim mengirim confession dengan tag [career]. Tinjau sekarang.',
    time: '5m lalu',
    unread: true,
  },
  {
    id: 'notif_2',
    category: 'sistem',
    icon: Instagram,
    type: 'type-ig',
    title: 'Otomatis Terbit ke Instagram Story',
    desc: 'Fess #codememfess_1283 berhasil di-render ke canvas Story Instagram via Graph API.',
    time: '25m lalu',
    unread: true,
  },
  {
    id: 'notif_report',
    category: 'laporan',
    icon: Flag,
    type: 'type-alert',
    title: 'Laporan Konten Baru Diterima',
    desc: 'Pengguna melaporkan 1 fess anonim (#fess_base_03) dengan alasan spam/promosi. Silakan tinjau.',
    time: '2j lalu',
    unread: true,
  },
  {
    id: 'notif_3',
    category: 'sistem',
    icon: CheckCircle2,
    type: 'type-success',
    title: 'Pencairan Dana (Payout) Berhasil Diproses',
    desc: 'Pencairan saldo treasury Rp 1.500.000 ke rekening BCA telah ditransfer.',
    time: 'Kemarin',
    unread: false,
  },
  {
    id: 'notif_4',
    category: 'moderasi',
    icon: AlertTriangle,
    type: 'type-alert',
    title: 'Keyword SARA Terdeteksi & Terfilter',
    desc: 'AI Auto-moderation memblokir 1 pesan spam otomatis sebelum masuk antrean.',
    time: '2 hari lalu',
    unread: false,
  },
]);

const filteredAdminNotifs = computed(() => {
  if (notifFilter.value === 'semua') return NOTIF_ITEMS.value;
  return NOTIF_ITEMS.value.filter((n) => n.category === notifFilter.value);
});

/* Compose navigation */
function openCompose() {
  router.push('/create');
}
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
