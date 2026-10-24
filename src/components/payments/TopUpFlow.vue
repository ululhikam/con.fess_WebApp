<template>
  <section
    class="topup-flow"
    :class="{ 'has-mobile-checkout': showMobileCheckout }"
    aria-label="Saldo dan top up CTF"
  >
    <div class="wallet-hero">
      <div class="wallet-hero-main">
        <div class="wallet-hero-copy">
          <p class="wallet-eyebrow">
            <span class="wallet-status-dot" aria-hidden="true"></span>Saldo tersedia
          </p>
          <div class="wallet-balance">
            <span class="wallet-coin" aria-hidden="true"><Coins :size="25" /></span>
            <span class="wallet-balance-value">{{ balanceDisplay }}</span>
            <span class="wallet-unit">CTF</span>
          </div>
          <p class="wallet-note">1 CTF = 1 fess reguler. CTF tidak dapat dicairkan menjadi uang.</p>
        </div>
        <button
          type="button"
          class="wallet-history-link"
          aria-label="Lihat riwayat top-up"
          @click="scrollToHistory"
        >
          <History :size="15" />
          <span>Riwayat</span>
        </button>
      </div>
      <div class="wallet-trust-row">
        <span><ShieldCheck :size="14" /> Pembayaran aman via Midtrans</span>
        <span class="wallet-trust-dot" aria-hidden="true"></span>
        <span><Lock :size="13" /> Data transaksi terlindungi</span>
        <span class="wallet-trust-dot" aria-hidden="true"></span>
        <span>Tanpa kartu kredit</span>
      </div>
    </div>

    <div v-if="configLoading" class="state-panel" role="status" aria-live="polite">
      <span class="state-panel-icon" aria-hidden="true"><Loader2 :size="22" class="spin" /></span>
      <div>
        <h2>Menyiapkan top-up</h2>
        <p>Memuat paket CTF dan metode pembayaran yang tersedia.</p>
      </div>
    </div>

    <div v-else-if="configError" class="state-panel state-panel--error" role="alert">
      <span class="state-panel-icon" aria-hidden="true"><AlertTriangle :size="22" /></span>
      <div>
        <h2>Paket belum bisa dimuat</h2>
        <p>{{ configError }}</p>
        <button type="button" class="topup-secondary-btn state-panel-action" @click="loadConfig">
          Coba lagi
        </button>
      </div>
    </div>

    <div v-else-if="!canTopUp && !activeOrder" class="state-panel state-panel--locked">
      <span class="state-panel-icon" aria-hidden="true"><Lock :size="24" /></span>
      <div>
        <h2>Top up belum dibuka</h2>
        <p v-if="!config?.configured">
          Konfigurasi pembayaran Midtrans di server belum lengkap. Hubungi admin platform.
        </p>
        <p v-else>
          Pembelian CTF sedang dinonaktifkan sementara. Saldo dan riwayat tetap dapat kamu lihat.
        </p>
      </div>
    </div>

    <template v-else>
      <!-- ACTIVE ORDER / PAYMENT INSTRUCTIONS -->
      <div v-if="activeOrder" class="payment-panel">
        <div class="payment-panel-head">
          <button
            v-if="activeOrder.status === 'pending'"
            type="button"
            class="small-back-btn"
            @click="resetOrder"
          >
            <ArrowLeft :size="16" /> Ganti metode
          </button>
          <span v-else class="payment-panel-kicker">Detail transaksi</span>
          <span class="status-pill" :class="`is-${statusTone}`" role="status" aria-live="polite">
            {{ statusLabel }}
          </span>
        </div>

        <div class="payment-panel-body">
          <div class="payment-summary">
            <div class="payment-summary-main">
              <span v-if="activeMethod" class="payment-method-tag">
                <span class="payment-method-logo">
                  <img
                    v-if="logoForMethod(activeMethod)"
                    :src="logoForMethod(activeMethod)"
                    alt=""
                    aria-hidden="true"
                  />
                  <component v-else :is="iconForMethod(activeMethod)" :size="15" />
                </span>
                {{ activeOrder.payment_method_label || activeMethod.label }}
              </span>
              <p class="payment-package">{{ activeOrder.package_name }}</p>
              <p class="payment-order-id">Order {{ activeOrder.order_id }}</p>
            </div>
            <div class="payment-summary-value">
              <span class="payment-label">Total pembayaran</span>
              <p class="payment-total">Rp{{ formatNumber(activeOrder.amount_idr) }}</p>
              <span class="payment-ctf-box">+{{ formatNumber(activeOrder.ctf_amount) }} CTF</span>
            </div>
          </div>

          <p v-if="createError" class="form-error payment-error" role="alert">
            {{ createError }}
          </p>

          <template v-if="activeOrder.status === 'pending'">
            <div class="payment-expiry" :class="{ 'is-urgent': countdownUrgent }">
              <span class="payment-expiry-icon" aria-hidden="true"><Clock3 :size="16" /></span>
              <div class="payment-expiry-copy">
                <span>Selesaikan pembayaran</span>
                <strong v-if="countdown">{{ countdown }}</strong>
                <strong v-else>Menunggu pembayaran</strong>
              </div>
              <span class="live-dot" aria-hidden="true"></span>
            </div>

            <!-- QRIS -->
            <div v-if="instructions?.type === 'qris'" class="instruction-block instruction-qris">
              <div class="instruction-head">
                <span class="instruction-icon" aria-hidden="true"><QrCode :size="18" /></span>
                <div>
                  <p class="instruction-title">Scan QRIS</p>
                  <p class="instruction-desc">
                    Buka e-wallet atau m-banking yang mendukung QRIS, lalu scan kode di bawah.
                  </p>
                </div>
              </div>
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
                <button
                  type="button"
                  class="copy-btn"
                  aria-label="Salin kode QRIS"
                  @click="copyText(instructions.qr_string)"
                >
                  <Copy :size="14" /> Salin
                </button>
              </div>
              <p v-else-if="!qrImageUrl" class="instruction-desc instruction-desc--warning">
                Instruksi QR belum tersedia. Tekan tombol cek status di bawah.
              </p>
              <p class="instruction-footnote">
                Pastikan nominal sesuai. Status pembayaran diperbarui otomatis.
              </p>
            </div>

            <!-- Virtual Account / Mandiri Bill -->
            <div v-else-if="isVaInstruction" class="instruction-block">
              <div class="instruction-head">
                <span class="instruction-icon" aria-hidden="true"><Landmark :size="18" /></span>
                <div>
                  <p class="instruction-title">
                    {{
                      instructions.type === 'mandiri_bill'
                        ? 'Mandiri Bill Payment'
                        : 'Virtual Account'
                    }}
                  </p>
                  <p class="instruction-desc">
                    {{
                      instructions.type === 'mandiri_bill'
                        ? "Buka Livin' atau ATM Mandiri, pilih Bayar, lalu masukkan kode biller dan kode bayar."
                        : `Buka aplikasi ${bankLabel} atau ATM, pilih Transfer / Virtual Account, lalu masukkan nomor di bawah.`
                    }}
                  </p>
                </div>
              </div>

              <div v-if="instructions.type === 'mandiri_bill'" class="pay-code-grid">
                <div class="pay-code-card">
                  <span>Kode Biller</span>
                  <strong>{{ instructions.biller_code || '—' }}</strong>
                  <button
                    v-if="instructions.biller_code"
                    type="button"
                    class="copy-btn"
                    aria-label="Salin kode biller"
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
                    aria-label="Salin kode bayar"
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
                  aria-label="Salin nomor virtual account"
                  @click="copyText(instructions.va_number)"
                >
                  <Copy :size="13" /> Salin
                </button>
              </div>
              <p class="instruction-footnote">
                Nominal tidak perlu ditambah biaya. Sistem akan memverifikasi pembayaran secara
                otomatis.
              </p>
            </div>

            <!-- E-wallet deeplink -->
            <div v-else-if="instructions?.type === 'deeplink'" class="instruction-block">
              <div class="instruction-head">
                <span class="instruction-icon" aria-hidden="true"><Smartphone :size="18" /></span>
                <div>
                  <p class="instruction-title">Lanjutkan di aplikasi {{ ewalletLabel }}</p>
                  <p class="instruction-desc">
                    Tekan tombol di bawah untuk membuka aplikasi pembayaran. Setelah selesai,
                    kembali ke halaman ini; status akan diperbarui otomatis.
                  </p>
                </div>
              </div>
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
              <p class="instruction-footnote">
                Jangan menutup halaman ini sebelum pembayaran selesai.
              </p>
            </div>

            <div v-else class="instruction-block">
              <div class="instruction-head">
                <span class="instruction-icon" aria-hidden="true"><ReceiptText :size="18" /></span>
                <div>
                  <p class="instruction-title">Instruksi pembayaran</p>
                  <p class="instruction-desc">
                    Instruksi belum tersedia dari penyedia pembayaran. Tekan cek status untuk memuat
                    pembayaran terbaru.
                  </p>
                </div>
              </div>
            </div>

            <div class="payment-actions">
              <button
                type="button"
                class="topup-primary-btn"
                :disabled="checking"
                @click="checkActiveOrder(false)"
              >
                <RefreshCw :size="15" :class="{ spin: checking }" />
                {{ checking ? 'Memeriksa status...' : 'Cek status pembayaran' }}
              </button>
              <p class="poll-hint">
                <span class="live-dot" aria-hidden="true"></span>
                Status diperbarui otomatis setiap 5 detik. Jangan tutup halaman ini.
              </p>
            </div>
          </template>

          <template v-else-if="activeOrder.status === 'paid'">
            <div class="result-state result-state--success">
              <span class="result-icon" aria-hidden="true"><CheckCircle2 :size="34" /></span>
              <p class="result-kicker">Pembayaran berhasil</p>
              <h2>Saldo CTF sudah bertambah</h2>
              <p>
                {{ formatNumber(activeOrder.ctf_amount) }} CTF sudah masuk ke saldo kamu. Gunakan
                saldo ini untuk mengirim fess kapan saja.
              </p>
              <div class="result-receipt">
                <div>
                  <span>Paket</span>
                  <strong>{{ activeOrder.package_name }}</strong>
                </div>
                <div>
                  <span>CTF masuk</span>
                  <strong class="is-positive"
                    >+{{ formatNumber(activeOrder.ctf_amount) }} CTF</strong
                  >
                </div>
                <div>
                  <span>Total bayar</span>
                  <strong>Rp{{ formatNumber(activeOrder.amount_idr) }}</strong>
                </div>
              </div>
              <div class="result-balance">Saldo sekarang: {{ balanceDisplay }} CTF</div>
              <p class="result-order">Order {{ activeOrder.order_id }}</p>
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
            <div class="result-state" :class="`result-state--${inactiveTone}`">
              <span class="result-icon" aria-hidden="true">
                <component :is="inactiveIcon" :size="32" />
              </span>
              <p class="result-kicker">{{ inactiveCopy.kicker }}</p>
              <h2>{{ inactiveCopy.title }}</h2>
              <p>{{ inactiveCopy.body }}</p>
              <p class="result-order">Order {{ activeOrder.order_id }}</p>
              <button type="button" class="topup-primary-btn" @click="topUpAgain">
                {{ inactiveCopy.action }}
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- PACKAGE + METHOD SELECTION -->
      <template v-else>
        <div class="topup-selection">
          <div class="topup-layout">
            <div class="topup-main">
              <section class="flow-section" aria-labelledby="topup-package-title">
                <div class="section-heading">
                  <div>
                    <p class="section-step">Langkah 1</p>
                    <h2 id="topup-package-title">Pilih paket CTF</h2>
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
                    :class="{
                      selected: selectedPackageCode === pkg.code,
                      'package-card--featured': bestValueCode === pkg.code,
                    }"
                    @click="selectedPackageCode = pkg.code"
                  >
                    <span class="package-card-top">
                      <span class="package-name">{{ pkg.name }}</span>
                      <span v-if="bestValueCode === pkg.code" class="package-best">
                        Paling hemat
                      </span>
                      <span v-if="selectedPackageCode === pkg.code" class="package-check">
                        <Check :size="13" />
                      </span>
                    </span>
                    <span class="package-pricing">
                      <span class="package-ctf"
                        >{{ formatNumber(pkg.ctfAmount) }} <small>CTF</small></span
                      >
                      <span class="package-price">Rp{{ formatNumber(pkg.amountIdr) }}</span>
                    </span>
                    <span class="package-desc">{{ pkg.description }}</span>
                    <span v-if="bonusFor(pkg) > 0" class="package-bonus">
                      Bonus +{{ bonusFor(pkg) }} CTF
                    </span>
                  </button>
                </div>
              </section>

              <section class="flow-section" aria-labelledby="topup-method-title">
                <div class="section-heading">
                  <div>
                    <p class="section-step">Langkah 2</p>
                    <h2 id="topup-method-title">Pilih metode pembayaran</h2>
                    <p>Pilih cara bayar yang paling nyaman untukmu.</p>
                  </div>
                </div>

                <div v-for="group in methodGroups" :key="group.key" class="method-group">
                  <div class="method-group-head">
                    <span class="method-group-icon" aria-hidden="true">
                      <component :is="iconForGroup(group.key)" :size="15" />
                    </span>
                    <p class="method-group-label">{{ group.label }}</p>
                    <span class="method-group-count">{{ group.methods.length }} metode</span>
                  </div>
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
                      <span
                        class="method-icon"
                        :class="{ 'method-icon--qris': method.group === 'qris' }"
                      >
                        <img
                          v-if="logoForMethod(method)"
                          :src="logoForMethod(method)"
                          alt=""
                          aria-hidden="true"
                          class="method-logo"
                          loading="lazy"
                        />
                        <component v-else :is="iconForMethod(method)" :size="19" />
                      </span>
                      <span class="method-text">
                        <strong>{{ method.label }}</strong>
                        <small>{{ method.description }}</small>
                      </span>
                      <span
                        class="method-radio"
                        :class="{ checked: selectedMethod === method.code }"
                      >
                        <Check v-if="selectedMethod === method.code" :size="12" />
                      </span>
                    </button>
                  </div>
                </div>

                <p class="method-footnote">
                  <ShieldCheck :size="14" />
                  Pembayaran diproses oleh Midtrans dan tidak disimpan di perangkat ini.
                </p>
              </section>
            </div>

            <aside class="topup-aside" aria-label="Ringkasan pembayaran">
              <div class="checkout-card">
                <div class="checkout-head">
                  <span class="checkout-head-icon" aria-hidden="true"
                    ><ReceiptText :size="16"
                  /></span>
                  <div>
                    <h2>Ringkasan pembayaran</h2>
                    <p>Periksa detail sebelum melanjutkan.</p>
                  </div>
                </div>

                <div class="checkout-package">
                  <div class="checkout-package-copy">
                    <span>Paket dipilih</span>
                    <strong>{{ selectedPackage?.name || 'Belum dipilih' }}</strong>
                  </div>
                  <span class="checkout-ctf">
                    {{ formatNumber(selectedPackage?.ctfAmount || 0) }} CTF
                  </span>
                </div>

                <div class="checkout-list">
                  <div v-if="selectedBonus > 0" class="checkout-row">
                    <span>Bonus</span>
                    <strong class="is-positive">+{{ selectedBonus }} CTF</strong>
                  </div>
                  <div class="checkout-row">
                    <span>Metode</span>
                    <strong class="checkout-method">{{ selectedMethodLabel }}</strong>
                  </div>
                  <div class="checkout-row">
                    <span>Biaya layanan</span>
                    <strong class="is-positive">Gratis</strong>
                  </div>
                </div>

                <div class="checkout-divider" />
                <div class="checkout-total">
                  <span>Total bayar</span>
                  <strong>Rp{{ formatNumber(selectedPackage?.amountIdr || 0) }}</strong>
                </div>
                <p class="checkout-hint">
                  Saldo CTF ditambahkan otomatis setelah pembayaran terverifikasi.
                </p>

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
                  Dengan melanjutkan, kamu menyetujui harga paket yang tertera. Tidak ada biaya
                  tersembunyi.
                </p>
              </div>

              <div class="checkout-assurance">
                <div class="assurance-item">
                  <span class="assurance-icon" aria-hidden="true"><ShieldCheck :size="15" /></span>
                  <div>
                    <strong>Pembayaran aman</strong>
                    <span>Diproses oleh Midtrans.</span>
                  </div>
                </div>
                <div class="assurance-item">
                  <span class="assurance-icon" aria-hidden="true"><RefreshCw :size="15" /></span>
                  <div>
                    <strong>Saldo masuk otomatis</strong>
                    <span>CTF ditambahkan setelah pembayaran terverifikasi.</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div class="mobile-checkout-bar">
            <div class="mobile-checkout-info">
              <span>{{ selectedPackage?.name || 'Pilih paket' }}</span>
              <strong>Rp{{ formatNumber(selectedPackage?.amountIdr || 0) }}</strong>
            </div>
            <button
              type="button"
              class="topup-primary-btn"
              :disabled="creating || !selectedPackage"
              @click="createOrder"
            >
              <Loader2 v-if="creating" :size="15" class="spin" />
              {{ creating ? 'Memproses...' : 'Bayar sekarang' }}
            </button>
          </div>
        </div>
      </template>
    </template>

    <!-- TRANSACTION HISTORY -->
    <section ref="historyEl" class="history-section" aria-labelledby="topup-history-title">
      <div class="section-heading">
        <div>
          <p class="section-step">Aktivitas</p>
          <h2 id="topup-history-title">Riwayat top-up</h2>
          <p>Transaksi terakhir akunmu.</p>
        </div>
        <button
          type="button"
          class="small-icon-btn"
          :disabled="historyLoading"
          aria-label="Muat ulang riwayat top-up"
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
        <span class="history-empty-icon" aria-hidden="true"><ReceiptText :size="24" /></span>
        <div>
          <strong>Belum ada transaksi</strong>
          <p>Top-up pertamamu akan muncul di sini.</p>
        </div>
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
            <span class="history-title-row">
              <span class="history-title">{{ order.package_name }}</span>
              <span class="history-ctf">+{{ formatNumber(order.ctf_amount) }} CTF</span>
            </span>
            <span class="history-sub">
              {{ formatDate(order.created_at) }} ·
              {{ compactMethodLabel(order.payment_method_label || order.payment_method) }}
            </span>
          </span>
          <span class="history-amount">
            <strong>Rp{{ formatNumber(order.amount_idr) }}</strong>
            <small class="history-status" :class="`tone-${toneForStatus(order.status)}`">
              {{ statusText(order.status) }}
            </small>
          </span>
          <ChevronRight :size="16" class="history-chevron" />
        </button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  ShieldAlert,
  ShieldCheck,
  Smartphone,
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
const selectedMethodData = computed(
  () => methods.value.find((method) => method.code === selectedMethod.value) || null,
);
const selectedMethodLabel = computed(() => selectedMethodData.value?.label || 'Pilih metode');
const selectedBonus = computed(() => (selectedPackage.value ? bonusFor(selectedPackage.value) : 0));
const showMobileCheckout = computed(
  () =>
    canTopUp.value &&
    !configLoading.value &&
    !configError.value &&
    !activeOrder.value &&
    Boolean(selectedPackage.value),
);
const bestValueCode = computed(() => {
  let best = null;
  for (const pkg of packages.value) {
    const amount = Number(pkg.amountIdr);
    const ctf = Number(pkg.ctfAmount);
    if (!amount || !ctf) continue;
    const ratio = ctf / amount;
    if (!best || ratio > best.ratio) best = { code: pkg.code, ratio };
  }
  return best?.code || '';
});
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
const activeMethod = computed(
  () => methods.value.find((method) => method.code === activeOrder.value?.payment_method) || null,
);
const isVaInstruction = computed(
  () => instructions.value?.type === 'va' || instructions.value?.type === 'mandiri_bill',
);
const bankLabel = computed(() => {
  const channel = String(
    activeOrder.value?.payment_channel || instructions.value?.bank || '',
  ).toUpperCase();
  const labels = {
    BCA: 'BCA',
    BNI: 'BNI',
    BRI: 'BRI',
    PERMATA: 'Permata',
    MANDIRI: 'Mandiri',
  };
  const fallback = String(activeOrder.value?.payment_method_label || '')
    .replace(/ Virtual Account/i, '')
    .replace(/ Bill Payment/i, '')
    .trim();
  return labels[channel] || channel || fallback || 'bank';
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
const inactiveCopy = computed(() => {
  const status = activeOrder.value?.status;
  if (status === 'refunded' || status === 'partial_refund') {
    return {
      kicker: status === 'partial_refund' ? 'Refund sebagian' : 'Pembayaran dikembalikan',
      title:
        status === 'partial_refund'
          ? 'Sebagian dana sudah dikembalikan'
          : 'Dana sudah dikembalikan',
      body: 'CTF dari transaksi ini tidak ditarik otomatis. Tim admin akan meninjau saldo bila diperlukan.',
      action: 'Buat top-up baru',
    };
  }
  if (status === 'chargeback') {
    return {
      kicker: 'Pembayaran dibatalkan',
      title: 'Transaksi dibatalkan oleh bank',
      body: 'Saldo CTF dari transaksi ini dapat ditinjau oleh admin. Buat transaksi baru jika kamu tetap ingin top-up.',
      action: 'Buat top-up baru',
    };
  }
  if (status === 'expired') {
    return {
      kicker: 'Waktu habis',
      title: 'Pembayaran kedaluwarsa',
      body: 'Batas waktu pembayaran telah berakhir dan tidak ada CTF yang ditambahkan. Silakan buat transaksi baru.',
      action: 'Coba lagi',
    };
  }
  return {
    kicker: 'Transaksi gagal',
    title: 'Pembayaran tidak berhasil',
    body: 'Tidak ada CTF yang ditambahkan. Kamu dapat membuat transaksi baru dengan metode pembayaran lain.',
    action: 'Coba lagi',
  };
});
const inactiveTone = computed(() => {
  const status = activeOrder.value?.status;
  return ['chargeback', 'failed'].includes(status) ? 'danger' : 'warning';
});
const inactiveIcon = computed(() => {
  const status = activeOrder.value?.status;
  if (status === 'refunded' || status === 'partial_refund') return RefreshCw;
  if (status === 'expired') return Clock3;
  if (status === 'chargeback') return ShieldAlert;
  return XCircle;
});
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
  return method ? METHOD_LOGOS[method.code] || '' : '';
}

function iconForMethod(method) {
  if (method?.group === 'qris') return QrCode;
  if (method?.group === 'ewallet') return Smartphone;
  return Landmark;
}

function iconForGroup(groupKey) {
  if (groupKey === 'qris') return QrCode;
  if (groupKey === 'ewallet') return Smartphone;
  return Landmark;
}

function toneForStatus(status) {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'pending';
  if (['failed', 'chargeback'].includes(status)) return 'danger';
  if (['refunded', 'partial_refund', 'expired'].includes(status)) return 'warning';
  return 'muted';
}

function compactMethodLabel(value) {
  return String(value || '')
    .replace(/ Virtual Account/gi, ' VA')
    .replace(/ Bill Payment/gi, ' Bill');
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
  if (status === 'pending' || status === 'expired') return Clock3;
  if (status === 'refunded' || status === 'partial_refund') return RefreshCw;
  if (status === 'chargeback') return ShieldAlert;
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

function handlePaid(order, { notify = true } = {}) {
  if (!order || notifiedPaidOrders.has(order.order_id)) return;
  notifiedPaidOrders.add(order.order_id);
  stopPolling();
  if (notify)
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
    const becamePaid =
      previous?.order_id === order.order_id &&
      previous.status === 'pending' &&
      !notifiedPaidOrders.has(order.order_id);
    // Credit the wallet immediately when this session saw the order go from
    // pending to paid, so the success panel never shows the pre-payment balance.
    // Opening an already-paid order must not add the CTF a second time.
    if (becamePaid) {
      authStore.setWalletBalance(
        Number(authStore.user?.balance || 0) + Number(order.ctf_amount || 0),
      );
    }
    handlePaid(order, { notify: becamePaid });
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
    nextTick(scrollToPaymentPanel);
    loadHistory();
  } catch (error) {
    const message = errorMessage(error);
    createError.value = message;
    toast.error(message);
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
  createError.value = '';
  try {
    const order = await api.getPaymentOrder(activeOrder.value.order_id, { sync: true });
    setActiveOrder(order);
  } catch (error) {
    if (!silent) {
      const message = errorMessage(error);
      createError.value = message;
      toast.error(message);
    }
  } finally {
    checking.value = false;
  }
}

async function openOrder(orderId) {
  if (!orderId) return;
  createError.value = '';
  try {
    const order = await api.getPaymentOrder(orderId, { sync: true });
    setActiveOrder(order);
  } catch (error) {
    createError.value = errorMessage(error);
    toast.error(createError.value);
  }
}

async function openHistoryOrder(order) {
  if (!order?.order_id) return;
  await openOrder(order.order_id);
  nextTick(scrollToPaymentPanel);
}

function scrollToPaymentPanel() {
  const target = document.querySelector('.payment-panel');
  if (!target) return;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
  --wallet-inset: var(--bg-surface-2);
  --wallet-card: var(--shell-card);
  --wallet-radius: 20px;
  --wallet-shadow: 0 18px 38px -32px rgba(2, 8, 30, 0.34);
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  color: var(--shell-text);
  font-family: var(--font-sans);
}

/* ── Wallet hero ───────────────────────────────────────────── */

.wallet-hero {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 24px;
  background:
    radial-gradient(circle at 96% 4%, rgba(205, 242, 43, 0.2), transparent 30%),
    radial-gradient(circle at 0% 100%, rgba(0, 69, 255, 0.56), transparent 46%),
    linear-gradient(132deg, #071331 0%, #0a267f 54%, #0038ff 100%);
  color: #fff;
  box-shadow: 0 22px 46px -28px rgba(3, 18, 73, 0.6);
}

.wallet-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 30px 30px;
  -webkit-mask-image: linear-gradient(100deg, #000 0%, transparent 68%);
  mask-image: linear-gradient(100deg, #000 0%, transparent 68%);
}

.wallet-hero::after {
  content: '';
  position: absolute;
  top: -130px;
  right: -90px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 34px rgba(255, 255, 255, 0.035),
    0 0 0 70px rgba(255, 255, 255, 0.02);
  pointer-events: none;
}

.wallet-hero-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.wallet-hero-copy {
  min-width: 0;
}

.wallet-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.15px;
  text-transform: uppercase;
}

.wallet-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lime-primary);
  box-shadow: 0 0 0 4px rgba(205, 242, 43, 0.14);
  flex-shrink: 0;
}

.wallet-balance {
  display: flex;
  align-items: baseline;
  gap: 9px;
  min-width: 0;
  font-variant-numeric: tabular-nums;
}

.wallet-coin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 41px;
  height: 41px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.11);
  color: var(--lime-primary);
  flex-shrink: 0;
}

