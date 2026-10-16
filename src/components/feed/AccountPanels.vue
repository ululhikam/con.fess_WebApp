<template>
  <!-- Full-screen panel slide-in overlay -->
  <div class="account-panel" :class="{ open: modelValue !== null }" role="dialog" aria-modal="true" :aria-label="panelTitle">
    <!-- Header -->
    <div class="panel-header">
      <button type="button" class="panel-back-btn" :aria-label="`Tutup ${panelTitle}`" @click="$emit('update:modelValue', null)">
        <ChevronLeft :size="20" />
      </button>
      <span class="panel-header-title">{{ panelTitle }}</span>
      <span class="panel-header-spacer" />
    </div>

    <!-- Panel Content -->
    <div class="panel-body">
      <!-- TOP UP / SALDO -->
      <template v-if="modelValue === 'topup'">
        <div class="balance-hero-card">
          <div class="balance-hero-label">Saldo CTF Kamu</div>
          <div class="balance-hero-amount">
            <Coins :size="28" class="balance-coin-icon" />
            <span>{{ balance.toLocaleString() }}</span>
            <span class="balance-unit">CTF</span>
          </div>
        </div>

        <div class="section-label mt-6 mb-3">Top Up Saldo</div>
        <div class="empty-state">
          <Wallet :size="40" class="empty-icon" />
          <p>Top up belum tersedia</p>
          <p>Pengisian saldo CTF akan segera hadir di aplikasi.</p>
        </div>
      </template>

      <!-- KEAMANAN AKUN -->
      <template v-else-if="modelValue === 'security'">
        <div class="security-info-card mb-5">
          <ShieldCheck :size="20" class="security-icon" />
          <div>
            <div class="security-title">Akun Aman</div>
            <div class="security-desc">Sesi aktif: {{ currentSession.device }}</div>
          </div>
        </div>

        <div class="section-label mb-3">Email & Password</div>
        <div class="settings-card mb-4">
          <div class="settings-row">
            <span class="settings-row-label">Email</span>
            <span class="settings-row-val">{{ user?.email || '—' }}</span>
          </div>
          <div class="settings-divider" />
          <div class="settings-row">
            <span class="settings-row-label">Password</span>
            <button type="button" class="settings-link-btn" @click="showChangePassword = !showChangePassword">
              Ubah Password
            </button>
          </div>
        </div>

        <transition name="slide-fade">
          <div v-if="showChangePassword" class="change-password-form mb-4">
            <div class="form-group">
              <label class="form-label">Password Lama</label>
              <input v-model="passwords.old" type="password" class="form-input" placeholder="••••••••" />
            </div>
            <div class="form-group">
              <label class="form-label">Password Baru</label>
              <input v-model="passwords.new" type="password" class="form-input" placeholder="Min 8 karakter" />
            </div>
            <div class="form-group">
              <label class="form-label">Konfirmasi Password Baru</label>
              <input v-model="passwords.confirm" type="password" class="form-input" placeholder="Ulangi password baru" />
            </div>
            <button type="button" class="btn-save-primary" @click="handleChangePassword">Simpan Password</button>
            <p v-if="passwordMessage" class="form-hint mt-2">{{ passwordMessage }}</p>
          </div>
        </transition>

        <div class="section-label mb-3">Sesi Aktif</div>
        <div class="settings-card mb-4">
          <div class="session-row">
            <div class="session-icon-wrap">
              <Laptop :size="18" />
            </div>
            <div class="session-info">
              <div class="session-device">{{ currentSession.device }}</div>
              <div class="session-meta">{{ currentSession.location }} · {{ currentSession.time }}</div>
            </div>
            <span class="session-current-badge">Aktif</span>
          </div>
        </div>

        <div class="section-label mb-3">Opsi Keamanan</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">Verifikasi 2 Faktor (2FA)</span>
            <div class="toggle-switch" :class="{ on: twoFa }" @click="twoFa = !twoFa">
              <span class="toggle-thumb" />
            </div>
          </div>
          <div class="settings-divider" />
          <div class="settings-row">
            <span class="settings-row-label">Notifikasi Login</span>
            <div class="toggle-switch" :class="{ on: loginNotif }" @click="loginNotif = !loginNotif">
              <span class="toggle-thumb" />
            </div>
          </div>
        </div>
      </template>

      <!-- FESS SAYA -->
      <template v-else-if="modelValue === 'my-fess'">
        <div class="fess-filter-tabs mb-4">
          <button
            v-for="tab in FESS_TABS"
            :key="tab.key"
            type="button"
            class="fess-tab-btn"
            :class="{ active: myFessTab === tab.key }"
            @click="myFessTab = tab.key"
          >
            {{ tab.label }}
            <span class="fess-tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div v-if="myFessLoading" class="empty-state">
          <p>Memuat fess kamu…</p>
        </div>
        <div v-else-if="myFessError" class="empty-state">
          <p>Gagal memuat fess kamu.</p>
          <button type="button" class="btn-save-primary mt-2" @click="loadMyFesses">Coba lagi</button>
        </div>
        <div v-else class="my-fess-list">
          <div v-for="fess in filteredMyFess" :key="fess.id" class="my-fess-card">
            <div class="my-fess-header">
              <span class="my-fess-base">{{ fess.base }}</span>
              <span class="my-fess-status-badge" :class="fess.status">{{ STATUS_LABELS[fess.status] }}</span>
            </div>
            <p class="my-fess-content">{{ fess.content }}</p>
            <div class="my-fess-footer">
              <span class="my-fess-time">{{ fess.time }}</span>
              <div class="my-fess-stats">
                <span><ThumbsUp :size="13" /> {{ fess.upvotes }}</span>
                <span><MessageCircle :size="13" /> {{ fess.comments }}</span>
              </div>
            </div>
          </div>
          <div v-if="filteredMyFess.length === 0" class="empty-state">
            <PenLine :size="40" class="empty-icon" />
            <p>Belum ada fess di kategori ini</p>
          </div>
        </div>
      </template>

      <!-- BASE YANG DIIKUTI -->
      <template v-else-if="modelValue === 'following'">
        <div class="following-search-wrap mb-4">
          <Search :size="16" class="following-search-icon" />
          <input v-model="followSearch" type="text" class="following-search-input" placeholder="Cari base yang diikuti..." />
        </div>

        <div class="section-label mb-3">{{ filteredFollowing.length }} Base Diikuti</div>
        <div v-if="followingLoading" class="empty-state">
          <p>Memuat base yang diikuti…</p>
        </div>
        <div v-else-if="followingError" class="empty-state">
          <p>Gagal memuat daftar base.</p>
          <button type="button" class="btn-save-primary mt-2" @click="loadFollowing">Coba lagi</button>
        </div>
        <div v-else class="following-list">
          <div v-for="base in filteredFollowing" :key="base.handle" class="following-card">
            <div class="following-avatar" :style="{ background: base.color }">
              {{ base.initial }}
            </div>
            <div class="following-info">
              <div class="following-name">{{ base.name }}</div>
              <div class="following-handle">{{ base.handle }} · {{ base.members }} anggota</div>
            </div>
            <button type="button" class="btn-unfollow" @click="unfollowBase(base.handle)">Berhenti</button>
          </div>
          <div v-if="filteredFollowing.length === 0" class="empty-state">
            <Star :size="40" class="empty-icon" />
            <p>Belum mengikuti base apapun</p>
          </div>
        </div>
      </template>

      <!-- NOTIFIKASI -->
      <template v-else-if="modelValue === 'notifications'">
        <div class="section-label mb-3">Preferensi Notifikasi</div>
        <div class="settings-card mb-4">
          <template v-for="(notif, idx) in notifSettings" :key="idx">
            <div class="settings-row">
              <div class="settings-row-text">
                <div class="settings-row-label">{{ notif.label }}</div>
                <div class="settings-row-sub">{{ notif.desc }}</div>
              </div>
              <div class="toggle-switch" :class="{ on: notif.on }" @click="notif.on = !notif.on">
                <span class="toggle-thumb" />
              </div>
            </div>
            <div v-if="idx < notifSettings.length - 1" class="settings-divider" />
          </template>
        </div>

        <div class="section-label mb-3">Notifikasi Terbaru</div>
        <div v-if="notifLoading" class="empty-state">
          <p>Memuat notifikasi…</p>
        </div>
        <div v-else-if="notifError" class="empty-state">
          <p>Gagal memuat notifikasi.</p>
          <button type="button" class="btn-save-primary mt-2" @click="loadNotifications">Coba lagi</button>
        </div>
        <div v-else-if="recentNotifs.length" class="notif-list">
          <div v-for="n in recentNotifs" :key="n.id" class="notif-card" :class="{ unread: !n.read }">
            <div class="notif-icon-wrap" :class="n.type">
              <component :is="n.icon" :size="16" />
            </div>
            <div class="notif-info">
              <div class="notif-text">{{ n.text }}</div>
              <div class="notif-time">{{ n.time }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <Bell :size="40" class="empty-icon" />
          <p>Belum ada notifikasi</p>
        </div>
      </template>

      <!-- BANTUAN -->
      <template v-else-if="modelValue === 'help'">
        <div class="help-hero mb-5">
          <HelpCircle :size="36" class="help-hero-icon" />
          <h2 class="help-hero-title">Pusat Bantuan Fess n Curious</h2>
          <p class="help-hero-sub">Ada masalah? Kami siap membantu 24/7</p>
        </div>

        <div class="section-label mb-3">Pertanyaan Umum</div>
        <div class="faq-list mb-5">
          <div v-for="faq in FAQS" :key="faq.id" class="faq-item" @click="faq.open = !faq.open">
            <div class="faq-question">
              {{ faq.q }}
              <ChevronDown :size="16" :class="{ rotated: faq.open }" />
            </div>
            <transition name="slide-fade">
              <div v-if="faq.open" class="faq-answer">{{ faq.a }}</div>
            </transition>
          </div>
        </div>

        <div class="section-label mb-3">Hubungi Kami</div>
        <div class="contact-cards">
          <a href="mailto:fessncurious@gmail.com" class="contact-card">
            <Mail :size="20" class="contact-icon" />
            <div>
              <div class="contact-title">Email Support</div>
              <div class="contact-val">fessncurious@gmail.com</div>
            </div>
          </a>
          <a href="#" class="contact-card">
            <MessageCircle :size="20" class="contact-icon" />
            <div>
              <div class="contact-title">Live Chat</div>
              <div class="contact-val">Buka setiap hari 08.00–22.00 WIB</div>
            </div>
          </a>
          <a
            href="https://fessncurious.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-card"
          >
            <ExternalLink :size="20" class="contact-icon" />
            <div>
              <div class="contact-title">Website</div>
              <div class="contact-val">fessncurious.vercel.app</div>
            </div>
          </a>
        </div>
      </template>

      <!-- LAPORKAN PELANGGARAN -->
      <template v-else-if="modelValue === 'report'">
        <div class="report-hero mb-5">
          <Flag :size="32" class="report-hero-icon" />
          <h2 class="report-hero-title">Laporkan Pelanggaran</h2>
          <p class="report-hero-sub">Bantu kami menjaga komunitas Fess n Curious tetap aman dan sehat.</p>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Jenis Pelanggaran *</label>
          <div class="report-type-grid">
            <button
              v-for="rt in REPORT_TYPES"
              :key="rt.key"
              type="button"
              class="report-type-btn"
              :class="{ active: reportType === rt.key }"
              @click="reportType = rt.key"
            >
              <component :is="rt.icon" :size="15" />
              {{ rt.label }}
            </button>
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Link / ID Konten yang Dilaporkan</label>
          <input v-model="reportLink" type="text" class="form-input" placeholder="Contoh: /fess/12345 atau @handle_user" />
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Keterangan Tambahan</label>
          <textarea v-model="reportDesc" class="form-textarea" rows="4" placeholder="Jelaskan secara singkat mengapa konten ini melanggar aturan..." />
        </div>

        <button type="button" class="btn-save-primary" :disabled="!reportType" @click="handleReport">
          <Flag :size="16" />
          Kirim Laporan
        </button>

        <div class="report-note mt-4">
          <Info :size="14" />
          Laporan kamu bersifat anonim. Tim moderasi akan meninjau dalam 1×24 jam.
        </div>
      </template>

      <!-- KETENTUAN LAYANAN -->
      <template v-else-if="modelValue === 'terms'">
        <div class="legal-hero mb-5">
          <ScrollText :size="36" class="legal-icon" />
          <h2 class="legal-title">Ketentuan Layanan</h2>
          <p class="legal-updated">Terakhir diperbarui: 1 Oktober 2026</p>
        </div>
        <div class="legal-content">
          <div v-for="sec in TERMS_SECTIONS" :key="sec.title" class="legal-section">
            <h3 class="legal-section-title">{{ sec.title }}</h3>
            <p v-for="(para, i) in sec.paragraphs" :key="i" class="legal-para">{{ para }}</p>
          </div>
        </div>
      </template>

      <!-- KEBIJAKAN PRIVASI -->
      <template v-else-if="modelValue === 'privacy'">
        <div class="legal-hero mb-5">
          <Shield :size="36" class="legal-icon" />
          <h2 class="legal-title">Kebijakan Privasi</h2>
          <p class="legal-updated">Terakhir diperbarui: 1 Oktober 2026</p>
        </div>
        <div class="legal-content">
          <div v-for="sec in PRIVACY_SECTIONS" :key="sec.title" class="legal-section">
            <h3 class="legal-section-title">{{ sec.title }}</h3>
            <p v-for="(para, i) in sec.paragraphs" :key="i" class="legal-para">{{ para }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * AccountPanels — slide-in panel system for all Account tab sub-pages.
 * Receives `modelValue` = action key (e.g. 'topup', 'security', …) or null.
 * Each section is rendered in-place so all page state is kept in this one component.
 */
import { ref, computed, reactive, watch } from 'vue';
import {
  ChevronLeft, ChevronDown, Coins, ShieldCheck, PenLine, Star, ThumbsUp,
  MessageCircle, Search, Bell, HelpCircle, Flag, ScrollText, Shield, Info,
  Mail, ExternalLink, Laptop, Wallet, AlertTriangle,
  UserX, Volume2, Bot,
} from 'lucide-vue-next';

import { api } from '../../api';
import { mapFessToPost } from '../../utils/fessMapper';
import { formatRelativeTime } from '../../utils/format';
import { useBases } from '../../composables/useBases';
import { useFollowBase } from '../../composables/useFollowBase';

const props = defineProps({
  modelValue: { type: String, default: null },
  user: { type: Object, default: null },
});

defineEmits(['update:modelValue']);

/* ---- Panel title map ---- */
const PANEL_TITLES = {
  topup: 'Saldo & Top Up',
  security: 'Keamanan Akun',
  'my-fess': 'Fess Saya',
  following: 'Base yang Diikuti',
  notifications: 'Notifikasi',
  help: 'Bantuan',
  report: 'Laporkan Pelanggaran',
  terms: 'Ketentuan Layanan',
  privacy: 'Kebijakan Privasi',
};
const panelTitle = computed(() => PANEL_TITLES[props.modelValue] ?? '');

/* ============================================================ TOP UP ============================================================ */
/** Read-only balance straight from the session user (no top-up API yet). */
const balance = computed(() => props.user?.balance ?? 0);

/* ============================================================ SECURITY ============================================================ */
const showChangePassword = ref(false);
const passwords = reactive({ old: '', new: '', confirm: '' });
const twoFa = ref(false);
const loginNotif = ref(true);
const passwordMessage = ref('');

/** Current session descriptor derived from the local browser (no sessions API). */
const currentSession = computed(() => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = /Windows/i.test(ua)
    ? 'Windows'
    : /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/i.test(ua)
        ? 'iOS'
        : /Mac OS X/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : 'Perangkat ini';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /Chrome\//i.test(ua)
      ? 'Chrome'
      : /Firefox\//i.test(ua)
        ? 'Firefox'
        : /Safari\//i.test(ua)
          ? 'Safari'
          : 'Browser';
  return {
    device: `${browser} · ${platform}`,
    location: 'Perangkat ini',
    time: 'Aktif sekarang',
  };
});

function handleChangePassword() {
  passwordMessage.value =
    'Ubah password belum tersedia dari aplikasi. Hubungi dukungan jika butuh bantuan.';
}

/* ============================================================ MY FESS ============================================================ */
const myFessTab = ref('all');

const myFesses = ref([]);
const myFessLoading = ref(false);
const myFessError = ref(null);

async function loadMyFesses() {
  myFessLoading.value = true;
  myFessError.value = null;
  try {
    const res = await api.getMyFesses({ page: 1, limit: 50 });
    myFesses.value = (res?.data ?? []).map((f) => {
      const post = mapFessToPost(f);
      return {
        id: post.id,
        base: post.handle,
        status: post.status,
        content: post.content,
        time: post.time,
        upvotes: post.likes,
        comments: post.commentsCount,
      };
    });
  } catch (e) {
    myFessError.value = e;
  } finally {
    myFessLoading.value = false;
  }
}

const STATUS_LABELS = {
  approved: 'Disetujui',
  pending: 'Menunggu',
  rejected: 'Ditolak',
};

const FESS_TABS = computed(() => [
  { key: 'all', label: 'Semua', count: myFesses.value.length },
  {
    key: 'approved',
    label: 'Disetujui',
    count: myFesses.value.filter((f) => f.status === 'approved').length,
  },
  {
    key: 'pending',
    label: 'Pending',
    count: myFesses.value.filter((f) => f.status === 'pending').length,
  },
  {
    key: 'rejected',
    label: 'Ditolak',
    count: myFesses.value.filter((f) => f.status === 'rejected').length,
  },
]);

const filteredMyFess = computed(() => {
  if (myFessTab.value === 'all') return myFesses.value;
  return myFesses.value.filter((f) => f.status === myFessTab.value);
});

/* ============================================================ FOLLOWING ============================================================ */
const { bases, ensureLoaded: ensureBasesLoaded } = useBases();
const { followedHandles, toggleFollowBase, syncFollowing } = useFollowBase();
const followSearch = ref('');
const followingLoading = ref(false);
const followingError = ref(null);

async function loadFollowing() {
  followingLoading.value = true;
  followingError.value = null;
  try {
    await syncFollowing();
    await ensureBasesLoaded();
  } catch (e) {
    followingError.value = e;
  } finally {
    followingLoading.value = false;
  }
}

const filteredFollowing = computed(() => {
  const q = followSearch.value.trim().toLowerCase();
  return bases.value.filter(
    (b) =>
      followedHandles.value.includes(b.handle) &&
      (!q || b.name.toLowerCase().includes(q) || b.handle.toLowerCase().includes(q)),
  );
});

async function unfollowBase(handle) {
  try {
    await toggleFollowBase(handle);
  } catch {
    // optimistic update already rolled back by the composable
  }
}

/* ============================================================ NOTIFICATIONS ============================================================ */
const notifSettings = reactive([
  { label: 'Komentar & Balasan', desc: 'Ketika ada yang membalas fess kamu', on: true },
  { label: 'Upvotes', desc: 'Ketika fess kamu mendapat upvote banyak', on: true },
  { label: 'Fess Disetujui', desc: 'Status moderasi fess kamu berubah', on: true },
  { label: 'Reward & CTF', desc: 'Kamu mendapat poin reward baru', on: true },
  { label: 'Pengumuman Platform', desc: 'Update fitur & pemeliharaan sistem', on: false },
]);

const recentNotifs = ref([]);
const notifLoading = ref(false);
const notifError = ref(null);

/** Presentation mapping for API notification types (icons are UI assets). */
const NOTIF_PRESENTATION = {
  vote: { icon: ThumbsUp, type: 'upvote' },
  comment: { icon: MessageCircle, type: 'comment' },
  moderation: { icon: ShieldCheck, type: 'approved' },
};

async function loadNotifications() {
  notifLoading.value = true;
  notifError.value = null;
  try {
    const res = await api.getNotifications({ page: 1, limit: 30 });
    const data = res?.data ?? [];
    recentNotifs.value = data.map((n) => {
      const pres = NOTIF_PRESENTATION[n.type] || { icon: Bell, type: 'system' };
      return {
        id: n.id,
        type: pres.type,
        icon: pres.icon,
        text: n.fess_content ? `${n.text} — "${n.fess_content}"` : n.text,
        time: formatRelativeTime(n.created_at ?? Date.now()),
        read: n.read,
      };
    });

    const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length) api.markNotificationsRead(unreadIds).catch(() => {});
  } catch (e) {
    notifError.value = e;
  } finally {
    notifLoading.value = false;
  }
}

