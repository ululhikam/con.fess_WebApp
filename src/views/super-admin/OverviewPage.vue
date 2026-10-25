<template>
  <div>
    <ConsolePageHeader
      eyebrow="Platform overview"
      title="Ringkasan Platform"
      subtitle="Satu pandangan untuk kesehatan platform, antrean aksi, keuangan base, dan aktivitas admin terbaru."
      :health="healthLabel"
      :health-tone="healthTone"
    >
      <template #actions>
        <button type="button" class="pc-btn pc-btn--ghost" :disabled="loading" @click="load">
          <RefreshCw :size="14" :class="{ 'pc-spin': loading }" />
          {{ loading ? 'Memuat…' : 'Muat ulang' }}
        </button>
      </template>
    </ConsolePageHeader>

    <div v-if="loading && !summary" class="pc-stack">
      <div class="pc-stats">
        <div v-for="index in 4" :key="index" class="pc-skeleton pc-skeleton--stat" />
      </div>
      <div class="pc-skeleton" style="height: 280px" />
    </div>

    <div v-else-if="error" class="pc-stack">
      <div class="pc-error">
        <AlertTriangle :size="17" />
        <div>
          <strong>Ringkasan platform gagal dimuat.</strong>
          <p>{{ error }}</p>
        </div>
      </div>
      <button type="button" class="pc-btn pc-btn--ghost" @click="load">Coba lagi</button>
    </div>

    <template v-else-if="summary">
      <div
        v-if="isProduction"
        class="pc-callout pc-callout--danger"
        style="margin-bottom: 16px"
      >
        <LockKeyhole :size="16" />
        <div>
          <strong>Mode produksi terdeteksi.</strong>
          Konfigurasi dan flag sistem tetap read-only. Jangan melakukan perubahan
          produksi tanpa sign-off eksplisit.
        </div>
      </div>

      <div class="pc-stats">
        <div class="pc-stat pc-stat--blue">
          <p class="pc-stat__label">Total pengguna</p>
          <p class="pc-stat__value">{{ formatNumber(summary.totals.users) }}</p>
          <p class="pc-stat__hint">{{ summary.counts.banned_users }} akun sedang dibekukan</p>
        </div>
        <div class="pc-stat pc-stat--lime">
          <p class="pc-stat__label">Total base</p>
          <p class="pc-stat__value">{{ formatNumber(summary.totals.bases) }}</p>
          <p class="pc-stat__hint">Base aktif di platform</p>
        </div>
        <div class="pc-stat pc-stat--amber">
          <p class="pc-stat__label">Payout menunggu review</p>
          <p class="pc-stat__value">{{ formatNumber(summary.counts.payouts_requested) }}</p>
          <p class="pc-stat__hint">
            {{ summary.counts.payouts_approved_waiting_transfer }} disetujui, menunggu transfer
          </p>
        </div>
        <div class="pc-stat pc-stat--pink">
          <p class="pc-stat__label">KYC perlu perhatian</p>
          <p class="pc-stat__value">{{ formatNumber(summary.counts.kyc_attention) }}</p>
          <p class="pc-stat__hint">Base siap payout tetapi belum terverifikasi</p>
        </div>
      </div>

      <div class="pc-stats">
        <div class="pc-stat">
          <p class="pc-stat__label">Available</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ formatIdr(summary.finance.available_idr) }}
          </p>
          <p class="pc-stat__hint">Siap ditarik base</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Pending</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ formatIdr(summary.finance.pending_idr) }}
          </p>
          <p class="pc-stat__hint">Belum lewat masa tahan 7 hari</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Reserved</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ formatIdr(summary.finance.reserved_idr) }}
          </p>
          <p class="pc-stat__hint">Payout yang sudah disetujui</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Lifetime</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ formatIdr(summary.finance.lifetime_idr) }}
          </p>
          <p class="pc-stat__hint">Pendapatan base tercatat</p>
        </div>
      </div>

      <div class="pc-grid pc-grid--sidebar">
        <div class="pc-stack">
          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Antrean aksi</h2>
                <p class="pc-card__desc">Pekerjaan platform yang membutuhkan keputusan admin.</p>
              </div>
              <ConsoleStatusBadge
                :status="actionCount > 0 ? 'pending' : 'ok'"
                :label="actionCount > 0 ? `${actionCount} item` : 'Bersih'"
              />
            </div>
            <div class="pc-card__body">
              <div v-if="actionCount > 0" class="pc-grid pc-grid--2">
                <router-link
                  v-if="summary.counts.payouts_requested > 0"
                  to="/super-admin/keuangan?tab=payouts"
                  class="pc-action-card"
                >
                  <span class="pc-action-card__icon pc-action-card__icon--lime">
                    <Wallet :size="16" />
                  </span>
                  <span>
                    <strong>{{ summary.counts.payouts_requested }} payout menunggu review</strong>
                    <small>
                      Tertua {{ relativeTime(summary.oldest.payout_requested_at) }}
                    </small>
                  </span>
                  <ArrowUpRight :size="15" />
                </router-link>

                <router-link
                  v-if="summary.counts.kyc_attention > 0"
                  to="/super-admin/keuangan?tab=kyc"
                  class="pc-action-card"
                >
                  <span class="pc-action-card__icon pc-action-card__icon--blue">
                    <BadgeCheck :size="16" />
                  </span>
                  <span>
                    <strong>{{ summary.counts.kyc_attention }} KYC perlu verifikasi</strong>
                    <small>Base siap payout tetapi belum terverifikasi</small>
                  </span>
                  <ArrowUpRight :size="15" />
                </router-link>

                <router-link
                  v-if="summary.counts.payments_pending_stale > 0"
                  to="/super-admin/keuangan?tab=payments"
                  class="pc-action-card"
                >
                  <span class="pc-action-card__icon pc-action-card__icon--amber">
                    <ReceiptText :size="16" />
                  </span>
                  <span>
                    <strong>{{ summary.counts.payments_pending_stale }} pembayaran stale</strong>
                    <small>
                      {{ summary.counts.payment_events_failed_24h }} event gagal dalam 24 jam
                    </small>
                  </span>
                  <ArrowUpRight :size="15" />
                </router-link>

                <router-link
                  v-if="summary.counts.banned_users > 0"
                  to="/super-admin/pengguna"
                  class="pc-action-card"
                >
                  <span class="pc-action-card__icon pc-action-card__icon--pink">
                    <Ban :size="16" />
                  </span>
                  <span>
                    <strong>{{ summary.counts.banned_users }} akun dibekukan</strong>
                    <small>Tinjau status ban dan kedaluwarsa</small>
                  </span>
                  <ArrowUpRight :size="15" />
                </router-link>
              </div>

              <div v-else class="pc-empty">
                <span class="pc-empty__icon"><CheckCircle2 :size="18" /></span>
                Tidak ada antrean mendesak. Semua payout, KYC, dan pembayaran terlihat aman.
              </div>
            </div>
          </section>

          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Audit admin terbaru</h2>
                <p class="pc-card__desc">Aksi berisiko tinggi selalu meninggalkan jejak permanen.</p>
              </div>
              <router-link to="/super-admin/keamanan" class="pc-link pc-small">
                Lihat semua
              </router-link>
            </div>
            <div class="pc-card__body">
              <div v-if="summary.recent_audit.length" class="pc-timeline">
                <div
                  v-for="entry in summary.recent_audit"
                  :key="entry.id"
                  class="pc-timeline__item pc-timeline__item--lime"
                >
                  <p class="pc-timeline__action">{{ entry.action }}</p>
                  <p class="pc-timeline__meta">
                    {{ entry.actor?.handle || 'Sistem' }} ·
                    {{ relativeTime(entry.created_at) }}
                    <template v-if="entry.target_type">
                      · {{ entry.target_type }} {{ shortId(entry.target_id, 5) }}
                    </template>
                    <template v-if="entry.reason"> · {{ entry.reason }}</template>
                  </p>
                </div>
              </div>
              <div v-else class="pc-empty">
                <span class="pc-empty__icon"><ScrollText :size="18" /></span>
                Belum ada audit admin.
              </div>
            </div>
          </section>
        </div>

        <div class="pc-stack">
          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Kesehatan sistem</h2>
                <p class="pc-card__desc">Sinyal langsung dari database dan log runtime.</p>
              </div>
              <ConsoleStatusBadge :status="summary.health.status" :label="healthLabel" />
            </div>
            <div class="pc-card__body">
              <dl class="pc-kv">
                <dt>Database latency</dt>
                <dd>
                  {{ summary.health.db_latency_ms == null ? 'Tidak merespons' : `${summary.health.db_latency_ms} ms` }}
                </dd>
                <dt>Log terakhir</dt>
                <dd>{{ relativeTime(summary.health.last_system_log_at) }}</dd>
                <dt>Error 24 jam</dt>
                <dd>{{ formatNumber(summary.health.errors_24h) }}</dd>
                <dt>Dibuat</dt>
                <dd>{{ formatDateTime(summary.generated_at) }}</dd>
              </dl>
            </div>
          </section>

          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Flag environment</h2>
                <p class="pc-card__desc">Boot-time env. Read-only dari konsol.</p>
              </div>
              <LockKeyhole :size="15" class="pc-muted" />
            </div>
            <div class="pc-card__body pc-stack">
              <div class="pc-inline" style="justify-content: space-between">
                <span class="pc-small pc-muted">Payments</span>
                <ConsoleStatusBadge
                  :status="summary.environment.payments_enabled ? 'active' : 'disabled'"
                  :label="summary.environment.payments_enabled ? 'ENABLED' : 'DISABLED'"
                />
              </div>
              <div class="pc-inline" style="justify-content: space-between">
                <span class="pc-small pc-muted">Base payouts</span>
                <ConsoleStatusBadge
                  :status="summary.environment.base_payouts_enabled ? 'active' : 'disabled'"
                  :label="summary.environment.base_payouts_enabled ? 'ENABLED' : 'DISABLED'"
                />
              </div>
              <div class="pc-inline" style="justify-content: space-between">
                <span class="pc-small pc-muted">Midtrans mode</span>
                <ConsoleStatusBadge
                  :status="summary.environment.midtrans_is_production ? 'failed' : 'ok'"
                  :label="summary.environment.midtrans_is_production ? 'PRODUCTION' : 'SANDBOX'"
                />
              </div>
              <div class="pc-inline" style="justify-content: space-between">
                <span class="pc-small pc-muted">Runtime</span>
                <span class="pc-badge pc-badge--neutral">
                  {{ summary.environment.node_env }}
                </span>
              </div>
            </div>
          </section>

          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Log sistem terbaru</h2>
                <p class="pc-card__desc">Sinyal worker, rate limiter, dan keamanan.</p>
              </div>
              <router-link to="/super-admin/keamanan?tab=logs" class="pc-link pc-small">
                Buka log
              </router-link>
            </div>
            <div v-if="summary.recent_logs.length" class="pc-card__body pc-log-list">
              <div v-for="log in summary.recent_logs" :key="log.id" class="pc-log">
                <span class="pc-log__time">{{ relativeTime(log.created_at) }}</span>
                <span class="pc-log__source">{{ log.source }}</span>
                <span class="pc-log__message">{{ log.message }}</span>
              </div>
            </div>
            <div v-else class="pc-empty">
              <span class="pc-empty__icon"><Activity :size="18" /></span>
              Belum ada log sistem.
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  CheckCircle2,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  ScrollText,
  Wallet,
} from 'lucide-vue-next';
import { api } from '../../api';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import {
  formatDateTime,
  formatIdr,
  formatNumber,
  relativeTime,
  shortId,
} from '../../utils/console';