.wallet-balance-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1.6px;
}

.wallet-unit {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.wallet-note {
  max-width: 430px;
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11.5px;
  line-height: 1.6;
}

.wallet-history-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease;
}

.wallet-history-link:hover {
  border-color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.15);
}

.wallet-history-link:focus-visible {
  outline-color: #fff;
  outline-offset: 3px;
}

.wallet-trust-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.67);
  font-size: 10.5px;
  font-weight: 500;
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
  background: rgba(255, 255, 255, 0.35);
}

/* ── Loading / error / locked states ───────────────────────── */

.state-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid var(--shell-border);
  border-radius: var(--wallet-radius);
  background: var(--wallet-card);
  padding: 22px;
  box-shadow: var(--wallet-shadow);
}

.state-panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--shell-chip);
  color: var(--shell-accent-ink);
  flex-shrink: 0;
}

.state-panel h2 {
  margin: 1px 0 4px;
  color: var(--shell-text);
  font-size: 15px;
  font-weight: 800;
}

.state-panel p {
  max-width: 560px;
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12.5px;
  line-height: 1.6;
}

.state-panel--error {
  border-color: rgba(239, 68, 68, 0.24);
}

.state-panel--error .state-panel-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-text);
}

.state-panel--locked .state-panel-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text);
}