/* ---- Lazy data loading: fetch each panel's data when it opens ---- */
watch(
  () => props.modelValue,
  (panel) => {
    if (panel === 'my-fess') loadMyFesses();
    else if (panel === 'following') loadFollowing();
    else if (panel === 'notifications') loadNotifications();
  },
);

/* ============================================================ HELP ============================================================ */
const FAQS = reactive([
  { id: 1, q: 'Apa itu CTF dan bagaimana cara mendapatkannya?', a: 'CTF (Coin to Fess) adalah mata uang virtual di Fess n Curious. Kamu bisa mendapatkan CTF dengan top up, mendapat reward dari fess populer, atau dari program referral.', open: false },
  { id: 2, q: 'Apakah identitas saya aman saat mengirim fess?', a: 'Ya, Fess n Curious menggunakan sistem anonymisasi berlapis. Handle kamu tidak pernah ditampilkan di feed publik. Setiap thread menggunakan alias yang berbeda-beda.', open: false },
  { id: 3, q: 'Berapa lama proses moderasi fess?', a: 'Rata-rata fess dimoderasi dalam 15-30 menit. Pada jam sibuk (18.00-22.00 WIB) bisa memakan waktu hingga 2 jam.', open: false },
  { id: 4, q: 'Bagaimana cara membuat Base Confess sendiri?', a: 'Daftar akun Base Confess di /register/base, lalu lengkapi profil base kamu. Tim kami akan memverifikasi dalam 1x24 jam setelah pengajuan.', open: false },
  { id: 5, q: 'Apakah saya bisa menghapus fess yang sudah terkirim?', a: 'Fess yang sudah disetujui dan dipublikasikan tidak bisa dihapus langsung. Kamu bisa mengajukan permintaan hapus melalui menu Laporkan Pelanggaran dengan pilih "Hapus Konten Saya".', open: false },
]);

