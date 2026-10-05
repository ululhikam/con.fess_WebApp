<template>
  <nav class="lp-nav" :class="{ scrolled: isScrolled }" aria-label="Navigasi utama">
    <div class="nav-left">
      <router-link to="/" class="nav-logo-pill">
        <span class="logo-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </span>
        <span class="logo-text">BASE <strong>CONFESS</strong></span>
      </router-link>
    </div>

    <div class="nav-center">
      <a v-for="link in landingNavLinks" :key="link.href" :href="link.href" class="nav-pill-link">
        {{ link.label }}
      </a>
    </div>

    <div class="nav-right">
      <ThemeToggle label />
      <router-link to="/login" class="nav-connect-btn">Masuk App</router-link>
    </div>
  </nav>
</template>

<script setup>
/**
 * LandingNav — sticky top navigation of the marketing page.
 * Scroll state (`isScrolled`) is owned by useLanding() in the page shell.
 */
import ThemeToggle from '../ui/ThemeToggle.vue';
import { landingNavLinks } from '../../data/landingData';

defineProps({
  isScrolled: { type: Boolean, default: false },
});
</script>

<style scoped>
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
  transition: all 0.3s ease;
}

.lp-nav.scrolled {
  background: var(--shell-header-bg);
  backdrop-filter: blur(12px);
  padding: 16px 48px;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.nav-logo-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface);
  color: var(--text-main);
  padding: 10px 20px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.3px;
}

.logo-icon {
  display: flex;
  align-items: center;
  color: var(--brand-blue);
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--shell-chip);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--shell-border-strong);
}

.nav-pill-link {
  color: var(--shell-text);
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.nav-pill-link:hover {
  background: var(--shell-border-strong);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-connect-btn {
  background: transparent;
  color: var(--shell-text);
  border: 2px solid var(--shell-text);
  padding: 10px 26px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nav-connect-btn:hover {
  background: var(--shell-text);
  color: var(--shell-bg);
}

@media (max-width: 992px) {
  .lp-nav {
    padding: 16px 20px;
  }

  .nav-center {
    display: none;
  }
}
</style>
