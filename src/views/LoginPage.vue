<template>
  <AuthShell logo-word="CONFESS" subtitle="Masuk ke Akun Base & Portal Admin">
    <!-- Role quick-switcher -->
    <div class="role-selector-pills" role="radiogroup" aria-label="Pilih peran masuk">
      <button
        v-for="role in ROLES"
        :key="role"
        type="button"
        role="radio"
        :aria-checked="selectedRole === role"
        :class="['role-pill-btn', selectedRole === role ? roleClass(role) : '']"
        @click="selectedRole = role"
      >
        {{ role === 'User' ? 'User / Anon' : role }}
      </button>
    </div>

    <!-- What this role gets -->
    <div class="role-banner mb-4" :class="bannerClass">
      <span class="role-banner__icon" aria-hidden="true">
        <component :is="bannerIcon" :size="18" :stroke-width="2.2" />
      </span>
      <div>
        <div class="role-banner__title">{{ roleBannerTitle }}</div>
        <div class="role-banner__desc">{{ roleBannerDesc }}</div>
      </div>
    </div>

    <form class="auth-form" novalidate @submit.prevent="handleLogin">
      <FormField
        id="login-identifier"
        v-model="form.values.identifier"
        label="Email atau Username Base"
        placeholder="contoh: alexdev@base.eth"
        autocomplete="username"
        required
        :error="fieldError('identifier')"
        @blur="touch('identifier')"
      />

      <FormField
        id="login-password"
        v-model="form.values.password"
        label="Kata Sandi"
        type="password"
        placeholder="••••••••••••"
        autocomplete="current-password"
        required
        :error="fieldError('password')"
        @blur="touch('password')"
      >
        <template #aside>
          <a href="#" class="auth-link text-xs font-bold">Lupa Sandi?</a>
        </template>
      </FormField>

      <p v-if="form.submitError" class="form-alert" role="alert">
        {{ form.submitError }}
      </p>

      <button type="submit" class="btn-submit-blue mt-2" :disabled="form.submitting">
        <Loader2 v-if="form.submitting" class="spin" :size="16" aria-hidden="true" />
        <template v-else>
          MASUK SEBAGAI {{ selectedRole.toUpperCase() }}
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </button>
    </form>

    <div class="auth-divider" role="separator">
      <span>ATAU MASUK DENGAN</span>
    </div>

    <div class="social-login">
      <button type="button" class="btn-google" @click="handleGoogleLogin">
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
        <span>Lanjutkan dengan Google</span>
      </button>
    </div>

    <p class="auth-footer mt-6 text-xs text-muted">
      Belum punya akun Base?
      <router-link :to="registerTarget" class="auth-link font-bold"
        >Buat Akun Base Confess</router-link
      >
    </p>
  </AuthShell>
</template>

<script setup>
/**
 * LoginPage — sign-in screen.
 * • Layout/branding come from <AuthShell>/<AuthLogo>.
 * • Field markup comes from <FormField>.
 * • Validation lives in useValidatedForm (not in this component).
 */
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowRight, Loader2, ShieldCheck, UserRound } from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { useAuthStore } from '../stores/authStore';
import { useValidatedForm, rules } from '../composables/useValidatedForm';

const ROLES = ['User', 'Base Admin'];

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const selectedRole = ref('User');

/**
 * Return the user to the page that triggered the login, but only allow
 * same-origin paths (`/feed`, `/profile`, …) — never `//evil.com`.
 */
function safeRedirect() {
  const target = route.query.redirect;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : null;
}

/* ---------- validation ---------- */
const form = useValidatedForm({
  identifier: {
    initial: 'user@base.eth',
    rules: [rules.required(), rules.minLength(3, 'Minimal 3 karakter')],
  },
  password: {
    initial: 'password123',
    rules: [rules.required(), rules.minLength(8, 'Minimal 8 karakter')],
  },
});

const touch = (name) => {
  form.touched[name] = true;
  form.validateField(name);
};

/** Show an error only after the field has been touched. */
const fieldError = (name) => (form.touched[name] ? form.errors[name] : '');

/* ---------- role banner ---------- */
const roleBannerTitle = computed(() =>
  selectedRole.value === 'Base Admin' ? 'Portal Admin Base' : 'Pengirim Anonim & User',
);

const roleBannerDesc = computed(() =>
  selectedRole.value === 'Base Admin'
    ? 'Kelola & moderasi postingan confession serta statistik komunitas.'
    : 'Kirim confession anonim, beri tanggapan & kumpulkan poin reward.',
);

const bannerClass = computed(() =>
  selectedRole.value === 'Base Admin' ? 'role-banner--mod' : 'role-banner--user',
);

const bannerIcon = computed(() => (selectedRole.value === 'Base Admin' ? ShieldCheck : UserRound));

const roleClass = (role) => (role === 'User' ? 'active-user' : 'active-mod');

/* ---------- actions ---------- */
function redirectRole(role) {
  const target = safeRedirect();
  if (target) return router.push(target);
  router.push(role === 'Base Admin' ? '/base-admin' : '/feed');
}

async function handleLogin() {
  const ok = await form.submit(() => authStore.login(selectedRole.value));
  if (ok) redirectRole(selectedRole.value);
}

function handleGoogleLogin() {
  authStore.login(selectedRole.value);
  redirectRole(selectedRole.value);
}

/** Deep-link to register still has to honour the original destination. */
const registerTarget = computed(() => ({ path: '/register', query: route.query }));
</script>

<style scoped>
/* ---------- role picker ---------- */
.role-selector-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 16px;
}

.role-pill-btn {
  border: none;
  background: transparent;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-muted);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.role-pill-btn.active-user {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  box-shadow: 0 4px 12px var(--neon-blue-glow);
}

.role-pill-btn.active-mod {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
  box-shadow: 0 4px 12px rgba(112, 0, 255, 0.3);
}

/* ---------- role banner ---------- */
.role-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  /* Fallback for browsers without color-mix() */
  background: var(--bg-surface-2);
  background: color-mix(in srgb, currentColor 12%, transparent);
  border: 1px solid var(--border-subtle);
  border-color: color-mix(in srgb, currentColor 28%, transparent);
}

.role-banner--user {
  color: var(--brand-blue);
}
.role-banner--mod {
  color: var(--shell-sub-accent);
}

.role-banner__icon {
  display: flex;
  flex-shrink: 0;
}

.role-banner__title {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.role-banner__desc {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.85;
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

/* ---------- divider & social ---------- */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-subtle);
}

.auth-divider span {
  padding: 0 10px;
}

.social-login {
  display: flex;
  justify-content: center;
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: 14px;
  padding: 12px 20px;
  font-family: inherit;
  font-weight: 800;
  font-size: 14px;
  color: var(--text-main);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-google:hover {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px var(--shadow-color);
}

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

/* ---------- misc ---------- */
.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
