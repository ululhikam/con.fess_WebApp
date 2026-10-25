<template>
  <div>
    <ConsolePageHeader
      eyebrow="System & integrations"
      title="Sistem &amp; Integrasi"
      subtitle="Pantau environment, integrasi eksternal, job runtime, dan postur keamanan platform. Konfigurasi sengaja read-only karena boot-time, instance-local, dan sensitif."
      :health="settings ? 'Read-only' : 'Memuat status'"
      health-tone="warning"
    >
      <template #actions>
        <span class="pc-badge pc-badge--warning">
          <LockKeyhole :size="11" />
          Tidak ada aksi tulis
        </span>
        <button
          type="button"
          class="pc-btn pc-btn--ghost"
          :disabled="loading"
          @click="load"
        >
          <RefreshCw :size="14" :class="{ 'pc-spin': loading }" />
          {{ loading ? 'Memuat…' : 'Muat ulang' }}
        </button>
      </template>
    </ConsolePageHeader>

    <div class="pc-callout pc-callout--warning" style="margin-bottom: 16px">
      <LockKeyhole :size="16" />
      <div>
        <strong>Konfigurasi platform read-only.</strong>
        Flag ENV dan secret dibaca saat boot, berbeda per instance, dan tidak boleh diubah
        dari UI. Perubahan harus lewat deploy terkontrol dan sign-off eksplisit. Nilai
        secret tidak pernah ditampilkan, hanya status terkonfigurasi.
      </div>
    </div>

    <div v-if="loading && !settings" class="pc-stack">
      <div class="pc-stats">
        <div v-for="index in 4" :key="index" class="pc-skeleton pc-skeleton--stat" />
      </div>
      <div class="pc-skeleton" style="height: 360px" />
    </div>

    <div v-else-if="error && !settings" class="pc-stack">
      <div class="pc-error">
        <AlertTriangle :size="17" />
        <div>
          <strong>Konfigurasi sistem gagal dimuat.</strong>
          <p>{{ error }}</p>
        </div>
      </div>
      <button type="button" class="pc-btn pc-btn--ghost" @click="load">Coba lagi</button>
    </div>

    <template v-else-if="settings">
      <div class="pc-stats">
        <div class="pc-stat pc-stat--blue">
          <p class="pc-stat__label">Runtime</p>
          <p class="pc-stat__value pc-stat__value--small">{{ settings.app.node_env }}</p>
          <p class="pc-stat__hint">{{ settings.app.deployment || 'Local / unknown deployment' }}</p>
        </div>
        <div class="pc-stat pc-stat--lime">
          <p class="pc-stat__label">Payments</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ settings.environment.payments_enabled ? 'ENABLED' : 'DISABLED' }}
          </p>
          <p class="pc-stat__hint">PAYMENTS_ENABLED</p>
        </div>
        <div class="pc-stat pc-stat--amber">
          <p class="pc-stat__label">Base payouts</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ settings.environment.base_payouts_enabled ? 'ENABLED' : 'DISABLED' }}
          </p>
          <p class="pc-stat__hint">BASE_PAYOUTS_ENABLED</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Midtrans</p>
          <p class="pc-stat__value pc-stat__value--small">
            {{ settings.integrations.midtrans.mode.toUpperCase() }}
          </p>
          <p class="pc-stat__hint">MIDTRANS_IS_PRODUCTION</p>
        </div>
      </div>

      <div class="pc-grid pc-grid--2">
        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Environment &amp; deployment</h2>
              <p class="pc-card__desc">Snapshot runtime yang sedang melayani request.</p>
            </div>
            <Server :size="16" class="pc-muted" />
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>NODE_ENV</dt>
              <dd><span class="pc-badge pc-badge--neutral">{{ settings.app.node_env }}</span></dd>
              <dt>Deployment</dt>
              <dd>{{ settings.app.deployment || 'Local / tidak tersedia' }}</dd>
              <dt>Commit</dt>
              <dd class="pc-mono">{{ settings.app.commit || 'Tidak tersedia' }}</dd>
              <dt>Payments</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.environment.payments_enabled ? 'active' : 'disabled'"
                  :label="settings.environment.payments_enabled ? 'AKTIF' : 'NONAKTIF'"
                />
              </dd>
              <dt>Base payouts</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.environment.base_payouts_enabled ? 'active' : 'disabled'"
                  :label="settings.environment.base_payouts_enabled ? 'AKTIF' : 'NONAKTIF'"
                />
              </dd>
              <dt>Midtrans mode</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.environment.midtrans_is_production ? 'failed' : 'ok'"
                  :label="settings.integrations.midtrans.mode.toUpperCase()"
                />
              </dd>
              <dt>Dibuat</dt>
              <dd>{{ formatDateTime(settings.generated_at) }}</dd>
            </dl>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Postur keamanan runtime</h2>
              <p class="pc-card__desc">Kontrol yang aktif pada instance ini.</p>
            </div>
            <ShieldCheck :size="16" class="pc-muted" />
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>Re-auth aksi sensitif</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.security.reauth_required_for_high_risk ? 'active' : 'disabled'"
                  :label="settings.security.reauth_required_for_high_risk ? 'Wajib' : 'Tidak'"
                />
              </dd>
              <dt>Audit log</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.security.audit_log_enabled ? 'active' : 'disabled'"
                  :label="settings.security.audit_log_enabled ? 'Aktif' : 'Nonaktif'"
                />
              </dd>
              <dt>Webhook signature</dt>
              <dd>
                <ConsoleStatusBadge
                  :status="settings.security.webhook_signature_verification ? 'active' : 'disabled'"
                  :label="settings.security.webhook_signature_verification ? 'Diverifikasi' : 'Tidak'"
                />
              </dd>
              <dt>Rate limit global</dt>
              <dd>
                {{ settings.security.global_rate_limit_per_minute }} req/menit
                <span class="pc-muted">· {{ settings.security.global_rate_limit_scope }}</span>
              </dd>
              <dt>Rate limit pembayaran</dt>
              <dd>{{ settings.security.payment_rate_limit_scope }}</dd>
              <dt>Aksi admin terakhir</dt>
              <dd>
                {{ settings.last_admin_action || '—' }}
                <span class="pc-muted">· {{ relativeTime(settings.last_admin_action_at) }}</span>
              </dd>
            </dl>
          </div>
        </section>
      </div>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h2 class="pc-card__title">Integrasi eksternal</h2>
            <p class="pc-card__desc">
              Status konfigurasi saja. Secret dan token tidak pernah dikirim ke browser.
            </p>
          </div>
          <PlugZap :size="16" class="pc-muted" />
        </div>
        <div class="pc-card__body">
          <div class="pc-grid pc-grid--2">
            <div class="pc-integration">
              <div class="pc-integration__head">
                <span class="pc-integration__icon pc-integration__icon--blue">
                  <CreditCard :size="17" />
                </span>
                <div>
                  <h3 class="pc-integration__title">Midtrans</h3>
                  <p class="pc-integration__sub">
                    {{ settings.integrations.midtrans.mode }} ·
                    {{ settings.environment.payments_enabled ? 'payments aktif' : 'payments nonaktif' }}
                  </p>
                </div>
                <ConsoleStatusBadge
                  :status="settings.integrations.midtrans.server_key_configured ? 'active' : 'disabled'"
                  :label="settings.integrations.midtrans.server_key_configured ? 'Siap' : 'Belum'"
                />
              </div>
              <div class="pc-integration__rows">
                <span>Server key</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.midtrans.server_key_configured ? 'true' : 'false'"
                  :label="settings.integrations.midtrans.server_key_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Client key</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.midtrans.client_key_configured ? 'true' : 'false'"
                  :label="settings.integrations.midtrans.client_key_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Merchant ID</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.midtrans.merchant_id_configured ? 'true' : 'false'"
                  :label="settings.integrations.midtrans.merchant_id_configured ? 'Terkonfigurasi' : 'Belum'"
                />
              </div>
            </div>

            <div class="pc-integration">
              <div class="pc-integration__head">
                <span class="pc-integration__icon pc-integration__icon--pink">
                  <Instagram :size="17" />
                </span>
                <div>
                  <h3 class="pc-integration__title">Instagram</h3>
                  <p class="pc-integration__sub">Auto-post &amp; token refresh</p>
                </div>
                <ConsoleStatusBadge
                  :status="settings.integrations.instagram.app_configured ? 'active' : 'disabled'"
                  :label="settings.integrations.instagram.app_configured ? 'Siap' : 'Belum'"
                />
              </div>
              <div class="pc-integration__rows">
                <span>App credentials</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.instagram.app_configured ? 'true' : 'false'"
                  :label="settings.integrations.instagram.app_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Verify token</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.instagram.verify_token_configured ? 'true' : 'false'"
                  :label="settings.integrations.instagram.verify_token_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Token refresh</span>
                <span class="pc-small pc-muted">
                  {{ relativeTime(settings.integrations.instagram.last_token_refresh_at) }}
                </span>
              </div>
            </div>

            <div class="pc-integration">
              <div class="pc-integration__head">
                <span class="pc-integration__icon pc-integration__icon--lime">
                  <Mail :size="17" />
                </span>
                <div>
                  <h3 class="pc-integration__title">Email</h3>
                  <p class="pc-integration__sub">Resend transactional email</p>
                </div>
                <ConsoleStatusBadge
                  :status="settings.integrations.email.resend_configured ? 'active' : 'disabled'"
                  :label="settings.integrations.email.resend_configured ? 'Siap' : 'Belum'"
                />
              </div>
              <div class="pc-integration__rows">
                <span>Resend API key</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.email.resend_configured ? 'true' : 'false'"
                  :label="settings.integrations.email.resend_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Email from</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.email.from_configured ? 'true' : 'false'"
                  :label="settings.integrations.email.from_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Mode</span>
                <span class="pc-small pc-muted">Reset password &amp; verifikasi</span>
              </div>
            </div>

            <div class="pc-integration">
              <div class="pc-integration__head">
                <span class="pc-integration__icon pc-integration__icon--amber">
                  <KeyRound :size="17" />
                </span>
                <div>
                  <h3 class="pc-integration__title">Payment reconcile</h3>
                  <p class="pc-integration__sub">Manual dengan secret terpisah</p>
                </div>
                <ConsoleStatusBadge
                  :status="settings.integrations.payment_reconcile.secret_configured ? 'manual' : 'disabled'"
                  :label="settings.integrations.payment_reconcile.secret_configured ? 'Manual' : 'Nonaktif'"
                />
              </div>
              <div class="pc-integration__rows">
                <span>Reconcile secret</span>
                <ConsoleStatusBadge
                  :status="settings.integrations.payment_reconcile.secret_configured ? 'true' : 'false'"
                  :label="settings.integrations.payment_reconcile.secret_configured ? 'Terkonfigurasi' : 'Belum'"
                />
                <span>Mode</span>
                <span class="pc-badge pc-badge--warning">Manual</span>
                <span>Runbook</span>
                <span class="pc-small pc-muted">Wajib sebelum eksekusi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h2 class="pc-card__title">Job &amp; worker</h2>
            <p class="pc-card__desc">
              Job berjalan di proses server. Tidak ada tombol run manual dari konsol.
            </p>
          </div>
          <Clock3 :size="16" class="pc-muted" />
        </div>
        <div class="pc-table-wrap">
          <table class="pc-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Jadwal</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Terakhir jalan</th>
                <th>Hasil</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in settings.jobs" :key="job.id">
                <td>
                  <span class="pc-table__primary">{{ job.label }}</span>
                  <span class="pc-table__sub pc-mono">{{ job.id }}</span>
                </td>
                <td>{{ job.schedule }}</td>
                <td><span class="pc-badge pc-badge--neutral">{{ job.mode }}</span></td>
                <td>
                  <ConsoleStatusBadge
                    :status="job.status"
                    :label="jobStatusLabel(job.status)"
                    :tone="jobStatusTone(job.status)"
                  />
                </td>
                <td>
                  {{ formatDateTime(job.last_run_at) }}
                  <span class="pc-table__sub">{{ relativeTime(job.last_run_at) }}</span>
                </td>
                <td>
                  <ConsoleStatusBadge
                    v-if="job.last_result"
                    :status="job.last_result"
                    :label="job.last_result"
                    :tone="job.last_result === 'error' ? 'danger' : 'success'"
                  />
                  <span v-else class="pc-muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="pc-grid pc-grid--2">
        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Prosedur perubahan</h2>
              <p class="pc-card__desc">Karena konfigurasi tidak dapat diubah dari UI.</p>
            </div>
            <FileClock :size="16" class="pc-muted" />
          </div>
          <div class="pc-card__body">
            <ol class="pc-procedure">
              <li>Perubahan flag atau secret dilakukan di environment provider (Vercel), bukan dari konsol ini.</li>
              <li>Deploy ulang atau restart instance. Flag dibaca saat boot sehingga tidak berubah live.</li>
              <li>Rotasi secret harus lewat dashboard provider dan tidak boleh ditempel ke chat atau commit.</li>
              <li>Catat alasan, waktu, dan verifikasi pasca-perubahan pada runbook serta audit manual.</li>
            </ol>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Batas konsol ini</h2>
              <p class="pc-card__desc">Apa yang sengaja tidak tersedia di v1.</p>
            </div>
            <LockKeyhole :size="16" class="pc-muted" />
          </div>
          <div class="pc-card__body pc-stack">
            <div class="pc-inline">
              <CheckCircle2 :size="14" class="pc-muted" />
              <span class="pc-small">Read-only untuk environment, secret, dan integrasi.</span>
            </div>
            <div class="pc-inline">
              <CheckCircle2 :size="14" class="pc-muted" />
              <span class="pc-small">Tidak ada job runner manual atau restart dari UI.</span>
            </div>
            <div class="pc-inline">
              <CheckCircle2 :size="14" class="pc-muted" />
              <span class="pc-small">Tidak ada perubahan role otomatis; role tetap manual di v1.</span>
            </div>
            <div class="pc-callout">
              <Info :size="15" />
              <div>
                Aksi operasional aman dapat ditambahkan setelah ada runbook, guardrail, dan
                audit yang disetujui.
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileClock,
  Info,
  Instagram,
  KeyRound,
  LockKeyhole,
  Mail,
  PlugZap,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-vue-next';
