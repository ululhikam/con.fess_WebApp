<template>
  <div class="auth-shell">
    <div class="auth-grid-overlay" aria-hidden="true" />

    <div class="auth-card-container" :style="{ maxWidth: `${maxWidth}px` }">
      <AuthLogo :word="logoWord" :subtitle="subtitle" />

      <!--
        The card hosts a <form>. `tabindex="-1"` lets us move focus into the
        card for screen readers without adding a visible focus ring.
      -->
      <section class="auth-card" aria-live="polite">
        <slot />
      </section>
    </div>
  </div>
</template>

<script setup>
/**
 * AuthShell — layout + background for the login/register screens.
 * Slicing this out means both auth views share one grid overlay, one card
 * treatment and one logo placement instead of duplicating ~80 lines of CSS.
 */
import AuthLogo from './AuthLogo.vue';

defineProps({
  logoWord: { type: String, default: 'CONFESS' },
  subtitle: { type: String, default: '' },
  maxWidth: { type: Number, default: 440 },
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background-color: var(--shell-bg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: var(--font-sans);
  color: var(--shell-text);
}

.auth-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--shell-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--shell-border) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
}

.auth-card-container {
  width: 100%;
  position: relative;
  z-index: 10;
}

.auth-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 28px;
  padding: 32px 28px;
  color: var(--text-main);
  box-shadow: 0 16px 40px var(--shadow-color);
}

@media (max-width: 640px) {
  .auth-shell {
    padding: 32px 16px;
  }
  .auth-card {
    padding: 22px 18px;
    border-radius: 20px;
  }
}
</style>
