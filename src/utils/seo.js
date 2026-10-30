/**
 * src/utils/seo.js
 * ---------------------------------------------------------------------------
 * Satu sumber kebenaran untuk metadata SEO di sisi klien.
 *
 * Kenapa ada berkas ini:
 *  • index.html hanya memuat metadata beranda. SPA tidak membuat HTML baru
 *    saat navigasi, jadi tanpa ini semua halaman berbagi satu <title>,
 *    satu description, dan satu canonical.
 *  • Halaman yang butuh login (feed, wallet, konsol admin, detail fess)
 *    harus `noindex` supaya crawl budget tidak habis di halaman kosong dan
 *    halaman privat tidak bocor ke indeks.
 *
 * Dipanggil dari router.afterEach (lihat src/router/index.js).
 */

/** Host kanonik. Apex `fnc.web.id` di-308 ke `www` oleh Vercel. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.fnc.web.id').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'Fess n Curious';
/**
 * Ejaan tanpa spasi. Banyak orang mengetik "fessncurious" (mengikuti nama
 * akun/host), jadi ejaan ini ikut ditanam di description, JSON-LD, dan teks
 * untuk pembaca layar agar ikut terindeks.
 */
export const SITE_NAME_COMPACT = 'Fessncurious';
export const SITE_NAME_FULL = `${SITE_NAME} (${SITE_NAME_COMPACT})`;

export const DEFAULT_DESCRIPTION =
  'Fessncurious (Fess n Curious) adalah platform sosial anonim berbasis Base: kirim fess anonim, moderasi AI, dan auto-post ke Instagram. Harga paket top up CTF transparan tanpa login.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const ROBOTS_INDEX =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const ROBOTS_NOINDEX = 'noindex, nofollow';

/** Ambil (atau buat) elemen <meta> berdasarkan `name` atau `property`. */
function upsertMeta(attr, key, content) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href, extra = {}) {
  if (typeof document === 'undefined') return;
  const selector = Object.entries(extra).reduce(
    (acc, [k, v]) => `${acc}[${k}="${v}"]`,
    `link[rel="${rel}"]`,
  );
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Hapus <link> bila ada (dipakai saat halaman berpindah ke mode noindex). */
function removeLink(rel, extra = {}) {
  if (typeof document === 'undefined') return;
  const selector = Object.entries(extra).reduce(
    (acc, [k, v]) => `${acc}[${k}="${v}"]`,
    `link[rel="${rel}"]`,
  );
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
}

/**
 * Tulis metadata halaman ke <head>.
 *
 * @param {object} opts
 * @param {string} [opts.title]       Judul lengkap (tanpa suffix brand).
 * @param {string} [opts.description] Deskripsi unik halaman.
 * @param {string} [opts.path]        Path internal, mis. '/about'.
 * @param {boolean} [opts.noindex]    true untuk halaman privat / 404.
 * @param {string} [opts.image]       Path atau URL absolut gambar OG.
 * @param {string} [opts.type]        og:type, default 'website'.
 */
export function applySeo(opts = {}) {
  if (typeof document === 'undefined') return;

  const {
    title,
    titleFull,
    description,
    path = '/',
    noindex = false,
    image,
    type = 'website',
  } = opts;

  const fullTitle =
    titleFull ||
    (title
      ? `${title} · ${SITE_NAME}`
      : `${SITE_NAME} (${SITE_NAME_COMPACT}) - Auto-Base Social Platform & Anon Engine`);
  const desc = description || DEFAULT_DESCRIPTION;
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE;

  document.title = fullTitle;

  upsertMeta('name', 'description', desc);
  upsertMeta('name', 'robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
  upsertMeta('name', 'googlebot', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);

  // Halaman privat tidak boleh mengklaim canonical publik.
  if (!noindex) {
    upsertLink('canonical', canonical);
    upsertLink('alternate', canonical, { hreflang: 'id' });
    upsertLink('alternate', canonical, { hreflang: 'x-default' });
  } else {
    removeLink('canonical');
    removeLink('alternate', { hreflang: 'id' });
    removeLink('alternate', { hreflang: 'x-default' });
  }

  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'id_ID');
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:image', ogImage);
  upsertMeta('property', 'og:image:alt', `Logo ${SITE_NAME}`);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', desc);
  upsertMeta('name', 'twitter:image', ogImage);
}

/**
 * Metadata default sebuah route.
 *
 * Route privat (requiresAuth / roles) otomatis `noindex` — tidak perlu
 * ditandai satu per satu di definisi route.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @returns {{title: string, description?: string, path: string, noindex: boolean}}
 */
export function seoForRoute(to) {
  const meta = to.meta || {};
  const isPrivate = Boolean(meta.requiresAuth || meta.roles) || to.name === 'NotFound';

  return {
    title: meta.title || '',
    titleFull: meta.titleFull || '',
    description: meta.description || (isPrivate ? undefined : DEFAULT_DESCRIPTION),
    path: to.path,
    noindex: isPrivate,
  };
}
