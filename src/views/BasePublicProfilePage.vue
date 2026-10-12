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
            <span>{{ baseData.handle }}</span>
            <ShieldCheck :size="16" class="verified-icon" />
          </div>
          <span class="top-sub-tag">{{ baseData.category }} Base</span>
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
              <div class="cover-status-badge">
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
                
                <span class="avatar-verified-shield" title="Base Resmi Terverifikasi">
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
                <div class="badge-official-base" title="Base Resmi Terverifikasi Platform">
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

                <div class="medsos-item-chip est-chip" title="Tahun berdiri base">
                  <Award :size="13" class="award-icon" />
                  <span>Est. {{ baseData.established || '2023' }}</span>
                </div>
              </div>
            </div>

            <!-- 3 BENTO METRIC TILES (Fess Terbit, Mengikuti, Pengikut) -->
            <div class="base-stats-bento-grid">
              <div class="bento-stat-card">
                <div class="bento-stat-top">
                  <span class="bento-stat-num">{{ baseFesses.length || baseData.fessCount }}</span>
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
            <span class="tab-pill-count">{{ baseData.rules?.length || 5 }}</span>
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
          <div v-if="baseFesses.length" class="fess-feed-stream flex flex-col gap-4">
            <FessCard
              v-for="post in baseFesses"
              :key="post.id"
              :post="post"
              :is-admin="false"
              @like="handleLikePost(post)"
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
                <span class="meta-val status-verified">Resmi Terverifikasi</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Didirikan</span>
                <span class="meta-val">{{ baseData.established || '2023' }}</span>
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

    <!-- MODAL DAFTAR FOLLOW & FOLLOWER -->
    <div
      v-if="showFollowModal"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="followModalTab === 'followers' ? 'Daftar Pengikut' : 'Daftar Mengikuti'"
      @click.self="showFollowModal = false"
    >
      <div class="modal-card follow-modal-card">
        <div class="follow-modal-header">
          <!-- Tab Switcher: Follower vs Following -->
          <div class="follow-tabs-nav">
            <button
              type="button"
              class="follow-tab-btn"
              :class="{ active: followModalTab === 'followers' }"
              @click="followModalTab = 'followers'"
            >
              <span>Follower</span>
              <span class="follow-tab-count">{{ currentFollowersDisplay }}</span>
            </button>
            <button
              type="button"
              class="follow-tab-btn"
              :class="{ active: followModalTab === 'following' }"
              @click="followModalTab = 'following'"
            >
              <span>Follow</span>
              <span class="follow-tab-count">{{ baseData.followingCount }}</span>
            </button>
          </div>
          <button
            type="button"
            class="btn-close-modal"
            aria-label="Tutup"
            @click="showFollowModal = false"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Search Bar -->
        <div class="follow-search-box">
          <Search :size="15" class="follow-search-icon" />
          <input
            v-model="followSearchQuery"
            type="text"
            class="follow-search-input"
            :placeholder="followModalTab === 'followers' ? 'Cari di daftar follower...' : 'Cari di daftar following...'"
          />
          <button
            v-if="followSearchQuery"
            type="button"
            class="btn-clear-search"
            @click="followSearchQuery = ''"
          >
            <X :size="13" />
          </button>
        </div>

        <!-- Users List -->
        <div class="follow-list-body custom-scrollbar">
          <div v-if="filteredFollowList.length === 0" class="follow-empty-state">
            <Users :size="32" class="empty-icon" />
            <p class="empty-text">
              {{ followSearchQuery ? 'Tidak ada akun yang cocok dengan pencarian' : 'Belum ada data akun' }}
            </p>
          </div>

          <div
            v-for="user in filteredFollowList"
            :key="user.id"
            class="follow-user-row"
          >
            <div class="follow-user-avatar-wrap">
              <img :src="user.avatar" :alt="user.name" class="follow-user-avatar" />
              <span v-if="user.isVerified" class="follow-verified-dot" title="Verified">✓</span>
            </div>

            <div class="follow-user-info">
              <div class="follow-user-name-line">
                <span class="follow-user-name">{{ user.name }}</span>
                <span v-if="user.isVerified" class="verified-tag">Base</span>
              </div>
              <div class="follow-user-handle">{{ user.handle }}</div>
              <p class="follow-user-bio">{{ user.bio }}</p>
            </div>

            <button
              type="button"
              class="btn-follow-toggle"
              :class="{ 'btn-following': user.isFollowing }"
              @click="toggleFollowUser(user)"
            >
              <template v-if="user.isFollowing">
                <UserCheck :size="13" />
                <span>Mengikuti</span>
              </template>
              <template v-else>
                <UserPlus :size="13" />
                <span>Ikuti</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
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
  X,
  Search,
  Users,
  Copy,
  ExternalLink,
  Award,
  MessageSquare,
} from 'lucide-vue-next';