/* ============================================================ REPORT ============================================================ */
const reportType = ref(null);
const reportLink = ref('');
const reportDesc = ref('');

const REPORT_TYPES = [
  { key: 'spam', label: 'Spam', icon: Volume2 },
  { key: 'hate', label: 'Ujaran Kebencian', icon: AlertTriangle },
  { key: 'harassment', label: 'Pelecehan', icon: UserX },
  { key: 'misinformation', label: 'Hoaks', icon: Info },
  { key: 'bot', label: 'Akun Bot', icon: Bot },
  { key: 'other', label: 'Lainnya', icon: Flag },
];

function handleReport() {
  if (!reportType.value) return;
  reportType.value = null;
  reportLink.value = '';
  reportDesc.value = '';
}

/* ============================================================ TERMS ============================================================ */
const TERMS_SECTIONS = [
  {
    title: '1. Penerimaan Ketentuan',
    paragraphs: [
      'Dengan mengakses atau menggunakan layanan Fess n Curious ("Platform"), kamu menyetujui ketentuan layanan ini secara menyeluruh. Jika tidak setuju, harap hentikan penggunaan Platform.',
      'Fess n Curious berhak memperbarui ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui notifikasi di dalam aplikasi atau email terdaftar.',
    ],
  },
  {
    title: '2. Layanan Platform',
    paragraphs: [
      'Fess n Curious menyediakan platform pengiriman pesan anonim (confession/fess) dalam berbagai komunitas tematik yang disebut "Base". Setiap Base dikelola oleh Base Admin yang telah terverifikasi.',
      'Penggunaan Platform hanya diperuntukkan bagi pengguna berusia 13 tahun ke atas. Pengguna di bawah 17 tahun wajib mendapat izin orang tua atau wali.',
    ],
  },
  {
    title: '3. Konten Terlarang',
    paragraphs: [
      'Dilarang keras mengirim konten yang mengandung: SARA, pelecehan seksual, kekerasan eksplisit, informasi palsu (hoaks), promosi produk ilegal, atau konten yang melanggar hak cipta pihak ketiga.',
      'Pelanggaran dapat mengakibatkan pembekuan akun sementara hingga penutupan akun permanen tanpa pengembalian saldo CTF.',
    ],
  },
  {
    title: '4. Mata Uang Virtual (CTF)',
    paragraphs: [
      'CTF (Coin to Fess) adalah mata uang virtual yang hanya berlaku di dalam ekosistem Fess n Curious. CTF tidak dapat dikonversi kembali ke uang tunai atau mata uang lainnya.',
      'Top up CTF bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali terdapat kesalahan teknis yang terbukti dari pihak Fess n Curious.',
    ],
  },
  {
    title: '5. Privasi & Keamanan',
    paragraphs: [
      'Fess n Curious berkomitmen melindungi privasi penggunanya. Sistem anonymisasi berlapis memastikan identitas kamu tidak bocor ke publik atau sesama pengguna.',
      'Data pengguna tidak dijual atau dibagikan kepada pihak ketiga untuk keperluan komersial tanpa persetujuan eksplisit.',
    ],
  },
  {
    title: '6. Pembatasan Tanggung Jawab',
    paragraphs: [
      'Fess n Curious tidak bertanggung jawab atas konten yang dikirim oleh pengguna. Tanggung jawab konten sepenuhnya berada pada pengirim.',
      'Platform disediakan "as is". Fess n Curious tidak menjamin ketersediaan layanan 100% dan tidak bertanggung jawab atas kerugian akibat gangguan sistem.',
    ],
  },
];