.state-panel-action {
  margin-top: 12px;
}

/* ── Shared card + heading ─────────────────────────────────── */

.flow-section,
.payment-panel,
.checkout-card,
.history-section {
  border: 1px solid var(--shell-border);
  border-radius: var(--wallet-radius);
  background: var(--wallet-card);
  box-shadow: var(--wallet-shadow);
}

.flow-section,
.history-section {
  padding: 22px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-step {
  margin: 0 0 5px;
  color: var(--lime-text);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: var(--shell-text);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.section-heading p {
  margin: 4px 0 0;
  color: var(--shell-text-muted);
  font-size: 11.5px;
  line-height: 1.5;
}

.section-badge {
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--shell-accent) 24%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 10%, transparent);
  color: var(--lime-text);
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

/* ── Packages ──────────────────────────────────────────────── */

.package-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.package-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  min-height: 142px;
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  background: var(--wallet-inset);
  color: var(--shell-text);
  padding: 15px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.package-card:hover {
  border-color: var(--shell-border-strong);
  transform: translateY(-1px);
}

.package-card.selected {
  border-color: var(--shell-accent);
  background: color-mix(in srgb, var(--shell-accent) 10%, var(--wallet-inset));
  box-shadow: 0 0 0 1px var(--shell-accent);
}

.package-card:focus-visible,
.method-row:focus-visible,
.small-icon-btn:focus-visible,
.copy-btn:focus-visible,
.topup-primary-btn:focus-visible,
.topup-secondary-btn:focus-visible {
  outline-offset: 3px;
}

.package-card-top {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.package-name {
  overflow: hidden;
  color: var(--shell-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-best {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 15%, transparent);
  color: var(--lime-text);
  padding: 3px 6px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}

.package-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: auto;
  border-radius: 50%;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  flex-shrink: 0;
}

.package-pricing {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 10px;
}

.package-ctf {
  color: var(--shell-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.9px;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.package-ctf small {
  color: var(--shell-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.package-price {
  color: var(--lime-text);
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.package-desc {
  flex: 1;
  margin-top: 8px;
  color: var(--shell-text-muted);
  font-size: 10.5px;
  line-height: 1.5;
}

.package-bonus {
  align-self: flex-start;
  margin-top: 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 12%, transparent);
  color: var(--lime-text);
  padding: 3px 7px;
  font-size: 9.5px;
  font-weight: 800;
}

.package-card--featured {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'top pricing'
    'desc pricing'
    'bonus pricing';
  align-items: center;
  min-height: 0;
  column-gap: 22px;
  row-gap: 3px;
}

.package-card--featured .package-card-top {
  grid-area: top;
}

.package-card--featured .package-pricing {
  grid-area: pricing;
  margin-top: 0;
  padding-left: 22px;
  border-left: 1px solid var(--shell-border);
  text-align: right;
}

.package-card--featured .package-desc {
  grid-area: desc;
  flex: none;
  margin-top: 2px;
  padding-right: 12px;
}

.package-card--featured .package-bonus {
  grid-area: bonus;
  justify-self: start;
  margin-top: 5px;
}

/* ── Payment methods ───────────────────────────────────────── */

.method-group + .method-group {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--shell-border);
}

.method-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.method-group-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.method-group-label {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.method-group-count {
  margin-left: auto;
  color: var(--shell-text-muted);
  font-size: 10px;
  font-weight: 600;
}

.method-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-width: 0;
  min-height: 62px;
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  background: var(--wallet-inset);
  color: var(--shell-text);
  padding: 10px 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.method-list .method-row:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.method-row:hover {
  border-color: var(--shell-border-strong);
}

.method-row.selected {
  border-color: var(--shell-accent);
  background: color-mix(in srgb, var(--shell-accent) 8%, var(--wallet-inset));
  box-shadow: 0 0 0 1px var(--shell-accent);
}

.method-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 36px;
  padding: 5px 6px;
  border: 1px solid rgba(11, 27, 77, 0.12);
  border-radius: 9px;
  background: #fff;
  color: #111827;
  flex-shrink: 0;
}

.method-icon--qris {
  width: 66px;
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
  color: var(--shell-text);
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.35;
}

.method-text small {
  color: var(--shell-text-muted);
  font-size: 10.5px;
  line-height: 1.4;
}

.method-radio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: auto;
  border: 1.5px solid var(--shell-border-strong);
  border-radius: 50%;
  color: var(--shell-accent-ink);
  flex-shrink: 0;
}

.method-radio.checked {
  border-color: var(--shell-accent);
  background: var(--shell-accent);
}

.method-footnote {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  font-size: 10.5px;
  line-height: 1.5;
}

.method-footnote svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Checkout summary ──────────────────────────────────────── */

.topup-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 342px;
  align-items: start;
  gap: 22px;
}

.topup-main {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

.topup-aside {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-self: start;
  min-width: 0;
}

.checkout-card {
  border-top: 3px solid var(--shell-accent);
  padding: 20px;
}

.checkout-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.checkout-head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.checkout-head h2 {
  margin: 1px 0 0;
  color: var(--shell-text);
  font-size: 14.5px;
  font-weight: 800;
  line-height: 1.3;
}

.checkout-head p {
  margin: 2px 0 0;
  color: var(--shell-text-muted);
  font-size: 10.5px;
  line-height: 1.45;
}

.checkout-package {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  background: var(--wallet-inset);
  padding: 13px;
}

.checkout-package-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.checkout-package-copy span {
  color: var(--shell-text-muted);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.checkout-package-copy strong {
  overflow: hidden;
  color: var(--shell-text);
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkout-ctf {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 14%, transparent);
  color: var(--lime-text);
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.checkout-list {
  margin-top: 12px;
}

.checkout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  color: var(--shell-text-muted);
  font-size: 11.5px;
}

.checkout-row strong {
  color: var(--shell-text);
  font-size: 11.5px;
  font-weight: 700;
  text-align: right;
}

.checkout-row strong.is-positive {
  color: var(--success-text);
}

.checkout-method {
  max-width: 185px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkout-divider {
  height: 1px;
  margin: 12px 0;
  background: var(--shell-border);
}

.checkout-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.checkout-total span {
  color: var(--shell-text);
  font-size: 12px;
  font-weight: 700;
}

.checkout-total strong {
  color: var(--lime-text);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.8px;
  font-variant-numeric: tabular-nums;
}

.checkout-hint {
  margin: 4px 0 0;
  color: var(--shell-text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.pay-btn {
  width: 100%;
  min-height: 46px;
  margin-top: 15px;
}

.secure-note {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  margin: 9px 0 0;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  line-height: 1.5;
  text-align: center;
}

.secure-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.form-error {
  margin: 11px 0 0;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.09);
  color: var(--danger-text);
  padding: 9px 11px;
  font-size: 11px;
  line-height: 1.5;
}

.checkout-assurance {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px 4px;
}

.assurance-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.assurance-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.assurance-item div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.assurance-item strong {
  color: var(--shell-text);
  font-size: 10.5px;
  font-weight: 700;
}

.assurance-item span {
  color: var(--shell-text-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

/* ── Buttons ───────────────────────────────────────────────── */

.topup-primary-btn,
.topup-secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  border: none;
  border-radius: 11px;
  padding: 10px 16px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease,
    background 0.15s ease;
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
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
}

/* ── Active order ──────────────────────────────────────────── */

.payment-panel {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 22px;
  scroll-margin-top: 82px;
}

.payment-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 17px;
}

.payment-panel-kicker {
  color: var(--shell-text-muted);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.small-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: var(--shell-text-muted);
  padding: 2px 0;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.small-back-btn:hover {
  color: var(--shell-text);
}

.status-pill {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.status-pill.is-pending,
.status-pill.is-warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning-text);
}

.status-pill.is-success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success-text);
}

.status-pill.is-danger {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
}

.status-pill.is-muted {
  background: var(--shell-chip);
  color: var(--shell-text-muted);
}

.payment-summary {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  background: var(--wallet-inset);
  padding: 17px;
}

.payment-summary-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.payment-method-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  border-radius: 999px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  padding: 4px 8px 4px 5px;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.3;
}

.payment-method-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  border-radius: 5px;
  background: #fff;
  padding: 2px;
  flex-shrink: 0;
}

.payment-method-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.payment-package {
  margin: 10px 0 1px;
  color: var(--shell-text);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.payment-order-id {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  letter-spacing: 0.2px;
  overflow-wrap: anywhere;
}

.payment-summary-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  text-align: right;
}

.payment-label {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.payment-total {
  margin: 3px 0 0;
  color: var(--shell-text);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.7px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.payment-ctf-box {
  display: inline-flex;
  align-items: center;
  margin-top: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 13%, transparent);
  color: var(--lime-text);
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
}

.payment-expiry {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 13px;
  background: rgba(245, 158, 11, 0.07);
  padding: 10px 12px;
}

.payment-expiry.is-urgent {
  border-color: rgba(245, 158, 11, 0.38);
  background: rgba(245, 158, 11, 0.11);
}

.payment-expiry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning-text);
  flex-shrink: 0;
}

.payment-expiry-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.payment-expiry-copy span {
  color: var(--shell-text-muted);
  font-size: 9.5px;
  font-weight: 600;
}

.payment-expiry-copy strong {
  color: var(--warning-text);
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.instruction-block {
  margin-top: 14px;
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  background: var(--wallet-inset);
  padding: 18px;
}

.instruction-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.instruction-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.instruction-title {
  margin: 0 0 3px;
  color: var(--shell-text);
  font-size: 14px;
  font-weight: 800;
}

.instruction-desc {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11.5px;
  line-height: 1.6;
}

.instruction-desc--warning {
  margin-top: 10px;
  color: var(--warning-text);
}

.instruction-footnote {
  margin: 13px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.qr-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(236px, 100%);
  min-height: 218px;
  margin: 16px auto 14px;
  border: 1px solid rgba(11, 27, 77, 0.08);
  border-radius: 14px;
  background: #fff;
  padding: 11px;
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
  color: var(--shell-text-muted);
  font-size: 9.5px;
  overflow-wrap: anywhere;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--lime-text);
  padding: 0;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.pay-code-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 14px;
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
  color: var(--shell-text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pay-code-card strong,
.va-card strong {
  color: var(--shell-text);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.3px;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.pay-code-card .copy-btn {
  align-self: flex-start;
}

.va-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.va-card strong {
  font-size: 17px;
}

.va-card .copy-btn {
  margin-left: auto;
}

.deeplink-btn {
  width: 100%;
  margin-top: 14px;
}

.payment-actions {
  margin-top: 14px;
}

.payment-actions .topup-primary-btn {
  width: 100%;
  min-height: 46px;
}

.poll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 9px 0 0;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  line-height: 1.5;
  text-align: center;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success-text);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
  flex-shrink: 0;
}

/* ── Result states ─────────────────────────────────────────── */

.result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 6px 6px;
  text-align: center;
}

.result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 18px;
}

.result-state--success .result-icon {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-text);
}