import { api } from '../../api';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import { formatDateTime, relativeTime } from '../../utils/console';

const settings = ref(null);
const loading = ref(false);
const error = ref('');

function jobStatusLabel(status) {
  return (
    {
      active: 'Aktif',
      unknown: 'Belum pernah',
      manual: 'Manual',
      disabled: 'Nonaktif',
      lazy: 'Lazy',
    }[status] || status
  );
}

function jobStatusTone(status) {
  if (status === 'active') return 'success';
  if (status === 'manual' || status === 'lazy' || status === 'unknown') return 'warning';
  if (status === 'disabled') return 'neutral';
  return 'neutral';
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    settings.value = await api.getAdminSystemSettings();
  } catch (err) {
    error.value = err?.message || 'Gagal memuat konfigurasi sistem.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.pc-integration {
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
}

.pc-integration__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.pc-integration__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 9px;
  background: var(--bg-surface);
  color: var(--text-main);
}

.pc-integration__icon--blue {
  color: #8fb0ff;
}

.pc-integration__icon--pink {
  color: #ff8ab5;
}

.pc-integration__icon--lime {
  color: var(--lime-text);
}

.pc-integration__icon--amber {
  color: var(--warning-text);
}

.pc-integration__head > div {
  min-width: 0;
  flex: 1;
}

.pc-integration__title {
  margin: 0;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 900;
}

.pc-integration__sub {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.45;
}

.pc-integration__rows {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  align-items: center;
  font-size: 10px;
  color: var(--text-muted);
}

.pc-procedure {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
}

.pc-procedure li + li {
  margin-top: 7px;
}

.pc-procedure li::marker {
  color: var(--lime-text);
  font-weight: 900;
}

@media (max-width: 680px) {
  .pc-card__head {
    flex-direction: column;
  }
}
</style>