/* ============================================================ PRIVACY ============================================================ */
const PRIVACY_SECTIONS = [
  {
    title: '1. Informasi yang Kami Kumpulkan',
    paragraphs: [
      'Saat mendaftar: email, username/alias, dan password yang terenkripsi. Kami tidak menyimpan password dalam bentuk teks biasa.',
      'Saat menggunakan Platform: fess yang kamu kirim (terenkripsi), riwayat voting, base yang diikuti, dan data penggunaan aplikasi yang anonim untuk keperluan analitik internal.',
    ],
  },
  {
    title: '2. Cara Kami Menggunakan Data',
    paragraphs: [
      'Data digunakan untuk: menyediakan dan meningkatkan layanan, verifikasi akun, moderasi konten, pencegahan penipuan, dan komunikasi terkait akun (contoh: notifikasi moderasi).',
      'Kami tidak menggunakan data kamu untuk iklan bertarget dari pihak ketiga.',
    ],
  },
  {
    title: '3. Anonymisasi & Perlindungan Identitas',
    paragraphs: [
      'Fess n Curious menggunakan sistem anonymisasi berlapis. Fess yang kamu kirim diproses melalui sistem enkripsi sebelum diteruskan ke Base Admin. Base Admin tidak dapat mengetahui identitas asli pengirim fess.',
      'Handle publik yang muncul di komentar adalah alias acak yang berbeda di setiap thread — tidak terhubung dengan akun asli kamu.',
    ],
  },
  {
    title: '4. Berbagi Data dengan Pihak Ketiga',
    paragraphs: [
      'Kami tidak menjual data pribadi kamu kepada pihak ketiga. Data hanya dibagikan dalam kondisi: (a) kamu memberikan persetujuan eksplisit, (b) diwajibkan oleh hukum, atau (c) untuk melindungi keamanan pengguna lain.',
      'Penyedia layanan teknis (server, analitik) yang kami gunakan terikat perjanjian kerahasiaan dan tidak diizinkan menggunakan data untuk tujuan lain.',
    ],
  },
  {
    title: '5. Keamanan Data',
    paragraphs: [
      'Kami menggunakan enkripsi TLS untuk semua transmisi data dan enkripsi AES-256 untuk data sensitif yang disimpan di server.',
      'Meskipun demikian, tidak ada sistem yang 100% aman. Kami menyarankan kamu menggunakan password yang kuat dan mengaktifkan 2FA.',
    ],
  },
  {
    title: '6. Hak Pengguna',
    paragraphs: [
      'Kamu berhak untuk: mengakses data pribadi kamu, memperbaiki data yang tidak akurat, meminta penghapusan akun dan seluruh data terkait, serta mengunduh salinan data kamu (data portability).',
      'Untuk mengajukan permintaan terkait data, hubungi kami di fessncurious@gmail.com atau melalui menu Bantuan di dalam aplikasi.',
    ],
  },
  {
    title: '7. Cookie & Penyimpanan Lokal',
    paragraphs: [
      'Fess n Curious menggunakan localStorage browser untuk menyimpan sesi login dan preferensi tema. Tidak ada cookie pihak ketiga untuk pelacakan iklan yang dipasang di Platform.',
    ],
  },
];
</script>

