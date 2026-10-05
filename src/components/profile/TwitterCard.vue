<template>
  <ProfileCard title="Twitter Cross-Post Feed">
    <div class="twitter-tweet-box">
      <div class="flex items-center gap-2 mb-2">
        <span class="twitter-icon" aria-hidden="true"><Twitter :size="15" /></span>
        <span class="font-bold text-xs">@{{ handleName }}</span>
        <span class="text-xs text-muted">{{ tweet.time }}</span>
      </div>
      <p class="tweet-text">{{ tweet.text }}</p>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * TwitterCard — cross-posted tweet preview.
 */
import { computed } from 'vue';
import { Twitter } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';

const props = defineProps({
  handle: { type: String, default: '' },
  tweet: { type: Object, required: true },
});

const handleName = computed(() => props.handle.replace('@', ''));
</script>

<style scoped>
/* Twitter brand accent stays decorative. */
.twitter-icon {
  display: inline-flex;
  align-items: center;
  color: #1da1f2;
}
</style>
