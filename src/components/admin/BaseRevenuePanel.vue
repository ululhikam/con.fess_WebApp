<template>
  <div class="rev-panel">
    <ContentSkeleton
      v-if="loading && !workspace"
      type="list"
      :count="3"
      label="Memuat data pendapatan IDR…"
    />

    <AppStateView
      v-else-if="error"
      variant="error"
      title="Gagal memuat pendapatan base"
      :description="error?.message || 'Server tidak dapat mengembalikan data revenue.'"
      action-label="Coba lagi"
      @action="load"
    />

    <template v-else>
      <div v-if="!enabled" class="rev-banner rev-banner--muted">
        <Coins :size="18" />
        <div>
          <strong>Payout sedang ditutup.</strong>
          <p>Saldo tetap tercatat. Penarikan akan aktif setelah fitur payout dibuka oleh Super Admin.</p>
        </div>
      </div>

      <!-- SALDO -->
      <template v-if="mode === 'saldo'">
        <section class="rev-hero">
          <div class="rev-hero__label">Saldo IDR tersedia</div>
          <div class="rev-hero__value">{{ formatIdr(wallet.available_idr) }}</div>
          <p class="rev-hero__hint">
            Pendapatan base terpisah dari CTF pengguna. CTF tidak dapat dicairkan menjadi uang.
          </p>
          <div class="rev-hero__badges">
            <span class="rev-chip" :class="billingBadgeClass">{{ billingLabel }}</span>
            <span v-if="base?.free_forever" class="rev-chip rev-chip--free">Free forever</span>
          </div>
        </section>

        <div class="rev-grid">
          <div class="rev-stat">
            <span>Menunggu hold</span>
            <strong class="rev-stat--pending">{{ formatIdr(wallet.pending_idr) }}</strong>
            <small>Otomatis cair setelah {{ holdDays }} hari.</small>
          </div>
          <div class="rev-stat">
            <span>Sedang ditahan payout</span>
            <strong>{{ formatIdr(wallet.reserved_idr) }}</strong>
            <small>Dana untuk payout yang belum selesai.</small>
          </div>
          <div class="rev-stat">
            <span>Total pendapatan</span>
            <strong class="rev-stat--success">{{ formatIdr(wallet.lifetime_idr) }}</strong>
            <small>Akumulasi pendapatan bersih yang pernah tercatat.</small>
          </div>
          <div class="rev-stat">
            <span>Tarif per fess</span>
            <strong>{{ formatIdr(revenuePerFess) }}</strong>
            <small>Hanya fess berbayar, bukan self-post.</small>
          </div>
        </div>

        <section class="rev-info">
          <div class="rev-info__row">
            <span>Status posting base</span>
            <strong>{{ billingLabel }}</strong>
          </div>
          <div class="rev-info__row">
            <span>Masa hold pendapatan</span>
            <strong>{{ holdDays }} hari</strong>
          </div>
          <div class="rev-info__row">
            <span>Minimum penarikan</span>
            <strong>{{ formatIdr(minPayout) }}</strong>
          </div>
          <div class="rev-info__row">
            <span>Biaya transfer default</span>
            <strong>{{ formatIdr(payoutFee) }}</strong>
          </div>
          <div class="rev-info__row">
            <span>Rekening payout</span>
            <strong>{{ base?.bank_account_number_masked || 'Belum diatur' }}</strong>
          </div>
          <div class="rev-info__row">
            <span>Status KYC</span>
            <strong :class="kycClass">{{ kycLabel }}</strong>
          </div>
        </section>

        <p class="rev-note">
          Pendapatan hanya berasal dari fess berbayar yang terbit di base. Fess saat trial,
          freeForever, atau self-post tidak menghasilkan pendapatan.
        </p>
      </template>

      <!-- PENDAPATAN -->
      <template v-else-if="mode === 'pendapatan'">
        <section class="rev-hero rev-hero--compact">
          <div>
            <div class="rev-hero__label">Total pendapatan base</div>
            <div class="rev-hero__value rev-hero__value--success">
              {{ formatIdr(wallet.lifetime_idr) }}
            </div>
            <p class="rev-hero__hint">
              {{ formatIdr(revenuePerFess) }} per fess berbayar, ditahan {{ holdDays }} hari
              sebelum bisa ditarik.
            </p>
          </div>
          <div class="rev-hero__mini">
            <span>Available</span>
            <strong>{{ formatIdr(wallet.available_idr) }}</strong>
            <span>Pending</span>
            <strong>{{ formatIdr(wallet.pending_idr) }}</strong>
          </div>
        </section>

        <section class="rev-list-card">
          <div class="rev-section-head">
            <div>
              <h3>Riwayat pendapatan</h3>
              <p>50 entri terbaru. Entri REVERSED berarti fess diturunkan setelah terbit.</p>
            </div>
          </div>

          <div v-if="!entries.length" class="rev-empty">
            Belum ada pendapatan. Pendapatan muncul setelah fess berbayar disetujui dan terbit.
          </div>

          <ul v-else class="rev-entry-list">
            <li v-for="entry in entries" :key="entry.id" class="rev-entry">
              <div class="rev-entry__main">
                <span class="rev-entry__dot" :class="entryDotClass(entry.status)"></span>
                <div>
                  <strong>{{ formatIdr(entry.amount_idr) }}</strong>
                  <small>
                    {{ entry.type === 'earning' ? 'Pendapatan fess' : entry.type }}
                    <template v-if="entry.fess_id"> · fess {{ shortId(entry.fess_id) }}</template>
                  </small>
                </div>
              </div>
              <div class="rev-entry__meta">
                <span class="rev-status" :class="entryStatusClass(entry.status)">
                  {{ entryStatusLabel(entry.status) }}
                </span>
                <small v-if="entry.status === 'pending' && entry.available_at">
                  Cair {{ formatDate(entry.available_at) }}
                </small>
                <small v-else-if="entry.reversed_at">
                  Dibalik {{ formatDate(entry.reversed_at) }}
                </small>
                <small v-else>{{ formatDate(entry.created_at) }}</small>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <!-- PENARIKAN -->
      <template v-else-if="mode === 'penarikan'">
        <div class="rev-payout-top">
          <div class="rev-hero rev-hero--compact">
            <div>
              <div class="rev-hero__label">Siap ditarik</div>
              <div class="rev-hero__value">{{ formatIdr(wallet.available_idr) }}</div>
              <p class="rev-hero__hint">
                Ditahan payout: {{ formatIdr(wallet.reserved_idr) }} · minimum
                {{ formatIdr(minPayout) }}
              </p>
            </div>
          </div>

          <div class="rev-eligibility">
            <div
              v-for="item in eligibility"
              :key="item.key"
              class="rev-eligibility__item"
              :class="{ 'is-ok': item.ok }"
            >
              <CheckCircle2 v-if="item.ok" :size="16" />
              <AlertCircle v-else :size="16" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <section class="rev-form-card">
          <div class="rev-section-head">
            <div>
              <h3>Ajukan penarikan</h3>
              <p>
                Diajukan ke Super Admin untuk approval manual. Biaya transfer default
                {{ formatIdr(payoutFee) }} dapat disesuaikan saat approval.
              </p>
            </div>
          </div>

          <div v-if="!canRequestPayout" class="rev-banner rev-banner--warning">
            <AlertCircle :size="18" />
            <div>
              <strong>Penarikan belum bisa diajukan.</strong>
              <p>{{ requestBlockReason }}</p>
            </div>
          </div>

          <form class="rev-form" @submit.prevent="submitPayout">
            <label class="rev-field">
              <span>Nominal penarikan (IDR)</span>
              <input
                v-model="payoutForm.amount_idr"
                class="rev-input"
                type="number"
                inputmode="numeric"
                step="1"
                :min="minPayout"
                :max="wallet.available_idr"
                :disabled="!canRequestPayout || submittingPayout"
                placeholder="50000"
              />
            </label>

            <div v-if="quickAmounts.length" class="rev-quick">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="rev-quick__btn"
                :disabled="!canRequestPayout || submittingPayout"
                @click="payoutForm.amount_idr = amount"
              >
                {{ formatShortIdr(amount) }}
              </button>
            </div>

            <label class="rev-field">
              <span>Catatan (opsional)</span>
              <textarea
                v-model="payoutForm.notes"
                class="rev-input rev-textarea"
                maxlength="500"
                rows="3"
                :disabled="!canRequestPayout || submittingPayout"
                placeholder="Contoh: pencairan pendapatan bulan ini"
              ></textarea>
            </label>

            <div v-if="payoutAmount > 0" class="rev-summary-line">
              <span>Dana ditahan</span>
              <strong>{{ formatIdr(payoutAmount) }}</strong>
              <span>Estimasi diterima</span>
              <strong>{{ formatIdr(Math.max(payoutAmount - payoutFee, 0)) }}</strong>
            </div>

            <div v-if="payoutError" class="rev-alert rev-alert--error">{{ payoutError }}</div>
            <div v-if="payoutMessage" class="rev-alert rev-alert--success">{{ payoutMessage }}</div>

            <button
              type="submit"
              class="rev-btn rev-btn--primary"
              :disabled="!canRequestPayout || submittingPayout"
            >
              <Loader2 v-if="submittingPayout" class="rev-spin" :size="16" />
              <Coins v-else :size="16" />
              {{ submittingPayout ? 'Memproses…' : 'Ajukan penarikan' }}
            </button>
          </form>
        </section>

        <section class="rev-form-card">
          <div class="rev-section-head">
            <div>
              <h3>Rekening & KYC</h3>
              <p>
                Rekening pertama aktif langsung. Perubahan rekening berikutnya dikunci 24 jam
                untuk keamanan. Setiap perubahan wajib konfirmasi kata sandi.
              </p>
            </div>
            <span class="rev-status" :class="kycClass">{{ kycLabel }}</span>
          </div>

          <div class="rev-bank-current">
            <div>
              <span class="rev-muted">Rekening aktif</span>
              <strong>{{ base?.bank_name || 'Belum diatur' }}</strong>
              <small>
                {{ base?.bank_account_name || '—' }} ·
                {{ base?.bank_account_number_masked || '—' }}
              </small>
            </div>
            <div v-if="base?.bank_change_pending" class="rev-alert rev-alert--warning">
              Rekening baru aktif {{ formatDate(base.bank_change_effective_at) }}.
            </div>
          </div>

          <form class="rev-form" @submit.prevent="saveBank">
            <div class="rev-form-grid">
              <label class="rev-field">
                <span>Nama bank</span>
                <input
                  v-model="bankForm.bank_name"
                  class="rev-input"
                  type="text"
                  maxlength="80"
                  :disabled="savingBank"
                  placeholder="BCA / BNI / BRI / Mandiri"
                  required
                />
              </label>
              <label class="rev-field">
                <span>Nama pemilik rekening</span>
                <input
                  v-model="bankForm.bank_account_name"
                  class="rev-input"
                  type="text"
                  maxlength="120"
                  :disabled="savingBank"
                  placeholder="Sesuai rekening bank"
                  required
                />
              </label>
              <label class="rev-field">
                <span>Nomor rekening</span>
                <input
                  v-model="bankForm.bank_account_number"
                  class="rev-input"
                  type="text"
                  inputmode="numeric"
                  maxlength="40"
                  :disabled="savingBank"
                  placeholder="Hanya angka"
                  required
                />
              </label>
              <label class="rev-field">
                <span>Kata sandi konfirmasi</span>
                <input
                  v-model="bankForm.password"
                  class="rev-input"
                  type="password"
                  autocomplete="current-password"
                  :disabled="savingBank"
                  placeholder="Wajib untuk menyimpan"
                  required
                />
              </label>
            </div>

            <div v-if="bankError" class="rev-alert rev-alert--error">{{ bankError }}</div>
            <div v-if="bankMessage" class="rev-alert rev-alert--success">{{ bankMessage }}</div>

            <button type="submit" class="rev-btn" :disabled="savingBank">
              <Loader2 v-if="savingBank" class="rev-spin" :size="16" />
              <Save v-else :size="16" />
              {{ savingBank ? 'Menyimpan…' : 'Simpan rekening' }}
            </button>
          </form>

          <p class="rev-note">
            KYC diverifikasi oleh Super Admin. Payout tidak dapat diajukan sebelum KYC verified,
            rekening lengkap, dan masa tunggu rekening selesai.
          </p>
        </section>

        <section class="rev-list-card">
          <div class="rev-section-head">
            <div>
              <h3>Riwayat penarikan</h3>
              <p>25 pengajuan terbaru untuk base ini.</p>
            </div>
          </div>

          <div v-if="!payouts.length" class="rev-empty">Belum ada pengajuan penarikan.</div>

          <ul v-else class="rev-payout-list">
            <li v-for="payout in payouts" :key="payout.id" class="rev-payout">
              <div>
                <div class="rev-payout__amount">{{ formatIdr(payout.amount_idr) }}</div>
                <small>
                  Diajukan {{ formatDate(payout.requested_at) }} · bersih
                  {{ formatIdr(payout.net_idr) }}
                </small>
                <small v-if="payout.reference">Ref: {{ payout.reference }}</small>
                <small v-if="payout.rejection_reason" class="rev-danger">
                  {{ payout.rejection_reason }}
                </small>
              </div>
              <span class="rev-status" :class="payoutStatusClass(payout.status)">
                {{ payoutStatusLabel(payout.status) }}
              </span>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Loader2,
  Save,
} from 'lucide-vue-next';