import FessCard from '../components/common/FessCard.vue';
import AppBottomNav from '../components/common/AppBottomNav.vue';
import { getBaseByHandle, getSampleFessesForBase, ALL_BASES } from '../data/bases';
import { FEED_POSTS } from '../data/mockPosts';
import { useAuthStore } from '../stores/authStore';
import { useFollowBase } from '../composables/useFollowBase';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isFollowing, toggleFollowBase } = useFollowBase();

const activeTab = ref('posts');
const toastMessage = ref('');
let toastTimer = null;

// Follow Modal State
const showFollowModal = ref(false);
const followModalTab = ref('followers'); // 'followers' or 'following'
const followSearchQuery = ref('');

const followersList = ref([
  {
    id: 'f1',
    name: 'Rizky Pratama',
    handle: '@dev_rizky',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    bio: 'Frontend dev • Vue & Tailwind enthusiast',
    isFollowing: true,
  },
  {
    id: 'f2',
    name: 'Sarah Amanda',
    handle: '@sarah_design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    bio: 'UI/UX Designer & coffee lover ☕',
    isFollowing: false,
  },
  {
    id: 'f3',
    name: 'Budi Santoso',
    handle: '@budi_santoso',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    bio: 'Backend engineer • Golang & Postgres',
    isFollowing: true,
  },
  {
    id: 'f4',
    name: 'Kampus Fess Official',
    handle: '@kampusfess',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=120&q=80',
    bio: 'Portal curhat dan info mahasiswa se-Indonesia 🎓',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'f5',
    name: 'Arya Nugraha',
    handle: '@arya_cloud',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    bio: 'DevOps & Cloud architecture enthusiast',
    isFollowing: true,
  },
  {
    id: 'f6',
    name: 'Kucing Dev',
    handle: '@kucing_oren',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=120&q=80',
    bio: 'Meow meow debug bug kucing oren 🐾',
    isFollowing: true,
  },
]);

const followingList = ref([
  {
    id: 'fo1',
    name: 'Kampus Fess Official',
    handle: '@kampusfess',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=120&q=80',
    bio: 'Portal curhat dan info mahasiswa se-Indonesia 🎓',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'fo2',
    name: 'ITB Confess',
    handle: '@itb_fess',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=120&q=80',
    bio: 'Komunitas ganesha confess & diskusi tech',
    isFollowing: true,
    isVerified: true,
  },
  {
    id: 'fo3',
    name: 'Rizky Pratama',
    handle: '@dev_rizky',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    bio: 'Frontend dev • Vue & Tailwind enthusiast',
    isFollowing: true,
  },
]);

function openFollowModal(tab = 'followers') {
  followModalTab.value = tab;
  followSearchQuery.value = '';
  showFollowModal.value = true;
}

function toggleFollowUser(user) {
  user.isFollowing = !user.isFollowing;
}

