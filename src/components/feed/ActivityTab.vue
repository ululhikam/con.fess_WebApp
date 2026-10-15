<template>
  <section class="view-stage" aria-labelledby="activity-title">
    <div class="stage-header-row mb-4">
      <h1 id="activity-title" class="stage-title">Notifikasi</h1>

      <div class="segmented-tabs-container" role="tablist" aria-label="Jenis aktivitas">
        <button
          v-for="filter in (filters.length ? filters : DEFAULT_FILTERS)"
          :key="filter.key"
          type="button"
          role="tab"
          :aria-selected="modelValue === filter.key"
          :class="['segmented-btn', { active: modelValue === filter.key }]"
          @click="$emit('update:modelValue', filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Aksi: tandai semua sudah dibaca -->
    <div v-if="!notifLoading && !notifError && notifications.length" class="notif-toolbar mb-4">
      <button
        type="button"
        class="notif-toolbar-btn"
        :disabled="!unreadCount || markingAllRead"
        @click="markAllRead"
      >
        <CheckCheck :size="14" />
        <span>Baca semua</span>
      </button>
    </div>

    <ContentSkeleton v-if="notifLoading" type="list" :count="3" label="Memuat aktivitas…" />

    <AppStateView
      v-else-if="notifError"
      variant="error"
      title="Aktivitas gagal dimuat"
      description="Terjadi kesalahan saat mengambil notifikasi. Coba muat ulang."
      action-label="Coba lagi"
      @action="loadNotifications"
    />

    <!-- Active User Notifications List -->
    <div v-else-if="filteredNotifications.length" class="notif-stream-list">
      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="notif-card-item"
        :class="{ unread: notif.unread }"
        role="button"
        tabindex="0"
        @click="openNotification(notif)"
        @keydown.enter.prevent="openNotification(notif)"
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
              @click.stop="deleteNotification(notif)"
              @keydown.enter.stop
            >
              <X :size="14" />
            </button>
          </div>
          <p class="notif-desc">{{ notif.desc }}</p>
        </div>
      </div>

      <!-- Lazy load: sentinel + status footer -->
      <div ref="notifSentinel" class="notif-load-sentinel" aria-hidden="true"></div>
      <p v-if="notifLoadingMore" class="notif-load-hint">Memuat lebih banyak…</p>
      <button
        v-else-if="notifLoadMoreError"
        type="button"
        class="notif-load-retry"
        @click="loadMoreNotifications"
      >
        Coba lagi memuat
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-aktivitas-center">
      <Inbox class="empty-icon" :size="34" :stroke-width="1.5" aria-hidden="true" />
      <p class="empty-main-text">Belum ada aktivitas.</p>
      <p class="empty-sub-text">Hanya aktivitas akunmu yang tampil di sini.</p>
    </div>
  </section>
</template>

<script setup>
/**
 * ActivityTab — notifications & activity feed for regular users.
 * Clean harmonized card layout, zero emojis.
 */
import { computed, markRaw, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Inbox,
  CheckCircle2,
  Heart,
  MessageCircle,
  Flag,
  CheckCheck,
  X,
} from 'lucide-vue-next';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';
import { api } from '../../api';
import { formatRelativeTime, truncate } from '../../utils/format';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';

/**
 * `loading` / `error` are kept as optional props for backwards compatibility
 * with the parent shell — notifications now carry their own request state.
 */
const props = defineProps({
  filters: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
  modelValue: { type: String, default: 'semua' },
});

defineEmits(['update:modelValue', 'retry']);

const DEFAULT_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'fess', label: 'Fess Kamu' },
  { key: 'laporan', label: 'Laporan' },
];

/* ---------- Notification mapping (GET /notifications) ---------- */
/**
 * API notification type → card presentation + client-side filter bucket.
 * Buckets: 'balasan' (Balasan tab), 'fess' (Fess Kamu tab), 'laporan' (Laporan tab).
 */
const NOTIF_PRESENTATION = {
  comment: {
    category: 'balasan',
    icon: markRaw(MessageCircle),
    cssClass: 'type-comment',
    title: 'Balasan Baru',
  },
  mention: {
    category: 'balasan',
    icon: markRaw(MessageCircle),
    cssClass: 'type-comment',
    title: 'Disebut di Fess',
  },
  vote: {
    category: 'fess',
    icon: markRaw(Heart),
    cssClass: 'type-like',
    title: 'Fess Mendapat Vote',
  },
  moderation: {
    category: 'fess',
    icon: markRaw(CheckCircle2),
    cssClass: 'type-approved',
    title: 'Status Moderasi Fess',
  },
  system: {
    category: 'laporan',
    icon: markRaw(Flag),
    cssClass: 'type-report',
    title: 'Notifikasi Sistem',
  },
};

function mapNotification(raw) {
  const meta = NOTIF_PRESENTATION[raw.type] || {
    category: 'lainnya',
    icon: markRaw(Inbox),
    cssClass: 'type-comment',
    title: 'Notifikasi',
  };

  const actor = raw.actor && raw.actor !== 'Anonim' ? `${raw.actor} ` : '';
  let desc = `${actor}${raw.text || ''}`.trim() || 'Notifikasi baru.';
  if (raw.fess_content) desc += ` · “${truncate(raw.fess_content, 80)}”`;

  return {
    id: raw.id,
    category: meta.category,
    icon: meta.icon,
    type: meta.cssClass,
    title: meta.title,
    desc,
    time: formatRelativeTime(raw.created_at ?? Date.now()),
    unread: !(raw.read ?? raw.is_read ?? false),
    rawType: raw.type,
    fessId: raw.fess_id ?? null,
  };
}

