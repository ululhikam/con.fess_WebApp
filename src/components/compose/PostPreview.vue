<template>
  <article
    ref="cardEl"
    class="post-card"
    :class="[`ink-${templateDef.ink}`, { 'is-exporting': exporting }]"
    :style="wrapperStyle"
  >
    <div v-if="!templateDef.bgImage" class="post-card__texture" aria-hidden="true" :style="textureStyle" />

    <!-- THEMED TEMPLATE INNER (Spotify, Typewriter, Journal, Locker, Clay) -->
    <!-- Outer wrapper is a flex-column: [watermark-top?] [card-image+overlay] [watermark-bottom?] -->
    <div
      v-if="templateDef.bgImage"
      class="post-card__themed-wrap"
    >
      <!-- Top watermark OUTSIDE the card border —— styled per-template via watermarkStyle -->
      <div v-if="templateDef.watermarkPos === 'top'" class="themed-watermark themed-watermark--top" :style="watermarkStyle">
        <span class="themed-watermark__text">{{ templateDef.watermarkLabel }}{{ baseHandle }}</span>
        <span v-if="pageTotal > 1" class="themed-watermark__page">{{ footerRight }}</span>
      </div>

      <!-- Card image + text overlay -->
      <div
        ref="themedCardEl"
        class="post-card__themed-inner"
        :class="`theme-${templateDef.theme || 'custom'}`"
        :style="cardStyle"
      >
        <!-- Main content flow inside safeArea — font/color driven by per-template textBodyStyle -->
        <div ref="flowEl" class="themed-flow" :style="safeAreaPadding">
          <div
            v-if="pageLines"
            class="themed-body themed-body--paged"
            :style="{ ...textBodyStyle, ...pagedBodyStyle }"
          >
            <span v-if="showPlaceholder" class="themed-placeholder">Tulis fessmu…</span>
            <template v-else>
              <span v-for="(line, i) in pageLines" :key="i" class="themed-line">{{ line || '\u00A0' }}</span>
            </template>
          </div>
          <p v-else-if="displayContent" class="themed-body" :style="textBodyStyle">{{ displayContent }}</p>
          <p v-else class="themed-body themed-body--empty" :style="textBodyStyle">Tulis fessmu…</p>

          <!-- Quoted Fess Preview -->
          <div v-if="quotedFess" ref="quoteEl" class="themed-quoted">
            <div class="quoted-meta">
              <strong>{{ quotedFess.handle || quotedFess.senderHandle }}</strong>
              <span>• {{ quotedFess.time || 'Fess' }}</span>
            </div>
            <p class="quoted-text">{{ quotedFess.content }}</p>
          </div>
        </div>
      </div>
      <!-- End card image + text overlay -->

      <!-- Bottom watermark OUTSIDE the card border —— styled per-template via watermarkStyle -->
      <div v-if="templateDef.watermarkPos === 'bottom'" class="themed-watermark themed-watermark--bottom" :style="watermarkStyle">
        <span class="themed-watermark__text">{{ templateDef.watermarkLabel }}{{ baseHandle }}</span>
        <span v-if="pageTotal > 1" class="themed-watermark__page">{{ footerRight }}</span>
      </div>
    </div>

    <!-- STANDARD INNER (for Gradient/Texture Cards) -->
    <div v-else class="post-card__inner">
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

      <!-- Isi fess + kotak kutipan (satu blok agar kutipan menempel di bawah teks) -->
      <div ref="flowEl" class="post-card__flow">
        <div
          v-if="pageLines"
          class="post-card__body post-card__body--paged"
          :style="pagedBodyStyle"
        >
          <span v-if="showPlaceholder" class="post-card__placeholder">Tulis fessmu…</span>
          <template v-else>
            <span v-for="(line, i) in pageLines" :key="i" class="post-card__line">{{
              line || '\u00A0'
            }}</span>
          </template>
        </div>
        <p v-else-if="displayContent" class="post-card__body">{{ displayContent }}</p>
        <p v-else class="post-card__body post-card__body--empty">Tulis fessmu…</p>

        <!-- Quoted Fess Preview -->
        <div v-if="quotedFess" ref="quoteEl" class="post-card__quoted">
          <div class="quoted-meta">
            <strong>{{ quotedFess.handle || quotedFess.senderHandle }}</strong>
            <span>• {{ quotedFess.time || 'Fess' }}</span>
          </div>
          <p class="quoted-text">{{ quotedFess.content }}</p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="post-card__footer">
        <span class="post-card__platform">Instagram Feed · {{ baseHandle }}</span>
        <span class="post-card__footer-right">{{ footerRight }}</span>
      </footer>
    </div>
  </article>
