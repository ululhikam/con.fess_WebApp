<template>
  <section id="cara-kerja" class="lp-steps-section" aria-labelledby="cara-kerja-title">
    <LandingSectionHead
      class="section-head-center"
      align="center"
      badge="LANGKAH MUDAH"
      title="Cara Kerja Base Confess Engine"
      subtitle="Hanya butuh 3 langkah sederhana untuk mengirimkan pesan anonimmu ke ribuan pembaca."
      title-id="cara-kerja-title"
    />

    <div class="steps-grid">
      <article v-for="step in landingSteps" :key="step.number" class="step-card">
        <div class="step-number-badge" aria-hidden="true">{{ step.number }}</div>
        <h3 class="step-title">{{ step.title }}</h3>
        <p class="step-desc">{{ step.desc }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * HowItWorksSection — `#cara-kerja` three-step explainer.
 */
import LandingSectionHead from './LandingSectionHead.vue';
import { landingSteps } from '../../data/landingData';
</script>

<style scoped>
.lp-steps-section {
  margin-bottom: 90px;
}

.section-head-center {
  margin-bottom: 48px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.step-card {
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 28px;
  padding: 36px 28px;
  position: relative;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}

.step-card:hover {
  transform: translateY(-6px);
  border-color: var(--brand-blue);
}

.step-number-badge {
  width: 48px;
  height: 48px;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-weight: 900;
  font-size: 18px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 18px var(--neon-blue-glow);
}

.step-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: var(--text-main);
}

.step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 992px) {
  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style>
