<template>
  <button
    type="button"
    class="toolbar-btn"
    :class="{ active, disabled }"
    @click="$emit('click')"
    :disabled="disabled"
    :aria-pressed="active"
    :aria-label="label"
  >
    <component :is="icon" :size="20" />
    <span class="toolbar-btn__label">{{ label }}</span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  icon: { type: Object, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<style scoped>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(.disabled) {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
  color: var(--text-main);
}

.toolbar-btn.active {
  background: var(--shell-chip);
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.toolbar-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.toolbar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border-radius: 9px;
  font-size: 10px;
  font-weight: 800;
}
</style>
