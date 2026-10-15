<template>
  <section class="lp-stats-row-container" aria-labelledby="statistik-title">
    <LandingSectionHead
      badge="REPUTASI & STATISTIK BASE"
      title="Platform Auto-Base Confession Terbesar di Indonesia"
      title-id="statistik-title"
    />

    <div class="stats-numbers-grid">
      <div v-for="stat in landingStats" :key="stat.label" class="stat-box">
        <div class="sb-num">{{ stat.value }}</div>
        <div class="sb-lbl">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * StatsSection — reputation & platform statistics row.
 */
import LandingSectionHead from './LandingSectionHead.vue';

/** Platform statistics row (static marketing copy — no backend endpoint). */
const landingStats = [
  { value: '120.4K+', label: 'Total Confession Terkirim' },
  { value: '48.2K', label: 'Pengguna Aktif Bulanan' },
  { value: '350+', label: 'Base Komunitas Terhubung' },
  { value: '0.00s', label: 'Delay Otomatisasi Post' },
];
</script>

<style scoped>
.lp-stats-row-container {
  margin-bottom: 90px;
}

.stats-numbers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 36px;
}

.stat-box {
  background: var(--bg-surface-2);
  padding: 28px 20px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
}

.sb-num {
  font-size: 32px;
  font-weight: 900;
  color: var(--brand-blue);
  margin-bottom: 6px;
}

.sb-lbl {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

@media (max-width: 992px) {
  .stats-numbers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-numbers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
