# SEO, Sitemap, dan Logo di Hasil Pencarian Google

Status: **selesai & live** (30 Okt 2026, commit `dabac23`).
Diverifikasi langsung dari produksi: `https://www.fnc.web.id`.

---

## 1. Masalah yang ditemukan

Audit awal memakai permintaan HTTP langsung ke produksi, bukan asumsi dari kode.

| Yang diperiksa                 | Hasil sebelum perbaikan                                    | Dampak                                                                                               |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GET /robots.txt`              | `200` tapi `Content-Type: text/html` — isinya `index.html` | Google membaca ini sebagai robots.txt rusak                                                          |
| `GET /sitemap.xml`             | `200` tapi `text/html` — sitemap tidak pernah ada          | Tidak ada URL yang dilaporkan ke Google                                                              |
| Favicon                        | `favicon.png` 64×64, `favicon-32.png` 32×32                | **Ini penyebab logo tidak muncul** — Google hanya menerima favicon persegi berukuran kelipatan 48 px |
| `favicon.ico` di root          | tidak ada                                                  | Crawler/favicon proxy tidak menemukan ikon default                                                   |
| `<link rel="canonical">`       | tidak ada sama sekali                                      | Risiko konten duplikat (`fnc.web.id` vs `www`, dan `*.vercel.app`)                                   |
| `Organization.logo` di JSON-LD | tidak ada                                                  | Google tidak punya sumber gambar brand                                                               |
| `og:image` / `twitter:image`   | relatif (`/og-image.jpg`)                                  | Crawler tidak me-resolve path relatif                                                                |
| Meta description               | satu deskripsi untuk semua route                           | Halaman `/about`, `/contact`, legal dianggap kembar                                                  |
| `meta robots`                  | tidak ada                                                  | Halaman berlogin ikut berpotensi dirayapi                                                            |
| `<h1>` beranda                 | `#CONFESS AUTO POST BASE` — tanpa nama brand               | Google bisa salah menebak _site name_                                                                |
| `viewport`                     | `maximum-scale=1.0, user-scalable=no`                      | Melanggar best practice aksesibilitas/SEO                                                            |

Dua baris pertama adalah sebab skor **SEO tidak bisa mencapai 100** di Lighthouse:
audit "robots.txt is valid" pasti gagal.

---

## 2. Perbaikan

### 2.1 `public/robots.txt` (baru)

File statis di `public/` selalu dilayani **sebelum** rewrite Vercel, sehingga langsung
menimpa fallback SPA.

```txt
User-agent: *
Allow: /$
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /data-deletion

Disallow: /feed
Disallow: /create
Disallow: /wallet
Disallow: /profile
Disallow: /login
Disallow: /forgot-password
Disallow: /verify-email
Disallow: /register
Disallow: /onboarding
Disallow: /base-admin
Disallow: /super-admin
Disallow: /fess/
Disallow: /base/

Disallow: /assets/
Disallow: /ffmpeg/
Disallow: /api/

Sitemap: https://www.fnc.web.id/sitemap.xml
```

Prinsipnya: hanya halaman yang **berguna tanpa login** yang dibuka. Area privat ditutup
agar crawl budget tidak habis di halaman kosong (feed butuh auth) dan halaman privat tidak
masuk indeks.

### 2.2 `public/sitemap.xml` (baru)

Enam URL publik saja, lengkap dengan `lastmod`, `changefreq`, dan `priority`:

```
https://www.fnc.web.id/                1.0  weekly
https://www.fnc.web.id/about           0.8  monthly
https://www.fnc.web.id/contact         0.7  monthly
https://www.fnc.web.id/privacy         0.5  yearly
https://www.fnc.web.id/terms           0.5  yearly
https://www.fnc.web.id/data-deletion   0.5  yearly
```

`/feed`, `/wallet`, `/fess/:id`, `/base/:handle`, konsol admin **sengaja tidak
didaftarkan** — butuh login, tidak punya nilai pencarian, dan sudah `noindex`.

### 2.3 Favicon (inti masalah logo hilang)

