<template>
  <section class="sa-rev">
    <div class="sa-rev__head">
      <div>
        <div class="sa-rev__eyebrow">IDR revenue · manual payout</div>
        <h2>Pendapatan Base &amp; Review Payout</h2>
        <p>
          Tinjau pengajuan payout, verifikasi KYC, dan atur freeForever. Semua aksi
          Super Admin memerlukan konfirmasi dan tercatat di audit log.
        </p>
      </div>
      <button type="button" class="sa-btn sa-btn--ghost" :disabled="loading" @click="load">
        <RefreshCw :size="15" :class="{ 'sa-spin': loading }" />
        {{ loading ? 'Memuat…' : 'Muat ulang' }}
      </button>
    </div>

    <div v-if="error" class="sa-alert sa-alert--error">
      <AlertTriangle :size="17" />
      <div>
        <strong>Data revenue gagal dimuat.</strong>
        <p>{{ error?.message || 'Coba lagi beberapa saat.' }}</p>
      </div>
    </div>

    <template v-else>
      <div class="sa-totals">
        <div class="sa-total">
          <span>Tersedia semua base</span>
          <strong>{{ formatIdr(totals.available_idr) }}</strong>
        </div>
        <div class="sa-total">
          <span>Menunggu hold</span>
          <strong class="is-pending">{{ formatIdr(totals.pending_idr) }}</strong>
        </div>
        <div class="sa-total">
          <span>Ditahan payout</span>
          <strong>{{ formatIdr(totals.reserved_idr) }}</strong>
        </div>
        <div class="sa-total">
          <span>Total pendapatan</span>
          <strong class="is-success">{{ formatIdr(totals.lifetime_idr) }}</strong>
        </div>
        <div class="sa-total">
          <span>Payout menunggu</span>
          <strong class="is-warning">{{ pendingPayoutCount }}</strong>
        </div>
      </div>

      <div class="sa-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="sa-tab"
          :class="{ 'is-active': activeTab === 'payouts' }"
          @click="activeTab = 'payouts'"
        >
          <Banknote :size="16" />
          Antrean Payout
          <span v-if="pendingPayoutCount" class="sa-badge">{{ pendingPayoutCount }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="sa-tab"
          :class="{ 'is-active': activeTab === 'bases' }"
          @click="activeTab = 'bases'"
        >
          <ShieldCheck :size="16" />
          Base, KYC &amp; freeForever
        </button>
      </div>

      <div v-if="activeTab === 'payouts'" class="sa-card">
        <div class="sa-card__head">
          <div>
            <h3>Antrean payout</h3>
            <p>Setujui, tolak, atau tandai transfer selesai/gagal.</p>
          </div>
          <div class="sa-filter">
            <button
              v-for="filter in payoutFilters"
              :key="filter.value"
              type="button"
              class="sa-filter__btn"
              :class="{ 'is-active': queueFilter === filter.value }"
              @click="queueFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div v-if="loading && !payouts.length" class="sa-empty">Memuat antrean payout…</div>
        <div v-else-if="!filteredPayouts.length" class="sa-empty">
          Tidak ada payout pada filter ini.
        </div>

        <ul v-else class="sa-payout-list">
          <li v-for="payout in filteredPayouts" :key="payout.id" class="sa-payout">
            <div class="sa-payout__top">
              <div>
                <div class="sa-payout__base">{{ payout.base_name || payout.base_handle }}</div>
                <small>{{ payout.base_handle }} · diajukan {{ formatDate(payout.requested_at) }}</small>
              </div>
              <span class="sa-status" :class="payoutStatusClass(payout.status)">
                {{ payoutStatusLabel(payout.status) }}
              </span>
            </div>

            <div class="sa-payout__amount">
              <strong>{{ formatIdr(payout.amount_idr) }}</strong>
              <span>
                Biaya {{ formatIdr(payout.fee_idr) }} · bersih
                <b>{{ formatIdr(payout.net_idr) }}</b>
              </span>
            </div>

            <div class="sa-payout__bank">
              <span>{{ payout.bank_name || 'Bank belum diisi' }}</span>
              <strong>{{ payout.bank_account_number || payout.bank_account_number_masked || '—' }}</strong>
              <small>{{ payout.bank_account_name || '—' }}</small>
            </div>

            <div class="sa-payout__meta">
              <span>Pengaju: {{ payout.requested_by || '—' }}</span>
              <span v-if="payout.notes">Catatan: {{ payout.notes }}</span>
              <span v-if="payout.rejection_reason" class="sa-danger">
                Alasan: {{ payout.rejection_reason }}
              </span>
              <span v-if="payout.reference">Ref transfer: {{ payout.reference }}</span>
            </div>

            <div v-if="payout.status === 'requested'" class="sa-payout__actions">
              <button type="button" class="sa-btn sa-btn--primary" @click="openPayoutAction(payout, 'approve')">
                <Check :size="15" /> Setujui
              </button>
              <button type="button" class="sa-btn sa-btn--danger" @click="openPayoutAction(payout, 'reject')">
                <X :size="15" /> Tolak
              </button>
            </div>
            <div v-else-if="payout.status === 'approved'" class="sa-payout__actions">
              <button type="button" class="sa-btn sa-btn--primary" @click="openPayoutAction(payout, 'mark_paid')">
                <Check :size="15" /> Tandai sudah transfer
              </button>
              <button type="button" class="sa-btn sa-btn--danger" @click="openPayoutAction(payout, 'mark_failed')">
                <AlertTriangle :size="15" /> Transfer gagal
              </button>
              <button type="button" class="sa-btn" @click="openPayoutAction(payout, 'reject')">
                <X :size="15" /> Batalkan
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'bases'" class="sa-card">
        <div class="sa-card__head">
          <div>
            <h3>Base &amp; kontrol pembayaran</h3>
            <p>
              Base trial atau freeForever tidak menghasilkan revenue. KYC wajib sebelum
              payout dapat diajukan.
            </p>
          </div>
          <span class="sa-muted">{{ bases.length }} base</span>
        </div>

        <div v-if="loading && !bases.length" class="sa-empty">Memuat daftar base…</div>
        <div v-else-if="!bases.length" class="sa-empty">Belum ada base.</div>

        <div v-else class="sa-base-list">
          <article v-for="base in bases" :key="base.id" class="sa-base">
            <div class="sa-base__head">
              <div>
                <div class="sa-base__name">{{ base.name }}</div>
                <small>{{ base.handle }} · creator {{ base.creator_id || '—' }}</small>
              </div>
              <div class="sa-chip-row">
                <span class="sa-status" :class="baseBillingClass(base)">{{ baseBillingLabel(base) }}</span>
                <span class="sa-status" :class="kycClass(base)">{{ kycLabel(base) }}</span>
              </div>
            </div>

            <div class="sa-base__wallet">
              <div><span>Pending</span><strong>{{ formatIdr(base.pending_idr) }}</strong></div>
              <div><span>Available</span><strong>{{ formatIdr(base.available_idr) }}</strong></div>
              <div><span>Reserved</span><strong>{{ formatIdr(base.reserved_idr) }}</strong></div>
              <div><span>Lifetime</span><strong>{{ formatIdr(base.lifetime_idr) }}</strong></div>
            </div>

            <div class="sa-base__bank">
              <span>Rekening payout</span>
              <strong>{{ base.bank_name || 'Belum diatur' }}</strong>
              <small>
                {{ base.bank_account_name || '—' }} ·
                {{ base.bank_account_number || base.bank_account_number_masked || '—' }}
              </small>
              <small v-if="base.bank_change_pending" class="sa-warning">
                Perubahan aktif {{ formatDate(base.bank_change_effective_at) }}
              </small>
            </div>

            <div class="sa-base__note">
              <span v-if="base.free_forever_reason">
                freeForever: {{ base.free_forever_reason }}
              </span>
              <span v-if="base.payout_kyc_note">KYC: {{ base.payout_kyc_note }}</span>
            </div>

            <div class="sa-base__actions">
              <button
                type="button"
                class="sa-btn sa-btn--primary"
                :disabled="base.payout_kyc_status === 'verified'"
                @click="openKyc(base, 'verified')"
              >
                <ShieldCheck :size="15" /> Verifikasi KYC
              </button>
              <button
                type="button"
                class="sa-btn sa-btn--danger"
                :disabled="base.payout_kyc_status === 'rejected'"
                @click="openKyc(base, 'rejected')"
              >
                <ShieldX :size="15" /> Tolak KYC
              </button>
              <button
                type="button"
                class="sa-btn"
                :class="{ 'sa-btn--free': !base.free_forever }"
                @click="openFreeForever(base)"
              >
                <Infinity :size="15" />
                {{ base.free_forever ? 'Cabut freeForever' : 'Jadikan freeForever' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="actionContext" class="sa-modal-backdrop" @click.self="closeAction">
        <div class="sa-modal" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <div class="sa-modal__head">
            <div>
              <div class="sa-modal__eyebrow">Super Admin action</div>
              <h3>{{ modalTitle }}</h3>
              <p>{{ modalDescription }}</p>
            </div>
            <button type="button" class="sa-icon-btn" aria-label="Tutup" @click="closeAction">
              <X :size="18" />
            </button>
          </div>

          <div v-if="actionContext.kind === 'payout'" class="sa-modal__summary">
            <div>
              <span>Base</span>
              <strong>{{ actionContext.payout.base_handle }}</strong>
            </div>
            <div>
              <span>Nominal diajukan</span>
              <strong>{{ formatIdr(actionContext.payout.amount_idr) }}</strong>
            </div>
            <div>
              <span>Rekening tujuan</span>
              <strong>
                {{ actionContext.payout.bank_name }} ·
                {{ actionContext.payout.bank_account_number }}
              </strong>
            </div>
          </div>

          <div v-if="actionContext.kind === 'base'" class="sa-modal__summary">
            <div>
              <span>Base</span>
              <strong>{{ actionContext.base.handle }}</strong>
            </div>
            <div>
              <span>Status sekarang</span>
              <strong>{{ baseBillingLabel(actionContext.base) }} · {{ kycLabel(actionContext.base) }}</strong>
            </div>
          </div>

          <form class="sa-modal__form" @submit.prevent="submitAction">
            <label v-if="showFee" class="sa-field">
              <span>Biaya transfer (IDR)</span>
              <input
                v-model="actionForm.fee_idr"
                class="sa-input"
                type="number"
                min="0"
                step="1"
                required
              />
              <small>
                Dana ditahan {{ formatIdr(actionContext?.payout?.amount_idr) }}, bersih
                {{ formatIdr(Math.max(Number(actionForm.fee_idr || 0) > 0
                  ? Number(actionContext?.payout?.amount_idr) - Number(actionForm.fee_idr)
                  : Number(actionContext?.payout?.amount_idr), 0)) }}.
              </small>
            </label>

            <label v-if="showReference" class="sa-field">
              <span>Referensi transfer</span>
              <input
                v-model="actionForm.reference"
                class="sa-input"
                type="text"
                maxlength="160"
                placeholder="Contoh: BI-FAST 20261024xxxx"
                required
              />
            </label>

            <label v-if="showReason" class="sa-field">
              <span>
                {{ reasonLabel }}
                <b v-if="reasonRequired" class="sa-required">*</b>
              </span>
              <textarea
                v-model="actionForm.reason"
                class="sa-input sa-textarea"
                rows="3"
                maxlength="500"
                :placeholder="reasonPlaceholder"
                :required="reasonRequired"
              ></textarea>
            </label>

            <label v-if="showPassword" class="sa-field">
              <span>Kata sandi Super Admin <b class="sa-required">*</b></span>
              <input
                v-model="actionForm.password"
                class="sa-input"
                type="password"
                autocomplete="current-password"
                placeholder="Konfirmasi ulang kata sandi"
                required
              />
            </label>

            <div v-if="actionError" class="sa-alert sa-alert--error">
              <AlertTriangle :size="16" />
              <div>{{ actionError }}</div>
            </div>

            <div class="sa-modal__actions">
              <button type="button" class="sa-btn" :disabled="submittingAction" @click="closeAction">
                Batal
              </button>
              <button
                type="submit"
                class="sa-btn"
                :class="actionContext?.danger ? 'sa-btn--danger' : 'sa-btn--primary'"
                :disabled="submittingAction"
              >
                <Loader2 v-if="submittingAction" class="sa-spin" :size="15" />
                <Lock v-else :size="15" />
                {{ submittingAction ? 'Memproses…' : modalConfirmLabel }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  AlertTriangle,
  Banknote,
  Check,
  Infinity,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-vue-next';

import { api } from '../../api';
import { toast } from '../../composables/useToast';

const loading = ref(false);
const error = ref(null);
const workspace = ref(null);
const payouts = ref([]);
const activeTab = ref('payouts');
const queueFilter = ref('requested');

const actionContext = ref(null);
const actionForm = reactive({
  password: '',
  reason: '',
  fee_idr: '',
  reference: '',
});
const submittingAction = ref(false);
const actionError = ref('');

const payoutFilters = [
  { value: 'requested', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'all', label: 'Semua' },
];

const bases = computed(() => workspace.value?.bases || []);
const totals = computed(
  () =>
    workspace.value?.totals || {
      pending_idr: 0,
      available_idr: 0,
      reserved_idr: 0,
      lifetime_idr: 0,
    },
);
const payoutFee = computed(() => Number(workspace.value?.payout_fee_idr ?? 6500));
const pendingPayoutCount = computed(
  () => payouts.value.filter((payout) => payout.status === 'requested').length,
);
const filteredPayouts = computed(() => {
  if (queueFilter.value === 'all') return payouts.value;
  return payouts.value.filter((payout) => payout.status === queueFilter.value);
});

const action = computed(() => actionContext.value?.action || '');
const modalTitle = computed(() => {
  if (actionContext.value?.kind === 'payout') {
    return (
      {
        approve: 'Setujui payout?',
        reject: 'Tolak / batalkan payout?',
        mark_paid: 'Tandai transfer selesai?',
        mark_failed: 'Tandai transfer gagal?',
      }[action.value] || 'Review payout'
    );
  }
  if (actionContext.value?.kind === 'kyc') {
    return actionContext.value.status === 'verified' ? 'Verifikasi KYC base?' : 'Tolak KYC base?';
  }
  if (actionContext.value?.kind === 'freeForever') {
    return actionContext.value.freeForever ? 'Aktifkan freeForever?' : 'Cabut freeForever?';
  }
  return 'Konfirmasi aksi';
});

const modalDescription = computed(() => {
  if (actionContext.value?.kind === 'payout') {
    if (action.value === 'approve') {
      return 'Setujui nominal payout. Dana tetap ditahan sampai transfer ditandai selesai.';
    }
    if (action.value === 'mark_paid') {
      return 'Dana reserved akan dikonsumsi. Isi referensi transfer sebagai bukti.';
    }
    if (action.value === 'mark_failed') {
      return 'Dana akan dikembalikan ke saldo available base dan payout ditutup.';
    }
    return 'Dana akan dikembalikan ke saldo available base dan payout ditutup.';
  }
  if (actionContext.value?.kind === 'kyc') {
    return actionContext.value.status === 'verified'
      ? 'KYC verified membuka kemampuan base mengajukan payout.'
      : 'Penolakan KYC akan memblokir pengajuan payout base.';
  }
  if (actionContext.value?.kind === 'freeForever') {
    return actionContext.value.freeForever
      ? 'Base tidak akan dikenakan biaya CTF dan tidak menghasilkan revenue selama freeForever.'
      : 'Base kembali mengikuti aturan trial/berbayar normal.';
  }
  return '';
});

const showFee = computed(() => actionContext.value?.kind === 'payout' && action.value === 'approve');
const showReference = computed(
  () => actionContext.value?.kind === 'payout' && action.value === 'mark_paid',
);
const showReason = computed(() => {
  if (!actionContext.value) return false;
  if (actionContext.value.kind === 'freeForever') return true;
  if (actionContext.value.kind === 'kyc') return true;
  return ['approve', 'reject', 'mark_paid', 'mark_failed'].includes(action.value);
});
const showPassword = computed(() => {
  if (!actionContext.value) return false;
  if (actionContext.value.kind === 'kyc') return true;
  if (actionContext.value.kind === 'freeForever') return true;
  return ['approve', 'mark_paid'].includes(action.value);
});
const reasonRequired = computed(() => {
  if (!actionContext.value) return false;
  if (actionContext.value.kind === 'freeForever') return true;
  if (actionContext.value.kind === 'kyc') return actionContext.value.status === 'rejected';
  return ['reject', 'mark_failed'].includes(action.value);
});
const reasonLabel = computed(() => {
  if (actionContext.value?.kind === 'freeForever') return actionContext.value.freeForever ? 'Alasan aktivasi' : 'Alasan pencabutan';
  if (actionContext.value?.kind === 'kyc') return 'Catatan KYC';
  if (action.value === 'approve') return 'Catatan approval (opsional)';
  if (action.value === 'mark_paid') return 'Catatan transfer (opsional)';
  return 'Alasan';
});
const reasonPlaceholder = computed(() => {
  if (actionContext.value?.kind === 'freeForever') {
    return 'Contoh: base komunitas kampus, disetujui gratis permanen.';
  }
  if (actionContext.value?.kind === 'kyc') {
    return actionContext.value.status === 'verified'
      ? 'Contoh: identitas dan rekening sudah cocok.'
      : 'Contoh: nama rekening tidak sesuai identitas.';
  }
  if (action.value === 'approve') return 'Opsional, mis. sudah dicek oleh finance.';
  if (action.value === 'mark_paid') return 'Opsional, mis. transfer BI-FAST berhasil.';
  return 'Tulis alasan yang jelas untuk audit log.';
});
const modalConfirmLabel = computed(() => {
  if (actionContext.value?.kind === 'kyc') {
    return actionContext.value.status === 'verified' ? 'Verifikasi KYC' : 'Tolak KYC';
  }
  if (actionContext.value?.kind === 'freeForever') {
    return actionContext.value.freeForever ? 'Aktifkan freeForever' : 'Cabut freeForever';
  }
  return (
    {
      approve: 'Setujui payout',
      reject: 'Tolak payout',
      mark_paid: 'Tandai selesai',
      mark_failed: 'Tandai gagal',
    }[action.value] || 'Konfirmasi'
  );
});

function formatIdr(value) {
  return `Rp${Math.round(Number(value) || 0).toLocaleString('id-ID')}`;
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
      requested: 'is-warning',
      approved: 'is-info',
      rejected: 'is-danger',
      paid: 'is-success',
      failed: 'is-danger',
      cancelled: 'is-muted',
    }[status] || 'is-muted'
  );
}

function kycLabel(base) {
  if (base.payout_kyc_status === 'verified') return 'KYC verified';
  if (base.payout_kyc_status === 'rejected') return 'KYC ditolak';
  return 'KYC unverified';
}

function kycClass(base) {
  if (base.payout_kyc_status === 'verified') return 'is-success';
  if (base.payout_kyc_status === 'rejected') return 'is-danger';
  return 'is-warning';
}

function baseBillingLabel(base) {
  if (base.free_forever) return 'freeForever';
  const end = base.trial_ends_at ? new Date(base.trial_ends_at).getTime() : 0;
  if (end > Date.now()) return `Trial s.d. ${formatDate(base.trial_ends_at)}`;
  return 'Berbayar';
}

function baseBillingClass(base) {
  if (base.free_forever) return 'is-success';
  const end = base.trial_ends_at ? new Date(base.trial_ends_at).getTime() : 0;
  if (end > Date.now()) return 'is-warning';
  return 'is-muted';
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [nextWorkspace, queue] = await Promise.all([
      api.getBaseRevenue(),
      api.getBasePayouts({ limit: 100 }),
    ]);
    workspace.value = nextWorkspace;
    payouts.value = queue?.data || [];
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

function resetActionForm() {
  actionForm.password = '';
  actionForm.reason = '';
  actionForm.fee_idr = '';
  actionForm.reference = '';
  actionError.value = '';
}

function openPayoutAction(payout, nextAction) {
  resetActionForm();
  if (nextAction === 'approve') {
    // Payout requests are stored with fee=0; the default fee is applied at
    // approval and may be adjusted there.
    const requestedFee = Number(payout.fee_idr || 0);
    const fee = requestedFee > 0 ? requestedFee : payoutFee.value;
    actionForm.fee_idr = String(Math.min(Math.max(fee, 0), Math.max(payout.amount_idr - 1, 0)));
  }
  actionContext.value = {
    kind: 'payout',
    action: nextAction,
    payout,
    danger: ['reject', 'mark_failed'].includes(nextAction),
  };
}

function openKyc(base, status) {
  resetActionForm();
  actionForm.reason = base.payout_kyc_note || '';
  actionContext.value = {
    kind: 'kyc',
    base,
    status,
    danger: status === 'rejected',
  };
}

function openFreeForever(base) {
  resetActionForm();
  actionForm.reason = base.free_forever_reason || '';
  actionContext.value = {
    kind: 'freeForever',
    base,
    freeForever: !base.free_forever,
    danger: base.free_forever,
  };
}

function closeAction() {
  if (submittingAction.value) return;
  actionContext.value = null;
  resetActionForm();
}

async function submitAction() {
  if (!actionContext.value) return;
  actionError.value = '';
  const ctx = actionContext.value;

  if (reasonRequired.value && String(actionForm.reason || '').trim().length < 5) {
    actionError.value = 'Alasan wajib diisi minimal 5 karakter.';
    return;
  }
  if (showFee.value) {
    const fee = Number(actionForm.fee_idr);
    if (!Number.isSafeInteger(fee) || fee < 0 || fee >= ctx.payout.amount_idr) {
      actionError.value = 'Biaya transfer harus bilangan bulat dan lebih kecil dari nominal payout.';
      return;
    }
  }
  if (showReference.value && !String(actionForm.reference || '').trim()) {
    actionError.value = 'Referensi transfer wajib diisi.';
    return;
  }
  if (showPassword.value && !actionForm.password) {
    actionError.value = 'Kata sandi Super Admin wajib diisi.';
    return;
  }

  submittingAction.value = true;
  try {
    if (ctx.kind === 'payout') {
      const payload = {
        action: ctx.action,
        reason: String(actionForm.reason || '').trim() || null,
      };
      if (showFee.value) payload.fee_idr = Number(actionForm.fee_idr);
      if (showReference.value) payload.reference = String(actionForm.reference || '').trim();
      if (showPassword.value) payload.password = actionForm.password;
      await api.reviewBasePayout(ctx.payout.id, payload);
      toast.success(`Payout ${ctx.payout.base_handle} berhasil diperbarui.`);
    } else if (ctx.kind === 'kyc') {
      await api.setBaseKyc({
        base_handle: ctx.base.handle,
        status: ctx.status,
        note: String(actionForm.reason || '').trim() || null,
        password: actionForm.password,
      });
      toast.success(
        ctx.status === 'verified'
          ? `KYC ${ctx.base.handle} diverifikasi.`
          : `KYC ${ctx.base.handle} ditolak.`,
      );
    } else if (ctx.kind === 'freeForever') {
      await api.setBaseFreeForever({
        base_handle: ctx.base.handle,
        free_forever: ctx.freeForever,
        reason: String(actionForm.reason || '').trim(),
        password: actionForm.password,
      });
      toast.success(
        ctx.freeForever
          ? `freeForever aktif untuk ${ctx.base.handle}.`
          : `freeForever dicabut untuk ${ctx.base.handle}.`,
      );
    }
    submittingAction.value = false;
    activeTab.value = ctx.kind === 'payout' ? 'payouts' : 'bases';
    closeAction();
    await load();
  } catch (e) {
    actionError.value = e?.message || 'Aksi gagal diproses.';
  } finally {
    submittingAction.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.sa-rev {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-main);
}
.sa-rev__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}
.sa-rev__eyebrow,
.sa-modal__eyebrow {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--success-text);
}
.sa-rev__head h2 {
  margin: 5px 0 0;
  font-size: 22px;
  line-height: 1.2;
}
.sa-rev__head p {
  max-width: 760px;
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}
.sa-totals {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.sa-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px;
  border-radius: var(--radius-md);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
}
.sa-total span {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.sa-total strong {
  font-size: 16px;
  font-weight: 900;
}
.sa-total strong.is-pending {
  color: var(--warning-text);
}
.sa-total strong.is-success {
  color: var(--success-text);
}
.sa-total strong.is-warning {
  color: var(--warning-text);
}
.sa-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  width: fit-content;
}
.sa-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.sa-tab.is-active {
  color: var(--text-main);
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
}
.sa-badge {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--warning-text);
  color: #1b1300;
  font-size: 10px;
  font-weight: 900;
}
.sa-card {
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
}
.sa-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}
.sa-card__head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
}
.sa-card__head p {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}
.sa-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sa-filter__btn {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}
.sa-filter__btn.is-active {
  color: var(--text-main);
  background: var(--bg-raised);
}
.sa-empty {
  padding: 30px 16px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-strong);
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
.sa-muted {
  font-size: 11px;
  color: var(--text-muted);
}
.sa-payout-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sa-payout {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.sa-payout__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.sa-payout__base {
  font-size: 14px;
  font-weight: 900;
}
.sa-payout__top small,
.sa-payout small,
.sa-base small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}
.sa-payout__amount {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
}
.sa-payout__amount strong {
  font-size: 18px;
  font-weight: 900;
}
.sa-payout__amount span {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}
.sa-payout__amount b {
  color: var(--text-main);
}
.sa-payout__bank {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  font-size: 11px;
  color: var(--text-muted);
}
.sa-payout__bank span {
  font-weight: 800;
  color: var(--text-secondary);
}
.sa-payout__bank strong {
  color: var(--text-main);
  font-size: 12px;
}
.sa-payout__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 16px;
  font-size: 11px;
  color: var(--text-muted);
}
.sa-payout__actions,
.sa-base__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.sa-base-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.sa-base {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}
.sa-base__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.sa-base__name {
  font-size: 14px;
  font-weight: 900;
}
.sa-chip-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}
.sa-base__wallet {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding: 9px;
  border-radius: var(--radius-sm);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
}
.sa-base__wallet span {
  display: block;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
}
.sa-base__wallet strong {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 800;
}
.sa-base__bank {
  font-size: 11px;
  color: var(--text-muted);
}
.sa-base__bank span {
  display: block;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}
