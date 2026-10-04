<template>
  <header class="app-top-header">
    <div class="top-header-inner">
      <router-link to="/" class="brand-logo">
        <div class="speech-bubble-logo">
          <span class="logo-icon">💬</span>
          <span class="logo-base">BASE</span>
          <span class="logo-club">CONFESS</span>
        </div>
      </router-link>

      <div class="header-right-actions">
        <router-link
          v-if="authStore.isBaseAdmin || authStore.isSuperAdmin"
          to="/base-admin"
          class="btn-admin-chip"
        >
          Admin Portal
        </router-link>
        <button @click="$emit('openCompose')" class="btn-header-kirim">
          + Kirim Fess
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'

defineEmits(['openCompose'])
const authStore = useAuthStore()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');

.app-top-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: rgba(11, 57, 250, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.top-header-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo { text-decoration: none; }

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

.logo-base { color: #000; }
.logo-club {
  background: #BAFF00;
  color: #000;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 900;
}

.header-right-actions { display: flex; align-items: center; gap: 10px; }

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
  color: #000;
  border: none;
  padding: 7px 18px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(186,255,0,0.3);
  font-family: inherit;
}

@media (max-width: 640px) {
  .speech-bubble-logo { padding: 5px 12px; font-size: 13px; }
  .btn-header-kirim { padding: 6px 14px; font-size: 12px; }
}
</style>
