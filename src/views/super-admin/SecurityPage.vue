<template>
  <div>
    <ConsolePageHeader
      eyebrow="Security & audit"
      title="Keamanan &amp; Audit"
      subtitle="Telusuri aksi admin berisiko tinggi dan log runtime. Audit bersifat permanen; konsol ini tidak menyediakan hapus atau edit jejak."
      :health="healthLabel"
      :health-tone="healthTone"
    >
      <template #actions>
        <ConsoleStatusBadge
          v-if="settings"
          status="audit"
          label="Audit trail aktif"
          tone="lime"
        />
        <button
          type="button"
          class="pc-btn pc-btn--ghost"
          :disabled="refreshing"
          @click="refreshPage"
        >
          <RefreshCw :size="14" :class="{ 'pc-spin': refreshing }" />
          {{ refreshing ? 'Memuat…' : 'Muat ulang' }}
        </button>
      </template>
    </ConsolePageHeader>

    <div class="pc-callout pc-callout--lime" style="margin-bottom: 16px">
      <ShieldCheck :size="16" />
      <div>
        <strong>Guardrail platform.</strong>
        Aksi payout, KYC, freeForever, dan ban membutuhkan re-auth kata sandi, rate limit,
        serta audit berisi aktor, alasan, IP, dan user agent. Tidak ada endpoint untuk
        menghapus audit.
      </div>
    </div>

    <div class="pc-stats">
      <div class="pc-stat pc-stat--lime">
        <p class="pc-stat__label">Re-auth aksi sensitif</p>
        <p class="pc-stat__value pc-stat__value--small">
          {{ settings ? (settings.security.reauth_required_for_high_risk ? 'Aktif' : 'Nonaktif') : '—' }}
        </p>
        <p class="pc-stat__hint">Payout, KYC, freeForever, ban/unban</p>
      </div>
      <div class="pc-stat pc-stat--blue">
        <p class="pc-stat__label">Audit log</p>
        <p class="pc-stat__value pc-stat__value--small">
          {{ settings ? (settings.security.audit_log_enabled ? 'Aktif' : 'Nonaktif') : '—' }}
        </p>
        <p class="pc-stat__hint">Aktor, target, alasan, metadata</p>
      </div>
      <div class="pc-stat pc-stat--amber">
        <p class="pc-stat__label">Webhook signature</p>
        <p class="pc-stat__value pc-stat__value--small">
          {{ settings ? (settings.security.webhook_signature_verification ? 'Diverifikasi' : 'Tidak') : '—' }}
        </p>
        <p class="pc-stat__hint">Verifikasi signature Midtrans</p>
      </div>
      <div class="pc-stat">
        <p class="pc-stat__label">Rate limit global</p>
        <p class="pc-stat__value pc-stat__value--small">
          {{ settings ? `${settings.security.global_rate_limit_per_minute}/menit` : '—' }}
        </p>
        <p class="pc-stat__hint">{{ settings?.security.global_rate_limit_scope || 'Runtime config' }}</p>
      </div>
    </div>

    <div class="pc-inline" style="justify-content: space-between; margin-bottom: 16px">
      <div class="pc-tabs" role="tablist" aria-label="Jenis log">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="pc-tab"
          :class="{ active: activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="setTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      <span v-if="settings" class="pc-small pc-muted">
        Aksi admin terakhir: {{ settings.last_admin_action || '—' }} ·
        {{ relativeTime(settings.last_admin_action_at) }}
      </span>
    </div>

    <!-- AUDIT LOG -->
    <section v-if="activeTab === 'audit'" class="pc-card">
      <div class="pc-card__head">
        <div>
          <h2 class="pc-card__title">Audit admin</h2>
          <p class="pc-card__desc">
            {{ audit.total }} entri. Klik baris untuk melihat metadata lengkap.
          </p>
        </div>
        <ConsoleStatusBadge
          :status="audit.total ? 'ok' : 'unknown'"
          :label="audit.total ? `${audit.total} entri` : 'Belum ada entri'"
          :tone="audit.total ? 'success' : 'neutral'"
        />
      </div>

      <div class="pc-filters">
        <div class="pc-field pc-field--grow">
          <label class="pc-label" for="audit-search">Cari audit</label>
          <div class="pc-input-icon">
            <Search :size="13" />
            <input
              id="audit-search"
              v-model="auditQuery"
              class="pc-input"
              type="search"
              placeholder="Aksi, target, ID, atau alasan"
            />
          </div>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="audit-action">Aksi</label>
          <input
            id="audit-action"
            v-model="auditAction"
            class="pc-input"
            type="text"
            placeholder="BASE_PAYOUT_"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="audit-actor">Aktor</label>
          <input
            id="audit-actor"
            v-model="auditActor"
            class="pc-input"
            type="text"
            placeholder="Handle / email"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="audit-target">Target</label>
          <select id="audit-target" v-model="auditTarget" class="pc-select">
            <option value="">Semua target</option>
            <option value="User">User</option>
            <option value="Base">Base</option>
            <option value="BasePayout">BasePayout</option>
            <option value="PlatformConnection">PlatformConnection</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="audit-from">Dari</label>
          <input id="audit-from" v-model="auditFrom" class="pc-input" type="date" />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="audit-to">Sampai</label>
          <input id="audit-to" v-model="auditTo" class="pc-input" type="date" />
        </div>
      </div>

      <div v-if="auditError" class="pc-card__body">
        <div class="pc-error">
          <AlertTriangle :size="16" />
          <div>
            <strong>Audit gagal dimuat.</strong>
            <p>{{ auditError }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="auditLoading && !audit.data.length" class="pc-card__body pc-stack">
        <div v-for="index in 6" :key="index" class="pc-skeleton pc-skeleton--line" />
      </div>

      <div v-else-if="!audit.data.length" class="pc-empty">
        <span class="pc-empty__icon"><ScrollText :size="18" /></span>
        Tidak ada audit pada filter ini.
      </div>

      <div v-else class="pc-table-wrap">
        <table class="pc-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aktor</th>
              <th>Aksi</th>
              <th>Target</th>
              <th>Alasan</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in audit.data"
              :key="entry.id"
              class="is-clickable"
              @click="openAudit(entry)"
            >
              <td>
                {{ formatDateTime(entry.created_at) }}
                <span class="pc-table__sub">{{ relativeTime(entry.created_at) }}</span>
              </td>
              <td>
                <span class="pc-table__primary">
                  {{ entry.actor?.handle || 'Sistem' }}
                </span>
                <span class="pc-table__sub">{{ entry.actor?.email || 'Tanpa aktor' }}</span>
              </td>
              <td>
                <span class="pc-badge pc-badge--neutral pc-mono">{{ entry.action }}</span>
              </td>
              <td>
                {{ entry.target_type || '—' }}
                <span class="pc-table__sub pc-mono">{{ shortId(entry.target_id, 6) }}</span>
              </td>
              <td>{{ entry.reason || '—' }}</td>
              <td class="pc-mono">{{ entry.ip_address || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="audit.total_pages > 1" class="pc-pagination">
        <span>
          {{ audit.total }} audit · halaman {{ audit.page }} dari {{ audit.total_pages }}
        </span>
        <div class="pc-pagination__buttons">
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="audit.page <= 1 || auditLoading"
            aria-label="Halaman sebelumnya"
            @click="goAuditPage(audit.page - 1)"
          >
            <ChevronLeft :size="14" />
          </button>
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="audit.page >= audit.total_pages || auditLoading"
            aria-label="Halaman berikutnya"
            @click="goAuditPage(audit.page + 1)"
          >
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </section>

    <!-- SYSTEM LOG -->
    <section v-else-if="activeTab === 'logs'" class="pc-card">
      <div class="pc-card__head">
        <div>
          <h2 class="pc-card__title">Log sistem</h2>
          <p class="pc-card__desc">
            {{ logs.total }} entri dari rate limiter, worker, payout, dan keamanan.
          </p>
        </div>
        <ConsoleStatusBadge
          :status="settings?.last_admin_action ? 'active' : 'unknown'"
          :label="`${summary?.health?.errors_24h ?? 0} error / 24 jam`"
          :tone="(summary?.health?.errors_24h ?? 0) > 5 ? 'danger' : 'neutral'"
        />
      </div>

      <div class="pc-filters">
        <div class="pc-field pc-field--grow">
          <label class="pc-label" for="log-search">Cari log</label>
          <div class="pc-input-icon">
            <Search :size="13" />
            <input
              id="log-search"
              v-model="logQuery"
              class="pc-input"
              type="search"
              placeholder="Pesan atau source"
            />
          </div>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="log-source">Source</label>
          <select id="log-source" v-model="logSource" class="pc-select">
            <option value="">Semua source</option>
            <option value="RATE_LIMITER">RATE_LIMITER</option>
            <option value="CANVAS_WORKER">CANVAS_WORKER</option>
            <option value="AUTO_BASE">AUTO_BASE</option>
            <option value="REDIS_CACHE">REDIS_CACHE</option>
            <option value="AI_FILTER">AI_FILTER</option>
            <option value="PAYOUT">PAYOUT</option>
            <option value="SECURITY">SECURITY</option>
            <option value="MODERATION">MODERATION</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="log-tone">Tone</label>
          <select id="log-tone" v-model="logTone" class="pc-select">
            <option value="">Semua tone</option>
            <option value="ok">OK</option>
            <option value="info">Info</option>
            <option value="muted">Muted</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div v-if="logsError" class="pc-card__body">
        <div class="pc-error">
          <AlertTriangle :size="16" />
          <div>
            <strong>Log sistem gagal dimuat.</strong>
            <p>{{ logsError }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="logsLoading && !logs.data.length" class="pc-card__body pc-stack">
        <div v-for="index in 6" :key="index" class="pc-skeleton pc-skeleton--line" />
      </div>

      <div v-else-if="!logs.data.length" class="pc-empty">
        <span class="pc-empty__icon"><Activity :size="18" /></span>
        Tidak ada log pada filter ini.
      </div>

      <div v-else class="pc-table-wrap">
        <table class="pc-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Source</th>
              <th>Tone</th>
              <th>Pesan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in logs.data"
              :key="log.id"
              class="is-clickable"
              @click="openLog(log)"
            >
              <td>
                {{ formatDateTime(log.created_at) }}
                <span class="pc-table__sub">{{ relativeTime(log.created_at) }}</span>
              </td>
              <td><span class="pc-badge pc-badge--neutral pc-mono">{{ log.source }}</span></td>
              <td>
                <ConsoleStatusBadge
                  :status="log.tone"
                  :label="logToneLabel(log.tone)"
                  :tone="logToneStyle(log.tone)"
                />
              </td>
              <td class="pc-log-message">{{ log.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="logs.total_pages > 1" class="pc-pagination">
        <span>
          {{ logs.total }} log · halaman {{ logs.page }} dari {{ logs.total_pages }}
        </span>
        <div class="pc-pagination__buttons">
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="logs.page <= 1 || logsLoading"
            aria-label="Halaman sebelumnya"
            @click="goLogPage(logs.page - 1)"
          >
            <ChevronLeft :size="14" />
          </button>
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="logs.page >= logs.total_pages || logsLoading"
            aria-label="Halaman berikutnya"
            @click="goLogPage(logs.page + 1)"
          >
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </section>

    <ConsoleDrawer
      v-model="auditDrawerOpen"
      eyebrow="Audit entry · immutable"
      title="Detail audit admin"
      :subtitle="selectedAudit?.action || ''"
    >
      <div v-if="selectedAudit" class="pc-stack">
        <div class="pc-inline">
          <span class="pc-badge pc-badge--neutral pc-mono">{{ selectedAudit.action }}</span>
          <ConsoleStatusBadge
            :status="selectedAudit.action?.includes('BANNED') ? 'banned' : 'ok'"
            :label="selectedAudit.target_type || 'Audit'"
            tone="blue"
          />
        </div>

        <div class="pc-stats pc-stats--2">
          <div class="pc-stat">
            <p class="pc-stat__label">Waktu</p>
            <p class="pc-stat__value pc-stat__value--small">
              {{ formatDateTime(selectedAudit.created_at) }}
            </p>
            <p class="pc-stat__hint">{{ relativeTime(selectedAudit.created_at) }}</p>
          </div>
          <div class="pc-stat">
            <p class="pc-stat__label">Aktor</p>
            <p class="pc-stat__value pc-stat__value--small">
              {{ selectedAudit.actor?.handle || 'Sistem' }}
            </p>
            <p class="pc-stat__hint">{{ selectedAudit.actor?.email || 'Tanpa email' }}</p>
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <h3 class="pc-card__title">Konteks aksi</h3>
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>Target</dt>
              <dd>
                {{ selectedAudit.target_type || '—' }}
                <span class="pc-mono">· {{ selectedAudit.target_id || '—' }}</span>
              </dd>
              <dt>Alasan</dt>
              <dd>{{ selectedAudit.reason || '—' }}</dd>
              <dt>IP</dt>
              <dd class="pc-mono">{{ selectedAudit.ip_address || '—' }}</dd>
              <dt>User agent</dt>
              <dd class="pc-small">{{ selectedAudit.user_agent || '—' }}</dd>
            </dl>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h3 class="pc-card__title">Metadata</h3>
              <p class="pc-card__desc">Snapshot nilai sebelum/sesudah aksi.</p>
            </div>
          </div>
          <div class="pc-card__body">
            <pre class="pc-code">{{ safeJson(selectedAudit.metadata) }}</pre>
          </div>
        </section>

        <div class="pc-callout">
          <LockKeyhole :size="15" />
          <div>
            Audit ini tidak dapat diubah atau dihapus dari konsol. Untuk koreksi, lakukan
            aksi baru yang juga akan tercatat.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="pc-btn pc-btn--ghost" @click="auditDrawerOpen = false">
          Tutup
        </button>
      </template>
    </ConsoleDrawer>

    <ConsoleDrawer
      v-model="logDrawerOpen"
      eyebrow="Runtime log · read-only"
      :title="selectedLog?.source || 'Detail log'"
      :subtitle="selectedLog ? formatDateTime(selectedLog.created_at) : ''"
    >
      <div v-if="selectedLog" class="pc-stack">
        <div class="pc-inline">
          <ConsoleStatusBadge
            :status="selectedLog.tone"
            :label="logToneLabel(selectedLog.tone)"
            :tone="logToneStyle(selectedLog.tone)"
          />
          <span class="pc-badge pc-badge--neutral pc-mono">{{ selectedLog.source }}</span>
        </div>
        <pre class="pc-code">{{ selectedLog.message }}</pre>
        <dl class="pc-kv">
          <dt>Waktu</dt>
          <dd>{{ formatDateTime(selectedLog.created_at) }}</dd>
          <dt>Relatif</dt>
          <dd>{{ relativeTime(selectedLog.created_at) }}</dd>
        </dl>
        <div class="pc-callout">
          <Info :size="15" />
          <div>Log sistem bersifat diagnostik. Tidak ada aksi hapus dari konsol.</div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="pc-btn pc-btn--ghost" @click="logDrawerOpen = false">
          Tutup
        </button>
      </template>
    </ConsoleDrawer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  LockKeyhole,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
} from 'lucide-vue-next';
import { api } from '../../api';
import ConsoleDrawer from '../../components/super-admin/ConsoleDrawer.vue';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import {
  formatDateTime,
  relativeTime,
  safeJson,
  shortId,
  titleCase,
} from '../../utils/console';

const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'audit', label: 'Audit Admin' },
  { id: 'logs', label: 'Log Sistem' },
];
const allowedTabs = tabs.map((tab) => tab.id);

function queryTab() {
  const value = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab;
  return allowedTabs.includes(value) ? value : 'audit';
}

const activeTab = ref(queryTab());
const settings = ref(null);
const summary = ref(null);
const audit = ref({ data: [], total: 0, page: 1, total_pages: 1 });
const logs = ref({ data: [], total: 0, page: 1, total_pages: 1 });

const auditQuery = ref('');
const auditAction = ref('');
const auditActor = ref('');
const auditTarget = ref('');
const auditFrom = ref('');
const auditTo = ref('');
const auditPage = ref(1);
const auditLoading = ref(false);
const auditError = ref('');

const logQuery = ref('');
const logSource = ref('');
const logTone = ref('');
const logPage = ref(1);
const logsLoading = ref(false);
const logsError = ref('');

const auditDrawerOpen = ref(false);
const selectedAudit = ref(null);
const logDrawerOpen = ref(false);
const selectedLog = ref(null);
const logsLoaded = ref(false);

const refreshing = computed(() => auditLoading.value || logsLoading.value);

const healthLabel = computed(() => {
  const status = summary.value?.health?.status;
  if (status === 'ok') return 'Sistem normal';
  if (status === 'degraded') return 'Perlu perhatian';
  if (status === 'error') return 'DB bermasalah';
  return settings.value ? 'Postur keamanan aktif' : 'Memuat status';
});

const healthTone = computed(() => {
  const status = summary.value?.health?.status;
  if (status === 'ok') return 'success';
  if (status === 'degraded') return 'warning';
  if (status === 'error') return 'danger';
  return 'neutral';
});

let auditTimer = null;
let logTimer = null;

function setTab(tab) {
  if (!allowedTabs.includes(tab)) return;
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
  ensureTab(tab);
}

function ensureTab(tab) {
  if (tab === 'logs' && !logsLoaded.value) {
    logsLoaded.value = true;
    loadLogs();
  }
}

async function loadSettings() {
  try {
    settings.value = await api.getAdminSystemSettings();
  } catch {
    settings.value = null;
  }
}

async function loadSummary() {
  try {
    summary.value = await api.getAdminOpsSummary();
  } catch {
    summary.value = null;
  }
}

async function loadAudit() {
  auditLoading.value = true;
  auditError.value = '';
  try {
    const params = { page: auditPage.value, limit: 25 };
    if (auditQuery.value.trim()) params.q = auditQuery.value.trim();
    if (auditAction.value.trim()) params.action = auditAction.value.trim();
    if (auditActor.value.trim()) params.actor = auditActor.value.trim();
    if (auditTarget.value) params.target_type = auditTarget.value;
    if (auditFrom.value) params.from = auditFrom.value;
    if (auditTo.value) params.to = auditTo.value;
    audit.value = await api.getAdminAuditLogs(params);
  } catch (err) {
    auditError.value = err?.message || 'Gagal memuat audit.';
  } finally {
    auditLoading.value = false;
  }
}

async function loadLogs() {
  logsLoading.value = true;
  logsError.value = '';
  try {
    const params = { page: logPage.value, limit: 50 };
    if (logQuery.value.trim()) params.q = logQuery.value.trim();
    if (logSource.value) params.source = logSource.value;
    if (logTone.value) params.tone = logTone.value;
    logs.value = await api.getEngineLogs(params);
  } catch (err) {
    logsError.value = err?.message || 'Gagal memuat log sistem.';
  } finally {
    logsLoading.value = false;
  }
}

async function refreshPage() {
  if (activeTab.value === 'logs') {
    await Promise.all([loadLogs(), loadSettings(), loadSummary()]);
    return;
  }
  await Promise.all([loadAudit(), loadSettings(), loadSummary()]);
}

function goAuditPage(page) {
  auditPage.value = page;
  loadAudit();
}

function goLogPage(page) {
  logPage.value = page;
  loadLogs();
}

function openAudit(entry) {
  selectedAudit.value = entry;
  auditDrawerOpen.value = true;
}

function openLog(log) {
  selectedLog.value = log;
  logDrawerOpen.value = true;
}

function logToneLabel(tone) {
  return { ok: 'OK', info: 'Info', muted: 'Muted', error: 'Error' }[tone] || titleCase(tone);
}

function logToneStyle(tone) {
  if (tone === 'ok') return 'success';
  if (tone === 'error') return 'danger';
  if (tone === 'info') return 'blue';
  return 'neutral';
}

watch([auditQuery, auditAction, auditActor, auditTarget, auditFrom, auditTo], () => {
  window.clearTimeout(auditTimer);
  auditTimer = window.setTimeout(() => {
    auditPage.value = 1;
    loadAudit();
  }, 350);
});

watch(logQuery, () => {
  window.clearTimeout(logTimer);
  logTimer = window.setTimeout(() => {
    logPage.value = 1;
    loadLogs();
  }, 350);
});

watch([logSource, logTone], () => {
  logPage.value = 1;
  loadLogs();
});

watch(
  () => route.query.tab,
  () => {
    const tab = queryTab();
    if (tab === activeTab.value) return;
    activeTab.value = tab;
    ensureTab(tab);
  }
);

onMounted(() => {
  loadSettings();
  loadSummary();
  loadAudit();
  ensureTab(activeTab.value);
});

onBeforeUnmount(() => {
  window.clearTimeout(auditTimer);
  window.clearTimeout(logTimer);
});
</script>

<style scoped>
.pc-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.pc-input-icon > svg {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.pc-input-icon .pc-input {
  padding-left: 30px;
}

.pc-log-message {
  max-width: 560px;
  overflow-wrap: anywhere;
}

@media (max-width: 680px) {
  .pc-card__head {
    flex-direction: column;
  }

  .pc-filters {
    align-items: stretch;
  }
}
</style>
