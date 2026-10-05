<template>
  <header
    class="section-head"
    :class="{ 'section-head--center': align === 'center', 'section-head--row': row }"
  >
    <div class="section-head__main">
      <span v-if="badge" class="section-badge">{{ badge }}</span>
      <h2 class="section-title" :id="titleId || null">{{ title }}</h2>
      <p v-if="subtitle" class="section-subtext">{{ subtitle }}</p>
    </div>

    <div v-if="row" class="section-head__action">
      <slot />
    </div>
  </header>
</template>

<script setup>
/**
 * LandingSectionHead — shared badge + h2 (+ optional subtitle / action)
 * header used by the marketing sections so heading markup stays consistent.
 *
 * Vertical spacing between sections is owned by each section: pass a class
 * through (e.g. class="faq-head") and define the margin there.
 */
defineProps({
  badge: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** `center` centres the block (used by the steps section). */
  align: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'center'].includes(v),
  },
  /** Renders the action slot on the right, aligned to the baseline. */
  row: { type: Boolean, default: false },
  /** Optional id for the h2 so the section can use aria-labelledby. */
  titleId: { type: String, default: '' },
});
</script>

<style scoped>
.section-badge {
  display: inline-block;
  background: var(--shell-chip);
  color: var(--brand-blue);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.section-title {
  font-family: var(--font-sans);
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.25;
  margin: 0;
  color: var(--text-main);
}

.section-subtext {
  font-size: 15px;
  color: var(--text-muted);
  margin-top: 8px;
  line-height: 1.5;
}

.section-head--center {
  text-align: center;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

.section-head--row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.section-head__action {
  flex-shrink: 0;
}
</style>
