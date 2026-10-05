<template>
  <article class="feed-card">
    <header class="card-header-row">
      <div class="user-meta-box">
        <div class="avatar-circle" :style="{ background: post.avatarBg }">
          <img v-if="post.avatarImg" :src="post.avatarImg" alt="" />
          <span v-else>{{ post.avatarText }}</span>
        </div>
        <div class="user-handle-box">
          <span class="handle-title">{{ post.handle }}</span>
          <span class="post-time">• {{ post.time }}</span>
        </div>
      </div>

      <span :class="['tag-badge', post.tag === 'Tanya' ? 'tag-tanya' : 'tag-cerita']">
        <Pin :size="12" /> {{ post.tag || 'Cerita' }}
      </span>
    </header>

    <div class="card-body-text">
      <p class="post-body-content">{{ post.content }}</p>
    </div>

    <footer class="card-action-bar">
      <button class="action-btn" type="button" title="Komentar" aria-label="Komentar">
        <MessageCircle :size="18" />
      </button>

      <button class="action-btn" type="button" title="Kutip" aria-label="Kutip">
        <Quote :size="18" />
      </button>

      <button
        type="button"
        :class="['action-btn', post.isLiked ? 'liked' : '']"
        :aria-pressed="post.isLiked"
        :aria-label="post.isLiked ? 'Batal suka' : 'Suka'"
        @click="$emit('like', post.id)"
      >
        <Heart :size="18" :fill="post.isLiked ? 'currentColor' : 'none'" />
        <span v-if="post.likes" class="like-count">{{ formatCompact(post.likes) }}</span>
      </button>

      <button class="action-btn" type="button" title="Simpan" aria-label="Simpan">
        <Bookmark :size="18" />
      </button>

      <button class="action-btn action-btn--end" type="button" title="Bagikan" aria-label="Bagikan">
        <Share2 :size="18" />
      </button>
    </footer>
  </article>
</template>

<script setup>
/**
 * FeedCard — a single confession in the timeline.
 * Presentational only: it receives `post` and emits `like`; all state lives
 * in src/composables/useFeedPosts.js.
 */
import { Pin, MessageCircle, Quote, Heart, Bookmark, Share2 } from 'lucide-vue-next';
import { formatCompact } from '../../utils/format';

defineProps({ post: { type: Object, required: true } });
defineEmits(['like']);
</script>

<style scoped>
.feed-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 18px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-meta-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--text-on-accent);
  font-weight: 900;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.handle-title {
  font-weight: 800;
  font-size: 14px;
  color: var(--shell-text);
}

.post-time {
  font-size: 12px;
  color: var(--shell-text-dim);
  margin-left: 6px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
  flex-shrink: 0;
}

.tag-cerita {
  background: var(--tag-cerita-bg);
  color: var(--tag-cerita-fg);
}
.tag-tanya {
  background: var(--tag-tanya-bg);
  color: var(--tag-tanya-fg);
}

.card-body-text {
  margin-bottom: 14px;
}

.post-body-content {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--shell-text);
  opacity: 0.92;
  margin: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.card-action-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  border-top: 1px solid var(--shell-border);
  padding-top: 12px;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

.action-btn:hover {
  color: var(--shell-text);
  transform: translateY(-1px);
}
.action-btn.liked {
  color: var(--danger-text);
}
.action-btn--end {
  margin-left: auto;
}

.like-count {
  font-size: 12px;
  font-weight: 700;
}
</style>
