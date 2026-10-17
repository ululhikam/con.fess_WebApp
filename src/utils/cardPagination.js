/**
 * src/utils/cardPagination.js
 *
 * Mesin paginasi pratinjau kartu — cermin dari `layoutText()` + `paginate()` +
 * `buildQuoteBlock()` di `backend/src/services/canvas.service.ts`.
 *
 * Tujuan: jumlah halaman dan pembagian baris kartu di pratinjau frontend SAMA
 * dengan PNG yang dirender backend lalu diposting ke Instagram — termasuk saat
 * teks panjang (kartu jadi beberapa halaman carousel) atau ada kotak kutipan
 * yang memakan ruang halaman pertama.
 *
 * Semua ukuran memakai skala kanvas backend (lebar 1080 px, font Poppins):
 * pengukuran lebar teks di sini memakai canvas 2D dengan font Poppins yang
 * sama (dimuat dari Google Fonts di index.html).
 */

/** Lebar kanvas kartu backend — dasar skala ukuran font pratinjau. */
export const CARD_CANVAS_WIDTH = 1080;

const MAX_PAGES = 10; // batas carousel Instagram
const MAX_QUOTE_LINES = 4;
const PAD = 56;
const CONTENT_INSET = 116; // area teks = cardW - 116 (mirror backend)
const QUOTE = { pad: 18, headerH: 48, font: 25, lineHeight: 34 };

/** Geometri + tier font per aspek (mirror ASPECTS + tiers di canvas.service.ts). */
const GEOMETRY = {
  square: { width: 1080, height: 1080, tiers: [38, 33, 28, 24] },
  portrait: { width: 1080, height: 1350, tiers: [42, 36, 30, 26] },
};

const FONT_STACK = `Poppins, "Noto Sans", Arial, sans-serif`;

/** Urutan emoji (pictograph, modifier, ZWJ, variation selector, keycap, regional indicator). */
const EMOJI_SEQ_RE =
  /([\p{Extended_Pictographic}\p{Emoji_Modifier}\u200D\uFE0F\u20E3\u{1F1E6}-\u{1F1FF}]+)/gu;

export function cardAspectGeometry(aspectKey) {
  return GEOMETRY[aspectKey] || GEOMETRY.portrait;
}

/* ── Pengukuran teks (canvas 2D + Poppins) ─────────────────────────────── */

let measureCtx = null;

function getMeasureContext() {
  if (measureCtx !== null) return measureCtx;
  try {
    measureCtx = document.createElement('canvas').getContext('2d');
  } catch {
    measureCtx = null;
  }
  return measureCtx;
}

/** Perkiraan lebar teks saat font pengukuran tidak tersedia (sama seperti backend). */
function approxWidth(text, fontSize) {
  return String(text).length * fontSize * 0.55;
}

function textWidth(text, fontSize, weight) {
  const ctx = getMeasureContext();
  if (ctx) {
    ctx.font = `${weight} ${fontSize}px ${FONT_STACK}`;
    const width = ctx.measureText(text).width;
    if (Number.isFinite(width) && width > 0) return width;
  }
  return approxWidth(text, fontSize);
}

/** Muat Poppins untuk pengukuran (sekali saja per sesi). */
let fontsPromise = null;

export function ensureMeasurementFonts() {
  if (fontsPromise) return fontsPromise;
  const fonts = typeof document !== 'undefined' ? document.fonts : null;
  if (!fonts || !fonts.load) {
    fontsPromise = Promise.resolve();
    return fontsPromise;
  }
  fontsPromise = Promise.all([fonts.load('600 42px Poppins'), fonts.load('500 25px Poppins')])
    .then(() => fonts.ready)
    .catch(() => {});
  return fontsPromise;
}

/* ── Segmentasi & word wrap (mirror segmentsFor + layoutText) ──────────── */

let graphemeSegmenter;

/** Pecah rentetan emoji per grapheme (🇮🇩🙏 → 🇮🇩 + 🙏; ZWJ & skin tone utuh). */
function splitGraphemes(text) {
  if (graphemeSegmenter === undefined) {
    try {
      graphemeSegmenter =
        typeof Intl !== 'undefined' && Intl.Segmenter
          ? new Intl.Segmenter('id', { granularity: 'grapheme' })
          : null;
    } catch {
      graphemeSegmenter = null;
    }
  }
  if (!graphemeSegmenter) return [...text];
  return Array.from(graphemeSegmenter.segment(text), (entry) => entry.segment);
}

function segmentsFor(text, fontSize, weight) {
  const segments = [];
  const parts = text.split(EMOJI_SEQ_RE);
  parts.forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) {
      // Emoji: satu segmen per grapheme, lebar 1.12em (mirror backend).
      for (const grapheme of splitGraphemes(part)) {
        segments.push({ kind: 'emoji', text: grapheme, width: fontSize * 1.12 });
      }
    } else {
      // Teks: pecah per kata, spasi menempel di akhir kata (atau spasi murni).
      const tokens = part.match(/\s+|[^\s]+\s*/g) || [];
      for (const token of tokens) {
        segments.push({ kind: 'text', text: token, width: textWidth(token, fontSize, weight) });
      }
    }
  });
  return segments;
}