.sa-base__bank strong {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-main);
}
.sa-base__note {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--text-muted);
}
.sa-status {
  display: inline-flex;
  width: fit-content;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 900;
  white-space: nowrap;
}
.sa-status.is-success {
  color: var(--success-text);
  background: color-mix(in srgb, var(--success-text) 13%, transparent);
}
.sa-status.is-warning {
  color: var(--warning-text);
  background: color-mix(in srgb, var(--warning-text) 13%, transparent);
}
.sa-status.is-danger {
  color: var(--danger-text);
  background: color-mix(in srgb, var(--danger-text) 13%, transparent);
}
.sa-status.is-info {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.14);
}
.sa-status.is-muted {
  color: var(--text-muted);
  background: var(--bg-raised);
}
.sa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--bg-raised);
  color: var(--text-main);
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}
.sa-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.sa-btn--ghost {
  background: transparent;
}
.sa-btn--primary {
  border-color: var(--success-text);
  background: var(--success-text);
  color: #04130a;
}
.sa-btn--danger {
  border-color: color-mix(in srgb, var(--danger-text) 55%, var(--border-strong));
  background: color-mix(in srgb, var(--danger-text) 16%, var(--bg-raised));
  color: var(--danger-text);
}
.sa-btn--free {
  border-color: color-mix(in srgb, var(--success-text) 55%, var(--border-strong));
  color: var(--success-text);
}
.sa-alert {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.5;
}
.sa-alert strong {
  font-weight: 800;
}
.sa-alert p {
  margin: 2px 0 0;
  font-size: 11px;
}
.sa-alert--error {
  color: var(--danger-text);
  background: color-mix(in srgb, var(--danger-text) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger-text) 30%, transparent);
}
.sa-warning {
  color: var(--warning-text) !important;
}
.sa-danger {
  color: var(--danger-text) !important;
}
.sa-required {
  color: var(--danger-text);
}
.sa-spin {
  animation: sa-spin 0.9s linear infinite;
}
@keyframes sa-spin {
  to {
    transform: rotate(360deg);
  }
}