import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { confirmDialog } from '../../composables/useAppDialog';
import { createIdempotencyKey } from '../../utils/idempotency';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

const props = defineProps({
  mode: { type: String, default: 'saldo' },
  baseHandle: { type: String, default: '' },
});

const workspace = ref(null);
const loading = ref(false);
const error = ref(null);

const payoutForm = reactive({ amount_idr: '', notes: '' });
const bankForm = reactive({
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  password: '',
});

const submittingPayout = ref(false);
const savingBank = ref(false);
const payoutMessage = ref('');
const payoutError = ref('');
const bankMessage = ref('');
const bankError = ref('');
let payoutRequestKey = null;

const base = computed(() => workspace.value?.base || null);
const wallet = computed(
  () =>
    workspace.value?.wallet || {
      pending_idr: 0,
      available_idr: 0,
      reserved_idr: 0,
      lifetime_idr: 0,
    },
);
const entries = computed(() => workspace.value?.entries || []);
const payouts = computed(() => workspace.value?.payouts || []);
const enabled = computed(() => workspace.value?.enabled === true);
const minPayout = computed(() => Number(workspace.value?.min_payout_idr ?? 50000));
const payoutFee = computed(() => Number(workspace.value?.payout_fee_idr ?? 6500));
const revenuePerFess = computed(() => Number(workspace.value?.revenue_per_fess_idr ?? 80));
const holdDays = computed(() => Number(workspace.value?.hold_days ?? 7));
const payoutAmount = computed(() => {
  const amount = Number(payoutForm.amount_idr);
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
});

