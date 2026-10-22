<template>
  <AuthShell logo-word="CONFESS" subtitle="Verifikasi Email Akun">
    <div class="verify-head">
      <span class="verify-icon" aria-hidden="true">
        <MailCheck :size="24" />
      </span>
      <h1 class="verify-title">Cek email kamu</h1>
      <p class="verify-desc">
        Masukkan kode 6 digit yang kami kirim ke
        <strong>{{ email || 'alamat email kamu' }}</strong
        >. Kode berlaku 10 menit.
      </p>
    </div>

    <p v-if="notice" class="form-alert" role="status">{{ notice }}</p>
    <p v-if="errorMessage" class="form-alert" role="alert">{{ errorMessage }}</p>

    <template v-if="ticket">
      <form class="auth-form" novalidate @submit.prevent="handleVerify">
        <FormField
          id="verification-otp"
          v-model="otp"
          label="Kode OTP"
          autocomplete="one-time-code"
          inputmode="numeric"
          maxlength="6"
          pattern="[0-9]*"
          :error="otpError"
          required
        />

        <button type="submit" class="btn-submit-blue mt-2" :disabled="verifying">
          <Loader2 v-if="verifying" class="spin" :size="16" aria-hidden="true" />
          <template v-else>
            VERIFIKASI EMAIL
            <ArrowRight :size="15" aria-hidden="true" />
          </template>
        </button>
      </form>

      <div class="resend-row">
        <button
          type="button"
          class="auth-link resend-btn"
          aria-live="off"
          :disabled="resending || remaining > 0"
          @click="handleResend"
        >
          <Loader2 v-if="resending" class="spin" :size="13" aria-hidden="true" />
          <span v-else>
            {{ remaining > 0 ? `Kirim ulang dalam ${remaining} detik` : 'Kirim ulang kode OTP' }}
          </span>
        </button>
      </div>

      <div class="change-email">
        <button type="button" class="auth-link change-toggle" @click="showChange = !showChange">
          <PencilLine :size="13" aria-hidden="true" />
          Email salah? Ganti alamat email
        </button>

        <form v-if="showChange" class="change-form" novalidate @submit.prevent="handleChangeEmail">
          <FormField
            id="verification-new-email"
            v-model="newEmail"
            label="Email baru"
            type="email"
            autocomplete="email"
            :error="changeError"
            required
          />
          <button type="submit" class="btn-submit-blue" :disabled="changing">
            <Loader2 v-if="changing" class="spin" :size="16" aria-hidden="true" />
            <span v-else>SIMPAN &amp; KIRIM KODE BARU</span>
          </button>
          <p class="change-hint">
            Gunakan email yang benar-benar bisa kamu akses. Kode verifikasi baru akan dikirim ke
            sana.
          </p>
        </form>
      </div>
    </template>

    <div v-else class="verify-empty">
      <p>Sesi verifikasi tidak ditemukan atau sudah kedaluwarsa.</p>
      <router-link :to="{ name: 'Login' }" class="btn-submit-blue verify-login-link">
        MASUK UNTUK MEMINTA KODE BARU
      </router-link>
    </div>

    <p class="verify-footnote">
      Sudah verifikasi?
      <router-link :to="{ name: 'Login' }" class="auth-link font-bold">Masuk di sini</router-link>
    </p>
  </AuthShell>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowRight, Loader2, MailCheck, PencilLine } from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { api } from '../api';
import { toast } from '../composables/useToast';
import { useAuthStore } from '../stores/authStore';
import { clearVerification, readVerification, saveVerification } from '../utils/emailVerification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const ticket = ref('');
const email = ref('');
const otp = ref('');
const otpError = ref('');
const errorMessage = ref('');
const notice = ref('');
const verifying = ref(false);
const resending = ref(false);
const remaining = ref(0);
const showChange = ref(false);
const newEmail = ref('');
const changeError = ref('');
const changing = ref(false);

let countdownTimer = null;

