<template>
  <div class="base-public-page">
    <!-- Top Sticky Bar -->
    <header class="public-top-bar">
      <div class="top-bar-inner">
        <button
          type="button"
          class="btn-back"
          aria-label="Kembali"
          title="Kembali"
          @click="handleBack"
        >
          <ChevronLeft :size="22" />
          <span class="btn-back-text">Kembali</span>
        </button>

        <div class="top-title-col">
          <div class="top-handle-title">
            <span>{{ baseData?.handle || (cleanHandle ? `@${cleanHandle}` : 'Profil Base') }}</span>
            <ShieldCheck v-if="baseData?.verified" :size="16" class="verified-icon" />
          </div>
          <span class="top-sub-tag">{{ baseData?.category ? `${baseData.category} Base` : 'Base' }}</span>
        </div>

        <button
          type="button"
          class="btn-icon-action"
          aria-label="Bagikan Profil Base"
          title="Bagikan Tautan Profil"
          @click="handleShare"
        >
          <Share2 :size="19" />
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="public-main-stage">
      <div class="public-stage-container">
        <!-- Loading skeleton while the base detail is fetched -->
        <ContentSkeleton
          v-if="baseLoading && !baseData"
          type="profile"
          label="Memuat profil base…"
        />

        <!-- API error / 404 state -->
        <AppStateView
          v-else-if="baseError && !baseData"
          variant="error"
          :title="baseNotFound ? 'Base tidak ditemukan' : 'Profil base gagal dimuat'"
          :description="baseNotFound
            ? `Base @${cleanHandle} tidak ditemukan. Periksa kembali tautan atau cari base lain dari feed.`
            : 'Terjadi kesalahan saat mengambil profil base. Periksa koneksi internetmu, lalu coba lagi.'"
          action-label="Coba lagi"
          @action="loadBase"
        />

        <template v-else-if="baseData">
        <!-- COVER & HERO BANNER -->
        <section class="base-hero-card">
          <!-- Cover Banner with dynamic depth, glows, and category badges -->
          <div
            class="base-cover-banner"
            :style="{
              background: `linear-gradient(135deg, ${baseData.color || '#0055ff'} 0%, #151c38 55%, #080c18 100%)`
            }"
          >
            <div
              class="cover-ambient-glow"
              :style="{ background: `radial-gradient(circle, ${baseData.color || '#0055ff'}77 0%, transparent 70%)` }"
            ></div>
            <div class="cover-ambient-orb-secondary"></div>
            <div class="cover-overlay-pattern"></div>
            <div class="cover-glass-flare"></div>
            
            <div class="cover-top-row">
              <div v-if="baseData.verified" class="cover-status-badge">
                <Sparkles :size="12" class="sparkle-anim-icon" />
                <span>Base Resmi Aktif</span>
              </div>

              <div class="cover-category-badge">
                <span class="category-dot"></span>
                <span>{{ baseData.category }}</span>
              </div>
            </div>
          </div>

          <!-- Profile Head (Avatar + Quick Action) -->
          <div class="hero-body-content">
            <div class="hero-avatar-stage">
              <div
                class="avatar-ring-wrapper"
                :style="{ '--base-glow': baseData.color || '#0055ff' }"
              >
                <img
                  v-if="baseAvatar"
                  :src="baseAvatar"
                  :alt="baseData.name"
                  class="base-avatar-img"
                />
                <div
                  v-else
                  class="base-avatar-core"
                  :style="{ background: `linear-gradient(135deg, ${baseData.color || '#0055ff'}, #002db3)` }"
                >
                  <span>{{ baseData.initial }}</span>
                </div>
                
                <span v-if="baseData.verified" class="avatar-verified-shield" title="Base Resmi Terverifikasi">
                  <ShieldCheck :size="15" :stroke-width="2.6" />
                </span>
              </div>

              <!-- Quick share action on top right of the card body -->
              <div class="avatar-stage-right">
                <button
                  type="button"
                  class="btn-quick-share"
                  title="Bagikan Tautan Profil Base"
                  @click="handleShare"
                >
                  <Share2 :size="14" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            <!-- Name, Handle, Badges & Bio -->
            <div class="base-identity-block">
              <div class="name-badge-row">
                <h1 class="base-display-name">{{ baseData.name }}</h1>
                <div v-if="baseData.verified" class="badge-official-base" title="Base Resmi Terverifikasi Platform">
                  <ShieldCheck :size="13" class="badge-icon" />
                  <span>OFFICIAL BASE</span>
                </div>
              </div>

              <div class="base-handle-line">
                <button
                  type="button"
                  class="btn-handle-copy"
                  title="Klik untuk menyalin username base"
                  @click="copyHandle"
                >
                  <span class="handle-text">{{ baseData.handle }}</span>
                  <Copy :size="12" class="copy-handle-icon" />
                </button>
              </div>

              <p class="base-bio-paragraph">{{ baseData.bio }}</p>

              <!-- Medsos & Feature Badges -->
              <div class="base-medsos-strip">
                <a
                  v-if="baseData.igAccount"
                  :href="'https://instagram.com/' + baseData.igAccount.replace(/^@/, '')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="medsos-item-chip ig-chip"
                  title="Kunjungi Instagram Resmi Base"
                >
                  <Instagram :size="14" class="ig-icon" />
                  <span class="medsos-handle">{{ baseData.igAccount }}</span>
                  <ExternalLink :size="11" class="medsos-ext-icon" />
                </a>

                <div class="medsos-item-chip auto-sync-chip" title="Integrasi Auto-Post Story Aktif">
                  <span class="pulse-radar-wrap">
                    <span class="radar-wave"></span>
                    <span class="radar-dot"></span>
                  </span>
                  <span>Auto-Post Story Aktif</span>
                </div>
              </div>
            </div>

            <!-- 3 BENTO METRIC TILES (Fess Terbit, Mengikuti, Pengikut) -->
            <div class="base-stats-bento-grid">
              <div class="bento-stat-card">
                <div class="bento-stat-top">
                  <span class="bento-stat-num">{{ baseData.fessCount }}</span>
                  <MessageSquare :size="14" class="bento-stat-icon-muted" />
                </div>
                <div class="bento-stat-bottom">
                  <span class="bento-stat-label">Fess Terbit</span>
                  <span class="bento-stat-sub">confessions</span>
                </div>
              </div>

              <button
                type="button"
                class="bento-stat-card bento-clickable"
                title="Lihat daftar akun yang diikuti"
                @click="openFollowModal('following')"
              >
                <div class="bento-stat-top">
                  <span class="bento-stat-num">{{ baseData.followingCount }}</span>
                  <ChevronRight :size="14" class="bento-stat-arrow" />
                </div>
                <div class="bento-stat-bottom">
                  <span class="bento-stat-label">Mengikuti</span>
                  <span class="bento-stat-sub">akun</span>
                </div>
              </button>

              <button
                type="button"
                class="bento-stat-card bento-clickable"
                title="Lihat pengikut base"
                @click="openFollowModal('followers')"
              >
                <div class="bento-stat-top">
                  <span class="bento-stat-num">{{ currentFollowersDisplay }}</span>
                  <ChevronRight :size="14" class="bento-stat-arrow" />
                </div>
                <div class="bento-stat-bottom">
                  <span class="bento-stat-label">Pengikut</span>
                  <span class="bento-stat-sub">komunitas</span>
                </div>
              </button>
            </div>

            <!-- Visitor Action Buttons: Follow / Send Fess -->
            <div class="hero-actions-row">
              <button
                type="button"
                :class="['btn-follow-action', { following: isBaseFollowed }]"
                :aria-pressed="isBaseFollowed"
                @click="handleToggleFollow"
              >
                <UserCheck v-if="isBaseFollowed" :size="17" class="btn-action-icon" />
                <UserPlus v-else :size="17" class="btn-action-icon" />
                <span class="follow-label-text">{{ isBaseFollowed ? 'Mengikuti' : 'Ikuti Base' }}</span>
              </button>

              <button
                type="button"
                class="btn-send-fess-primary"
                title="Kirim confession ke base ini"
                @click="handleSendFess"
              >
                <div class="btn-glow-shimmer"></div>
                <Send :size="17" class="btn-send-icon" />
                <span>Kirim Fess</span>
              </button>
            </div>

            <!-- Notice Banner IF viewed by its own Base Admin -->
            <div v-if="isOwnBase" class="own-base-notice-box mt-4">
              <div class="notice-icon-circle">
                <Sparkles :size="16" />
              </div>
              <div class="notice-text-col">
                <div class="notice-title-row">
                  <span class="notice-title">Mode Pratinjau Tampilan Publik</span>
                  <span class="notice-role-pill">Admin Base</span>
                </div>
                <p class="notice-desc">
                  Ini adalah tampilan profil luar yang dilihat oleh user dan admin base lain. Panel moderasi dan pengelolaan antrean fess Anda berada di Dasbor Admin.
                </p>
              </div>
              <button
                type="button"
                class="btn-goto-admin"
                @click="router.push('/base-admin')"
              >
                <span>Buka Dasbor Admin</span>
                <ChevronRight :size="14" />
              </button>
            </div>
          </div>
        </section>

        <!-- SUB-TABS NAVIGATION (Fess Terbit, Aturan, Tentang) -->
        <nav class="public-tabs-nav mt-4" role="tablist" aria-label="Navigasi Profil Base">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'posts'"
            :class="['profile-subtab-btn', { active: activeTab === 'posts' }]"
            @click="activeTab = 'posts'"
          >
            <FileText :size="16" />
            <span>Fess Terbit</span>
            <span class="tab-pill-count">{{ baseFesses.length }}</span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'rules'"
            :class="['profile-subtab-btn', { active: activeTab === 'rules' }]"
            @click="activeTab = 'rules'"
          >
            <ShieldAlert :size="16" />
            <span>Aturan Base</span>
            <span class="tab-pill-count">{{ baseData.rules.length }}</span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'about'"
            :class="['profile-subtab-btn', { active: activeTab === 'about' }]"
            @click="activeTab = 'about'"
          >
            <Info :size="16" />
            <span>Tentang Base</span>
          </button>
        </nav>

        <!-- TAB CONTENT 1: FESS TERBIT -->
        <section v-if="activeTab === 'posts'" class="tab-pane-container mt-4">
          <ContentSkeleton
            v-if="fessesLoading && !baseFesses.length"
            type="feed-card"
            :count="3"
            label="Memuat fess…"
          />

          <AppStateView
            v-else-if="fessesError && !baseFesses.length"
            variant="error"
            title="Fess gagal dimuat"
            description="Terjadi kesalahan saat mengambil fess base ini. Coba muat ulang."
            action-label="Coba lagi"
            @action="loadBaseFesses()"
          />

          <div v-else-if="baseFesses.length" class="fess-feed-stream flex flex-col gap-4">
            <FessCard
              v-for="post in baseFesses"
              :key="post.id"
              :post="post"
              :is-admin="false"
              @like="handleLikePost"
            />
          </div>

          <!-- Empty state if no fess -->
          <div v-else class="empty-base-fess-state">
            <Inbox :size="40" class="empty-icon" />
            <h3 class="empty-title">Belum ada fess terbit</h3>
            <p class="empty-sub">
              Belum ada confession yang diterbitkan di base ini. Jadilah yang pertama mengirim fess!
            </p>
            <button
              type="button"
              class="btn-send-fess-primary mt-3"
              @click="handleSendFess"
            >
              <Send :size="15" />
              <span>Kirim Fess Sekarang</span>
            </button>
          </div>
        </section>

        <!-- TAB CONTENT 2: ATURAN BASE -->
        <section v-else-if="activeTab === 'rules'" class="tab-pane-container mt-4">
          <div class="rules-card-box">
            <div class="rules-header">
              <ShieldAlert :size="20" class="rules-accent-icon" />
              <div>
                <h2 class="rules-main-title">Panduan &amp; Ketentuan Pengiriman Fess</h2>
                <p class="rules-sub-title">Harap baca sebelum mengirim fess ke {{ baseData.handle }}</p>
              </div>
            </div>

            <ol class="rules-ordered-list">
              <li v-for="(rule, index) in baseData.rules" :key="index" class="rule-list-item">
                <span class="rule-number">{{ index + 1 }}</span>
                <span class="rule-text">{{ rule }}</span>
              </li>
            </ol>

            <div class="rules-note-callout mt-4">
              <Info :size="16" class="note-icon" />
              <p class="note-text">
                Fess yang melanggar aturan akan otomatis ditolak oleh moderator demi menjaga kenyamanan bersama.
              </p>
            </div>
          </div>
        </section>

        <!-- TAB CONTENT 3: TENTANG BASE -->
        <section v-else-if="activeTab === 'about'" class="tab-pane-container mt-4">
          <div class="about-card-box">
            <h2 class="about-section-title">Informasi Base</h2>

            <div class="about-meta-grid">
              <div class="meta-item">
                <span class="meta-lbl">Kategori</span>
                <span class="meta-val">{{ baseData.category }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Instagram Sync</span>
                <span class="meta-val">{{ baseData.igAccount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Status Verifikasi</span>
                <span :class="['meta-val', { 'status-verified': baseData.verified }]">
                  {{ baseData.verified ? 'Resmi Terverifikasi' : 'Belum Terverifikasi' }}
                </span>
              </div>
            </div>

            <div class="about-bio-box mt-4">
              <h3 class="about-sub-heading">Deskripsi Komunitas</h3>
              <p class="about-bio-text">{{ baseData.bio }}</p>
            </div>

            <div class="about-cta-box mt-4">
              <button
                type="button"
                class="btn-send-fess-primary w-full"
                @click="handleSendFess"
              >
                <Send :size="16" />
                <span>Kirim Confession ke Base Ini</span>
              </button>
            </div>
          </div>
        </section>
        </template>
      </div>
    </main>

    <!-- Bottom Persistent Nav Bar -->
    <AppBottomNav
      :active="bottomNavActive"
      @navChange="handleBottomNavChange"
      @openCompose="handleSendFess"
    />

    <!-- Toast Notification -->
    <Transition name="fade-toast">
      <div v-if="toastMessage" class="public-toast-bubble">
        <CheckCircle2 :size="16" class="toast-icon" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- MODAL DAFTAR FOLLOWER / FOLLOWING (komponen bersama — data real dari server) -->
    <FollowListModal
      v-model:show="showFollowModal"
      v-model:tab="followModalTab"
      :base-handle="cleanHandle"
      :followers-count="baseData?.followersCount ?? 0"
      :following-count="baseData?.followingCount ?? 0"
      following-source="none"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Instagram,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Send,
  Sparkles,
  FileText,
  Info,
  Inbox,
  Copy,
  ExternalLink,
  MessageSquare,
} from 'lucide-vue-next';

import FessCard from '../components/common/FessCard.vue';
import AppBottomNav from '../components/common/AppBottomNav.vue';
import FollowListModal from '../components/common/FollowListModal.vue';
import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';
import { api } from '../api';
import { mapBase } from '../composables/useBases';
import { mapFessToPost } from '../utils/fessMapper';
import { useAuthStore } from '../stores/authStore';
import { useFollowBase } from '../composables/useFollowBase';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isFollowing, toggleFollowBase, syncFollowing } = useFollowBase();

const activeTab = ref('posts');
const toastMessage = ref('');
let toastTimer = null;

// Follow Modal State — daftar pengikut & following dimuat oleh komponen
// FollowListModal dari endpoint real (GET /bases/:handle/followers,
// GET /users/me/following). Tanpa akun fake & tanpa follow antar-user.
const showFollowModal = ref(false);
const followModalTab = ref('followers'); // 'followers' or 'following'

function openFollowModal(tab = 'followers') {
  followModalTab.value = tab;
  showFollowModal.value = true;
}

// Get clean handle from route params
const cleanHandle = computed(() => String(route.params.handle || '').replace(/^@/, ''));

// Base Detail — GET /bases/:handle, normalized with mapBase()
const baseData = ref(null);
const baseLoading = ref(false);
const baseError = ref(null);
const baseNotFound = computed(() => baseError.value?.status === 404);

// Published confessions for this base — GET /bases/:handle/fesses
const baseFesses = ref([]);
const fessesLoading = ref(false);
const fessesError = ref(null);
const FESS_PAGE_LIMIT = 30;

// Guards against out-of-order responses when the route handle changes quickly.
let baseRequestId = 0;

/** The API expects the handle without the "@" prefix. */
function apiHandle(handle) {
  return String(handle || '').replace(/^@/, '');
}

// Module-level caches across mounts for instant Instagram/X profile loading (SWR)
const profileCache = new Map();
const profileFessesCache = new Map();

async function loadBase() {
  const handle = apiHandle(cleanHandle.value);
  const requestId = ++baseRequestId;

  if (!handle) {
    baseError.value = new Error('Handle base tidak tersedia');
    baseLoading.value = false;
    return;
  }

  const cacheKey = handle.toLowerCase();
  const cachedBase = profileCache.get(cacheKey);
  const cachedFesses = profileFessesCache.get(cacheKey);

  baseError.value = null;

  if (cachedBase) {
    // TAMPILAN INSTAN: Header dan fess langsung tampil 0ms tanpa skeleton berkedip
    baseData.value = cachedBase;
    baseLoading.value = false;
    document.title = `${cachedBase.name} (${cachedBase.handle}) · Fess n Curious`;
    if (cachedFesses) {
      baseFesses.value = cachedFesses;
      fessesLoading.value = false;
    }
  } else {
    // Kunjungan pertama: tampilkan skeleton halus
    baseLoading.value = true;
    baseData.value = null;
    baseFesses.value = [];
    fessesError.value = null;
  }

  try {
    const res = await api.getBase(handle);
    if (requestId !== baseRequestId) return;
    const mapped = mapBase(res);
    baseData.value = mapped;
    profileCache.set(cacheKey, mapped);
    document.title = `${mapped.name} (${mapped.handle}) · Fess n Curious`;
    loadBaseFesses(requestId, !cachedFesses);
  } catch (e) {
    if (requestId !== baseRequestId) return;
    if (!cachedBase) {
      baseError.value = e;
      document.title = `${cleanHandle.value} · Fess n Curious`;
    }
  } finally {
    if (requestId === baseRequestId) baseLoading.value = false;
  }
}

async function loadBaseFesses(requestId = baseRequestId, showLoading = true) {
  const handle = apiHandle(baseData.value?.handle);
  if (!handle) return;
  const cacheKey = handle.toLowerCase();

  if (showLoading) fessesLoading.value = true;
  fessesError.value = null;

  try {
    // Halaman publik hanya menampilkan fess yang sudah terbit.
    const res = await api.getBaseFesses(handle, {
      page: 1,
      limit: FESS_PAGE_LIMIT,
      status: 'published',
    });
    if (requestId !== baseRequestId) return;
    const mappedList = (res?.data || []).map(mapFessToPost).filter(Boolean);
    baseFesses.value = mappedList;
    profileFessesCache.set(cacheKey, mappedList);
  } catch (e) {
    if (requestId !== baseRequestId) return;
    if (!profileFessesCache.has(cacheKey)) {
      fessesError.value = e;
      baseFesses.value = [];
    }
  } finally {
    if (requestId === baseRequestId) fessesLoading.value = false;
  }
}

onMounted(() => {
  syncFollowing();
  loadBase();
});

watch(
  () => route.params.handle,
  () => {
    loadBase();
  }
);

// Base avatar — the API may return an image URL or just initials; only URLs
// go into an <img>, initials fall back to the designed initial-letter core.
const baseAvatar = computed(() => {
  const avatar = baseData.value?.avatar;
  return typeof avatar === 'string' && /^(https?:|data:|blob:)/i.test(avatar) ? avatar : null;
});

// Following State
const isBaseFollowed = computed(() =>
  baseData.value ? isFollowing(baseData.value.handle) : false,
);

async function handleToggleFollow() {
  const handle = baseData.value?.handle;
  if (!handle) return;
  try {
    const nowFollowing = await toggleFollowBase(handle);
    showToast(
      nowFollowing ? `Berhasil mengikuti ${handle}` : `Berhenti mengikuti ${handle}`,
    );
  } catch (e) {
    showToast('Gagal memperbarui status ikuti. Coba lagi.');
  }
}

// Followers count display — the real value from the loaded base payload.
const currentFollowersDisplay = computed(() => {
  const count = baseData.value?.followersCount ?? 0;
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toLocaleString();
});

// Check if currently viewing own base
const isOwnBase = computed(() => {
  if (!authStore.isBaseAdmin) return false;
  const managed = authStore.user?.managedBases || [];
  const target = baseData.value?.handle?.toLowerCase();
  if (!target) return false;
  const targetClean = target.replace(/^@/, '');
  return managed.some((h) => {
    const value = String(h).toLowerCase();
    return value === target || value === `@${targetClean}`;
  });
});

// Back navigation
function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else if (authStore.user?.role === 'Base Admin') {
    router.push('/base-admin');
  } else {
    router.push('/feed');
  }
}

