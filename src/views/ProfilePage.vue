<template>
  <div class="base-club-profile">
    <!-- Navigation Bar -->
    <nav class="profile-nav">
      <div class="container flex items-center justify-between flex-wrap gap-3">
        <router-link to="/" class="brand-logo">
          <div class="speech-bubble-logo">
            <span class="logo-base">BASE</span>
            <span class="logo-club">CLUB</span>
          </div>
        </router-link>

        <!-- Center Nav Capsule -->
        <div class="nav-pill-container">
          <router-link to="/feed" class="nav-pill">Feed</router-link>
          <router-link to="/profile" class="nav-pill active-pill">Profil Saya</router-link>
          <router-link v-if="authStore.isBaseAdmin || authStore.isSuperAdmin" to="/base-admin" class="nav-pill">Base Admin</router-link>
          <router-link v-if="authStore.isSuperAdmin" to="/super-admin" class="nav-pill">Super Admin</router-link>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2">
          <!-- Role Selector Dropdown -->
          <div class="role-selector-wrapper flex items-center bg-black/30 border border-white/20 rounded-full px-2 py-1">
            <span class="text-xs text-white/70 mr-1 hidden sm:inline">Peran:</span>
            <select 
              :value="authStore.user?.role || 'User'" 
              @change="e => authStore.switchRole(e.target.value)"
              class="role-select-dropdown"
            >
              <option value="User">User / Anon</option>
              <option value="Base Admin">Base Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <button @click="handleLogout" class="btn-logout-pill text-xs">
            Keluar
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Header Cover & Profile Avatar Stage -->
    <div class="profile-cover-section">
      <!-- High-res Cover Art -->
      <div class="cover-art-container">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop" alt="Mountain Cover" class="cover-bg-image" />
        <div class="cover-gradient-overlay"></div>
        <div class="cover-hud-badge">
          <span class="hud-pill font-bold">VERIFIED BASE CREATOR</span>
        </div>
      </div>

      <!-- Centered Avatar & Profile Summary -->
      <div class="profile-header-card container">
        <div class="avatar-center-wrapper">
          <img :src="user.avatar" :alt="user.username" class="main-avatar-img" />
          <span class="status-online-dot" title="Online now"></span>
        </div>

        <div class="user-identity-block">
          <h1 class="user-display-name">
            {{ user.username }}
            <span class="verified-check" title="Verified Creator">✓</span>
          </h1>
          <p class="user-handle-location">
            <span class="text-lime font-bold">{{ user.handle }}</span> • {{ locationText }}
          </p>
          <p class="user-bio-text">{{ user.bio }}</p>

          <!-- Quick Actions Bar -->
          <div class="header-action-buttons flex justify-center gap-2 sm:gap-3 mt-4 flex-wrap">
            <button class="btn-lime-pill">
              Follow Creator
            </button>
            <button class="btn-blue-pill">
              Kirim Direct Fess
            </button>
            <button class="btn-gray-pill">
              Pengaturan Akun
            </button>
          </div>
        </div>

        <!-- Profile Tab Navigation Bar (Horizontal Swipeable on Mobile) -->
        <div class="profile-nav-tabs flex items-center justify-start sm:justify-center gap-2 mt-6 overflow-x-auto no-scrollbar py-1">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            @click="activeTab = tab"
            :class="['tab-pill-btn', activeTab === tab ? 'active-tab' : '']"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Profile Content Body (3-Column Layout like Reference Image) -->
    <div class="profile-body-content container py-8">
      
      <!-- Stats Strip Bar -->
      <div class="profile-stats-strip mb-8">
        <div class="stat-box">
          <span class="stat-num text-blue">{{ userFesses.length }}</span>
          <span class="stat-label">Confessions Sent</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-num text-lime">{{ totalUpvotes }}</span>
          <span class="stat-label">Total Upvotes</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-num text-blue">LVL {{ user.level || 12 }}</span>
          <span class="stat-label">Creator Rank</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-num text-lime">{{ user.badges?.length || 8 }}</span>
          <span class="stat-label">Badges Unlocked</span>
        </div>
      </div>

      <!-- 3 Columns Grid -->
      <div class="profile-main-grid">
        
        <!-- LEFT COLUMN: Profile Intro, Badges, Spotify Playlist, Twitter Feed -->
        <div class="grid-column left-column flex flex-col gap-6">
          
          <!-- Profile Intro Card -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4">
              <h3>Profile Intro</h3>
            </div>
            
            <div class="intro-group mb-3">
              <span class="intro-label">About Me:</span>
              <p class="intro-val">
                Hi, I'm {{ user.username }}. Digital Designer & Base Creator for {{ user.handle }}. Building next-gen anonymous social engines!
              </p>
            </div>

            <div class="intro-group mb-3">
              <span class="intro-label">Favorite TV Shows:</span>
              <p class="intro-val">Breaking Bad, RedDwarf, People of Earth, Silicon Valley, Cyberpunk Edgerunners.</p>
            </div>

            <div class="intro-group mb-3">
              <span class="intro-label">Favorite Music Bands:</span>
              <p class="intro-val">System of a Revenge, Linkin Park, Daft Punk, The Prodigy, Gorillaz.</p>
            </div>

            <div class="intro-group">
              <span class="intro-label">Other Social Networks:</span>
              <div class="flex flex-col gap-2 mt-2">
                <a href="#" class="social-btn facebook-btn">Facebook / JamesDev</a>
                <a href="#" class="social-btn twitter-btn">Twitter / @{{ user.handle.replace('@','') }}</a>
                <a href="#" class="social-btn github-btn">GitHub / baseclub-dev</a>
              </div>
            </div>
          </div>

          <!-- Badges Card -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4 flex justify-between items-center">
              <h3>James's Badges</h3>
              <span class="badge-count">{{ user.badges?.length || 10 }} Total</span>
            </div>
            
            <div class="badges-icon-grid">
              <div v-for="(b, idx) in badgeList" :key="idx" class="badge-icon-item" :title="b.title">
                <span class="badge-emoji">{{ b.icon }}</span>
              </div>
            </div>
          </div>

          <!-- Spotify Playlist Card -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4 flex justify-between items-center">
              <h3>My Spotify Playlist</h3>
              <span class="text-xs text-muted">🎵 5 Tracks</span>
            </div>

            <div class="spotify-track-list">
              <div v-for="track in spotifyTracks" :key="track.id" class="spotify-item">
                <button class="play-track-btn" @click="playingTrack = track.id">
                  {{ playingTrack === track.id ? '⏸' : '▶' }}
                </button>
                <div class="track-info flex-1">
                  <div class="track-title">{{ track.title }}</div>
                  <div class="track-artist">{{ track.artist }}</div>
                </div>
                <span class="track-time">{{ track.time }}</span>
              </div>
            </div>
          </div>

          <!-- Twitter Feed Card -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4">
              <h3>Twitter Cross-Post Feed</h3>
            </div>
            <div class="twitter-tweet-box">
              <div class="flex items-center gap-2 mb-2">
                <span class="twitter-icon">🐦</span>
                <span class="font-bold text-xs">@{{ user.handle.replace('@','') }}</span>
                <span class="text-xs text-muted">2 hours ago</span>
              </div>
              <p class="tweet-text">
                Testing the new Base Club Anon Engine with NestJS + Canvas renderer 🚀 Auto-crosspost works like magic!
              </p>
            </div>
          </div>
        </div>

        <!-- MIDDLE COLUMN: Post Composer & Main Timeline Feed -->
        <div class="grid-column center-column flex flex-col gap-6">
          
          <!-- Post Composer Card -->
          <div class="white-card p-5">
            <div class="flex items-center gap-3 mb-3">
              <img :src="user.avatar" class="mini-composer-avatar" />
              <textarea 
                v-model="newPostContent" 
                class="composer-textarea" 
                placeholder="Share a confession or post status update to #BASECLUB..."
                rows="2"
              ></textarea>
            </div>
            <div class="flex justify-between items-center pt-3 border-t">
              <div class="flex gap-2">
                <button class="btn-attach">📷 Photo</button>
                <button class="btn-attach">🎵 Music</button>
                <button class="btn-attach">⚡ Tag Base</button>
              </div>
              <button @click="submitPost" class="btn-lime-pill" style="padding: 8px 20px; font-size: 12px">
                Post Confess 🚀
              </button>
            </div>
          </div>

          <!-- Main Timeline Post 1 (Text Post) -->
          <div class="white-card p-5 timeline-post-card">
            <div class="post-header flex justify-between items-center mb-3">
              <div class="flex items-center gap-3">
                <img :src="user.avatar" class="post-user-avatar" />
                <div>
                  <div class="post-author-name">{{ user.username }}</div>
                  <div class="post-timestamp">15 hours ago</div>
                </div>
              </div>
              <span class="badge-blue-sm">USER CONFESS</span>
            </div>

            <p class="post-content-text mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.
            </p>

            <div class="post-footer flex justify-between items-center pt-3 border-t">
              <div class="flex items-center gap-4 text-xs font-bold text-muted">
                <button @click="likesCount++" class="like-btn text-lime">
                  ▲ {{ likesCount }} Likes
                </button>
                <span>💬 17 Comments</span>
                <span>🔄 24 Shares</span>
              </div>
            </div>
          </div>

          <!-- Main Timeline Post 2 (Music Player Post) -->
          <div class="white-card p-5 timeline-post-card">
            <div class="post-header flex justify-between items-center mb-3">
              <div class="flex items-center gap-3">
                <img :src="user.avatar" class="post-user-avatar" />
                <div>
                  <div class="post-author-name">{{ user.username }} <span class="text-xs text-muted">shared a link</span></div>
                  <div class="post-timestamp">1 hour ago</div>
                </div>
              </div>
            </div>

            <p class="post-content-text mb-3">
              If someone missed it, check out the new song by System of a Revenge! I think they are going back to their roots...
            </p>

            <!-- Music Preview Box -->
            <div class="music-preview-box flex items-center gap-4 p-4 rounded-xl mb-4">
              <div class="music-album-art relative">
                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop" class="album-img" />
                <button class="album-play-overlay">▶</button>
              </div>
              <div class="flex-1">
                <h4 class="music-track-name">System of a Revenge - Nothing Else Matters (LIVE)</h4>
                <p class="music-track-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
                <span class="text-xs text-muted">youtube.com</span>
              </div>
            </div>

            <div class="post-footer flex justify-between items-center pt-3 border-t">
              <div class="flex items-center gap-4 text-xs font-bold text-muted">
                <span class="text-lime">▲ 113 Likes</span>
                <span>💬 3 Comments</span>
                <span>🔄 16 Shares</span>
              </div>
            </div>
          </div>

          <!-- Main Timeline Post 3 (Photo Post with Model Image) -->
          <div class="white-card p-5 timeline-post-card">
            <div class="post-header flex justify-between items-center mb-3">
              <div class="flex items-center gap-3">
                <img :src="user.avatar" class="post-user-avatar" />
                <div>
                  <div class="post-author-name">{{ user.username }} <span class="text-xs text-muted">shared Diana Jameson's photo</span></div>
                  <div class="post-timestamp">7 hours ago</div>
                </div>
              </div>
            </div>

            <p class="post-content-text mb-3">
              Hi! Everyone should check out these amazing photographs that my friend shot the past week. Here's one of them... Leave a kind comment!
            </p>

            <div class="full-photo-container mb-4">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" alt="Model Portrait" class="timeline-full-photo" />
            </div>

            <div class="post-footer flex justify-between items-center pt-3 border-t">
              <div class="flex items-center gap-4 text-xs font-bold text-muted">
                <span class="text-lime">▲ 158 Likes</span>
                <span>💬 8 Comments</span>
                <span>🔄 15 Shares</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Last Photos, Blog Posts, Friends, Favorite Pages, Interactive Poll -->
        <div class="grid-column right-column flex flex-col gap-6">
          
          <!-- Last Photos Gallery (3x3 Grid) -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4 flex justify-between items-center">
              <h3>Last Photos</h3>
              <span class="text-xs text-muted">View All</span>
            </div>

            <div class="photos-grid-3x3">
              <img v-for="(img, i) in galleryPhotos" :key="i" :src="img" class="gallery-thumb" />
            </div>
          </div>

          <!-- Blog Posts List -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4">
              <h3>Blog Posts</h3>
            </div>

            <div class="blog-item mb-3">
              <h4 class="blog-title">My Perfect Vacations in South America and Europe</h4>
              <p class="blog-excerpt">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...</p>
              <span class="blog-time">7 hours ago</span>
            </div>

            <div class="blog-item">
              <h4 class="blog-title">The Big Experience of Travelling Alone</h4>
              <p class="blog-excerpt">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...</p>
              <span class="blog-time">March 18th, 2026</span>
            </div>
          </div>

          <!-- Friends Grid (85 Members) -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4 flex justify-between items-center">
              <h3>Friends (85)</h3>
              <span class="text-xs text-lime font-bold">See All →</span>
            </div>

            <div class="friends-avatar-grid">
              <img v-for="(av, i) in friendsAvatars" :key="i" :src="av" class="friend-thumb-avatar" />
            </div>
          </div>

          <!-- Favorite Pages / Bases -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4">
              <h3>Favorite Pages</h3>
            </div>

            <div class="favorite-base-list flex flex-col gap-3">
              <div v-for="page in favoriteBases" :key="page.name" class="fav-base-item flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="fav-icon-box">{{ page.icon }}</div>
                  <div>
                    <div class="fav-name">{{ page.name }}</div>
                    <div class="fav-cat">{{ page.cat }}</div>
                  </div>
                </div>
                <span class="star-icon">⭐</span>
              </div>
            </div>
          </div>

          <!-- Interactive Poll Card (Reference Image Poll) -->
          <div class="white-card p-5">
            <div class="card-section-title mb-4">
              <h3>James's Poll</h3>
            </div>

            <p class="poll-question mb-4">
              If you had to choose, which actor do you prefer as the new Dark Knight?
            </p>

            <div class="poll-options-list flex flex-col gap-3">
              <div 
                v-for="opt in pollOptions" 
                :key="opt.id"
                @click="selectedPoll = opt.id"
                :class="['poll-option-box', selectedPoll === opt.id ? 'active-poll-box' : '']"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="poll-name">{{ opt.name }}</span>
                  <span class="poll-percent font-bold text-lime">{{ opt.percent }}%</span>
                </div>
                <div class="poll-progress-bar">
                  <div class="poll-progress-fill" :style="{ width: opt.percent + '%' }"></div>
                </div>
              </div>
            </div>

            <button class="btn-lime-pill w-full mt-4 justify-center text-xs">
              Vote Now! 🗳️
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

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const user = computed(() => authStore.user || {})
const userFesses = computed(() => fessStore.fesses)
const totalUpvotes = computed(() => userFesses.value.reduce((acc, f) => acc + f.upvotes, 0))