function startCountdown(seconds = 60) {
  if (countdownTimer) clearInterval(countdownTimer);
  remaining.value = Math.max(0, Number(seconds) || 0);
  if (!remaining.value) return;
  countdownTimer = setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1);
    if (remaining.value === 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

function applyTicket(data = {}) {
  if (data.ticket) ticket.value = data.ticket;
  if (data.email) email.value = data.email;
  if (ticket.value && email.value) {
    saveVerification({
      ticket: ticket.value,
      email: email.value,
      email_sent: data.email_sent,
      needs_send: data.needs_send,
    });
  }
}

/**
 * Ticket dari OAuth callback dikirim lewat fragment agar tidak tercatat di
 * server/referrer. Baca lalu segera hapus dari URL.
 */
function readHashVerification() {
  if (typeof window === 'undefined') return { ticket: '', email: '' };
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return { ticket: '', email: '' };
  const params = new URLSearchParams(raw);
  return {
    ticket: params.get('ticket') || '',
    email: params.get('email') || '',
  };
}

function clearHashVerification() {
  if (typeof window === 'undefined') return;
  try {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`,
    );
  } catch {
    // ignore
  }
}

function handleExpiredTicket(err) {
  if (err?.data?.code !== 'INVALID_VERIFICATION_TICKET') return false;
  clearVerification();
  ticket.value = '';
  email.value = '';
  errorMessage.value =
    'Sesi verifikasi sudah kedaluwarsa. Silakan masuk lagi untuk meminta kode baru.';
  toast.error(errorMessage.value);
  return true;
}

function goHome(user) {
  const role = user?.role;
  if (role === 'Super Admin') return router.push('/super-admin');
  if (role === 'Base Admin') {
    const hasBase = (user?.managedBases?.length ?? 0) > 0;
    return router.push(hasBase ? '/base-admin' : '/onboarding/base');
  }
  return router.push('/feed');
}

async function handleVerify() {
  if (verifying.value) return;
  errorMessage.value = '';
  otpError.value = '';
  const code = String(otp.value || '').replace(/\D/g, '');
  if (code.length !== 6) {
    otpError.value = 'Masukkan 6 digit kode OTP dari email.';
    return;
  }

  verifying.value = true;
  try {
    const result = await api.verifyEmail({ ticket: ticket.value, otp: code });
    if (!result?.token) throw new Error('Server tidak mengembalikan sesi login. Coba lagi.');
    authStore.setSession(result);
    clearVerification();
    toast.success('Email berhasil diverifikasi. Selamat datang!');
    await goHome(authStore.user);
  } catch (err) {
    if (!handleExpiredTicket(err)) {
      errorMessage.value = err?.message || 'Verifikasi gagal. Coba lagi.';
      toast.error(errorMessage.value);
      if (err?.data?.code === 'OTP_EXPIRED') {
        startCountdown(0);
      }
    }
  } finally {
    verifying.value = false;
  }
}

async function handleResend() {
  if (resending.value || remaining.value > 0 || !ticket.value) return;
  errorMessage.value = '';
  resending.value = true;
  try {
    const result = await api.resendEmailVerification({ ticket: ticket.value });
    applyTicket({
      ticket: result?.verification_ticket || ticket.value,
      email: result?.email || email.value,
      email_sent: result?.email_sent,
    });
    notice.value = result?.email_sent
      ? 'Kode OTP baru sudah dikirim. Periksa inbox dan folder spam.'
      : 'Email belum berhasil dikirim. Coba lagi beberapa saat lagi.';
    if (result?.email_sent) toast.success(notice.value);
    else toast.warning(notice.value);
    startCountdown(60);
  } catch (err) {
    if (!handleExpiredTicket(err)) {
      errorMessage.value = err?.message || 'Gagal mengirim ulang kode OTP.';
      toast.error(errorMessage.value);
      if (err?.status === 429) startCountdown(60);
    }
  } finally {
    resending.value = false;
  }
}

async function handleChangeEmail() {
  if (changing.value) return;
  errorMessage.value = '';
  changeError.value = '';
  const nextEmail = String(newEmail.value || '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    changeError.value = 'Masukkan alamat email yang valid.';
    return;
  }

  changing.value = true;
  try {
    const result = await api.changeVerificationEmail({
      ticket: ticket.value,
      new_email: nextEmail,
    });
    applyTicket({
      ticket: result?.verification_ticket || ticket.value,
      email: result?.email || nextEmail,
      email_sent: result?.email_sent,
    });
    email.value = result?.email || nextEmail;
    newEmail.value = '';
    showChange.value = false;
    otp.value = '';
    notice.value = result?.email_sent
      ? 'Email berhasil diganti. Kode OTP baru sudah dikirim ke alamat tersebut.'
      : 'Email berhasil diganti. Tunggu sebentar, lalu klik kirim ulang kode untuk mendapat OTP baru.';
    toast.success(notice.value);
    startCountdown(60);
  } catch (err) {
    if (!handleExpiredTicket(err)) {
      changeError.value = err?.message || 'Gagal mengganti email. Coba lagi.';
      toast.error(changeError.value);
    }
  } finally {
    changing.value = false;
  }
}

onMounted(async () => {
  const queryTicket = typeof route.query.ticket === 'string' ? route.query.ticket : '';
  const queryEmail = typeof route.query.email === 'string' ? route.query.email : '';
  const hash = readHashVerification();
  const saved = readVerification();

  const externalTicket = queryTicket || hash.ticket;
  const externalEmail = queryEmail || hash.email;

  if (externalTicket) {
    applyTicket({
      ticket: externalTicket,
      email: externalEmail || saved?.email || '',
      email_sent: route.query.sent !== '0',
    });
  } else if (saved?.ticket && saved?.email) {
    applyTicket(saved);
  }

  if (hash.ticket) clearHashVerification();

  if (route.query.sent === '0') {
    // Backend tetap menyimpan lastSentAt walau pengiriman gagal, jadi tombol
    // resend harus menunggu cooldown yang sama.
    startCountdown(60);
    notice.value =
      'Email verifikasi belum berhasil dikirim. Tunggu sebentar, lalu klik “Kirim ulang kode OTP”.';
  } else if (ticket.value) {
    if (!externalTicket && saved?.needs_send) {
      // Sesi lama yang diblokir middleware belum mengirim OTP; minta sekali.
      await handleResend();
    } else {
      startCountdown(60);
      if (!externalTicket && saved?.email_sent === false) {
        notice.value =
          'Jika email verifikasi belum kamu terima, tunggu sebentar lalu kirim ulang kode OTP.';
      }
    }
  }
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
.verify-head {
  text-align: center;
  margin-bottom: 20px;
}

.verify-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 12px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: var(--brand-blue);
  background: color-mix(in srgb, var(--brand-blue) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-blue) 24%, transparent);
}

.verify-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--text-main);
}

.verify-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
}

.verify-desc strong {
  color: var(--text-main);
}

:deep(#verification-otp) {
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.42em;
  padding-left: 0.42em;
}

.resend-row {
  margin-top: 14px;
  text-align: center;
}

.resend-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.resend-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.change-email {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px dashed var(--border-subtle);
}

.change-toggle {
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12.5px;
}

.change-form {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-hint {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--text-muted);
}

.verify-empty {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.verify-login-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.verify-footnote {
  margin: 20px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 380px) {
  .verify-title {
    font-size: 20px;
  }

  .verify-desc {
    font-size: 12.5px;
  }

  :deep(#verification-otp) {
    font-size: 20px;
    letter-spacing: 0.3em;
    padding-left: 0.3em;
  }
}
</style>
