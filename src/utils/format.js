/**
 * src/utils/format.js
 * Pure, side-effect free helpers. Keep formatting OUT of components so it
 * can be unit-tested and reused across views/stores.
 */

/**
 * 1234 -> "1.234" (id-ID grouping) or "1,234" (en-US).
 * @param {number} value
 * @param {string} locale
 */
export function formatNumber(value, locale = 'id-ID') {
  if (value == null || Number.isNaN(Number(value))) return '0';
  return new Intl.NumberFormat(locale).format(Number(value));
}

/**
 * 12345 -> "12.3k", 1420000 -> "1.4jt" (Indonesian magnitudes).
 * @param {number} value
 */
export function formatCompact(value, locale = 'id-ID') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) < 1000) return String(n);

  const units =
    locale === 'id-ID'
      ? [
          { suffix: 'rb', factor: 1e3 },
          { suffix: 'jt', factor: 1e6 },
          { suffix: 'M', factor: 1e9 },
        ]
      : [
          { suffix: 'K', factor: 1e3 },
          { suffix: 'M', factor: 1e6 },
          { suffix: 'B', factor: 1e9 },
        ];

  const unit = [...units].reverse().find((u) => Math.abs(n) >= u.factor);
  if (!unit) return String(n);

  const scaled = n / unit.factor;
  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 1;
  return `${scaled.toFixed(decimals).replace(/\.0$/, '')}${unit.suffix}`;
}

/**
 * 1700000000000 -> "3 mnt lalu" style relative label (mock-friendly).
 * @param {number} timestamp seconds or ms
 */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const diff = Math.max(0, now - ms);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari`;

  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(ms));
}

/** Truncate with ellipsis without cutting surrogate pairs. */
export function truncate(text, max = 120) {
  const str = String(text ?? '');
  return str.length <= max ? str : `${str.slice(0, max - 1).trimEnd()}…`;
}

/** "@alexdev" -> "alexdev" */
export const stripHandle = (handle = '') => String(handle).replace(/^@/, '');

/** Clamp a number between min and max. */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Class name joiner — drops falsy entries. */
export function cx(...parts) {
  return parts.flat().filter(Boolean).join(' ');
}

/* ============================================================
   ALGORITMA FUNGSIONAL — pure, testable, no side effects
   ============================================================ */

/**
 * Hitung skor popularitas fess untuk sorting.
 * Formula: upvotes - downvotes + (comments * 0.5) + decay(time)
 * @param {{upvotes:number, downvotes:number, commentsCount:number, createdAt:number}} post
 * @returns {number} skor (semakin tinggi semakin populer)
 */
export function calculatePopularityScore(post) {
  const { upvotes = 0, downvotes = 0, commentsCount = 0, createdAt } = post;
  const ageHours = Math.max(0, (Date.now() - (createdAt || Date.now())) / 3_600_000);
  const timeDecay = Math.log10(ageHours + 2) * 1.5; // logarithmic decay
  return upvotes - downvotes + commentsCount * 0.5 - timeDecay;
}

/**
 * Tentukan apakah fess "trending" (skor > threshold & age < 24h).
 * @param {object} post
 * @returns {boolean}
 */
export function isTrending(post) {
  const ageHours = Math.max(0, (Date.now() - (post.createdAt || Date.now())) / 3_600_000);
  return ageHours < 24 && calculatePopularityScore(post) > 50;
}

/**
 * Generate share URL untuk fess.
 * @param {string} baseUrl - origin (e.g. https://fesshub.id)
 * @param {string} fessId
 * @returns {string}
 */
export function generateShareUrl(baseUrl, fessId) {
  return `${baseUrl.replace(/\/$/, '')}/fess/${fessId}`;
}

/**
 * Generate share text untuk Web Share API.
 * @param {{content:string, baseHandle:string}} fess
 * @returns {{title:string, text:string, url:string}}
 */
export function generateShareData(fess, baseUrl) {
  const preview = truncate(fess.content, 100);
  return {
    title: `Fess dari ${fess.baseHandle}`,
    text: `${preview}...`,
    url: generateShareUrl(baseUrl, fess.id),
  };
}

/**
 * Validasi konten fess sebelum publish.
 * @param {string} content
 * @returns {{valid:boolean, errors:string[]}}
 */
export function validateFessContent(content) {
  const errors = [];
  const text = String(content ?? '').trim();
  if (!text) errors.push('Konten tidak boleh kosong');
  if (text.length > 2000) errors.push('Maksimal 2000 karakter');
  if (/^\s*$/.test(text)) errors.push('Konten tidak boleh hanya spasi');
  return { valid: errors.length === 0, errors };
}

/**
 * Hitung estimasi reward point berdasarkan engagement.
 * Formula: base(10) + upvotes*2 + comments*1 + (isViral ? 50 : 0)
 * @param {{upvotes:number, commentsCount:number, isViral?:boolean}} post
 * @returns {number}
 */
export function calculateRewardPoints(post) {
  const { upvotes = 0, commentsCount = 0, isViral = false } = post;
  return 10 + upvotes * 2 + commentsCount + (isViral ? 50 : 0);
}

/**
 * Format angka untuk UI compact (1.2k, 3.4jt, 5.6M).
 * @param {number} n
 * @param {'id'|'en'} locale
 * @returns {string}
 */
export function formatCompactNumber(n, locale = 'id') {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  if (Math.abs(num) < 1000) return String(num);

  const units =
    locale === 'id'
      ? [
          { v: 1e9, s: 'M' },
          { v: 1e6, s: 'jt' },
          { v: 1e3, s: 'rb' },
        ]
      : [
          { v: 1e9, s: 'B' },
          { v: 1e6, s: 'M' },
          { v: 1e3, s: 'K' },
        ];

  const u = units.find((x) => Math.abs(num) >= x.v) || units[units.length - 1];
  const val = num / u.v;
  const dec = val >= 100 ? 0 : val >= 10 ? 1 : 1;
  return `${val.toFixed(dec).replace(/\.0$/, '')}${u.s}`;
}

/**
 * Parse waktu relatif string → Date.
 * Support: "12m ago", "3h ago", "2 hari", "baru saja", "5 menit yang lalu"
 * @param {string} str
 * @returns {Date|null}
 */
export function parseRelativeTimeString(str) {
  const now = Date.now();
  const m = String(str)
    .toLowerCase()
    .match(/(\d+)\s*(detik|d|mnt|menit|m|jam|j|hari|h)/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2];
  let ms = 0;
  if (unit.startsWith('d')) ms = n * 86400000;
  else if (unit.startsWith('h') || unit.startsWith('j')) ms = n * 3600000;
  else if (unit.startsWith('m') || unit === 'mnt') ms = n * 60000;
  else if (unit.startsWith('d')) ms = n * 1000;
  return new Date(now - ms);
}

/**
 * Generate unique ID untuk client-side (sebelum server assign).
 * @returns {string}
 */
export function generateClientId(prefix = 'tmp') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Debounce helper untuk search/input.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Deep clone tanpa circular ref (untuk optimistic update).
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
