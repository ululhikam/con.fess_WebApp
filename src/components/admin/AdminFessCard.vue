<template>
  <FessCard v-bind="$props" :is-admin="true" v-on="$attrs" />
</template>

<script setup>
/**
 * AdminFessCard.vue — Aliased wrapper to unified FessCard component.
 * Automatically enables admin moderation actions (Setujui / Tolak).
 */
import FessCard from '../common/FessCard.vue';

defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});
</script>
