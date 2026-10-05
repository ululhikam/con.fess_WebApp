<template>
  <section class="profile-card">
    <div v-if="title || $slots.meta" class="card-section-title">
      <h3 v-if="title" class="card-title">{{ title }}</h3>
      <div v-if="$slots.meta" class="card-title-meta">
        <slot name="meta" />
      </div>
    </div>

    <slot />
  </section>
</template>

<script setup>
/**
 * ProfileCard — the surface every card in the profile columns sits on.
 * Owns the card chrome (surface, border, radius, shadow, title row) so each
 * card component only declares its own content.
 *
 * <ProfileCard title="Last Photos">
 *   <template #meta><span class="text-xs text-muted">View All</span></template>
 *   …
 * </ProfileCard>
 */
defineProps({
  title: { type: String, default: '' },
});
</script>

<style scoped>
.profile-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px var(--shadow-color);
  padding: 20px;
}

.card-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.card-title-meta {
  display: inline-flex;
  align-items: center;
}
</style>
