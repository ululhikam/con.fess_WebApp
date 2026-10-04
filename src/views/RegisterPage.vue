<template>
  <div class="base-club-auth">
    <div class="auth-grid-overlay"></div>

    <div class="auth-card-container">
      <!-- Logo Header -->
      <div class="text-center mb-6">
        <router-link to="/" class="brand-logo inline-block">
          <div class="speech-bubble-logo">
            <span class="logo-base">BASE</span>
            <span class="logo-club">CLUB</span>
          </div>
        </router-link>
        <p class="auth-subtitle mt-2">Create your Base Account & Join Creator Engine</p>
      </div>

      <!-- Main Register White Card -->
      <div class="auth-white-card">
        <h2 class="card-title text-center mb-1">Create Base Account</h2>
        <p class="card-desc text-center text-xs text-muted mb-6">Join thousands of creators sending confessions & earning $CLUB</p>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Desired Creator Handle / Alias</label>
            <input v-model="username" type="text" class="base-input" placeholder="e.g. @anon_creator" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input v-model="email" type="email" class="base-input" placeholder="creator@baseclub.eth" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="base-input" placeholder="••••••••••••" required />
          </div>

          <button type="submit" class="btn-submit-lime mt-2">
            CREATE ACCOUNT & ENTER BASE →
          </button>
        </form>

        <div class="card-footer text-center mt-6 text-xs text-muted">
          Already have an account? 
          <router-link to="/login" class="text-blue font-bold">Log in here</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')

const handleRegister = () => {
  authStore.login('User')
  router.push('/feed')
}
</script>

<style scoped>
.base-club-auth {
  min-height: 100vh;
  background-color: #0038FF;
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
  padding: 8px 18px;
  border-radius: 18px 18px 18px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 900;
  font-size: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.logo-club {
  background: #9EFF00;
  color: #000;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 14px;
}

.auth-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.auth-white-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 32px 28px;
  color: #111827;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #000;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}

.base-input {
  background: #F9FAFB;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
}

.base-input:focus {
  border-color: #0038FF;
  box-shadow: 0 0 10px rgba(0, 56, 255, 0.2);
  background: #ffffff;
}

.btn-submit-lime {
  background: #9EFF00;
  color: #000000;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 6px 20px rgba(158, 255, 0, 0.35);
}

.btn-submit-lime:hover {
  transform: translateY(-2px);
}

.text-blue { color: #0038FF; }

@media (max-width: 640px) {
  .auth-white-card {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .base-input {
    font-size: 16px !important;
  }
}
</style>
