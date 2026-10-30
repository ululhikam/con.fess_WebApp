# Pengerasan Keamanan Frontend

Status: **selesai & live** (29 Okt 2026).
Commit utama: `36b6648`, `b16d7c8`, `5bfc81d`, `1477d8b`, `a6d5650`, merge `67d8ef1`,
disusul perbaikan CSP `ef3bb6c`.

Latar belakang: audit keamanan mencatat 37 temuan. Dokumen ini hanya membahas temuan yang
**berdampak di sisi frontend**. Daftar lengkap ada di `backend/docs/security-audit.md`.

---

## Ringkasan

| ID     | Temuan                                 | Perbaikan                                        | Commit    |
| ------ | -------------------------------------- | ------------------------------------------------ | --------- |
| —      | Tidak ada header keamanan sama sekali  | CSP, HSTS, X-Frame-Options, dll.                 | `36b6648` |
| SEC-10 | Token OAuth diterima di route mana pun | Ingest dibatasi 3 route + token dibuang dari URL | `b16d7c8` |
| SEC-29 | Nilai `href` dari API dipasang mentah  | `safeExternalUrl()`                              | `5bfc81d` |
| SEC-30 | Tautan eksternal tanpa `rel=noopener`  | `rel="noopener noreferrer"`                      | `5bfc81d` |
| SEC-28 | Draf fess 7 hari + menyimpan media     | TTL 24 jam, tanpa media, field terbatas          | `1477d8b` |
| SEC-31 | Email di query string                  | Dipindah ke fragment                             | `a6d5650` |
| —      | CSP memblokir API produksi             | `connect-src` diperluas ke `be.fnc.web.id`       | `ef3bb6c` |

---

## 1. Header keamanan — `vercel.json` (`36b6648`)

Diterapkan untuk semua path (`source: "/(.*)"`).

| Header                       | Nilai                                                          | Alasan                                       |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `Content-Security-Policy`    | lihat bawah                                                    | Batasi asal skrip/gaya/gambar/koneksi        |
| `Referrer-Policy`            | `no-referrer`                                                  | Jangan bocorkan URL internal ke pihak ketiga |
| `X-Frame-Options`            | `DENY`                                                         | Cegah clickjacking                           |
| `X-Content-Type-Options`     | `nosniff`                                                      | Cegah MIME sniffing                          |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Matikan API yang tidak dipakai               |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups`                                     | Popup OAuth tetap berfungsi, tapi terisolasi |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload`                 | HTTPS wajib 2 tahun                          |

### CSP dan pengecualiannya

```
default-src 'self';
script-src  'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:;
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src    'self' data: https://fonts.gstatic.com;
img-src     'self' data: blob: https:;
media-src   'self' blob: https:;
connect-src 'self' https://be.fnc.web.id https://*.fnc.web.id
            https://*.vercel.app https://*.supabase.co wss://*.supabase.co;
worker-src  'self' blob:;
child-src   'self' blob:;
frame-ancestors 'none';
object-src  'none';
base-uri    'self';
form-action 'self';
upgrade-insecure-requests
```

Pengecualian tersebut **bukan kelalaian**, masing-masing punya alasan:

| Direktif                   | Pengecualian                   | Untuk apa                                                                           |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `script-src`               | `'unsafe-inline'`              | Skrip bootstrap tema di `index.html` (mencegah FOUC) dan blok `application/ld+json` |
| `script-src`               | `'wasm-unsafe-eval'` + `blob:` | `ffmpeg.wasm` (normalisasi video di browser)                                        |
| `worker-src` / `child-src` | `blob:`                        | Worker ffmpeg dibuat dari blob                                                      |
| `style-src`                | `'unsafe-inline'`              | Vue menyuntik style komponen saat runtime                                           |
| `img-src` / `media-src`    | `https:` + `blob:` / `data:`   | Media fess dari Supabase, avatar, pratinjau lokal                                   |

> Kalau suatu saat `script-src 'unsafe-inline'` ingin dihapus, gantinya adalah nonce/hash
> pada skrip bootstrap tema — bukan sekadar menghapus atribut.

### Regresi yang pernah terjadi (`ef3bb6c`)

CSP awal hanya mengizinkan `connect-src 'self'`, `*.vercel.app`, dan `*.supabase.co`.
Frontend produksi memanggil API di `https://be.fnc.web.id/api`, sehingga **semua**
XHR/fetch diblokir. Gejalanya menipu: halaman tetap tampil dan sesi lama masih terbaca dari
localStorage, tetapi seluruh data gagal dimuat.

Perbaikan: tambah `https://be.fnc.web.id` dan `https://*.fnc.web.id`.

