<template>
  <div class="admin-profile-ig-view">
    <!-- TOP BAR (Base Handle on left, Hamburger button on far right) -->
    <div class="ig-top-bar">
      <div class="ig-top-left">
        <h1 class="ig-handle-title">{{ baseHandle }}</h1>
        <span class="badge-base-admin">BASE ADMIN</span>
      </div>

      <div class="ig-top-right">
        <button
          type="button"
          class="btn-hamburger"
          aria-label="Buka Menu Admin"
          title="Menu Admin & Pengaturan"
          @click="showDrawer = true"
        >
          <Menu :size="24" />
        </button>
      </div>
    </div>

    <!-- PROFILE HEADER (IG STYLE FOR BASE ADMIN) -->
    <div class="ig-header-container">
      <div class="ig-header-top-row">
        <!-- SEBELAH KIRI ATAS: FOTO PROFILE & TOMBOL EDIT PROFIL -->
        <div class="ig-left-col">
          <div class="ig-avatar-ring">
            <img v-if="baseAvatarUrl" :src="baseAvatarUrl" :alt="baseName" class="ig-avatar-img" />
            <div v-else class="ig-avatar-img ig-avatar-initial">{{ baseInitial }}</div>
          </div>

          <!-- Button Edit Profile dibawah foto profil -->
          <button type="button" class="btn-edit-profile-left mt-2" @click="openEditProfile()">
            <Edit3 :size="13" />
            <span>Edit Profile</span>
          </button>
        </div>

        <!-- DI SAMPING FOTO PROFIL: STATISTIK BASE (angka real dari database) -->
        <div class="ig-metrics-row">
          <div class="ig-metric-col">
            <span class="ig-metric-label">Fess</span>
            <span class="ig-metric-num">{{ fessCount.toLocaleString('id-ID') }}</span>
          </div>

          <div class="ig-metric-col">
            <span class="ig-metric-label">Follower</span>
            <span class="ig-metric-num">{{ followersCount.toLocaleString('id-ID') }}</span>
          </div>

          <div class="ig-metric-col">
            <span class="ig-metric-label">Sejak</span>
            <span class="ig-metric-num">{{ established }}</span>
          </div>
        </div>
      </div>

      <!-- NAMA, USERNAME, BIO & MEDSOS PILL DI BAWAH -->
      <div class="ig-bio-section mt-3">
        <h2 class="base-full-name">{{ baseName }}</h2>
        <div class="base-handle-sub">{{ baseHandle }}</div>
        <p class="base-bio-desc">{{ baseBio }}</p>

        <!-- Medsos Integration Pill (hanya tampil jika base menautkan akun IG) -->
        <div v-if="igAccount" class="base-medsos-badge mt-2">
          <Instagram :size="13" class="ig-color-icon" />
          <span>{{ igAccount }}</span>
        </div>
      </div>
    </div>

    <!-- STATE: loading / error data base -->
    <div v-if="loading" class="state-banner mb-3">Memuat data base…</div>
    <div v-else-if="error" class="state-banner state-banner-error mb-3">
      <span>Gagal memuat data base.</span>
      <button type="button" class="btn-banner-retry" @click="loadProfile">Coba lagi</button>
    </div>

    <!-- QUICK STATUS STRIP MODERASI BASE (angka real dari GET /admin/stats) -->
    <div class="quick-status-grid mb-3">
      <div class="quick-status-card">
        <span class="status-num">{{ pendingCount }}</span>
        <span class="status-lbl">Antrean Moderasi</span>
      </div>
      <div class="quick-status-card">
        <span class="status-num">{{ approvedTotal }}</span>
        <span class="status-lbl">Fess Terbit</span>
      </div>
      <div class="quick-status-card">
        <span class="status-num">{{ rejectedTotal }}</span>
        <span class="status-lbl">Ditolak</span>
      </div>
      <div class="quick-status-card">
        <span class="status-num">{{ followersCount.toLocaleString('id-ID') }}</span>
        <span class="status-lbl">Follower</span>
      </div>
    </div>

    <!-- FILTER / SUB-TABS KONTEN FESS USER -->
    <div class="ig-feed-tabs" role="tablist" aria-label="Status Konten Fess">
      <button
        type="button"
        role="tab"
        :aria-selected="fessFilter === 'semua'"
        class="feed-tab-btn"
        :class="{ active: fessFilter === 'semua' }"
        @click="fessFilter = 'semua'"
      >
        <Grid :size="16" />
        <span>Semua Fess ({{ totalFesses }})</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="fessFilter === 'approved'"
        class="feed-tab-btn"
        :class="{ active: fessFilter === 'approved' }"
        @click="fessFilter = 'approved'"
      >
        <CheckCircle2 :size="16" />
        <span>Terbit</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="fessFilter === 'pending'"
        class="feed-tab-btn"
        :class="{ active: fessFilter === 'pending' }"
        @click="fessFilter = 'pending'"
      >
        <Clock :size="16" />
        <span>Antrean ({{ pendingCount }})</span>
      </button>
    </div>

    <!-- KONTEN FESS BASE (real dari GET /bases/:handle/fesses) -->
    <div class="ig-fess-content-area">
      <div v-if="actionNotice" class="alert-success-banner mb-3">
        <CheckCircle2 :size="15" />
        <span>{{ actionNotice }}</span>
      </div>
      <div v-if="actionError" class="state-banner state-banner-error mb-3">{{ actionError }}</div>
      <div v-if="fesses.length" class="fess-cards-stream">
        <AdminFessCard
          v-for="item in fesses"
          :key="item.id"
          :post="item"
          :is-admin="true"
          @approve="approveFess"
          @reject="rejectFess"
          @take-down="takeDownFess"
        />

        <!-- Lazy load: sentinel + status footer -->
        <div ref="fessSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
        <p v-if="fessLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
        <button
          v-else-if="fessLoadMoreError"
          type="button"
          class="feed-load-retry"
          @click="loadMoreFesses"
        >
          Coba lagi memuat
        </button>
      </div>

      <div v-else class="empty-fess-box">
        <MessageSquare :size="36" class="text-muted mb-2" />
        <p class="font-bold">Belum ada confession dalam kategori ini.</p>
        <p class="text-xs text-muted">Confession baru yang dikirim user ke base ini akan muncul di sini.</p>
      </div>
    </div>

    <!-- HAMBURGER DRAWER (KANAN ATAS) -->
    <div
      v-if="showDrawer"
      class="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Menu Admin Base"
      @click.self="showDrawer = false"
    >
      <div class="drawer-content-pane">
        <div class="drawer-top-header">
          <span class="drawer-header-title">Menu Pengelola Base</span>
          <button type="button" class="btn-close-drawer" @click="showDrawer = false">
            <X :size="20" />
          </button>
        </div>

        <div class="drawer-scroll-body">
          <!-- 1. KONEKSI MEDSOS -->
          <div class="menu-section-card">
            <button
              type="button"
              class="menu-row-btn"
              @click="openModal('medsos')"
            >
              <div class="menu-row-left">
                <Instagram :size="18" class="row-ico-brand" />
                <div>
                  <div class="menu-row-label">Koneksi Medsos</div>
                  <div class="menu-row-desc">Instagram, Twitter Bot, Telegram</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>
          </div>

          <!-- 2. BAGIAN KEUANGAN {saldo, pendapatan, penarikan} -->
          <div class="menu-section-card mt-3">
            <div class="section-card-title">Bagian Keuangan</div>

            <button type="button" class="menu-row-btn" @click="openModal('keuangan_saldo')">
              <div class="menu-row-left">
                <Coins :size="18" class="row-ico-gold" />
                <div>
                  <div class="menu-row-label">Saldo Treasury Base</div>
                  <div class="menu-row-desc">Kelola saldo &amp; penarikan dana base</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <button type="button" class="menu-row-btn" @click="openModal('keuangan_pendapatan')">
              <div class="menu-row-left">
                <TrendingUp :size="18" class="row-ico-green" />
                <div>
                  <div class="menu-row-label">Pendapatan Bulan Ini</div>
                  <div class="menu-row-desc">Rincian pendapatan komunitas base</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <button type="button" class="menu-row-btn" @click="openModal('keuangan_penarikan')">
              <div class="menu-row-left">
                <ArrowDownToLine :size="18" class="row-ico-blue" />
                <div>
                  <div class="menu-row-label">Penarikan Saldo (Payout)</div>
                  <div class="menu-row-desc">Tarik saldo ke rekening bank / e-wallet</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>
          </div>

          <!-- 3. ANALITIK {ringkasan, konten, moderasi, komunitas} -->
          <div class="menu-section-card mt-3">
            <div class="section-card-title">Analitik Base</div>

            <button type="button" class="menu-row-btn" @click="openModal('analitik_ringkasan')">
              <div class="menu-row-left">
                <BarChart3 :size="18" class="row-ico-blue" />
                <div>
                  <div class="menu-row-label">Ringkasan Analitik</div>
                  <div class="menu-row-desc">Impresi, kunjungan profil, views</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <button type="button" class="menu-row-btn" @click="openModal('analitik_konten')">
              <div class="menu-row-left">
                <FileText :size="18" class="row-ico-blue" />
                <div>
                  <div class="menu-row-label">Analitik Konten</div>
                  <div class="menu-row-desc">Fess paling viral & kata kunci teratas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <button type="button" class="menu-row-btn" @click="openModal('analitik_moderasi')">
              <div class="menu-row-left">
                <ShieldCheck :size="18" class="row-ico-blue" />
                <div>
                  <div class="menu-row-label">Moderasi & Filter Kata</div>
                  <div class="menu-row-desc">Auto-moderation keyword & antrean</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <button type="button" class="menu-row-btn" @click="openModal('analitik_komunitas')">
              <div class="menu-row-left">
                <Users :size="18" class="row-ico-blue" />
                <div>
                  <div class="menu-row-label">Analitik Komunitas</div>
                  <div class="menu-row-desc">Statistik anggota &amp; aktivitas komunitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>
          </div>

          <!-- 4. PENGATURAN {tampilan, notif, bantuan, ketentuan, privasi, keamanan ganti password} -->
          <div class="menu-section-card mt-3">
            <div class="section-card-title">Pengaturan</div>

            <!-- Tampilan (Theme Switcher) -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_tampilan')">
              <div class="menu-row-left">
                <Sun :size="18" class="row-ico-muted" />
                <div>
                  <div class="menu-row-label">Tampilan Tema</div>
                  <div class="menu-row-desc">
                    Mode: {{ currentTheme === 'system' ? 'Sistem Otomatis' : currentTheme === 'light' ? 'Terang' : 'Gelap' }}
                  </div>
                </div>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <!-- Notif -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_notif')">
              <div class="menu-row-left">
                <Bell :size="18" class="row-ico-muted" />
                <span class="menu-row-label">Notifikasi Base</span>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <!-- Bantuan -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_bantuan')">
              <div class="menu-row-left">
                <HelpCircle :size="18" class="row-ico-muted" />
                <span class="menu-row-label">Bantuan Pengelola</span>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <!-- Ketentuan Layanan -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_ketentuan')">
              <div class="menu-row-left">
                <ScrollText :size="18" class="row-ico-muted" />
                <span class="menu-row-label">Ketentuan Layanan</span>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <!-- Kebijakan Privasi -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_privasi')">
              <div class="menu-row-left">
                <Shield :size="18" class="row-ico-muted" />
                <span class="menu-row-label">Kebijakan Privasi</span>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>

            <!-- Keamanan Profil Ganti Password -->
            <button type="button" class="menu-row-btn" @click="openModal('pengaturan_keamanan')">
              <div class="menu-row-left">
                <KeyRound :size="18" class="row-ico-muted" />
                <span class="menu-row-label">Keamanan Profil &amp; Ganti Password</span>
              </div>
              <ChevronRight :size="16" class="row-chevron" />
            </button>
          </div>

          <!-- 5. LOGOUT -->
          <div class="menu-section-card mt-3">
            <button type="button" class="menu-row-btn danger-row" @click="handleAdminLogout">
              <div class="menu-row-left">
                <LogOut :size="18" class="row-ico-danger" />
                <span class="menu-row-label text-danger">Keluar dari Akun Base</span>
              </div>
              <ChevronRight :size="16" class="row-chevron text-danger" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT PROFILE BASE -->
    <div
      v-if="showEditModal"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profil Base"
      @click.self="showEditModal = false"
    >
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Edit Profil Base</h3>
          <button type="button" class="btn-close-modal" @click="showEditModal = false">
            <X :size="18" />
          </button>
        </div>

        <form class="modal-body" @submit.prevent="saveBaseProfile">
          <!-- Foto Profil Preview (upload real via POST /upload/avatar) -->
          <div class="edit-avatar-group">
            <img
              v-if="editForm.avatar"
              :src="editForm.avatar"
              alt="Foto Base"
              class="edit-avatar-img"
            />
            <div v-else class="edit-avatar-img edit-avatar-initial">{{ baseInitial }}</div>
            <div class="avatar-presets-grid">
              <div class="avatar-select-head">
                <span class="text-xs text-muted">Foto Profil Base:</span>
                <label class="btn-upload-avatar-chip">
                  <Upload :size="12" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="handleAdminAvatarUpload"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="form-group mt-3">
            <label for="edit-base-name" class="form-label">Nama Base</label>
            <input
              id="edit-base-name"
              v-model="editForm.name"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group mt-3">
            <label for="edit-base-bio" class="form-label">Bio Base</label>
            <textarea
              id="edit-base-bio"
              v-model="editForm.bio"
              rows="3"
              class="form-textarea"
              required
            ></textarea>
          </div>

          <!-- Mode posting fess: moderasi manual vs auto post + filter NLP -->
          <div class="form-group mt-3">
            <span class="form-label">Mode Posting Fess</span>
            <div class="post-mode-grid">
              <label
                class="post-mode-option"
                :class="{ active: editForm.postMode === 'moderated' }"
              >
                <input v-model="editForm.postMode" type="radio" value="moderated" class="sr-only" />
                <ShieldCheck :size="16" class="post-mode-icon" />
                <span class="post-mode-text">
                  <strong>Moderasi</strong>
                  <small>Semua fess masuk antrean review admin</small>
                </span>
              </label>
              <label class="post-mode-option" :class="{ active: editForm.postMode === 'auto' }">
                <input v-model="editForm.postMode" type="radio" value="auto" class="sr-only" />
                <Zap :size="16" class="post-mode-icon" />
                <span class="post-mode-text">
                  <strong>Auto Post</strong>
                  <small>Langsung terbit, difilter NLP anti konten negatif</small>
                </span>
              </label>
            </div>
          </div>

          <p v-if="editError" class="edit-error-text">{{ editError }}</p>

          <div class="modal-footer mt-4">
            <button type="button" class="btn-cancel" @click="showEditModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSavingProfile">
              {{ isSavingProfile ? 'Menyimpan…' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- REAL FULL SLIDE-IN PANELS FOR ALL HAMBURGER ITEMS -->
    <BaseAdminPanels
      v-model="activeSubModal"
      @setTheme="changeTheme"
      @logout="handleAdminLogout"
    />
  </div>
</template>

<script setup>
/**
 * BaseAdminProfileTab — Instagram-style Profile View for Base Admin.
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Menu,
  X,
  Edit3,
  Instagram,
  Grid,
  CheckCircle2,
  Clock,
  ChevronRight,
  Coins,
  TrendingUp,
  ArrowDownToLine,
  BarChart3,
  FileText,
  ShieldCheck,
  Users,
  Sun,
  Bell,
  HelpCircle,
  ScrollText,
  Shield,
  KeyRound,
  LogOut,
  MessageSquare,
  Upload,
  Zap,
} from 'lucide-vue-next';

import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../composables/useTheme';
import { api } from '../../api';
import { mapFessToPost } from '../../utils/fessMapper';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { confirmDialog } from '../../composables/useAppDialog';
import BaseAdminPanels from './BaseAdminPanels.vue';
import AdminFessCard from './AdminFessCard.vue';

const router = useRouter();
const authStore = useAuthStore();
const { mode: currentTheme, setMode } = useTheme();

const showDrawer = ref(false);
const showEditModal = ref(false);
const activeSubModal = ref(null);

const fessFilter = ref('semua');


/* ---------- Profil base real (GET /bases/:handle + GET /admin/stats) ---------- */
const loading = ref(true);
const error = ref(null);
const base = ref(null);
const stats = ref(null);
const fesses = ref([]);
const actionError = ref('');
const actionNotice = ref('');

const managedHandle = computed(() => authStore.user?.managedBases?.[0] || null);

const baseName = computed(() => base.value?.name || authStore.user?.username || 'Base');
const baseHandle = computed(
  () => base.value?.handle || managedHandle.value || authStore.user?.handle || '',
);
const baseBio = computed(() => base.value?.bio || '');
const baseInitial = computed(() =>
  String(base.value?.initial || baseName.value).slice(0, 2).toUpperCase(),
);
const baseAvatarUrl = computed(() => {
  const avatar = base.value?.avatar;
  return typeof avatar === 'string' && /^(https?:|data:|blob:)/i.test(avatar) ? avatar : null;
});
const igAccount = computed(() => base.value?.ig_account || '');
const followersCount = computed(() => base.value?.followers_count ?? 0);
const fessCount = computed(() => base.value?.fess_count ?? 0);
const established = computed(() => base.value?.established || '2024');

const pendingCount = computed(() => stats.value?.pending ?? 0);
const approvedTotal = computed(() => stats.value?.published ?? 0);
const rejectedTotal = computed(() => stats.value?.rejected ?? 0);
const totalFesses = computed(() => stats.value?.total_fesses ?? fessCount.value);

/** GET /bases/:handle/fesses — status difilter di server + pagination (lazy load). */
const FESS_PAGE_SIZE = 20;

const fessLoadingMore = ref(false);
const fessLoadMoreError = ref(null);
const fessQueryTotal = ref(0);
const fessSentinel = ref(null);
let fessPage = 1;

const fessHasMore = computed(() => fesses.value.length < fessQueryTotal.value);

function mapBaseFess(f) {
  const post = mapFessToPost(f);
  return post ? { ...post, baseHandle: post.handle, timestamp: post.time } : null;
}

function fessParams(page) {
  const status = fessFilter.value === 'semua' ? undefined : fessFilter.value;
  return {
    page,
    limit: FESS_PAGE_SIZE,
    sort: 'newest',
    ...(status ? { status } : {}),
  };
}

async function loadFesses() {
  const handle = managedHandle.value;
  if (!handle) return;
  fessLoadMoreError.value = null;
  try {
    const res = await api.getBaseFesses(handle, fessParams(1));
    fesses.value = (res?.data || []).map(mapBaseFess).filter(Boolean);
    fessQueryTotal.value = res?.total ?? fesses.value.length;
    fessPage = 1;
  } catch (e) {
    actionError.value = e?.message || 'Gagal memuat daftar fess base.';
    fesses.value = [];
  }
}

/** Lazy load halaman berikutnya pada daftar fess base. */
async function loadMoreFesses() {
  const handle = managedHandle.value;
  if (!handle || fessLoadingMore.value || !fessHasMore.value) return;
  fessLoadingMore.value = true;
  fessLoadMoreError.value = null;
  try {
    const nextPage = fessPage + 1;
    const res = await api.getBaseFesses(handle, fessParams(nextPage));
    const seen = new Set(fesses.value.map((f) => String(f.id)));
    const extra = (res?.data || [])
      .map(mapBaseFess)
      .filter((f) => f && !seen.has(String(f.id)));
    fesses.value = [...fesses.value, ...extra];
    fessQueryTotal.value = res?.total ?? fessQueryTotal.value;
    fessPage = nextPage;
  } catch (e) {
    fessLoadMoreError.value = e;
  } finally {
    fessLoadingMore.value = false;
  }
}

// Ganti tab status → muat ulang dari halaman pertama (server-side).
watch(fessFilter, () => {
  loadFesses();
});

useInfiniteScroll(fessSentinel, {
  onLoad: loadMoreFesses,
  canLoad: () => fessHasMore.value && !fessLoadingMore.value && !fessLoadMoreError.value,
  deps: () => [fesses.value.length, fessHasMore.value],
});

/** GET /admin/stats — role-scoped moderation counters. */
async function loadStats() {
  try {
    stats.value = await api.getStats();
  } catch {
    stats.value = null;
  }
}

async function loadProfile() {
  const handle = managedHandle.value;
  error.value = null;
  if (!handle) {
    error.value = new Error('Akun ini belum mengelola base.');
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    base.value = await api.getBase(handle);
    await Promise.all([loadFesses(), loadStats()]);
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

/* ---------- Edit profil base (PATCH /bases/:handle/settings) ---------- */
const editForm = ref({ name: '', bio: '', avatar: '', postMode: 'moderated' });
const editError = ref('');
const isSavingProfile = ref(false);

function openEditProfile() {
  editError.value = '';
  editForm.value = {
    name: baseName.value,
    bio: baseBio.value,
    avatar: baseAvatarUrl.value || '',
    postMode: base.value?.post_mode || 'moderated',
  };
  showEditModal.value = true;
}

async function handleAdminAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  editError.value = '';
  try {
    const res = await api.uploadAvatar(file);
    if (res?.url) editForm.value.avatar = res.url;
  } catch (err) {
    editError.value = err?.message || 'Upload foto gagal. Coba lagi.';
  }
}

async function saveBaseProfile() {
  const handle = managedHandle.value;
  if (!handle) return;
  isSavingProfile.value = true;
  editError.value = '';
  try {
    base.value = await api.updateBaseSettings(handle, {
      name: editForm.value.name.trim(),
      bio: editForm.value.bio.trim(),
      avatar: editForm.value.avatar || null,
      postMode: editForm.value.postMode,
    });
    showEditModal.value = false;
  } catch (err) {
    editError.value = err?.message || 'Gagal menyimpan profil base.';
  } finally {
    isSavingProfile.value = false;
  }
}

onMounted(() => {
  loadProfile();
});

/* ---------- Fess tabs + moderation actions (real API) ---------- */

/** POST /fesses/:id/approve — optimistic UI update lalu refresh list + counters. */
async function approveFess(id) {
  actionError.value = '';
  actionNotice.value = '';
  const prevFesses = [...fesses.value];
  fesses.value = fesses.value.filter((f) => f.id !== id);
  try {
    await api.approveFess(id);
    actionNotice.value = `Fess #${id} berhasil disetujui & otomatis diposting ke Instagram Story base!`;
    setTimeout(() => { actionNotice.value = ''; }, 6000);
    await Promise.all([loadFesses(), loadStats()]);
  } catch (e) {
    fesses.value = prevFesses;
    actionError.value = e?.message || 'Gagal menyetujui fess.';
  }
}

/** POST /fesses/:id/reject — optimistic UI update lalu refresh list + counters. */
async function rejectFess(id) {
  actionError.value = '';
  const prevFesses = [...fesses.value];
  fesses.value = fesses.value.filter((f) => f.id !== id);
  try {
    await api.rejectFess(id);
    await Promise.all([loadFesses(), loadStats()]);
  } catch (e) {
    fesses.value = prevFesses;
    actionError.value = e?.message || 'Gagal menolak fess.';
  }
}

/**
 * Take down (admin base): hapus fess yang sudah terbit dari feed publik.
 * Konfirmasi dulu karena permanen; backend mencatat audit + notif author.
 */
async function takeDownFess(id) {
  const confirmed = await confirmDialog({
    title: 'Take Down Fess',
    message: 'Take down fess ini? Fess akan dihapus dan tidak bisa dikembalikan.',
    confirmLabel: 'Take Down',
    variant: 'danger',
  });
  if (!confirmed) return;
  actionError.value = '';
  try {
    await api.deleteFess(id);
    await Promise.all([loadFesses(), loadStats()]);
  } catch (e) {
    actionError.value = e?.message || 'Gagal melakukan take down.';
  }
}

/* Drawer & Sub-modal Handlers */
const subModalTitle = computed(() => {
  const titles = {
    medsos: 'Koneksi Media Sosial',
    keuangan_saldo: 'Saldo Treasury Base',
    keuangan_pendapatan: 'Pendapatan Base',
    keuangan_penarikan: 'Penarikan Saldo (Payout)',
    analitik_ringkasan: 'Ringkasan Analitik Base',
    analitik_konten: 'Analitik Konten Fess',
    analitik_moderasi: 'Moderasi & Filter Kata',
    analitik_komunitas: 'Analitik Komunitas Base',
    pengaturan_notif: 'Pengaturan Notifikasi',
    pengaturan_bantuan: 'Pusat Bantuan Pengelola',
    pengaturan_ketentuan: 'Ketentuan Layanan Base',
    pengaturan_privasi: 'Kebijakan Privasi',
    pengaturan_keamanan: 'Keamanan Profil & Ganti Password',
  };
  return titles[activeSubModal.value] || 'Detail Menu';
});

function openModal(modalKey) {
  showDrawer.value = false;
  activeSubModal.value = modalKey;
}

function changeTheme(theme) {
  setMode(theme);
}

async function handleAdminLogout() {
  showDrawer.value = false;
  await authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-profile-ig-view {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  font-family: var(--font-sans);
  color: var(--shell-text);
  padding-bottom: 24px;
}

/* Top bar */
.ig-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px 16px;
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
  margin: 0;
  color: var(--shell-text);
}

.badge-base-admin {
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-size: 10px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.5px;
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
  transition: background 0.15s ease;
}

.btn-hamburger:hover {
  background: var(--shell-chip);
}

/* Header IG Layout */
.ig-header-container {
  padding: 20px 4px 16px;
}

.ig-header-top-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

/* Sebelah kiri atas: foto profil */
.ig-left-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ig-avatar-ring {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--shell-sub-accent) 0%, var(--brand-blue) 100%);
  box-shadow: 0 6px 18px var(--shadow-color);
}

.ig-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--shell-stage);
}

