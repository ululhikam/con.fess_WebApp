<template>
  <AuthShell logo-word="USER" subtitle="Buat Akun Pengguna & Mulai Kirim Menfess" :max-width="480">
    <!-- Account Type / Role Switcher Tabs (hanya tampil di Step 1) -->
    <div v-if="currentStep === 1" class="account-type-tabs" role="tablist" aria-label="Pilih tipe registrasi">
      <router-link
        to="/register/user"
        class="tab-btn active-user"
        role="tab"
        aria-selected="true"
      >
        <UserRound :size="15" aria-hidden="true" />
        <span>Akun User (Biasa)</span>
      </router-link>
      <router-link
        to="/register/base"
        class="tab-btn"
        role="tab"
        aria-selected="false"
      >
        <ShieldCheck :size="15" aria-hidden="true" />
        <span>Akun Base Confess</span>
      </router-link>
    </div>

    <!-- Step Wizard Indicator -->
    <div class="step-wizard-bar mb-5" aria-label="Langkah pendaftaran">
      <div
        v-for="s in USER_STEPS"
        :key="s.step"
        class="step-item"
        :class="{ active: currentStep === s.step, completed: currentStep > s.step }"
      >
        <div class="step-circle">
          <Check v-if="currentStep > s.step" :size="14" :stroke-width="3" />
          <span v-else>{{ s.step }}</span>
        </div>
        <span class="step-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- STEP 1: KREDENSIAL (EMAIL & PASSWORD ATAU GOOGLE) -->
    <section v-if="currentStep === 1" class="wizard-step-pane">
      <!-- User Benefit Banner -->
      <div class="user-info-banner mb-4" role="note">
        <div class="banner-icon-badge" aria-hidden="true">
          <Sparkles :size="18" />
        </div>
        <div>
          <h2 class="banner-title">Langkah 1: Akun &amp; Sandi</h2>
          <p class="banner-desc">
            Masukkan email dan kata sandi atau daftar kilat dengan akun Google Anda.
          </p>
        </div>
      </div>

      <form class="auth-form" novalidate @submit.prevent="goToStep2">
        <!-- Email Address -->
        <FormField
          id="user-email"
          v-model="form.email"
          label="Alamat Email"
          type="email"
          placeholder="nama@email.com"
          autocomplete="email"
          required
          :error="errors.email"
          @blur="validateEmail"
        />

        <!-- Password -->
        <FormField
          id="user-password"
          v-model="form.password"
          label="Kata Sandi"
          type="password"
          placeholder="Minimal 8 karakter"
          autocomplete="new-password"
          required
          :error="errors.password"
          @blur="validatePassword"
        />

        <!-- Password Strength Meter -->
        <div class="strength" aria-live="polite">
          <div class="strength__bars" aria-hidden="true">
            <span
              v-for="index in 4"
              :key="index"
              class="strength__bar"
              :class="{ 'is-on': index <= strength.score }"
              :data-level="strength.level"
            />
          </div>
          <span class="strength__label" :data-level="strength.level">
            Kekuatan sandi: {{ strength.label }}
          </span>
        </div>

        <!-- Confirm Password -->
        <FormField
          id="user-confirm-password"
          v-model="form.confirmPassword"
          label="Konfirmasi Kata Sandi"
          type="password"
          placeholder="Ketik ulang kata sandi Anda"
          autocomplete="new-password"
          required
          :error="errors.confirmPassword"
          @blur="validateConfirmPassword"
        />

        <!-- Terms & Privacy Agreement -->
        <div class="terms-row">
          <label class="terms-checkbox-label">
            <input v-model="agreeTerms" type="checkbox" class="terms-checkbox" />
            <span class="terms-text">
              Saya menyetujui <a href="#" class="auth-link">Ketentuan Layanan</a> &amp;
              <a href="#" class="auth-link">Kebijakan Privasi</a> Komunitas FessHub.
            </span>
          </label>
          <p v-if="termsError" class="field-error-msg" role="alert">
            {{ termsError }}
          </p>
        </div>

        <!-- Submit Button Step 1 -->
        <button type="submit" class="btn-submit-user mt-2">
          <span>LANJUT KE INPUT PROFIL</span>
          <ArrowRight :size="15" aria-hidden="true" />
        </button>
      </form>

      <!-- Social Sign Up Divider -->
      <div class="auth-divider" role="separator">
        <span>ATAU DAFTAR DENGAN</span>
      </div>

      <div class="social-login">
        <button type="button" class="btn-google" :disabled="isSubmitting" @click="handleGoogleRegister">
          <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.05.0 12s.46 3.8 1.27 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Daftar Cepat dengan Google</span>
        </button>
      </div>
    </section>

    <!-- STEP 2: INPUT PROFIL (USERNAME, BIO, FOTO PROFIL) -->
    <section v-else-if="currentStep === 2" class="wizard-step-pane">
      <div class="user-info-banner mb-4" role="note">
        <div class="banner-icon-badge" aria-hidden="true">
          <UserRound :size="18" />
        </div>
        <div>
          <h2 class="banner-title">Langkah 2: Lengkapi Profil</h2>
          <p class="banner-desc">
            Tentukan foto profil, nama tampilan, username, dan bio Anda sebelum masuk ke beranda.
          </p>
        </div>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleCompleteRegister">
        <!-- Foto Profil Avatar Selector -->
        <div class="user-avatar-picker-group">
          <div class="user-avatar-picker-head">
            <label class="form-label mb-0">Pilih / Upload Foto Profil</label>
            <label class="btn-upload-file-pill">
              <Upload :size="12" />
              <span>Upload Gambar</span>
              <input
                type="file"
                accept="image/*"
                class="sr-only"
                @change="handleAvatarFileSelect"
              />
            </label>
          </div>

          <div class="user-avatar-center mt-2">
            <div class="user-avatar-ring">
              <img :src="form.avatar" alt="Preview Foto Profil" class="user-avatar-img" />
            </div>
          </div>

          <div class="avatar-preset-chips mt-2">
            <button
              v-for="(preset, i) in USER_AVATAR_PRESETS"
              :key="i"
              type="button"
              class="btn-avatar-preset"
              :class="{ active: form.avatar === preset }"
              @click="form.avatar = preset"
            >
              <img :src="preset" :alt="`Pilihan Avatar ${i+1}`" />
            </button>
          </div>
        </div>

        <!-- Nama Lengkap / Display Name -->
        <FormField
          id="user-full-name"
          v-model="form.name"
          label="Nama Lengkap / Nama Panggilan"
          placeholder="contoh: Alex Pratama"
          autocomplete="name"
          required
          :error="errors.name"
          @blur="validateName"
        />

        <!-- Handle / Alias -->
        <FormField
          id="user-handle"
          v-model="form.handle"
          label="Username / Handle Pengguna"
          placeholder="contoh: @alex_reader"
          autocomplete="username"
          required
          :hint="handleHint"
          :error="errors.handle"
          @blur="validateHandle"
        />

        <!-- Bio Pengguna -->
        <div class="form-field-group">
          <label for="user-bio" class="form-label">Bio Singkat</label>
          <textarea
            id="user-bio"
            v-model="form.bio"
            rows="2"
            class="form-textarea"
            placeholder="Tulis bio singkat tentang minat, kepribadian, atau hobi Anda..."
          ></textarea>
        </div>

        <!-- Submission Error Alert -->
        <p v-if="errors.submit" class="form-alert" role="alert">
          {{ errors.submit }}
        </p>

        <!-- Nav Buttons -->
        <div class="wizard-nav-buttons mt-4">
          <button type="button" class="btn-step-back" @click="currentStep = 1">
            <ArrowLeft :size="16" />
            <span>Kembali</span>
          </button>
          <button type="submit" class="btn-submit-user" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="spin" :size="16" aria-hidden="true" />
            <template v-else>
              <span>SELESAI &amp; MASUK KE HOME</span>
              <ArrowRight :size="15" aria-hidden="true" />
            </template>
          </button>
        </div>
      </form>
    </section>

    <!-- Login Link Footer -->
    <p class="auth-footer mt-6 text-xs text-muted">
      Sudah punya akun?
      <router-link :to="loginTarget" class="auth-link font-bold">Masuk di sini</router-link>
    </p>
  </AuthShell>