const activeTab = ref('Timeline')
const tabs = ['Timeline', 'About', 'Friends', 'Photos', 'Videos', 'Badges']

const likesCount = ref(84)
const newPostContent = ref('')
const playingTrack = ref(null)
const selectedPoll = ref(1)

const activeRoleLabel = computed(() => {
  if (authStore.isSuperAdmin) return '⚡ SUPER ADMIN'
  if (authStore.isBaseAdmin) return '🛡️ BASE ADMIN'
  return '👤 USER / ANON'
})

const roleBadgeClass = computed(() => {
  if (authStore.isSuperAdmin) return 'badge-super-admin'
  if (authStore.isBaseAdmin) return 'badge-base-admin'
  return 'badge-user-anon'
})

const locationText = computed(() => {
  if (authStore.isSuperAdmin) return 'System Control HQ, Cyber Server'
  if (authStore.isBaseAdmin) return 'Base Moderator Hub, Jakarta'
  return 'San Francisco, CA'
})

const badgeList = [
  { icon: '⚡', title: 'Speed Confessor' },
  { icon: '🛡️', title: 'Base Admin' },
  { icon: '🏆', title: 'Top 1% Creator' },
  { icon: '🔥', title: '100 Day Streak' },
  { icon: '💎', title: 'Diamond Member' },
  { icon: '🎮', title: 'Gamer Pro' },
  { icon: '🚀', title: 'Meta Cross-Poster' },
  { icon: '🎨', title: 'Canvas Master' },
  { icon: '🌟', title: 'Community Hero' },
  { icon: '👑', title: 'Super Admin' }
]

