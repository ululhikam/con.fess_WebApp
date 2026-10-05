<template>
  <section id="faq" class="lp-faq-section" aria-labelledby="faq-title">
    <LandingSectionHead
      class="faq-head"
      badge="FAQ KOMPREHENSIF"
      title="Pertanyaan Sering Diajukan"
      subtitle="Klik pada pertanyaan untuk melihat jawaban lengkap seputar Base Confess."
      title-id="faq-title"
    />

    <div class="faq-accordion">
      <div
        v-for="(faq, idx) in landingFaqs"
        :key="idx"
        class="faq-item"
        :class="{ open: openFaq === idx }"
      >
        <button
          type="button"
          class="faq-question"
          :id="`faq-btn-${idx}`"
          :aria-expanded="openFaq === idx"
          :aria-controls="`faq-panel-${idx}`"
          @click="$emit('toggle', idx)"
        >
          <span class="faq-q-text">
            <span class="faq-num" aria-hidden="true">0{{ idx + 1 }}</span>
            <span>{{ faq.q }}</span>
          </span>
          <span class="faq-icon-wrap" aria-hidden="true">
            <svg
              class="faq-chevron"
              :class="{ rotated: openFaq === idx }"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        <transition name="faq-slide">
          <div
            v-if="openFaq === idx"
            class="faq-answer"
            :id="`faq-panel-${idx}`"
            role="region"
            :aria-labelledby="`faq-btn-${idx}`"
          >
            <p>{{ faq.a }}</p>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * FaqSection — `#faq` single-open accordion.
 * Open state lives in useLanding() (page shell); this component only emits.
 */
import LandingSectionHead from './LandingSectionHead.vue';
import { landingFaqs } from '../../data/landingData';

defineProps({
  openFaq: { type: Number, default: 0 },
});

defineEmits(['toggle']);
</script>

<style scoped>
.lp-faq-section {
  margin-bottom: 90px;
}

.faq-head {
  margin-bottom: 36px;
}

.faq-accordion {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  background: var(--bg-surface-2);
  border-radius: 20px;
  padding: 22px 28px;
  border: 1.5px solid var(--border-subtle);
  transition: all 0.25s ease;
  user-select: none;
}

.faq-item:hover {
  border-color: var(--brand-blue);
  background: var(--bg-surface);
}

.faq-item.open {
  background: var(--bg-surface);
  border-color: var(--brand-blue);
  box-shadow: 0 10px 30px var(--shadow-color);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  text-align: left;
  cursor: pointer;
}

.faq-q-text {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 800;
  font-size: 16.5px;
  color: var(--text-main);
}

.faq-num {
  font-size: 14px;
  font-weight: 900;
  color: var(--brand-blue);
  background: var(--shell-chip);
  padding: 4px 10px;
  border-radius: 8px;
}

.faq-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  color: var(--brand-blue);
  transition: background 0.2s ease;
}

.faq-item.open .faq-icon-wrap {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border-color: var(--brand-blue);
}

.faq-chevron {
  transition: transform 0.3s ease;
}

.faq-chevron.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
  font-size: 14.5px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  margin-top: 0;
}
</style>
