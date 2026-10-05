<template>
  <header class="super-header-card">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="super-page-title">{{ title }}</h1>
        <p class="text-xs text-muted">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <slot name="actions" />
        <span class="health-pill">
          <Zap :size="14" aria-hidden="true" />
          {{ health }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * SuperAdminHeader — page title, theme switch slot and system health pill.
 */
import { Zap } from 'lucide-vue-next';

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  health: { type: String, default: '' },
});
</script>

<style scoped>
.super-header-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px var(--shadow-color);
  padding: 24px 32px;
}

.super-page-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-main);
  margin: 0 0 2px;
}

.health-pill {
  background: var(--cyber-pink);
  color: var(--text-on-accent);
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  font-weight: 900;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

@media (max-width: 768px) {
  .super-header-card {
    padding: 16px;
    border-radius: var(--radius-md);
  }

  .super-page-title {
    font-size: 18px;
  }
}
</style>
