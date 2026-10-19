<template>
  <div class="post-carousel" :class="{ 'is-exporting': exporting }">
    <!-- Jalur slide: kartu fess (1..N halaman) dulu, lalu media user — persis
         urutan carousel yang diposting ke Instagram (maks 10 slide). -->
    <div
      ref="viewportEl"
      class="post-carousel__viewport"
      @scroll.passive="onScroll"
      @pointerdown="onViewportPointerDown"
      @pointermove="onViewportPointerMove"
      @pointerup="endViewportDrag"
      @pointercancel="endViewportDrag"
    >
      <div v-for="(slide, idx) in slides" :key="slide.key" class="post-carousel__slide">
        <PostPreview
          v-if="slide.kind === 'card'"
          :ref="(el) => registerCardRef(el, idx)"
          :content="content"
          :base-handle="baseHandle"
          :topic="topic"
          :song="song"
          :template="template"
          :author="author"
          :quoted-fess="quotedFess"
          :is-preview="isPreview"
          :exporting="exporting"
          :page-lines="slide.lines"
          :page-font="pageFont"
          :page-index="slide.pageIndex"
          :page-total="pageTotal"
        />

        <div
          v-else
          class="post-carousel__media"
          :class="{ 'is-drag-source': dragIndex === slide.mediaIndex }"
          :style="{ aspectRatio: cardAspectRatio }"
          :data-media-index="slide.mediaIndex"
        >
          <img
            v-if="slide.item.type !== 'video'"
            :src="slide.item.url || slide.item.preview"
            :alt="slide.item.name || 'Media fess'"
            loading="lazy"
            draggable="false"
          />
          <video
            v-else
            :src="slide.item.url || slide.item.preview"
            :poster="slide.item.preview"
            playsinline
            controls
            preload="metadata"
          />

          <div v-if="slide.item.uploading && !slide.item.url" class="post-carousel__overlay">
            <Loader2 :size="18" class="spin" />
            <span>Mengunggah…</span>
          </div>
          <div v-else-if="!slide.item.url" class="post-carousel__overlay is-error">
            <AlertCircle :size="18" />
            <span>Gagal diunggah</span>
          </div>

          <span class="post-carousel__kind">
            {{ slide.item.type === 'video' ? 'Video' : 'Foto' }}
          </span>

          <!-- Pegangan geser pengatur urutan media (urutan memengaruhi carousel IG) -->
          <button
            v-if="reorderEnabled"
            type="button"
            class="media-reorder-handle"
            :title="`Geser untuk memindahkan media ${slide.mediaIndex + 1}`"
            aria-label="Geser untuk mengubah urutan media"
            @pointerdown.stop.prevent="startReorder($event, slide.mediaIndex)"
            @click.stop
          >
            <GripVertical :size="14" />
          </button>
          <span v-if="reorderEnabled" class="media-order-badge">{{ slide.mediaIndex + 1 }}</span>
        </div>
      </div>
    </div>

    <div class="post-carousel__meta">
      <span v-if="slides.length > 1" class="post-carousel__counter"
        >{{ displayIndex + 1 }}/{{ slides.length }}</span
      >
      <span class="post-carousel__legend">{{ legend }}</span>
    </div>
    <p v-if="note" class="post-carousel__note">
      <AlertCircle :size="12" />
      <span>{{ note }}</span>
    </p>
  </div>
</template>

<script setup>
/**
 * PostPreviewCarousel — pratinjau postingan sebagai carousel.
 *
 * Struktur slide dibuat sama dengan yang dikirim ke Instagram:
 *   1. Kartu fess halaman 1..N (paginasi cermin backend, lihat cardPagination.js)
 *   2. Media user berurutan (hasil geser urutan) — maksimal total 10 slide.
 *
 * Media TIDAK lagi digambar di dalam kartu karena di Instagram media menjadi
 * slide tersendiri. Pegangan geser di sudut media mengubah urutan slide media
 * (emit `reorder-media`), bukan posisi kartu — kartu selalu di depan.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { GripVertical, Loader2, AlertCircle } from 'lucide-vue-next';
import PostPreview from './PostPreview.vue';
import { getTemplateByKey, getTemplateAspectRatio } from '../../config/templates';
import { paginateCardContent, ensureMeasurementFonts } from '../../utils/cardPagination';

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
  /** Aktifkan pengaturan urutan media via geser (khusus halaman composer). */
  reorderable: { type: Boolean, default: false },
});

const emit = defineEmits(['reorder-media']);

const templateDef = computed(() => getTemplateByKey(props.template));
const aspectKey = computed(() => templateDef.value.aspect || 'portrait');
const cardAspectRatio = computed(() => getTemplateAspectRatio(templateDef.value));

