<template>
  <ConsoleDrawer
    v-model="open"
    eyebrow="Dukungan base · read-only"
    :title="data?.base?.handle || handle || 'Dukungan base'"
    :subtitle="data?.base?.name || 'Ringkasan base untuk kebutuhan support platform.'"
  >
    <template #head-actions>
      <button
        type="button"
        class="pc-btn pc-btn--ghost pc-btn--icon pc-btn--sm"
        aria-label="Muat ulang data base"
        :disabled="loading"
        @click="load"
      >
        <RefreshCw :size="14" :class="{ 'pc-spin': loading }" />
      </button>
    </template>

    <div v-if="loading && !data" class="pc-stack">
      <div class="pc-skeleton pc-skeleton--stat" />
      <div class="pc-skeleton pc-skeleton--stat" />
      <div class="pc-skeleton pc-skeleton--line" />
    </div>

    <div v-else-if="error" class="pc-stack">
      <div class="pc-error">
        <AlertTriangle :size="16" />
        <div>
          <strong>Data base gagal dimuat.</strong>
          <p>{{ error }}</p>
        </div>
      </div>
      <button type="button" class="pc-btn pc-btn--ghost" @click="load">Coba lagi</button>
    </div>

    <div v-else-if="data" class="pc-stack">
      <div class="pc-inline">
        <ConsoleStatusBadge
          :status="data.kyc.status"
          :label="`KYC ${statusLabel(data.kyc.status)}`"
          :tone="data.kyc.status === 'verified' ? 'success' : 'warning'"
        />
        <ConsoleStatusBadge
          v-if="data.billing.free_forever"
          status="free"
          label="freeForever"
          tone="lime"
        />
        <ConsoleStatusBadge
          v-if="data.bank.change_pending"
          status="pending"
          label="Rekening dalam masa tunggu"
          tone="warning"
        />
        <ConsoleStatusBadge
          :status="data.payout_ready"
          :label="data.payout_ready ? 'Siap payout' : 'Belum siap payout'"
          :tone="data.payout_ready ? 'success' : 'neutral'"
        />
      </div>

      <div class="pc-stats pc-stats--2">
        <div class="pc-stat pc-stat--blue">
          <p class="pc-stat__label">Fess</p>
          <p class="pc-stat__value">{{ formatNumber(data.stats.fesses) }}</p>
          <p class="pc-stat__hint">{{ formatNumber(data.stats.followers) }} follower</p>
        </div>
        <div class="pc-stat pc-stat--lime">
          <p class="pc-stat__label">Available</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(data.wallet.available_idr) }}</p>
          <p class="pc-stat__hint">Lifetime {{ formatIdr(data.wallet.lifetime_idr) }}</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Reserved</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(data.wallet.reserved_idr) }}</p>
          <p class="pc-stat__hint">Payout menunggu transfer</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Pending</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(data.wallet.pending_idr) }}</p>
          <p class="pc-stat__hint">Belum lewat masa tahan</p>
        </div>
      </div>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Profil &amp; kepemilikan</h3>
            <p class="pc-card__desc">Informasi dasar yang dipakai untuk verifikasi support.</p>
          </div>
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm"
            @click="copyHandle"
          >
            <Copy :size="12" />
            Salin handle
          </button>
        </div>
        <div class="pc-card__body">
          <dl class="pc-kv">
            <dt>Pemilik / kreator</dt>
            <dd>
              <template v-if="data.base.creator">
                {{ data.base.creator.handle }} · {{ data.base.creator.email || 'email privat' }}
              </template>
              <template v-else>Belum terhubung</template>
            </dd>
            <dt>Kategori</dt>
            <dd>{{ data.base.category || 'Belum diisi' }}</dd>
            <dt>Mode posting</dt>
            <dd>{{ data.base.post_mode === 'auto' ? 'Auto publish' : 'Moderasi' }}</dd>
            <dt>Dibuat</dt>
            <dd>{{ formatDateTime(data.base.created_at) }}</dd>
          </dl>
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Billing &amp; KYC</h3>
            <p class="pc-card__desc">Status langganan base dan verifikasi pembayaran.</p>
          </div>
        </div>
        <div class="pc-card__body">
          <dl class="pc-kv">
            <dt>Trial berakhir</dt>
            <dd>{{ formatDateTime(data.billing.trial_ends_at) }}</dd>
            <dt>Sumber trial</dt>
            <dd>{{ data.billing.trial_source || '—' }}</dd>
            <dt>freeForever</dt>
            <dd>
              {{ data.billing.free_forever ? 'Aktif' : 'Tidak aktif' }}
              <span v-if="data.billing.free_forever_reason" class="pc-muted">
                · {{ data.billing.free_forever_reason }}
              </span>
            </dd>
            <dt>KYC</dt>
            <dd>{{ statusLabel(data.kyc.status) }} · {{ formatDateTime(data.kyc.verified_at) }}</dd>
            <dt>Catatan KYC</dt>
            <dd>{{ data.kyc.note || '—' }}</dd>
          </dl>
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Rekening payout</h3>
            <p class="pc-card__desc">Hanya ditampilkan untuk dukungan finansial. Tidak ada aksi ubah.</p>
          </div>
          <Landmark :size="16" class="pc-muted" />
        </div>
        <div class="pc-card__body">
          <dl class="pc-kv">
            <dt>Bank</dt>
            <dd>{{ data.bank.bank_name || 'Belum diisi' }}</dd>
            <dt>Nama rekening</dt>
            <dd>{{ data.bank.account_name || '—' }}</dd>
            <dt>Nomor rekening</dt>
            <dd class="pc-mono">{{ data.bank.account_number || data.bank.account_number_masked || '—' }}</dd>
            <dt>Status</dt>
            <dd>
              {{ data.bank.complete ? 'Lengkap' : 'Belum lengkap' }}
              <span v-if="data.bank.change_pending" class="pc-muted">
                · efektif {{ formatDateTime(data.bank.change_effective_at) }}
              </span>
            </dd>
            <dt>Terakhir diubah</dt>
            <dd>{{ formatDateTime(data.bank.updated_at) }}</dd>
          </dl>
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Koneksi platform</h3>
            <p class="pc-card__desc">Status kanal distribusi milik base.</p>
          </div>
        </div>
        <div class="pc-card__body">
          <div v-if="data.connections.length" class="pc-stack">
            <div
              v-for="connection in data.connections"
              :key="connection.platform"
              class="pc-inline"
            >
              <ConsoleStatusBadge
                :status="connection.connected ? 'connected' : 'idle'"
                :label="connection.platform"
                :tone="connection.connected ? 'success' : 'neutral'"
              />
              <span class="pc-small pc-muted">
                {{ connection.account_handle || 'Belum terhubung' }}
              </span>
              <span v-if="connection.token_expires_at" class="pc-small pc-muted">
                · token s.d. {{ formatDate(connection.token_expires_at) }}
              </span>
            </div>
          </div>
          <p v-else class="pc-help">Belum ada koneksi platform.</p>
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Payout terakhir</h3>
            <p class="pc-card__desc">{{ data.stats.payouts }} payout tercatat.</p>
          </div>
        </div>
        <div v-if="data.recent_payouts.length" class="pc-table-wrap">
          <table class="pc-table pc-table--compact">
            <thead>
              <tr>
                <th>Nominal</th>
                <th>Status</th>
                <th>Diajukan</th>
                <th>Referensi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payout in data.recent_payouts" :key="payout.id">
                <td>
                  <span class="pc-table__number">{{ formatIdr(payout.amount_idr) }}</span>
                  <span class="pc-table__sub">Bersih {{ formatIdr(payout.net_idr) }}</span>
                </td>
                <td><ConsoleStatusBadge :status="payout.status" /></td>
                <td>{{ formatDateTime(payout.requested_at) }}</td>
                <td>{{ payout.reference || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="pc-empty">
          <span class="pc-empty__icon"><Landmark :size="17" /></span>
          Belum ada payout untuk base ini.
        </div>
      </section>

      <section class="pc-card">
        <div class="pc-card__head">
          <div>
            <h3 class="pc-card__title">Jejak audit base</h3>
            <p class="pc-card__desc">Aksi admin terbaru yang menyentuh base ini.</p>
          </div>
          <ShieldCheck :size="16" class="pc-muted" />
        </div>
        <div class="pc-card__body">
          <div v-if="data.recent_audit.length" class="pc-timeline">
            <div
              v-for="entry in data.recent_audit"
              :key="entry.id"
              class="pc-timeline__item pc-timeline__item--lime"
            >
              <p class="pc-timeline__action">{{ entry.action }}</p>
              <p class="pc-timeline__meta">
                {{ entry.actor || 'Sistem' }} · {{ formatDateTime(entry.created_at) }}
                <template v-if="entry.reason"> · {{ entry.reason }}</template>
              </p>
            </div>
          </div>
          <p v-else class="pc-help">Belum ada audit khusus base ini.</p>
        </div>
      </section>

      <div class="pc-callout pc-callout--lime">
        <Info :size="16" />
        <div>
          Panel ini hanya untuk membaca konteks. Perubahan profil, rekening, moderasi,
          dan pengajuan payout tetap menjadi tugas Base Admin.
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="pc-btn pc-btn--ghost" @click="open = false">Tutup</button>
    </template>
  </ConsoleDrawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  AlertTriangle,
  Copy,
  Info,
  Landmark,
  RefreshCw,
  ShieldCheck,
} from 'lucide-vue-next';
import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { formatDate, formatDateTime, formatIdr, formatNumber, statusLabel } from '../../utils/console';
import ConsoleDrawer from './ConsoleDrawer.vue';
import ConsoleStatusBadge from './ConsoleStatusBadge.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  handle: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const data = ref(null);
const loading = ref(false);
const error = ref('');

async function load() {
  if (!props.handle) return;
  loading.value = true;
  error.value = '';
  try {
    data.value = await api.getAdminBaseSupport(props.handle);
  } catch (err) {
    error.value = err?.message || 'Gagal memuat data base.';
  } finally {
    loading.value = false;
  }
}

async function copyHandle() {
  try {
    await navigator.clipboard.writeText(data.value?.base?.handle || props.handle);
    toast.success('Handle base disalin.');
  } catch {
    toast.error('Gagal menyalin handle.');
  }
}

watch(
  () => [props.modelValue, props.handle],
  ([isOpen, handle]) => {
    if (!isOpen || !handle) return;
    if (data.value?.base?.handle !== handle) data.value = null;
    load();
  },
  { immediate: true }
);
</script>