const spotifyTracks = [
  { id: 1, title: 'The Fast Starts High', artist: 'System of a Revenge', time: '3:22' },
  { id: 2, title: 'The Pretender', artist: 'Foo Fighters', time: '4:15' },
  { id: 3, title: 'Blood Brothers', artist: 'Iron Maiden', time: '5:05' },
  { id: 4, title: 'Seven Nation Army', artist: 'The White Stripes', time: '4:17' },
  { id: 5, title: 'Killer Queen', artist: 'Queen', time: '3:40' }
]

const galleryPhotos = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
]

const friendsAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
]

const favoriteBases = [
  { icon: '🍸', name: 'The Marina Bar', cat: 'Restaurant / Bar' },
  { icon: '🎸', name: 'Taprooms Rock', cat: 'Rock Band' },
  { icon: '💻', name: 'Pixel Digital Design', cat: 'Company' },
  { icon: '🍕', name: 'Play Bar & Grill', cat: 'Restaurant / Bar' }
]

const pollOptions = [
  { id: 1, name: 'Thomas Bale', percent: 62 },
  { id: 2, name: 'Ben Pattinson', percent: 37 },
  { id: 3, name: 'Michael Keaton', percent: 71 }
]

function submitPost() {
  if (!newPostContent.value.trim()) return
  fessStore.addFess({
    baseHandle: '@baseclub',
    content: newPostContent.value,
    senderName: user.value.username
  })
  newPostContent.value = ''
}
</script>

