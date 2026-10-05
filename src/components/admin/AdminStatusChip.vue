<template>
  <span class="status-chip" :class="`status-chip--${tone}`">{{ label }}</span>
</template>

<script setup>
/**
 * AdminStatusChip — passive status pill shared by the moderation queue and
 * the platform connection list. tone: 'success' | 'warning' | 'danger'.
 */
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
  label: { type: String, default: '' },
});

const TONE_BY_STATUS = {
  published: 'success',
  approved: 'success',
  connected: 'success',
  pending: 'warning',
  rejected: 'danger',
};

const tone = computed(() => TONE_BY_STATUS[props.status] || 'success');
const label = computed(() => props.label || props.status.toUpperCase());
</script>

<style scoped>
.status-chip {
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.status-chip--success {
  background: rgba(22, 163, 74, 0.15);
  color: var(--success-text);
}

.status-chip--warning {
  background: rgba(245, 158, 11, 0.16);
  color: var(--warning-text);
}

.status-chip--danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-text);
}
</style>
