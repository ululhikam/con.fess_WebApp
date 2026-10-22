<template>
  <AuthShell logo-word="CONFESS" subtitle="Reset Kata Sandi Akun">
    <!-- Stepper -->
    <div class="fp-steps" aria-hidden="true">
      <span class="fp-step" :class="{ active: stepIndex >= 1, done: stepIndex > 1 }">1</span>
      <span class="fp-step-line" :class="{ done: stepIndex > 1 }"></span>
      <span class="fp-step" :class="{ active: stepIndex >= 2, done: stepIndex > 2 }">2</span>
      <span class="fp-step-line" :class="{ done: stepIndex > 2 }"></span>
      <span class="fp-step" :class="{ active: stepIndex >= 3 }">3</span>
    </div>

    <!-- STEP 1: minta kode OTP -->
    <form v-if="step === 'email'" class="auth-form" novalidate @submit.prevent="handleSendOtp">
      <p class="fp-lead">
        Masukkan email akunmu. Kami akan mengirim kode OTP 6 digit sebagai verifikasi
        bahwa ini benar-benar kamu.
      </p>

      <FormField
        id="fp-email"
        v-model="emailForm.values.email"
        label="Email Terdaftar"
        type="email"
        placeholder="contoh: kamu@email.com"
        autocomplete="email"
        required
        :error="fieldError(emailForm, 'email')"
        @blur="touch(emailForm, 'email')"
      />

      <p v-if="emailSubmitError" class="form-alert" role="alert">{{ emailSubmitError }}</p>

      <button type="submit" class="btn-submit-blue" :disabled="emailSubmitting">
        <Loader2 v-if="emailSubmitting" class="spin" :size="16" aria-hidden="true" />
        <template v-else>
          KIRIM KODE OTP
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </button>

      <div class="fp-footer-row">
        <router-link :to="{ name: 'Login' }" class="auth-link text-xs font-bold">
          Kembali ke halaman masuk
        </router-link>
      </div>
    </form>

    <!-- STEP 2: verifikasi kode OTP -->
    <form v-else-if="step === 'otp'" class="auth-form" novalidate @submit.prevent="handleVerifyOtp">
      <div class="fp-info-box">
        Kode OTP telah dikirim ke <strong>{{ emailForm.values.email }}</strong>. Silakan periksa kotak masuk atau folder spam email kamu. Kode berlaku 10 menit.
      </div>

      <FormField
        id="fp-otp"
        :model-value="otpForm.values.otp"
        label="Kode OTP"
        placeholder="6 digit angka"
        autocomplete="one-time-code"
        required
        hint="Masukkan 6 digit yang tertulis di email."
        :error="fieldError(otpForm, 'otp')"
        @update:model-value="handleOtpInput"
        @blur="touch(otpForm, 'otp')"
      />

      <p v-if="otpSubmitError" class="form-alert" role="alert">{{ otpSubmitError }}</p>

      <button type="submit" class="btn-submit-blue" :disabled="otpSubmitting">
        <Loader2 v-if="otpSubmitting" class="spin" :size="16" aria-hidden="true" />
        <template v-else>
          VERIFIKASI KODE
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </button>

      <div class="fp-footer-links">
        <button
          type="button"
          class="fp-text-btn"
          :disabled="resendIn > 0 || resending"
          @click="handleResendOtp"
        >
          {{ resendIn > 0 ? `Kirim ulang dalam ${resendIn} dtk` : 'Kirim ulang kode' }}
        </button>
        <span class="fp-dot" aria-hidden="true">•</span>
        <button type="button" class="fp-text-btn" @click="backToEmail">Ganti email</button>
      </div>
    </form>

    <!-- STEP 3: kata sandi baru -->
    <form
      v-else-if="step === 'password'"
      class="auth-form"
      novalidate
      @submit.prevent="handleResetPassword"
    >
      <p class="fp-lead">
        Kode terverifikasi. Buat kata sandi baru untuk akunmu, lalu masuk kembali.
      </p>

      <FormField
        id="fp-password"
        v-model="passForm.values.password"
        label="Kata Sandi Baru"
        type="password"
        placeholder="Minimal 8 karakter"
        autocomplete="new-password"
        required
        :error="fieldError(passForm, 'password')"
        @blur="touch(passForm, 'password')"
      />

      <FormField
        id="fp-confirm-password"
        v-model="passForm.values.confirmPassword"
        label="Ulangi Kata Sandi Baru"
        type="password"
        placeholder="Ulangi kata sandi baru"
        autocomplete="new-password"
        required
        :error="fieldError(passForm, 'confirmPassword')"
        @blur="touch(passForm, 'confirmPassword')"
      />

      <p v-if="passSubmitError" class="form-alert" role="alert">{{ passSubmitError }}</p>

      <button type="submit" class="btn-submit-blue" :disabled="passSubmitting">
        <Loader2 v-if="passSubmitting" class="spin" :size="16" aria-hidden="true" />
        <template v-else>
          SIMPAN KATA SANDI BARU
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </button>
    </form>

    <!-- SELESAI -->
    <div v-else class="fp-done">
      <div class="fp-done-icon" aria-hidden="true">
        <CheckCircle2 :size="44" />
      </div>
      <h2 class="fp-done-title">Kata sandi berhasil diperbarui</h2>
      <p class="fp-done-desc">Silakan masuk kembali menggunakan kata sandi barumu.</p>
      <button type="button" class="btn-submit-blue" @click="goLogin">MASUK SEKARANG</button>
    </div>
  </AuthShell>
