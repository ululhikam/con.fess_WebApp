/**
 * src/utils/url.js
 * Helper URL aman untuk atribut `href`/`src` yang nilainya berasal dari API.
 *
 * Data dari server (permalink Instagram, deeplink pembayaran, URL media) tidak
 * boleh dipasang mentah ke `href`: nilai `javascript:` atau `data:` akan
 * dieksekusi saat pengguna mengklik tautan. Semua pemakaian `:href` dengan data
 * eksternal harus lewat helper ini.
 */

const SAFE_PROTOCOLS = ['https:', 'http:'];

/**
 * Kembalikan URL bila protokolnya aman, atau string kosong bila tidak.
 * @param {string} url
 * @param {string[]} [extraProtocols] protokol tambahan yang diizinkan (mis. deeplink)
 * @returns {string}
 */
export function safeExternalUrl(url, extraProtocols = []) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    const allowed = [...SAFE_PROTOCOLS, ...extraProtocols];
    return allowed.includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    // URL relatif (mis. "/upload/foto.png") tetap diizinkan apa adanya.
    return url.startsWith('/') && !url.startsWith('//') ? url : '';
  }
}
