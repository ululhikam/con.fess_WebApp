/**
 * src/composables/useSuperAdminDashboard.js
 * ---------------------------------------------------------------------------
 * Behaviour for the Super Admin dashboard, backed by the real admin API:
 *   • GET   /admin/system/health   → global gauges + security control state
 *   • PATCH /admin/system/security → persist rate limit / AI filter / worker
 *   • GET   /admin/system/logs     → real-time engine log stream
 *
 * Row titles/labels below are static UI copy. State is module-level so the
 * view and the security card share a single fetch; `rows` stay per-instance
 * because they are editable form state.
 */

import { ref, computed, watch, onScopeDispose } from 'vue';
import { api } from '../api';
import { toast } from './useToast';
import { formatNumber } from '../utils/format';

/**
 * Security control rows (UI copy).
 * kind 'number' → labelled numeric input, kind 'switch' → role="switch" pill.
 */
const SECURITY_CONTROL_ROWS = [
  {
    id: 'rate-limit',
    kind: 'number',
    title: 'Rate Limit (Per IP)',
    desc: 'Maksimal fess dikirim per menit',
    value: 5,
    min: 1,
    max: 60,
  },
  {
    id: 'ai-filter',
    kind: 'switch',
    title: 'Auto-Moderation AI Filter',
    desc: 'Otomatis filter keyword SARA & Spam',
    onLabel: 'ACTIVE',
    offLabel: 'PAUSED',
  },
  {
    id: 'canvas-worker',
    kind: 'switch',
    title: 'Canvas Render Worker',
    desc: 'Puppeteer / Canvas background job',
    onLabel: 'RUNNING',
    offLabel: 'STOPPED',
  },
];

/* ---------------------------------------------------------------------------
   Module-level shared state (one fetch feeds the whole dashboard).
--------------------------------------------------------------------------- */
const health = ref(null);
const healthLoading = ref(false);
const healthError = ref(null);
const engineLogs = ref([]);
const logsLoading = ref(false);
const logsError = ref(null);

let healthLoaded = false;
let logsLoaded = false;
let healthInflight = null;
let logsInflight = null;

async function fetchHealth() {
  healthLoading.value = true;
  healthError.value = null;
  try {
    health.value = await api.getSystemHealth();
    healthLoaded = true;
    return health.value;
  } catch (e) {
    healthError.value = e;
    throw e;
  } finally {
    healthLoading.value = false;
  }
}

function reloadHealth() {
  healthLoaded = false;
  return fetchHealth();
}

function ensureHealthLoaded() {
  if (healthLoaded) return Promise.resolve(health.value);
  if (!healthInflight) {
    healthInflight = fetchHealth().finally(() => {
      healthInflight = null;
    });
  }
  return healthInflight;
}

async function fetchLogs() {
  logsLoading.value = true;
  logsError.value = null;
  try {
    const res = await api.getEngineLogs({ limit: 50 });
    engineLogs.value = res?.data ?? [];
    logsLoaded = true;
    return engineLogs.value;
  } catch (e) {
    logsError.value = e;
    throw e;
  } finally {
    logsLoading.value = false;
  }
}

function reloadLogs() {
  logsLoaded = false;
  return fetchLogs();
}

function ensureLogsLoaded() {
  if (logsLoaded) return Promise.resolve(engineLogs.value);
  if (!logsInflight) {
    logsInflight = fetchLogs().finally(() => {
      logsInflight = null;
    });
  }
  return logsInflight;
}

/** Global gauges derived from GET /admin/system/health. */
const systemStats = computed(() => {
  const h = health.value;
  if (!h) return [];
  return [
    {
      key: 'confessions',
      label: 'Global Confessions Sent',
      value: formatNumber(h.global_confessions_sent ?? 0),
      accent: 'blue',
    },
    {
      key: 'bases',
      label: 'Active Auto-Bases',
      value: `${formatNumber(h.active_bases ?? 0)} Bases`,
      accent: 'lime',
    },
    {
      key: 'load',
      label: 'System Load / CPU',
      value: `${h.system_load_percent ?? 0}%`,
      accent: 'pink',
    },
    {
      key: 'banned',
      label: 'Banned Bad Actors',
      value: `${formatNumber(h.banned_actors ?? 0)} Banned`,
      accent: 'plain',
    },
  ];
});

