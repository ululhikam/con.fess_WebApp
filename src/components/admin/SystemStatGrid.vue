<template>
  <!-- The four global system gauges of the Super Admin dashboard. -->
  <StatCardGrid :stats="stats" />
</template>

<script setup>
/**
 * SystemStatGrid — presentational wrapper around StatCardGrid.
 * Gauges are derived from GET /admin/system/health by the parent view.
 */
import StatCardGrid from './StatCardGrid.vue';

defineProps({
  stats: { type: Array, default: () => [] },
});
</script>
