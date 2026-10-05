<template>
  <AuthShell logo-word="CLUB" subtitle="Create your Base Account & Join Creator Engine">
    <h1 class="auth-card-title text-center">Create Base Account</h1>
    <p class="auth-card-desc text-center text-xs text-muted mb-6">
      Join thousands of creators sending confessions &amp; earning $CLUB
    </p>

    <form class="auth-form" novalidate @submit.prevent="handleRegister">
      <FormField
        id="register-handle"
        v-model="form.values.handle"
        label="Desired Creator Handle / Alias"
        placeholder="e.g. @anon_creator"
        autocomplete="username"
        required
        :error="fieldError('handle')"
        :hint="form.values.handle ? handleHint : ''"
        @blur="touch('handle')"
      />

      <FormField
        id="register-email"
        v-model="form.values.email"
        label="Email Address"
        type="email"
        placeholder="creator@baseclub.eth"
        autocomplete="email"
        required
        :error="fieldError('email')"
        @blur="touch('email')"
      />

      <FormField
        id="register-password"
        v-model="form.values.password"
        label="Password"
        type="password"
        placeholder="••••••••••••"
        autocomplete="new-password"
        required
        hint="Minimal 8 karakter"
        :error="fieldError('password')"
        @blur="touch('password')"
      />

      <!-- Live strength meter: gives feedback instead of only rejecting -->
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

      <p v-if="form.submitError" class="form-alert" role="alert">
        {{ form.submitError }}
      </p>

      <button type="submit" class="btn-submit-lime mt-2" :disabled="form.submitting">
        <Loader2 v-if="form.submitting" class="spin" :size="16" aria-hidden="true" />
        <template v-else>
          CREATE ACCOUNT &amp; ENTER BASE
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </button>
    </form>

    <p class="auth-footer mt-6 text-xs text-muted">
      Already have an account?
      <router-link :to="loginTarget" class="auth-link font-bold">Log in here</router-link>
    </p>
  </AuthShell>
</template>

<script setup>
/**
 * RegisterPage — sign-up screen.
 * Shares <AuthShell>/<FormField> with LoginPage; validation and submit
 * lifecycle come from useValidatedForm so neither view reimplements them.
 */
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowRight, Loader2 } from 'lucide-vue-next';

import AuthShell from '../components/auth/AuthShell.vue';
import FormField from '../components/auth/FormField.vue';
import { useAuthStore } from '../stores/authStore';
import { useValidatedForm, rules } from '../composables/useValidatedForm';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

/** Only same-origin paths may be used as a post-auth destination. */
function safeRedirect() {
  const target = route.query.redirect;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : null;
}

/** Keep the original destination when hopping back to the login screen. */
const loginTarget = computed(() => ({ path: '/login', query: route.query }));

const form = useValidatedForm({
  handle: {
    initial: '',
    rules: [rules.required('Alias wajib diisi'), rules.minLength(3, 'Minimal 3 karakter')],
  },
  email: {
    initial: '',
    rules: [rules.required('Email wajib diisi'), rules.email()],
  },
  password: {
    initial: '',
    rules: [rules.required('Sandi wajib diisi'), rules.minLength(8, 'Minimal 8 karakter')],
  },
});

const touch = (name) => {
  form.touched[name] = true;
  form.validateField(name);
};

const fieldError = (name) => (form.touched[name] ? form.errors[name] : '');

const handleHint = computed(() =>
  form.values.handle.startsWith('@')
    ? 'Bagus — awalan @ akan ditambahkan otomatis.'
    : 'Boleh tanpa @.',
);

/** Rough 0-4 strength score — pure, so it can be unit tested. */
const strength = computed(() => {
  const value = form.values.password;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (!value) score = 0;

  const labels = ['Kosong', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat'];
  return { score, label: labels[score], level: Math.max(0, score - 1) };
});

async function handleRegister() {
  const ok = await form.submit(() => authStore.login('User'));
  if (!ok) return;
  router.push(safeRedirect() ?? '/feed');
}
</script>

<style scoped>
.auth-card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: var(--text-main);
}

.auth-card-desc {
  margin: 4px 0 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---------- password strength ---------- */
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

/* ---------- alerts ---------- */
.form-alert {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
  font-size: 12.5px;
  font-weight: 600;
}

/* ---------- submit ---------- */
.btn-submit-lime {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--lime-primary);
  color: var(--lime-ink);
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
    opacity 0.15s ease;
  box-shadow: 0 6px 20px var(--lime-glow);
}

.btn-submit-lime:hover:not(:disabled) {
  transform: translateY(-2px);
}
.btn-submit-lime:disabled {
  opacity: 0.6;
  cursor: progress;
}

/* ---------- footer ---------- */
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
</style>
