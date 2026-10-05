<template>
  <button type="button" class="admin-btn" :class="`admin-btn--${variant}`">
    <slot />
  </button>
</template>

<script setup>
/**
 * AdminButton — the only button skin used by the admin dashboards.
 * variant: 'lime' | 'blue' | 'outline' (pills) or
 *          'approve' | 'reject' | 'export' (compact table actions).
 * Click handlers fall through from the parent template.
 */
defineProps({
  variant: {
    type: String,
    default: 'lime',
    validator: (v) => ['lime', 'blue', 'outline', 'approve', 'reject', 'export'].includes(v),
  },
});
</script>

<style scoped>
.admin-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    filter 0.15s ease;
}

.admin-btn--lime {
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-weight: 900;
}

.admin-btn--lime:hover {
  background: var(--lime-hover);
}

.admin-btn--blue {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.admin-btn--blue:hover {
  filter: brightness(1.08);
}

.admin-btn--outline {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
  padding: 8px 16px;
  font-weight: 700;
}

.admin-btn--outline:hover {
  color: var(--text-main);
}

/* Compact table / queue actions */
.admin-btn--approve,
.admin-btn--reject,
.admin-btn--export {
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 800;
  border-radius: var(--radius-sm);
}

.admin-btn--approve {
  background: var(--lime-primary);
  color: var(--lime-ink);
}

.admin-btn--reject {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-text);
}

.admin-btn--export {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}
</style>
