<template>
  <figure class="fess-chart" role="img" :aria-label="ariaLabel">
    <svg :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" class="fess-chart-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#baff00" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#baff00" stop-opacity="0" />
        </linearGradient>
      </defs>

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

      <!-- Area + garis tren -->
      <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />
      <path v-if="linePath" :d="linePath" class="chart-line" />

      <!-- Titik data + tooltip -->
      <g v-for="point in coords" :key="`pt-${point.label}`">
        <circle :cx="point.x" :cy="point.y" r="6" class="chart-dot-hit">
          <title>{{ point.tooltip }}</title>
        </circle>
        <circle :cx="point.x" :cy="point.y" r="2.6" class="chart-dot" />
      </g>

      <!-- Label sumbu X -->
      <text
        v-for="tick in xLabels"
        :key="`x-${tick.key}`"
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
 * FessTrendChart — grafik area/garis jumlah fess per tanggal.
 * SVG murni (tanpa library chart) agar ringan & konsisten dengan tema gelap.
 */
import { computed } from 'vue';

const props = defineProps({
  /** [{ label: '27 Okt', tooltip: '27 Okt 2026: 3 fess', value: 3 }] */
  points: {
    type: Array,
    default: () => [],
  },
});

const VIEW_W = 600;
const VIEW_H = 200;
const PAD = { top: 14, right: 10, bottom: 24, left: 32 };

const plotW = VIEW_W - PAD.left - PAD.right;
const plotH = VIEW_H - PAD.top - PAD.bottom;

const gradientId = `fess-trend-${Math.random().toString(36).slice(2, 8)}`;

const values = computed(() => props.points.map((p) => Number(p.value) || 0));

/** Langkah "cantik" agar label sumbu Y selalu bilangan bulat. */
function niceStep(max) {
  const raw = Math.max(1, max) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return Math.max(1, Math.round(multiplier * magnitude));
}

const yAxis = computed(() => {
  const max = Math.max(1, ...values.value);
  const step = niceStep(max);
  return { max: step * 4, step };
});

const yMax = computed(() => yAxis.value.max);

const coords = computed(() => {
  const total = props.points.length;
  return props.points.map((point, index) => {
    const value = Number(point.value) || 0;
    const x =
      total > 1 ? PAD.left + (plotW * index) / (total - 1) : PAD.left + plotW / 2;
    const y = PAD.top + plotH - (value / yMax.value) * plotH;
    return { x, y, label: point.label, tooltip: point.tooltip || point.label, value };
  });
});

const linePath = computed(() =>
  coords.value
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' '),
);

const areaPath = computed(() => {
  if (!coords.value.length) return '';
  const bottom = PAD.top + plotH;
  const first = coords.value[0];
  const last = coords.value[coords.value.length - 1];
  return `${linePath.value} L${last.x.toFixed(1)},${bottom} L${first.x.toFixed(1)},${bottom} Z`;
});

const gridLines = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: PAD.top + plotH * (1 - ratio),
    value: Math.round(yMax.value * ratio),
  })),
);

/** Batasi jumlah label X agar tidak bertumpuk. */
const xLabels = computed(() => {
  const total = coords.value.length;
  if (!total) return [];
  const maxLabels = 7;
  const step = Math.max(1, Math.ceil(total / maxLabels));
  const picked = coords.value.filter(
    (_, index) => index % step === 0 || index === total - 1,
  );
  return picked.map((c) => ({ key: c.label, label: c.label, x: c.x }));
});

const ariaLabel = computed(() => {
  const total = values.value.reduce((sum, v) => sum + v, 0);
  return `Grafik jumlah fess per tanggal: total ${total} fess dalam ${props.points.length} hari.`;
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

.chart-line {
  fill: none;
  stroke: #baff00;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot-hit {
  fill: transparent;
  cursor: pointer;
}

.chart-dot {
  fill: #baff00;
  stroke: #14141c;
  stroke-width: 1;
  transition: r 0.12s ease;
}

.chart-dot-hit:hover + .chart-dot {
  r: 4;
}
</style>