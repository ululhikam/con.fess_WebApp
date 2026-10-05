<template>
  <section id="fitur" class="features-trio-grid" aria-labelledby="fitur-title">
    <h2 id="fitur-title" class="visually-hidden">Fitur Utama</h2>

    <article v-for="feature in landingFeatures" :key="feature.title" class="trio-card">
      <h3 class="trio-title">{{ feature.title }}</h3>
      <p class="trio-desc">{{ feature.desc }}</p>
      <FeaturePreview :type="feature.preview" />
    </article>

    <!-- ARROW DOODLES BETWEEN CARDS (decorative artwork) -->
    <div class="trio-connector-arrow arrow-1" aria-hidden="true">
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M 10 45 Q 35 45 45 15" />
        <polyline points="32,15 45,15 45,28" />
      </svg>
    </div>

    <div class="trio-connector-arrow arrow-2" aria-hidden="true">
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M 10 40 Q 30 10 50 35" />
        <polyline points="38,32 50,35 50,22" />
      </svg>
    </div>
  </section>
</template>

<script setup>
/**
 * FeaturesSection — `#fitur` trio of feature cards.
 * Card copy lives in landingData.js, mock previews in FeaturePreview.vue.
 */
import FeaturePreview from './FeaturePreview.vue';
import { landingFeatures } from '../../data/landingData';
</script>

<style scoped>
.features-trio-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 80px;
}

.trio-card {
  background: var(--bg-page);
  border-radius: 28px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  border: 1px solid var(--border-subtle);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.trio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px var(--shadow-color);
}

.trio-title {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.trio-desc {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

/* CONNECTOR ARROWS BETWEEN CARDS */
.trio-connector-arrow {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  /* `currentColor` keeps the doodle visible on both themes (was hard-coded #000) */
  color: var(--text-secondary);
}

.arrow-1 {
  top: 50%;
  left: 31%;
  transform: translateY(-50%);
}

.arrow-2 {
  bottom: 25%;
  left: 64%;
}

@media (max-width: 992px) {
  .features-trio-grid {
    grid-template-columns: 1fr;
  }

  .trio-connector-arrow {
    display: none;
  }
}
</style>