<style scoped>
/* BASE CLUB PROFILE VIEW STYLES */
.base-club-profile {
  min-height: 100vh;
  background-color: #F4F5F8;
  color: #111827;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  padding-bottom: 60px;
}

/* NAVBAR */
.profile-nav {
  background-color: #0038FF;
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 56, 255, 0.2);
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  background: #ffffff;
  color: #000000;
  padding: 5px 12px;
  border-radius: 14px 14px 14px 2px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 900;
  font-size: 14px;
}

.logo-club {
  background: #9EFF00;
  color: #000;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 12px;
}

.nav-pill-container {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  padding: 4px 6px;
  display: flex;
  gap: 4px;
}

.nav-pill {
  color: #ffffff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  transition: all 0.2s;
  opacity: 0.85;
}

.nav-pill.active-pill, .nav-pill:hover {
  background: rgba(255, 255, 255, 0.25);
  opacity: 1;
}

.role-badge-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 99px;
}

.badge-super-admin {
  background: #FF007A;
  color: #fff;
}

.badge-base-admin {
  background: #9EFF00;
  color: #000;
}

.badge-user-anon {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
}

.btn-outline-white {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.6);
  color: #fff;
  padding: 6px 14px;
  border-radius: 99px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-outline-white:hover {
  background: #fff;
  color: #0038FF;
}