<style scoped>
/* ====== Panel Wrapper ====== */
.account-panel {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--shell-stage);
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
  color: var(--shell-text);
}

.account-panel.open {
  transform: translateX(0);
}

/* ====== Header ====== */
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--shell-header-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--shell-border);
  flex-shrink: 0;
}

.panel-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--shell-chip);
  border: none;
  color: var(--shell-text);
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.panel-back-btn:hover {
  background: var(--shell-border);
}

.panel-header-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--shell-text);
  flex: 1;
  text-align: center;
}

.panel-header-spacer {
  width: 36px;
  flex-shrink: 0;
}

/* ====== Body ====== */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 48px;
  scrollbar-width: thin;
  scrollbar-color: var(--shell-chip) transparent;
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
}

/* ====== Shared Section Label ====== */
.section-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: var(--shell-text-muted);
}

/* ====== Shared Settings Card ====== */
.settings-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.settings-row-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--shell-text);
}

.settings-row-sub {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.settings-row-val {
  font-size: 13px;
  color: var(--shell-text-muted);
}

.settings-link-btn {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-accent);
  cursor: pointer;
}

.settings-divider {
  height: 1px;
  background: var(--shell-border);
  margin: 0 16px;
}

/* Teks label/sub mengisi ruang — tombol on/off selalu rata kanan (desktop & mobile) */
.settings-row-text {
  flex: 1;
  min-width: 0;
}

