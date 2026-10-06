<template>
  <article class="post-preview" :class="templateClass">
    <!-- Template-specific wrapper -->
    <div class="preview-card">
      <!-- Header -->
      <header class="preview-header">
        <div class="preview-avatar" :style="{ backgroundColor: baseColor }">
          {{ baseAvatar }}
        </div>
        <div class="preview-meta">
          <div class="preview-author-row">
            <span class="preview-name">{{ author?.username || 'Anonim' }}</span>
            <span class="preview-handle">{{ baseHandle }}</span>
            <span class="preview-dot" aria-hidden="true" />
            <span class="preview-time">{{ timeAgo }}</span>
          </div>
          <div class="preview-badges" v-if="topic || song">
            <span v-if="topic" class="preview-tag topic">{{ topic }}</span>
            <span v-if="song" class="preview-tag song">
              <Music :size="10" /> {{ song.title }}
            </span>
          </div>
        </div>
        <button type="button" class="preview-more" aria-label="Opsi lainnya">
          <MoreHorizontal :size="18" />
        </button>
      </header>

      <!-- Content -->
      <div class="preview-content">
        <p class="preview-text" v-if="content">{{ displayContent }}</p>

        <!-- Media Grid -->
        <div
          v-if="media.length > 0"
          class="preview-media-grid"
          :class="media.length <= 1 ? 'single' : media.length === 2 ? 'double' : 'multiple'"
        >
          <div
            v-for="(item, index) in media"
            :key="item.id"
            class="preview-media-item"
            :class="{ featured: index === 0 && media.length > 1 }"
          >
            <img v-if="item.type === 'image'" :src="item.url" :alt="item.name" loading="lazy" />
            <video
              v-else-if="item.type === 'video'"
              :src="item.url"
              muted
              playsinline
              controls
              :poster="item.preview"
            />
          </div>
        </div>

        <!-- Song Card -->
        <div v-if="song" class="preview-song-card">
          <img :src="song.cover" :alt="song.title" class="preview-song-cover" />
          <div class="preview-song-info">
            <span class="preview-song-title">{{ song.title }}</span>
            <span class="preview-song-artist">{{ song.artist }}</span>
          </div>
          <button type="button" class="preview-song-play" aria-label="Putar pratinjau">
            <Play :size="20" />
          </button>
        </div>
      </div>

      <!-- Footer Actions -->
      <footer class="preview-footer">
        <button type="button" class="preview-action" aria-label="Suka">
          <Heart :size="20" :fill="liked ? 'currentColor' : 'none'" :class="{ liked }" />
          <span>{{ formatCompact(likesCount) }}</span>
        </button>
        <button type="button" class="preview-action" aria-label="Komentar">
          <MessageCircle :size="20" />
          <span>{{ formatCompact(commentsCount) }}</span>
        </button>
        <button type="button" class="preview-action" aria-label="Bagikan">
          <Share2 :size="20" />
        </button>
        <button type="button" class="preview-action preview-bookmark" aria-label="Simpan">
          <Bookmark
            :size="20"
            :fill="bookmarked ? 'currentColor' : 'none'"
            :class="{ bookmarked }"
          />
        </button>
      </footer>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Music,
  Play,
  Image,
} from 'lucide-vue-next';
import { formatCompact } from '../../utils/format';

defineProps({
  content: { type: String, default: '' },
  media: { type: Array, default: () => [] },
  baseHandle: { type: String, default: '@anonfess' },
  topic: { type: String, default: '' },
  song: { type: Object, default: null },
  template: { type: String, default: 'default' },
  author: { type: Object, default: null },
  isPreview: { type: Boolean, default: true },
});

// Mock data for preview
const likesCount = 0;
const commentsCount = 0;
const liked = false;
const bookmarked = false;
const timeAgo = 'baru saja';

const baseInfo = computed(() => {
  const bases = {
    '@codememfess': { name: 'Code Memes & Rants', color: '#0038FF', avatar: 'CM' },
    '@gamerfess': { name: 'Gaming Confessions', color: '#FF0055', avatar: 'GC' },
    '@indiefess': { name: 'Indie Hacker Secrets', color: '#FF6D00', avatar: 'IH' },
    '@designfess': { name: 'Design Rants & Feedback', color: '#00B2FF', avatar: 'DR' },
    '@anonfess': { name: 'Anon Confessions', color: '#7000FF', avatar: 'AN' },
  };
  return bases[props.baseHandle] || { name: 'Base', color: '#7000FF', avatar: 'BS' };
});

