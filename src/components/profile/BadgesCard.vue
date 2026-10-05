<template>
  <ProfileCard title="James's Badges">
    <template #meta>
      <span class="badge-count">{{ count }} Total</span>
    </template>

    <div class="badges-icon-grid">
      <div
        v-for="(badge, idx) in items"
        :key="idx"
        class="badge-icon-item"
        :title="badge.title"
        role="img"
        :aria-label="badge.title"
      >
        <span class="badge-icon" aria-hidden="true">
          <component :is="badge.icon" :size="18" />
        </span>
      </div>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * BadgesCard — achievement icon grid. Icons come from lucide-vue-next,
 * the list itself from src/data/profileData.js.
 */
import ProfileCard from './ProfileCard.vue';

defineProps({
  items: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
});
</script>

<style scoped>
.badges-icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.badge-icon-item {
  width: 44px;
  height: 44px;
  background: var(--bg-surface-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-subtle);
  transition: transform 0.15s;
}

.badge-icon-item:hover {
  transform: scale(1.1);
  border-color: var(--lime-primary);
}

.badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-blue);
}

@media (max-width: 768px) {
  .badges-icon-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