**Pelajaran:** setiap kali backend pindah domain, `connect-src` **wajib** ikut diperbarui.
Kegagalan di sini bukan error 500, melainkan halaman kosong tanpa data.

---

## 2. SEC-10 — Ingest token OAuth (`b16d7c8`)

**Masalah.** Guard router menerima `?token=` di **route mana pun**. Tautan
`/feed?token=<JWT penyerang>` bisa membuat korban memakai sesi penyerang tanpa sadar
(session fixation).

**Perbaikan** di `src/router/index.js`:

```js
const TOKEN_INGEST_ROUTES = new Set(['Login', 'BaseOnboarding', 'BaseAdmin']);
```

- Token hanya diproses pada tiga route itu
- Setelah diproses, token **langsung dibuang dari URL** (`replace`) agar tidak tertinggal di
  riwayat browser atau header `Referer`
- Redirect setelah login dipindah ke guard dengan aturan role yang sama, sehingga deep-link
  `?redirect=` tetap dihormati
- `BaseAdminDashboard` dan `BaseOnboardingPage` tidak lagi menulis token mentah ke
  `localStorage` tanpa memeriksa `exp`

---

## 3. SEC-29 / SEC-30 — Penyaringan `href` (`5bfc81d`)

**Masalah.** `href` yang berasal dari API (permalink Instagram, URL kartu) dipasang mentah.
Nilai `javascript:` atau `data:` akan dieksekusi saat diklik → XSS berbasis klik.

**Perbaikan** — `src/utils/url.js`:

```js
export function safeExternalUrl(url, extraProtocols = []) { … }
```

Aturan:

- Hanya `http:` dan `https:` yang lolos (plus `extraProtocols` untuk deeplink pembayaran)
- Path relatif (`/upload/foto.png`) tetap diterima
- `//evil.com` (protocol-relative) **ditolak**
- Selain itu → string kosong (atribut tidak dirender)

Pemakaian: `FessCard` (tombol unduh lewat computed `igDownloadUrl`),
`InstagramAnalytics` (lewat `safePermalink()`). Tombol unduh FessCard juga diberi
`rel="noopener noreferrer"`.

**Aturan untuk kontributor:** setiap `:href` atau `:src` yang nilainya berasal dari API
harus melewati `safeExternalUrl()`.

---

## 4. SEC-28 — Draf fess (`1477d8b`)

**Masalah.** Draf confession menyimpan cerita pribadi selama **7 hari** di `localStorage`,
termasuk URL media — dan media itu bisa dibuka tanpa login.

**Perbaikan** — `src/utils/fessDraft.js`:

```js
export const DRAFT_KEY = 'fess_draft';
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam
```

- TTL dipendekkan 7 hari → 24 jam; draf kedaluwarsa dihapus saat dibaca
- Media **tidak** ikut disimpan; hanya teks, topik, jadwal, lagu, dan template
- Payload dibatasi ke field yang dikenal (bukan menyebar seluruh objek form), sehingga field
  baru tidak otomatis masuk ke penyimpanan

---

## 5. SEC-31 — Email verifikasi (`a6d5650`)

**Masalah.** Email dikirim di **query string** (`?email=...`), sehingga tercatat di access
log server, riwayat browser, dan header `Referer` saat halaman memuat aset pihak ketiga.

**Perbaikan.** `verificationRoute()` menaruh email di **fragment** (`#`) bersama `ticket`.
Fragment tidak pernah dikirim ke server. Halaman verifikasi sudah membaca keduanya dari
fragment lalu membersihkannya.

Alasan yang sama dipakai saat memindahkan token OAuth: **fragment, bukan query**.

---

## 6. Aturan yang berlaku setelah perubahan ini

1. Jangan memasang nilai dari API langsung ke `href`/`src` — pakai `safeExternalUrl()`.
2. Token dan email sensitif selalu di fragment, dan dibersihkan dari URL setelah dibaca.
3. Tautan `target="_blank"` wajib `rel="noopener noreferrer"`.
4. Data pribadi di `localStorage` harus punya TTL dan tanpa media.
5. Setiap perubahan domain backend → perbarui `connect-src` di `vercel.json`.
6. Menambah sumber eksternal (font, skrip, gambar) → perbarui CSP, jangan matikan CSP.

---

## 7. Verifikasi

- Build: `npm run build` bersih
- Pemindaian cepat isi `vercel.json` memastikan 7 header ada dan CSP memuat
  `https://be.fnc.web.id`
- Pemeriksaan produksi: respons `https://www.fnc.web.id/` memuat seluruh header di atas
- Backend: `npx tsc -p tsconfig.build.json --noEmit` → exit 0; test keamanan
  (`authRateLimit`, `oauth-state`, `pagination.validator`, `remote-image`, `quota-rate-limit`,
  `auth.service`) → 6/6 lulus
