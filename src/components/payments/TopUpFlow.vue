<template>
  <section class="topup-flow" aria-label="Saldo dan top up CTF">
    <div class="wallet-hero">
      <div class="wallet-hero-main">
        <div>
          <p class="wallet-eyebrow">SALDO CTF KAMU</p>
          <div class="wallet-balance">
            <Coins :size="30" class="wallet-coin" aria-hidden="true" />
            <span>{{ balanceDisplay }}</span>
            <span class="wallet-unit">CTF</span>
          </div>
          <p class="wallet-note">1 CTF = 1 fess reguler. CTF tidak bisa dicairkan menjadi uang.</p>
        </div>
        <button type="button" class="wallet-history-link" @click="scrollToHistory">
          <History :size="15" /> Riwayat
        </button>
      </div>
      <div class="wallet-trust-row">
        <span><ShieldCheck :size="14" /> Pembayaran diproses aman oleh Midtrans</span>
        <span class="wallet-trust-dot" aria-hidden="true"></span>
        <span>Tanpa kartu kredit</span>
      </div>
    </div>

    <div v-if="configLoading" class="topup-state-card" aria-live="polite">
      <Loader2 :size="22" class="spin" />
      <p>Menyiapkan paket top-up...</p>
    </div>

    <div v-else-if="configError" class="topup-state-card topup-state-card--error" role="alert">
      <AlertTriangle :size="22" />
      <p>{{ configError }}</p>
      <button type="button" class="topup-secondary-btn" @click="loadConfig">Coba lagi</button>
    </div>

    <div v-else-if="!canTopUp && !activeOrder" class="topup-state-card topup-state-card--locked">
      <Lock :size="26" />
      <div>
        <h2>Top up belum dibuka</h2>
        <p v-if="!config?.configured">
          Konfigurasi pembayaran Midtrans di server belum lengkap. Hubungi admin platform.
        </p>
        <p v-else>
          Pembelian CTF sedang dinonaktifkan sementara. Saldo dan riwayat tetap bisa kamu lihat.
        </p>
      </div>
    </div>

    <template v-else>
      <!-- ACTIVE ORDER / PAYMENT INSTRUCTIONS -->
      <div v-if="activeOrder" class="payment-panel" aria-live="polite">
        <div class="payment-panel-head">
          <button
            v-if="activeOrder.status === 'pending'"
            type="button"
            class="small-back-btn"
            @click="resetOrder"
          >
            <ArrowLeft :size="16" /> Ganti metode
          </button>
          <span v-else class="payment-panel-kicker">DETAIL TRANSAKSI</span>
          <span class="status-pill" :class="`is-${statusTone}`">{{ statusLabel }}</span>
        </div>

        <div class="payment-panel-body">
          <div class="payment-amount-row">
            <div>
              <p class="payment-label">{{ activeOrder.package_name }}</p>
              <p class="payment-total">Rp{{ formatNumber(activeOrder.amount_idr) }}</p>
            </div>
            <div class="payment-ctf-box">
              <span>+{{ formatNumber(activeOrder.ctf_amount) }}</span>
              <small>CTF</small>
            </div>
          </div>

          <template v-if="activeOrder.status === 'pending'">
            <div class="payment-expiry" :class="{ 'is-urgent': countdownUrgent }">
              <Clock3 :size="14" />
              <span v-if="countdown">Selesaikan sebelum {{ countdown }}</span>
              <span v-else>Menunggu pembayaran</span>
            </div>

            <!-- QRIS -->
            <div v-if="instructions?.type === 'qris'" class="instruction-block instruction-qris">
              <p class="instruction-title">Scan QRIS</p>
              <p class="instruction-desc">
                Buka e-wallet atau m-banking yang mendukung QRIS, lalu scan kode di bawah.
              </p>
              <div class="qr-frame">
                <img
                  v-if="qrImageUrl"
                  :src="qrImageUrl"
                  alt="QRIS pembayaran top-up CTF"
                  referrerpolicy="no-referrer"
                />
                <QrCode v-else :size="120" class="qr-fallback" aria-hidden="true" />
              </div>
              <div v-if="instructions.qr_string" class="copy-row">
                <code>{{ instructions.qr_string }}</code>
                <button type="button" class="copy-btn" @click="copyText(instructions.qr_string)">
                  <Copy :size="14" /> Salin
                </button>
              </div>
              <p v-else-if="!qrImageUrl" class="instruction-desc">
                Instruksi QR belum tersedia. Tekan tombol cek status di bawah.
              </p>
            </div>

            <!-- Virtual Account / Mandiri Bill -->
            <div v-else-if="isVaInstruction" class="instruction-block">
              <p class="instruction-title">
                {{
                  instructions.type === 'mandiri_bill' ? 'Mandiri Bill Payment' : 'Virtual Account'
                }}
              </p>
              <p class="instruction-desc">
                {{
                  instructions.type === 'mandiri_bill'
                    ? "Buka Livin' atau ATM Mandiri, pilih Bayar, lalu masukkan kode biller dan kode bayar."
                    : `Buka aplikasi ${bankLabel} atau ATM, pilih Transfer / Virtual Account, lalu masukkan nomor di bawah.`
                }}
              </p>

              <div v-if="instructions.type === 'mandiri_bill'" class="pay-code-grid">
                <div class="pay-code-card">
                  <span>Kode Biller</span>
                  <strong>{{ instructions.biller_code || '—' }}</strong>
                  <button
                    v-if="instructions.biller_code"
                    type="button"
                    class="copy-btn"
                    @click="copyText(instructions.biller_code)"
                  >
                    <Copy :size="13" /> Salin
                  </button>
                </div>
                <div class="pay-code-card">
                  <span>Kode Bayar</span>
                  <strong>{{ instructions.bill_key || '—' }}</strong>
                  <button
                    v-if="instructions.bill_key"
                    type="button"
                    class="copy-btn"
                    @click="copyText(instructions.bill_key)"
                  >
                    <Copy :size="13" /> Salin
                  </button>
                </div>
              </div>

              <div v-else class="va-card">
                <span class="va-bank">{{ bankLabel }}</span>
                <strong>{{ instructions.va_number || '—' }}</strong>
                <button
                  v-if="instructions.va_number"
                  type="button"
                  class="copy-btn"
                  @click="copyText(instructions.va_number)"
                >
                  <Copy :size="13" /> Salin
                </button>
              </div>
            </div>

            <!-- E-wallet deeplink -->
            <div v-else-if="instructions?.type === 'deeplink'" class="instruction-block">
              <p class="instruction-title">Lanjutkan di aplikasi {{ ewalletLabel }}</p>
              <p class="instruction-desc">
                Tekan tombol di bawah untuk membuka aplikasi pembayaran. Setelah selesai, kembali ke
                halaman ini; status akan diperbarui otomatis.
              </p>
              <a
                v-if="safeDeeplink"
                :href="safeDeeplink"
                class="topup-primary-btn deeplink-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink :size="16" /> Buka {{ ewalletLabel }}
              </a>
              <p v-else class="instruction-desc instruction-desc--warning">
                Tautan aplikasi tidak tersedia. Gunakan tombol cek status atau hubungi dukungan.
              </p>
            </div>

            <div v-else class="instruction-block">
              <p class="instruction-title">Instruksi pembayaran</p>
              <p class="instruction-desc">
                Instruksi belum tersedia dari penyedia pembayaran. Tekan cek status untuk memuat
                pembayaran terbaru.
              </p>
            </div>

            <div class="payment-actions">
              <button
                type="button"
                class="topup-primary-btn"
                :disabled="checking"
                @click="checkActiveOrder(false)"
              >
                <RefreshCw :size="15" :class="{ spin: checking }" />
                {{ checking ? 'Memeriksa...' : 'Sudah bayar? Cek status' }}
              </button>
              <p class="poll-hint">
                <span class="live-dot" aria-hidden="true"></span>
                Status diperbarui otomatis setiap 5 detik. Jangan tutup halaman ini.
              </p>
            </div>
          </template>

          <template v-else-if="activeOrder.status === 'paid'">
            <div class="result-state result-state--success">
              <CheckCircle2 :size="48" />
              <h2>Pembayaran berhasil</h2>
              <p>
                {{ formatNumber(activeOrder.ctf_amount) }} CTF sudah masuk ke saldo kamu. Sekarang
                kamu bisa mengirim fess tanpa antrian.
              </p>
              <div class="result-balance">Saldo sekarang: {{ balanceDisplay }} CTF</div>
              <div class="result-actions">
                <button type="button" class="topup-primary-btn" @click="topUpAgain">
                  Top up lagi
                </button>
                <button type="button" class="topup-secondary-btn" @click="goCompose">
                  Kirim fess
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="result-state result-state--failed">
              <XCircle :size="48" />
              <h2>{{ statusLabel }}</h2>
              <p>
                Pembayaran ini tidak berhasil. Tidak ada CTF yang ditambahkan. Kamu bisa membuat
                transaksi baru dengan metode lain.
              </p>
              <button type="button" class="topup-primary-btn" @click="topUpAgain">Coba lagi</button>
            </div>
          </template>
        </div>
      </div>

      <!-- PACKAGE + METHOD SELECTION -->
      <template v-else>
        <div class="flow-section">
          <div class="section-heading">
            <div>
              <h2>Pilih paket CTF</h2>
              <p>Semakin besar paketnya, semakin banyak bonus CTF.</p>
            </div>
            <span class="section-badge">Mulai Rp5.000</span>
          </div>

          <div class="package-grid" role="radiogroup" aria-label="Paket top-up CTF">
            <button
              v-for="pkg in packages"
              :key="pkg.code"
              type="button"
              role="radio"
              :aria-checked="selectedPackageCode === pkg.code"
              class="package-card"
              :class="{ selected: selectedPackageCode === pkg.code }"
              @click="selectedPackageCode = pkg.code"
            >
              <span v-if="bonusFor(pkg) > 0" class="package-bonus">
                +{{ bonusFor(pkg) }} bonus
              </span>
              <span class="package-ctf">{{ formatNumber(pkg.ctfAmount) }} <small>CTF</small></span>
              <span class="package-price">Rp{{ formatNumber(pkg.amountIdr) }}</span>
              <span class="package-desc">{{ pkg.description }}</span>
              <span v-if="selectedPackageCode === pkg.code" class="package-check">
                <Check :size="13" />
              </span>
            </button>
          </div>
        </div>

        <div class="flow-section">
          <div class="section-heading">
            <div>
              <h2>Metode pembayaran</h2>
              <p>Pilih yang paling mudah untukmu.</p>
            </div>
          </div>

          <div v-for="group in methodGroups" :key="group.key" class="method-group">
            <p class="method-group-label">{{ group.label }}</p>
            <div class="method-list" role="radiogroup" :aria-label="group.label">
              <button
                v-for="method in group.methods"
                :key="method.code"
                type="button"
                role="radio"
                :aria-checked="selectedMethod === method.code"
                class="method-row"
                :class="{ selected: selectedMethod === method.code }"
                @click="selectedMethod = method.code"
              >
                <span class="method-icon" :class="{ 'method-icon--qris': method.group === 'qris' }">
                  <img
                    v-if="logoForMethod(method)"
                    :src="logoForMethod(method)"
                    :alt="`Logo ${method.label}`"
                    class="method-logo"
                    loading="lazy"
                  />
                  <component v-else :is="iconForMethod(method)" :size="19" />
                </span>
                <span class="method-text">
                  <strong>{{ method.label }}</strong>
                  <small>{{ method.description }}</small>
                </span>
                <span class="method-radio" :class="{ checked: selectedMethod === method.code }">
                  <Check v-if="selectedMethod === method.code" :size="12" />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="checkout-card">
          <div class="checkout-row">
            <span>Paket</span>
            <strong>{{ selectedPackage?.name || '—' }}</strong>
          </div>
          <div class="checkout-row">
            <span>CTF diterima</span>
            <strong>{{ formatNumber(selectedPackage?.ctfAmount || 0) }} CTF</strong>
          </div>
          <div class="checkout-divider" />
          <div class="checkout-row checkout-total">
            <span>Total bayar</span>
            <strong>Rp{{ formatNumber(selectedPackage?.amountIdr || 0) }}</strong>
          </div>

          <p v-if="createError" class="form-error" role="alert">{{ createError }}</p>

          <button
            type="button"
            class="topup-primary-btn pay-btn"
            :disabled="creating || !selectedPackage"
            @click="createOrder"
          >
            <Loader2 v-if="creating" :size="16" class="spin" />
            <Lock v-else :size="15" />
            {{
              creating
                ? 'Membuat pembayaran...'
                : `Bayar Rp${formatNumber(selectedPackage?.amountIdr || 0)}`
            }}
          </button>
          <p class="secure-note">
            <ShieldCheck :size="13" />
            Pembayaran diproses Midtrans. Data pembayaran tidak disimpan di perangkat ini.
          </p>
        </div>
      </template>
    </template>

    <!-- TRANSACTION HISTORY -->
    <section ref="historyEl" class="history-section" aria-labelledby="topup-history-title">
      <div class="section-heading">
        <div>
          <h2 id="topup-history-title">Riwayat top-up</h2>
          <p>Transaksi terakhir akunmu.</p>
        </div>
        <button
          type="button"
          class="small-icon-btn"
          :disabled="historyLoading"
          @click="loadHistory"
        >
          <RefreshCw :size="15" :class="{ spin: historyLoading }" />
        </button>
      </div>

      <div v-if="historyLoading && !history.length" class="history-empty">
        <Loader2 :size="20" class="spin" /> Memuat riwayat...
      </div>
      <div v-else-if="historyError" class="history-empty history-empty--error">
        <p>{{ historyError }}</p>
        <button type="button" class="topup-secondary-btn" @click="loadHistory">Coba lagi</button>
      </div>
      <div v-else-if="!history.length" class="history-empty">
        <ReceiptText :size="28" />
        <p>Belum ada top-up. Transaksi pertamamu akan muncul di sini.</p>
      </div>
      <div v-else class="history-list">
        <button
          v-for="order in history"
          :key="order.order_id"
          type="button"
          class="history-row"
          @click="openHistoryOrder(order)"
        >
          <span class="history-icon" :class="`tone-${toneForStatus(order.status)}`">
            <component :is="iconForStatus(order.status)" :size="17" />
          </span>
          <span class="history-main">
            <span class="history-title">{{ order.package_name }}</span>
            <span class="history-sub"
              >{{ formatDate(order.created_at) }} ·
              {{ order.payment_method_label || order.payment_method }}</span
            >
          </span>
          <span class="history-amount">
            <strong>Rp{{ formatNumber(order.amount_idr) }}</strong>
            <small :class="`tone-${toneForStatus(order.status)}`">{{
              statusText(order.status)
            }}</small>
          </span>
          <ChevronRight :size="16" class="history-chevron" />
        </button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  ExternalLink,
  History,
  Landmark,
  Loader2,
  Lock,
  QrCode,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
} from 'lucide-vue-next';
import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { useAuthStore } from '../../stores/authStore';
import { formatNumber } from '../../utils/format';
import qrisLogo from '../../assets/payments/qris.svg';
import gopayLogo from '../../assets/payments/gopay.svg';
import shopeepayLogo from '../../assets/payments/shopeepay.svg';
import bcaLogo from '../../assets/payments/bca.svg';
import bniLogo from '../../assets/payments/bni.svg';
import briLogo from '../../assets/payments/bri.svg';
import permataLogo from '../../assets/payments/permata.svg';
import mandiriLogo from '../../assets/payments/mandiri.svg';