const summary = ref(null);
const loading = ref(false);
const error = ref('');

const healthLabel = computed(() => {
  const status = summary.value?.health?.status;
  if (status === 'ok') return 'Sistem normal';
  if (status === 'degraded') return 'Perlu perhatian';
  if (status === 'error') return 'DB bermasalah';
  return 'Memuat status';
});

const healthTone = computed(() => {
  const status = summary.value?.health?.status;
  if (status === 'ok') return 'success';
  if (status === 'degraded') return 'warning';
  if (status === 'error') return 'danger';
  return 'neutral';
});

const actionCount = computed(() => {
  if (!summary.value) return 0;
  const counts = summary.value.counts;
  return (
    counts.payouts_requested +
    counts.kyc_attention +
    counts.payments_pending_stale +
    (counts.banned_users > 0 ? 1 : 0)
  );
});

const isProduction = computed(
  () =>
    summary.value?.environment?.node_env === 'production' ||
    summary.value?.environment?.midtrans_is_production === true
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    summary.value = await api.getAdminOpsSummary();
  } catch (err) {
    error.value = err?.message || 'Gagal memuat ringkasan platform.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.pc-action-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.pc-action-card:hover {
  border-color: var(--border-strong);
  background: var(--bg-surface-2);
  transform: translateY(-1px);
}

.pc-action-card > span:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.pc-action-card strong {
  color: var(--text-main);
  font-size: 11px;
  font-weight: 900;
  line-height: 1.35;
}

.pc-action-card small {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.4;
}

.pc-action-card__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 9px;
  background: var(--bg-surface);
  color: var(--text-main);
}

.pc-action-card__icon--lime {
  color: var(--lime-text);
}

.pc-action-card__icon--blue {
  color: #8fb0ff;
}

.pc-action-card__icon--amber {
  color: var(--warning-text);
}

.pc-action-card__icon--pink {
  color: #ff8ab5;
}

@media (max-width: 680px) {
  .pc-action-card {
    align-items: flex-start;
  }
}
</style>
