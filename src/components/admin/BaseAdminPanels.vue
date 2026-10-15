<template>
  <!-- Full-screen slide-in panel for Admin Base Hamburger Menu items -->
  <div
    class="base-admin-panel"
    :class="{ open: modelValue !== null }"
    role="dialog"
    aria-modal="true"
    :aria-label="panelTitle"
  >
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-header-inner">
        <button
          type="button"
          class="panel-back-btn"
          :aria-label="`Tutup ${panelTitle}`"
          @click="$emit('update:modelValue', null)"
        >
          <ChevronLeft :size="20" />
        </button>
        <span class="panel-header-title">{{ panelTitle }}</span>
        <span class="panel-header-spacer" />
      </div>
    </div>

    <!-- Panel Body -->
    <div class="panel-body">
      <!-- ========================================================
           1. KONEKSI MEDSOS (Instagram, Twitter, Telegram)
           ======================================================== -->
      <template v-if="modelValue === 'medsos'">
        <ContentSkeleton v-if="connectionsLoading" type="list" :count="3" label="Memuat koneksi…" />

        <AppStateView
          v-else-if="connectionsError"
          variant="error"
          title="Gagal memuat koneksi"
          description="Tidak bisa mengambil status koneksi medsos dari server."
          action-label="Coba lagi"
          @action="loadConnections"
        />

        <template v-else>
          <div
            v-for="(conn, i) in connections"
            :key="conn.id"
            class="admin-feature-card"
            :class="{ 'mt-4': i > 0 }"
          >
            <div class="card-top-header">
              <div class="brand-badge" :class="badgeClass(conn.id)">
                <Instagram v-if="conn.id === 'instagram'" :size="22" />
                <Twitter v-else-if="conn.id === 'twitter'" :size="20" />
                <Send v-else :size="20" />
              </div>
              <div>
                <div class="font-bold text-sm">{{ conn.name }}</div>
                <div class="text-xs text-muted">
                  {{ conn.connected && conn.account_handle ? 'Akun: ' + conn.account_handle : 'Belum terhubung' }}
                </div>
              </div>
              <span
                class="status-online-pill"
                :class="{ 'status-idle-pill': !conn.connected }"
              >
                {{ conn.connected ? 'AKTIF' : 'NONAKTIF' }}
              </span>
            </div>

            <div class="form-group mt-3">
              <label class="text-xs font-bold text-muted">
                Akun / Channel {{ platformLabel(conn.id) }}:
              </label>
              <input
                v-model="connectionHandles[conn.id]"
                type="text"
                class="admin-input-control text-xs mt-1"
                :placeholder="conn.id === 'telegram' ? 'https://t.me/channel_base' : '@username_ig_base'"
              />
            </div>

            <div class="mt-3 flex justify-end">
              <button
                type="button"
                class="btn-test-action"
                :disabled="connectionBusy === conn.id"
                @click="toggleConnection(conn)"
              >
                {{
                  connectionBusy === conn.id
                    ? 'Memproses…'
                    : conn.connected
                      ? 'Putuskan Koneksi'
                      : 'Hubungkan'
                }}
              </button>
            </div>
          </div>

          <div v-if="connectionNotice" class="alert-success-box mt-4">
            <CheckCircle2 :size="16" />
            <span>{{ connectionNotice }}</span>
          </div>
        </template>
      </template>

      <!-- ========================================================
           2. BAGIAN KEUANGAN (Saldo, Pendapatan, Penarikan)
           ======================================================== -->
      <!-- SALDO -->
      <template v-else-if="modelValue === 'keuangan_saldo'">
        <ContentSkeleton v-if="treasuryLoading" type="list" :count="2" label="Memuat saldo…" />

        <AppStateView
          v-else-if="treasuryError"
          variant="error"
          title="Gagal memuat saldo"
          description="Tidak bisa mengambil saldo treasury dari server."
          action-label="Coba lagi"
          @action="loadTreasury"
        />

        <template v-else>
          <div class="finance-hero-banner">
            <div class="text-xs uppercase font-bold text-muted">TOTAL SALDO TREASURY BASE</div>
            <div class="text-3xl font-black mt-1 text-white">
              {{ (treasury?.balance ?? 0).toLocaleString('id-ID') }} {{ treasury?.currency || '$CLUB' }}
            </div>
            <div class="text-xs text-muted mt-1">
              Saldo tersedia untuk dicairkan ke rekening bank / e-wallet.
            </div>
          </div>

          <div class="finance-breakdown-cards mt-4">
            <div class="breakdown-card">
              <span class="bd-label">Saldo Tersedia Ditarik</span>
              <span class="bd-val text-green-400">
                {{ (treasury?.balance ?? 0).toLocaleString('id-ID') }} {{ treasury?.currency || '$CLUB' }}
              </span>
            </div>
            <div class="breakdown-card">
              <span class="bd-label">Total Pendapatan Terkumpul</span>
              <span class="bd-val text-amber-400">
                {{ (treasury?.revenue ?? 0).toLocaleString('id-ID') }} {{ treasury?.currency || '$CLUB' }}
              </span>
            </div>
          </div>

          <div class="section-title-sm mt-6 mb-3">Arus Kas Treasury</div>
          <div class="transaction-list">
            <p class="text-xs text-muted">
              Riwayat transaksi per-item belum tersedia dari server. Angka di atas dihitung
              langsung dari data treasury akun base-mu.
            </p>
          </div>
        </template>
      </template>

      <!-- PENDAPATAN -->
      <template v-else-if="modelValue === 'keuangan_pendapatan'">
        <ContentSkeleton v-if="treasuryLoading" type="list" :count="1" label="Memuat pendapatan…" />

        <AppStateView
          v-else-if="treasuryError"
          variant="error"
          title="Gagal memuat pendapatan"
          description="Tidak bisa mengambil data pendapatan dari server."
          action-label="Coba lagi"
          @action="loadTreasury"
        />

        <template v-else>
          <div class="income-hero-card">
            <div class="text-xs uppercase font-bold text-muted">TOTAL PENDAPATAN TERKUMPUL</div>
            <div class="text-3xl font-black mt-1 text-green-400">
              {{ (treasury?.revenue ?? 0).toLocaleString('id-ID') }} {{ treasury?.currency || '$CLUB' }}
            </div>
            <div class="text-xs text-muted mt-1">
              Akumulasi dari fess prioritas dan tip untuk base-mu.
            </div>
          </div>

          <p class="text-xs text-muted mt-4">
            Rincian sumber pendapatan per kategori belum tersedia dari server — angka di atas
            berasal dari data treasury akunmu.
          </p>
        </template>
      </template>

      <!-- PENARIKAN (PAYOUT) -->
      <template v-else-if="modelValue === 'keuangan_penarikan'">
        <ContentSkeleton v-if="treasuryLoading" type="list" :count="1" label="Memuat saldo…" />

        <AppStateView
          v-else-if="treasuryError"
          variant="error"
          title="Gagal memuat saldo"
          description="Tidak bisa mengambil saldo treasury dari server."
          action-label="Coba lagi"
          @action="loadTreasury"
        />

        <template v-else>
          <div class="payout-balance-box">
            <span class="text-xs text-muted font-bold">Saldo Siap Dicairkan:</span>
            <span class="text-2xl font-black text-white mt-1">
              {{ (treasury?.balance ?? 0).toLocaleString('id-ID') }} {{ treasury?.currency || '$CLUB' }}
            </span>
          </div>

          <form class="payout-form mt-5" @submit.prevent="submitPayout">
            <div class="form-group">
              <label class="form-label">Nominal Penarikan ({{ treasury?.currency || '$CLUB' }})</label>
              <input
                v-model="payoutForm.amount"
                type="number"
                min="1"
                :max="treasury?.balance ?? 0"
                class="admin-input-control"
                placeholder="contoh: 500"
                required
              />
            </div>

            <div v-if="payoutQuickAmounts.length" class="payout-quick-amounts mt-2">
              <button
                v-for="amt in payoutQuickAmounts"
                :key="amt"
                type="button"
                class="quick-amt-btn"
                @click="payoutForm.amount = amt"
              >
                {{ amt.toLocaleString('id-ID') }}
              </button>
              <button
                type="button"
                class="quick-amt-btn all-in"
                @click="payoutForm.amount = Math.floor(treasury?.balance ?? 0)"
              >
                Semua Saldo
              </button>
            </div>

            <div class="form-group mt-4">
              <label class="form-label">Tujuan Transfer</label>
              <input
                v-model="payoutForm.destination"
                type="text"
                class="admin-input-control"
                placeholder="contoh: BCA 8201928190 / GoPay 0812xxxx"
                required
              />
            </div>

            <div class="payout-notes mt-4">
              <div class="text-xs text-muted flex justify-between">
                <span>Biaya Administrasi:</span>
                <span class="font-bold text-green-400">GRATIS</span>
              </div>
              <div class="text-xs text-muted flex justify-between mt-1">
                <span>Estimasi Masuk Rekening:</span>
                <span class="font-bold">1x24 Jam Kerja</span>
              </div>
            </div>

            <button type="submit" class="btn-submit-payout mt-5" :disabled="isSubmittingPayout">
              <Coins :size="16" />
              <span>{{ isSubmittingPayout ? 'Memproses Pengajuan...' : 'Ajukan Penarikan Dana' }}</span>
            </button>
          </form>

          <div v-if="payoutError" class="alert-error-box mt-4">
            <span>{{ payoutError }}</span>
          </div>

          <div v-if="payoutMessage" class="alert-success-box mt-4">
            <CheckCircle2 :size="16" />
            <span>{{ payoutMessage }}</span>
          </div>
        </template>
      </template>

      <!-- ========================================================
           3. ANALITIK (Ringkasan, Konten, Moderasi, Komunitas)
           ======================================================== -->
      <!-- ANALITIK: RINGKASAN -->
      <template v-else-if="modelValue === 'analitik_ringkasan'">
        <ContentSkeleton v-if="analyticsLoading" type="list" :count="4" label="Memuat analitik…" />

        <AppStateView
          v-else-if="analyticsError"
          variant="error"
          title="Gagal memuat analitik"
          description="Tidak bisa mengambil statistik base dari server."
          action-label="Coba lagi"
          @action="loadAnalytics"
        />

        <template v-else>
          <div class="analytics-kpi-grid">
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-lbl">Total Fess</span>
                <MessageSquare :size="14" class="text-blue-400" />
              </div>
              <div class="kpi-val">{{ analyticsStats?.total_fesses ?? 0 }}</div>
              <div class="kpi-trend text-muted">Seluruh status</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-lbl">Fess Terbit</span>
                <TrendingUp :size="14" class="text-green-400" />
              </div>
              <div class="kpi-val">{{ analyticsStats?.published ?? 0 }}</div>
              <div class="kpi-trend text-muted">Approved / published</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-lbl">Antrean Moderasi</span>
                <BarChart3 :size="14" class="text-purple-400" />
              </div>
              <div class="kpi-val text-purple-400">{{ analyticsStats?.pending ?? 0 }}</div>
              <div class="kpi-trend text-muted">Menunggu review</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-lbl">Ditolak</span>
                <Users :size="14" class="text-pink-400" />
              </div>
              <div class="kpi-val">{{ analyticsStats?.rejected ?? 0 }}</div>
              <div class="kpi-trend text-muted">Total rejected</div>
            </div>
          </div>

          <p class="text-xs text-muted mt-4">
            Angka dihitung langsung dari database (GET /admin/stats, scoped ke base yang kamu kelola).
          </p>
        </template>
      </template>

      <!-- ANALITIK: KONTEN -->
      <template v-else-if="modelValue === 'analitik_konten'">
        <ContentSkeleton v-if="analyticsLoading" type="list" :count="3" label="Memuat konten…" />

        <AppStateView
          v-else-if="analyticsError"
          variant="error"
          title="Gagal memuat konten"
          description="Tidak bisa mengambil daftar fess populer dari server."
          action-label="Coba lagi"
          @action="loadAnalytics"
        />

        <template v-else>
          <div class="section-title-sm mb-3">Fess Paling Populer</div>

          <div v-if="analyticsPopular.length" class="viral-fess-list">
            <div v-for="(v, i) in analyticsPopular" :key="v.id" class="viral-fess-item">
              <div class="viral-rank">#{{ i + 1 }}</div>
              <div class="viral-content">
                <p class="viral-text">"{{ v.content }}"</p>
                <div class="viral-meta text-xs text-muted mt-1 flex items-center gap-3">
                  <span class="inline-flex items-center gap-1">
                    <Heart :size="12" /> {{ v.upvotes ?? 0 }} suka
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <MessageSquare :size="12" /> {{ v.comments_count ?? 0 }} komentar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="text-xs text-muted">Belum ada fess populer untuk base ini.</p>

          <p class="text-xs text-muted mt-4">
            Analitik kata kunci & impresi belum tersedia dari server.
          </p>
        </template>
      </template>

      <!-- ANALITIK: MODERASI -->
      <template v-else-if="modelValue === 'analitik_moderasi'">
        <ContentSkeleton v-if="analyticsLoading" type="list" :count="3" label="Memuat moderasi…" />

        <AppStateView
          v-else-if="analyticsError"
          variant="error"
          title="Gagal memuat moderasi"
          description="Tidak bisa mengambil statistik moderasi dari server."
          action-label="Coba lagi"
          @action="loadAnalytics"
        />

        <template v-else>
          <div class="moderation-stats-banner">
            <div class="mod-stat-pill">
              <span class="mod-val text-green-400">{{ analyticsStats?.published ?? 0 }}</span>
              <span class="mod-lbl">Fess Terbit</span>
            </div>
            <div class="mod-stat-pill">
              <span class="mod-val text-amber-400">{{ analyticsStats?.pending ?? 0 }}</span>
              <span class="mod-lbl">Antrean Review</span>
            </div>
            <div class="mod-stat-pill">
              <span class="mod-val text-red-400">{{ analyticsStats?.rejected ?? 0 }}</span>
              <span class="mod-lbl">Ditolak</span>
            </div>
          </div>

          <div class="section-title-sm mt-6 mb-3">Catatan Moderasi</div>
          <p class="text-xs text-muted">
            Filter kata otomatis (blacklist keyword) dan skor AI moderation belum tersedia dari
            server. Saat ini semua fess masuk antrean review manual di tab Moderasi.
          </p>
        </template>
      </template>

      <!-- ANALITIK: KOMUNITAS -->
      <template v-else-if="modelValue === 'analitik_komunitas'">
        <ContentSkeleton v-if="analyticsLoading" type="list" :count="2" label="Memuat komunitas…" />

        <AppStateView
          v-else-if="analyticsError"
          variant="error"
          title="Gagal memuat komunitas"
          description="Tidak bisa mengambil data komunitas base dari server."
          action-label="Coba lagi"
          @action="loadAnalytics"
        />

        <template v-else>
          <div class="community-overview-card">
            <div class="flex items-center gap-3">
              <Users :size="28" class="text-purple-400" />
              <div>
                <div class="text-2xl font-black">
                  {{ (analyticsBase?.followers_count ?? 0).toLocaleString('id-ID') }} Anggota
                </div>
                <div class="text-xs text-muted">Pengikut aktif base {{ baseHandle }}</div>
              </div>
            </div>
          </div>

          <p class="text-xs text-muted mt-4">
            Daftar pengirim teraktif bersifat anonim dan belum tersedia dari server.
          </p>
        </template>
      </template>

      <!-- ========================================================
           4. PENGATURAN (Tampilan, Notif, Bantuan, Ketentuan, Privasi, Keamanan)
           ======================================================== -->
      <!-- TAMPILAN -->
      <template v-else-if="modelValue === 'pengaturan_tampilan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Mode Tampilan Aplikasi</div>
          <div class="theme-options-grid">
            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'system' }"
              @click="$emit('setTheme', 'system')"
            >
              <div class="theme-preview-box sys-box" />
              <span class="theme-name font-bold text-xs mt-2">Sistem</span>
            </button>

            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'light' }"
              @click="$emit('setTheme', 'light')"
            >
              <div class="theme-preview-box light-box" />
              <span class="theme-name font-bold text-xs mt-2">Terang</span>
            </button>

            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'dark' }"
              @click="$emit('setTheme', 'dark')"
            >
              <div class="theme-preview-box dark-box" />
              <span class="theme-name font-bold text-xs mt-2">Gelap</span>
            </button>
          </div>
        </div>
      </template>

      <!-- NOTIFIKASI -->
      <template v-else-if="modelValue === 'pengaturan_notif'">
        <div class="admin-feature-card">
          <div class="card-toggles-list">
            <div class="toggle-row">
              <div>
                <div class="toggle-title">Fess Baru Masuk</div>
                <div class="toggle-desc">Pemberitahuan instan saat ada user mengirim confession</div>
              </div>
              <input v-model="notifSettings.newFess" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Laporan Konten Melanggar</div>
                <div class="toggle-desc">Peringatan saat ada fess yang dilaporkan oleh anggota</div>
              </div>
              <input v-model="notifSettings.reports" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Status Auto-Post Instagram</div>
                <div class="toggle-desc">Notifikasi saat bot berhasil atau gagal posting Story</div>
              </div>
              <input v-model="notifSettings.igStatus" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Pembayaran Tip &amp; Saldo</div>
                <div class="toggle-desc">Alert saat saldo treasury base bertambah</div>
              </div>
              <input v-model="notifSettings.payments" type="checkbox" class="toggle-switch" />
            </div>
          </div>

          <p class="text-xs text-muted mt-4">
            Preferensi ini tersimpan di perangkat ini dan akan dipakai saat sistem notifikasi aktif.
          </p>
        </div>
      </template>

      <!-- BANTUAN -->
      <template v-else-if="modelValue === 'pengaturan_bantuan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Tanya Jawab (FAQ Pengelola Base)</div>
          <div class="faq-accordion-list">
            <div
              v-for="(f, i) in ADMIN_FAQS"
              :key="i"
              class="faq-item"
              :class="{ open: openFaqIndex === i }"
            >
              <button
                type="button"
                class="faq-question-btn"
                @click="openFaqIndex = openFaqIndex === i ? null : i"
              >
                <span>{{ f.q }}</span>
                <ChevronDown :size="16" class="faq-chevron" />
              </button>
              <p v-if="openFaqIndex === i" class="faq-answer-text">
                {{ f.a }}
              </p>
            </div>
          </div>
        </div>

        <div class="support-contact-box mt-4">
          <div class="font-bold text-sm">Butuh Bantuan Teknis Tambahan?</div>
          <p class="text-xs text-muted mt-1">Tim teknis FessHub siap membantu 24/7 terkait integrasi bot dan sistem auto-post.</p>
          <a href="mailto:admin-support@fesshub.com" class="btn-contact-support mt-3">
            Hubungi Tim Teknis via Email
          </a>
        </div>
      </template>

      <!-- KETENTUAN LAYANAN -->
      <template v-else-if="modelValue === 'pengaturan_ketentuan'">
        <div class="legal-text-container">
          <h4 class="legal-section-title">1. Ketentuan Umum Pengelola Base</h4>
          <p class="legal-p">Setiap pengelola base bertanggung jawab penuh atas moderasi konten dan menjaga kepatuhan komunitas terhadap norma hukum dan privasi.</p>

          <h4 class="legal-section-title mt-4">2. Kebijakan Konten Terlarang</h4>
          <p class="legal-p">Dilarang keras menyetujui atau menerbitkan konten bermuatan SARA, pornografi, ancaman kekerasan, doxxing, dan judi online.</p>

          <h4 class="legal-section-title mt-4">3. Pembagian Royalti &amp; Saldo</h4>
          <p class="legal-p">Pendapatan yang bersumber dari fess prioritas dan tip akan dialokasikan 85% untuk treasury base dan 15% untuk biaya operasional platform.</p>
        </div>
      </template>

      <!-- KEBIJAKAN PRIVASI -->
      <template v-else-if="modelValue === 'pengaturan_privasi'">
        <div class="legal-text-container">
          <h4 class="legal-section-title">1. Perlindungan Anonimitas Pengirim</h4>
          <p class="legal-p">Sistem FessHub mengenkripsi identitas pengirim secara end-to-end. Pengelola base tidak dapat melihat alamat email atau nomor telepon asli dari pengirim confession.</p>

          <h4 class="legal-section-title mt-4">2. Keamanan Kredensial Media Sosial</h4>
          <p class="legal-p">Token akses Instagram Graph API disimpan dalam brankas kredensial terenkripsi dan hanya digunakan untuk auto-posting fess yang telah disetujui.</p>
        </div>
      </template>

      <!-- KEAMANAN PROFIL -->
      <template v-else-if="modelValue === 'pengaturan_keamanan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Keamanan Akun Admin</div>
          <p class="text-xs text-muted">
            Penggantian kata sandi dari dashboard belum tersedia di versi ini. Jika akunmu dibuat
            lewat Google OAuth, pengelolaan kata sandi dilakukan sepenuhnya di akun Google-mu.
          </p>
        </div>

        <div class="session-info-card mt-4">
          <div class="text-xs font-bold text-muted">Detail Sesi Login Aktif:</div>
          <div class="text-xs text-muted mt-1">
            Masuk sebagai {{ authStore.user?.email || authStore.user?.handle || '—' }} • Role:
            {{ authStore.user?.role || '—' }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * BaseAdminPanels — Base Admin hamburger drawer modules, now fully API-backed:
 * 1. Koneksi Medsos   → GET/POST /admin/connections
 * 2. Keuangan         → GET /admin/treasury + POST /admin/treasury/payout
 * 3. Analitik         → GET /admin/stats + GET /fesses + GET /bases/:handle
 * 4. Pengaturan       → theme (real), notif lokal, legal copy, info sesi aktual
 */
import { ref, computed, reactive, watch } from 'vue';
import {
  ChevronLeft,
  ChevronDown,
  Instagram,
  Twitter,
  Send,
  CheckCircle2,
  Coins,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Users,
  Heart,
} from 'lucide-vue-next';

import { api } from '../../api';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../composables/useTheme';

const props = defineProps({
  modelValue: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue', 'setTheme', 'logout']);

const authStore = useAuthStore();
const { mode: currentTheme } = useTheme();

const baseHandle = computed(
  () => authStore.user?.managedBases?.[0] || authStore.user?.handle || '',
);

/* Panel Titles */
const panelTitle = computed(() => {
  const map = {
    medsos: 'Koneksi Media Sosial',
    keuangan_saldo: 'Saldo Treasury Base',
    keuangan_pendapatan: 'Pendapatan Komunitas',
    keuangan_penarikan: 'Penarikan Saldo (Payout)',
    analitik_ringkasan: 'Ringkasan Analitik Base',
    analitik_konten: 'Analitik Konten Fess',
    analitik_moderasi: 'Moderasi & Filter Kata',
    analitik_komunitas: 'Analitik Komunitas Base',
    pengaturan_tampilan: 'Tampilan Tema',
    pengaturan_notif: 'Pengaturan Notifikasi',
    pengaturan_bantuan: 'Pusat Bantuan Pengelola',
    pengaturan_ketentuan: 'Ketentuan Layanan',
    pengaturan_privasi: 'Kebijakan Privasi',
    pengaturan_keamanan: 'Keamanan Akun Admin',
  };
  return map[props.modelValue] || 'Detail Menu';
});

/* 1. Koneksi Medsos — real state (GET/POST /admin/connections) */
const connections = ref([]);
const connectionsLoading = ref(false);
const connectionsError = ref(null);
const connectionHandles = reactive({});
const connectionBusy = ref(null);
const connectionNotice = ref('');

function badgeClass(id) {
  if (id === 'instagram') return 'ig-badge';
  if (id === 'twitter') return 'x-badge';
  return 'tg-badge';
}

function platformLabel(id) {
  if (id === 'instagram') return 'Instagram';
  if (id === 'twitter') return 'Twitter/X';
  return 'Telegram';
}

async function loadConnections() {
  connectionsLoading.value = true;
  connectionsError.value = null;
  try {
    const res = await api.getPlatformConnections();
    connections.value = res?.data || [];
    for (const conn of connections.value) {
      if (connectionHandles[conn.id] === undefined) {
        connectionHandles[conn.id] = conn.account_handle || '';
      }
    }
  } catch (e) {
    connectionsError.value = e;
  } finally {
    connectionsLoading.value = false;
  }
}

async function toggleConnection(conn) {
  connectionBusy.value = conn.id;
  connectionNotice.value = '';
  try {
    await api.togglePlatformConnection(conn.id, {
      action: conn.connected ? 'disconnect' : 'connect',
      account_handle: (connectionHandles[conn.id] || '').trim() || undefined,
    });
    await loadConnections();
    connectionNotice.value = conn.connected
      ? `${platformLabel(conn.id)} berhasil diputuskan.`
      : `${platformLabel(conn.id)} berhasil dihubungkan.`;
  } catch (e) {
    connectionNotice.value = e?.message || 'Gagal memperbarui koneksi.';
  } finally {
    connectionBusy.value = null;
  }
}

/* 2. Keuangan — real state (GET /admin/treasury + POST /admin/treasury/payout) */
const treasury = ref(null);
const treasuryLoading = ref(false);
const treasuryError = ref(null);

const payoutForm = reactive({
  amount: '',
  destination: '',
});

const isSubmittingPayout = ref(false);
const payoutMessage = ref('');
const payoutError = ref('');

const payoutQuickAmounts = computed(() => {
  const balance = Math.floor(treasury.value?.balance ?? 0);
  return [100, 500, 1000, 5000].filter((amount) => amount <= balance);
});

async function loadTreasury() {
  treasuryLoading.value = true;
  treasuryError.value = null;
  try {
    treasury.value = await api.getTreasury();
  } catch (e) {
    treasuryError.value = e;
  } finally {
    treasuryLoading.value = false;
  }
}

async function submitPayout() {
  const amount = Number(payoutForm.amount);
  payoutError.value = '';
  payoutMessage.value = '';

  if (!amount || amount <= 0) {
    payoutError.value = 'Masukkan nominal penarikan yang valid.';
    return;
  }
  if (amount > (treasury.value?.balance ?? 0)) {
    payoutError.value = 'Nominal melebihi saldo yang tersedia.';
    return;
  }
  if (!payoutForm.destination.trim()) {
    payoutError.value = 'Isi tujuan transfer terlebih dahulu.';
    return;
  }

  isSubmittingPayout.value = true;
  try {
    const res = await api.requestPayout({
      amount,
      destination: payoutForm.destination.trim(),
    });
    payoutMessage.value = res?.message || 'Permintaan payout berhasil diajukan.';
    payoutForm.amount = '';
    payoutForm.destination = '';
    await loadTreasury();
  } catch (e) {
    payoutError.value = e?.message || 'Gagal mengajukan payout.';
  } finally {
    isSubmittingPayout.value = false;
  }
}

/* 3. Analitik — real state (GET /admin/stats + GET /fesses + GET /bases/:handle) */
const analyticsStats = ref(null);
const analyticsBase = ref(null);
const analyticsPopular = ref([]);
const analyticsLoading = ref(false);
const analyticsError = ref(null);

async function loadAnalytics() {
  analyticsLoading.value = true;
  analyticsError.value = null;
  try {
    const requests = [api.getStats()];
    if (baseHandle.value) {
      requests.push(api.getBase(baseHandle.value));
      requests.push(
        api.getFesses({ base: baseHandle.value, status: 'approved', sort: 'popular', limit: 5 }),
      );
    }
    const [statsRes, baseRes, popularRes] = await Promise.all(requests);
    analyticsStats.value = statsRes || null;
    if (baseRes) analyticsBase.value = baseRes;
    analyticsPopular.value = popularRes?.data || [];
  } catch (e) {
    analyticsError.value = e;
  } finally {
    analyticsLoading.value = false;
  }
}

/* 4. Pengaturan State — preferensi notifikasi disimpan lokal di perangkat ini */
const NOTIF_STORAGE_KEY = 'admin_notif_settings';

function readNotifSettings() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const notifSettings = reactive({
  newFess: true,
  reports: true,
  igStatus: true,
  payments: true,
});

const storedNotif = readNotifSettings();
if (storedNotif && typeof storedNotif === 'object') {
  Object.assign(notifSettings, storedNotif);
}

watch(
  notifSettings,
  (value) => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage not available (private mode) — preferences stay in-memory.
    }
  },
  { deep: true },
);

const openFaqIndex = ref(0);
const ADMIN_FAQS = [
  {
    q: 'Bagaimana cara kerja auto-post ke Instagram Story?',
    a: 'Setiap confession yang Anda setujui akan dikonversi menjadi gambar canvas resolusi tinggi (1080x1920) dengan format font elegan, lalu diposting otomatis ke Story akun Instagram base Anda via Meta Graph API.',
  },
  {
    q: 'Berapa lama proses pencairan saldo treasury ke rekening bank?',
    a: 'Pencairan saldo membutuhkan waktu maksimal 1x24 jam kerja. Transfer dikirim melalui kliring BI-FAST langsung ke rekening bank atau e-wallet terdaftar tanpa biaya admin.',
  },
  {
    q: 'Bagaimana cara mengganti kata sandi atau email admin?',
    a: 'Penggantian kata sandi dari dashboard belum tersedia di versi ini. Untuk akun yang masuk lewat Google, kata sandi dikelola sepenuhnya di akun Google Anda.',
  },
];

/* ---------- Lazy load per opened panel (after all state is initialised) ---------- */
watch(
  () => props.modelValue,
  (panel) => {
    if (panel === 'medsos') loadConnections();
    if (panel && panel.startsWith('keuangan')) loadTreasury();
    if (panel && panel.startsWith('analitik')) loadAnalytics();
  },
  { immediate: true },
);
</script>

<style scoped>
.base-admin-panel {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.base-admin-panel.open {
  transform: translateX(0);
}

.panel-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 18px;
  background: var(--shell-header-bg);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--shell-border);
}

