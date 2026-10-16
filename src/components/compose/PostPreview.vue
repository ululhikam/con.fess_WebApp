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
        <span class="post-card__brand">Fess n Curious</span>
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

      <!-- Quoted Fess Preview -->
      <div v-if="quotedFess" class="post-card__quoted">
        <div class="quoted-meta">
          <strong>{{ quotedFess.handle || quotedFess.senderHandle }}</strong>
          <span>• {{ quotedFess.time || 'Fess' }}</span>
        </div>
        <p class="quoted-text">{{ quotedFess.content }}</p>
      </div>

      <!-- Media (di pratinjau, media bisa digeser untuk mengatur urutan) -->
      <div
        v-if="mediaItems.length"
        class="post-card__media"
        :class="[
          mediaItems.length === 1 ? 'is-single' : 'is-grid',
          { 'is-reorderable': reorderEnabled },
        ]"
      >
        <div
          v-for="(item, index) in mediaItems"
          :key="item.id"
          class="post-card__media-item"
          :class="{ 'is-drag-source': dragIndex === index }"
          :data-media-index="index"
        >
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

          <!-- Pegangan geser pengatur urutan (tidak ikut ter-ekspor ke PNG) -->
          <button
            v-if="reorderEnabled"
            type="button"
            class="media-reorder-handle"
            :title="`Geser untuk memindahkan media ${index + 1}`"
            aria-label="Geser untuk mengubah urutan media"
            @pointerdown.stop.prevent="startReorder($event, index)"
            @click.stop
          >
            <GripVertical :size="14" />
          </button>
          <span v-if="reorderEnabled" class="media-order-badge">{{ index + 1 }}</span>
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
import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
import { Heart, MessageCircle, Music, GripVertical } from 'lucide-vue-next';
import { formatCompact } from '../../utils/format';
import { getTemplateByKey, getTemplateAspectRatio } from '../../config/templates';
import { useTopics } from '../../composables/useTopics';
import { useBases } from '../../composables/useBases';

const props = defineProps({
  content: { type: String, default: '' },
  media: { type: Array, default: () => [] },
  baseHandle: { type: String, default: '@anonfess' },
  topic: { type: String, default: '' },
  song: { type: Object, default: null },
  template: { type: String, default: 'default' },
  author: { type: Object, default: null },
  quotedFess: { type: Object, default: null },
  isPreview: { type: Boolean, default: true },
  /** True while html-to-image is rasterising — freezes animations/jitter. */
  exporting: { type: Boolean, default: false },
  /** Aktifkan pengaturan urutan media via geser (khusus tampilan pratinjau). */
  reorderable: { type: Boolean, default: false },
});

const emit = defineEmits(['reorder-media']);

/** Root node, exposed so the parent can hand it to html-to-image. */
const cardEl = ref(null);
defineExpose({ cardEl });

const templateDef = computed(() => getTemplateByKey(props.template));

const { getTopicById } = useTopics();
const { bases } = useBases();

/** Resolve the target base from the live directory (falls back to handle). */
const baseInfo = computed(() => {
  const clean = String(props.baseHandle || '').replace(/^@/, '');
  const found = bases.value.find((b) => b.handle.replace(/^@/, '') === clean);
  if (found) return { name: found.name, color: found.color, initials: found.initial };
  return {
    name: clean || 'Base',
    color: '#0053ff',
    initials: clean.slice(0, 2).toUpperCase() || 'FB',
  };
});
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

/* ---- Pengaturan urutan media via geser (khusus pratinjau) ---------------- */

const reorderEnabled = computed(
  () => props.reorderable && props.isPreview && !props.exporting && (props.media?.length || 0) > 1
);

// Urutan lokal (daftar id) selama user menggeser; null = ikut urutan prop.
const dragIds = ref(null);
const dragIndex = ref(-1);

/** Daftar media yang dirender — mengikuti urutan geser saat sedang aktif. */
const mediaItems = computed(() => {
  const list = props.media || [];
  if (!dragIds.value) return list;
  const byId = new Map(list.map((m) => [m.id, m]));
  const ordered = [];
  for (const id of dragIds.value) {
    const item = byId.get(id);
    if (item) ordered.push(item);
  }
  for (const item of list) {
    if (!ordered.includes(item)) ordered.push(item);
  }
  return ordered;
});

function startReorder(event, index) {
  if (!reorderEnabled.value || dragIndex.value !== -1) return;
  dragIndex.value = index;
  dragIds.value = mediaItems.value.map((m) => m.id);
  window.addEventListener('pointermove', onReorderMove, { passive: false });
  window.addEventListener('pointerup', finishReorder);
  window.addEventListener('pointercancel', finishReorder);
}

/** Tukar posisi item yang digeser dengan tile yang berada di bawah pointer. */
function onReorderMove(event) {
  if (dragIndex.value < 0) return;
  event.preventDefault();
  const el = document.elementFromPoint(event.clientX, event.clientY);
  const tile = el && typeof el.closest === 'function' ? el.closest('[data-media-index]') : null;
  if (!tile) return;
  const index = Number(tile.getAttribute('data-media-index'));
  if (Number.isNaN(index) || index === dragIndex.value) return;
  moveMedia(dragIndex.value, index);
  dragIndex.value = index;
}

function moveMedia(from, to) {
  const ids = (dragIds.value || []).slice();
  if (from < 0 || from >= ids.length || to < 0 || to >= ids.length) return;
  const [moved] = ids.splice(from, 1);
  ids.splice(to, 0, moved);
  dragIds.value = ids;
}

function finishReorder() {
  window.removeEventListener('pointermove', onReorderMove);
  window.removeEventListener('pointerup', finishReorder);
  window.removeEventListener('pointercancel', finishReorder);
  const ids = dragIds.value;
  dragIndex.value = -1;
  if (ids && ids.length) {
    emit('reorder-media', ids);
    // Lepaskan urutan lokal setelah parent menyinkronkan prop-nya.
    nextTick(() => {
      if (dragIndex.value === -1) dragIds.value = null;
    });
  } else {
    dragIds.value = null;
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onReorderMove);
  window.removeEventListener('pointerup', finishReorder);
  window.removeEventListener('pointercancel', finishReorder);
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

/* ---- quoted fess ---- */
.post-card__quoted {
  margin: 6px 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.22);
  padding: 8px 10px;
  font-size: clamp(11px, 2.8vw, 13px);
  flex-shrink: 0;
}

.quoted-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  margin-bottom: 3px;
  opacity: 0.9;
}

.quoted-text {
  margin: 0;
  line-height: 1.4;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* ---- reorder media (hanya tampil di pratinjau, tidak ikut ter-ekspor) ---- */
.post-card__media.is-reorderable .post-card__media-item {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.post-card__media-item.is-drag-source {
  z-index: 2;
  transform: scale(0.95);
  box-shadow:
    0 0 0 2px #00e0a4,
    0 12px 24px rgba(0, 0, 0, 0.4);
}

.media-reorder-handle {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(10, 12, 20, 0.62);
  color: #ffffff;
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.media-reorder-handle:active {
  cursor: grabbing;
  background: rgba(10, 12, 20, 0.82);
}

.media-order-badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  z-index: 3;
  min-width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(10, 12, 20, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
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
