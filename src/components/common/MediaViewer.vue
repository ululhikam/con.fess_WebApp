<template>
  <Teleport to="body">
    <div
      class="mv-root"
      role="dialog"
      aria-modal="true"
      aria-label="Lihat media"
      @click="onRootClick"
    >
      <!-- Backdrop -->
      <div class="mv-backdrop" :style="backdropStyle"></div>

      <!-- Header: counter + tutup -->
      <div class="mv-topbar" :class="{ 'mv-chrome-hidden': !chromeVisible }" @click.stop>
        <span class="mv-counter">{{ activeIndex + 1 }} / {{ items.length }}</span>
        <button type="button" class="mv-close" title="Tutup (ESC)" aria-label="Tutup" @click.stop="requestClose">
          <X :size="20" />
        </button>
      </div>

      <!-- Stage -->
      <div
        class="mv-stage"
        @touchstart.passive="onTouchStart"
        @touchmove="onTouchMove"
        @touchend.passive="onTouchEnd"
        @touchcancel.passive="onTouchEnd"
      >
        <div class="mv-track" :style="trackStyle">
          <div ref="flightRef" class="mv-flight" :style="flightStyle">
            <div class="mv-zoom" :style="zoomStyle">
              <img
                v-if="activeItem && activeItem.type === 'image'"
                :key="`img-${activeIndex}`"
                :src="activeItem.url"
                :alt="activeItem.caption || 'Media'"
                class="mv-img"
                draggable="false"
                @click.stop="onMediaClick"
              />
              <video
                v-else-if="activeItem"
                :key="`vid-${activeIndex}`"
                :src="activeItem.url"
                :poster="activeItem.thumbnail || undefined"
                class="mv-video"
                controls
                autoplay
                muted
                playsinline
                @click.stop="onMediaClick"
              />
            </div>
          </div>
        </div>

        <!-- Navigasi (desktop) -->
        <button
          v-if="items.length > 1 && activeIndex > 0"
          type="button"
          class="mv-arrow left"
          title="Sebelumnya"
          aria-label="Sebelumnya"
          @click.stop="goTo(activeIndex - 1, -1)"
        >
          <ChevronLeft :size="26" />
        </button>
        <button
          v-if="items.length > 1 && activeIndex < items.length - 1"
          type="button"
          class="mv-arrow right"
          title="Selanjutnya"
          aria-label="Selanjutnya"
          @click.stop="goTo(activeIndex + 1, 1)"
        >
          <ChevronRight :size="26" />
        </button>
      </div>

      <!-- Panel info (tampilan post tunggal ala X/Threads) -->
      <div class="mv-infobar" :class="{ 'mv-chrome-hidden': !chromeVisible }" @click.stop>
        <div class="mv-info-head">
          <div class="mv-avatar" :style="{ background: post?.avatarBg || '#0038FF' }">
            <img v-if="post?.avatarImg" :src="post.avatarImg" alt="" />
            <span v-else>{{ post?.avatarText || (post?.handle || '@fess').slice(1, 3).toUpperCase() }}</span>
          </div>
          <div class="mv-info-meta">
            <span class="mv-info-handle">{{ post?.handle || post?.senderHandle || '@anonim' }}</span>
            <span class="mv-info-time">{{ post?.time || 'Baru saja' }}</span>
          </div>
          <span v-if="activeItem?.caption" class="mv-info-caption-inline">{{ activeItem.caption }}</span>
        </div>
        <p class="mv-info-content">{{ post?.content }}</p>
        <p v-if="items.length > 1" class="mv-info-hint">Geser untuk lihat media lain • cubit untuk menutup</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * MediaViewer.vue — penampil media full-screen gaya X/Threads.
 *
 * - Animasi "menyatu": saat dibuka, media terbang dari posisi tile di kolase
 *   (originRect) ke tengah; saat ditutup, animasi berbalik kembali ke tile.
 * - Gesture: geser kiri/kanan = media berikut/sebelumnya, geser ke bawah =
 *   tutup, cubit (pinch) = zoom; cubit mengecil < 0.75 = menutup (menyatu balik).
 * - Ketuk media = tampil/sembunyikan panel; ketuk latar = tutup; ESC = tutup.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  items: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 },
  /** DOMRect tile asal (plain object) untuk animasi menyatu. */
  originRect: { type: Object, default: null },
  /** Fungsi (index) → DOMRect tile saat ini, dipakai agar animasi tutup kembali ke tile yang benar. */
  resolveOrigin: { type: Function, default: null },
  /** Info post untuk panel bawah (handle, avatarText, avatarBg, avatarImg, content, time). */
  post: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const activeIndex = ref(Math.min(Math.max(0, props.initialIndex), Math.max(0, props.items.length - 1)));
const activeItem = computed(() => props.items[activeIndex.value] || null);

/* ── Animasi menyatu (merge) ─────────────────────────────────────────────── */
const flightRef = ref(null);
const flightStyle = ref({ opacity: 0, transition: 'none' });
const backdropReady = ref(false);
const closing = ref(false);
let mergeOrigin = null;

