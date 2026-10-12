<template>
  <AppBottomNav
    :active="active || activeTab"
    :unread-count="unreadCount"
    @navChange="$emit('navChange', $event)"
    @changeTab="$emit('changeTab', $event)"
    @openCompose="$emit('openCompose')"
  />
</template>

<script setup>
/**
 * BaseAdminBottomNav.vue — Aliased wrapper to unified AppBottomNav component.
 */
import AppBottomNav from '../common/AppBottomNav.vue';

defineProps({
  active: {
    type: String,
    default: '',
  },
  activeTab: {
    type: String,
    default: 'home',
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

defineEmits(['navChange', 'changeTab', 'openCompose']);
</script>
