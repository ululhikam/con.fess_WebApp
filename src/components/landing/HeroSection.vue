<template>
  <section class="lp-hero">
    <!-- Grid background overlay -->
    <div class="hero-grid-bg" aria-hidden="true"></div>

    <LandingNav :is-scrolled="isScrolled" />

    <!-- First-section loading / error gate -->
    <ContentSkeleton v-if="loading" class="hero-state" type="page" label="Memuat halaman…" />

    <AppStateView
      v-else-if="error"
      class="hero-state"
      variant="error"
      title="Halaman gagal dimuat"
      description="Terjadi kesalahan saat memuat halaman. Coba muat ulang."
      action-label="Coba lagi"
      @action="$emit('retry')"
    />

    <!-- HERO CONTAINER & MAIN TYPOGRAPHY -->
    <div v-else class="hero-main">
      <h1 class="hero-title-wrap">
        <span class="hero-title-line">#CONFESS</span>
        <span class="hero-title-line">AUTO POST</span>
        <span class="hero-title-line">BASE</span>
      </h1>

      <HeroFloaters />
    </div>
  </section>
</template>

<script setup>
/**
 * HeroSection — branded blue hero: grid backdrop, sticky nav, headline and
 * the page's first-section skeleton / error state.
 */
import LandingNav from './LandingNav.vue';
import HeroFloaters from './HeroFloaters.vue';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

defineProps({
  isScrolled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
});

defineEmits(['retry']);
</script>

<style scoped>
.lp-hero {
  position: relative;
  background: var(--shell-bg);
  padding-bottom: 80px;
  overflow: hidden;
}

/* Grid background overlay */
.hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--shell-border-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--shell-border-strong) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 1;
}

/* Skeleton / error state sits where the hero body would be */
.hero-state {
  position: relative;
  z-index: 2;
  max-width: 1160px;
  margin: 48px auto 0;
  padding: 0 24px;
}

/* HERO MAIN BODY */
.hero-main {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 0 24px;
  text-align: center;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* MASSIVE TYPOGRAPHY */
.hero-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.02;
  user-select: none;
}

.hero-title-line {
  font-family: var(--font-sans);
  font-size: clamp(64px, 10.5vw, 132px);
  font-weight: 900;
  letter-spacing: -1.5px;
  color: var(--shell-text);
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 12px 36px var(--shadow-color);
  font-stretch: normal;
}

@media (max-width: 992px) {
  .hero-title-line {
    font-size: 72px;
  }
}

@media (max-width: 600px) {
  .hero-title-line {
    font-size: 48px;
  }
}
</style>
