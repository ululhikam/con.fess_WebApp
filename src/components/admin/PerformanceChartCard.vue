<template>
  <AdminCard :title="chart.title" :description="chart.description">
    <div class="chart-placeholder p-6 rounded-xl border">
      <div class="chart-bars border-b">
        <span
          v-for="(bar, index) in chart.bars"
          :key="index"
          class="chart-bar"
          :class="`chart-bar--${bar.tone}`"
          :style="{ height: bar.height }"
        />
      </div>
      <span class="chart-caption mt-3 text-xs font-semibold text-muted">{{ chart.caption }}</span>
    </div>
  </AdminCard>
</template>

<script setup>
/**
 * PerformanceChartCard — decorative 24h traffic bars for the overview tab.
 * Bar tones are intentional accents, mapped to brand tokens.
 */
import AdminCard from './AdminCard.vue';

defineProps({
  chart: {
    type: Object,
    required: true,
    // { title, description, caption, bars: [{ height, tone }] }
  },
});
</script>

<style scoped>
.chart-placeholder {
  background: var(--bg-surface-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-bars {
  width: 100%;
  height: 128px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 0;
}

.chart-bar {
  width: 100%;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.chart-bar--blue {
  background: var(--brand-blue);
}
.chart-bar--lime {
  background: var(--lime-primary);
}
</style>
