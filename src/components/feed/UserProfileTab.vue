<template>
  <section class="user-profile-ig-stage" aria-label="Profil Pengguna">
    <!-- TOP BAR (IG Style: Username & Right Hamburger Menu) -->
    <div class="ig-top-bar">
      <div class="ig-top-left">
        <span class="ig-handle-title">{{ userHandle }}</span>
        <span class="ig-badge-anon" title="Pengirim Anonim">ANON</span>
      </div>

      <div class="ig-top-right">
        <button
          type="button"
          class="btn-hamburger"
          aria-label="Buka Pengaturan"
          title="Pengaturan"
          @click="showSettingsDrawer = true"
        >
          <Menu :size="24" />
        </button>
      </div>
    </div>

    <!-- PROFILE HERO (IG Style: Center Avatar, Edit Profile Button, Name & Bio) -->
    <div class="ig-profile-header">
      <!-- Centered Avatar with Story Ring Feel -->
      <div class="ig-avatar-wrapper">
        <div class="ig-avatar-ring">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="displayName"
            class="ig-avatar-img"
            @error="onAvatarError"
          />
          <div v-else class="ig-avatar-fallback">
            <UserRound :size="46" />
          </div>
        </div>

        <button
          type="button"
          class="ig-avatar-edit-badge"
          aria-label="Ubah foto profil"
          title="Ubah foto profil"
          @click="openEditModal"
        >
          <Camera :size="14" />
        </button>
      </div>

      <!-- Centered Name & Username -->
      <div class="ig-user-info">
        <h2 class="ig-display-name">{{ displayName }}</h2>
        <div class="ig-username-sub">{{ userHandle }}</div>
        <p class="ig-bio-text">{{ userBio }}</p>
      </div>

      <!-- Action Button: Edit Profil -->
      <div class="ig-actions-row">
        <button type="button" class="btn-edit-profile" @click="openEditModal">
          <Edit3 :size="15" />
          <span>Edit Profil</span>
        </button>
      </div>

      <!-- Quick Stats Strip (IG Style: Fess, Mengikuti, Saldo MFC) -->
      <div class="ig-stats-strip">
        <button type="button" class="ig-stat-col" @click="activeSubTab = 'fess'">
          <span class="ig-stat-num">{{ myFessCount }}</span>
          <span class="ig-stat-lbl">Fess Saya</span>
        </button>

        <div class="ig-stat-divider" />

        <button type="button" class="ig-stat-col" @click="activeSubTab = 'following'">
          <span class="ig-stat-num">{{ followedBasesCount }}</span>
          <span class="ig-stat-lbl">Mengikuti</span>
        </button>

        <div class="ig-stat-divider" />

        <button type="button" class="ig-stat-col" @click="activeSubTab = 'saldo'">
          <span class="ig-stat-num ig-stat-num--accent">{{ balance }}</span>
          <span class="ig-stat-lbl">Saldo MFC</span>
        </button>
      </div>
    </div>

    <!-- 3 SUB-TABS (IG Profile Tabs: Fess Saya, Base yang Diikuti, Saldo & Top Up) -->
    <div class="ig-nav-tabs" role="tablist" aria-label="Tab Profil">
      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'fess'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'fess' }"
        @click="activeSubTab = 'fess'"
      >
        <MessageSquare :size="18" />
        <span>Fess Saya</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'following'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'following' }"
        @click="activeSubTab = 'following'"
      >
        <Star :size="18" />
        <span>Base Diikuti</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'saldo'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'saldo' }"
        @click="activeSubTab = 'saldo'"
      >
        <CreditCard :size="18" />
        <span>Saldo & Top Up</span>
      </button>
    </div>

    <!-- TAB CONTENTS -->
    <div class="ig-tab-content-area">
      <!-- TAB 1: FESS SAYA -->
      <div v-if="activeSubTab === 'fess'" class="tab-pane-fade">
        <div class="tab-pane-header">
          <span class="tab-pane-title">Riwayat Kiriman Confession</span>
          <button type="button" class="btn-create-small" @click="$emit('openCompose')">
            <Plus :size="14" /> Kirim Fess Baru
          </button>
        </div>

        <div v-if="myFesses.length" class="my-fess-list">
          <article v-for="item in myFesses" :key="item.id" class="my-fess-card">
            <div class="my-fess-top">
              <span class="my-fess-base">{{ item.base }}</span>
              <span class="my-fess-status" :class="`status--${item.status}`">
                {{ item.status === 'approved' ? 'Terbit' : 'Menunggu Moderasi' }}
              </span>
            </div>

            <p class="my-fess-text">{{ item.content }}</p>

            <div class="my-fess-footer">
              <span class="my-fess-time">{{ item.time }}</span>
              <div class="my-fess-metrics">
                <span class="inline-flex items-center gap-1"><Heart :size="13" /> {{ item.likes }}</span>
                <span class="inline-flex items-center gap-1"><MessageCircle :size="13" /> {{ item.comments }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-tab-state">
          <MessageSquare :size="40" class="empty-tab-icon" />
          <p class="empty-tab-title">Belum ada fess terkirim</p>
          <p class="empty-tab-sub">Confession yang kamu kirimkan akan tersimpan secara anonim di sini.</p>
          <button type="button" class="btn-primary-pill mt-4" @click="$emit('openCompose')">
            Kirim Fess Sekarang
          </button>
        </div>
      </div>

      <!-- TAB 2: BASE YANG DIIKUTI -->
      <div v-else-if="activeSubTab === 'following'" class="tab-pane-fade">
        <div class="tab-pane-header">
          <span class="tab-pane-title">Komunitas Base Diikuti ({{ myFollowedBases.length }})</span>
        </div>

        <div class="following-search-box mb-4">
          <Search :size="16" class="search-icon" />
          <input
            v-model="baseSearchQuery"
            type="text"
            placeholder="Cari base yang diikuti…"
            class="following-search-input"
          />
        </div>

        <div v-if="filteredFollowedBases.length" class="following-list">
          <div
            v-for="base in filteredFollowedBases"
            :key="base.handle"
            class="following-card"
          >
            <div
              class="following-info-col"
              @click="goToBase(base.handle)"
              title="Lihat profil base"
            >
              <div class="following-avatar" :style="{ background: base.color || '#2d68ff' }">
                {{ base.name.charAt(0) }}
              </div>
              <div class="following-details">
                <div class="following-name">{{ base.name }}</div>
                <div class="following-handle">{{ base.handle }} • {{ base.members }}</div>
              </div>
            </div>
            <button
              type="button"
              class="btn-unfollow"
              @click="handleUnfollow(base.handle)"
            >
              Mengikuti
            </button>
          </div>
        </div>

        <div v-else class="empty-tab-state">
          <Star :size="40" class="empty-tab-icon" />
          <p class="empty-tab-title">Tidak ada base ditemukan</p>
          <p class="empty-tab-sub">Jelajahi dan ikuti base confession favoritmu di tab Search.</p>
        </div>
      </div>

      <!-- TAB 3: SALDO & TOP UP -->
      <div v-else-if="activeSubTab === 'saldo'" class="tab-pane-fade">
        <!-- Saldo Hero Card -->
        <div class="balance-mfc-card">
          <div class="balance-mfc-header">
            <div>
              <div class="balance-mfc-label">SALDO AKUN KAMU</div>
              <div class="balance-mfc-val">
                <Coins :size="32" class="balance-mfc-icon" />
                <span>{{ balance }}</span>
                <span class="balance-mfc-unit">MFC</span>
              </div>
            </div>
            <div class="balance-mfc-status">
              <span class="mfc-status-pill">Status: Aktif</span>
            </div>
          </div>
          <p class="balance-mfc-note">
            1 MFC = 1 kali kirim confession reguler tanpa antrian.
          </p>
        </div>

        <!-- Top Up Packages -->
        <div class="section-heading-row mt-6 mb-3">
          <span class="section-heading-title">Pilih Paket Top Up MFC</span>
          <span class="section-heading-hint">Instan & Otomatis</span>
        </div>

        <div class="mfc-packages-grid">
          <div
            v-for="pkg in TOPUP_PACKAGES"
            :key="pkg.mfc"
            class="mfc-pkg-card"
            :class="{ active: selectedPkg?.mfc === pkg.mfc, popular: pkg.popular }"
            @click="selectedPkg = pkg"
          >
            <span v-if="pkg.popular" class="pkg-popular-tag">TERPOPULER</span>
            <div class="pkg-mfc-amount">{{ pkg.mfc }} MFC</div>
            <div class="pkg-price">Rp {{ pkg.idr.toLocaleString('id-ID') }}</div>
            <div v-if="pkg.bonus" class="pkg-bonus">{{ pkg.bonus }}</div>
          </div>
        </div>

        <!-- Payment Methods & Checkout button -->
        <div v-if="selectedPkg" class="checkout-box mt-5">
          <div class="checkout-summary-row">
            <span>Paket Dipilih:</span>
            <strong>{{ selectedPkg.mfc }} MFC (Rp {{ selectedPkg.idr.toLocaleString('id-ID') }})</strong>
          </div>

          <div class="payment-method-selector mt-3">
            <div class="payment-label mb-2">Metode Pembayaran:</div>
            <div class="payment-pills">
              <button
                v-for="method in PAYMENT_METHODS"
                :key="method.key"
                type="button"
                class="pm-btn"
                :class="{ active: selectedPayment === method.key }"
                @click="selectedPayment = method.key"
              >
                {{ method.name }}
              </button>
            </div>
          </div>

          <button
            type="button"
            class="btn-bayar-mfc mt-4"
            :disabled="isProcessingTopUp"
            @click="handleProcessTopUp"
          >
            <Coins :size="16" />
            <span v-if="isProcessingTopUp">Memproses Pembayaran…</span>
            <span v-else>Bayar Rp {{ selectedPkg.idr.toLocaleString('id-ID') }}</span>
          </button>
        </div>

        <div v-if="topupSuccessMessage" class="alert-success mt-4">
          <CheckCircle2 :size="18" />
          <span>{{ topupSuccessMessage }}</span>
        </div>
      </div>
    </div>

    <!-- SETTINGS DRAWER / SLIDE-IN MODAL (When Hamburger Menu is clicked) -->
    <div
      v-if="showSettingsDrawer"
      class="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pengaturan"
      @click.self="showSettingsDrawer = false"
    >
      <div class="settings-drawer-panel">
        <div class="drawer-header">
          <span class="drawer-title">Pengaturan</span>
          <button
            type="button"
            class="btn-drawer-close"
            aria-label="Tutup pengaturan"
            @click="showSettingsDrawer = false"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="drawer-body">
          <!-- 1. Tampilan (Theme) -->
          <div class="settings-group">
            <div class="settings-row-static">
              <div class="row-info">
                <Sun :size="18" class="row-icon" />
                <span class="row-label">Tampilan Tema</span>
              </div>
              <div class="theme-segmented-pills" role="radiogroup" aria-label="Mode tampilan">
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'system' }"
                  @click="$emit('setTheme', 'system')"
                >
                  Sistem
                </button>
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'light' }"
                  @click="$emit('setTheme', 'light')"
                >
                  Terang
                </button>
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'dark' }"
                  @click="$emit('setTheme', 'dark')"
                >
                  Gelap
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Items List -->
          <div class="settings-group mt-3">
            <!-- 2. Notifikasi -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('notifications')"
            >
              <div class="row-info">
                <Bell :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Notifikasi</div>
                  <div class="row-desc">Atur pemberitahuan fess & aktivitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 3. Bantuan -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('help')"
            >
              <div class="row-info">
                <HelpCircle :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Bantuan</div>
                  <div class="row-desc">FAQ & Pusat Dukungan FessHub</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 4. Ketentuan Layanan -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('terms')"
            >
              <div class="row-info">
                <ScrollText :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Ketentuan Layanan</div>
                  <div class="row-desc">Aturan penggunaan & panduan komunitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 5. Kebijakan Privasi -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('privacy')"
            >
              <div class="row-info">
                <Shield :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Kebijakan Privasi</div>
                  <div class="row-desc">Perlindungan data & privasi anonimitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 6. Keamanan & Ganti Password -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('security')"
            >
              <div class="row-info">
                <KeyRound :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Keamanan & Ganti Password</div>
                  <div class="row-desc">Email, kata sandi & sesi login</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>
          </div>

          <!-- 7. Logout / Keluar -->
          <div class="settings-group mt-4">
            <button type="button" class="settings-menu-item item--danger" @click="confirmLogout">
              <div class="row-info">
                <LogOut :size="18" class="row-icon icon--danger" />
                <span class="row-label label--danger">Keluar dari Akun</span>
              </div>
              <ChevronRight :size="16" class="chevron-icon icon--danger" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT PROFILE MODAL -->
    <div
      v-if="showEditModal"
      class="edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profil"
      @click.self="showEditModal = false"
    >
      <div class="edit-modal-card">
        <div class="edit-modal-header">
          <h3 class="edit-modal-title">Edit Profil</h3>
          <button
            type="button"
            class="btn-close-modal"
            aria-label="Tutup"
            @click="showEditModal = false"
          >
            <X :size="18" />
          </button>
        </div>

        <form class="edit-modal-body" @submit.prevent="saveProfile">
          <!-- Avatar Picker with Custom Upload & Presets -->
          <div class="edit-avatar-section">
            <div class="edit-avatar-preview-box">
              <img :src="editForm.avatar" alt="Preview Foto" class="edit-avatar-preview" />
            </div>
            <div class="edit-avatar-controls">
              <div class="avatar-controls-top">
                <span class="edit-avatar-label">Foto Profil:</span>
                <label class="btn-upload-avatar-chip">
                  <Upload :size="12" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="handleAvatarFileSelect"
                  />
                </label>
              </div>
              <div class="avatar-presets">
                <button
                  v-for="(preset, i) in AVATAR_PRESETS"
                  :key="i"
                  type="button"
                  class="btn-preset-avatar"
                  :class="{ selected: editForm.avatar === preset }"
                  @click="editForm.avatar = preset"
                >
                  <img :src="preset" :alt="`Avatar ${i+1}`" />
                </button>
              </div>
            </div>
          </div>

          <!-- Display Name -->
          <div class="form-group mt-4">
            <label for="edit-name" class="form-label">Nama Tampilan</label>
            <input
              id="edit-name"
              v-model="editForm.username"
              type="text"
              class="form-input"
              placeholder="Nama kamu"
              required
            />
          </div>

          <!-- Handle -->
          <div class="form-group mt-3">
            <label for="edit-handle" class="form-label">Username / Handle</label>
            <input
              id="edit-handle"
              v-model="editForm.handle"
              type="text"
              class="form-input"
              placeholder="@username"
              required
            />
          </div>

          <!-- Bio -->
          <div class="form-group mt-2">
            <label for="edit-bio" class="form-label">Bio Profil</label>
            <textarea
              id="edit-bio"
              v-model="editForm.bio"
              rows="2"
              class="form-textarea"
              placeholder="Ceritakan tentang dirimu..."
            ></textarea>
          </div>

          <div class="edit-modal-footer mt-5">
            <button
              type="button"
              class="btn-cancel"
              @click="showEditModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn-save">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * UserProfileTab — Instagram-style User Profile tab.
 *
 * Requirements fulfilled:
 * 1. Top bar: username on left, hamburger menu (☰) on far right.
 * 2. Hamburger button opens Settings: Tampilan (theme), Notif, Bantuan, Ketentuan Layanan,
 *    Kebijakan Privasi, Keamanan & Ganti Password, Logout.
 * 3. Centered profile photo, "Edit Profil" button, Name/Username and bio below it.
 * 4. 3 interactive sub-tabs: Fess Saya, Base yang Diikuti, Saldo & Top Up.
 * 5. Pinned bottom navbar stays active and visible.
 */