/* ---- Paginasi kartu (cermin mesin backend) -------------------------------- */

const fontsReady = ref(false);

onMounted(async () => {
  await ensureMeasurementFonts();
  fontsReady.value = true;
});

const pagination = computed(() => {
  // `fontsReady` sengaja dibaca: begitu Poppins selesai dimuat, paginasi
  // dihitung ulang dengan ukuran teks yang akurat (sama seperti backend).
  void fontsReady.value;
  return paginateCardContent({
    content: String(props.content || ''),
    aspectKey: aspectKey.value,
    quote: props.quotedFess || null,
    safeArea: templateDef.value?.safeArea || null,
  });
});

const pages = computed(() => pagination.value.pages);
const pageTotal = computed(() => pagination.value.totalPages);
const pageFont = computed(() => ({
  size: pagination.value.fontSize,
  lineHeight: pagination.value.lineHeight,
}));

const mediaList = computed(() => (Array.isArray(props.media) ? props.media : []));
const mediaCount = computed(() => mediaList.value.length);

/** Cermin `collectMediaItems()` backend: hanya video MP4/MOV/M4V yang diposting Meta. */
const VIDEO_URL_RE = /\.(mp4|mov|m4v)(\?.*)?$/i;

const postableMedia = computed(() =>
  mediaList.value.filter((item) => {
    if (item.type !== 'video') return true;
    const url = String(item.url || '');
    // Belum selesai diunggah (atau gagal) tetap tampil sebagai slide bersatus.
    if (!url) return true;
    return VIDEO_URL_RE.test(url);
  }),
);
const postableCount = computed(() => postableMedia.value.length);
const skippedMediaCount = computed(() => mediaCount.value - postableCount.value);

// Batas 10 slide Instagram: kartu dapat sisa slot (minimal 1), media ikut semua.
const cardSlotLimit = computed(() => Math.max(1, 10 - postableCount.value));
const cardSlides = computed(() => pages.value.slice(0, cardSlotLimit.value));
const hiddenPageCount = computed(() => Math.max(0, pages.value.length - cardSlides.value.length));

/* ---- Urutan media (geser untuk atur depan→belakang) ----------------------- */

const dragIds = ref(null);
const dragIndex = ref(-1);

const orderedMedia = computed(() => {
  const list = postableMedia.value;
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

const reorderEnabled = computed(
  () => props.reorderable && props.isPreview && !props.exporting && postableCount.value > 1,
);

/* ---- Daftar slide -------------------------------------------------------- */

const slides = computed(() => {
  const list = cardSlides.value.map((lines, index) => ({
    key: `card-${index}`,
    kind: 'card',
    lines,
    pageIndex: index,
  }));
  orderedMedia.value.forEach((item, index) => {
    list.push({ key: `media-${item.id || index}`, kind: 'media', item, mediaIndex: index });
  });
  return list;
});

const legend = computed(() => {
  const cardCount = cardSlides.value.length;
  const mediaTotal = postableCount.value;
  if (!mediaTotal) {
    return cardCount > 1
      ? `${cardCount} kartu fess, diposting berurutan seperti ini`
      : 'Beginilah kartu yang diposting ke Instagram';
  }
  return `${cardCount} kartu fess dulu, lalu ${mediaTotal} media — sama seperti di Instagram`;
});

const note = computed(() => {
  const messages = [];
  if (hiddenPageCount.value) {
    messages.push(
      `${hiddenPageCount.value} halaman kartu terakhir tidak ikut karena batas 10 slide Instagram.`,
    );
  }
  if (skippedMediaCount.value) {
    messages.push(
      `${skippedMediaCount.value} video tidak ikut ke Instagram (hanya format MP4/MOV yang didukung).`,
    );
  }
  return messages.join(' ');
});

/* ---- Indikator slide + geser-track dengan mouse --------------------------- */

const viewportEl = ref(null);
const currentIndex = ref(0);
let scrollRaf = 0;

function slideStep() {
  const viewport = viewportEl.value;
  if (!viewport) return 0;
  const slide = viewport.querySelector('.post-carousel__slide');
  if (!slide) return viewport.clientWidth || 1;
  const styles = getComputedStyle(viewport);
  const gap = parseFloat(styles.columnGap) || 0;
  return slide.getBoundingClientRect().width + gap;
}

function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    const viewport = viewportEl.value;
    if (!viewport) return;
    const index = Math.round(viewport.scrollLeft / (slideStep() || 1));
    currentIndex.value = Math.max(0, Math.min(slides.value.length - 1, index));
  });
}

watch(slides, () => {
  const max = Math.max(0, slides.value.length - 1);
  if (currentIndex.value > max) currentIndex.value = max;
});

