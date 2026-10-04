<template>
  <nav class="app-bottom-navbar">
    <div class="bottom-nav-inner">
      <!-- Home -->
      <button @click="$emit('navChange', 'home')" :class="['bottom-nav-tab', active === 'home' ? 'active' : '']">
        <div class="nav-tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="nav-tab-label">Home</span>
      </button>

      <!-- Search -->
      <button @click="$emit('navChange', 'search')" :class="['bottom-nav-tab', active === 'search' ? 'active' : '']">
        <div class="nav-tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <span class="nav-tab-label">Search</span>
      </button>

      <!-- Center FAB -->
      <button @click="$emit('openCompose')" class="bottom-center-fab" title="Kirim Menfess">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <!-- Aktivitas -->
      <button @click="$emit('navChange', 'aktivitas')" :class="['bottom-nav-tab', active === 'aktivitas' ? 'active' : '']">
        <div class="nav-tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <span class="nav-tab-label">Aktivitas</span>
      </button>

      <!-- Akun -->
      <button @click="$emit('navChange', 'akun')" :class="['bottom-nav-tab', active === 'akun' ? 'active' : '']">
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
</template>

<script setup>
defineProps({ active: { type: String, default: 'home' } })
defineEmits(['navChange', 'openCompose'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');

.app-bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(14, 14, 20, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.12);
  padding: 8px 12px 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
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
  gap: 3px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  transition: all 0.2s;
  flex: 1;
}

.bottom-nav-tab:hover { color: rgba(255,255,255,0.85); }
.bottom-nav-tab.active { color: #BAFF00; }
.bottom-nav-tab.active .nav-tab-icon { transform: translateY(-2px); }

.nav-tab-label { font-size: 11px; font-weight: 800; letter-spacing: 0.2px; }

.bottom-center-fab {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7000FF 0%, #0B39FA 100%);
  color: #fff;
  border: 3px solid #08080C;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -18px 8px 0;
  box-shadow: 0 8px 20px rgba(112,0,255,0.5);
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.bottom-center-fab:hover { transform: scale(1.1); }
</style>
