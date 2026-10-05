<template>
  <div class="grid-column center-column flex flex-col gap-6">
    <PostComposerCard
      :user="user"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit-post')"
    />

    <TimelinePost
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :user="user"
      :likes="likesCount"
      @like="$emit('like')"
    />
  </div>
</template>

<script setup>
/**
 * ProfileCenterColumn — post composer + the timeline.
 * Pure wiring: the composer text, the like counter and publishing all live in
 * src/composables/useProfile.js.
 */
import PostComposerCard from './PostComposerCard.vue';
import TimelinePost from './TimelinePost.vue';
import { TIMELINE_POSTS } from '../../data/profileData';

defineProps({
  user: { type: Object, required: true },
  posts: { type: Array, default: () => TIMELINE_POSTS },
  likesCount: { type: Number, default: 0 },
  modelValue: { type: String, default: '' },
});

defineEmits(['update:modelValue', 'submit-post', 'like']);
</script>
