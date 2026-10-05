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
