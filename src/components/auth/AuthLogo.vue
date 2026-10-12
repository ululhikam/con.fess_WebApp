<template>
  <div class="auth-logo-block">
    <router-link to="/" class="auth-brand-logo" aria-label="Beranda Fess n Curious">
      <div class="auth-logo-wrap">
        <img src="/logo.png" alt="Fess n Curious Logo" class="auth-logo-img" />
        <span class="auth-bubble">
          <span class="auth-bubble__base">FESS</span>
          <span class="auth-bubble__word">{{ word }}</span>
        </span>
      </div>
    </router-link>

    <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
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
  display: inline-block;
}

.auth-logo-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.auth-logo-img {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

.auth-brand-logo:hover .auth-logo-img {
  transform: scale(1.06) rotate(-2deg);
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
</style>
