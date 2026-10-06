<template>
  <article
    ref="cardEl"
    class="post-card"
    :class="[`ink-${templateDef.ink}`, { 'is-exporting': exporting }]"
    :style="cardStyle"
  >
    <div class="post-card__texture" aria-hidden="true" :style="textureStyle" />

    <div class="post-card__inner">
      <!-- Header -->
      <header class="post-card__header">
        <span class="post-card__avatar" aria-hidden="true">{{ baseAvatar }}</span>
        <span class="post-card__ident">
          <strong class="post-card__handle">{{ baseHandle }}</strong>
          <span class="post-card__name">{{ baseInfo.name }}</span>
        </span>
        <span class="post-card__brand">con.fess</span>
      </header>

      <!-- Topic + song strip -->
      <div v-if="topicLabel || song" class="post-card__meta">
        <span v-if="topicLabel" class="post-card__chip">{{ topicLabel }}</span>
        <span v-if="song" class="post-card__chip post-card__chip--song">
          <Music :size="12" />
          {{ song.title }} — {{ song.artist }}
        </span>
      </div>

      <!-- Body -->
      <p v-if="displayContent" class="post-card__body">{{ displayContent }}</p>
      <p v-else class="post-card__body post-card__body--empty">Tulis fessmu…</p>

      <!-- Media -->
      <div
        v-if="media.length"
        class="post-card__media"
        :class="media.length === 1 ? 'is-single' : 'is-grid'"
      >
        <div v-for="item in media" :key="item.id" class="post-card__media-item">
          <img
            v-if="item.type === 'image'"
            :src="item.url || item.preview"
            :alt="item.name || 'Media fess'"
            loading="lazy"
          />
          <video
            v-else
            :src="item.url || item.preview"
            :poster="item.preview"
            muted
            playsinline
            controls
          />
        </div>
      </div>

      <!-- Footer -->
      <footer class="post-card__footer">
        <span class="post-card__stat"><Heart :size="14" /> {{ formatCompact(likes) }}</span>
        <span class="post-card__stat"
          ><MessageCircle :size="14" /> {{ formatCompact(comments) }}</span
        >
        <span class="post-card__stat post-card__stat--time">{{ timeAgo }}</span>
      </footer>
    </div>
  </article>
</template>

<script setup>
/**
 * PostPreview renders the *exportable* post card.
 *
 * The card is a fixed-aspect canvas (1:1 / 4:5 / 9:16) painted with the
 * template background. Everything drawn on it is self-contained — colours come
 * from the template's `ink`, never from app theme variables — so the node can
 * be rasterised to a PNG and posted to Instagram without losing styling.
 */
import { ref, computed, toRef } from 'vue';
import { Heart, MessageCircle, Music } from 'lucide-vue-next';
import { formatCompact } from '../../utils/format';
import { getTemplateByKey, getTemplateAspectRatio } from '../../data/templates';
import { getTopicById } from '../../data/topics';

const props = defineProps({
  content: { type: String, default: '' },
  media: { type: Array, default: () => [] },
  baseHandle: { type: String, default: '@anonfess' },
  topic: { type: String, default: '' },
  song: { type: Object, default: null },
  template: { type: String, default: 'default' },
  author: { type: Object, default: null },
  isPreview: { type: Boolean, default: true },
  /** True while html-to-image is rasterising — freezes animations/jitter. */
  exporting: { type: Boolean, default: false },
});

/** Root node, exposed so the parent can hand it to html-to-image. */
const cardEl = ref(null);
defineExpose({ cardEl });

const templateDef = computed(() => getTemplateByKey(props.template));

const BASES = {
  '@codememfess': { name: 'Code Memes & Rants', color: '#0038ff', initials: 'CM' },
  '@gamerfess': { name: 'Gaming Confessions', color: '#ff0055', initials: 'GC' },
  '@indiefess': { name: 'Indie Hacker Secrets', color: '#ff6d00', initials: 'IH' },
  '@designfess': { name: 'Design Rants & Feedback', color: '#00b2ff', initials: 'DR' },
  '@anonfess': { name: 'Anon Confessions', color: '#7000ff', initials: 'AN' },
};

const baseInfo = computed(() => BASES[props.baseHandle] || { name: 'Base', initials: 'F' });
const baseAvatar = computed(() => baseInfo.value.initials);

const topicLabel = computed(() => {
  if (!props.topic) return '';
  return getTopicById(props.topic)?.label || props.topic;
});

