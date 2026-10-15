<template>
  <AuthShell
    logo-word="CONFESS"
    subtitle="Pendaftaran Akun Admin Base & Setup Auto-Post"
    :max-width="520"
  >
    <!-- Account Type / Role Switcher Tabs (hanya tampil di Step 1) -->
    <div v-if="currentStep === 1" class="account-type-tabs" role="tablist" aria-label="Pilih tipe registrasi">
      <router-link
        to="/register/user"
        class="tab-btn"
        role="tab"
        aria-selected="false"
      >
        <UserRound :size="15" aria-hidden="true" />
        <span>Akun User (Biasa)</span>
      </router-link>
      <router-link
        to="/register/base"
        class="tab-btn active-base"
        role="tab"
        aria-selected="true"
      >
        <ShieldCheck :size="15" aria-hidden="true" />
        <span>Akun Base Confess</span>
      </router-link>
    </div>

    <!-- Step Indicator Progress Bar -->
    <div class="step-wizard-bar mb-6" aria-label="Langkah pendaftaran">
      <div
        v-for="s in STEPS"
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

    <!-- STEP 1: EMAIL & PASSWORD / GOOGLE -->
    <section v-if="currentStep === 1" class="wizard-step-pane">
      <div class="step-hero mb-4">
        <h2 class="step-title">1. Buat Akun Admin Base</h2>
        <p class="step-desc">
          Masukkan email dan kata sandi atau daftar instan dengan Google untuk mengelola portal base.
        </p>
      </div>

      <form class="auth-form" novalidate @submit.prevent="goToStep2">
        <FormField
          id="base-email"
          v-model="form.email"
          label="Email Admin Base"
          type="email"
          placeholder="admin@namabase.id"
          autocomplete="email"
          required
          :error="errors.email"
          @blur="validateEmail"
        />

        <FormField
          id="base-password"
          v-model="form.password"
          label="Kata Sandi"
          type="password"
          placeholder="Minimal 8 karakter"
          autocomplete="new-password"
          required
          hint="Minimal 8 karakter"
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

        <FormField
          id="base-confirm-password"
          v-model="form.confirmPassword"
          label="Konfirmasi Kata Sandi"
          type="password"
          placeholder="Ketik ulang kata sandi Anda"
          autocomplete="new-password"
          required
          :error="errors.confirmPassword"
          @blur="validateConfirmPassword"
        />

        <button type="submit" class="btn-step-next mt-3">
          <span>Lanjut: Tautkan Instagram</span>
          <ArrowRight :size="16" />
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

    <!-- STEP 2: TAUTAN AKUN INSTAGRAM (KHUSUS INSTAGRAM) -->
    <section v-else-if="currentStep === 2" class="wizard-step-pane">
      <div class="step-hero mb-4">
        <h2 class="step-title">2. Tautkan Akun Instagram</h2>
        <p class="step-desc">
          Hubungkan akun Instagram komunitasmu untuk otomatis menerbitkan confession yang disetujui langsung ke Instagram Story atau Feed.
        </p>
      </div>

      <div class="medsos-connect-cards">
        <!-- Instagram Card (Utama & Eksklusif) -->
        <div class="medsos-card" :class="{ connected: igConnected }">
          <div class="medsos-card-header">
            <div class="medsos-icon-brand ig-brand">
              <Instagram :size="22" />
            </div>
            <div class="medsos-info">
              <div class="medsos-name">Instagram Graph API Integration</div>
              <div class="medsos-status">
                {{ igConnected ? '✓ Terhubung ke Instagram Auto-Post' : 'Publikasi otomatis ke Story & Feed' }}
              </div>
            </div>
            <span v-if="igConnected" class="badge-connected">AKTIF</span>
          </div>

          <div class="medsos-input-row mt-3">
            <label for="ig-username" class="visually-hidden">Username Instagram</label>
            <input
              id="ig-username"
              v-model="form.igAccount"
              type="text"
              placeholder="@username_ig_base"
              class="form-input text-xs"
            />
            <button
              type="button"
              class="btn-connect-action"
              :class="{ 'btn-connected': igConnected }"
              @click="toggleConnectIg"
            >
              {{ igConnected ? 'Terputus' : 'Hubungkan' }}
            </button>
          </div>

          <!-- Feature Highlights of Instagram Link -->
          <div class="ig-features-list mt-3">
            <div class="ig-feat-item">
              <Check :size="13" class="feat-icon" />
              <span>Otomatis render kartu confess jadi visual Story Instagram 9:16</span>
            </div>
            <div class="ig-feat-item">
              <Check :size="13" class="feat-icon" />
              <span>Kirim langsung setelah disetujui di antrean moderasi</span>
            </div>
            <div class="ig-feat-item">
              <Check :size="13" class="feat-icon" />
              <span>Dukungan hashtag base &amp; watermark kustom komunitas</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wizard-nav-buttons mt-6">
        <button type="button" class="btn-step-back" @click="currentStep = 1">
          <ArrowLeft :size="16" />
          <span>Kembali</span>
        </button>
        <button type="button" class="btn-step-next" @click="goToStep3">
          <span>Lanjut: Profil Base</span>
          <ArrowRight :size="16" />
        </button>
      </div>
    </section>

    <!-- STEP 3: INPUT PROFIL BASE (NAMA, USERNAME, FOTO PROFIL, BIO) -->
    <section v-else class="wizard-step-pane">
      <div class="step-hero mb-4">
        <h2 class="step-title">3. Input Profil Base</h2>
        <p class="step-desc">
          Lengkapi identitas base publik yang akan dilihat oleh pengguna saat mengirim confession.
        </p>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleCompleteRegister">
        <!-- Foto Profil Base Picker -->
        <div class="base-avatar-picker-group">
          <div class="base-avatar-picker-head">
            <label class="form-label mb-0">Foto Profil Base</label>
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

          <div class="base-avatar-center mt-2">
            <div class="base-avatar-ring">
              <img :src="form.avatar" alt="Preview Foto Base" class="base-avatar-img" />
            </div>
          </div>

          <div class="avatar-preset-chips mt-2">
            <button
              v-for="(preset, i) in BASE_AVATAR_PRESETS"
              :key="i"
              type="button"
              class="btn-base-preset"
              :class="{ active: form.avatar === preset }"
              @click="form.avatar = preset"
            >
              <img :src="preset" :alt="`Pilihan ${i+1}`" />
            </button>
          </div>
        </div>

        <!-- Nama Base -->
        <FormField
          id="base-name"
          v-model="form.name"
          label="Nama Base"
          placeholder="contoh: Code & Memes Base"
          required
          :error="errors.name"
          @blur="validateName"
        />

        <!-- Username Base -->
        <FormField
          id="base-handle"
          v-model="form.handle"
          label="Username Base"
          placeholder="contoh: @codememfess"
          required
          hint="Format handle diawali tanda @"
          :error="errors.handle"
          @blur="validateHandle"
        />

        <!-- Bio Base -->
        <div class="form-field-group">
          <label for="base-bio" class="form-label">Bio Base</label>
          <textarea
            id="base-bio"
            v-model="form.bio"
            rows="2"
            class="form-textarea"
            placeholder="Tuliskan deskripsi base, aturan kirim, dan topik yang diperbolehkan..."
          ></textarea>
        </div>

        <div class="wizard-nav-buttons mt-6">
          <button type="button" class="btn-step-back" @click="currentStep = 2">
            <ArrowLeft :size="16" />
            <span>Kembali</span>
          </button>
          <button type="submit" class="btn-submit-lime" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="spin" :size="16" />
            <template v-else>
              <span>SELESAI &amp; MASUK KE HOME</span>
              <ArrowRight :size="16" />
            </template>
          </button>
        </div>
      </form>
    </section>

    <!-- Bottom link to login -->
    <div class="auth-footer mt-6 text-xs text-muted text-center">
      <span>Sudah punya akun base? </span>
      <router-link to="/login" class="auth-link font-bold">Masuk di sini</router-link>
    </div>
  </AuthShell>
