<template>
  <FessCard v-bind="$props" v-on="$listenersOrAttrs" />
</template>

<script setup>
/**
 * FeedCard.vue — Aliased wrapper to unified FessCard component.
 * Maintained for backward compatibility across feed components.
 */
import { useAttrs } from 'vue';
import FessCard from '../common/FessCard.vue';

defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const $listenersOrAttrs = useAttrs();
</script>