.role-select-dropdown {
  background: transparent;
  color: #9EFF00;
  border: none;
  font-size: 11px;
  font-weight: 800;
  outline: none;
  cursor: pointer;
}

.role-select-dropdown option {
  background: #0B0D14;
  color: #ffffff;
}

.btn-logout-pill {
  background: rgba(255, 0, 122, 0.2);
  border: 1px solid #FF007A;
  color: #FF77BC;
  padding: 6px 14px;
  border-radius: 99px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout-pill:hover {
  background: #FF007A;
  color: #ffffff;
}

/* COVER SECTION */
.profile-cover-section {
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.cover-art-container {
  height: 280px;
  position: relative;
  overflow: hidden;
}

.cover-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0, 56, 255, 0.4) 100%);
}

.cover-hud-badge {
  position: absolute;
  top: 16px;
  right: 24px;
}

.hud-pill {
  background: #9EFF00;
  color: #000;
  font-size: 11px;
  padding: 6px 14px;
  border-radius: 99px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* HEADER CARD & CENTER AVATAR */
.profile-header-card {
  position: relative;
  text-align: center;
  padding-bottom: 20px;
}

.avatar-center-wrapper {
  position: relative;
  display: inline-block;
  margin-top: -70px;
}

.main-avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.status-online-dot {
  width: 20px;
  height: 20px;
  background: #10B981;
  border: 4px solid #ffffff;
  border-radius: 50%;
  position: absolute;
  bottom: 8px;
  right: 12px;
}

.user-display-name {
  font-size: 28px;
  font-weight: 900;
  color: #000000;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.verified-check {
  background: #0038FF;
  color: #fff;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.user-handle-location {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 6px;
}

.user-bio-text {
  font-size: 14px;
  color: #374151;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.5;
}

/* ACTION BUTTONS */
.btn-lime-pill {
  background: #9EFF00;
  color: #000000;
  border: none;
  padding: 10px 22px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 4px 12px rgba(158, 255, 0, 0.3);
}

.btn-lime-pill:hover {
  transform: scale(1.04);
}

.btn-blue-pill {
  background: #0038FF;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 56, 255, 0.3);
}

.btn-blue-pill:hover {
  transform: scale(1.04);
}

.btn-gray-pill {
  background: #E5E7EB;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

/* TAB NAVIGATION */
.tab-pill-btn {
  background: transparent;
  border: none;
  color: #6B7280;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 20px;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-pill-btn.active-tab, .tab-pill-btn:hover {
  background: #0038FF;
  color: #ffffff;
}

/* STATS STRIP BAR */
.profile-stats-strip {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #E5E7EB;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-num.text-blue { color: #0038FF; }
.stat-num.text-lime { color: #80D400; }

.stat-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: #E5E7EB;
}

/* 3 COLUMNS GRID */
.profile-main-grid {
  display: grid;
  grid-template-columns: 290px 1fr 290px;
  gap: 24px;
}

@media (max-width: 1100px) {
  .profile-main-grid {
    grid-template-columns: 1fr;
  }
}

/* WHITE CARD REUSABLE STYLE */
.white-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.card-section-title h3 {
  font-size: 16px;
  font-weight: 800;
  color: #000000;
  margin: 0;
}

/* INTRO */
.intro-label {
  font-size: 12px;
  font-weight: 800;
  color: #000;
  display: block;
  margin-bottom: 2px;
}

.intro-val {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.5;
}

.social-btn {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

.facebook-btn { background: #EBF5FF; color: #1D4ED8; }
.twitter-btn { background: #F0FDF4; color: #15803D; }
.github-btn { background: #F3F4F6; color: #111827; }

/* BADGES */
.badges-icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.badge-icon-item {
  width: 44px;
  height: 44px;
  background: #F4F5F8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid #E5E7EB;
  transition: transform 0.15s;
}

.badge-icon-item:hover {
  transform: scale(1.1);
  border-color: #9EFF00;
}

/* SPOTIFY */
.spotify-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
}

.play-track-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #0038FF;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 10px;
}

.track-title { font-size: 12px; font-weight: 700; color: #111; }
.track-artist { font-size: 10px; color: #6B7280; }
.track-time { font-size: 11px; color: #9CA3AF; }

/* COMPOSER */
.mini-composer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.composer-textarea {
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  outline: none;
  resize: none;
  background: #F9FAFB;
}

.composer-textarea:focus {
  border-color: #0038FF;
  background: #fff;
}

.btn-attach {
  background: #F3F4F8;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* TIMELINE POSTS */
.post-user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author-name { font-size: 14px; font-weight: 800; color: #000; }
.post-timestamp { font-size: 11px; color: #6B7280; }

.badge-blue-sm {
  background: #0038FF;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.post-content-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

/* MUSIC PREVIEW BOX */
.music-preview-box {
  background: #0038FF;
  color: #ffffff;
}

.music-album-art {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
}

.album-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.music-track-name {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 4px;
}

.music-track-desc {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.4;
  margin-bottom: 4px;
}

.full-photo-container {
  border-radius: 16px;
  overflow: hidden;
  max-height: 400px;
}

.timeline-full-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.like-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.text-lime { color: #0038FF; }

/* RIGHT COLUMN WIDGETS */
.photos-grid-3x3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery-thumb {
  width: 100%;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
}

.blog-title {
  font-size: 13px;
  font-weight: 800;
  color: #111;
  margin-bottom: 4px;
}

.blog-excerpt {
  font-size: 11px;
  color: #6B7280;
  line-height: 1.4;
  margin-bottom: 2px;
}

.blog-time {
  font-size: 10px;
  color: #9CA3AF;
}

.friends-avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.friend-thumb-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #E5E7EB;
  object-fit: cover;
}

.fav-icon-box {
  width: 36px;
  height: 36px;
  background: #F4F5F8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.fav-name { font-size: 12px; font-weight: 800; color: #000; }
.fav-cat { font-size: 10px; color: #6B7280; }

.poll-question {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  line-height: 1.5;
}

.poll-option-box {
  background: #F4F5F8;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.poll-option-box.active-poll-box {
  border-color: #0038FF;
  background: #EBF0FF;
}

.poll-name { font-size: 12px; font-weight: 700; color: #111; }

.poll-progress-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 4px;
}

.poll-progress-fill {
  height: 100%;
  background: #0038FF;
  border-radius: 99px;
}

/* MOBILE RESPONSIVE MEDIA QUERIES FOR PROFILE PAGE */
@media (max-width: 768px) {
  .desktop-nav-only {
    display: none !important;
  }

  .cover-art-container {
    height: 160px;
  }

  .main-avatar-img {
    width: 80px;
    height: 80px;
  }

  .avatar-center-wrapper {
    margin-top: -40px;
  }

  .user-display-name {
    font-size: 20px;
  }

  .profile-stats-strip {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
  }

  .stat-divider {
    display: none;
  }

  .stat-num {
    font-size: 20px;
  }

  .stat-label {
    font-size: 9px;
  }

  .profile-main-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tab-pill-btn {
    padding: 6px 14px;
    font-size: 12px;
    flex-shrink: 0;
  }

  .header-action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-lime-pill, .btn-blue-pill, .btn-gray-pill {
    width: 100%;
    text-align: center;
    padding: 10px 16px;
  }

  .badges-icon-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