</template>

<script setup>
/**
 * PostPreview renders the *exportable* post card.
 *
 * The card is a fixed-aspect canvas (1:1 / 4:5) painted with the template
 * background. Everything drawn on it is self-contained — colours come from the
 * template's `ink`, never from app theme variables — so the node can be
 * rasterised to a PNG and posted to Instagram without losing styling.
 *
 * Isi fess dirender per baris (`pageLines`) hasil `paginateCardContent()` —
 * cermin mesin paginasi backend — sehingga pembagian halaman kartu di pratinjau
 * sama dengan carousel yang benar-benar diposting. Media user TIDAK ikut ke
 * dalam kartu: di Instagram media menjadi slide carousel tersendiri.
 *
 * Karena pratinjau lebih kecil dari kanvas 1080 px backend, ukuran font teks
 * diskalakan proporsional (`pageFont` × lebar kartu / 1080) lalu dirapatkan
 * sedikit bila perlu agar semua baris halaman muat tanpa terpotong.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Music } from 'lucide-vue-next';
import { getTemplateByKey, getTemplateAspectRatio } from '../../config/templates';
import { CARD_CANVAS_WIDTH } from '../../utils/cardPagination';
import { useTopics } from '../../composables/useTopics';
import { useBases } from '../../composables/useBases';

const props = defineProps({
  content: { type: String, default: '' },
  baseHandle: { type: String, default: '@anonfess' },
  topic: { type: String, default: '' },
  song: { type: Object, default: null },
  template: { type: String, default: 'default' },
  author: { type: Object, default: null },
  quotedFess: { type: Object, default: null },
  isPreview: { type: Boolean, default: true },
  /** True while html-to-image is rasterising — freezes animations/jitter. */
  exporting: { type: Boolean, default: false },
  /** Baris teks halaman ini (hasil paginasi backend). null = mode lama (tanpa paginasi). */
  pageLines: { type: Array, default: null },
  /** Ukuran font kanvas backend halaman ini: { size, lineHeight } (skala 1080 px). */
  pageFont: { type: Object, default: null },
  /** Indeks halaman (0-based) & total halaman carousel — untuk penomoran footer. */
  pageIndex: { type: Number, default: 0 },
  pageTotal: { type: Number, default: 1 },
});

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

/** Outer article style — for themed templates, no background here (it's on the inner card div). */
const wrapperStyle = computed(() => {
  const t = templateDef.value;
  if (t.bgImage) {
    return { '--card-accent': t.accent };
  }
  return {
    aspectRatio: getTemplateAspectRatio(t),
    background: t.background,
    '--card-accent': t.accent,
  };
});

/** Inner card div style for themed templates: holds the SVG bg image + aspect ratio. */
const cardStyle = computed(() => {
  const t = templateDef.value;
  if (t.bgImage) {
    return {
      aspectRatio: getTemplateAspectRatio(t),
      background: `url("${t.bgImage}") center center / cover no-repeat`,
    };
  }
  return {};
});

/** Expose safe-area as padding on the text overlay div (themed templates only). */
const safeAreaPadding = computed(() => {
  const sa = templateDef.value?.safeArea;
  if (!sa) return {};
  return {
    paddingTop: sa.top,
    paddingBottom: sa.bottom,
    paddingLeft: sa.left,
    paddingRight: sa.right,
  };
});

const textureStyle = computed(() =>
  !templateDef.value.bgImage && templateDef.value.texture
    ? { backgroundImage: templateDef.value.texture }
    : null,
);

/**
 * Per-template inline text style (themed templates only).
 * Merges fontFamily from template config with the textStyle object.
 * Falls back to safe defaults if the template has no textStyle.
 */
const textBodyStyle = computed(() => {
  const t = templateDef.value;
  if (!t.bgImage) return {};
  return {
    fontFamily: t.fontFamily || 'inherit',
    ...(t.textStyle || {}),
  };
});

/** Per-template inline watermark/label style (outside-card labels). */
const watermarkStyle = computed(() => {
  const t = templateDef.value;
  if (!t.bgImage) return {};
  return t.labelStyle || {};
});