</template>

<script setup>
/**
 * RegisterPage — Onboarding flow for Admin Base.
 * 3-step wizard:
 *  1. Email & Password ATAU Google
 *  2. Tautkan Akun Instagram (Instagram Graph API Auto-Post)
 *  3. Input Profil Base (Nama Base, Username Base, Foto Profil, Bio)
 *
 * After completion: redirects straight to the Admin Base Home (/base-admin).
 */
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Instagram,
  Loader2,
  UserRound,
  ShieldCheck,
  Upload,
} from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const STEPS = [
  { step: 1, label: 'Akun' },
  { step: 2, label: 'Instagram' },
  { step: 3, label: 'Profil Base' },
];

const currentStep = ref(1);
const isSubmitting = ref(false);
const igConnected = ref(false);

const BASE_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=150&q=80',
];

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  igAccount: '@codememfess_ig',
  name: 'Code & Memes Base',
  handle: '@codememfess',
  avatar: BASE_AVATAR_PRESETS[0],
  bio: 'Base resmi komunitas developer & programmer. Kirim confession anonim seputar tech, coding, dan karir dev!',
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
});

/* ---------- Password Strength ---------- */
const strength = computed(() => {
  const value = form.password;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (!value) score = 0;

  const labels = ['Kosong', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  return { score, label: labels[score], level: Math.max(0, score - 1) };
});

/* ---------- Validations ---------- */
function validateEmail() {
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
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
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Kata sandi konfirmasi tidak sama';
    return false;
  }
  errors.confirmPassword = '';
  return true;
}

function validateName() {
  if (!form.name || form.name.trim().length < 2) {
    errors.name = 'Nama base minimal 2 karakter';
    return false;
  }
  errors.name = '';
  return true;
}

function validateHandle() {
  if (!form.handle || form.handle.trim().length < 3) {
    errors.handle = 'Username base minimal 3 karakter';
    return false;
  }
  errors.handle = '';
  return true;
}