.panel-header-inner {
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-back-btn {
  background: none;
  border: none;
  color: var(--shell-text);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.panel-header-title {
  font-size: 16px;
  font-weight: 900;
}

.panel-header-spacer {
  width: 32px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 40px;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
}

/* Feature cards */
.admin-feature-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 20px;
}

.card-top-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.ig-badge { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
.x-badge { background: #000; }
.tg-badge { background: #24a1de; }

.status-online-pill {
  margin-left: auto;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid #10b981;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.status-idle-pill {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
  border-color: #6b7280;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--shell-text);
}

.toggle-desc {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.toggle-switch {
  width: 42px;
  height: 24px;
  accent-color: var(--shell-sub-accent);
  cursor: pointer;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-style-btn {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text);
  cursor: pointer;
}

.preset-style-btn.active {
  border-color: var(--shell-sub-accent);
  background: var(--shell-card);
  color: var(--shell-text);
  font-weight: 900;
}

.btn-test-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-test-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-success-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}

.alert-error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid #f87171;
  color: #f87171;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}

/* Controls */
.admin-input-control {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.admin-input-control:focus {
  border-color: var(--shell-sub-accent);
}

/* Finance */
.finance-hero-banner,
.income-hero-card {
  background: linear-gradient(135deg, var(--brand-blue) 0%, #162447 100%);
  color: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px var(--neon-blue-glow);
}

.income-hero-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 83, 45, 0.4) 100%);
  border: 1px solid #10b981;
}

.finance-breakdown-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.breakdown-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bd-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.bd-val {
  font-size: 16px;
  font-weight: 900;
}

.section-title-sm {
  font-size: 14px;
  font-weight: 900;
  color: var(--shell-text);
}

.transaction-list,
.income-sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trx-item,
.income-source-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px 16px;
}

.income-source-card {
  display: block;
}

.progress-bar-wrap {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--shell-chip);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--shell-sub-accent);
}

