<template>
  <div class="base-club-auth">
    <div class="auth-grid-overlay"></div>

    <div class="auth-card-container">
      <!-- Speech Bubble Logo Header -->
      <div class="text-center mb-6">
        <router-link to="/" class="brand-logo inline-block">
          <div class="speech-bubble-logo">
            <span class="logo-base">BASE</span>
            <span class="logo-club">CONFESS</span>
          </div>
        </router-link>
        <p class="auth-subtitle mt-2">Masuk ke Akun Base & Portal Admin</p>
      </div>

      <!-- Main Login Card -->
      <div class="auth-white-card">
        <!-- Role Quick Switcher Pills (Super Admin Removed) -->
        <div class="role-selector-pills">
          <button 
            type="button"
            @click="selectedRole = 'User'"
            :class="['role-pill-btn', selectedRole === 'User' ? 'active-user' : '']"
          >
            User / Anon
          </button>
          <button 
            type="button"
            @click="selectedRole = 'Base Admin'"
            :class="['role-pill-btn', selectedRole === 'Base Admin' ? 'active-mod' : '']"
          >
            Base Admin
          </button>
        </div>

        <!-- Role Badge Indicator Banner -->
        <div class="role-banner-indicator mb-4" :class="bannerClass">
          <div>
            <div class="font-bold text-xs">{{ roleBannerTitle }}</div>
            <div class="text-xs opacity-90">{{ roleBannerDesc }}</div>
          </div>
        </div>

        <!-- Standard Credentials Login Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email atau Username Base</label>
            <input 
              v-model="username" 
              type="text" 
              class="base-input" 
              placeholder="contoh: alexdev@base.eth"
              required 
            />
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label">Kata Sandi</label>
              <a href="#" class="text-xs text-blue text-decoration-none font-bold">Lupa Sandi?</a>
            </div>
            <input 
              v-model="password" 
              type="password" 
              class="base-input" 
              placeholder="••••••••••••"
              required 
            />
          </div>

          <button type="submit" class="btn-submit-blue mt-2">
            MASUK SEBAGAI {{ selectedRole.toUpperCase() }} →
          </button>
        </form>

        <div class="divider">
          <span>ATAU MASUK DENGAN</span>
        </div>

        <!-- Google Login Only -->
        <div class="social-login-single">
          <button @click="handleGoogleLogin" type="button" class="btn-google">
            <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.05.0 12s.46 3.8 1.27 5.42l4.01-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>
        </div>

        <div class="card-footer text-center mt-6 text-xs text-muted">
          Belum punya akun Base? 
          <router-link to="/register" class="text-blue font-bold">Buat Akun Base Confess</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('user@base.eth')
const password = ref('password123')
const selectedRole = ref('User')

const roleBannerTitle = computed(() => {
  if (selectedRole.value === 'Base Admin') return 'Portal Admin Base'
  return 'Pengirim Anonim & User'
})

const roleBannerDesc = computed(() => {
  if (selectedRole.value === 'Base Admin') return 'Kelola & moderasi postingan confession serta statistik komunitas.'
  return 'Kirim confession anonim, beri tanggapan & kumpulkan poin reward.'
})

const bannerClass = computed(() => {
  if (selectedRole.value === 'Base Admin') return 'banner-mod'
  return 'banner-user'
})

function handleLogin() {
  authStore.login(selectedRole.value)
  redirectRole(selectedRole.value)
}

function handleGoogleLogin() {
  authStore.login(selectedRole.value)
  redirectRole(selectedRole.value)
}

function redirectRole(role) {
  if (role === 'Base Admin') {
    router.push('/base-admin')
  } else {
    router.push('/feed')
  }
}
</script>

<style scoped>
.base-club-auth {
  min-height: 100vh;
  background-color: #0B39FA;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  color: #ffffff;
}

.auth-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
}

.auth-card-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
}

.brand-logo {
  text-decoration: none;
}

.speech-bubble-logo {
  background: #ffffff;
  color: #000000;
  padding: 8px 20px;
  border-radius: 18px 18px 18px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 900;
  font-size: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.logo-base {
  color: #000000;
}

.logo-club {
  background: #BAFF00;
  color: #000000;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 900;
}

.auth-subtitle {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.auth-white-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 32px 28px;
  color: #111827;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.role-selector-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 16px;
}

.role-pill-btn {
  border: none;
  background: transparent;
  padding: 10px;
  font-size: 13px;
  font-weight: 800;
  border-radius: 10px;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s ease;
}

.role-pill-btn.active-user {
  background: #0B39FA;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(11, 57, 250, 0.3);
}

.role-pill-btn.active-mod {
  background: #7000FF;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(112, 0, 255, 0.3);
}

.role-banner-indicator {
  padding: 12px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-user {
  background: #EEF2FF;
  color: #0B39FA;
  border: 1px solid #C7D2FE;
}

.banner-mod {
  background: #F3E8FF;
  color: #6B21A8;
  border: 1px solid #E9D5FF;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 12.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 6px;
}

.base-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E5E7EB;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.base-input:focus {
  border-color: #0B39FA;
}

.btn-submit-blue {
  width: 100%;
  background: #0B39FA;
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 6px 20px rgba(11, 57, 250, 0.3);
}

.btn-submit-blue:hover {
  background: #0425BD;
  transform: translateY(-1px);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #E5E7EB;
}

.divider span {
  padding: 0 10px;
}

.social-login-single {
  display: flex;
  justify-content: center;
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #FFFFFF;
  border: 1.5px solid #E5E7EB;
  border-radius: 14px;
  padding: 12px 20px;
  font-weight: 800;
  font-size: 14px;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.card-footer {
  font-size: 13px;
  color: #6B7280;
}

.text-blue {
  color: #0B39FA;
  text-decoration: none;
}

.text-blue:hover {
  text-decoration: underline;
}

.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-6 { margin-top: 1.5rem; }
.inline-block { display: inline-block; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.text-xs { font-size: 0.75rem; }
.opacity-90 { opacity: 0.9; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
</style>