.result-state--danger .result-icon {
  background: rgba(239, 68, 68, 0.09);
  color: var(--danger-text);
}

.result-state--warning .result-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text);
}

.result-kicker {
  margin: 13px 0 4px;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.result-state h2 {
  margin: 0;
  color: var(--shell-text);
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.result-state > p:not(.result-kicker):not(.result-order) {
  max-width: 420px;
  margin: 6px 0 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.65;
}

.result-receipt {
  width: 100%;
  max-width: 420px;
  margin-top: 18px;
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  background: var(--wallet-inset);
  padding: 12px 14px;
}

.result-receipt div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
}

.result-receipt span {
  color: var(--shell-text-muted);
  font-size: 11px;
}

.result-receipt strong {
  color: var(--shell-text);
  font-size: 11.5px;
  font-weight: 800;
  text-align: right;
}

.result-receipt strong.is-positive {
  color: var(--success-text);
}

.result-balance {
  margin-top: 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.09);
  color: var(--success-text);
  padding: 7px 12px;
  font-size: 10.5px;
  font-weight: 800;
}

.result-order {
  margin: 10px 0 0;
  color: var(--shell-text-muted);
  font-size: 9.5px;
  letter-spacing: 0.2px;
  overflow-wrap: anywhere;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.result-state > .topup-primary-btn {
  margin-top: 16px;
}

/* ── Mobile checkout bar ───────────────────────────────────── */

.mobile-checkout-bar {
  display: none;
}

/* ── History ───────────────────────────────────────────────── */

.small-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--shell-border);
  border-radius: 10px;
  background: transparent;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;
}

