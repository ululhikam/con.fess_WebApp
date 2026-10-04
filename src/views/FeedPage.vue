<template>
  <div class="user-app-layout">
    <!-- TOP HEADER (LOGO & QUICK ACTIONS ONLY) -->
    <header class="app-top-header">
      <div class="top-header-inner">
        <!-- Logo Left -->
        <router-link to="/" class="brand-logo">
          <div class="speech-bubble-logo">
            <span class="logo-icon">💬</span>
            <span class="logo-base">BASE</span>
            <span class="logo-club">CONFESS</span>
          </div>
        </router-link>

        <!-- Right Quick Actions -->
        <div class="header-right-actions">
          <router-link v-if="authStore.isBaseAdmin || authStore.isSuperAdmin" to="/base-admin" class="btn-admin-chip">
            Admin Portal
          </router-link>
          <button @click="openComposerModal = true" class="btn-header-kirim">
            + Kirim Fess
          </button>
        </div>
      </div>
    </header>

    <!-- CENTERED MAIN CONTENT STAGE -->
    <main class="app-main-centered-stage">
      <div class="centered-content-wrapper">
        
        <!-- ===================================================================
             VIEW 1: HOME (FEED)
             =================================================================== -->
        <div v-if="activeNav === 'home'" class="view-stage">
          <div class="stage-header-row">
            <h1 class="stage-title">Home</h1>

            <div class="feed-sub-tabs">
              <button 
                @click="homeTab = 'forYou'" 
                :class="['sub-tab-btn', homeTab === 'forYou' ? 'active' : '']"
              >
                For You
              </button>
              <button 
                @click="homeTab = 'mengikuti'" 
                :class="['sub-tab-btn', homeTab === 'mengikuti' ? 'active' : '']"
              >
                Mengikuti
              </button>
            </div>
          </div>

          <!-- Base yang diikuti Quick Bar -->
          <div class="followed-base-bar mb-4">
            <span class="fbb-label">Base diikuti:</span>
            <div class="fbb-pills flex gap-2 overflow-x-auto no-scrollbar">
              <span class="fbb-chip">UST ustfess</span>
              <span @click="activeNav = 'search'" class="fbb-chip active cursor-pointer">+ Cari base lain</span>
            </div>
          </div>

          <!-- Feed Cards List -->
          <div class="feed-cards-list flex flex-col gap-3 sm:gap-4">
            <div 
              v-for="post in feedPosts" 
              :key="post.id" 
              class="centered-feed-card"
            >
              <div class="card-header-row">
                <div class="user-meta-box">
                  <div class="avatar-circle-sm" :style="{ background: post.avatarBg }">
                    <img v-if="post.avatarImg" :src="post.avatarImg" alt="avatar" />
                    <span v-else>{{ post.avatarText }}</span>
                  </div>
                  <div class="user-handle-box">
                    <span class="handle-title">{{ post.handle }}</span>
                    <span class="post-time">• {{ post.time }}</span>
                  </div>
                </div>
                <span :class="['tag-badge', post.tag === 'Tanya' ? 'tag-tanya' : 'tag-cerita']">
                  📌 {{ post.tag || 'Cerita' }}
                </span>
              </div>

              <div class="card-body-text">
                <p class="post-body-content">{{ post.content }}</p>
              </div>

              <div class="card-action-bar">
                <button class="action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </button>
                <button class="action-btn quote-btn">
                  <span>⁹⁹</span>
                </button>
                <button @click="toggleLikePost(post.id)" :class="['action-btn', post.isLiked ? 'liked' : '']">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.isLiked ? '#EF4444' : 'none'" :stroke="post.isLiked ? '#EF4444' : 'currentColor'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button class="action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                </button>
                <button class="action-btn ml-auto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             VIEW 2: SEARCH
             =================================================================== -->
        <div v-else-if="activeNav === 'search'" class="view-stage">
          <h1 class="stage-title mb-4 text-center">Search</h1>

          <!-- Search Input Box -->
          <div class="search-input-container mb-4">
            <span class="search-input-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="search-input-field" 
              placeholder="Cari base atau menfess..." 
            />
          </div>

          <p class="search-sub-label mb-3 text-center">Temukan base yang kamu suka</p>

          <!-- Segmented Toggle Tabs: Base | Menfess -->
          <div class="segmented-tabs-container mb-4">
            <button 
              @click="searchTab = 'base'" 
              :class="['segmented-btn', searchTab === 'base' ? 'active' : '']"
            >
              Base
            </button>
            <button 
              @click="searchTab = 'menfess'" 
              :class="['segmented-btn', searchTab === 'menfess' ? 'active' : '']"
            >
              Menfess
            </button>
          </div>

          <!-- Category Sub Pills -->
          <div class="sub-pills-row mb-6 justify-center flex-wrap">
            <button 
              v-for="cat in ['Semua', 'Kampus', 'Kota', 'Hobi']" 
              :key="cat"
              @click="selectedCategory = cat"
              :class="['sub-pill-btn', selectedCategory === cat ? 'active' : '']"
            >
              {{ cat }}
            </button>
          </div>

          <h3 class="section-title-md mb-4">Base For You</h3>

          <!-- Explore Base List -->
          <div class="explore-base-list flex flex-col gap-3">
            <div v-for="base in filteredBases" :key="base.handle" class="centered-base-card">
              <div class="eb-avatar-box" :style="{ background: base.color }">
                <span>{{ base.initial }}</span>
              </div>
              <div class="eb-meta-info">
                <div class="eb-name-text">{{ base.name }}</div>
                <div class="eb-handle-text">{{ base.handle }}</div>
              </div>
              <button 
                @click="toggleFollowBase(base.handle)" 
                :class="['btn-follow-outline', isFollowing(base.handle) ? 'following' : '']"
              >
                {{ isFollowing(base.handle) ? 'Diikuti' : 'Ikuti' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             VIEW 3: AKTIVITAS
             =================================================================== -->
        <div v-else-if="activeNav === 'aktivitas'" class="view-stage">
          <h1 class="stage-title mb-4 text-center">Aktivitas</h1>

          <div class="segmented-tabs-container mb-8">
            <button 
              @click="aktivitasTab = 'semua'" 
              :class="['segmented-btn', aktivitasTab === 'semua' ? 'active' : '']"
            >
              Semua
            </button>
            <button 
              @click="aktivitasTab = 'balasan'" 
              :class="['segmented-btn', aktivitasTab === 'balasan' ? 'active' : '']"
            >
              Balasan
            </button>
          </div>

          <div class="empty-aktivitas-center">
            <p class="empty-main-text">Belum ada aktivitas.</p>
            <p class="empty-sub-text">Hanya aktivitas akunmu yang tampil di sini.</p>
          </div>
        </div>

        <!-- ===================================================================
             VIEW 4: AKUN
             =================================================================== -->
        <div v-else-if="activeNav === 'akun'" class="view-stage">
          <h1 class="stage-title mb-6 text-center">Akun</h1>

          <!-- User Info Card -->
          <div class="user-info-banner-card mb-6">
            <div class="banner-avatar-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="banner-user-details">
              <div class="banner-email-text">{{ authStore.user?.username || 'ululhikam69@gmail.com' }}</div>
              <div class="banner-sub-note">Identitas akunmu tidak ditampilkan di feed. Nama samaran berbeda di setiap thread.</div>
            </div>
            <span class="chevron-right">›</span>
          </div>

          <!-- Account Menu Items List -->
          <div class="akun-menu-group mb-6">
            <div class="akun-menu-row">
              <span class="row-icon">💳</span>
              <span class="row-label">Saldo & Top Up</span>
              <span class="row-sub">1 MFC - 0 MFC beli</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">👤</span>
              <span class="row-label">Profil & avatar</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">🔑</span>
              <span class="row-label">Keamanan akun</span>
              <span class="row-sub">Email & password</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">📝</span>
              <span class="row-label">Fess saya</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">⭐</span>
              <span class="row-label">Base yang diikuti</span>
              <span class="chevron-right">›</span>
            </div>
          </div>

          <!-- Settings Section -->
          <h3 class="section-title-md mb-4">Pengaturan</h3>

          <div class="akun-menu-group">
            <div class="akun-menu-row">
              <span class="row-icon">☀️</span>
              <span class="row-label">Tampilan</span>
              <div class="segmented-theme-pills">
                <button class="stp-btn">Sistem</button>
                <button class="stp-btn">Light</button>
                <button class="stp-btn active">Dark</button>
              </div>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">🔔</span>
              <span class="row-label">Notifikasi</span>
              <span class="row-sub">Aktivitas di dalam aplikasi</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">❓</span>
              <span class="row-label">Bantuan</span>
              <span class="row-sub">internal@myfess.id</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">🚩</span>
              <span class="row-label">Laporkan pelanggaran</span>
              <span class="row-sub">Konten yang melanggar</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">📜</span>
              <span class="row-label">Ketentuan Layanan</span>
              <span class="chevron-right">›</span>
            </div>

            <div class="akun-menu-row">
              <span class="row-icon">🛡️</span>
              <span class="row-label">Kebijakan Privasi</span>
              <span class="chevron-right">›</span>
            </div>

            <button @click="handleLogout" class="akun-menu-row logout-row">
              <span class="row-icon text-red">🚪</span>
              <span class="row-label text-red">Keluar</span>
              <span class="chevron-right text-red">›</span>
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- FIXED BOTTOM NAVIGATION BAR (WITH ICONS) -->
    <nav class="app-bottom-navbar">
      <div class="bottom-nav-inner">
        <button 
          @click="activeNav = 'home'" 
          :class="['bottom-nav-tab', activeNav === 'home' ? 'active' : '']"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span class="nav-tab-label">Home</span>
        </button>

        <button 
          @click="activeNav = 'search'" 
          :class="['bottom-nav-tab', activeNav === 'search' ? 'active' : '']"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span class="nav-tab-label">Search</span>
        </button>

        <!-- CENTER FLOATING ACTION (+) -->
        <button @click="openComposerModal = true" class="bottom-center-action-btn" title="Kirim Menfess">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <button 
          @click="activeNav = 'aktivitas'" 
          :class="['bottom-nav-tab', activeNav === 'aktivitas' ? 'active' : '']"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span class="nav-tab-label">Aktivitas</span>
        </button>

        <button 
          @click="activeNav = 'akun'" 
          :class="['bottom-nav-tab', activeNav === 'akun' ? 'active' : '']"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="nav-tab-label">Akun</span>
        </button>
      </div>
    </nav>

    <!-- COMPOSER MODAL DIALOG POPUP -->
    <div v-if="openComposerModal" class="modal-backdrop" @click.self="openComposerModal = false">
      <div class="modal-dialog-content">
        <div class="modal-dialog-header">
          <h3>Kirim Menfess Baru</h3>
          <button @click="openComposerModal = false" class="btn-modal-close">✕</button>
        </div>

        <div class="modal-dialog-body">
          <div class="form-group mb-3">
            <label class="form-label">Pilih Base Tujuan:</label>
            <select v-model="selectedBase" class="select-base-input">
              <option v-for="b in sampleExploreBases" :key="b.handle" :value="b.handle">
                {{ b.name }} ({{ b.handle }})
              </option>
            </select>
          </div>

          <textarea 
            v-model="composerText" 
            class="modal-textarea mb-3" 
            placeholder="Tuliskan menfess atau curhatan anonim kamu..." 
            rows="4"
          ></textarea>

          <div class="flex justify-between items-center">
            <span class="text-xs text-muted">{{ composerText.length }}/280</span>
            <button @click="submitComposerFess" class="btn-modal-submit">
              Kirim Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useFessStore } from '../stores/fessStore'

const router = useRouter()
const authStore = useAuthStore()
const fessStore = useFessStore()

const activeNav = ref('home')
const homeTab = ref('forYou')
const searchTab = ref('base')
const aktivitasTab = ref('semua')
const selectedCategory = ref('Semua')

const selectedBase = ref('@basememes')
const composerText = ref('')
const openComposerModal = ref(false)
const searchQuery = ref('')
const followedHandles = ref(['@ustfess'])

// Sample posts
const feedPosts = ref([
  {
    id: 1,
    handle: '@klecomenfess',
    time: 'baru saja',
    tag: 'Cerita',
    content: 'buat yang kemarin main futsal, pakai jersey krem, dan posturnya tinggi... jujur senyum kamu manis banget kak, asli bikin deg-degan 🙈🫣✨',
    likes: 12,
    isLiked: false,
    avatarBg: '#0038FF',
    avatarText: 'KL'
  },
  {
    id: 2,
    handle: '@fessugm',
    time: 'baru saja',
    tag: 'Cerita',
    content: 'pogung?namamu paling unik cwemuu pasti bykk yaa!!??',
    likes: 8,
    isLiked: false,
    avatarBg: '#7000FF',
    avatarText: 'UGM'
  },
  {
    id: 3,
    handle: '@teramenfess',
    time: '2 mnt',
    tag: 'Cerita',
    content: 'min, kasi tau anak TF25 NIM 56, kamu manis bgt kaya gulali warna wari 😸😼',
    likes: 19,
    isLiked: false,
    avatarBg: '#FF0055',
    avatarText: 'TM'
  },
  {
    id: 4,
    handle: '@darmenfess',
    time: '3 mnt',
    tag: 'Tanya',
    content: 'from : maba mesin\nto : info yang bisa ngajarin matematika dong',
    likes: 5,
    isLiked: false,
    avatarBg: '#00B2FF',
    avatarText: 'DM'
  },
  {
    id: 5,
    handle: '@unermenfess',
    time: '4 mnt',
    tag: 'Cerita',
    content: 'semangat uas buat anak unair angkatan 23, perjalanan masih panjang tapi kita pasti bisa!',
    likes: 34,
    isLiked: false,
    avatarBg: '#00C853',
    avatarText: 'UM'
  }
])

// Sample bases
const sampleExploreBases = [
  { name: 'Unair Menfess', handle: '@unermenfess', initial: 'UM', color: '#0038FF', category: 'Kampus' },
  { name: 'Fess Veteran Jatim', handle: '@fessveteranjatim', initial: 'VJ', color: '#7000FF', category: 'Kampus' },
  { name: 'ITS Fess', handle: '@fess10nopember', initial: 'ITS', color: '#FF0055', category: 'Kampus' },
  { name: 'uny.fess', handle: '@unyfess', initial: 'UNY', color: '#00B2FF', category: 'Kampus' },
  { name: 'Menfess UNESA', handle: '@menfessunesa', initial: 'UN', color: '#00C853', category: 'Kampus' },
  { name: 'UGM Fess', handle: '@fessugm', initial: 'UGM', color: '#FF6D00', category: 'Kampus' },
  { name: 'UNS Menfess', handle: '@unsmenfess', initial: 'UNS', color: '#7000FF', category: 'Kampus' },
  { name: 'UTM Menfess', handle: '@utm_menfess', initial: 'UTM', color: '#0038FF', category: 'Kampus' },
  { name: 'UNEJMenfess', handle: '@unejmenfess', initial: 'UNJ', color: '#FF0055', category: 'Kampus' },
]

const filteredBases = computed(() => {
  return sampleExploreBases.filter(b => {
    const matchQuery = b.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                       b.handle.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = selectedCategory.value === 'Semua' || b.category === selectedCategory.value
    return matchQuery && matchCat
  })
})

function isFollowing(handle) {
  return followedHandles.value.includes(handle)
}

function toggleFollowBase(handle) {
  if (isFollowing(handle)) {
    followedHandles.value = followedHandles.value.filter(h => h !== handle)
  } else {
    followedHandles.value.push(handle)
  }
}

function toggleLikePost(id) {
  const p = feedPosts.value.find(item => item.id === id)
  if (p) {
    p.isLiked = !p.isLiked
    p.likes += p.isLiked ? 1 : -1
  }
}

function submitComposerFess() {
  if (!composerText.value.trim()) return
  feedPosts.value.unshift({
    id: Date.now(),
    handle: selectedBase.value,
    time: 'baru saja',
    tag: 'Cerita',
    content: composerText.value,
    likes: 0,
    isLiked: false,
    avatarBg: '#7000FF',
    avatarText: 'FESS'
  })
  composerText.value = ''
  openComposerModal.value = false
  alert('Menfess berhasil terkirim!')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

/* GLOBAL CONTAINER */
.user-app-layout {
  min-height: 100vh;
  background-color: #0B39FA; /* Royal Blue App Theme */
  color: #FFFFFF;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  padding-bottom: 84px; /* Space for fixed bottom navbar */
}

/* ==========================================================================
   TOP HEADER (MINIMAL LOGO & ACTION BAR)
   ========================================================================== */
.app-top-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: rgba(11, 57, 250, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
}

.top-header-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  background: #FFFFFF;
  color: #000000;
  padding: 6px 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 900;
  font-size: 14.5px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.logo-base { color: #000000; }
.logo-club {
  background: #BAFF00;
  color: #000000;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 900;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-admin-chip {
  color: #BAFF00;
  border: 1.5px solid #BAFF00;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  text-decoration: none;
}

.btn-header-kirim {
  background: #BAFF00;
  color: #000000;
  border: none;
  padding: 7px 18px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(186, 255, 0, 0.3);
}

/* ==========================================================================
   CENTERED MAIN CONTENT STAGE
   ========================================================================== */
.app-main-centered-stage {
  flex: 1;
  padding: 24px 16px 40px 16px;
  background: #08080C; /* Native App Dark Void */
  display: flex;
  justify-content: center;
}

.centered-content-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.stage-title {
  font-size: 24px;
  font-weight: 900;
  color: #FFFFFF;
}

/* ==========================================================================
   VIEW 1: HOME (FEED)
   ========================================================================== */
.stage-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.feed-sub-tabs {
  display: flex;
  gap: 8px;
}

.sub-tab-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13.5px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.sub-tab-btn.active {
  background: #7000FF;
  color: #FFFFFF;
}

.followed-base-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 14px;
  border-radius: 16px;
}

.fbb-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.fbb-chip {
  font-size: 11.5px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 12px;
  border-radius: 99px;
  color: #FFFFFF;
  white-space: nowrap;
}

.fbb-chip.active {
  background: #0B39FA;
  color: #FFFFFF;
}

.centered-feed-card {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-meta-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-circle-sm {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #FFF;
  font-weight: 900;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.handle-title {
  font-weight: 800;
  font-size: 14px;
}

.post-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 6px;
}

.tag-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
}

.tag-cerita {
  background: rgba(112, 0, 255, 0.2);
  color: #A855F7;
}

.tag-tanya {
  background: rgba(236, 72, 153, 0.2);
  color: #F472B6;
}

.post-body-content {
  font-size: 14.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 14px 0;
  white-space: pre-line;
}

.card-action-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.action-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.action-btn.liked { color: #EF4444; }
.quote-btn { font-size: 14px; font-weight: 900; }

/* ==========================================================================
   VIEW 2: SEARCH
   ========================================================================== */
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: 16px;
  font-size: 15px;
  opacity: 0.5;
}

.search-input-field {
  width: 100%;
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 13px 16px 13px 44px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-sub-label {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.segmented-tabs-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: #14141C;
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.segmented-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 9px;
  font-weight: 800;
  font-size: 13.5px;
  border-radius: 10px;
  cursor: pointer;
}

.segmented-btn.active {
  background: #7000FF;
  color: #FFFFFF;
}

.sub-pill-btn {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.sub-pill-btn.active {
  background: #0B39FA;
  color: #FFFFFF;
}

.centered-base-card {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.eb-avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #FFF;
  font-weight: 900;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eb-name-text { font-weight: 800; font-size: 14px; }
.eb-handle-text { font-size: 12px; color: rgba(255, 255, 255, 0.5); }

.btn-follow-outline {
  margin-left: auto;
  background: transparent;
  border: 1.5px solid #7000FF;
  color: #A855F7;
  padding: 6px 18px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 12.5px;
  cursor: pointer;
}

.btn-follow-outline.following {
  background: rgba(255, 255, 255, 0.1);
  border-color: transparent;
  color: rgba(255, 255, 255, 0.6);
}

/* ==========================================================================
   VIEW 3: AKTIVITAS
   ========================================================================== */
.empty-aktivitas-center {
  background: #14141C;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 70px 20px;
  text-align: center;
}

.empty-main-text { font-size: 15.5px; font-weight: 800; margin: 0 0 6px 0; }
.empty-sub-text { font-size: 12.5px; color: rgba(255, 255, 255, 0.45); margin: 0; }

/* ==========================================================================
   VIEW 4: AKUN
   ========================================================================== */
.user-info-banner-card {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.banner-avatar-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #0B39FA;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.banner-email-text { font-weight: 800; font-size: 15px; }
.banner-sub-note { font-size: 11.5px; color: rgba(255, 255, 255, 0.5); margin-top: 2px; }
.chevron-right { margin-left: auto; font-size: 18px; color: rgba(255, 255, 255, 0.4); }

.akun-menu-group {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.akun-menu-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  cursor: pointer;
}

.akun-menu-row:last-child { border-bottom: none; }
.row-icon { font-size: 16px; }
.row-label { font-weight: 700; }
.row-sub { margin-left: auto; font-size: 12px; color: rgba(255, 255, 255, 0.45); }

.segmented-theme-pills {
  margin-left: auto;
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px;
  border-radius: 10px;
}

.stp-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  cursor: pointer;
}

.stp-btn.active { background: #7000FF; color: #FFFFFF; }
.logout-row { background: transparent; border: none; width: 100%; text-align: left; }
.text-red { color: #EF4444 !important; }

/* ==========================================================================
   FIXED BOTTOM NAVIGATION BAR (WITH ICONS - NATIVE APP EXPERIENCE)
   ========================================================================== */
.app-bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(14, 14, 20, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px 12px 12px 12px;
}

.bottom-nav-inner {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.bottom-nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  flex: 1;
}

.bottom-nav-tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.bottom-nav-tab.active {
  color: #BAFF00; /* Neon Lime Active Indicator */
}

.bottom-nav-tab.active .nav-tab-icon {
  transform: translateY(-2px);
  color: #BAFF00;
}

.nav-tab-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.bottom-center-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7000FF 0%, #0B39FA 100%);
  color: #FFFFFF;
  border: 3px solid #08080C;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -16px 8px 0 8px;
  box-shadow: 0 8px 20px rgba(112, 0, 255, 0.5);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.bottom-center-action-btn:hover {
  transform: scale(1.1);
}

/* MODAL DIALOG */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-dialog-content {
  background: #14141C;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 24px 20px;
  width: 100%;
  max-width: 460px;
}

.modal-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-dialog-header h3 { margin: 0; font-size: 17px; font-weight: 800; }
.btn-modal-close { background: transparent; border: none; color: rgba(255, 255, 255, 0.5); font-size: 18px; cursor: pointer; }

.select-base-input, .modal-textarea {
  width: 100%;
  background: #0E0E14;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFF;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.btn-modal-submit {
  background: #BAFF00;
  color: #000000;
  border: none;
  padding: 10px 24px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
}

.text-center { text-align: center; }
.justify-center { justify-content: center; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.ml-auto { margin-left: auto; }

/* MOBILE NATIVE APP OPTIMIZATIONS */
@media (max-width: 640px) {
  .user-app-layout {
    padding-bottom: 78px;
  }
  .app-main-centered-stage {
    padding: 16px 12px 32px 12px;
  }
  .stage-title {
    font-size: 20px;
  }
  .speech-bubble-logo {
    padding: 5px 12px;
    font-size: 13px;
  }
  .btn-header-kirim {
    padding: 6px 14px;
    font-size: 12px;
  }
}
</style>
