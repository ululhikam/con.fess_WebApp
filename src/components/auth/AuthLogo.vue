<template>
  <div class="auth-logo-block">
    <router-link to="/" class="auth-brand-logo" aria-label="Beranda Base Confess">
      <span class="auth-bubble">
        <span class="auth-bubble__base">BASE</span>
        <span class="auth-bubble__word">{{ word }}</span>
      </span>
    </router-link>

    <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>

    <div class="auth-theme-slot">
      <ThemeToggle label />
    </div>
  </div>
</template>

<script setup>
/**
 * AuthLogo — the shared brand lockup shown above every auth card.
 * The theme switch lives here so login & register stay consistent and the
 * user can preview dark/light before signing in.
 */
import ThemeToggle from '../ui/ThemeToggle.vue';

defineProps({
  /** Second word of the lockup: `CLUB` or `CONFESS`. */
  word: { type: String, default: 'CONFESS' },
  subtitle: { type: String, default: '' },
});
</script>

<style scoped>
.auth-logo-block {
  text-align: center;
  margin-bottom: 24px;
}

.auth-brand-logo {
  text-decoration: none;
}

.auth-bubble {
  background: var(--shell-text);
  color: var(--shell-bg);
  padding: 8px 20px;
  border-radius: 18px 18px 18px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 900;
  font-size: 18px;
  box-shadow: 0 8px 24px var(--shadow-color);
}

.auth-bubble__base {
  color: inherit;
}

.auth-bubble__word {
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 900;
}

.auth-subtitle {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--shell-text-muted);
  font-weight: 600;
}

.auth-theme-slot {
  display: flex;
  justify-content: center;
  margin-top: 14px;
  color: var(--shell-text);
}
</style>