.btn-edit-profile-left {
  width: 100%;
  padding: 6px 10px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  color: var(--shell-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.btn-edit-profile-left:hover {
  background: var(--shell-card);
  border-color: var(--shell-active);
}

/* Di samping foto profil: Fess, Follow, Follower */
.ig-metrics-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 14px;
}

.ig-metric-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ig-metric-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ig-metric-btn:hover {
  background: var(--shell-chip);
  transform: translateY(-2px);
}

.ig-metric-btn:active {
  transform: translateY(0);
}

.ig-metric-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-metric-num {
  font-size: 18px;
  font-weight: 900;
  color: var(--shell-text);
}

/* Bio info */
.ig-bio-section {
  text-align: left;
}

.base-full-name {
  font-size: 17px;
  font-weight: 900;
  margin: 0;
  color: var(--shell-text);
}

.base-handle-sub {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.base-bio-desc {
  font-size: 13px;
  color: var(--shell-text);
  margin: 6px 0 0;
  line-height: 1.5;
}

.base-medsos-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
}

.ig-color-icon {
  color: #e1306c;
}

.auto-post-status {
  color: #10b981;
}

/* Quick status moderasi strip */
.quick-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 4px;
}

.quick-status-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-num {
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-text);
}

.status-lbl {
  font-size: 10px;
  font-weight: 700;
  color: var(--shell-text-muted);
  margin-top: 2px;
  white-space: nowrap;
}