.settings-row > .toggle-switch {
  margin-left: auto;
}

/* ====== Toggle Switch ====== */
.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--shell-accent);
  border-color: var(--shell-accent);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px);
}

/* ====== Button ====== */
.btn-save-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: 14px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn-save-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-save-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== Form ====== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 14px;
  color: var(--shell-text);
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--shell-accent);
}

.form-textarea {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 14px;
  color: var(--shell-text);
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: var(--shell-accent);
}

/* ====== TOP UP ====== */
.balance-hero-card {
  background: linear-gradient(135deg, var(--shell-sub-accent) 0%, var(--brand-blue) 100%);
  border-radius: 22px;
  padding: 24px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(112, 0, 255, 0.35);
}

.balance-hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%);
}

.balance-hero-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  position: relative;
}

.balance-hero-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0 4px;
  position: relative;
}

.balance-coin-icon {
  color: var(--shell-accent);
}

.balance-hero-amount > span:not(.balance-unit) {
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}

.balance-unit {
  font-size: 16px;
  font-weight: 800;
  color: rgba(255,255,255,0.7);
  align-self: flex-end;
  margin-bottom: 4px;
}

.balance-hero-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  position: relative;
}

.topup-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.topup-pkg-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.topup-pkg-card:hover {
  border-color: var(--shell-accent);
  transform: translateY(-2px);
}