import { ref, computed } from 'vue';
import {
  Menu,
  X,
  Edit3,
  Camera,
  UserRound,
  Sun,
  Bell,
  HelpCircle,
  ScrollText,
  Shield,
  KeyRound,
  LogOut,
  Coins,
  MessageSquare,
  Star,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  Heart,
  MessageCircle,
  Upload,
} from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import { ALL_BASES } from '../../data/bases';

const props = defineProps({
  themeMode: { type: String, default: 'system' },
});

const emit = defineEmits([
  'setTheme',
  'logout',
  'openCompose',
  'openSubPanel',
]);

const authStore = useAuthStore();
const router = useRouter();

function goToBase(handle) {
  if (!handle) return;
  const clean = handle.replace(/^@/, '');
  router.push(`/base/${clean}`);
}

/* ---------- Profile State ---------- */
const displayName = computed(() => authStore.user?.username || 'Pengguna Anonim');
const userHandle = computed(() => authStore.user?.handle || '@anon_user');
const userBio = computed(
  () => authStore.user?.bio || 'Secret sender & casual reader di FessHub.',
);
const userAvatar = computed(
  () =>
    authStore.user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
);

/* ---------- Sub Tabs State ---------- */
const activeSubTab = ref('fess'); // 'fess' | 'following' | 'saldo'