.sa-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(3, 5, 12, 0.74);
  backdrop-filter: blur(5px);
}
.sa-modal {
  width: min(560px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}
.sa-modal__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}
.sa-modal__head h3 {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 900;
}
.sa-modal__head p {
  margin: 5px 0 0;
  font-size: 11px;
  line-height: 1.55;
  color: var(--text-muted);
}
.sa-icon-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
.sa-modal__summary {
  display: grid;
  gap: 7px;
  margin-top: 14px;
  padding: 11px;
  border-radius: var(--radius-sm);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
}
.sa-modal__summary div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  font-size: 11px;
}
.sa-modal__summary span {
  color: var(--text-muted);
}
.sa-modal__summary strong {
  text-align: right;
  font-weight: 800;
}
.sa-modal__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}
.sa-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
}
.sa-field small {
  font-size: 10px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-muted);
}
.sa-input {
  width: 100%;
  min-height: 40px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--bg-inset);
  color: var(--text-main);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.sa-input:focus {
  border-color: var(--sub-accent-text);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sub-accent-text) 16%, transparent);
}
.sa-textarea {
  resize: vertical;
}
.sa-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

@media (max-width: 980px) {
  .sa-totals {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .sa-base-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .sa-rev {
    padding: 15px;
  }
  .sa-rev__head {
    flex-direction: column;
  }
  .sa-totals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sa-base__wallet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sa-payout__amount {
    flex-direction: column;
    align-items: flex-start;
  }
  .sa-payout__amount span {
    text-align: left;
  }
  .sa-card__head {
    flex-direction: column;
  }
}
</style>