</template>

<script setup>
/**
 * ForgotPasswordPage — reset kata sandi 3 langkah:
 *   1. Kirim kode OTP ke email terdaftar (POST /auth/forgot-password)
 *   2. Verifikasi kode → token reset sekali pakai (POST /auth/verify-reset-otp)
 *   3. Simpan kata sandi baru (POST /auth/reset-password)
 *
 * Layout memakai <AuthShell>/<FormField> yang sama dengan LoginPage agar
 * alurnya terasa satu paket.
 *
 * CATATAN VALIDASI: satu instance useValidatedForm per langkah karena
 * `form.submit()` memvalidasi SELURUH field schema — form tunggal multi-step
 * akan selalu gagal di langkah awal (field langkah berikutnya masih kosong).
 * Ref nested (submitError/submitting) di-destructure ke binding top-level
 * karena template Vue tidak meng-unwrap ref di dalam objek biasa.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { useValidatedForm, rules } from '../composables/useValidatedForm';
import { toast } from '../composables/useToast';
import { api } from '../api';

const router = useRouter();

/* ---------- step state ---------- */
const step = ref('email'); // 'email' | 'otp' | 'password' | 'done'
const stepIndex = computed(
  () => ({ email: 1, otp: 2, password: 3, done: 3 })[step.value] ?? 1,
);
const resetToken = ref('');

/* ---------- resend cooldown ---------- */
const resendIn = ref(0);
const resending = ref(false);
let resendTimer = null;

function startResendCooldown(seconds = 60) {
  resendIn.value = seconds;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendIn.value -= 1;
    if (resendIn.value <= 0) clearInterval(resendTimer);
  }, 1000);
}

onBeforeUnmount(() => clearInterval(resendTimer));

/* ---------- validation: satu form per langkah ---------- */
/** Kata sandi pertama dicatat di ref terpisah agar rule konfirmasi bisa membandingkan. */
const passwordValue = ref('');

const emailForm = useValidatedForm({
  email: {
    initial: '',
    rules: [rules.required(), rules.email()],
  },
});

const otpForm = useValidatedForm({
  otp: {
    initial: '',
    rules: [
      rules.required(),
      (v) => (/^\d{6}$/.test(String(v)) ? '' : 'Kode OTP harus 6 digit angka'),
    ],
  },
});

const passForm = useValidatedForm({
  password: {
    initial: '',
    rules: [rules.required(), rules.minLength(8, 'Minimal 8 karakter')],
  },
  confirmPassword: {
    initial: '',
    rules: [
      rules.required(),
      (v) => (v === passwordValue.value ? '' : 'Konfirmasi kata sandi tidak sama'),
    ],
  },
});

// Ref nested tidak di-unwrap template — ambil ke binding top-level.
const { submitting: emailSubmitting, submitError: emailSubmitError } = emailForm;
const { submitting: otpSubmitting, submitError: otpSubmitError } = otpForm;
const { submitting: passSubmitting, submitError: passSubmitError } = passForm;

watch(
  () => passForm.values.password,
  (v) => {
    passwordValue.value = v;
    if (passForm.touched.confirmPassword) passForm.validateField('confirmPassword');
  },
);

/** Tampilkan error hanya setelah field disentuh (pola sama dengan LoginPage). */
function fieldError(form, name) {
  return form.touched[name] ? form.errors[name] : '';
}

function touch(form, name) {
  form.touched[name] = true;
  form.validateField(name);
}