/* ---------- Drawers & Modals ---------- */
const showSettingsDrawer = ref(false);
const showEditModal = ref(false);

/* ---------- Edit Profile Form ---------- */
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
];

const editForm = ref({
  username: '',
  handle: '',
  bio: '',
  avatar: '',
});

function openEditModal() {
  editForm.value = {
    username: displayName.value,
    handle: userHandle.value,
    bio: userBio.value,
    avatar: userAvatar.value,
  };
  showEditModal.value = true;
}

function handleAvatarFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    editForm.value.avatar = event.target.result;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const cleanHandle = editForm.value.handle.startsWith('@')
    ? editForm.value.handle
    : `@${editForm.value.handle}`;

  authStore.updateProfile({
    username: editForm.value.username.trim(),
    handle: cleanHandle.trim(),
    bio: editForm.value.bio.trim(),
    avatar: editForm.value.avatar,
  });

  showEditModal.value = false;
}

function onAvatarError(e) {
  e.target.style.display = 'none';
}

/* ---------- Tab 1: Fess Saya Data ---------- */
const myFesses = ref([
  {
    id: 'fess_01',
    base: '#codememfess',
    content:
      'Curhat dikit, udah 3 minggu debug memory leak di microservice golang ternyata cuma salah defer mu.Unlock() di closure loop. Ada yang pernah ngalamin juga ga?',
    status: 'approved',
    time: '2 jam yang lalu',
    likes: 42,
    comments: 8,
  },
  {
    id: 'fess_02',
    base: '#ustfess',
    content:
      'Spill dong spot ngopi yang enak buat nugas skripsi sampai larut malam di sekitaran kampus, yang colokannya banyak dan wifinya kenceng.',
    status: 'approved',
    time: 'Kemarin',
    likes: 19,
    comments: 14,
  },
  {
    id: 'fess_03',
    base: '#karirfess',
    content:
      'Mau tanya buat yang switch career ke UI/UX Designer, portfolio mendingan 2 case study yang dalem banget atau 5 case study tapi singkat ya?',
    status: 'pending',
    time: '15 menit yang lalu',
    likes: 0,
    comments: 0,
  },
]);