const healthLabel = computed(() => {
  if (!health.value) return '';
  return health.value.status === 'ok' ? 'System Health OK' : 'System Degraded';
});

/** Persist the current control values (PATCH /admin/system/security). */
async function persistControls(rows) {
  const rate = rows.find((row) => row.id === 'rate-limit');
  const ai = rows.find((row) => row.id === 'ai-filter');
  const worker = rows.find((row) => row.id === 'canvas-worker');

  const payload = {
    ...(rate
      ? { rate_limit_per_ip: Math.min(60, Math.max(1, Math.round(Number(rate.value)) || 1)) }
      : {}),
    ...(ai ? { ai_filter_active: !!ai.on } : {}),
    ...(worker ? { canvas_worker_running: !!worker.on } : {}),
  };

  // The endpoint responds with the fresh system-health payload.
  health.value = await api.updateSecurityControls(payload);
  return health.value;
}

/** Copy the persisted control state from health into the editable rows. */
function hydrateRows(rows, h) {
  if (!h) return;
  const rate = rows.find((row) => row.id === 'rate-limit');
  if (rate && h.rate_limit_per_ip != null) rate.value = h.rate_limit_per_ip;
  const ai = rows.find((row) => row.id === 'ai-filter');
  if (ai) ai.on = h.ai_filter_active ?? ai.on;
  const worker = rows.find((row) => row.id === 'canvas-worker');
  if (worker) worker.on = h.canvas_worker_running ?? worker.on;
}

/**
 * Security control rows with working on/off switches (role="switch" +
 * aria-checked) that persist through PATCH /admin/system/security.
 */
export function useSuperAdminDashboard() {
  const rows = ref(SECURITY_CONTROL_ROWS.map((row) => ({ ...row })));

  watch(
    health,
    (h) => hydrateRows(rows.value, h),
    { immediate: true },
  );

  async function toggleSecurityRow(id) {
    const row = rows.value.find((r) => r.id === id);
    if (!row || row.kind !== 'switch') return;

    row.on = !row.on;
    try {
      await persistControls(rows.value);
      toast.success(`${row.title} ${row.on ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch {
      row.on = !row.on; // rollback on failure
      toast.error(`Gagal memperbarui ${row.title.toLowerCase()}. Coba lagi.`);
    }
  }

  // The numeric rate limit persists after the admin stops typing.
  let rateTimer = null;
  watch(
    () => rows.value.find((row) => row.id === 'rate-limit')?.value,
    (next) => {
      const saved = health.value?.rate_limit_per_ip;
      if (!health.value || Number(next) === Number(saved)) return;
      clearTimeout(rateTimer);
      rateTimer = setTimeout(() => {
        persistControls(rows.value)
          .then(() => toast.success('Batas rate limit tersimpan.', { duration: 2000 }))
          .catch(() => toast.error('Gagal menyimpan batas rate limit. Coba lagi.'));
      }, 700);
    },
  );

  onScopeDispose(() => clearTimeout(rateTimer));

  const securityRows = computed(() => rows.value);

  /** Refresh every section of the dashboard. */
  function reload() {
    return Promise.all([reloadHealth(), reloadLogs()]);
  }

  const loading = computed(() => healthLoading.value || logsLoading.value);
  const error = computed(() => healthError.value || logsError.value);

  ensureHealthLoaded().catch(() => {});
  ensureLogsLoaded().catch(() => {});

  return {
    securityRows,
    toggleSecurityRow,
    health,
    systemStats,
    healthLabel,
    engineLogs,
    loading,
    error,
    reload,
    ensureHealthLoaded,
    ensureLogsLoaded,
  };
}