const baseColor = computed(() => baseInfo.value.color);
const baseAvatar = computed(() => baseInfo.value.avatar);

const displayContent = computed(() => {
  // In template preview, show truncated content
  if (props.isPreview && props.content.length > 300) {
    return props.content.slice(0, 300) + '…';
  }
  return props.content;
});

const templateClass = computed(() => `template-${props.template}`);
</script>

<style scoped>
.post-preview {
  width: 100%;
  font-family: var(--font-sans);
}

/* ===== BASE TEMPLATE (DEFAULT) ===== */
.preview-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px var(--shadow-color);
}

.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  color: var(--text-on-accent);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preview-meta {
  flex: 1;
  min-width: 0;
}

.preview-author-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.preview-name {
  font-weight: 800;
  font-size: 14px;
  color: var(--text-main);
}

.preview-handle {
  font-size: 13px;
  color: var(--text-muted);
}

.preview-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.preview-time {
  font-size: 12px;
  color: var(--text-muted);
}

.preview-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--shell-chip);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text);
}

.preview-tag.song {
  background: linear-gradient(135deg, var(--shell-sub-accent), var(--brand-blue));
  color: var(--text-on-accent);
}

.preview-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.preview-more:hover {
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.preview-content {
  padding: 0 16px 16px;
}

.preview-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-main);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ===== MEDIA GRID ===== */
.preview-media-grid {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.preview-media-grid.single {
  border-radius: 12px;
}

.preview-media-grid.double {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.preview-media-grid.multiple {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.preview-media-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.preview-media-item.featured {
  grid-column: 1 / -1;
  grid-row: 1 / 3;
  aspect-ratio: 16/9;
}

.preview-media-item img,
.preview-media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-media-item:hover img {
  transform: scale(1.02);
}

/* ===== SONG CARD ===== */
.preview-song-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(112, 0, 255, 0.1), rgba(11, 57, 250, 0.1));
  border: 1px solid var(--shell-sub-accent);
  border-radius: 12px;
}

.preview-song-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.preview-song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-song-title {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-song-artist {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-song-play {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--shell-sub-accent);
  border: none;
  color: var(--text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.preview-song-play:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(112, 0, 255, 0.3);
}

/* ===== FOOTER ===== */
.preview-footer {
  display: flex;
  padding: 10px 8px;
  border-top: 1px solid var(--border-subtle);
}

.preview-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  margin: 0 4px;
  transition: all 0.15s ease;
}

.preview-action:hover {
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.preview-action.liked {
  color: var(--danger);
}

.preview-action.bookmarked {
  color: var(--brand-blue);
}

/* ===== TEMPLATE VARIANTS ===== */
.template-minimal .preview-card {
  border-radius: 0;
  border-left: 3px solid var(--brand-blue);
  border-right: none;
  border-top: none;
  border-bottom: none;
  box-shadow: none;
}

.template-minimal .preview-header {
  padding: 12px 16px 8px;
}

.template-minimal .preview-content {
  padding: 0 16px 12px;
}

.template-minimal .preview-footer {
  border-top: none;
  padding: 8px;
}

.template-card .preview-card {
  border-radius: 20px;
  box-shadow: 0 8px 24px var(--shadow-color);
}

.template-card .preview-avatar {
  border-radius: 50%;
  width: 44px;
  height: 44px;
}

.template-story {
  max-width: 320px;
  margin: 0 auto;
}

.template-story .preview-card {
  border-radius: 24px;
  padding-bottom: 24px;
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%);
}

.template-story .preview-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.template-story .preview-media-grid {
  border-radius: 16px;
}

@media (max-width: 600px) {
  .preview-header {
    padding: 12px;
  }

  .preview-content {
    padding: 0 12px 12px;
  }

  .preview-footer {
    padding: 8px 4px;
  }

  .preview-action {
    padding: 8px;
    font-size: 12px;
    gap: 4px;
  }
}
</style>