// Send confession to this base
function handleSendFess() {
  if (!baseData.value) return;
  router.push({
    path: '/create',
    query: { base: baseData.value.handle },
  });
}

// Share profile
async function handleShare() {
  if (!baseData.value) return;
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${baseData.value.name} · Fess n Curious`,
        text: `Lihat profil base ${baseData.value.name} (${baseData.value.handle}) di Fess n Curious!`,
        url,
      });
      return;
    } catch (e) {
      // fallback to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast('Tautan profil base berhasil disalin!');
  } catch (err) {
    showToast('Tautan: ' + url);
  }
}

async function copyHandle() {
  if (!baseData.value) return;
  try {
    await navigator.clipboard.writeText(baseData.value.handle);
    showToast(`Handle ${baseData.value.handle} berhasil disalin!`);
  } catch (err) {
    showToast(baseData.value.handle);
  }
}

function showToast(msg) {
  toastMessage.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 2800);
}

// Like post — optimistic, reconciled with POST /fesses/:id/vote
async function handleLikePost({ id, isLiked }) {
  const item = baseFesses.value.find((p) => String(p.id) === String(id));
  const previous = item ? { isLiked: item.isLiked, likes: item.likes ?? 0 } : null;

  if (item) {
    item.isLiked = isLiked;
    item.likes = Math.max(0, (item.likes ?? 0) + (isLiked ? 1 : -1));
  }

  try {
    const res = await api.voteFess(id, isLiked ? 'up' : 'down');
    if (item && res && typeof res.upvotes === 'number') {
      item.likes = res.upvotes;
      item.downvotes = res.downvotes ?? item.downvotes;
      item.isLiked = res.user_vote === 'up';
      item.userVote = res.user_vote ?? null;
    }
  } catch (e) {
    // Roll back the local item when the vote request fails.
    if (item && previous) {
      item.isLiked = previous.isLiked;
      item.likes = previous.likes;
    }
  }
}

// Bottom navigation tab switching
const bottomNavActive = computed(() => 'search');

function handleBottomNavChange(tabKey) {
  const isBaseAdmin = authStore.user?.role === 'Base Admin';
  if (isBaseAdmin) {
    if (tabKey === 'home') router.push('/base-admin');
    else if (tabKey === 'search') router.push({ path: '/base-admin', query: { tab: 'search' } });
    else if (tabKey === 'notif') router.push({ path: '/base-admin', query: { tab: 'notif' } });
    else if (tabKey === 'profile' || tabKey === 'akun') router.push({ path: '/base-admin', query: { tab: 'akun' } });
  } else {
    if (tabKey === 'home') router.push('/feed');
    else if (tabKey === 'search') router.push({ path: '/feed', query: { tab: 'search' } });
    else if (tabKey === 'notif') router.push({ path: '/feed', query: { tab: 'notif' } });
    else if (tabKey === 'profile' || tabKey === 'akun') router.push({ path: '/feed', query: { tab: 'profile' } });
  }
}
</script>

<style scoped>
.base-public-page {
  min-height: 100vh;
  background-color: var(--shell-bg, #0b0d14);
  color: var(--shell-text, #f1f3f9);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

/* TOP STICKY BAR */
.public-top-bar {
  position: sticky;
  top: 0;
  z-index: 80;
  background: var(--shell-header-bg, rgba(11, 13, 20, 0.92));
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.top-bar-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--shell-text, #f1f3f9);
  cursor: pointer;
  padding: 6px 10px 6px 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.07);
}

.btn-back-text {
  font-size: 14px;
  font-weight: 500;
}

.top-title-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.top-handle-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 700;
  color: var(--shell-text, #fff);
}

.verified-icon {
  color: #0055ff;
}

.top-sub-tag {
  font-size: 11px;
  color: var(--shell-text-muted, #8e95a5);
}

.btn-icon-action {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.1));
  color: var(--shell-text, #f1f3f9);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-action:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05);
}

/* MAIN STAGE */
.public-main-stage {
  flex: 1;
  padding: 16px 16px 36px;
  display: flex;
  justify-content: center;
}

.public-stage-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* BASE HERO CARD — REDESIGNED PREMIUM PROFILE */
.base-hero-card {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

[data-theme='dark'] .base-hero-card {
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);
}

.base-cover-banner {
  height: 145px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 16px 20px;
  overflow: hidden;
}

.cover-ambient-glow {
  position: absolute;
  top: -40px;
  right: 15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  filter: blur(45px);
  pointer-events: none;
  opacity: 0.7;
}

.cover-overlay-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 14px 14px;
}

.cover-category-badge {
  position: relative;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: rgba(10, 15, 30, 0.55);
  backdrop-filter: blur(12px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.category-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
}

.hero-body-content {
  padding: 0 24px 26px;
  position: relative;
}

/* AVATAR & TOP STAGE */
.hero-avatar-stage {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: -52px;
  position: relative;
  z-index: 5;
}

.avatar-ring-wrapper {
  position: relative;
  width: 98px;
  height: 98px;
  border-radius: 50%;
  padding: 4px;
  background: var(--shell-card);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
}

.base-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid var(--shell-card);
}

.base-avatar-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  border: 2px solid var(--shell-card);
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.25);
}

.avatar-verified-shield {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  background: #0055ff;
  color: #fff;
  border-radius: 50%;
  border: 3px solid var(--shell-card);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(0, 85, 255, 0.45);
}

.avatar-stage-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-quick-share {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-quick-share:hover {
  background: rgba(0, 85, 255, 0.1);
  border-color: rgba(0, 85, 255, 0.35);
  color: #0055ff;
  transform: translateY(-1px);
}

/* IDENTITY BLOCK */
.base-identity-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 14px;
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.base-display-name {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--shell-text);
  line-height: 1.25;
}

.badge-official-base {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 85, 255, 0.08);
  color: #0055ff;
  border: 1.5px solid rgba(0, 85, 255, 0.22);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

[data-theme='dark'] .badge-official-base {
  background: rgba(0, 85, 255, 0.18);
  color: #60a5fa;
  border-color: rgba(0, 85, 255, 0.35);
}

.base-handle-line {
  margin-top: 2px;
}

.btn-handle-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 2px 6px;
  margin-left: -6px;
  border-radius: 8px;
  cursor: pointer;
  color: #0055ff;
  font-family: inherit;
  transition: all 0.15s ease;
}

.btn-handle-copy:hover {
  background: rgba(0, 85, 255, 0.08);
}

[data-theme='dark'] .btn-handle-copy {
  color: #60a5fa;
}

.handle-text {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.copy-handle-icon {
  opacity: 0.65;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn-handle-copy:hover .copy-handle-icon {
  opacity: 1;
  transform: scale(1.1);
}

.base-bio-paragraph {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--shell-text-muted);
  margin: 6px 0 10px;
  font-weight: 500;
}

.base-medsos-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.medsos-item-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text);
  text-decoration: none;
  transition: all 0.2s ease;
}

.medsos-item-chip:hover {
  background: var(--shell-chip-hover, rgba(0, 85, 255, 0.08));
  border-color: rgba(0, 85, 255, 0.3);
}

.ig-icon {
  color: #e1306c;
}

.medsos-ext-icon {
  opacity: 0.6;
}

.auto-sync-chip {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
  color: #10b981;
  font-weight: 800;
}

.pulse-radar-wrap {
  position: relative;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.radar-wave {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.45);
  animation: radarPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes radarPing {
  0% { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* 3 BENTO METRIC TILES */
.base-stats-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 16px 0;
}

.bento-stat-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[data-theme='light'] .bento-stat-card {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 6px rgba(11, 27, 77, 0.04);
}

.bento-stat-card.bento-clickable {
  cursor: pointer;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  font-family: inherit;
}

.bento-stat-card.bento-clickable:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 85, 255, 0.4);
  box-shadow: 0 6px 16px rgba(0, 85, 255, 0.12);
}

.bento-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.bento-stat-num {
  font-size: 18px;
  font-weight: 900;
  color: var(--shell-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.bento-stat-icon-muted {
  color: var(--shell-text-muted);
  opacity: 0.6;
}

.bento-stat-arrow {
  color: var(--shell-text-muted);
  opacity: 0.6;
  transition: transform 0.18s ease, color 0.18s ease;
}

.bento-clickable:hover .bento-stat-arrow {
  opacity: 1;
  color: #0055ff;
  transform: translateX(2px);
}

.bento-stat-bottom {
  display: flex;
  flex-direction: column;
}

.bento-stat-label {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--shell-text);
  line-height: 1.2;
}

.bento-stat-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--shell-text-muted);
  text-transform: lowercase;
  opacity: 0.8;
}

/* ACTION BUTTONS */
.hero-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.btn-follow-action {
  flex: 1;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  background: var(--shell-chip);
  border: 1.5px solid var(--shell-border);
  color: var(--shell-text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-follow-action:hover {
  background: var(--shell-chip-hover, rgba(0, 0, 0, 0.06));
  border-color: var(--shell-text);
  transform: translateY(-1px);
}

.btn-follow-action.following {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.35);
  color: #10b981;
}

[data-theme='light'] .btn-follow-action.following {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.btn-follow-action.following:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-send-fess-primary {
  flex: 1.25;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.3px;
  cursor: pointer;
  background: linear-gradient(135deg, #0055ff 0%, #0038cc 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 85, 255, 0.38);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-send-fess-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 85, 255, 0.55);
  filter: brightness(1.08);
}

.btn-send-fess-primary:active {
  transform: translateY(0);
}

.btn-send-icon {
  transition: transform 0.2s ease;
}

.btn-send-fess-primary:hover .btn-send-icon {
  transform: translate(3px, -2px);
}

/* OWN BASE NOTICE */
.own-base-notice-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(0, 85, 255, 0.08);
  border: 1px solid rgba(0, 85, 255, 0.25);
  border-radius: 12px;
  padding: 12px 14px;
}

.notice-text-col {
  flex: 1;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 2px;
}

.notice-desc {
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--shell-text-muted, #94a3b8);
  margin: 0;
}

.btn-goto-admin {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 85, 255, 0.2);
  border: 1px solid rgba(0, 85, 255, 0.4);
  color: #fff;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-goto-admin:hover {
  background: rgba(0, 85, 255, 0.35);
}

/* SUBTABS NAVIGATION */
.public-tabs-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  padding-bottom: 4px;
}

.profile-subtab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--shell-text-muted, #8e95a5);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  bottom: -5px;
}

.profile-subtab-btn:hover {
  color: var(--shell-text, #fff);
}

.profile-subtab-btn.active {
  color: var(--shell-text, #fff);
  border-bottom-color: #0055ff;
}

/* TAB CONTENT: RULES */
.rules-card-box,
.about-card-box {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 18px;
  padding: 22px;
}

.rules-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.rules-accent-icon {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.rules-main-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  margin: 0 0 4px;
}

.rules-sub-title {
  font-size: 12.5px;
  color: var(--shell-text-muted, #8e95a5);
  margin: 0;
}

.rules-ordered-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.rule-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 85, 255, 0.15);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.rule-text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--shell-text, #e2e8f0);
}

.rules-note-callout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fbbf24;
}

.note-text {
  font-size: 12px;
  margin: 0;
}

/* TAB CONTENT: ABOUT */
.about-section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  margin: 0 0 16px;
}

.about-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.meta-item {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-lbl {
  font-size: 11px;
  font-weight: 500;
  color: var(--shell-text-muted, #8e95a5);
}

.meta-val {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--shell-text, #fff);
}

.status-verified {
  color: #10b981;
}

.about-sub-heading {
  font-size: 14px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  margin: 0 0 8px;
}

.about-bio-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--shell-text-muted, #cbd5e1);
  margin: 0;
}

/* EMPTY STATE */
.empty-base-fess-state {
  text-align: center;
  padding: 48px 20px;
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: var(--shell-text-muted, #64748b);
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  margin: 0 0 6px;
}

.empty-sub {
  font-size: 13px;
  color: var(--shell-text-muted, #8e95a5);
  max-width: 380px;
  margin: 0;
  line-height: 1.5;
}

/* TOAST BUBBLE */
.public-toast-bubble {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 120;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 30px;
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.toast-icon {
  color: #10b981;
}

.fade-toast-enter-active,
.fade-toast-leave-active {
  transition: all 0.25s ease;
}

.fade-toast-enter-from,
.fade-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

@media (max-width: 640px) {
  .public-main-stage {
    padding: 10px 10px 32px;
  }

  .base-hero-card {
    border-radius: 18px;
  }

  .base-cover-banner {
    height: 105px;
    padding: 10px 12px;
  }

  .cover-category-badge {
    font-size: 10px;
    padding: 4px 10px;
  }

  .hero-body-content {
    padding: 0 14px 16px;
  }

  .hero-avatar-stage {
    margin-top: -38px;
  }

  .avatar-ring-wrapper {
    width: 72px;
    height: 72px;
    padding: 3px;
  }

  .avatar-verified-shield {
    width: 22px;
    height: 22px;
    border-width: 2px;
  }

  .btn-quick-share {
    padding: 5px 12px;
    font-size: 11.5px;
  }

  .base-avatar-core {
    font-size: 20px;
  }

  .base-display-name {
    font-size: 17px;
  }

  .badge-official-base {
    font-size: 9.5px;
    padding: 3px 8px;
  }

  .handle-text {
    font-size: 12.5px;
  }

  .base-bio-paragraph {
    font-size: 12px;
    line-height: 1.5;
    margin: 4px 0 8px;
  }

  .medsos-item-chip {
    padding: 4px 10px;
    font-size: 11px;
    gap: 4px;
  }

  .base-stats-bento-grid {
    gap: 6px;
    margin: 10px 0;
  }

  .bento-stat-card {
    padding: 8px 10px;
    border-radius: 12px;
  }

  .bento-stat-num {
    font-size: 15px;
  }

  .bento-stat-label {
    font-size: 10px;
  }

  .bento-stat-sub {
    font-size: 8.5px;
  }

  .hero-actions-row {
    flex-direction: row;
    gap: 8px;
    margin-top: 6px;
  }

  .btn-follow-action,
  .btn-send-fess-primary {
    height: 38px;
    font-size: 12px;
    padding: 0 12px;
    border-radius: 10px;
  }

  .about-meta-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