function layoutText(rawText, maxWidth, fontSize, weight) {
  const lines = [];

  for (const paragraph of String(rawText || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')) {
    if (paragraph.trim() === '') {
      lines.push([]);
      continue;
    }

    let line = [];
    let lineWidth = 0;

    const flush = () => {
      if (line.length) lines.push(line);
      line = [];
      lineWidth = 0;
    };

    for (const rawSegment of segmentsFor(paragraph, fontSize, weight)) {
      let segment = rawSegment;

      // Buang spasi di awal baris baru.
      if (!line.length && segment.kind === 'text') {
        const trimmed = segment.text.replace(/^\s+/, '');
        if (!trimmed) continue;
        segment = { ...segment, text: trimmed, width: textWidth(trimmed, fontSize, weight) };
      }

      if (line.length && lineWidth + segment.width > maxWidth) {
        flush();
        if (segment.kind === 'text') {
          const trimmed = segment.text.replace(/^\s+/, '');
          if (!trimmed) continue;
          segment = { ...segment, text: trimmed, width: textWidth(trimmed, fontSize, weight) };
        }
      }

      line.push(segment);
      lineWidth += segment.width;
    }

    flush();
  }

  return lines;
}

function paginate(lines, firstCap, restCap, maxPages) {
  const pages = [];
  let idx = 0;
  while (idx < lines.length && pages.length < maxPages) {
    const cap = pages.length === 0 ? firstCap : restCap;
    pages.push(lines.slice(idx, idx + cap));
    idx += cap;
  }
  return { pages, truncated: idx < lines.length };
}

/** Tinggi kotak kutipan (mirror buildQuoteBlock) — memengaruhi kapasitas halaman 1. */
function measureQuoteHeight(quote, width) {
  const content = String(quote?.content || '');
  let lines = layoutText(content, width - QUOTE.pad * 2, QUOTE.font, 500);
  if (lines.length > MAX_QUOTE_LINES) lines = lines.slice(0, MAX_QUOTE_LINES);
  return QUOTE.pad + QUOTE.headerH + Math.max(1, lines.length) * QUOTE.lineHeight + 14;
}

/**
 * Bagi isi fess menjadi halaman kartu persis seperti backend.
 *
 * @param {object}   input
 * @param {string}   input.content   Isi fess (teks mentah, boleh multi-baris).
 * @param {string}   input.aspectKey 'square' | 'portrait' (default portrait).
 * @param {object?}  input.quote     Fess kutipan { content } — memakan ruang halaman 1.
 * @returns {{ fontSize: number, lineHeight: number, pages: string[][], totalPages: number, truncated: boolean }}
 *          pages[i] = daftar baris teks yang sudah dibungkus (tanpa newline);
 *          fontSize/lineHeight memakai skala kanvas backend (1080 px).
 */
export function paginateCardContent({ content = '', aspectKey = 'portrait', quote = null } = {}) {
  const geometry = cardAspectGeometry(aspectKey);
  const W = geometry.width;
  const H = geometry.height;
  const cardW = W - PAD * 2;
  const cardH = H - PAD * 2;
  const contentWidth = cardW - CONTENT_INSET;
  const footerTop = PAD + cardH - 72;
  const restContentY = PAD + 195;

  const quoteHeight = quote ? measureQuoteHeight(quote, contentWidth) : 0;
  // Batas atas area kutipan — teks fess halaman 1 berhenti di atasnya.
  const quoteTopLimit = footerTop - 32 - quoteHeight;

  // Pilih ukuran font terbesar yang muat ≤ MAX_PAGES halaman (mirror tiers backend).
  let fontSize = geometry.tiers[0];
  let lineHeight = Math.round(fontSize * 1.42);
  let pages = [];
  let truncated = false;

  for (const tier of geometry.tiers) {
    fontSize = tier;
    lineHeight = Math.round(fontSize * 1.42);
    const lines = layoutText(content, contentWidth, fontSize, 600);
    const restCap = Math.max(3, Math.floor((footerTop - 40 - restContentY) / lineHeight));
    const firstCap = quote
      ? Math.max(
          1,
          Math.floor((quoteTopLimit - 26 - restContentY - fontSize) / lineHeight) + 1,
        )
      : restCap;
    const result = paginate(lines, firstCap, restCap, MAX_PAGES);
    pages = result.pages;
    truncated = result.truncated;
    if (!truncated) break;
  }

  if (!pages.length) pages = [[]];
  if (truncated && pages.length) {
    const lastPage = pages[pages.length - 1];
    const lastLine = lastPage[lastPage.length - 1];
    if (lastLine) lastLine.push({ text: '\u2026', width: textWidth('\u2026', fontSize, 600) });
  }

  return {
    fontSize,
    lineHeight,
    pages: pages.map((page) => page.map((line) => line.map((segment) => segment.text).join(''))),
    totalPages: pages.length,
    truncated,
  };
}
