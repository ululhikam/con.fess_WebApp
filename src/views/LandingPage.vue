<template>
  <div class="lp-root">
    <!-- First section: sticky nav + hero (also owns the skeleton / error gate) -->
    <HeroSection :is-scrolled="isScrolled" :loading="loading" :error="error" @retry="reload" />

    <!-- Marketing sections, revealed once the page has loaded -->
    <section v-if="!loading && !error" class="lp-white-section">
      <div class="white-container">
        <FeaturesSection />
        <HowItWorksSection />
        <CommunitySection />
        <StatsSection />
        <FaqSection :open-faq="openFaq" @toggle="toggleFaq" />
        <CtaSection />
        <SiteFooter />
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * LandingPage — thin shell for the marketing page.
 *
 * Slicing:
 *  • sections live in  src/components/landing/*
 *  • static content in src/data/landingData.js
 *  • scroll + FAQ accordion behaviour in src/composables/useLanding.js
 *  • initial load (skeleton / error) via useAsyncData
 */
import HeroSection from '../components/landing/HeroSection.vue';
import FeaturesSection from '../components/landing/FeaturesSection.vue';
import HowItWorksSection from '../components/landing/HowItWorksSection.vue';
import CommunitySection from '../components/landing/CommunitySection.vue';
import StatsSection from '../components/landing/StatsSection.vue';
import FaqSection from '../components/landing/FaqSection.vue';
import CtaSection from '../components/landing/CtaSection.vue';
import SiteFooter from '../components/landing/SiteFooter.vue';

import { useLanding } from '../composables/useLanding';
import { useAsyncData } from '../composables/useAsyncData';

/* Shared page behaviour (sticky nav + FAQ accordion). */
const { isScrolled, openFaq, toggleFaq } = useLanding();

/* Stand-in initial fetch — short delay so the skeleton is visible without
   slowing a marketing page down. Swap the fetcher for a real request. */
const { loading, error, reload } = useAsyncData(
  async () => {
    await Promise.resolve();
    return true;
  },
  { delay: 400 },
);
</script>

<style scoped>
.lp-root {
  min-height: 100vh;
  background: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  overflow-x: hidden;
}

/* LOWER SECTION (SHELL-COLOURED CONTAINER WITH ROUNDED TOP CORNERS) */
.lp-white-section {
  position: relative;
  z-index: 10;
  background: var(--bg-surface);
  color: var(--text-main);
  border-radius: 48px 48px 0 0;
  padding: 60px 48px 80px;
  box-shadow: 0 -20px 40px var(--shadow-color);
  margin-top: -20px;
}

.white-container {
  max-width: 1160px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .lp-white-section {
    padding: 40px 20px;
    border-radius: 32px 32px 0 0;
  }
}
</style>