const trialActive = computed(() => {
  const end = base.value?.trial_ends_at ? new Date(base.value.trial_ends_at).getTime() : 0;
  return end > Date.now();
});

const billingLabel = computed(() => {
  if (base.value?.free_forever) return 'Gratis permanen (freeForever)';
  if (trialActive.value) {
    return `Masa trial sampai ${formatDate(base.value?.trial_ends_at)}`;
  }
  return 'Base berbayar · 1 CTF per fess';
});

const billingBadgeClass = computed(() => {
  if (base.value?.free_forever) return 'rev-chip--free';
  if (trialActive.value) return 'rev-chip--trial';
  return 'rev-chip--paid';
});

const kycVerified = computed(() => base.value?.payout_kyc_status === 'verified');
const kycLabel = computed(() => {
  const status = base.value?.payout_kyc_status || 'unverified';
  if (status === 'verified') return 'KYC verified';
  if (status === 'rejected') return 'KYC ditolak';
  return 'KYC belum diverifikasi';
});
const kycClass = computed(() => {
  if (kycVerified.value) return 'rev-status--success';
  if (base.value?.payout_kyc_status === 'rejected') return 'rev-status--danger';
  return 'rev-status--warning';
});

const bankComplete = computed(() =>
  Boolean(
    base.value?.bank_name &&
      base.value?.bank_account_name &&
      base.value?.bank_account_number_masked,
  ),
);
const bankChangePending = computed(() => base.value?.bank_change_pending === true);