Syarat Google: **persegi, ukuran kelipatan 48 px** (48, 96, 144, 192). Aset lama 64 px dan
32 px tidak memenuhi, sehingga Google memilih ikon generik atau tidak menampilkan apa pun.

Dibuat `scripts/generate-favicons.ps1` yang menurunkan seluruh ukuran dari master logo,
supaya kalau logo berubah cukup jalankan ulang script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-favicons.ps1
```

| Sumber                         | Keluaran                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `public/logo.png` (192×192)    | `favicon.ico` (16+32+48), `favicon-48.png`, `favicon-96.png`, `favicon-144.png`, `favicon-192.png` |
| `public/logo2.jpg` (2048×2048) | `icon-512.png`                                                                                     |

`favicon.ico` ditulis manual sebagai header `ICONDIR` + entri PNG tersemat, karena
System.Drawing di PowerShell tidak bisa menyimpan `.ico` multi-resolusi secara langsung.

Tag di `index.html`:

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
<link rel="icon" type="image/png" sizes="144x144" href="/favicon-144.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

`favicon.png` (64 px) dan `favicon-32.png` **dibiarkan ada** agar tautan lama tidak mati,
tetapi tidak lagi dirujuk dari `index.html`.

### 2.4 `public/site.webmanifest` (baru)

`name`, `short_name` (`FnC`), `lang: id`, `theme_color` `#0b39fa` (sama dengan
`--shell-bg`), dan ikon 192 + 512. Memberi Google sinyal tambahan soal nama & ikon
aplikasi.

### 2.5 `index.html`

- `canonical` + `hreflang` `id` dan `x-default`
- `meta robots` dan `googlebot`: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- `og:url`, `og:locale` (`id_ID`), `og:site_name`, `og:image:alt`, `og:image:type`
- `og:image` dan `twitter:image` jadi **URL absolut** `https://www.fnc.web.id/og-image.jpg`
- JSON-LD `@graph`:
  - `Organization` (Concern Dev) — ditambah `logo` (`ImageObject` 96×96), `description`, `sameAs`
  - `WebSite` — `url` absolut, `inLanguage: id-ID`, `alternateName`
  - `WebApplication` — `applicationCategory`, `isAccessibleForFree`, `image`
- `user-scalable=no` dan `maximum-scale=1.0` dihapus
- `facebook-domain-verification` **dipertahankan** (Meta bisa mengecek ulang berkala)

### 2.6 Ejaan "fessncurious"

Banyak orang mengetik brand tanpa spasi (mengikuti nama akun/host). Ejaan itu ditanam
supaya ikut terindeks:

| Lokasi                   | Bentuk                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| `<title>`                | `Fess n Curious (Fessncurious) - Auto-Base Social Platform & Anon Engine` |
| meta description         | `Fessncurious (Fess n Curious) — platform sosial anonim …`                |
| meta keywords            | `fessncurious, fess n curious, fnc, fess anonim, confess anonim, …`       |
| JSON-LD `alternateName`  | `["Fessncurious", "FnC", "Fess and Curious"]`                             |
| `<h1>` beranda (sr-only) | `Fessncurious (Fess n Curious) — platform sosial anonim untuk`            |
| Footer                   | `© 2026 Fess n Curious (Fessncurious) - …`                                |

> Catatan: `meta keywords` sudah diabaikan Google sejak 2009. Dibiarkan ada karena tidak
> merugikan dan dipakai beberapa mesin pencari lain, tetapi **bukan** faktor peringkat.

### 2.7 Metadata per halaman — `src/utils/seo.js` (baru)

SPA tidak membuat HTML baru saat navigasi, jadi tanpa ini semua halaman berbagi satu
`<title>` dan satu canonical. Dipanggil dari `router.afterEach`:

```js
router.afterEach((to) => {
  applySeo(seoForRoute(to));
});
```

Perilaku:

- `meta.description` per route didefinisikan di `src/router/index.js` untuk 6 halaman publik
- `canonical` = `https://www.fnc.web.id` + `to.path`
- Route dengan `meta.requiresAuth` atau `meta.roles`, serta `NotFound`, otomatis mendapat
  `noindex, nofollow` **dan canonical-nya dihapus** (halaman privat tidak boleh mengklaim
  URL publik)