const router = useRouter();

/**
 * Klik notifikasi: tandai sudah dibaca lalu arahkan ke lokasi yang perlu
 * ditindak — daftar "Fess Kamu" di profil (status & interaksi fess tsb).
 */
function openNotification(notif) {
  if (notif.unread) {
    notif.unread = false; // optimistic — rollback kalau request gagal
    api.markNotificationsRead([notif.id]).catch(() => {
      notif.unread = true;
    });
  }

  const FESS_TYPES = ['vote', 'comment', 'mention', 'moderation'];
  if (notif.fessId || FESS_TYPES.includes(notif.rawType)) {
    router.push({ path: '/feed', query: { tab: 'profile' } });
  }
}

const notifications = ref([]);
const notifLoading = ref(false);
const notifLoadingMore = ref(false);
const notifLoadMoreError = ref(null);
const notifError = ref(null);
const notifTotal = ref(0);
const markingAllRead = ref(false);
const notifSentinel = ref(null);
let requestSeq = 0;
let notifPage = 1;

const notifHasMore = computed(() => notifications.value.length < notifTotal.value);
const unreadCount = computed(() => notifications.value.filter((n) => n.unread).length);

async function loadNotifications() {
  const seq = ++requestSeq;
  notifLoading.value = true;
  notifError.value = null;
  notifLoadMoreError.value = null;
  try {
    const res = await api.getNotifications({ page: 1, limit: 20 });
    if (seq !== requestSeq) return;
    notifications.value = (res?.data || []).map(mapNotification);
    notifTotal.value = res?.total ?? notifications.value.length;
    notifPage = 1;
  } catch (e) {
    if (seq !== requestSeq) return;
    notifError.value = e;
    notifications.value = [];
  } finally {
    if (seq === requestSeq) notifLoading.value = false;
  }
}

/** Lazy load halaman berikutnya pada daftar notifikasi. */
async function loadMoreNotifications() {
  if (notifLoading.value || notifLoadingMore.value || !notifHasMore.value) return;
  const seq = requestSeq;
  notifLoadingMore.value = true;
  notifLoadMoreError.value = null;
  try {
    const nextPage = notifPage + 1;
    const res = await api.getNotifications({ page: nextPage, limit: 20 });
    if (seq !== requestSeq) return;
    const seen = new Set(notifications.value.map((n) => String(n.id)));
    const extra = (res?.data || [])
      .filter((n) => !seen.has(String(n.id)))
      .map(mapNotification);
    notifications.value = [...notifications.value, ...extra];
    notifTotal.value = res?.total ?? notifTotal.value;
    notifPage = nextPage;
  } catch (e) {
    notifLoadMoreError.value = e;
  } finally {
    notifLoadingMore.value = false;
  }
}

/** Tandai semua notifikasi sudah dibaca (optimistic). */
async function markAllRead() {
  if (markingAllRead.value || !unreadCount.value) return;
  const prev = notifications.value.map((n) => n.unread);
  notifications.value.forEach((n) => {
    n.unread = false;
  });
  markingAllRead.value = true;
  try {
    await api.markAllNotificationsRead();
  } catch {
    notifications.value.forEach((n, idx) => {
      n.unread = prev[idx];
    });
  } finally {
    markingAllRead.value = false;
  }
}

/** Hapus satu notifikasi supaya tidak menumpuk (optimistic). */
async function deleteNotification(notif) {
  const idx = notifications.value.findIndex((n) => String(n.id) === String(notif.id));
  if (idx < 0) return;
  const [removed] = notifications.value.splice(idx, 1);
  notifTotal.value = Math.max(0, notifTotal.value - 1);
  try {
    await api.deleteNotification(notif.id);
  } catch {
    notifications.value.splice(idx, 0, removed);
    notifTotal.value += 1;
  }
}

/** Infinite scroll untuk daftar notifikasi (lazy load). */
useInfiniteScroll(notifSentinel, {
  onLoad: loadMoreNotifications,
  canLoad: () =>
    notifHasMore.value &&
    !notifLoading.value &&
    !notifLoadingMore.value &&
    !notifLoadMoreError.value,
  deps: () => [notifications.value.length, notifHasMore.value],
});

onMounted(loadNotifications);

const filteredNotifications = computed(() => {
  if (props.modelValue === 'semua') return notifications.value;
  return notifications.value.filter((n) => n.category === props.modelValue);
});
</script>

<style scoped>
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

/* Toolbar notifikasi (baca semua) */
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

/* Notification stream list */
.notif-stream-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-card-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
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
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
}

.notif-icon-col.type-approved {
  color: #10b981;
}

.notif-icon-col.type-like {
  color: #ef4444;
}

.notif-icon-col.type-comment {
  color: var(--shell-text);
}

.notif-icon-col.type-report {
  color: #f59e0b;
}

.notif-content-col {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.notif-time {
  font-size: 11.5px;
  color: var(--shell-text-dim);
  flex-shrink: 0;
}

.notif-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--shell-text-muted);
  margin: 0;
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