function rectsTransform(originRect, targetRect) {
  const sx = targetRect.width > 0 ? originRect.width / targetRect.width : 1;
  const sy = targetRect.height > 0 ? originRect.height / targetRect.height : 1;
  return {
    transform: `translate(${originRect.left - targetRect.left}px, ${originRect.top - targetRect.top}px) scale(${sx}, ${sy})`,
    transformOrigin: 'top left',
  };
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';

  await nextTick();
  const el = flightRef.value;

  // Ukur kotak target — kalau gambar belum selesai dimuat, tunggu singkat
  // (maks 120ms) supaya animasi "menyatu" tetap presisi.
  if (props.originRect && el) {
    let target = el.getBoundingClientRect();
    if (target.height <= 1) {
      const imgEl = el.querySelector('img');
      if (imgEl && !imgEl.complete) {
        await new Promise((resolve) => {
          const done = () => resolve();
          imgEl.addEventListener('load', done, { once: true });
          imgEl.addEventListener('error', done, { once: true });
          setTimeout(done, 120);
        });
        target = el.getBoundingClientRect();
      }
    }

    if (target.height > 0 && target.width > 0) {
      mergeOrigin = props.originRect;
      const start = rectsTransform(props.originRect, target);

      // Posisi awal: tepat menutupi tile asal.
      flightStyle.value = { ...start, borderRadius: '16px', opacity: 0, transition: 'none' };
      await nextTick();
      flightStyle.value = { ...start, borderRadius: '16px', opacity: 1, transition: 'none' };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          backdropReady.value = true;
          flightStyle.value = {
            transform: 'translate(0px, 0px) scale(1, 1)',
            transformOrigin: 'top left',
            borderRadius: '0px',
            opacity: 1,
            transition: 'transform 340ms cubic-bezier(0.22, 0.61, 0.36, 1), border-radius 340ms ease',
          };
        });
      });
      return;
    }
  }

  // Fallback: fade sederhana (tanpa rect asal).
  backdropReady.value = true;
  flightStyle.value = { opacity: 1, transition: 'opacity 140ms ease' };
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

/* ── Gesture state ───────────────────────────────────────────────────────── */
const dragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
const slideReset = ref(false);
let startX = 0;
let startY = 0;
let moved = false;
let animatingSlide = false;

const pinching = ref(false);
let pinchStartDist = 0;
let pinchStartScale = 1;
const zoomScale = ref(1);

const chromeVisible = ref(true);

const trackStyle = computed(() => ({
  transform: `translate3d(${dragX.value}px, ${dragY.value}px, 0)`,
  transition: dragging.value || slideReset.value ? 'none' : 'transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1)',
}));

const zoomStyle = computed(() => ({
  transform: `scale(${zoomScale.value})`,
  transition: pinching.value ? 'none' : 'transform 220ms ease',
}));

const backdropStyle = computed(() => {
  let op = closing.value || !backdropReady.value ? 0 : 1;
  if (pinching.value && zoomScale.value < 1) op = Math.max(0.1, zoomScale.value);
  return {
    opacity: op,
    transition: pinching.value ? 'none' : 'opacity 240ms ease',
  };
});

function touchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    pinching.value = true;
    pinchStartDist = touchDist(e.touches);
    pinchStartScale = zoomScale.value;
    dragging.value = false;
  } else if (e.touches.length === 1) {
    dragging.value = true;
    moved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragX.value = 0;
    dragY.value = 0;
  }
}

function onTouchMove(e) {
  if (pinching.value && e.touches.length === 2 && pinchStartDist > 0) {
    const scale = pinchStartScale * (touchDist(e.touches) / pinchStartDist);
    zoomScale.value = Math.min(4, Math.max(0.45, scale));
    return;
  }
  if (!dragging.value || e.touches.length !== 1) return;

  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;

  if (Math.abs(dx) >= Math.abs(dy)) {
    dragX.value = dx;
    dragY.value = 0;
  } else {
    // Geser vertikal: hanya ke bawah (untuk menutup), dengan peredaman.
    dragY.value = Math.max(0, dy) * 0.75;
    dragX.value = 0;
  }
}

function onTouchEnd(e) {
  if (pinching.value) {
    if (e.touches.length > 0) return; // masih ada jari menempel
    const scale = zoomScale.value;
    pinching.value = false;
    if (scale < 0.75) {
      zoomScale.value = 1;
      requestClose();
      return;
    }
    zoomScale.value = Math.min(4, Math.max(1, scale));
    return;
  }

  if (!dragging.value) return;
  dragging.value = false;

  const dx = dragX.value;
  const dy = dragY.value;

  if (dy > 110 && Math.abs(dy) > Math.abs(dx)) {
    requestClose();
    dragY.value = 0;
    return;
  }
  if (dx <= -55 && activeIndex.value < props.items.length - 1) {
    goTo(activeIndex.value + 1, 1);
    return;
  }
  if (dx >= 55 && activeIndex.value > 0) {
    goTo(activeIndex.value - 1, -1);
    return;
  }
  dragX.value = 0;
  dragY.value = 0;
}