/* ---------- helpers ---------- */
function handleOtpInput(value) {
  otpForm.values.otp = String(value || '').replace(/\D/g, '').slice(0, 6);
}

function goLogin() {
  router.push({ name: 'Login' });
}

function backToEmail() {
  step.value = 'email';
  otpForm.reset();
  resetToken.value = '';
  otpSubmitError.value = null;
}

/* ---------- step 1: kirim OTP ---------- */
async function handleSendOtp() {
  if (emailSubmitting.value) return;

  let sent = false;
  const ok = await emailForm.submit(async (payload) => {
    await api.forgotPassword({ email: String(payload.email).trim() });
    sent = true;
  });

  if (ok && sent) {
    step.value = 'otp';
    otpForm.reset();
    startResendCooldown();
    toast.success('Kode OTP sudah dikirim ke email kamu.');
  }
}

/* ---------- step 2: verifikasi OTP ---------- */
async function handleVerifyOtp() {
  if (otpSubmitting.value) return;

  let verified = false;
  const ok = await otpForm.submit(async (payload) => {
    const res = await api.verifyResetOtp({
      email: String(emailForm.values.email).trim(),
      otp: payload.otp,
    });
    resetToken.value = res?.reset_token || '';
    if (!resetToken.value) {
      throw new Error('Respons verifikasi tidak lengkap. Coba lagi.');
    }
    verified = true;
  });

  if (ok && verified) {
    step.value = 'password';
    passForm.reset();
    passwordValue.value = '';
    toast.success('Kode OTP terverifikasi. Silakan buat kata sandi baru.');
  }
}

async function handleResendOtp() {
  if (resending.value || resendIn.value > 0) return;
  resending.value = true;
  otpSubmitError.value = null;
  try {
    await api.forgotPassword({ email: String(emailForm.values.email).trim() });
    otpForm.reset();
    startResendCooldown();
    toast.success('Kode OTP baru sudah dikirim.');
  } catch (err) {
    otpSubmitError.value = err?.message || 'Gagal mengirim ulang kode. Coba lagi.';
    toast.error(otpSubmitError.value);
  } finally {
    resending.value = false;
  }
}

/* ---------- step 3: simpan kata sandi baru ---------- */
async function handleResetPassword() {
  if (passSubmitting.value) return;

  let saved = false;
  const ok = await passForm.submit(async (payload) => {
    await api.resetPassword({
      email: String(emailForm.values.email).trim(),
      reset_token: resetToken.value,
      password: payload.password,
    });
    saved = true;
  });

  if (ok && saved) {
    step.value = 'done';
    toast.success('Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.');
  }
}
</script>

<style scoped>
/* ---------- stepper ---------- */
.fp-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.fp-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 800;
  background: var(--bg-surface-2);
  color: var(--text-muted);
  border: 1.5px solid var(--border-subtle);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.fp-step.active {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border-color: var(--brand-blue);
}

.fp-step.done {
  opacity: 0.85;
}

.fp-step-line {
  width: 34px;
  height: 2px;
  border-radius: 2px;
  background: var(--border-subtle);
}

.fp-step-line.done {
  background: var(--brand-blue);
}

/* ---------- teks pengantar ---------- */
.fp-lead {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}

/* ---------- kotak info ---------- */
.fp-info-box {
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(0, 85, 255, 0.08);
  border: 1px solid rgba(0, 85, 255, 0.18);
  color: var(--text-main);
  font-size: 12.5px;
  line-height: 1.6;
}


/* ---------- form ---------- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-alert {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
  font-size: 12.5px;
  font-weight: 600;
}

.btn-submit-blue {
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
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  box-shadow: 0 6px 20px var(--neon-blue-glow);
}

.btn-submit-blue:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-submit-blue:disabled {
  opacity: 0.6;
  cursor: progress;
}

.spin {
  animation: fp-spin 1s linear infinite;
}

@keyframes fp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- footer / aksi tambahan ---------- */
.fp-footer-row {
  display: flex;
  justify-content: center;
}

.fp-footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fp-dot {
  color: var(--text-muted);
  opacity: 0.6;
}

.fp-text-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-blue);
  cursor: pointer;
}

.fp-text-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.fp-text-btn:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.auth-link {
  color: var(--brand-blue);
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

/* ---------- selesai ---------- */
.fp-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.fp-done-icon {
  color: #22c55e;
  margin-bottom: 4px;
}

.fp-done-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}

.fp-done-desc {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}
</style>
