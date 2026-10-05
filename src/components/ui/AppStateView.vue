<template>
  <div class="state-view" :class="`state-view--${variant}`" role="status">
    <span class="state-view__icon" aria-hidden="true">
      <component :is="resolvedIcon" :size="28" :stroke-width="1.6" />
    </span>

    <h3 class="state-view__title">{{ title }}</h3>
    <p v-if="description" class="state-view__desc">{{ description }}</p>

    <slot>
      <button v-if="actionLabel" type="button" class="state-view__action" @click="$emit('action')">
        {{ actionLabel }}
      </button>
    </slot>
  </div>
</template>

<script setup>
/**
 * AppStateView — one component for empty / error / offline states.
 * Keeps messaging, iconography and the recovery action in a single place.
 *
 * <AppStateView variant="error" title="Gagal memuat"
 *   description="Periksa koneksi internetmu."
 *   action-label="Coba lagi" @action="reload" />
 */
import { computed } from 'vue';
import { Inbox, TriangleAlert, WifiOff } from 'lucide-vue-next';

const VARIANT_ICONS = {
  empty: Inbox,
  error: TriangleAlert,
  offline: WifiOff,
};

const props = defineProps({
  variant: {
    type: String,
    default: 'empty',
    validator: (v) => ['empty', 'error', 'offline'].includes(v),
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
});

defineEmits(['action']);

const resolvedIcon = computed(() => props.icon || VARIANT_ICONS[props.variant] || Inbox);
</script>

<style scoped>
.state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 48px 24px;
  background: var(--bg-surface);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-main);
}

.state-view__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--bg-surface-2);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.state-view--error .state-view__icon {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
}

.state-view--offline .state-view__icon {
  background: rgba(245, 158, 11, 0.14);
  color: var(--warning-text);
}

.state-view__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
}

.state-view__desc {
  margin: 0;
  max-width: 42ch;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}

.state-view__action {
  margin-top: 10px;
  background: var(--neon-blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.state-view__action:hover {
  background: var(--neon-blue-hover);
}
</style>