const METHOD_LOGOS = {
  qris: qrisLogo,
  gopay: gopayLogo,
  shopeepay: shopeepayLogo,
  bca_va: bcaLogo,
  bni_va: bniLogo,
  bri_va: briLogo,
  permata_va: permataLogo,
  mandiri_bill: mandiriLogo,
};

const props = defineProps({
  initialOrderId: { type: String, default: '' },
});

const emit = defineEmits(['completed']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const config = ref(null);
const configLoading = ref(true);
const configError = ref('');
const selectedPackageCode = ref('');
const selectedMethod = ref('qris');
const activeOrder = ref(null);
const creating = ref(false);
const checking = ref(false);
const createError = ref('');
const history = ref([]);
const historyLoading = ref(false);
const historyError = ref('');
const historyEl = ref(null);
const now = ref(Date.now());
const requestKey = ref('');

let pollTimer = null;
let clockTimer = null;
const notifiedPaidOrders = new Set();

const packages = computed(() => config.value?.packages || []);
const methods = computed(() => config.value?.methods || []);
const canTopUp = computed(() => Boolean(config.value?.enabled && config.value?.configured));
const selectedPackage = computed(
  () => packages.value.find((pkg) => pkg.code === selectedPackageCode.value) || null,
);
const balance = computed(() => Number(authStore.user?.balance || 0));
const balanceDisplay = computed(() => formatNumber(balance.value));

const methodGroups = computed(() => {
  const groups = [
    { key: 'qris', label: 'QRIS', methods: [] },
    { key: 'va', label: 'Transfer bank / Virtual Account', methods: [] },
    { key: 'ewallet', label: 'E-wallet', methods: [] },
  ];
  for (const method of methods.value) {
    const group = groups.find((item) => item.key === method.group);
    if (group) group.methods.push(method);
  }
  return groups.filter((group) => group.methods.length);
});

const instructions = computed(() => activeOrder.value?.instructions || null);
const isVaInstruction = computed(
  () => instructions.value?.type === 'va' || instructions.value?.type === 'mandiri_bill',
);
const bankLabel = computed(() => {
  const channel = String(activeOrder.value?.payment_channel || '').toUpperCase();
  const labels = {
    BCA: 'BCA',
    BNI: 'BNI',
    BRI: 'BRI',
    PERMATA: 'Permata',
    MANDIRI: 'Mandiri',
  };
  return labels[channel] || channel || 'Bank';
});
const ewalletLabel = computed(() => {
  const method = activeOrder.value?.payment_method;
  if (method === 'gopay') return 'GoPay';
  if (method === 'shopeepay') return 'ShopeePay';
  return 'pembayaran';
});
const qrImageUrl = computed(() => safeImageUrl(instructions.value?.qr_url || ''));
const safeDeeplink = computed(() => safeExternalUrl(instructions.value?.url || ''));
const statusTone = computed(() => toneForStatus(activeOrder.value?.status));
const statusLabel = computed(() => statusText(activeOrder.value?.status));
const countdown = computed(() => {
  const expiresAt = activeOrder.value?.expires_at;
  if (!expiresAt) return '';
  const diff = new Date(expiresAt).getTime() - now.value;
  if (!Number.isFinite(diff) || diff <= 0) return '';
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} jam ${minutes} menit`;
  if (minutes > 0) return `${minutes} menit ${seconds} detik`;
  return `${seconds} detik`;
});
const countdownUrgent = computed(() => {
  const expiresAt = activeOrder.value?.expires_at;
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - now.value;
  return diff > 0 && diff < 5 * 60 * 1000;
});

function newRequestKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `topup-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function bonusFor(pkg) {
  const base = Math.round((Number(pkg.amountIdr) / 5000) * 25);
  return Math.max(0, Number(pkg.ctfAmount) - base);
}

function logoForMethod(method) {
  return METHOD_LOGOS[method.code] || '';
}

function iconForMethod(method) {
  if (method.group === 'qris') return QrCode;
  if (method.group === 'ewallet') return Smartphone;
  return Landmark;
}

function toneForStatus(status) {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'pending';
  if (['failed', 'expired', 'chargeback'].includes(status)) return 'danger';
  if (['refunded', 'partial_refund'].includes(status)) return 'warning';
  return 'muted';
}

function statusText(status) {
  const labels = {
    pending: 'Menunggu pembayaran',
    paid: 'Berhasil',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
    refunded: 'Dikembalikan',
    partial_refund: 'Refund sebagian',
    chargeback: 'Chargeback',
  };
  return labels[status] || status || 'Tidak diketahui';
}

function iconForStatus(status) {
  if (status === 'paid') return CheckCircle2;
  if (status === 'pending') return Clock3;
  if (status === 'refunded' || status === 'partial_refund') return RefreshCw;
  return XCircle;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function safeImageUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function safeExternalUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const allowed = ['https:', 'gojek:', 'shopeeid:', 'shopee:'];
    return allowed.includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function errorMessage(error) {
  const code = error?.data?.code;
  switch (code) {
    case 'PAYMENTS_DISABLED':
      return 'Top up sedang dinonaktifkan sementara. Coba lagi nanti.';
    case 'PAYMENT_CONFIG_ERROR':
      return 'Pembayaran belum dikonfigurasi dengan benar. Hubungi admin platform.';
    case 'RATE_LIMIT_EXCEEDED':
    case 'PAYMENT_RATE_LIMITED':
      return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
    case 'EMAIL_NOT_VERIFIED':
      return 'Verifikasi email dulu sebelum melakukan top-up.';
    case 'EMAIL_REQUIRED':
      return 'Tambahkan email dan verifikasi akun sebelum top-up.';
    case 'IDEMPOTENCY_CONFLICT':
      return 'Permintaan sebelumnya berbeda. Silakan pilih paket dan metode lagi.';
    case 'UNKNOWN_PACKAGE':
    case 'UNKNOWN_PAYMENT_METHOD':
      return 'Paket atau metode pembayaran tidak tersedia. Muat ulang halaman.';
    default:
      return error?.message || 'Gagal membuat pembayaran. Coba lagi.';
  }
}

async function copyText(value) {
  const text = String(value || '').trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Nomor pembayaran disalin.');
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      toast.success('Nomor pembayaran disalin.');
    } catch {
      toast.error('Gagal menyalin. Salin manual dari layar.');
    } finally {
      area.remove();
    }
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling() {
  stopPolling();
  if (!activeOrder.value || activeOrder.value.status !== 'pending') return;
  pollTimer = window.setInterval(() => {
    if (!document.hidden) checkActiveOrder(true);
  }, 5000);
}

function handlePaid(order) {
  if (!order || notifiedPaidOrders.has(order.order_id)) return;
  notifiedPaidOrders.add(order.order_id);
  stopPolling();
  toast.success(`Pembayaran berhasil. ${formatNumber(order.ctf_amount)} CTF sudah masuk.`);
  authStore.fetchMe().catch(() => {});
  emit('completed', order);
  loadHistory();
}

function setActiveOrder(order) {
  const previous = activeOrder.value;
  activeOrder.value = order;
  if (!order) {
    stopPolling();
    return;
  }
  if (order.status === 'pending') startPolling();
  else stopPolling();
  if (order.status === 'paid') {
    // Credit the wallet immediately when this session saw the order go from
    // pending to paid, so the success panel never shows the pre-payment balance.
    // Opening an already-paid order must not add the CTF a second time.
    if (
      previous?.order_id === order.order_id &&
      previous.status === 'pending' &&
      !notifiedPaidOrders.has(order.order_id)
    ) {
      authStore.setWalletBalance(
        Number(authStore.user?.balance || 0) + Number(order.ctf_amount || 0),
      );
    }
    handlePaid(order);
  }
}

async function loadConfig() {
  configLoading.value = true;
  configError.value = '';
  try {
    const response = await api.getPaymentPackages();
    config.value = response;
    const available = response?.packages || [];
    if (!available.some((pkg) => pkg.code === selectedPackageCode.value)) {
      selectedPackageCode.value = available[0]?.code || '';
    }
    const availableMethods = response?.methods || [];
    if (!availableMethods.some((method) => method.code === selectedMethod.value)) {
      selectedMethod.value = availableMethods[0]?.code || 'qris';
    }

    const queryOrderId =
      props.initialOrderId ||
      (typeof route.query.order_id === 'string' ? route.query.order_id : '');
    if (queryOrderId) await openOrder(queryOrderId);
  } catch (error) {
    configError.value = error?.message || 'Gagal memuat paket top-up. Coba lagi.';
  } finally {
    configLoading.value = false;
  }
}

async function loadHistory() {
  historyLoading.value = true;
  historyError.value = '';
  try {
    const response = await api.getPaymentOrders({ limit: 10, offset: 0 });
    history.value = response?.data || [];
  } catch (error) {
    historyError.value = error?.message || 'Gagal memuat riwayat top-up.';
  } finally {
    historyLoading.value = false;
  }
}

async function createOrder() {
  if (!canTopUp.value || !selectedPackage.value || !selectedMethod.value || creating.value) return;
  creating.value = true;
  createError.value = '';

  try {
    if (!requestKey.value) requestKey.value = newRequestKey();
    const response = await api.createPaymentOrder(
      {
        package_code: selectedPackage.value.code,
        payment_method: selectedMethod.value,
      },
      requestKey.value,
    );
    requestKey.value = '';
    setActiveOrder(response.order);
    loadHistory();
  } catch (error) {
    createError.value = errorMessage(error);
    // A 4xx/503 means the request was rejected before a usable order existed.
    // Keep the key for network/5xx ambiguity so a retry cannot double-create.
    if (error?.status && error.status < 500) requestKey.value = '';
  } finally {
    creating.value = false;
  }
}

async function checkActiveOrder(silent = false) {
  if (!activeOrder.value || checking.value) return;
  checking.value = true;
  try {
    const order = await api.getPaymentOrder(activeOrder.value.order_id, { sync: true });
    setActiveOrder(order);
  } catch (error) {
    if (!silent) createError.value = errorMessage(error);
  } finally {
    checking.value = false;
  }
}

async function openOrder(orderId) {
  if (!orderId) return;
  try {
    const order = await api.getPaymentOrder(orderId, { sync: true });
    setActiveOrder(order);
  } catch (error) {
    createError.value = errorMessage(error);
  }
}

async function openHistoryOrder(order) {
  if (!order?.order_id) return;
  await openOrder(order.order_id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetOrder() {
  stopPolling();
  activeOrder.value = null;
  createError.value = '';
  requestKey.value = '';
}

function topUpAgain() {
  resetOrder();
  loadHistory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToHistory() {
  historyEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goCompose() {
  router.push('/create');
}

function onVisibilityChange() {
  if (!document.hidden && activeOrder.value?.status === 'pending') {
    checkActiveOrder(true);
  }
}

watch([selectedPackageCode, selectedMethod], () => {
  requestKey.value = '';
  createError.value = '';
});

onMounted(() => {
  loadConfig();
  loadHistory();
  clockTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onBeforeUnmount(() => {
  stopPolling();
  if (clockTimer) clearInterval(clockTimer);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>

<style scoped>
.topup-flow {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  font-family: var(--font-sans);
  color: var(--shell-text);
}

.wallet-hero {
  background:
    radial-gradient(circle at 85% 15%, rgba(205, 242, 43, 0.24), transparent 32%),
    linear-gradient(135deg, var(--brand-blue) 0%, #5520c9 100%);
  color: #fff;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 18px 34px rgba(17, 24, 39, 0.22);
}

.wallet-hero-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.wallet-eyebrow {
  margin: 0 0 6px;
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 1.1px;
  opacity: 0.78;
}

.wallet-balance {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.1;
}

.wallet-coin {
  color: var(--lime-primary);
  align-self: center;
}

.wallet-unit {
  font-size: 14px;
  font-weight: 800;
  opacity: 0.86;
}

.wallet-note {
  margin: 8px 0 0;
  max-width: 390px;
  font-size: 11.5px;
  line-height: 1.55;
  opacity: 0.82;
}

.wallet-history-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 7px 11px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
}

.wallet-trust-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.82;
}

.wallet-trust-row span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.wallet-trust-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.topup-state-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
  color: var(--shell-text-muted);
  font-size: 13px;
}

.topup-state-card p {
  margin: 0;
}

.topup-state-card--error {
  color: var(--danger-text);
  border-color: rgba(239, 68, 68, 0.3);
}

.topup-state-card--locked {
  align-items: flex-start;
  color: var(--shell-text);
}

.topup-state-card--locked > svg {
  color: var(--warning-text);
  flex-shrink: 0;
  margin-top: 2px;
}

.topup-state-card--locked h2 {
  margin: 0 0 5px;
  font-size: 15px;
  font-weight: 900;
}

.topup-state-card--locked p {
  color: var(--shell-text-muted);
  line-height: 1.55;
}

.flow-section,
.payment-panel,
.checkout-card,
.history-section {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 18px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-text);
}

.section-heading p {
  margin: 4px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--shell-text-muted);
}

.section-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(205, 242, 43, 0.12);
  color: var(--lime-text);
  font-size: 10.5px;
  font-weight: 900;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
}

.package-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 126px;
  padding: 14px;
  border: 1px solid var(--shell-border);
  border-radius: 15px;
  background: var(--shell-bg);
  color: var(--shell-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.package-card:hover {
  transform: translateY(-1px);
  border-color: var(--shell-border-strong);
}

.package-card.selected {
  border-color: var(--shell-accent);
  background: rgba(205, 242, 43, 0.08);
  box-shadow: 0 0 0 1px var(--shell-accent);
}

.package-bonus {
  align-self: flex-start;
  margin-bottom: 2px;
  border-radius: 999px;
  padding: 3px 7px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.package-ctf {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.4px;
}

.package-ctf small {
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.package-price {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--lime-text);
}

.package-desc {
  margin-top: 2px;
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--shell-text-muted);
}

.package-check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
}

.method-group + .method-group {
  margin-top: 15px;
}

.method-group-label {
  margin: 0 0 7px;
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--shell-text-dim);
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 11px;
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  background: transparent;
  color: var(--shell-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;
}

.method-row:hover {
  background: var(--shell-chip);
}

.method-row.selected {
  border-color: var(--shell-accent);
  background: rgba(205, 242, 43, 0.07);
}

.method-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 38px;
  padding: 5px 6px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: #fff;
  color: #111;
  flex-shrink: 0;
}

.method-icon--qris {
  width: 72px;
}

.method-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.method-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.method-text strong {
  font-size: 12.5px;
  font-weight: 800;
}

.method-text small {
  font-size: 10.5px;
  line-height: 1.35;
  color: var(--shell-text-muted);
}

.method-radio {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--shell-border-strong);
  border-radius: 50%;
  flex-shrink: 0;
  color: var(--shell-accent-ink);
}

.method-radio.checked {
  border-color: var(--shell-accent);
  background: var(--shell-accent);
}

.checkout-card {
  padding: 18px;
}

.checkout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--shell-text-muted);
}

.checkout-row strong {
  font-size: 12.5px;
  color: var(--shell-text);
}

.checkout-divider {
  height: 1px;
  background: var(--shell-border);
  margin: 10px 0;
}

.checkout-total span {
  font-weight: 800;
  color: var(--shell-text);
}

.checkout-total strong {
  font-size: 19px;
  font-weight: 900;
  color: var(--lime-text);
}

.topup-primary-btn,
.topup-secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 10px 15px;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 900;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.topup-primary-btn {
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
}

.topup-primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.topup-primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.topup-secondary-btn {
  background: var(--shell-chip);
  color: var(--shell-text);
  border: 1px solid var(--shell-border);
}

.pay-btn {
  width: 100%;
  margin-top: 12px;
  min-height: 44px;
}

.secure-note {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  margin: 9px 0 0;
  font-size: 10px;
  line-height: 1.45;
  color: var(--shell-text-dim);
  text-align: center;
}

.form-error {
  margin: 10px 0 0;
  padding: 9px 11px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-text);
  font-size: 11.5px;
  line-height: 1.45;
}

.payment-panel {
  padding: 16px;
}

.payment-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.payment-panel-kicker {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
  color: var(--shell-text-dim);
}

.small-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  padding: 2px 0;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

.status-pill {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.status-pill.is-pending {
  background: rgba(245, 158, 11, 0.14);
  color: var(--warning-text);
}
.status-pill.is-success {
  background: rgba(34, 197, 94, 0.14);
  color: var(--success-text);
}
.status-pill.is-danger {
  background: rgba(239, 68, 68, 0.14);
  color: var(--danger-text);
}
.status-pill.is-warning {
  background: rgba(245, 158, 11, 0.14);
  color: var(--warning-text);
}
.status-pill.is-muted {
  background: var(--shell-chip);
  color: var(--shell-text-muted);
}

.payment-amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--shell-border);
}