const myFessCount = computed(() => myFesses.value.length);

/* ---------- Tab 2: Following Bases Data ---------- */
const baseSearchQuery = ref('');
const followedHandles = ref(['@ustfess', '@codememfess', '@karirfess', '@techfess']);

const myFollowedBases = computed(() => {
  return ALL_BASES.filter((b) => followedHandles.value.includes(b.handle));
});

const followedBasesCount = computed(() => myFollowedBases.value.length);

const filteredFollowedBases = computed(() => {
  const q = baseSearchQuery.value.trim().toLowerCase();
  if (!q) return myFollowedBases.value;
  return myFollowedBases.value.filter(
    (b) => b.name.toLowerCase().includes(q) || b.handle.toLowerCase().includes(q),
  );
});

function handleUnfollow(handle) {
  followedHandles.value = followedHandles.value.filter((h) => h !== handle);
}

/* ---------- Tab 3: Saldo & Top Up Data ---------- */
const balance = ref(15);
const selectedPkg = ref(null);
const selectedPayment = ref('qris');
const isProcessingTopUp = ref(false);
const topupSuccessMessage = ref('');

const TOPUP_PACKAGES = [
  { mfc: 5, idr: 5000, popular: false, bonus: null },
  { mfc: 10, idr: 10000, popular: true, bonus: '+2 MFC Bonus' },
  { mfc: 25, idr: 22500, popular: false, bonus: '+5 MFC Bonus' },
  { mfc: 50, idr: 40000, popular: false, bonus: 'Hemat 20%' },
];