/** Fallback mode lama (tanpa paginasi): potong isi agar kartu tidak meluber. */
const displayContent = computed(() => {
  if (props.isPreview && props.content.length > 420) return props.content.slice(0, 420) + '…';
  return props.content;
});

const showPlaceholder = computed(
  () =>
    Array.isArray(props.pageLines) &&
    !String(props.content || '').trim() &&
    !props.quotedFess,
);

/* ---- Skala teks pratinjau → menyesuaikan ruang yang tersedia ------------- */

const flowEl = ref(null);
const quoteEl = ref(null);
const themedCardEl = ref(null);

const cardWidth = ref(0);
const flowHeight = ref(0);
const quoteHeight = ref(0);
const flowGap = ref(0);

let sizeObserver = null;

function measureGeometry() {
  // For themed templates the aspect-ratio is on themedCardEl, not the article.
  const measuredCard = themedCardEl.value || cardEl.value;
  if (measuredCard) cardWidth.value = measuredCard.getBoundingClientRect().width || 0;

  const flow = flowEl.value;
  if (flow) {
    flowHeight.value = flow.getBoundingClientRect().height || 0;
    const styles = typeof getComputedStyle === 'function' ? getComputedStyle(flow) : null;
    const gap = styles ? parseFloat(styles.rowGap) : NaN;
    flowGap.value = Number.isFinite(gap) ? gap : 0;
  }

  const quote = quoteEl.value;
  quoteHeight.value = quote ? quote.getBoundingClientRect().height || 0 : 0;
}

function observeElement(el, prev) {
  if (!sizeObserver) return;
  if (prev) sizeObserver.unobserve(prev);
  if (el) sizeObserver.observe(el);
}

onMounted(() => {
  measureGeometry();
  if (typeof ResizeObserver !== 'undefined') {
    sizeObserver = new ResizeObserver(() => measureGeometry());
    if (themedCardEl.value) sizeObserver.observe(themedCardEl.value);
    else if (cardEl.value) sizeObserver.observe(cardEl.value);
    if (flowEl.value) sizeObserver.observe(flowEl.value);
    if (quoteEl.value) sizeObserver.observe(quoteEl.value);
  }
});

watch(
  themedCardEl,
  (el, prev) => {
    observeElement(el, prev);
    measureGeometry();
  },
  { flush: 'post' },
);

watch(
  flowEl,
  (el, prev) => {
    observeElement(el, prev);
    measureGeometry();
  },
  { flush: 'post' },
);

watch(
  quoteEl,
  (el, prev) => {
    observeElement(el, prev);
    measureGeometry();
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  sizeObserver?.disconnect();
  sizeObserver = null;
});

/** Skala kanvas: lebar kartu di layar ÷ lebar kanvas backend (1080 px). */
const cardScale = computed(() => (cardWidth.value > 0 ? cardWidth.value / CARD_CANVAS_WIDTH : 0));

const pageLineCount = computed(() => (Array.isArray(props.pageLines) ? props.pageLines.length : 0));

/**
 * Faktor pemadatan bila (baris × tinggi baris) melebihi ruang tersedia di
 * dalam kartu — mis. halaman pertama yang menyisakan tempat untuk kotak
 * kutipan. Tujuannya: seluruh baris selalu terlihat utuh.
 */
const bodyFitScale = computed(() => {
  const font = props.pageFont;
  const scale = cardScale.value;
  if (!font || !scale || !pageLineCount.value) return 1;

  const needed = pageLineCount.value * font.lineHeight * scale;
  if (!needed) return 1;

  const reserved = quoteHeight.value ? quoteHeight.value + flowGap.value : 0;
  const available = flowHeight.value - reserved;
  if (available <= 0) return 1;

  return Math.max(0.45, Math.min(1, (available - 1) / needed));
});

const pagedBodyStyle = computed(() => {
  const font = props.pageFont;
  const scale = cardScale.value * bodyFitScale.value;
  if (!font || !scale) return {};
  return {
    fontSize: `${(font.size * scale).toFixed(2)}px`,
    lineHeight: `${(font.lineHeight * scale).toFixed(2)}px`,
  };
});

/** Teks kanan footer — nomor halaman saat carousel, alamat situs saat 1 halaman. */
const footerRight = computed(() =>
  props.pageTotal > 1 ? `${props.pageIndex + 1}/${props.pageTotal}` : 'fessncurious.vercel.app',
);
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
.ink-light .post-card__footer-right,
.ink-light .post-card__chip {
  color: #ffffff;
}
.ink-light .post-card__name,
.ink-light .post-card__footer-right,
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