</template>

<script setup>
/**
 * RegisterUserPage — 2-step registration screen for regular users:
 * Step 1: Email + Password (validation) OR Google Sign-Up.
 * Step 2: Profile inputs (Username, Bio, Foto Profil).
 * After completion: redirects directly to /feed (Home User).
 */
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  UserRound,
  ShieldCheck,
  Sparkles,
  Check,
  Upload,
} from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const currentStep = ref(1);
const agreeTerms = ref(true);
const termsError = ref('');
const isSubmitting = ref(false);

const USER_STEPS = [
  { step: 1, label: 'Kredensial' },
  { step: 2, label: 'Profil' },
];

const USER_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: 'Alex Pratama',
  handle: '@alex_reader',
  avatar: USER_AVATAR_PRESETS[0],
  bio: 'Secret sender & casual reader di FessHub.',
});

function handleAvatarFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    form.avatar = event.target.result;
  };
  reader.readAsDataURL(file);
}

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  handle: '',
  submit: '',
});

function safeRedirect() {
  const target = route.query.redirect;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : null;
}

const loginTarget = computed(() => ({ path: '/login', query: route.query }));

const handleHint = computed(() => {
  if (!form.handle) {
    return 'Awalan @ otomatis disertakan. Tetap anonim saat kirim pesan.';
  }
  return form.handle.startsWith('@')
    ? 'Format rapi — awalan @ sudah disertakan.'
    : 'Bagus — awalan @ akan ditambahkan otomatis.';
});