const PAYMENT_METHODS = [
  { key: 'qris', name: 'QRIS (Gopay/OVO/Dana)' },
  { key: 'shopeepay', name: 'ShopeePay' },
  { key: 'va_bca', name: 'Virtual Account BCA' },
  { key: 'va_mandiri', name: 'VA Mandiri' },
];

function handleProcessTopUp() {
  if (!selectedPkg.value) return;
  isProcessingTopUp.value = true;
  topupSuccessMessage.value = '';

  setTimeout(() => {
    isProcessingTopUp.value = false;
    balance.value += selectedPkg.value.mfc;
    topupSuccessMessage.value = `Berhasil top up ${selectedPkg.value.mfc} MFC! Saldo sekarang: ${balance.value} MFC.`;
    selectedPkg.value = null;

    setTimeout(() => {
      topupSuccessMessage.value = '';
    }, 4500);
  }, 1200);
}

/* ---------- Settings Panel Navigation ---------- */
function openSettingsSubPanel(panelKey) {
  showSettingsDrawer.value = false;
  emit('openSubPanel', panelKey);
}

function confirmLogout() {
  showSettingsDrawer.value = false;
  emit('logout');
}
</script>

<style scoped>
.user-profile-ig-stage {
  width: 100%;
  font-family: var(--font-sans);
  color: var(--shell-text);
  padding-bottom: 24px;
}

