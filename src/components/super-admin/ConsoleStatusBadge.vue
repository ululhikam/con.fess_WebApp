<template>
  <span class="pc-badge" :class="`pc-badge--${resolvedTone}`">{{ displayLabel }}</span>
</template>

<script setup>
import { computed } from 'vue';
import { statusLabel, statusTone } from '../../utils/console';

const props = defineProps({
  status: { type: [String, Boolean, Number], default: '' },
  label: { type: String, default: '' },
  tone: { type: String, default: '' },
});

const resolvedTone = computed(() => props.tone || statusTone(props.status));
const displayLabel = computed(() => props.label || statusLabel(props.status));
</script>
