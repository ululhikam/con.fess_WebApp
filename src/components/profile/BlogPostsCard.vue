<template>
  <ProfileCard title="Blog Posts">
    <div
      v-for="(post, i) in posts"
      :key="post.title"
      :class="['blog-item', { 'mb-3': i < posts.length - 1 }]"
    >
      <h4 class="blog-title">{{ post.title }}</h4>
      <p class="blog-excerpt">{{ post.excerpt }}</p>
      <span class="blog-time">{{ post.time }}</span>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * BlogPostsCard — recent writing list.
 */
import ProfileCard from './ProfileCard.vue';

defineProps({
  posts: { type: Array, default: () => [] },
});
</script>

<style scoped>
.blog-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 4px;
}

.blog-excerpt {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 2px;
}

.blog-time {
  font-size: 10px;
  color: var(--text-secondary);
}
</style>