.payment-label {
  margin: 0 0 2px;
  font-size: 11px;
  color: var(--shell-text-muted);
}

.payment-total {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.4px;
}

.payment-ctf-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
  border-radius: 12px;
  padding: 9px 11px;
  background: rgba(205, 242, 43, 0.12);
  color: var(--lime-text);
  font-weight: 900;
  white-space: nowrap;
}

.payment-ctf-box span {
  font-size: 18px;
}

.payment-ctf-box small {
  font-size: 9px;
  font-weight: 900;
}

.payment-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.payment-expiry.is-urgent {
  color: var(--warning-text);
}

.instruction-block {
  margin-top: 16px;
  border-radius: 15px;
  padding: 15px;
  background: var(--shell-bg);
  border: 1px solid var(--shell-border);
}

.instruction-title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 900;
}

.instruction-desc {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--shell-text-muted);
}

.instruction-desc--warning {
  margin-top: 10px;
  color: var(--warning-text);
}

.qr-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(230px, 100%);
  margin: 14px auto;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  min-height: 210px;
}

.qr-frame img {
  display: block;
  width: 100%;
  height: auto;
}

.qr-fallback {
  color: #0b0d14;
}

.copy-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  border-radius: 10px;
  background: var(--shell-chip);
  padding: 8px 9px;
}