.small-icon-btn:hover:not(:disabled) {
  border-color: var(--shell-border-strong);
  background: var(--shell-chip);
}

.small-icon-btn:disabled {
  cursor: wait;
  opacity: 0.5;
}

.history-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 104px;
  border: 1px dashed var(--shell-border);
  border-radius: 14px;
  color: var(--shell-text-muted);
  padding: 18px;
  font-size: 11.5px;
  text-align: left;
}

.history-empty p {
  margin: 2px 0 0;
  color: var(--shell-text-muted);
  font-size: 10.5px;
}

.history-empty div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.history-empty strong {
  color: var(--shell-text);
  font-size: 12px;
  font-weight: 700;
}

.history-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.history-empty--error {
  flex-direction: column;
  text-align: center;
  color: var(--danger-text);
}

.history-empty--error .topup-secondary-btn {
  min-height: 32px;
  padding: 6px 11px;
  font-size: 10.5px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--wallet-inset);
  color: var(--shell-text);
  padding: 11px 12px;
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
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: var(--shell-chip);
  flex-shrink: 0;
}

.history-icon.tone-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-text);
}

.history-icon.tone-pending,
.history-icon.tone-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text);
}

.history-icon.tone-danger {
  background: rgba(239, 68, 68, 0.09);
  color: var(--danger-text);
}