/* ---------- TOP BAR (IG Style) ---------- */
.ig-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 16px;
  border-bottom: 1px solid var(--shell-border);
}

.ig-top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ig-handle-title {
  font-size: 19px;
  font-weight: 900;
  color: var(--shell-text);
  letter-spacing: -0.3px;
}

.ig-badge-anon {
  font-size: 10px;
  font-weight: 900;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
}

.btn-hamburger {
  background: transparent;
  border: none;
  color: var(--shell-text);
  padding: 6px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
}

.btn-hamburger:hover {
  background: var(--shell-chip);
  transform: scale(1.05);
}

/* ---------- PROFILE HEADER ---------- */
.ig-profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 8px 18px;
}

.ig-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 14px;
}

.ig-avatar-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--lime-primary) 0%, var(--shell-accent) 50%, var(--shell-sub-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px var(--shadow-color);
}

.ig-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--shell-stage);
  background: var(--shell-card);
}

.ig-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--shell-card);
  color: var(--shell-text-muted);
  border: 3px solid var(--shell-stage);
}

.ig-avatar-edit-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: 2px solid var(--shell-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}

.ig-avatar-edit-badge:hover {
  transform: scale(1.1);
}

.ig-user-info {
  margin-bottom: 14px;
}

.ig-display-name {
  font-size: 20px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
  letter-spacing: -0.2px;
}

