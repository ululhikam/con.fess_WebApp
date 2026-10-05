<template>
  <div class="grid-column right-column flex flex-col gap-6">
    <PhotosGridCard :photos="GALLERY_PHOTOS" />
    <BlogPostsCard :posts="BLOG_POSTS" />
    <FriendsCard :friends="FRIENDS" :total="FRIENDS_TOTAL" />
    <FavoriteBasesCard :pages="FAVORITE_BASES" />
    <PollCard
      :question="POLL_QUESTION"
      :options="POLL_OPTIONS"
      :selected="selectedPoll"
      @select="$emit('select-poll', $event)"
    />
  </div>
</template>

<script setup>
/**
 * ProfileRightColumn — gallery, blog, friends, favourite pages and the poll.
 * Static content comes from src/data/profileData.js; only the poll selection
 * is lifted into src/composables/useProfile.js.
 */
import PhotosGridCard from './PhotosGridCard.vue';
import BlogPostsCard from './BlogPostsCard.vue';
import FriendsCard from './FriendsCard.vue';
import FavoriteBasesCard from './FavoriteBasesCard.vue';
import PollCard from './PollCard.vue';
import {
  GALLERY_PHOTOS,
  BLOG_POSTS,
  FRIENDS,
  FRIENDS_TOTAL,
  FAVORITE_BASES,
  POLL_QUESTION,
  POLL_OPTIONS,
} from '../../data/profileData';

defineProps({
  selectedPoll: { type: [Number, String], default: null },
});

defineEmits(['select-poll']);
</script>
