<template>
  <div class="post-carousel" :class="{ 'is-exporting': exporting }">
    <!-- Jalur slide: kartu fess (1..N halaman) dan media user dalam urutan
         bebas, persis seperti carousel yang diposting (maks 10 slide). -->
    <div
      ref="viewportEl"
      class="post-carousel__viewport"
      @scroll.passive="onScroll"
      @pointerdown="onViewportPointerDown"
      @pointermove="onViewportPointerMove"
      @pointerup="endViewportDrag"
      @pointercancel="endViewportDrag"
    >
      <div
        v-for="(slide, idx) in slides"
        :key="slide.token"
        class="post-carousel__slide"
        :data-slide-token="slide.token"
      >
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

        <!-- Kartu hasil render backend (identik dengan PNG yang diposting) -->
        <img
          v-else-if="slide.kind === 'card-image'"
          class="post-carousel__card-image"
          :src="slide.src"
          :alt="`Kartu fess halaman ${slide.pageIndex + 1}`"
          :style="{ aspectRatio: cardAspectRatio }"
          draggable="false"
        />

        <div
          v-else
          class="post-carousel__media"
          :class="{ 'is-drag-source': dragToken === slide.token }"
          :style="{ aspectRatio: cardAspectRatio }"
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

          <!-- Pegangan geser: media bisa dipindah ke posisi slide mana pun. -->
          <button
            v-if="reorderEnabled"
            type="button"
            class="media-reorder-handle"
            :title="`Geser untuk memindahkan slide media ke posisi ${slide.slideIndex + 1}`"
            aria-label="Geser untuk mengubah urutan slide media"
            @pointerdown.stop.prevent="startReorder($event, slide.token)"
            @click.stop
          >
            <GripVertical :size="14" />
          </button>
          <span v-if="reorderEnabled" class="media-order-badge">{{ slide.slideIndex + 1 }}</span>
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
 *   kartu fess halaman 1..N (paginasi cermin backend, lihat cardPagination.js)
 *   dan media user dalam urutan bebas — maksimal total 10 slide.
 *
 * Media TIDAK digambar di dalam kartu karena di Instagram media menjadi slide
 * tersendiri. Pegangan geser di sudut media memindahkan media ke posisi mana
 * pun, termasuk menjadi slide pertama (emit `reorder-slides`). Halaman kartu
 * tetap berurutan agar isi cerita tidak tertukar.
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
  /** Aktifkan pengaturan urutan slide media via geser (khusus composer). */
  reorderable: { type: Boolean, default: false },
  /** Urutan slide tersimpan: ["media:<id>", "card:0", ...]. */
  carouselOrder: { type: Array, default: () => [] },
  /**
   * Kartu hasil render backend (PNG data URI). Bila diisi, slide kartu memakai
   * gambar ini — bukan replay DOM — supaya pratinjau identik dengan hasil
   * render yang diposting.
   */
  cardImages: { type: Array, default: () => [] },
});

const emit = defineEmits(['reorder-slides']);

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

/* ---- Urutan slide bebas (kartu + media) ---------------------------------- */

const dragToken = ref('');
const dragOrder = ref(null);

/** Render backend siap dipakai → slide kartu memakai PNG hasil render. */
const hasRenderedCards = computed(
  () => Array.isArray(props.cardImages) && props.cardImages.length > 0,
);

const renderedCardSlides = computed(() =>
  (hasRenderedCards.value ? props.cardImages : [])
    .slice(0, cardSlotLimit.value)
    .map((src, index) => ({
      kind: 'card-image',
      src,
      pageIndex: index,
    })),
);

const cardSlideDefs = computed(() =>
  hasRenderedCards.value
    ? renderedCardSlides.value
    : cardSlides.value.map((lines, index) => ({
        kind: 'card',
        lines,
        pageIndex: index,
      })),
);

const cardCount = computed(() => cardSlideDefs.value.length);

const hiddenPageCount = computed(() =>
  hasRenderedCards.value
    ? Math.max(0, props.cardImages.length - renderedCardSlides.value.length)
    : Math.max(0, pages.value.length - cardSlides.value.length),
);

function mediaToken(item, index) {
  return `media:${item.id || index}`;
}

/** Token default: semua kartu dulu, lalu media (perilaku lama). */
const defaultTokens = computed(() => [
  ...cardSlideDefs.value.map((_, index) => `card:${index}`),
  ...postableMedia.value.map((item, index) => mediaToken(item, index)),
]);

const cardByToken = computed(
  () => new Map(cardSlideDefs.value.map((slide, index) => [`card:${index}`, slide])),
);