/** Canvas geometry: aspect-ratio + the template's own paint. */
const cardStyle = computed(() => ({
  aspectRatio: getTemplateAspectRatio(templateDef.value),
  background: templateDef.value.background,
  '--card-accent': templateDef.value.accent,
}));

const textureStyle = computed(() =>
  templateDef.value.texture ? { backgroundImage: templateDef.value.texture } : null,
);

const displayContent = computed(() => {
  if (props.isPreview && props.content.length > 420) return props.content.slice(0, 420) + '…';
  return props.content;
});

// Static demo counters — the real values arrive from the API layer.
const likes = 0;
const comments = 0;
const timeAgo = 'baru saja';
</script>

<style scoped>
/*
 * The card is deliberately *not* driven by app theme tokens: when it is
 * rasterised there is no [data-theme] ancestor, so every colour below is
 * either literal or inherited from the `ink-*` classes.
 */
.post-card {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  isolation: isolate;
  font-family: var(--font-sans);
  box-shadow: var(--neo-shadow, 0 18px 40px rgba(0, 0, 0, 0.35));
  -webkit-font-smoothing: antialiased;
}

.post-card__texture {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.9;
}

.post-card__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2.4vw, 16px);
  height: 100%;
  padding: clamp(16px, 5%, 26px);
  box-sizing: border-box;
}

/* ---- ink (export-safe: literals only) ---- */
.ink-light {
  color: #ffffff;
}
.ink-light .post-card__body,
.ink-light .post-card__handle,
.ink-light .post-card__name,
.ink-light .post-card__stat,
.ink-light .post-card__chip {
  color: #ffffff;
}
.ink-light .post-card__name,
.ink-light .post-card__stat,
.ink-light .post-card__body--empty {
  opacity: 0.82;
}
.ink-light .post-card__avatar {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}
.ink-light .post-card__brand,
.ink-light .post-card__chip {
  background: rgba(255, 255, 255, 0.18);
}
.ink-light .post-card__media-item {
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.ink-dark {
  color: #1c1917;
}
.ink-dark .post-card__body,
.ink-dark .post-card__handle,
.ink-dark .post-card__name,
.ink-dark .post-card__stat,
.ink-dark .post-card__chip {
  color: #1c1917;
}
.ink-dark .post-card__name,
.ink-dark .post-card__stat,
.ink-dark .post-card__body--empty {
  opacity: 0.7;
}
.ink-dark .post-card__avatar {
  background: rgba(28, 25, 23, 0.12);
  color: #1c1917;
}
.ink-dark .post-card__brand,
.ink-dark .post-card__chip {
  background: rgba(28, 25, 23, 0.1);
}
.ink-dark .post-card__media-item {
  border: 1px solid rgba(28, 25, 23, 0.2);
}

/* ---- header ---- */
.post-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.post-card__avatar {
  display: grid;
  place-items: center;
  width: clamp(34px, 9%, 44px);
  aspect-ratio: 1;
  border-radius: 12px;
  font-size: clamp(12px, 3vw, 15px);
  font-weight: 800;
  letter-spacing: 0.4px;
}

.post-card__ident {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.post-card__handle {
  font-size: clamp(13px, 3.4vw, 16px);
  font-weight: 800;
}

.post-card__name {
  font-size: clamp(11px, 2.8vw, 13px);
  font-weight: 500;
}

.post-card__brand {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: clamp(10px, 2.6vw, 12px);
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ---- meta chips ---- */
.post-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.post-card__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: clamp(10px, 2.7vw, 12.5px);
  font-weight: 700;
}

.post-card__chip--song {
  background: var(--card-accent, rgba(255, 255, 255, 0.18));
  color: #0b0d14;
}

/* ---- body ---- */
.post-card__body {
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  font-size: clamp(15px, 4.2vw, 21px);
  font-weight: 500;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.post-card__body--empty {
  font-style: italic;
  font-weight: 400;
}

/* ---- media ---- */
.post-card__media {
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
}

.post-card__media.is-single {
  max-height: 46%;
}

.post-card__media.is-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.post-card__media-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  aspect-ratio: 1;
}

.post-card__media.is-single .post-card__media-item {
  aspect-ratio: 16 / 10;
}

.post-card__media-item img,
.post-card__media-item video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- footer ---- */
.post-card__footer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 4px;
}

.post-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: clamp(11px, 2.9vw, 13px);
  font-weight: 600;
}

.post-card__stat--time {
  margin-left: auto;
}

/* ---- export state ---- */
.is-exporting .post-card__texture {
  opacity: 1;
}
</style>