/* Feed tabs */
.ig-feed-tabs {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--shell-border);
  border-bottom: 1px solid var(--shell-border);
  margin-top: 12px;
}

.feed-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 2.5px solid transparent;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.feed-tab-btn.active {
  color: var(--shell-text);
  border-bottom-color: var(--shell-text);
}

/* Fess cards stream */
.ig-fess-content-area {
  padding-top: 14px;
}

.fess-cards-stream {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Lazy-load footer */
.feed-load-sentinel {
  height: 1px;
  width: 100%;
}

.feed-load-hint {
  text-align: center;
  font-size: 12.5px;
  color: var(--shell-text-muted);
  padding: 10px 0 4px;
  margin: 0;
}

.feed-load-retry {
  display: block;
  margin: 8px auto 0;
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  border-radius: 999px;
  padding: 7px 16px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.feed-load-retry:hover {
  color: var(--shell-text);
  border-color: var(--shell-border-strong);
}

.alert-success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 12.5px;
  font-weight: 700;
}

.base-fess-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.fess-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.fess-author-anon {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.anon-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--shell-chip);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fess-time {
  color: var(--shell-text-muted);
}

.fess-status-badge {
  font-size: 10px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.badge--approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge--pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.fess-card-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--shell-text);
  margin: 0 0 12px;
}

