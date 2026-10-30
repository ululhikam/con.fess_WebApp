/** Helper avatar: preset SVG lokal + kompresi upload menjadi data-URI kecil. */

export const MAX_AVATAR_DATA_LENGTH = 600_000;

const HTTP_URL_RE = /^https?:\/\/\S+$/i;
const LOCAL_PATH_RE = /^\/(?!\/)\S+$/;
const DATA_IMAGE_RE =
  /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml)(?:;charset=[^;,]+)?(?:;base64)?,/i;

export function isAvatarImage(value) {
  return (
    typeof value === 'string' &&
    (HTTP_URL_RE.test(value) || LOCAL_PATH_RE.test(value) || DATA_IMAGE_RE.test(value))
  );
}

/**
 * Inisial 2 huruf dari nama, dipakai saat foto tidak ada/gagal dimuat.
 *
 * Backend menyimpan foto profil dan inisial di kolom yang sama (`avatar`):
 * unggahan berisi URL/data-URI, sedangkan base lama hanya berisi "BA"/"US".
 * Helper ini memastikan teks inisial tidak pernah masuk ke `<img src>`.
 */
export function avatarInitials(name, fallback = 'BA') {
  const clean = String(name || '')
    .replace(/^@/, '')
    .trim();
  if (!clean) return String(fallback || 'BA').slice(0, 2).toUpperCase();

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

/** Preset avatar lokal agar tidak bergantung pada gambar eksternal. */
export function avatarPreset(from, to, label = 'F') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="32" fill="url(#g)"/>
    <circle cx="94" cy="28" r="18" fill="rgba(255,255,255,.22)"/>
    <circle cx="24" cy="104" r="26" fill="rgba(255,255,255,.14)"/>
    <text x="64" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="44"
          font-weight="700" fill="#fff">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gambar tidak bisa dibaca.'));
    image.src = src;
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Kompres file gambar menjadi data-URI persegi (maks. 512px) supaya muat
 * dikirim bersama payload registrasi tanpa melewati batas server.
 */
export async function fileToAvatarDataUrl(file, { maxSize = 512, quality = 0.82 } = {}) {
  if (!file) throw new Error('Pilih file gambar terlebih dahulu.');
  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('File harus berupa gambar.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 8MB.');
  }

  const original = await readFile(file);
  if (isAvatarImage(original) && original.length <= MAX_AVATAR_DATA_LENGTH) {
    // SVG/GIF kecil bisa dipakai langsung; bitmap besar tetap dikompres.
    if (file.type === 'image/svg+xml' || original.length < 120_000) return original;
  }

  const image = await loadImage(original);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung pengolahan gambar.');

  ctx.drawImage(image, 0, 0, width, height);
  let dataUrl = canvas.toDataURL('image/webp', quality);

  if (!dataUrl.startsWith('data:image/webp')) {
    const jpegCanvas = document.createElement('canvas');
    jpegCanvas.width = width;
    jpegCanvas.height = height;
    const jpegCtx = jpegCanvas.getContext('2d');
    if (!jpegCtx) throw new Error('Browser tidak mendukung pengolahan gambar.');
    jpegCtx.fillStyle = '#ffffff';
    jpegCtx.fillRect(0, 0, width, height);
    jpegCtx.drawImage(image, 0, 0, width, height);
    dataUrl = jpegCanvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > MAX_AVATAR_DATA_LENGTH) {
    throw new Error('Foto profil masih terlalu besar setelah dikompres. Coba gambar lain.');
  }
  return dataUrl;
}