.history-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.history-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.history-title {
  overflow: hidden;
  color: var(--shell-text);
  font-size: 12.5px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-ctf {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--shell-accent) 11%, transparent);
  color: var(--lime-text);
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.history-sub {
  overflow: hidden;
  color: var(--shell-text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  margin-left: auto;
  flex-shrink: 0;
}

.history-amount strong {
  color: var(--shell-text);
  font-size: 11.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.history-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.history-status::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.history-status.tone-success {
  color: var(--success-text);
}

.history-status.tone-pending,
.history-status.tone-warning {
  color: var(--warning-text);
}

.history-status.tone-danger {
  color: var(--danger-text);
}

.history-status.tone-muted {
  color: var(--shell-text-muted);
}

.history-chevron {
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

/* ── Utilities ─────────────────────────────────────────────── */

.spin {
  animation: topup-spin 0.9s linear infinite;
}

@keyframes topup-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Responsive ────────────────────────────────────────────── */

@media (max-width: 980px) {
  .topup-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .topup-aside {
    position: static;
  }
}

@media (max-width: 980px) {
  .topup-flow.has-mobile-checkout {
    padding-bottom: 84px;
  }

  .topup-selection {
    padding-bottom: 8px;
  }

  .mobile-checkout-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid var(--shell-border);
    background: color-mix(in srgb, var(--bg-page) 88%, transparent);
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    box-shadow: 0 -14px 30px -24px rgba(2, 8, 30, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .mobile-checkout-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .mobile-checkout-info span {
    overflow: hidden;
    color: var(--shell-text-muted);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-checkout-info strong {
    color: var(--shell-text);
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
  }

  .mobile-checkout-bar .topup-primary-btn {
    min-width: 148px;
    min-height: 44px;
    flex-shrink: 0;
  }
}

@media (max-width: 720px) {
  .flow-section,
  .history-section {
    padding: 17px;
  }

  .payment-panel {
    padding: 17px;
  }

  .method-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .method-list .method-row:last-child:nth-child(odd) {
    grid-column: auto;
  }

  .checkout-card {
    padding: 18px;
  }
}

@media (max-width: 520px) {
  .topup-flow {
    gap: 15px;
  }

  .wallet-hero {
    border-radius: 19px;
    padding: 18px;
  }

  .wallet-balance-value {
    font-size: 35px;
    letter-spacing: -1.1px;
  }

  .wallet-coin {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }

  .wallet-note {
    font-size: 10.8px;
  }

  .wallet-history-link {
    padding: 7px 10px;
  }

  .wallet-trust-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 18px;
    font-size: 9.5px;
  }

  .wallet-trust-row .wallet-trust-dot {
    display: none;
  }

  .state-panel {
    padding: 17px;
  }

  .section-heading {
    margin-bottom: 15px;
  }

  .section-heading h2 {
    font-size: 15.5px;
  }

  .section-heading p {
    font-size: 10.8px;
  }

  .section-step {
    font-size: 9px;
  }

  .section-badge {
    padding: 5px 8px;
    font-size: 9px;
  }

  .package-grid {
    gap: 9px;
  }

  .package-card {
    min-height: 136px;
    padding: 12px;
  }

  .package-ctf {
    font-size: 23px;
  }

  .package-desc {
    font-size: 10px;
  }

  .package-card--featured {
    column-gap: 14px;
  }

  .package-card--featured .package-pricing {
    padding-left: 14px;
  }

  .method-group + .method-group {
    margin-top: 17px;
    padding-top: 17px;
  }

  .method-row {
    padding: 9px 10px;
  }

  .method-icon {
    width: 50px;
    height: 34px;
  }

  .method-icon--qris {
    width: 60px;
  }

  .method-text strong {
    font-size: 12px;
  }

  .method-text small {
    font-size: 10px;
  }

  .payment-panel-head {
    margin-bottom: 14px;
  }

  .payment-summary {
    flex-direction: column;
    gap: 13px;
    padding: 14px;
  }

  .payment-summary-value {
    align-items: flex-start;
    width: 100%;
    text-align: left;
  }

  .payment-total {
    font-size: 23px;
  }

  .payment-ctf-box {
    margin-top: 5px;
  }

  .instruction-block {
    padding: 15px;
  }

  .pay-code-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .result-state {
    padding-top: 16px;
  }

  .result-state h2 {
    font-size: 17px;
  }

  .history-empty {
    min-height: 96px;
    padding: 15px;
  }

  .history-row {
    gap: 9px;
    padding: 10px;
  }

  .history-icon {
    width: 33px;
    height: 33px;
  }

  .history-ctf {
    display: none;
  }

  .history-chevron {
    display: none;
  }

  .history-amount strong {
    font-size: 11px;
  }

  .history-status {
    font-size: 8.5px;
  }

  .mobile-checkout-bar {
    padding-right: 12px;
    padding-left: 12px;
  }

  .mobile-checkout-bar .topup-primary-btn {
    min-width: 132px;
    padding-right: 12px;
    padding-left: 12px;
  }
}

@media (max-width: 370px) {
  .wallet-hero-main {
    gap: 8px;
  }

  .wallet-balance {
    gap: 6px;
  }

  .wallet-balance-value {
    font-size: 31px;
  }

  .package-card--featured {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .package-card--featured .package-pricing {
    margin-top: 8px;
    padding-left: 0;
    border-left: none;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .package-card:hover,
  .topup-primary-btn:hover:not(:disabled) {
    transform: none;
  }

  .spin {
    animation: none;
  }
}
</style>