.ink-dark {
  color: #1c1917;
}
.ink-dark .post-card__body,
.ink-dark .post-card__handle,
.ink-dark .post-card__name,
.ink-dark .post-card__footer-right,
.ink-dark .post-card__chip {
  color: #1c1917;
}
.ink-dark .post-card__name,
.ink-dark .post-card__footer-right,
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

/* ---- isi fess + kutipan ---- */
.post-card__flow {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2.4vw, 16px);
}

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

/* Mode paginasi: tinggi mengikuti jumlah baris (bukan mengisi ruang),
   supaya kotak kutipan menempel persis di bawah baris terakhir. */
.post-card__body--paged {
  flex: 0 0 auto;
  overflow: hidden;
}

.post-card__line {
  display: block;
  white-space: nowrap;
}

.post-card__placeholder {
  font-style: italic;
  font-weight: 400;
  opacity: 0.82;
}

.post-card__body--empty {
  font-style: italic;
  font-weight: 400;
}

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

/* ---- footer (mirror kartu IG: branding + nomor halaman / alamat situs) ---- */
.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 4px;
}

.post-card__platform {
  font-size: clamp(11px, 2.9vw, 13px);
  font-weight: 800;
}

.post-card__footer-right {
  font-size: clamp(10.5px, 2.7vw, 12.5px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---- export state ---- */
.is-exporting .post-card__texture {
  opacity: 1;
}

/* ---- Themed Templates (Spotify, Typewriter, Journal, Locker, Clay) ---- */

/*
 * Layout for themed templates:
 *
 *  .post-card (article, no overflow hidden, no border-radius)
 *    └─ .post-card__themed-wrap (flex column)
 *         ├─ .themed-watermark--top   (OUTSIDE card, above image)
 *         ├─ .post-card__themed-inner (the actual card: has aspect-ratio + bg-image + border-radius)
 *         │    └─ .themed-flow (position:absolute overlay, padded by safeArea)
 *         │         └─ .themed-body / .themed-body--paged
 *         └─ .themed-watermark--bottom (OUTSIDE card, below image)
 *
 * This ensures text never overflows the card border, and watermarks sit
 * outside the card image entirely.
 */

/* Override: themed templates need no box-shadow/overflow on the article wrapper */
.post-card:has(.post-card__themed-wrap) {
  overflow: visible;
  border-radius: 0;
  box-shadow: none;
  background: transparent !important;
}

.post-card__themed-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* The card itself — holds the SVG background image, has its own border-radius + shadow */
.post-card__themed-inner {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  flex-shrink: 0;
}

/* Text overlay: fills the card exactly, padded by safeArea (injected via :style) */
.themed-flow {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
}

.themed-body {
  margin: 0;
  font-size: clamp(13px, 3.4vw, 19px);
  line-height: 1.55;
  font-weight: 600;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

.themed-body--paged {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
}

/* Lines now wrap properly — no overflow outside the card border */
.themed-line {
  display: block;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.themed-placeholder {
  opacity: 0.5;
  font-style: italic;
}

/* Watermarks sit OUTSIDE the card image — above or below */
.themed-watermark {
  display: flex;
  align-items: center;
  /* justify-content overridden per-template via inline labelStyle.justifyContent */
  justify-content: space-between;
  flex-shrink: 0;
  /* font-size / font-weight / color / letter-spacing set per-template via inline watermarkStyle */
  font-size: clamp(10px, 2.2vw, 12.5px);
  font-weight: 600;
  letter-spacing: 0.4px;
  padding: 6px 4px;
}

.themed-watermark--top {
  order: -1;
}

.themed-watermark--bottom {
  order: 1;
}

.themed-quoted {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  font-size: clamp(11px, 2.6vw, 13px);
  flex-shrink: 0;
}

/*
 * NOTE: All per-theme colour/typography overrides (.theme-spotify, .theme-typewriter,
 * .theme-journal, .theme-locker, .theme-clay) have been removed.
 * Styling is now driven entirely by per-template `textStyle` and `labelStyle`
 * objects in src/config/templates.js, applied as inline styles.
 * To adjust a template's look, edit its textStyle/labelStyle in templates.js.
 */
</style>