const filteredFollowList = computed(() => {
  const currentList = followModalTab.value === 'followers' ? followersList.value : followingList.value;
  const q = followSearchQuery.value.trim().toLowerCase();
  if (!q) return currentList;
  return currentList.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      (u.bio && u.bio.toLowerCase().includes(q)),
  );
});

// Get clean handle from route params
const rawHandle = computed(() => route.params.handle || 'codememfess');
const cleanHandle = computed(() => String(rawHandle.value).replace(/^@/, ''));

// Base Details
const baseData = computed(() => {
  return getBaseByHandle(cleanHandle.value);
});

const baseAvatar = computed(() => {
  if (baseData.value?.avatar) return baseData.value.avatar;
  if (authStore.user?.handle === baseData.value?.handle && authStore.user?.avatar) {
    return authStore.user.avatar;
  }
  const clean = cleanHandle.value.toLowerCase();
  if (clean === 'codememfess') {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80';
  }
  if (clean === 'unermenfess') {
    return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=200&q=80';
  }
  if (clean === 'fess10nopember') {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=200&q=80';
  }
  if (clean === 'fessugm') {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80';
  }
  return null;
});

// Published confessions for this base
const baseFesses = ref([]);

function loadBaseFesses() {
  const target = baseData.value.handle.toLowerCase();
  // Check if any posts in FEED_POSTS match this base
  const existingMatches = FEED_POSTS.filter(
    (p) => (p.handle && p.handle.toLowerCase() === target) ||
           (p.senderHandle && p.senderHandle.toLowerCase() === target)
  );

  if (existingMatches.length > 0) {
    baseFesses.value = [...existingMatches];
  } else {
    // Generate realistic contextual confessions for this base
    baseFesses.value = getSampleFessesForBase(baseData.value);
  }
}

onMounted(() => {
  loadBaseFesses();
  document.title = `${baseData.value.name} (${baseData.value.handle}) · Fess n Curious`;
});

watch(
  () => route.params.handle,
  () => {
    loadBaseFesses();
    document.title = `${baseData.value.name} (${baseData.value.handle}) · Fess n Curious`;
  }
);

// Following State
const isBaseFollowed = computed(() => {
  return isFollowing(baseData.value.handle);
});

function handleToggleFollow() {
  const result = toggleFollowBase(baseData.value.handle);
  showToast(result ? `Berhasil mengikuti ${baseData.value.handle}` : `Berhenti mengikuti ${baseData.value.handle}`);
}

// Followers count display (dynamically adjusts if user follows)
const currentFollowersDisplay = computed(() => {
  let count = baseData.value.followersCount || 12400;
  if (isBaseFollowed.value) {
    count += 1;
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toLocaleString();
});

// Check if currently viewing own base
const isOwnBase = computed(() => {
  if (!authStore.isBaseAdmin) return false;
  const managed = authStore.user?.managedBases || [];
  const target = baseData.value.handle.toLowerCase();
  return managed.some((h) => h.toLowerCase() === target || h.toLowerCase() === `@${cleanHandle.value.toLowerCase()}`);
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
  router.push({
    path: '/create',
    query: { base: baseData.value.handle },
  });
}

// Share profile
async function handleShare() {
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

// Like post
function handleLikePost(post) {
  post.isLiked = !post.isLiked;
  post.likes = (post.likes || 0) + (post.isLiked ? 1 : -1);
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

.est-chip {
  background: var(--shell-chip);
}

.award-icon {
  color: #f59e0b;
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

/* MODAL FOLLOW / FOLLOWER BACKDROP & CARD */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: modalFadeIn 0.18s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  width: 100%;
  animation: modalScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

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

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-close-modal:hover {
  background: var(--shell-chip);
  color: var(--shell-text);
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

  .follow-modal-card {
    max-width: 440px;
    width: 94%;
    max-height: 82vh;
    border-radius: 20px;
    margin: auto;
  }

  .follow-modal-header {
    padding: 10px 14px;
  }

  .follow-tab-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