.ig-username-sub {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.ig-bio-text {
  font-size: 13.5px;
  color: var(--shell-text);
  margin: 8px auto 0;
  max-width: 440px;
  line-height: 1.5;
}

.ig-actions-row {
  width: 100%;
  max-width: 380px;
  margin-bottom: 20px;
}

.btn-edit-profile {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border-strong);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-edit-profile:hover {
  background: var(--shell-card);
  border-color: var(--shell-active);
}

.ig-stats-strip {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 16px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
}

.ig-stat-col {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: transform 0.15s ease;
}

.ig-stat-col:hover {
  transform: translateY(-2px);
}

.ig-stat-num {
  font-size: 17px;
  font-weight: 900;
  color: var(--shell-text);
}

.ig-stat-num--accent {
  color: var(--shell-active);
}

.ig-stat-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--shell-border);
}

/* ---------- 3 SUB-TABS (IG Style) ---------- */
.ig-nav-tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid var(--shell-border);
  border-bottom: 1px solid var(--shell-border);
  margin-top: 8px;
}

.ig-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 10px;
  background: transparent;
  border: none;
  border-bottom: 2.5px solid transparent;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ig-tab-btn:hover {
  color: var(--shell-text);
}

.ig-tab-btn.active {
  color: var(--shell-active);
  border-bottom-color: var(--shell-active);
}

/* ---------- TAB CONTENT AREA ---------- */
.ig-tab-content-area {
  padding-top: 18px;
}

.tab-pane-fade {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tab-pane-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-create-small {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-create-small:hover {
  transform: translateY(-1px);
}

/* Tab 1: Fess Cards */
.my-fess-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.my-fess-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.15s ease;
}

.my-fess-card:hover {
  border-color: var(--shell-border-strong);
}

.my-fess-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.my-fess-base {
  font-weight: 900;
  font-size: 13px;
  color: var(--brand-blue);
}

.my-fess-status {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.status--approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status--pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.my-fess-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--shell-text);
  margin: 0 0 12px;
}

.my-fess-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--shell-text-muted);
}

.my-fess-metrics {
  display: flex;
  gap: 12px;
  font-weight: 700;
}

/* Tab 2: Following List */
.following-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.following-search-box .search-icon {
  position: absolute;
  left: 14px;
  color: var(--shell-text-muted);
}

.following-search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  color: var(--shell-text);
  outline: none;
}

.following-search-input:focus {
  border-color: var(--shell-active);
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.following-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px 14px;
}

.following-info-col {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  margin: -4px;
  transition: opacity 0.15s ease;
}

.following-info-col:hover {
  opacity: 0.88;
}

.following-info-col:hover .following-name {
  color: var(--shell-sub-accent, #60a5fa);
}

.following-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
  font-weight: 900;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.following-details {
  flex: 1;
  min-width: 0;
}

.following-name {
  font-weight: 800;
  font-size: 14px;
  color: var(--shell-text);
}

.following-handle {
  font-size: 12px;
  color: var(--shell-text-muted);
}

.btn-unfollow {
  padding: 6px 14px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-unfollow:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

/* Tab 3: Saldo & Top Up */
.balance-mfc-card {
  background: linear-gradient(135deg, var(--brand-blue) 0%, var(--shell-sub-accent) 100%);
  color: #fff;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 30px var(--neon-blue-glow);
}

.balance-mfc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.balance-mfc-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.8px;
  opacity: 0.85;
}

.balance-mfc-val {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 4px;
}

.balance-mfc-icon {
  color: var(--lime-primary);
}

.balance-mfc-unit {
  font-size: 16px;
  font-weight: 800;
  opacity: 0.9;
}

.mfc-status-pill {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
}

.balance-mfc-note {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
}

.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.section-heading-hint {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.mfc-packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mfc-pkg-card {
  position: relative;
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mfc-pkg-card:hover {
  border-color: var(--shell-active);
  transform: translateY(-2px);
}

.mfc-pkg-card.active {
  border-color: var(--shell-active);
  background: var(--shell-chip);
  box-shadow: 0 4px 14px var(--shadow-color);
}

.pkg-popular-tag {
  position: absolute;
  top: -8px;
  right: 10px;
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-size: 9px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
}

.pkg-mfc-amount {
  font-size: 20px;
  font-weight: 900;
  color: var(--shell-text);
}

.pkg-price {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--brand-blue);
  margin-top: 3px;
}

.pkg-bonus {
  font-size: 10.5px;
  font-weight: 800;
  color: #10b981;
  margin-top: 4px;
}

.checkout-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.checkout-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--shell-text);
  border-bottom: 1px solid var(--shell-border);
  padding-bottom: 10px;
}