/* Password strength score computation (0-4) */
const strength = computed(() => {
  const value = form.password || '';
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (!value) score = 0;

  const labels = ['Kosong', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  return { score, label: labels[score], level: Math.max(0, score - 1) };
});

/* Validations */
function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !form.email.trim()) {
    errors.email = 'Alamat email wajib diisi';
    return false;
  }
  if (!emailRegex.test(form.email)) {
    errors.email = 'Format email tidak valid';
    return false;
  }
  errors.email = '';
  return true;
}

function validatePassword() {
  if (!form.password || form.password.length < 8) {
    errors.password = 'Kata sandi minimal 8 karakter';
    return false;
  }
  errors.password = '';
  return true;
}

function validateConfirmPassword() {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Ketik ulang kata sandi Anda';
    return false;
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Kata sandi tidak sama';
    return false;
  }
  errors.confirmPassword = '';
  return true;
}

function validateName() {
  if (!form.name || form.name.trim().length < 2) {
    errors.name = 'Nama lengkap / panggilan minimal 2 karakter';
    return false;
  }
  errors.name = '';
  return true;
}

function validateHandle() {
  if (!form.handle || form.handle.trim().length < 3) {
    errors.handle = 'Username minimal 3 karakter';
    return false;
  }
  errors.handle = '';
  return true;
}

/* Actions */
function goToStep2() {
  if (!agreeTerms.value) {
    termsError.value = 'Anda harus menyetujui ketentuan layanan untuk mendaftar';
    return;
  }
  termsError.value = '';

  const okEmail = validateEmail();
  const okPass = validatePassword();
  const okConfirm = validateConfirmPassword();

  if (okEmail && okPass && okConfirm) {
    currentStep.value = 2;
  }
}

function handleGoogleRegister() {
  // Simulate Google OAuth response
  form.email = 'user.google@gmail.com';
  form.name = 'Google User';
  form.handle = '@google_user';
  form.password = 'GoogleAuthSecure_Pass123';
  form.confirmPassword = 'GoogleAuthSecure_Pass123';
  agreeTerms.value = true;
  termsError.value = '';

  // Langsung ke step 2 (Input profil)
  currentStep.value = 2;
}

async function handleCompleteRegister() {
  const okName = validateName();
  const okHandle = validateHandle();
  if (!okName || !okHandle) return;

  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const cleanHandle = form.handle.startsWith('@') ? form.handle : `@${form.handle}`;
    authStore.registerUser({
      username: form.name.trim(),
      handle: cleanHandle.trim(),
      email: form.email.trim(),
      password: form.password,
      avatar: form.avatar,
      bio: form.bio.trim(),
    });

    // Langsung diarahkan ke home/feed
    await router.push(safeRedirect() ?? '/feed');
  } catch (err) {
    errors.submit = err.message || 'Terjadi kesalahan saat pendaftaran';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* ---------- Tab Switcher ---------- */
.account-type-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-muted);
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active-user {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  box-shadow: 0 4px 14px var(--neon-blue-glow);
}

/* ---------- Step Wizard Bar ---------- */
.step-wizard-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
  padding: 0 20px;
}

.step-wizard-bar::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 25%;
  right: 25%;
  height: 2px;
  background: var(--border-subtle);
  z-index: 1;
}

.step-item {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.step-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
}