function goTo(nextIndex, dir) {
  if (animatingSlide || nextIndex < 0 || nextIndex >= props.items.length) return;
  animatingSlide = true;
  const w = window.innerWidth || 420;

  // Geser keluar
  dragging.value = false;
  dragX.value = -dir * w;
  dragY.value = 0;

  setTimeout(() => {
    activeIndex.value = nextIndex;
    chromeVisible.value = true;
    // Mulai dari sisi seberang lalu masuk
    slideReset.value = true;
    dragX.value = dir * w * 0.55;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slideReset.value = false;
        dragX.value = 0;
        setTimeout(() => {
          animatingSlide = false;
        }, 260);
      });
    });
  }, 230);
}

/* ── Interaksi ───────────────────────────────────────────────────────────── */
function onMediaClick() {
  if (moved) return;
  chromeVisible.value = !chromeVisible.value;
}

function onRootClick(e) {
  const mediaEl = flightRef.value;
  if (mediaEl && mediaEl.contains(e.target)) {
    onMediaClick();
    return;
  }
  requestClose();
}

function onKeydown(e) {
  if (e.key === 'Escape') requestClose();
  else if (e.key === 'ArrowRight' && activeIndex.value < props.items.length - 1) goTo(activeIndex.value + 1, 1);
  else if (e.key === 'ArrowLeft' && activeIndex.value > 0) goTo(activeIndex.value - 1, -1);
}

function requestClose() {
  if (closing.value) return;
  closing.value = true;

  const el = flightRef.value;

  // Tentukan tile tujuan animasi tutup: pakai resolver live (tile media yang
  // sedang aktif) supaya tetap pas walau user sudah menggeser ke media lain.
  let origin = mergeOrigin;
  if (typeof props.resolveOrigin === 'function') {
    const live = props.resolveOrigin(activeIndex.value);
    if (live && live.width > 0 && live.height > 0) origin = live;
  }

  if (origin && el && el.getBoundingClientRect().height > 0) {
    const target = el.getBoundingClientRect();
    const back = rectsTransform(origin, target);
    flightStyle.value = {
      ...back,
      borderRadius: '16px',
      opacity: 1,
      transition:
        'transform 300ms cubic-bezier(0.4, 0, 0.6, 1), border-radius 300ms ease, opacity 300ms ease',
    };
    setTimeout(() => emit('close'), 300);
  } else {
    flightStyle.value = { opacity: 0, transition: 'opacity 180ms ease' };
    setTimeout(() => emit('close'), 180);
  }
}
</script>

<style scoped>
.mv-root {
  position: fixed;
  inset: 0;
  z-index: 1200;
  overflow: hidden;
  user-select: none;
}

.mv-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 10, 16, 0.94);
  backdrop-filter: blur(14px);
}

.mv-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-y;
}

.mv-track {
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.mv-flight {
  display: inline-block;
  overflow: hidden;
  will-change: transform;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
}

.mv-zoom {
  display: inline-block;
  transform-origin: center center;
  will-change: transform;
}

.mv-img {
  display: block;
  max-width: min(94vw, 1050px);
  max-height: min(78vh, 1050px);
  object-fit: contain;
  border-radius: 2px;
}

.mv-video {
  display: block;
  width: min(94vw, 1000px);
  max-height: 78vh;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 2px;
}

/* Top bar */
.mv-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  z-index: 5;
  transition: opacity 200ms ease, transform 200ms ease;
}

.mv-counter {
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.mv-close {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.mv-close:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: scale(1.05);
}

/* Navigasi */
.mv-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: background 0.15s ease;
}

.mv-arrow:hover {
  background: rgba(255, 255, 255, 0.16);
}

.mv-arrow.left {
  left: 14px;
}

.mv-arrow.right {
  right: 14px;
}

/* Panel bawah ala X/Threads */
.mv-infobar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 18px calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, rgba(8, 10, 16, 0), rgba(8, 10, 16, 0.92) 34%);
  z-index: 4;
  transition: opacity 220ms ease, transform 220ms ease;
}

.mv-chrome-hidden {
  opacity: 0;
  pointer-events: none;
}

.mv-topbar.mv-chrome-hidden {
  transform: translateY(-8px);
}

.mv-infobar.mv-chrome-hidden {
  transform: translateY(10px);
}

.mv-info-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mv-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

.mv-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mv-info-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.mv-info-handle {
  color: #fff;
  font-size: 14.5px;
  font-weight: 800;
}

.mv-info-time {
  color: rgba(255, 255, 255, 0.55);
  font-size: 12.5px;
}

.mv-info-caption-inline {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

.mv-info-content {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 1.5;
  max-height: 4.6em;
  overflow-y: auto;
  scrollbar-width: thin;
}

.mv-info-hint {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 11.5px;
  font-weight: 600;
}

@media (max-width: 600px) {
  .mv-arrow {
    display: none;
  }

  .mv-info-content {
    max-height: 3.2em;
  }
}
</style>