.payment-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.payment-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.pm-btn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pm-btn.active {
  border-color: var(--shell-active);
  background: var(--shell-card);
  color: var(--shell-active);
  font-weight: 900;
}

.btn-bayar-mfc {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--shadow-color);
  transition: transform 0.15s ease;
}

.btn-bayar-mfc:hover {
  transform: translateY(-2px);
}

.btn-bayar-mfc:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
}

/* Empty states */
.empty-tab-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-tab-icon {
  color: var(--shell-text-dim);
  margin-bottom: 12px;
}

.empty-tab-title {
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
}

.empty-tab-sub {
  font-size: 12.5px;
  color: var(--shell-text-muted);
  max-width: 320px;
  margin: 6px auto 0;
}

.btn-primary-pill {
  padding: 8px 20px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

/* ---------- SETTINGS DRAWER / SLIDE-IN (IG Style) ---------- */
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
  animation: fadeInOverlay 0.2s ease;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.settings-drawer-panel {
  width: 100%;
  max-width: 360px;
  height: 100%;
  background: var(--shell-header-bg);
  backdrop-filter: blur(20px);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.drawer-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-drawer-close {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-drawer-close:hover {
  color: var(--shell-text);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-group {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  overflow: hidden;
}

.settings-row-static {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.theme-segmented-pills {
  display: flex;
  background: var(--shell-chip);
  padding: 3px;
  border-radius: 10px;
}

.tsp-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tsp-btn.active {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
}

.settings-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--shell-border);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.settings-menu-item:last-child {
  border-bottom: none;
}

.settings-menu-item:hover {
  background: var(--shell-chip);
}

.row-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-icon {
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.row-label {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.row-desc {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 1px;
}

.chevron-icon {
  color: var(--shell-text-dim);
}

.item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.icon--danger,
.label--danger {
  color: #ef4444 !important;
}

/* ---------- EDIT PROFILE MODAL ---------- */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeInOverlay 0.2s ease;
}

.edit-modal-card {
  width: 100%;
  max-width: 380px;
  background: var(--shell-header-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--shell-border-strong);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid var(--shell-border);
}

.edit-modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
}

.edit-modal-body {
  padding: 14px 18px;
}

.edit-avatar-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.edit-avatar-preview-box {
  position: relative;
  flex-shrink: 0;
}

.edit-avatar-preview {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--shell-active);
  flex-shrink: 0;
}

.avatar-controls-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.edit-avatar-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.btn-upload-avatar-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
  color: #0055ff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upload-avatar-chip:hover {
  background: rgba(0, 85, 255, 0.1);
  border-color: #0055ff;
}

[data-theme='dark'] .btn-upload-avatar-chip {
  color: #60a5fa;
}

.avatar-presets {
  display: flex;
  gap: 6px;
}

.btn-preset-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  background: none;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.btn-preset-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-preset-avatar.selected {
  border-color: var(--shell-active);
  transform: scale(1.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
  font-family: inherit;
  font-size: 13px;
  color: var(--shell-text);
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--shell-active);
}

.edit-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel {
  padding: 7px 15px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-save {
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 600px) {
  .edit-modal-card {
    max-width: 340px;
    width: 92%;
    border-radius: 18px;
  }

  .edit-modal-body {
    padding: 12px 14px;
  }

  .form-input,
  .form-textarea {
    padding: 7px 10px;
    font-size: 12.5px;
  }
}
</style>