.copy-row code {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 10px;
  color: var(--shell-text-muted);
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--lime-text);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.pay-code-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 12px;
}

.pay-code-card,
.va-card {
  border-radius: 12px;
  background: var(--shell-chip);
  padding: 11px;
}

.pay-code-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pay-code-card span,
.va-bank {
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pay-code-card strong,
.va-card strong {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0.4px;
  overflow-wrap: anywhere;
}

.pay-code-card .copy-btn {
  align-self: flex-start;
  padding: 0;
}

.va-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.va-card strong {
  font-size: 18px;
}

.va-card .copy-btn {
  margin-left: auto;
}

.payment-actions {
  margin-top: 15px;
}

.payment-actions .topup-primary-btn {
  width: 100%;
}

.poll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 9px 0 0;
  font-size: 10px;
  color: var(--shell-text-dim);
  text-align: center;
  line-height: 1.45;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success-text);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14);
  flex-shrink: 0;
}

.result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 14px 6px 4px;
}

.result-state h2 {
  margin: 10px 0 5px;
  font-size: 18px;
  font-weight: 900;
}

.result-state p {
  max-width: 380px;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--shell-text-muted);
}

.result-state--success > svg {
  color: var(--success-text);
}

.result-state--failed > svg {
  color: var(--danger-text);
}