const displayIndex = computed(() =>
  Math.min(currentIndex.value, Math.max(0, slides.value.length - 1)),
);

let scrollDrag = null;

/** Desktop: geser track dengan mouse (trackpad/touch sudah native). */
function onViewportPointerDown(event) {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  const target = event.target;
  if (target instanceof Element && target.closest('.media-reorder-handle, video, button, a')) return;
  const viewport = viewportEl.value;
  if (!viewport) return;
  scrollDrag = { startX: event.clientX, startLeft: viewport.scrollLeft, pointerId: event.pointerId };
  try {
    viewport.setPointerCapture(event.pointerId);
  } catch {
    // pointer capture tidak wajib
  }
  viewport.classList.add('is-grabbing');
  event.preventDefault();
}

function onViewportPointerMove(event) {
  if (!scrollDrag || event.pointerId !== scrollDrag.pointerId) return;
  const viewport = viewportEl.value;
  if (!viewport) return;
  viewport.scrollLeft = scrollDrag.startLeft - (event.clientX - scrollDrag.startX);
}

function endViewportDrag(event) {
  if (!scrollDrag) return;
  if (event && event.pointerId !== undefined && event.pointerId !== scrollDrag.pointerId) return;
  try {
    viewportEl.value?.releasePointerCapture?.(scrollDrag.pointerId);
  } catch {
    // sudah lepas
  }
  scrollDrag = null;
  viewportEl.value?.classList.remove('is-grabbing');
}

/* ---- Geser pegangan untuk mengubah urutan media --------------------------- */

function startReorder(event, index) {
  if (!reorderEnabled.value || dragIndex.value !== -1) return;
  dragIndex.value = index;
  dragIds.value = orderedMedia.value.map((m) => m.id);
  window.addEventListener('pointermove', onReorderMove, { passive: false });
  window.addEventListener('pointerup', finishReorder);
  window.addEventListener('pointercancel', finishReorder);
}

/** Tukar posisi item yang digeser dengan slide media yang berada di bawah pointer. */
function onReorderMove(event) {
  if (dragIndex.value < 0) return;
  event.preventDefault();

  // Dekatkan pegangan ke tepi → track ikut bergulir agar slide lain terjangkau.
  const viewport = viewportEl.value;
  if (viewport) {
    const rect = viewport.getBoundingClientRect();
    if (event.clientX > rect.right - 48) viewport.scrollLeft += 12;
    else if (event.clientX < rect.left + 48) viewport.scrollLeft -= 12;
  }

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

/* ---- Referensi kartu halaman pertama (untuk ekspor PNG) ------------------- */

const cardRefs = new Map();

function registerCardRef(el, index) {
  const node = (el && (el.cardEl || el.$el)) || null;
  if (node) cardRefs.set(index, node);
  else cardRefs.delete(index);
}

defineExpose({
  get cardEl() {
    return cardRefs.get(0) || null;
  },
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onReorderMove);
  window.removeEventListener('pointerup', finishReorder);
  window.removeEventListener('pointercancel', finishReorder);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});
</script>

<style scoped>
.post-carousel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.post-carousel__viewport {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 8px 0 12px;
  max-width: 100%;
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}

.post-carousel__viewport::-webkit-scrollbar {
  display: none;
}

.post-carousel__viewport.is-grabbing {
  cursor: grabbing;
}

.post-carousel__slide {
  flex: 0 0 calc(100% - 32px);
  min-width: 0;
  scroll-snap-align: start;
}

/* ---- slide media ---- */
.post-carousel__media {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--border-subtle);
  background: rgba(0, 0, 0, 0.55);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.post-carousel__media.is-drag-source {
  z-index: 2;
  transform: scale(0.97);
  box-shadow:
    0 0 0 2px #00e0a4,
    0 12px 24px rgba(0, 0, 0, 0.4);
}

.post-carousel__media img,
.post-carousel__media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.post-carousel__kind {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(10, 12, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  pointer-events: none;
}

.post-carousel__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(6, 8, 15, 0.55);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.post-carousel__overlay.is-error {
  background: rgba(120, 16, 24, 0.6);
}

.media-reorder-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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
  left: 8px;
  bottom: 8px;
  z-index: 3;
  min-width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(10, 12, 20, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}

/* ---- keterangan urutan slide ---- */
.post-carousel__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 2px;
}

.post-carousel__counter {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
  color: var(--text-main);
  font-size: 11.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.post-carousel__legend {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}

.post-carousel__note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--warning, #f59e0b);
}

.post-carousel__note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.spin {
  animation: carousel-spin 0.8s linear infinite;
}

@keyframes carousel-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
