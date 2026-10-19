/**
 * src/composables/useAdminDashboard.js
 * ---------------------------------------------------------------------------
 * Behaviour for the Base Admin dashboard, backed by the real admin API:
 *   - useAdminSession     → role switching / logout for the shared admin nav
 *   - useAdminDashboard   → tab state + counters/overview stats (GET /admin/stats)
 *   - useFessModeration   → moderation queue + approve / reject / canvas export
 *   - useBaseSettings     → reactive form model for the settings card
 *
 * Tab, stat card and form-field definitions below are static UI copy; every
 * runtime value comes from the backend through src/api.
 */

import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api';
import { mapFessToPost } from '../utils/fessMapper';

/** Tab definitions (UI copy). */
const BASE_ADMIN_TABS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'konten', label: 'Konten' },
  { id: 'moderasi', label: 'Moderasi' },
  { id: 'komunitas', label: 'Komunitas' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'pengaturan', label: 'Pengaturan' },
  { id: 'koneksi', label: 'Koneksi Platform' },
  { id: 'profil', label: 'Lihat Profil Base' },
];

/**
 * Overview stat cards. Labels are UI copy; `key` picks the real value from
 * the GET /admin/stats payload (pending, published, total_users, total_votes).
 * accent: 'blue' | 'lime' | 'pink' | 'plain' (decorative, mapped to tokens)
 */
const BASE_OVERVIEW_STAT_DEFS = [
  { key: 'pending', label: 'Antrean Moderasi', hint: 'Perlu tindakan', accent: 'blue' },
  { key: 'published', label: 'Fess Disetujui', hint: 'Tayang di feed', accent: 'lime' },
  { key: 'total_users', label: 'Anggota Terdaftar', hint: 'Pengirim & pembaca', accent: 'plain' },
  { key: 'total_votes', label: 'Total Votes', hint: 'Dukungan komunitas', accent: 'pink' },
];

/** Field definitions for the "Pengaturan Auto-Base" form (UI copy). */
export const BASE_SETTINGS_FIELDS = [
  { key: 'name', label: 'Nama Base', value: '' },
  { key: 'handle', label: 'Handle Base', value: '' },
  { key: 'keywords', label: 'Kata Kunci Auto-Routing', value: '' },
];

/** Admin session helpers (role checks, logout). */
export function useAdminSession() {
  const authStore = useAuthStore();
  const router = useRouter();

  const role = computed(() => authStore.user?.role || 'Base Admin');
  const isSuperAdmin = computed(() => authStore.isSuperAdmin);

  function logout() {
    authStore.logout();
    router.push('/login');
  }

  return { role, isSuperAdmin, logout };
}

/** Tab navigation, live counters and the derived overview stat cards. */
export function useAdminDashboard() {
  const activeTab = ref(BASE_ADMIN_TABS[0].id);
  const showNewBaseModal = ref(false);

  const stats = ref(null);
  const loading = ref(false);
  const error = ref(null);
  let loaded = false;
  let inflight = null;

  /** Load GET /admin/stats (role-scoped counts for the signed-in admin). */
  async function reload() {
    loading.value = true;
    error.value = null;
    try {
      stats.value = await api.getStats();
      loaded = true;
      return stats.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /** Fetch once, then serve the cached stats. */
  function ensureLoaded() {
    if (loaded) return Promise.resolve(stats.value);
    if (!inflight) {
      inflight = reload().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  ensureLoaded().catch(() => {});

  const pendingCount = computed(() => stats.value?.pending ?? 0);
  const approvedCount = computed(() => stats.value?.published ?? 0);

  /** Stat definitions + live values from GET /admin/stats. */
  const overviewStats = computed(() =>
    BASE_OVERVIEW_STAT_DEFS.map((def) => ({
      ...def,
      value: stats.value == null ? '—' : String(stats.value[def.key] ?? 0),
    })),
  );

  const activeTabLabel = computed(
    () => BASE_ADMIN_TABS.find((tab) => tab.id === activeTab.value)?.label ?? '',
  );

  return {
    activeTab,
    activeTabLabel,
    showNewBaseModal,
    pendingCount,
    approvedCount,
    overviewStats,
    stats,
    loading,
    error,
    reload,
    ensureLoaded,
  };
}

/** Shape the moderation API payload for the admin cards. */
function toModerationItem(fess) {
  const post = mapFessToPost(fess);
  if (!post) return null;
  return { ...post, baseHandle: post.handle, timestamp: post.time };
}

/**
 * Approve / reject / export actions + the queue itself.
 * @param {{ status?: 'pending'|'published'|'rejected' }} options
 *   'pending' (default) reads GET /admin/moderation; any other status reads
 *   GET /fesses?status=… so the published-content table reuses the same card.
 */
export function useFessModeration(options = {}) {
  const status = options.status || 'pending';

  const fesses = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let inflight = null;

  async function reload() {
    loading.value = true;
    error.value = null;
    try {
      const res =
        status === 'pending'
          ? await api.getModerationQueue({ limit: 50 })
          : await api.getFesses({ status, limit: 50 });
      fesses.value = (res?.data ?? []).map(toModerationItem).filter(Boolean);
      return fesses.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function ensureLoaded() {
    if (fesses.value.length) return Promise.resolve(fesses.value);
    if (!inflight) {
      inflight = reload().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  ensureLoaded().catch(() => {});

  /** POST /fesses/:id/approve — optimistic UI update lalu refresh antrean. */
  async function approve(id) {
    const prev = [...fesses.value];
    fesses.value = fesses.value.filter((f) => f.id !== id);
    try {
      await api.approveFess(id);
      await reload();
    } catch (e) {
      fesses.value = prev;
      throw e;
    }
  }

  /** POST /fesses/:id/reject — optimistic UI update lalu refresh antrean. */
  async function hide(id) {
    const prev = [...fesses.value];
    fesses.value = fesses.value.filter((f) => f.id !== id);
    try {
      await api.rejectFess(id);
      await reload();
    } catch (e) {
      fesses.value = prev;
      throw e;
    }
  }

  const CANVAS_TEMPLATES = [
    'cyberpunk',
    'neobrutalism',
    'rock',
    'terminal',
    'bubblegum',
    'swiss',
    'acid',
    'monochrome',
    'indie',
    'blueprint',
    'default',
    'midnight',
    'sunset',
    'forest',
    'noir',
    'paper',
    'ocean',
    'violet',
  ];

  /** POST /admin/canvas/export — render the fess card to PNG. */
  async function exportCanvas(fess) {
    const id = typeof fess === 'object' && fess !== null ? fess.id : fess;
    const template = CANVAS_TEMPLATES.includes(fess?.template) ? fess.template : 'default';
    return api.exportCanvas({ fess_id: String(id), template, aspect: 'story' });
  }

  return { fesses, loading, error, reload, ensureLoaded, approve, hide, exportCanvas };
}

/**
 * Reactive model for the "Pengaturan Auto-Base" form fields.
 * @param {Array<{key:string,label:string,value?:any}>} fields
 * @param {Record<string, any>} initial — values from the real base object
 */
export function useBaseSettings(fields = BASE_SETTINGS_FIELDS, initial = {}) {
  const form = reactive(
    Object.fromEntries(fields.map((field) => [field.key, initial[field.key] ?? field.value ?? ''])),
  );

  return { form };
}