.step-item.active .step-circle {
  background: var(--brand-blue);
  border-color: var(--brand-blue);
  color: #fff;
  box-shadow: 0 0 14px var(--neon-blue-glow);
}

.step-item.active .step-label {
  color: var(--brand-blue);
}

.step-item.completed .step-circle {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.step-item.completed .step-label {
  color: #10b981;
}

/* ---------- User Info Banner ---------- */
.user-info-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(0, 56, 255, 0.08);
  border: 1px solid rgba(0, 56, 255, 0.22);
}

.banner-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--brand-blue);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 10px var(--neon-blue-glow);
}

.banner-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-main);
}

.banner-desc {
  margin: 2px 0 0;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--text-secondary);
}

/* ---------- Avatar Picker ---------- */
.user-avatar-picker-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
}

.user-avatar-picker-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-upload-file-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
  color: var(--brand-blue);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upload-file-pill:hover {
  background: var(--bg-inset);
  border-color: var(--brand-blue);
}

.user-avatar-center {
  display: flex;
  justify-content: center;
}

.user-avatar-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--brand-blue), #10b981);
  box-shadow: 0 6px 18px var(--neon-blue-glow);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-surface);
}

.avatar-preset-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-avatar-preset {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 2px;
  background: transparent;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-avatar-preset img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.btn-avatar-preset:hover {
  transform: scale(1.1);
}

.btn-avatar-preset.active {
  border-color: var(--brand-blue);
  box-shadow: 0 0 10px var(--neon-blue-glow);
  transform: scale(1.08);
}

/* ---------- Textarea & Form Groups ---------- */
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-surface-2);
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  color: var(--text-main);
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: var(--brand-blue);
}

/* ---------- Nav Buttons ---------- */
.wizard-nav-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-step-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 18px;
  border-radius: 14px;
  background: var(--bg-surface-2);
  border: 1.5px solid var(--border-subtle);
  color: var(--text-main);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-step-back:hover {
  background: var(--bg-surface);
  border-color: var(--border-strong);
}

/* ---------- Auth Form Layout ---------- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---------- Password Strength ---------- */
.strength {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: -6px;
}

.strength__bars {
  display: flex;
  gap: 5px;
}

.strength__bar {
  height: 4px;
  flex: 1;
  border-radius: var(--radius-pill);
  background: var(--border-subtle);
  transition: background 0.2s ease;
}

.strength__bar.is-on {
  background: var(--text-muted);
}
.strength__bar.is-on[data-level='1'] {
  background: var(--danger);
}
.strength__bar.is-on[data-level='2'] {
  background: var(--warning);
}
.strength__bar.is-on[data-level='3'] {
  background: var(--neon-blue);
}
.strength__bar.is-on[data-level='4'] {
  background: var(--success);
}

.strength__label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-muted);
}

/* ---------- Terms Checkbox ---------- */
.terms-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.terms-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.terms-checkbox {
  margin-top: 3px;
  accent-color: var(--brand-blue);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.terms-text {
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-secondary);
}

.field-error-msg {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--danger-text);
}

/* ---------- Alerts ---------- */
.form-alert {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
  font-size: 12.5px;
  font-weight: 600;
}

/* ---------- Submit Button ---------- */
.btn-submit-user {
  flex: 1;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    opacity 0.15s ease;
  box-shadow: 0 6px 20px var(--neon-blue-glow);
}

.btn-submit-user:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 69, 251, 0.55);
}

.btn-submit-user:disabled {
  opacity: 0.6;
  cursor: progress;
}

/* ---------- Social Login ---------- */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0 16px;
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-subtle);
}

.auth-divider span {
  padding: 0 12px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-google {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: var(--bg-inset);
  border: 1.5px solid var(--border-subtle);
  color: var(--text-main);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.btn-google:hover:not(:disabled) {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: progress;
}

/* ---------- Footer ---------- */
.auth-footer {
  font-size: 13px;
  text-align: center;
  color: var(--text-muted);
}

.auth-link {
  color: var(--brand-blue);
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .auth-form {
    gap: 12px;
  }

  .user-avatar-ring {
    width: 62px;
    height: 62px;
  }

  .btn-avatar-preset {
    width: 34px;
    height: 34px;
  }

  .form-textarea {
    padding: 8px 12px;
    font-size: 12.5px;
  }

  .btn-step-back {
    padding: 10px 14px;
    font-size: 12px;
  }
}
</style>