- `og:*` dan `twitter:*` ikut ditimpa

Konstanta yang bisa diubah di satu tempat:

```js
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.fnc.web.id';
export const SITE_NAME = 'Fess n Curious';
```

### 2.8 `vercel.json`

Ditambah header eksplisit (urutan penting: aturan spesifik didahulukan):

```json
{ "source": "/robots.txt",       "Content-Type": "text/plain; charset=utf-8",
                                 "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" }
{ "source": "/sitemap.xml",      "Content-Type": "application/xml; charset=utf-8", "Cache-Control": … }
{ "source": "/site.webmanifest", "Content-Type": "application/manifest+json; charset=utf-8" }
```

Header keamanan (CSP, HSTS, dll.) **tidak diubah** oleh pekerjaan ini.

### 2.9 Domain

| Tempat                                   | Sebelum                                     | Sesudah                 |
| ---------------------------------------- | ------------------------------------------- | ----------------------- |
| `src/components/feed/AccountPanels.vue`  | `fessncurious.vercel.app`                   | `www.fnc.web.id`        |
| `backend/src/utils/thumbnail.util.ts`    | `FALLBACK_HOST = 'fessncurious.vercel.app'` | `'www.fnc.web.id'`      |
| `backend/src/services/canvas.service.ts` | hardcode di 2 tempat                        | memakai `FALLBACK_HOST` |
| `.env.example`                           | komentar domain lama                        | `www.fnc.web.id`        |

Watermark kartu Instagram sudah mengikuti `FRONTEND_URL`. **Fallback** hanya terpakai saat
env kosong (dev/test) — karena itu env produksi tetap harus diganti (lihat §5).

---

## 3. Hasil verifikasi produksi

```
https://www.fnc.web.id/robots.txt   → 200  text/plain; charset=utf-8
https://www.fnc.web.id/sitemap.xml  → 200  application/xml; charset=utf-8
/favicon.ico                        → 200  image/vnd.microsoft.icon
/favicon-48.png | 96 | 192          → 200  image/png
/favicon-144.png                    → 200  image/png
/icon-512.png                       → 200  image/png
/site.webmanifest                   → 200  application/manifest+json
/assets/index-*.js                  → 200  application/javascript
https://be-fnc.vercel.app/api/health→ 200  {"status":"ok"}
```

Isi `<head>` beranda yang tayang: title memuat `Fessncurious`, canonical
`https://www.fnc.web.id/`, hreflang `id` + `x-default`, `robots`/`googlebot`
`index, follow, max-image-preview:large…`, `og:image` absolut, JSON-LD 1 blok dengan
`Organization.logo`, viewport tanpa `user-scalable=no`, dan
`facebook-domain-verification` utuh.

Sitemap terbaca berisi 6 URL.

---

## 4. Langkah Search Console

Belum ada tag verifikasi Google di situs (hanya `facebook-domain-verification`), jadi mulai
dari nol.

### 4.1 Tambah properti — pilih **Domain**

`search.google.com/search-console` → **+ Add property** → kotak kiri **Domain** → isi
`fnc.web.id` (tanpa `https://`, tanpa `www`).

Tipe Domain mencakup apex, `www`, `http`, `https`, dan seluruh subdomain sekaligus — cocok
karena apex di-308 ke `www`. Tipe _URL prefix_ hanya menangkap satu varian.

### 4.2 Verifikasi

> **Jangan pakai metode "HTML file".** Rewrite catch-all `/(.*)` → `/index.html` membuat
> file `googleXXXX.html` dibalas `index.html`, sehingga Google menyimpulkan file tidak ada.
> Sudah diuji: `/google-site-verification.html` → `200` tapi berisi HTML SPA.

**Opsi A — DNS TXT (disarankan untuk tipe Domain)**

```
TXT   @   google-site-verification=<kode-dari-google>
```

Tambah di panel DNS `fnc.web.id`, tunggu 1–5 menit (kadang 1 jam), klik **Verify**.

**Opsi B — meta tag (untuk tipe URL prefix)**

