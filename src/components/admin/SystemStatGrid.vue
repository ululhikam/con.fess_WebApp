<template>
  <!-- The four global system gauges of the Super Admin dashboard. -->
  <StatCardGrid :stats="SYSTEM_STATS" />
</template>

<script setup>
import StatCardGrid from './StatCardGrid.vue';
import { SYSTEM_STATS } from '../../data/adminData';
</script>