.fess-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: gap;
  gap: 8px;
}

.fess-reactions {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-posted-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(225, 48, 108, 0.12);
  color: #e1306c;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
}

.fess-admin-actions {
  display: flex;
  gap: 6px;
}

.btn-mod-approve {
  padding: 5px 12px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.btn-mod-hide {
  padding: 5px 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.empty-fess-box {
  text-align: center;
  padding: 40px 16px;
}

/* DRAWER */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.drawer-content-pane {
  width: 100%;
  max-width: 380px;
  height: 100%;
  background: var(--shell-header-bg);
  backdrop-filter: blur(20px);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.drawer-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.drawer-header-title {
  font-size: 17px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-close-drawer {
  background: none;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
}

.drawer-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.menu-section-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  overflow: hidden;
}

.section-card-title {
  padding: 10px 16px 4px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--shell-text-muted);
}

.menu-row-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--shell-border);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-row-btn:last-child {
  border-bottom: none;
}

.menu-row-btn:hover {
  background: var(--shell-chip);
}

.menu-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-row-label {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.menu-row-desc {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 1px;
}

.row-chevron {
  color: var(--shell-text-dim);
}

.row-ico-brand { color: #e1306c; }
.row-ico-gold { color: #f59e0b; }
.row-ico-green { color: #10b981; }
.row-ico-blue { color: #3b82f6; }
.row-ico-muted { color: var(--shell-text-muted); }
.row-ico-danger { color: #ef4444; }

.danger-row:hover { background: rgba(239, 68, 68, 0.1); }
.text-danger { color: #ef4444 !important; }

.menu-row-static {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--shell-border);
}

.theme-pill-group {
  display: flex;
  background: var(--shell-chip);
  padding: 3px;
  border-radius: 8px;
}

.tp-btn {
  background: none;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.tp-btn.active {
  background: var(--shell-sub-accent);
  color: #ffffff;
}

/* MODALS */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--shell-header-bg);
  border: 1px solid var(--shell-border-strong);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.modal-card--large {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-close-modal {
  background: none;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 20px;
}

.avatar-select-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.btn-upload-avatar-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
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

.edit-avatar-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.edit-avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--shell-sub-accent);
}

.presets-row {
  display: flex;
  gap: 8px;
}

.btn-preset-pic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  cursor: pointer;
  background: none;
  overflow: hidden;
}

.btn-preset-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-preset-pic.selected {
  border-color: var(--shell-sub-accent);
  transform: scale(1.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
  font-family: inherit;
  font-size: 13.5px;
  color: var(--shell-text);
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--shell-sub-accent);
}

/* Mode posting fess (moderasi vs auto post + NLP) */
.post-mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.post-mode-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.post-mode-option.active {
  border-color: var(--shell-sub-accent);
  background: var(--shell-chip);
}

.post-mode-icon {
  color: var(--shell-sub-accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.post-mode-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.post-mode-text strong {
  font-size: 12.5px;
  color: var(--shell-text);
}

.post-mode-text small {
  font-size: 11px;
  color: var(--shell-text-muted);
  line-height: 1.35;
}

@media (max-width: 480px) {
  .post-mode-grid {
    grid-template-columns: 1fr;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--shell-sub-accent);
  color: #ffffff;
  border: none;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
}

/* Sub-pane cards */
.conn-item-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px 16px;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-size: 10px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.finance-hero-badge {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15));
  border: 1.5px solid var(--shell-border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.analytics-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-pill-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px;
}

/* Follow & Follower Modal Styles */
.follow-modal-card {
  max-width: 500px;
  width: 95%;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.follow-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--shell-border);
  background: var(--shell-card);
}

.follow-tabs-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.follow-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-tab-btn:hover {
  color: var(--shell-text);
  background: var(--shell-chip);
}

.follow-tab-btn.active {
  background: var(--shell-chip);
  color: var(--shell-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.follow-tab-count {
  font-size: 11px;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 7px;
  border-radius: 10px;
}

.follow-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 8px;
  padding: 8px 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
}

.follow-search-icon {
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.follow-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--shell-text);
}

.follow-search-input::placeholder {
  color: var(--shell-text-muted);
}

.btn-clear-search {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-list-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 52vh;
}

.follow-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  transition: background 0.15s ease;
}

.follow-user-row:hover {
  background: var(--shell-chip);
}

.follow-user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.follow-user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--shell-border);
}

.follow-verified-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background: #3b82f6;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--shell-card);
}

.follow-user-info {
  flex: 1;
  min-width: 0;
}

.follow-user-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-user-name {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-tag {
  font-size: 9.5px;
  font-weight: 900;
  background: rgba(59, 130, 246, 0.18);
  color: #60a5fa;
  padding: 1px 6px;
  border-radius: 6px;
}

.follow-user-handle {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.follow-user-bio {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin: 3px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-follow-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  background: var(--shell-sub-accent, #2563eb);
  color: #fff;
  border: 1px solid transparent;
  transition: all 0.18s ease;
}

.btn-follow-toggle:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-follow-toggle.btn-following {
  background: var(--shell-chip);
  color: var(--shell-text);
  border-color: var(--shell-border);
}

.btn-follow-toggle.btn-following:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.follow-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  color: var(--shell-text-muted);
}

.empty-icon {
  margin-bottom: 10px;
  opacity: 0.4;
}

.empty-text {
  font-size: 12.5px;
  margin: 0;
}
.ig-avatar-initial,
.edit-avatar-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.state-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--shell-chip, rgba(255, 255, 255, 0.06));
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.state-banner-error {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
}

.btn-banner-retry {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 99px;
  color: inherit;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  padding: 5px 12px;
  cursor: pointer;
}

.edit-error-text {
  margin-top: 12px;
  color: #f87171;
  font-size: 12.5px;
  font-weight: 600;
}
</style>