.result-balance {
  margin-top: 12px;
  border-radius: 999px;
  padding: 7px 12px;
  background: rgba(34, 197, 94, 0.12);
  color: var(--success-text);
  font-size: 11px;
  font-weight: 900;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.result-state--failed .topup-primary-btn {
  margin-top: 15px;
}

.history-section {
  padding: 18px;
}

.small-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--shell-border);
  background: transparent;
  color: var(--shell-text-muted);
  cursor: pointer;
}

.small-icon-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 96px;
  border-radius: 13px;
  border: 1px dashed var(--shell-border);
  color: var(--shell-text-dim);
  font-size: 11.5px;
  text-align: center;
  padding: 14px;
}

.history-empty p {
  margin: 0;
}

.history-empty--error {
  color: var(--danger-text);
}

.history-empty .topup-secondary-btn {
  margin-top: 4px;
  min-height: 32px;
  padding: 6px 11px;
  font-size: 11px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--shell-bg);
  padding: 9px 10px;
  color: var(--shell-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.history-row:hover {
  border-color: var(--shell-border-strong);
}

.history-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  border-radius: 10px;
  flex-shrink: 0;
  background: var(--shell-chip);
}

.history-icon.tone-success {
  color: var(--success-text);
  background: rgba(34, 197, 94, 0.12);
}
.history-icon.tone-pending {
  color: var(--warning-text);
  background: rgba(245, 158, 11, 0.12);
}
.history-icon.tone-danger {
  color: var(--danger-text);
  background: rgba(239, 68, 68, 0.12);
}
.history-icon.tone-warning {
  color: var(--warning-text);
  background: rgba(245, 158, 11, 0.12);
}

