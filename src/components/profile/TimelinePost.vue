<template>
  <ProfileCard>
    <div class="post-header flex justify-between items-center mb-3">
      <div class="flex items-center gap-3">
        <img :src="user.avatar" :alt="`${user.username} avatar`" class="post-user-avatar" />
        <div>
          <div class="post-author-name">
            {{ user.username
            }}<span v-if="post.authorNote" class="text-xs text-muted"> {{ post.authorNote }}</span>
          </div>
          <div class="post-timestamp">{{ post.time }}</div>
        </div>
      </div>
      <span v-if="post.tag" class="badge-blue-sm">{{ post.tag }}</span>
    </div>

    <p :class="['post-content-text', post.media ? 'mb-3' : 'mb-4']">{{ post.content }}</p>

    <!-- Music preview box -->
    <div
      v-if="post.media && post.media.type === 'music'"
      class="music-preview-box flex items-center gap-4 p-4 rounded-xl mb-4"
    >
      <div class="music-album-art relative">
        <img :src="post.media.image" :alt="post.media.title" class="album-img" />
        <button type="button" class="album-play-overlay" aria-label="Putar preview musik">
          <Play :size="20" fill="currentColor" aria-hidden="true" />
        </button>
      </div>
      <div class="flex-1">
        <h4 class="music-track-name">{{ post.media.title }}</h4>
        <p class="music-track-desc">{{ post.media.description }}</p>
        <span class="text-xs text-muted">{{ post.media.source }}</span>
      </div>
    </div>

    <!-- Full photo -->
    <div v-else-if="post.media && post.media.type === 'photo'" class="full-photo-container mb-4">
      <img :src="post.media.src" :alt="post.media.alt" class="timeline-full-photo" />
    </div>

    <div class="post-footer flex justify-between items-center pt-3 border-t">
      <div class="flex items-center gap-4 text-xs font-bold text-muted">
        <button
          v-if="post.interactive"
          type="button"
          class="like-btn text-blue"
          :aria-label="`Suka — ${likes} likes`"
          @click="$emit('like')"
        >
          <ThumbsUp :size="13" aria-hidden="true" /> {{ likes }} Likes
        </button>
        <span v-else class="text-blue inline-flex items-center gap-1">
          <ThumbsUp :size="13" aria-hidden="true" /> {{ post.likes }} Likes
        </span>
        <span class="inline-flex items-center gap-1">
          <MessageCircle :size="13" aria-hidden="true" /> {{ post.comments }} Comments
        </span>
        <span class="inline-flex items-center gap-1">
          <Repeat2 :size="13" aria-hidden="true" /> {{ post.shares }} Shares
        </span>
      </div>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * TimelinePost — a single post in the centre column (rendered 3×).
 * Static mock posts render their own like count; `post.interactive` posts use
 * the live `likes` counter and emit `like`.
 */
import ProfileCard from './ProfileCard.vue';
import { ThumbsUp, MessageCircle, Repeat2, Play } from 'lucide-vue-next';

defineProps({
  post: { type: Object, required: true },
  user: { type: Object, required: true },
  likes: { type: Number, default: 0 },
});

defineEmits(['like']);
</script>

<style scoped>
.post-user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
}

.post-timestamp {
  font-size: 11px;
  color: var(--text-muted);
}

.badge-blue-sm {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.post-content-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* MUSIC PREVIEW BOX */
.music-preview-box {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.music-album-art {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.album-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-play-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-scrim);
  color: var(--text-on-accent);
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.music-track-name {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 4px;
}

.music-track-desc {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.4;
  margin-bottom: 4px;
}

.full-photo-container {
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 400px;
}

.timeline-full-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.like-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
