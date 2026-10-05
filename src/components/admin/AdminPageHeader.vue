<template>
  <header class="admin-header-card mb-6">
    <div class="admin-header-top flex justify-between items-center flex-wrap gap-4 mb-4">
      <div>
        <h1 class="admin-page-title">{{ title }}</h1>
        <p class="text-xs text-muted">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <slot name="actions" />
      </div>
    </div>

    <!-- Tab bar: the panel it controls lives in the view (ADMIN_PANEL_ID). -->
    <div
      class="admin-tabs flex items-center gap-2 no-scrollbar pt-2 border-t"
      role="tablist"
      aria-label="Bagian dasbor Base Admin"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="admin-nav-tab"
        :class="{ 'active-admin-tab': modelValue === tab.id }"
        :aria-selected="modelValue === tab.id"
        :aria-controls="ADMIN_PANEL_ID"
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
/**
 * AdminPageHeader — page title, action cluster and the dashboard tab bar.
 * Presentational only: the active tab is owned by useAdminDashboard().
 */
import { ADMIN_PANEL_ID } from '../../data/adminData';

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  tabs: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.admin-header-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px var(--shadow-color);
  padding: 24px;
}

.admin-page-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-main);
  margin: 0 0 2px;
}

.admin-tabs {
  /* scrolls horizontally when the 8 pills no longer fit (mobile) */
  overflow-x: auto;
}

.admin-nav-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.admin-nav-tab.active-admin-tab,
.admin-nav-tab:hover {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

@media (max-width: 768px) {
  .admin-header-card {
    padding: 16px;
  }
  .admin-page-title {
    font-size: 18px;
  }
}
</style>