/* ---------- Navigation & Actions ---------- */
function goToStep2() {
  const okEmail = validateEmail();
  const okPass = validatePassword();
  const okConfirm = validateConfirmPassword();
  if (okEmail && okPass && okConfirm) {
    currentStep.value = 2;
  }
}

function handleGoogleRegister() {
  // Google OAuth (GIS) isn't wired yet — guide the user to the form.
  errors.submit = 'Pendaftaran via Google belum tersedia. Isi formulir di atas.';
}

function toggleConnectIg() {
  igConnected.value = !igConnected.value;
}

function goToStep3() {
  currentStep.value = 3;
}

async function handleCompleteRegister() {
  const okName = validateName();
  const okHandle = validateHandle();
  if (!okName || !okHandle) return;

  isSubmitting.value = true;
  try {
    const cleanHandle = form.handle.startsWith('@') ? form.handle : `@${form.handle}`;
    await authStore.registerBase({
      email: form.email,
      password: form.password,
      name: form.name.trim(),
      handle: cleanHandle.trim(),
      avatar: /^https?:\/\//.test(form.avatar || '') ? form.avatar : null,
      bio: form.bio.trim(),
      igAccount: form.igAccount.trim(),
    });

    // Langsung diarahkan ke Home Admin Base!
    await router.push('/base-admin');
  } catch (err) {
    errors.submit = err.message || 'Terjadi kesalahan saat pendaftaran';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Account type tabs */
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

.tab-btn.active-base {
  background: var(--lime-primary);
  color: var(--lime-ink);
  box-shadow: 0 4px 14px var(--lime-glow);
}

/* Step wizard bar */
.step-wizard-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 16px;
}

.step-wizard-bar::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 36px;
  right: 36px;
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
  gap: 6px;
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
}

.step-item.active .step-circle {
  border-color: var(--lime-primary);
  background: var(--lime-primary);
  color: var(--lime-ink);
  box-shadow: 0 0 14px var(--lime-glow);
}

.step-item.active .step-label {
  color: var(--text-main);
}

.step-item.completed .step-circle {
  border-color: #10b981;
  background: #10b981;
  color: #fff;
}

.step-hero {
  text-align: left;
}

.step-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-main);
  margin: 0;
}

.step-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.5;
}

/* Medsos cards */
.medsos-connect-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medsos-card {
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.15s ease;
}

.medsos-card.connected {
  border-color: #10b981;
}

.medsos-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.medsos-icon-brand {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.ig-brand {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  box-shadow: 0 4px 12px rgba(225, 48, 108, 0.35);
}

.medsos-info {
  flex: 1;
}

.medsos-name {
  font-weight: 800;
  font-size: 13.5px;
  color: var(--text-main);
}

.medsos-status {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.badge-connected {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid #10b981;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.medsos-input-row {
  display: flex;
  gap: 8px;
}

.btn-connect-action {
  padding: 8px 16px;
  border-radius: 10px;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-connect-action.btn-connected {
  background: var(--bg-inset);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.ig-features-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}

.ig-feat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: var(--text-secondary);
}

.feat-icon {
  color: #10b981;
  flex-shrink: 0;
}

/* Avatar picker */
.base-avatar-picker-group {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
}

.base-avatar-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

.base-avatar-center {
  display: flex;
  justify-content: center;
}

.base-avatar-ring {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--lime-primary), var(--brand-blue));
  box-shadow: 0 4px 16px var(--shadow-color);
}

.base-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-surface);
}

.avatar-preset-chips {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-base-preset {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  cursor: pointer;
  background: none;
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.btn-base-preset img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-base-preset.active {
  border-color: var(--lime-primary);
  transform: scale(1.15);
}

.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-inset);
  font-family: inherit;
  font-size: 13.5px;
  color: var(--text-main);
  outline: none;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: var(--brand-blue);
}

/* Navigation buttons */
.wizard-nav-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn-step-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.btn-step-next {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--neon-blue-glow);
  transition: transform 0.15s ease;
}

.btn-step-next:hover {
  transform: translateY(-2px);
}

.wizard-nav-buttons .btn-step-next,
.wizard-nav-buttons .btn-submit-lime {
  width: auto;
  flex: 1;
}

.btn-submit-lime {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-pill);
  background: var(--lime-primary);
  color: var(--lime-ink);
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--lime-glow);
  transition: transform 0.15s ease;
}

.btn-submit-lime:hover {
  transform: translateY(-2px);
}

/* Password strength */
.strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -4px 0 12px;
}

.strength__bars {
  display: flex;
  gap: 4px;
}

.strength__bar {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-subtle);
  transition: background 0.2s ease;
}

.strength__bar.is-on[data-level='0'] { background: #ef4444; }
.strength__bar.is-on[data-level='1'] { background: #f59e0b; }
.strength__bar.is-on[data-level='2'] { background: #3b82f6; }
.strength__bar.is-on[data-level='3'] { background: #10b981; }

.strength__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

/* Social Google Login */
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

  .base-avatar-ring {
    width: 64px;
    height: 64px;
  }

  .btn-base-preset {
    width: 32px;
    height: 32px;
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
