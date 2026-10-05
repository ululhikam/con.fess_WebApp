<template>
  <ProfileCard title="Favorite Pages">
    <div class="favorite-base-list flex flex-col gap-3">
      <div
        v-for="page in pages"
        :key="page.name"
        class="fav-base-item flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div class="fav-icon-box" aria-hidden="true">
            <component :is="page.icon" :size="18" />
          </div>
          <div>
            <div class="fav-name">{{ page.name }}</div>
            <div class="fav-cat">{{ page.cat }}</div>
          </div>
        </div>
        <span class="star-icon" aria-hidden="true"><Star :size="16" /></span>
      </div>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * FavoriteBasesCard — starred pages / bases list.
 */
import { Star } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';

defineProps({
  pages: { type: Array, default: () => [] },
});
</script>

<style scoped>
.fav-icon-box {
  width: 36px;
  height: 36px;
  background: var(--bg-surface-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-name {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-main);
}

.fav-cat {
  font-size: 10px;
  color: var(--text-muted);
}

.star-icon {
  display: inline-flex;
  align-items: center;
  color: var(--warning-text);
}
</style>
