<template>
  <div class="base-club-super">
    <!-- Navbar Header -->
    <nav class="super-nav">
      <div class="container flex items-center justify-between flex-wrap gap-3">
        <router-link to="/" class="brand-logo">
          <div class="speech-bubble-logo">
            <span class="logo-base">BASE</span>
            <span class="logo-club">CLUB</span>
          </div>
        </router-link>

        <div class="nav-pill-container">
          <router-link to="/feed" class="nav-pill">Feed</router-link>
          <router-link to="/profile" class="nav-pill">Profil Saya</router-link>
          <router-link to="/base-admin" class="nav-pill">Base Admin</router-link>
          <router-link to="/super-admin" class="nav-pill active-pill">Super Admin</router-link>
        </div>

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

    <!-- Main Content -->
    <div class="container py-8">
      <div class="super-header-card mb-8">
        <div class="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 class="super-page-title">Super Admin Global System Control</h1>
            <p class="text-xs text-muted">Monitor global system SLA, rate limiters, auto-moderation, bad actors & Redis cache</p>
          </div>
          <button class="btn-pink-pill">
            ⚡ System Health OK
          </button>
        </div>
      </div>

      <!-- Gauges Strip -->
      <div class="stats-grid-4 mb-8">
        <div class="white-card p-5 stat-card">
          <span class="stat-title">Global Confessions Sent</span>
          <span class="stat-number text-blue">142,890</span>
        </div>
        <div class="white-card p-5 stat-card">
          <span class="stat-title">Active Auto-Bases</span>
          <span class="stat-number text-lime">84 Bases</span>
        </div>
        <div class="white-card p-5 stat-card">
          <span class="stat-title">System Load / CPU</span>
          <span class="stat-number text-pink">12.4% SLA</span>
        </div>
        <div class="white-card p-5 stat-card">
          <span class="stat-title">Banned Bad Actors</span>
          <span class="stat-number text-black">14 Banned</span>
        </div>
      </div>

      <!-- System Controls Grid -->
      <div class="grid-2-col">
        <!-- Global Rate Limiter & Security Settings -->
        <div class="white-card p-6">
          <div class="card-section-title mb-4">
            <h3>⚡ Global Security & Rate Limiting</h3>
          </div>

          <div class="flex flex-col gap-4">
            <div class="control-row flex justify-between items-center">
              <div>
                <div class="font-bold text-xs text-black">Rate Limit (Per IP)</div>
                <div class="text-xs text-muted">Maksimal fess dikirim per menit</div>
              </div>
              <input type="number" value="5" class="small-num-input" />
            </div>

            <div class="control-row flex justify-between items-center">
              <div>
                <div class="font-bold text-xs text-black">Auto-Moderation AI Filter</div>
                <div class="text-xs text-muted">Otomatis filter keyword SARA & Spam</div>
              </div>
              <span class="status-badge-active">ACTIVE</span>
            </div>

            <div class="control-row flex justify-between items-center">
              <div>
                <div class="font-bold text-xs text-black">Canvas Render Worker</div>
                <div class="text-xs text-muted">Puppeteer / Canvas background job</div>
              </div>
              <span class="status-badge-active">RUNNING</span>
            </div>
          </div>
        </div>

        <!-- System Overlord Log Stream -->
        <div class="white-card p-6">
          <div class="card-section-title mb-4 flex justify-between items-center">
            <h3>📡 Real-time Engine Logs</h3>
            <span class="text-xs text-muted font-mono">LIVE SLA</span>
          </div>

          <div class="log-stream-box p-4 rounded-xl font-mono text-xs">
            <div class="log-line text-lime">[10:48:12] RATE_LIMITER: IP 192.168.1.31 clean (0/5 req)</div>
            <div class="log-line text-blue">[10:48:15] CANVAS_WORKER: Fess #142890 rendered in 12ms</div>
            <div class="log-line text-muted">[10:48:18] AUTO_BASE: @codememfess routed 1 new confession</div>
            <div class="log-line text-lime">[10:48:22] REDIS_CACHE: Memory usage 42.1MB / 512MB</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.base-club-super {
  min-height: 100vh;
  background-color: #F4F5F8;
  color: #111827;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  padding-bottom: 60px;
}

/* NAVBAR */
.super-nav {
  background-color: #0038FF;
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 56, 255, 0.2);
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
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout-pill:hover {
  background: #FF007A;
  color: #ffffff;
}

.brand-logo { text-decoration: none; }

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

.badge-pink-pill {
  background: #FF007A;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 5px 12px;
  border-radius: 99px;
}

.white-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.super-header-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 32px;
  border: 1px solid #E5E7EB;
}

.super-page-title {
  font-size: 24px;
  font-weight: 900;
  color: #000;
  margin-bottom: 2px;
}

.btn-pink-pill {
  background: #FF007A;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 99px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
}

.stats-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .stats-grid-4 { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-title { font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px; }
.stat-number { font-size: 26px; font-weight: 900; }
.text-blue { color: #0038FF; }
.text-lime { color: #80D400; }
.text-pink { color: #FF007A; }

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .grid-2-col { grid-template-columns: 1fr; }
}

.control-row {
  padding: 12px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.small-num-input {
  width: 60px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #D1D5DB;
  font-weight: 800;
  text-align: center;
}

.status-badge-active {
  background: #DCFCE7;
  color: #166534;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 99px;
}

.log-stream-box {
  background: #0B0D14;
  color: #fff;
  height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-line { font-size: 11px; }

@media (max-width: 768px) {
  .desktop-nav-only {
    display: none !important;
  }

  .super-header-card {
    padding: 16px;
    border-radius: 16px;
  }

  .super-page-title {
    font-size: 18px;
  }

  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-number {
    font-size: 22px;
  }

  .log-stream-box {
    font-size: 10px;
    word-break: break-all;
  }
}
</style>