.topup-pkg-card.is-popular {
  border-color: var(--shell-accent);
  background: rgba(186, 255, 0, 0.06);
}

.topup-popular-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
}

.topup-ctf {
  font-size: 13px;
  font-weight: 900;
  color: var(--shell-text);
}

.topup-idr {
  font-size: 11px;
  color: var(--shell-text-muted);
}

.topup-bonus {
  font-size: 10px;
  font-weight: 700;
  color: var(--shell-accent);
  background: rgba(186,255,0,0.12);
  padding: 2px 8px;
  border-radius: 99px;
}

.topup-confirm-section {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 16px;
}

.topup-confirm-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--shell-text-muted);
  padding: 4px 0;
}

.topup-confirm-val {
  font-weight: 800;
  color: var(--shell-text);
}

.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-method-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--shell-chip);
  border: 1.5px solid var(--shell-border);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-btn.active {
  border-color: var(--shell-accent);
  background: rgba(186,255,0,0.1);
  color: var(--shell-accent);
}

.btn-topup-now {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: 14px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
}

.tx-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-icon-wrap.in {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success-text);
}

.tx-icon-wrap.out {
  background: rgba(248, 113, 113, 0.12);
  color: var(--danger-text);
}

.tx-info { flex: 1; min-width: 0; }

.tx-desc {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text);
}

.tx-time {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.tx-amount {
  font-size: 13px;
  font-weight: 800;
}

.tx-amount.in { color: var(--success-text); }
.tx-amount.out { color: var(--danger-text); }

/* ====== SECURITY ====== */
.security-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 16px;
}

.security-icon { color: var(--success-text); flex-shrink: 0; }
.security-title { font-size: 14px; font-weight: 800; color: var(--shell-text); }
.security-desc { font-size: 12px; color: var(--shell-text-muted); margin-top: 2px; }

.change-password-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.session-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--shell-border);
}

.session-row:last-child { border-bottom: none; }

.session-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--shell-chip);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.session-device {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text);
}

.session-meta {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.session-current-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: var(--success-text);
  background: rgba(34, 197, 94, 0.12);
  padding: 3px 10px;
  border-radius: 99px;
}

.session-revoke-btn {
  margin-left: auto;
  background: none;
  border: 1px solid var(--danger-text);
  border-radius: 8px;
  color: var(--danger-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
}

/* ====== MY FESS ====== */
.fess-filter-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.fess-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.fess-tab-btn.active {
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border-color: var(--shell-accent);
}

.fess-tab-count {
  background: rgba(255,255,255,0.15);
  padding: 1px 7px;
  border-radius: 99px;
  font-size: 11px;
}

.my-fess-list { display: flex; flex-direction: column; gap: 10px; }

.my-fess-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px 16px;
}

.my-fess-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.my-fess-base {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-accent);
}

.my-fess-status-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
}

