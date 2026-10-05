<template>
  <div class="profile-stats-strip mb-8">
    <template v-for="(stat, i) in stats" :key="stat.label">
      <div class="stat-box">
        <span :class="['stat-num', `stat-num--${stat.tone}`]">{{ stat.value }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
      <div v-if="i < stats.length - 1" class="stat-divider" aria-hidden="true"></div>
    </template>
  </div>
</template>

<script setup>
/**
 * ProfileStatsStrip — the four summary numbers above the 3-column grid.
 * `stats` comes from src/composables/useProfile.js as
 * [{ label, value, tone: 'blue' | 'lime' }].
 */
defineProps({
  stats: { type: Array, default: () => [] },
});
</script>

<style scoped>
.profile-stats-strip {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 16px var(--shadow-color);
  border: 1px solid var(--border-subtle);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-num--blue {
  color: var(--brand-blue);
}

.stat-num--lime {
  color: var(--lime-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-subtle);
}

@media (max-width: 768px) {
  .profile-stats-strip {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }

  .stat-divider {
    display: none;
  }

  .stat-num {
    font-size: 20px;
  }

  .stat-label {
    font-size: 9px;
  }
}
</style>