.payout-balance-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}

.payout-quick-amounts {
  display: flex;
  gap: 8px;
}

.quick-amt-btn {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.quick-amt-btn.all-in {
  color: var(--shell-sub-accent);
  border-color: var(--shell-sub-accent);
}

.btn-submit-payout,
.btn-save-sec {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-pill);
  background: var(--shell-sub-accent);
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Analytics */
.analytics-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.kpi-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px;
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.kpi-val {
  font-size: 22px;
  font-weight: 900;
  margin-top: 4px;
}

.kpi-trend {
  font-size: 11px;
  font-weight: 700;
  margin-top: 2px;
}

.weekly-chart-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.chart-bars-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 140px;
  padding-top: 20px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.bar-val-hint {
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.bar-track {
  width: 18px;
  height: 90px;
  background: var(--shell-chip);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--shell-sub-accent) 0%, var(--brand-blue) 100%);
  border-radius: 6px;
  transition: height 0.3s ease;
}

.bar-day-lbl {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.top-keywords-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.viral-fess-list,
.top-senders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.viral-fess-item,
.sender-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px;
}

.viral-rank {
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-sub-accent);
}

.viral-text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.moderation-stats-banner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mod-stat-pill {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mod-val {
  font-size: 20px;
  font-weight: 900;
}

.mod-lbl {
  font-size: 10px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.blacklist-chips-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blocked-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: 800;
}

.btn-remove-chip {
  background: none;
  border: none;
  color: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.add-keyword-row {
  display: flex;
  gap: 8px;
}

.btn-add-kw {
  padding: 8px 16px;
  border-radius: 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.community-overview-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.sender-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand-blue);
  color: #fff;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sender-info {
  flex: 1;
}

/* Theme options */
.theme-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.theme-select-card {
  background: var(--shell-chip);
  border: 2px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.15s ease;
}

.theme-select-card.active {
  border-color: var(--shell-sub-accent);
  background: var(--shell-card);
}

.theme-preview-box {
  width: 100%;
  height: 48px;
  border-radius: 8px;
}

.sys-box { background: linear-gradient(135deg, #fff 50%, #0d121f 50%); }
.light-box { background: #f8fafc; border: 1px solid #cbd5e1; }
.dark-box { background: #0f172a; }

/* FAQ */
.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border-bottom: 1px solid var(--shell-border);
  padding-bottom: 8px;
}

.faq-question-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: none;
  border: none;
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.faq-answer-text {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--shell-text-muted);
  margin: 0 0 8px;
}

.support-contact-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.btn-contact-support {
  display: inline-block;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

/* Legal text */
.legal-text-container {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 20px;
}

.legal-section-title {
  font-size: 14px;
  font-weight: 900;
  margin: 0;
  color: var(--shell-text);
}

.legal-p {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--shell-text-muted);
  margin: 6px 0 0;
}

.session-info-card {
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 12px 14px;
}
</style>