.my-fess-status-badge.approved { background: rgba(34,197,94,0.12); color: var(--success-text); }
.my-fess-status-badge.pending { background: rgba(245,158,11,0.12); color: var(--warning-text); }
.my-fess-status-badge.rejected { background: rgba(248,113,113,0.12); color: var(--danger-text); }

.my-fess-content {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--shell-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.my-fess-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.my-fess-time { font-size: 11.5px; color: var(--shell-text-muted); }

.my-fess-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--shell-text-muted);
}

.my-fess-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ====== FOLLOWING ====== */
.following-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.following-search-icon {
  position: absolute;
  left: 12px;
  color: var(--shell-text-muted);
  pointer-events: none;
}

.following-search-input {
  width: 100%;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 11px 14px 11px 36px;
  font-family: inherit;
  font-size: 14px;
  color: var(--shell-text);
  outline: none;
}

.following-search-input:focus {
  border-color: var(--shell-accent);
}

.following-list { display: flex; flex-direction: column; gap: 8px; }

.following-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
}

.following-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}

.following-name { font-size: 14px; font-weight: 700; color: var(--shell-text); }
.following-handle { font-size: 11.5px; color: var(--shell-text-muted); margin-top: 2px; }

.btn-unfollow {
  margin-left: auto;
  background: none;
  border: 1px solid var(--shell-border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
  padding: 5px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-unfollow:hover {
  border-color: var(--danger-text);
  color: var(--danger-text);
}

/* ====== NOTIFICATIONS ====== */
.notif-list { display: flex; flex-direction: column; gap: 8px; }

.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
}

.notif-card.unread {
  background: rgba(186, 255, 0, 0.04);
  border-color: rgba(186, 255, 0, 0.18);
}

.notif-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon-wrap.upvote { background: rgba(30,69,251,0.15); color: #60a5fa; }
.notif-icon-wrap.comment { background: rgba(186,255,0,0.12); color: var(--shell-accent); }
.notif-icon-wrap.approved { background: rgba(34,197,94,0.12); color: var(--success-text); }
.notif-icon-wrap.reward { background: rgba(245,158,11,0.12); color: var(--warning-text); }

.notif-text { font-size: 13px; line-height: 1.4; color: var(--shell-text); }
.notif-time { font-size: 11px; color: var(--shell-text-muted); margin-top: 3px; }

/* ====== HELP ====== */
.help-hero {
  text-align: center;
  padding: 8px 0 4px;
}

.help-hero-icon { color: var(--shell-accent); margin: 0 auto 12px; display: block; }
.help-hero-title { font-size: 20px; font-weight: 900; color: var(--shell-text); }
.help-hero-sub { font-size: 13px; color: var(--shell-text-muted); margin-top: 4px; }

.faq-list { display: flex; flex-direction: column; gap: 6px; }

.faq-item {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.faq-item:hover { border-color: var(--shell-accent); }

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--shell-text);
}

.faq-question svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
  color: var(--shell-text-muted);
}

.faq-question .rotated {
  transform: rotate(180deg);
}

.faq-answer {
  font-size: 13px;
  line-height: 1.55;
  color: var(--shell-text-muted);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--shell-border);
}

.contact-cards { display: flex; flex-direction: column; gap: 8px; }

.contact-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.contact-card:hover { border-color: var(--shell-accent); }

.contact-icon { color: var(--shell-accent); flex-shrink: 0; }
.contact-title { font-size: 14px; font-weight: 700; color: var(--shell-text); }
.contact-val { font-size: 12px; color: var(--shell-text-muted); margin-top: 2px; }

/* ====== REPORT ====== */
.report-hero {
  text-align: center;
  padding: 8px 0 4px;
}

.report-hero-icon { color: var(--danger-text); margin: 0 auto 12px; display: block; }
.report-hero-title { font-size: 20px; font-weight: 900; color: var(--shell-text); }
.report-hero-sub { font-size: 13px; color: var(--shell-text-muted); margin-top: 4px; }

.report-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.report-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 8px;
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-type-btn.active {
  border-color: var(--danger-text);
  background: rgba(248,113,113,0.08);
  color: var(--danger-text);
}

.report-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--shell-text-muted);
  line-height: 1.45;
}

/* ====== LEGAL ====== */
.legal-hero {
  text-align: center;
  padding: 8px 0 4px;
}

.legal-icon { color: var(--shell-accent); margin: 0 auto 12px; display: block; }
.legal-title { font-size: 20px; font-weight: 900; color: var(--shell-text); }
.legal-updated { font-size: 12px; color: var(--shell-text-muted); margin-top: 4px; }

.legal-content { display: flex; flex-direction: column; gap: 20px; }

.legal-section {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.legal-section-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--shell-text);
  margin-bottom: 10px;
}

.legal-para {
  font-size: 13px;
  line-height: 1.6;
  color: var(--shell-text-muted);
  margin-bottom: 8px;
}

.legal-para:last-child { margin-bottom: 0; }

/* ====== Empty State ====== */
.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--shell-text-muted);
}

.empty-icon {
  margin: 0 auto 12px;
  display: block;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  font-weight: 600;
}

/* ====== Transitions ====== */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 800px;
}
</style>