.history-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.history-title {
  font-size: 12px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-sub {
  font-size: 9.5px;
  color: var(--shell-text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

.history-amount strong {
  font-size: 11.5px;
  font-weight: 900;
}

.history-amount small {
  font-size: 9px;
  font-weight: 800;
}

.history-amount small.tone-success {
  color: var(--success-text);
}
.history-amount small.tone-pending {
  color: var(--warning-text);
}
.history-amount small.tone-danger {
  color: var(--danger-text);
}
.history-amount small.tone-warning {
  color: var(--warning-text);
}
.history-amount small.tone-muted {
  color: var(--shell-text-dim);
}

.history-chevron {
  color: var(--shell-text-dim);
  flex-shrink: 0;
}

.spin {
  animation: topup-spin 0.9s linear infinite;
}

@keyframes topup-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 520px) {
  .wallet-hero {
    padding: 18px;
  }
  .wallet-balance {
    font-size: 29px;
  }
  .wallet-history-link {
    padding: 6px 9px;
  }
  .package-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .package-card {
    min-height: 118px;
    padding: 12px;
  }
  .package-ctf {
    font-size: 19px;
  }
  .pay-code-grid {
    grid-template-columns: 1fr;
  }
  .history-sub {
    max-width: 155px;
  }
}
</style>