const canRequestPayout = computed(
  () =>
    enabled.value &&
    kycVerified.value &&
    bankComplete.value &&
    !bankChangePending.value &&
    Number(wallet.value.available_idr) >= minPayout.value,
);

const requestBlockReason = computed(() => {
  if (!enabled.value) return 'Fitur payout base sedang dinonaktifkan.';
  if (!kycVerified.value) return 'KYC base harus diverifikasi Super Admin terlebih dahulu.';
  if (!bankComplete.value) return 'Lengkapi rekening bank terlebih dahulu.';
  if (bankChangePending.value) {
    return `Perubahan rekening masih dikunci sampai ${formatDate(base.value?.bank_change_effective_at)}.`;
  }
  if (Number(wallet.value.available_idr) < minPayout.value) {
    return `Saldo tersedia minimal ${formatIdr(minPayout.value)} untuk mengajukan payout.`;
  }
  return '';
});

const eligibility = computed(() => [
  { key: 'enabled', label: 'Payout dibuka', ok: enabled.value },
  { key: 'kyc', label: 'KYC verified', ok: kycVerified.value },
  { key: 'bank', label: 'Rekening lengkap', ok: bankComplete.value },
  { key: 'hold', label: 'Rekening tidak dalam masa tunggu', ok: !bankChangePending.value },
  {
    key: 'balance',
    label: `Saldo minimal ${formatIdr(minPayout.value)}`,
    ok: Number(wallet.value.available_idr) >= minPayout.value,
  },
]);

