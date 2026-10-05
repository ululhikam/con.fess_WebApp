<template>
  <!--
    AdminCard — shared chrome for every dashboard panel:
    surface card + semantic heading (+ optional description, icon and a
    right-aligned actions area). Slot content stays in the parent scope.
  -->
  <section class="admin-card">
    <header v-if="title || $slots.actions" class="admin-card__head">
      <div class="admin-card__heading">
        <h2 class="admin-card__title">
          <component :is="icon" v-if="icon" :size="16" :stroke-width="2" aria-hidden="true" />
          <span>{{ title }}</span>
        </h2>
        <p v-if="description" class="admin-card__desc text-xs text-muted">{{ description }}</p>
      </div>

      <div v-if="$slots.actions" class="admin-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <slot />
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  /** Optional lucide icon component rendered before the title. */
  icon: { type: [Object, Function], default: null },
});
</script>

<style scoped>
.admin-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px var(--shadow-color);
  padding: 24px;
  color: var(--text-main);
  font-family: var(--font-sans);
}

.admin-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-card__heading {
  min-width: 0;
}

.admin-card__title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-main);
}

.admin-card__desc {
  margin: 6px 0 0;
}

.admin-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