const mediaByToken = computed(
  () =>
    new Map(
      postableMedia.value.map((item, index) => [
        mediaToken(item, index),
        { item, mediaIndex: index },
      ]),
    ),
);

/**
 * Terapkan urutan dari parent. Token yang tidak relevan (media dihapus,
 * halaman kartu berubah) dilewati, lalu sisa slide ditempel di akhir.
 */
const resolvedOrder = computed(() => {
  if (dragOrder.value) return dragOrder.value;
  const allowed = new Set(defaultTokens.value);
  const result = [];
  const requested = Array.isArray(props.carouselOrder) ? props.carouselOrder : [];

  for (const rawToken of requested) {
    const token = String(rawToken || '').trim();
    if (!allowed.has(token) || result.includes(token)) continue;
    result.push(token);
  }
  for (const token of defaultTokens.value) {
    if (!result.includes(token)) result.push(token);
  }
  return result;
});

const slides = computed(() => {
  const list = [];
  for (const token of resolvedOrder.value) {
    const card = cardByToken.value.get(token);
    if (card) {
      list.push({ ...card, token, slideIndex: list.length });
      continue;
    }
    const media = mediaByToken.value.get(token);
    if (media) {
      list.push({
        token,
        kind: 'media',
        item: media.item,
        mediaIndex: media.mediaIndex,
        slideIndex: list.length,
      });
    }
  }
  return list;
});

const reorderEnabled = computed(
  () =>
    props.reorderable &&
    props.isPreview &&
    !props.exporting &&
    postableCount.value > 0 &&
    slides.value.length > 1,
);

const legend = computed(() => {
  const cards = cardCount.value;
  const mediaTotal = postableCount.value;
  if (!mediaTotal) {
    return cards > 1
      ? `${cards} kartu fess, diposting berurutan seperti ini`
      : 'Beginilah kartu yang diposting ke Instagram';
  }
  return `${cards} kartu + ${mediaTotal} media — urutan slide bebas seperti di Instagram`;
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
  if (target instanceof Element && target.closest('.media-reorder-handle, video, button, a'))
    return;
  const viewport = viewportEl.value;
  if (!viewport) return;
  scrollDrag = {
    startX: event.clientX,
    startLeft: viewport.scrollLeft,
    pointerId: event.pointerId,
  };
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

/* ---- Geser pegangan untuk mengubah urutan slide -------------------------- */

function startReorder(event, token) {
  if (!reorderEnabled.value || dragToken.value) return;
  dragToken.value = token;
  dragOrder.value = resolvedOrder.value.slice();
  window.addEventListener('pointermove', onReorderMove, { passive: false });
  window.addEventListener('pointerup', finishReorder);
  window.addEventListener('pointercancel', finishReorder);
}

/** Pindahkan media yang digeser ke posisi slide yang berada di bawah pointer. */
function onReorderMove(event) {
  if (!dragToken.value) return;
  event.preventDefault();

  // Dekatkan pegangan ke tepi → track ikut bergulir agar slide lain terjangkau.
  const viewport = viewportEl.value;
  if (viewport) {
    const rect = viewport.getBoundingClientRect();
    if (event.clientX > rect.right - 48) viewport.scrollLeft += 12;
    else if (event.clientX < rect.left + 48) viewport.scrollLeft -= 12;
  }

  const el = document.elementFromPoint(event.clientX, event.clientY);
  const tile = el && typeof el.closest === 'function' ? el.closest('[data-slide-token]') : null;
  if (!tile) return;
  const targetToken = tile.getAttribute('data-slide-token');
  if (!targetToken || targetToken === dragToken.value) return;

  const order = (dragOrder.value || []).slice();
  const from = order.indexOf(dragToken.value);
  const to = order.indexOf(targetToken);
  if (from < 0 || to < 0) return;

  const [moved] = order.splice(from, 1);
  order.splice(to, 0, moved);
  dragOrder.value = order;
}

function finishReorder() {
  window.removeEventListener('pointermove', onReorderMove);
  window.removeEventListener('pointerup', finishReorder);
  window.removeEventListener('pointercancel', finishReorder);
  const order = dragOrder.value;
  dragToken.value = '';
  if (Array.isArray(order) && order.length) {
    emit('reorder-slides', order.slice());
    // Lepaskan urutan lokal setelah parent menyinkronkan prop-nya.
    nextTick(() => {
      if (!dragToken.value) dragOrder.value = null;
    });
  } else {
    dragOrder.value = null;
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

/* ---- slide kartu hasil render ---- */
.post-carousel__card-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 18px;
  border: 1px solid var(--border-subtle);
  background: rgba(0, 0, 0, 0.35);
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