const quickAmounts = computed(() => {
  const available = Math.floor(Number(wallet.value.available_idr) || 0);
  const values = [minPayout.value, 100000, 250000, 500000, available].filter(
    (amount) => amount >= minPayout.value && amount <= available,
  );
  return [...new Set(values)].sort((a, b) => a - b);
});

function formatIdr(value) {
  return `Rp${Math.round(Number(value) || 0).toLocaleString('id-ID')}`;
}

function formatShortIdr(value) {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(amount % 1_000_000 ? 1 : 0)}jt`;
  if (amount >= 1_000) return `Rp${Math.round(amount / 1_000)}rb`;
  return formatIdr(amount);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function shortId(value) {
  return String(value || '').slice(0, 8);
}

function entryStatusLabel(status) {
  return (
    {
      pending: 'Menunggu hold',
      available: 'Tersedia',
      reversed: 'Dibalik',
      paid: 'Sudah dibayar',
    }[status] || status
  );
}

function entryStatusClass(status) {
  return (
    {
      pending: 'rev-status--warning',
      available: 'rev-status--success',
      reversed: 'rev-status--danger',
      paid: 'rev-status--info',
    }[status] || 'rev-status--muted'
  );
}

function entryDotClass(status) {
  return (
    {
      pending: 'is-pending',
      available: 'is-available',
      reversed: 'is-reversed',
    }[status] || ''
  );
}

function payoutStatusLabel(status) {
  return (
    {
      requested: 'Menunggu review',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      paid: 'Sudah ditransfer',
      failed: 'Transfer gagal',
      cancelled: 'Dibatalkan',
    }[status] || status
  );
}

function payoutStatusClass(status) {
  return (
    {
      requested: 'rev-status--warning',
      approved: 'rev-status--info',
      rejected: 'rev-status--danger',
      paid: 'rev-status--success',
      failed: 'rev-status--danger',
      cancelled: 'rev-status--muted',
    }[status] || 'rev-status--muted'
  );
}

function prefillBank(source) {
  if (!source) return;
  bankForm.bank_name = source.bank_name || '';
  bankForm.bank_account_name = source.bank_account_name || '';
  bankForm.bank_account_number = '';
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const params = props.baseHandle ? { base_handle: props.baseHandle } : undefined;
    workspace.value = await api.getBaseRevenue(params);
    prefillBank(workspace.value?.base);
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

async function submitPayout() {
  payoutError.value = '';
  payoutMessage.value = '';
  const amount = payoutAmount.value;

  if (!canRequestPayout.value) {
    payoutError.value = requestBlockReason.value || 'Penarikan belum bisa diajukan.';
    return;
  }
  if (!Number.isInteger(amount) || amount < minPayout.value) {
    payoutError.value = `Minimal penarikan ${formatIdr(minPayout.value)}.`;
    return;
  }
  if (amount > Number(wallet.value.available_idr)) {
    payoutError.value = 'Nominal melebihi saldo yang tersedia.';
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Ajukan penarikan dana?',
    message: `${formatIdr(amount)} akan ditahan dari saldo available dan diajukan ke Super Admin.`,
    detail:
      `Biaya transfer default ${formatIdr(payoutFee.value)} dipotong saat approval. ` +
      'Payout diproses manual dan membutuhkan KYC yang sudah diverifikasi.',
    variant: 'info',
    confirmLabel: 'Ajukan payout',
  });
  if (!confirmed) return;

  if (!payoutRequestKey) payoutRequestKey = createIdempotencyKey('payout');
  submittingPayout.value = true;
  try {
    const res = await api.requestBasePayout(
      {
        amount_idr: amount,
        ...(base.value?.handle ? { base_handle: base.value.handle } : {}),
        notes: payoutForm.notes.trim() || null,
      },
      payoutRequestKey,
    );
    payoutRequestKey = null;
    payoutMessage.value = res?.idempotent
      ? 'Payout ini sudah pernah diajukan.'
      : 'Payout berhasil diajukan dan menunggu review Super Admin.';
    toast.success(payoutMessage.value);
    payoutForm.amount_idr = '';
    payoutForm.notes = '';
    await load();
  } catch (e) {
    payoutError.value = e?.message || 'Gagal mengajukan payout.';
    toast.error(payoutError.value);
  } finally {
    submittingPayout.value = false;
  }
}

async function saveBank() {
  bankError.value = '';
  bankMessage.value = '';
  if (!bankForm.password) {
    bankError.value = 'Masukkan kata sandi untuk mengonfirmasi perubahan rekening.';
    return;
  }
  if (!/^\d{5,34}$/.test(String(bankForm.bank_account_number || '').replace(/\s+/g, ''))) {
    bankError.value = 'Nomor rekening hanya boleh berisi 5–34 angka.';
    return;
  }

  const changing = Boolean(base.value?.bank_account_number_masked);
  const confirmed = await confirmDialog({
    title: changing ? 'Ubah rekening payout?' : 'Simpan rekening payout?',
    message: changing
      ? 'Rekening baru akan aktif setelah masa tunggu 24 jam.'
      : 'Rekening pertama langsung aktif untuk payout.',
    detail:
      'Perubahan rekening membutuhkan konfirmasi kata sandi. Payout tidak bisa diajukan ' +
      'selama masa tunggu perubahan rekening.',
    variant: 'warning',
    confirmLabel: changing ? 'Ubah rekening' : 'Simpan rekening',
  });
  if (!confirmed) return;

  savingBank.value = true;
  try {
    const payload = {
      ...(base.value?.handle ? { base_handle: base.value.handle } : {}),
      bank_name: bankForm.bank_name.trim(),
      bank_account_name: bankForm.bank_account_name.trim(),
      bank_account_number: bankForm.bank_account_number.replace(/\s+/g, ''),
      password: bankForm.password,
    };
    const saved = await api.updateBaseBank(payload);
    bankForm.password = '';
    bankMessage.value = saved?.bank_change_pending
      ? `Rekening disimpan. Aktif ${formatDate(saved.bank_change_effective_at)}.`
      : 'Rekening payout berhasil disimpan.';
    toast.success(bankMessage.value);
    prefillBank(saved);
    await load();
  } catch (e) {
    bankError.value = e?.message || 'Gagal menyimpan rekening.';
    toast.error(bankError.value);
  } finally {
    savingBank.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.rev-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--text-main);
}

.rev-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
  color: var(--text-secondary);
  font-size: 13px;
}
.rev-banner strong {
  color: var(--text-main);
}
.rev-banner p {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.5;
}
.rev-banner--muted {
  border-color: var(--border-strong);
}
.rev-banner--warning {
  border-color: color-mix(in srgb, var(--warning-text) 45%, var(--border-subtle));
  background: color-mix(in srgb, var(--warning-text) 10%, var(--bg-surface));
  color: var(--warning-text);
}
.rev-banner--warning strong {
  color: var(--warning-text);
}

.rev-hero {
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(186, 255, 0, 0.12), transparent 55%),
    var(--bg-surface);
}
.rev-hero--compact {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.rev-hero__label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.rev-hero__value {
  margin-top: 6px;
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 900;
  line-height: 1.1;
  color: var(--text-main);
}
.rev-hero__value--success {
  color: var(--success-text);
}
.rev-hero__hint {
  max-width: 620px;
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}
.rev-hero__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.rev-hero__mini {
  display: grid;
  grid-template-columns: auto auto;
  gap: 6px 18px;
  align-content: center;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  color: var(--text-muted);
}
.rev-hero__mini strong {
  text-align: right;
  color: var(--text-main);
}

.rev-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid transparent;
}
.rev-chip--free {
  color: var(--success-text);
  background: color-mix(in srgb, var(--success-text) 14%, transparent);
  border-color: color-mix(in srgb, var(--success-text) 35%, transparent);
}
.rev-chip--trial {
  color: var(--warning-text);
  background: color-mix(in srgb, var(--warning-text) 12%, transparent);
  border-color: color-mix(in srgb, var(--warning-text) 35%, transparent);
}
.rev-chip--paid {
  color: var(--text-secondary);
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
}

.rev-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.rev-stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.rev-stat span {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}
.rev-stat strong {
  font-size: 19px;
  font-weight: 900;
}
.rev-stat small {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.rev-stat--pending {
  color: var(--warning-text);
}
.rev-stat--success {
  color: var(--success-text);
}

.rev-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 22px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.rev-info__row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 12px;
}
.rev-info__row span {
  color: var(--text-muted);
}
.rev-info__row strong {
  text-align: right;
  font-weight: 700;
}

.rev-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.65;
  color: var(--text-muted);
}

.rev-list-card,
.rev-form-card {
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.rev-section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.rev-section-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
}
.rev-section-head p {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.55;
  color: var(--text-muted);
}
.rev-empty {
  padding: 24px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-inset);
  border: 1px dashed var(--border-strong);
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.rev-entry-list,
.rev-payout-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
.rev-entry,
.rev-payout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.rev-entry:last-child,
.rev-payout:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.rev-entry__main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.rev-entry__dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--text-muted);
}
.rev-entry__dot.is-pending {
  background: var(--warning-text);
}
.rev-entry__dot.is-available {
  background: var(--success-text);
}
.rev-entry__dot.is-reversed {
  background: var(--danger-text);
}
.rev-entry__main strong {
  display: block;
  font-size: 14px;
}
.rev-entry__main small,
.rev-entry__meta small,
.rev-payout small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-muted);
}
.rev-entry__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: 0 0 auto;
}
.rev-payout > div {
  min-width: 0;
}
.rev-payout__amount {
  font-size: 15px;
  font-weight: 900;
}

.rev-status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}
.rev-status--success {
  color: var(--success-text);
  background: color-mix(in srgb, var(--success-text) 13%, transparent);
}
.rev-status--warning {
  color: var(--warning-text);
  background: color-mix(in srgb, var(--warning-text) 13%, transparent);
}
.rev-status--danger {
  color: var(--danger-text);
  background: color-mix(in srgb, var(--danger-text) 13%, transparent);
}
.rev-status--info {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.14);
}
.rev-status--muted {
  color: var(--text-muted);
  background: var(--bg-surface-2);
}

.rev-payout-top {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 14px;
  align-items: stretch;
}
.rev-eligibility {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.rev-eligibility__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--danger-text);
}
.rev-eligibility__item.is-ok {
  color: var(--success-text);
}

.rev-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rev-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.rev-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}
.rev-input {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--bg-inset);
  color: var(--text-main);
  font: inherit;
  font-size: 13px;
  outline: none;
}
.rev-input:focus {
  border-color: var(--sub-accent-text);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sub-accent-text) 18%, transparent);
}
.rev-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.rev-textarea {
  resize: vertical;
}
.rev-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rev-quick__btn {
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface-2);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}
.rev-quick__btn:hover:not(:disabled) {
  border-color: var(--sub-accent-text);
  color: var(--text-main);
}
.rev-quick__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.rev-summary-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 18px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-muted);
}
.rev-summary-line strong {
  text-align: right;
  color: var(--text-main);
}
.rev-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--bg-surface-2);
  color: var(--text-main);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  width: fit-content;
}
.rev-btn--primary {
  border-color: var(--success-text);
  background: var(--success-text);
  color: #04130a;
}
.rev-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.rev-alert {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.5;
}
.rev-alert--error {
  color: var(--danger-text);
  background: color-mix(in srgb, var(--danger-text) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger-text) 35%, transparent);
}
.rev-alert--success {
  color: var(--success-text);
  background: color-mix(in srgb, var(--success-text) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--success-text) 35%, transparent);
}
.rev-alert--warning {
  color: var(--warning-text);
  background: color-mix(in srgb, var(--warning-text) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--warning-text) 35%, transparent);
}

.rev-bank-current {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
}
.rev-bank-current span {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.rev-bank-current strong {
  display: block;
  margin-top: 3px;
  font-size: 14px;
}
.rev-bank-current small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-muted);
}
.rev-muted {
  color: var(--text-muted);
}
.rev-danger {
  color: var(--danger-text);
}
.rev-spin {
  animation: rev-spin 0.9s linear infinite;
}
@keyframes rev-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 820px) {
  .rev-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .rev-payout-top {
    grid-template-columns: 1fr;
  }
  .rev-info {
    grid-template-columns: 1fr;
  }
  .rev-form-grid {
    grid-template-columns: 1fr;
  }
  .rev-hero--compact {
    flex-direction: column;
  }
}
@media (max-width: 520px) {
  .rev-grid {
    grid-template-columns: 1fr;
  }
  .rev-entry,
  .rev-payout,
  .rev-bank-current {
    align-items: flex-start;
    flex-direction: column;
  }
  .rev-entry__meta {
    align-items: flex-start;
  }
}
</style>