```html
<meta name="google-site-verification" content="..." />
```

Ditaruh di `index.html` setelah `<meta charset>`. Aman terhadap rewrite karena berada di
HTML asli, sama seperti `facebook-domain-verification` yang sudah berjalan.

### 4.3 Submit sitemap

**Sitemaps** → isi `sitemap.xml` → **Submit**. Status awal "Couldn't fetch" itu normal.
Tanda berhasil: **Success**, **6 discovered URLs**.

### 4.4 Minta indexing beranda

**URL Inspection** → `https://www.fnc.web.id/` → **Test live URL** (harus
"URL is available to Google") → **Request indexing**. Batas ±10/hari; prioritaskan `/`
saja, sisanya ditemukan lewat sitemap.

### 4.5 Pantau favicon

Tidak ada menu khusus favicon. Cek di **URL Inspection** → panel **Search appearance** →
baris **Favicon** harus "Favicon detected".

Logo di SERP **butuh crawl ulang**: realistis beberapa hari sampai ±2 minggu. Selama masa
tunggu **jangan mengganti file favicon** — itu me-reset antrean.

### 4.6 Yang wajar muncul di **Indexing → Pages**

| Status                           | Halaman                                                  | Normal?      |
| -------------------------------- | -------------------------------------------------------- | ------------ |
| Indexed                          | 6 halaman publik                                         | ✅ target    |
| Excluded by 'noindex'            | `/feed`, `/wallet`, `/fess/*`, `/base/*`, `/login`, dll. | ✅ disengaja |
| Blocked by robots.txt            | `/base-admin`, `/super-admin`, `/assets/*`               | ✅ disengaja |
| Page with redirect               | `http://` dan apex `fnc.web.id`                          | ✅ 308 → www |
| Soft 404 / Crawled – not indexed | URL ngawur                                               | ⚠️ lihat §6  |

---

## 5. Yang harus diatur di luar kode

| Lokasi                  | Variabel                   | Nilai                              |
| ----------------------- | -------------------------- | ---------------------------------- |
| Vercel → frontend → Env | `VITE_SHARE_BASE_URL`      | `https://www.fnc.web.id`           |
| Vercel → frontend → Env | `VITE_SITE_URL` (opsional) | `https://www.fnc.web.id`           |
| Vercel → backend → Env  | `FRONTEND_URL`             | `https://www.fnc.web.id`           |
| Vercel → backend → Env  | `ALLOWED_ORIGINS`          | tambahkan `https://www.fnc.web.id` |

`FRONTEND_URL` bersifat wajib: env **mengalahkan** fallback di kode. Kalau masih berisi
domain lama, watermark kartu Instagram tetap mencetak `fessncurious.vercel.app`.

---

## 6. Batasan yang diketahui

### Soft 404

Karena rewrite catch-all, URL yang tidak ada dibalas `200` + `index.html`. Google
menandainya "Soft 404" atau "Crawled – currently not indexed". **Tidak** memengaruhi skor
SEO beranda maupun logo. Route `NotFound` sudah diberi `noindex` lewat `useSeo`, jadi paling
buruk Google mengabaikannya.

Perbaikan sesungguhnya (404 asli) menuntut seluruh route dienumerasi di `vercel.json` +
`public/404.html`. Berisiko: satu route terlewat = deep-link mati. **Belum dikerjakan
dengan sengaja.**

### Konten dirender di klien

`index.html` tidak memuat konten halaman. Google merender JS sehingga tetap bisa
mengindeks, tetapi pratinjau sosial (WhatsApp/Telegram/Facebook) hanya membaca HTML awal —
karena itu `og:*` sengaja ditulis statis dan absolut.

### `meta keywords`

Diabaikan Google. Dibiarkan untuk mesin pencari lain; jangan dianggap faktor peringkat.

### Domain lama

`fessncurious.vercel.app` masih hidup dan menyajikan konten identik. Disarankan **tidak**
di-redirect paksa, karena URL itu dipakai untuk verifikasi Meta Business dan kemungkinan
redirect URI OAuth. Duplikasi ditangani lewat `canonical`.
