<template>
  <figure class="fess-chart" role="img" :aria-label="ariaLabel">
    <svg :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" class="fess-chart-svg" preserveAspectRatio="xMidYMid meet">
      <!-- Grid horizontal + label sumbu Y -->
      <g class="chart-grid">
        <line
          v-for="line in gridLines"
          :key="`grid-${line.value}`"
          :x1="PAD.left"
          :x2="VIEW_W - PAD.right"
          :y1="line.y"
          :y2="line.y"
        />
        <text
          v-for="line in gridLines"
          :key="`grid-label-${line.value}`"
          :x="PAD.left - 6"
          :y="line.y + 3.5"
          text-anchor="end"
          class="chart-axis-text"
        >
          {{ line.value }}
        </text>
      </g>

      <!-- Bar per jam -->
      <g v-for="bar in bars" :key="`bar-${bar.hour}`">
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="barW"
          :height="bar.height"
          rx="2"
          class="chart-bar"
          :class="{ 'is-peak': bar.isPeak }"
        >
          <title>{{ bar.tooltip }}</title>
        </rect>
      </g>

      <!-- Label sumbu X tiap 3 jam -->
      <text
        v-for="tick in xTicks"
        :key="`x-${tick.hour}`"
        :x="tick.x"
        :y="VIEW_H - 6"
        text-anchor="middle"
        class="chart-axis-text"
      >
        {{ tick.label }}
      </text>
    </svg>
  </figure>
</template>

<script setup>
/**
 * FessHourlyChart — histogram jumlah fess per jam (0-23, WIB).
 * Jam tersibuk ditandai warna aksen agar cepat terbaca.
 */
import { computed } from 'vue';

const props = defineProps({
  /** [{ hour: 0..23, count: 2 }] */
  hours: {
    type: Array,
    default: () => [],
  },
});

const VIEW_W = 600;
const VIEW_H = 180;
const PAD = { top: 12, right: 8, bottom: 22, left: 32 };

const plotW = VIEW_W - PAD.left - PAD.right;
const plotH = VIEW_H - PAD.top - PAD.bottom;

const slots = 24;
const slotW = plotW / slots;
const barW = Math.max(6, slotW * 0.62);

const normalized = computed(() => {
  const map = new Map((props.hours || []).map((h) => [Number(h.hour), Number(h.count) || 0]));
  return Array.from({ length: slots }, (_, hour) => ({ hour, count: map.get(hour) || 0 }));
});

const maxCount = computed(() => Math.max(0, ...normalized.value.map((h) => h.count)));

/** Langkah "cantik" agar label sumbu Y selalu bilangan bulat. */
function niceStep(max) {
  const raw = Math.max(1, max) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return Math.max(1, Math.round(multiplier * magnitude));
}

const yAxis = computed(() => {
  const max = Math.max(1, maxCount.value);
  const step = niceStep(max);
  return { max: step * 4, step };
});

const yMax = computed(() => yAxis.value.max);

const bars = computed(() =>
  normalized.value.map((item) => {
    const height = (item.count / yMax.value) * plotH;
    const peak = item.count > 0 && item.count === maxCount.value;
    return {
      hour: item.hour,
      count: item.count,
      x: PAD.left + item.hour * slotW + (slotW - barW) / 2,
      y: PAD.top + plotH - height,
      height: Math.max(item.count > 0 ? 2 : 0, height),
      isPeak: peak,
      tooltip: `Pukul ${String(item.hour).padStart(2, '0')}.00: ${item.count} fess`,
    };
  }),
);

const gridLines = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: PAD.top + plotH * (1 - ratio),
    value: Math.round(yMax.value * ratio),
  })),
);

const xTicks = computed(() =>
  [0, 3, 6, 9, 12, 15, 18, 21].map((hour) => ({
    hour,
    x: PAD.left + hour * slotW + slotW / 2,
    label: String(hour).padStart(2, '0'),
  })),
);

const ariaLabel = computed(() => {
  const total = normalized.value.reduce((sum, h) => sum + h.count, 0);
  const peak = normalized.value.find((h) => h.count > 0 && h.count === maxCount.value);
  return peak
    ? `Histogram jam pembuatan fess: total ${total} fess, jam tersibuk ${peak.hour}.00.`
    : 'Histogram jam pembuatan fess: belum ada data.';
});
</script>

<style scoped>
.fess-chart {
  margin: 0;
  width: 100%;
}

.fess-chart-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.chart-grid line {
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.chart-axis-text {
  fill: var(--shell-text-muted, rgba(255, 255, 255, 0.5));
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-sans, inherit);
}

.chart-bar {
  fill: #3b82f6;
  opacity: 0.85;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    fill 0.15s ease;
}

.chart-bar:hover {
  opacity: 1;
  fill: #60a5fa;
}

.chart-bar.is-peak {
  fill: #baff00;
  opacity: 1;
}
</style>