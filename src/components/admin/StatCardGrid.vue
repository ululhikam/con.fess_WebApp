<template>
  <div class="stat-grid">
    <article v-for="stat in stats" :key="stat.key || stat.label" class="stat-card">
      <span class="stat-title">{{ stat.label }}</span>
      <span class="stat-value" :class="`stat-value--${stat.accent || 'plain'}`">{{
        stat.value
      }}</span>
      <span v-if="stat.hint" class="stat-hint mt-1 text-xs text-muted">{{ stat.hint }}</span>
    </article>
  </div>
</template>

<script setup>
/**
 * StatCardGrid — responsive row of KPI cards, used by both dashboards.
 * Colours come from the design tokens; `accent` picks the decorative tone.
 */
defineProps({
  stats: {
    type: Array,
    default: () => [],
    // each: { key?, label, value, hint?, accent?: 'blue'|'lime'|'pink'|'plain' }
  },
});
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px var(--shadow-color);
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: var(--text-main);
}

.stat-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-value {
  font-size: 26px;
  font-weight: 900;
  line-height: 1.2;
}

.stat-value--blue {
  color: var(--brand-blue);
}
.stat-value--lime {
  color: var(--lime-primary);
}
.stat-value--pink {
  color: var(--cyber-pink);
}
.stat-value--plain {
  color: var(--text-main);
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>
