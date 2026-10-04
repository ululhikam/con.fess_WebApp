<template>
  <div class="feed-card">
    <div class="card-header-row">
      <div class="user-meta-box">
        <div class="avatar-circle" :style="{ background: post.avatarBg }">
          <img v-if="post.avatarImg" :src="post.avatarImg" alt="avatar" />
          <span v-else>{{ post.avatarText }}</span>
        </div>
        <div class="user-handle-box">
          <span class="handle-title">{{ post.handle }}</span>
          <span class="post-time">• {{ post.time }}</span>
        </div>
      </div>
      <span :class="['tag-badge', post.tag === 'Tanya' ? 'tag-tanya' : 'tag-cerita']">
        📌 {{ post.tag || 'Cerita' }}
      </span>
    </div>

    <div class="card-body-text">
      <p class="post-body-content">{{ post.content }}</p>
    </div>

    <div class="card-action-bar">
      <button class="action-btn" title="Komentar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </button>

      <button class="action-btn quote-btn" title="Quote">
        <span>⁹⁹</span>
      </button>

      <button
        @click="$emit('like', post.id)"
        :class="['action-btn', post.isLiked ? 'liked' : '']"
        title="Suka"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.isLiked ? '#EF4444' : 'none'" :stroke="post.isLiked ? '#EF4444' : 'currentColor'" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span v-if="post.likes" class="like-count">{{ post.likes }}</span>
      </button>

      <button class="action-btn" title="Simpan">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="19 12 12 19 5 12"/>
        </svg>
      </button>

      <button class="action-btn ml-auto" title="Bagikan">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ post: { type: Object, required: true } })
defineEmits(['like'])
</script>

<style scoped>
.feed-card {
  background: #14141C;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 18px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-meta-box { display: flex; align-items: center; gap: 10px; }

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-weight: 900;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }

.handle-title { font-weight: 800; font-size: 14px; }
.post-time { font-size: 12px; color: rgba(255,255,255,0.45); margin-left: 6px; }

.tag-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
}
.tag-cerita { background: rgba(11,57,250,0.2); border: 1px solid rgba(11,57,250,0.35); color: #7BA7FF; }
.tag-tanya  { background: rgba(112,0,255,0.2); border: 1px solid rgba(112,0,255,0.35); color: #C084FC; }

.card-body-text { margin-bottom: 14px; }
.post-body-content { font-size: 14.5px; line-height: 1.65; color: rgba(255,255,255,0.9); margin: 0; white-space: pre-line; }

.card-action-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 12px;
}

.action-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  transition: all 0.15s;
}
.action-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
.action-btn.liked { color: #EF4444; }
.like-count { font-size: 12px; font-weight: 700; }
.ml-auto { margin-left: auto; }
</style>
