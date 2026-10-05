<template>
  <ProfileCard title="Last Photos">
    <template #meta>
      <span class="text-xs text-muted">View All</span>
    </template>

    <div class="photos-grid-3x3">
      <img
        v-for="(photo, i) in photos"
        :key="i"
        :src="photo"
        :alt="`Galeri foto ${i + 1}`"
        class="gallery-thumb"
      />
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * PhotosGridCard — 3×3 "Last Photos" gallery.
 */
import ProfileCard from './ProfileCard.vue';

defineProps({
  photos: { type: Array, default: () => [] },
});
</script>

<style scoped>
.photos-grid-3x3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery-thumb {
  width: 100%;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
</style>
