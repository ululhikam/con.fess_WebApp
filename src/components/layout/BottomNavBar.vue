<template>
  <AppBottomNav
    :active="active"
    :unread-count="unreadCount"
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
  unreadCount: {
    type: Number,
    default: undefined,
  },
});

defineEmits(['navChange', 'openCompose']);
</script>
