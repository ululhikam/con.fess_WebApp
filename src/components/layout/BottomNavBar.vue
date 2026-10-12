<template>
  <AppBottomNav
    :active="active"
    @navChange="$emit('navChange', $event)"
    @openCompose="$emit('openCompose')"
  />
</template>

<script setup>
/**
 * BottomNavBar.vue — Aliased wrapper to unified AppBottomNav component.
 */
import AppBottomNav from '../common/AppBottomNav.vue';

defineProps({
  active: {
    type: String,
    default: 'home',
  },
});

defineEmits(['navChange', 'openCompose']);
</script>
