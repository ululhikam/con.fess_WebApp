<template>
  <ProfileCard :title="`Friends (${total})`">
    <template #meta>
      <span class="text-xs text-blue font-bold inline-flex items-center gap-1">
        See All <ArrowRight :size="12" aria-hidden="true" />
      </span>
    </template>

    <div class="friends-avatar-grid">
      <img
        v-for="friend in friends"
        :key="friend.name"
        :src="friend.src"
        :alt="`${friend.name} avatar`"
        class="friend-thumb-avatar"
      />
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * FriendsCard — member avatar grid.
 */
import { ArrowRight } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';

defineProps({
  friends: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
});
</script>

<style scoped>
.friends-avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.friend-thumb-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-surface-2);
  object-fit: cover;
}
</style>
