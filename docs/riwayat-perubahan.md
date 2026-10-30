# Riwayat Perubahan Frontend

Kronologi perubahan terbaru, dengan alasan singkat. Untuk detail teknis, ikuti tautan ke
dokumen terkait.

Urutan: **terbaru di atas**. Semua commit sudah ada di `main` (dan di `origin/main`).

---

## 30 Okt 2026

### SEO, sitemap, dan logo Google — `dabac23`

Detail: [`seo-dan-logo-google.md`](./seo-dan-logo-google.md)

**Masalah:** `/robots.txt` dan `/sitemap.xml` ditelan rewrite SPA (balik `index.html`), dan
favicon berukuran 64 px / 32 px tidak memenuhi syarat Google (persegi, kelipatan 48 px).
Akibatnya skor SEO tidak mungkin 100 dan logo brand tidak muncul di hasil pencarian.

**Perubahan:**

| Area                                         | Isi                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/robots.txt` _(baru)_                 | Hanya 6 halaman publik dibuka; area login, `/fess/`, `/base/`, `/assets/`, `/api/` ditutup; menunjuk sitemap                                                                          |
| `public/sitemap.xml` _(baru)_                | 6 URL publik + `lastmod`/`changefreq`/`priority`                                                                                                                                      |
| Favicon _(baru)_                             | `favicon.ico` (16/32/48), `favicon-48/96/144/192.png`, `icon-512.png`                                                                                                                 |
| `scripts/generate-favicons.ps1` _(baru)_     | Menurunkan seluruh ukuran dari `logo.png`/`logo2.jpg`; jalankan ulang bila logo berubah                                                                                               |
| `public/site.webmanifest` _(baru)_           | Nama, ikon 192/512, `theme_color`                                                                                                                                                     |
| `index.html`                                 | Canonical, hreflang, `robots`/`googlebot`, `og:url`/`og:locale`, OG image absolut, JSON-LD `Organization.logo` + `WebApplication`, ejaan **Fessncurious**, `user-scalable=no` dihapus |
| `src/utils/seo.js` _(baru)_                  | Metadata per route; halaman berlogin & NotFound otomatis `noindex`                                                                                                                    |
| `src/router/index.js`                        | `afterEach` memakai `applySeo(seoForRoute(to))`; `description` per halaman publik                                                                                                     |
| `src/components/landing/HeroSection.vue`     | `<h1>` dapat teks `sr-only` berisi nama brand                                                                                                                                         |
| `src/components/landing/SiteFooter.vue`      | Copyright menyebut `(Fessncurious)`                                                                                                                                                   |
| `src/components/feed/AccountPanels.vue`      | Link website → `www.fnc.web.id`                                                                                                                                                       |
| `src/views/AboutPage.vue`, `ContactPage.vue` | `alt=""` pada logo penyelenggara diganti `alt="Logo Concern Dev"`                                                                                                                     |
| `vercel.json`                                | `Content-Type` eksplisit + cache untuk `robots.txt`, `sitemap.xml`, `site.webmanifest`                                                                                                |
| `.env.example`                               | Dokumentasi `VITE_SITE_URL`, domain produksi diperbarui                                                                                                                               |

**Verifikasi produksi:** keempat file SEO/metadata mengembalikan tipe konten yang benar,
aset JS `200`, backend `/api/health` `{"status":"ok"}`, build dan Prettier bersih.

### Backend terkait domain — `1b690e8`, `64eb135`

| Commit    | Isi                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `1b690e8` | `feat(seed)`: script akun demo untuk reviewer payment gateway (`prisma/seed-demo.ts` + 2 script npm) |
| `64eb135` | `chore(canvas)`: watermark kartu memakai `FALLBACK_HOST` = `www.fnc.web.id`                          |

`FALLBACK_HOST` dipakai saat `FRONTEND_URL` kosong (dev/test). Di produksi env tetap
menang, jadi `FRONTEND_URL` wajib diganti.

---

## 29 Okt 2026

### Pengerasan keamanan frontend — merge `67d8ef1`

Detail: [`keamanan-frontend.md`](./keamanan-frontend.md)

Menutup SEC-10 (ingest token OAuth), SEC-28 (draf fess), SEC-29/SEC-30 (penyaringan `href`

- `rel`), SEC-31 (email verifikasi), plus header keamanan.

| Commit    | Isi                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `36b6648` | Header keamanan di `vercel.json`: CSP, HSTS, `X-Frame-Options`, `nosniff`, `Permissions-Policy`, COOP, `Referrer-Policy`                               |
| `b16d7c8` | Token OAuth hanya di-ingest di `Login`/`BaseOnboarding`/`BaseAdmin`, lalu dibuang dari URL; token tidak lagi ditulis ke `localStorage` tanpa cek `exp` |
| `5bfc81d` | `src/utils/url.js` → `safeExternalUrl()`; `FessCard` & `InstagramAnalytics` memakainya; `rel="noopener noreferrer"`                                    |
| `1477d8b` | `src/utils/fessDraft.js` → TTL 7 hari jadi **24 jam**, media tidak disimpan, payload dibatasi ke field dikenal                                         |
| `a6d5650` | Email verifikasi pindah dari query string ke **fragment**                                                                                              |

### Perbaikan CSP produksi — `ef3bb6c`

`connect-src` ditambah `https://be.fnc.web.id` dan `https://*.fnc.web.id`.

Sebelumnya semua XHR/fetch diblokir karena CSP hanya mengizinkan `'self'`, `*.vercel.app`,
dan `*.supabase.co`. Gejalanya menipu: halaman tampil, tetapi seluruh data gagal dimuat.

### Harga publik + halaman kontak — `70da64e`

Harga paket top up sebelumnya hanya terlihat setelah login (di `/wallet`), sehingga
pengajuan payment gateway tertahan.

- `PricingSection`: 5 paket dari `GET /payments/packages`, fallback statis bila API gagal,
  empty state bila admin menonaktifkan semua paket; badge "Paling hemat" dihitung dari rasio
  CTF/Rp (bukan hardcode)
- Navbar & footer: tautan `#harga`; karena anchor disembunyikan di mobile, "Harga" diberi
  chip terpisah
- `ContactPage` (`/contact`): kanal kontak, alur kendala pembayaran, identitas penyelenggara
- `src/data/legal.js`: seksi Pembayaran & Transaksi, Kebijakan Pengembalian Dana, Pengaduan &
  Sengketa; Retensi Data; Midtrans disebut eksplisit sebagai pemroses pembayaran

### Halaman Tentang Kami — `3e945d3`

- `src/views/AboutPage.vue` + `src/data/about.js` (teks dipisah dari presentasi)
- Route publik `/about`; tautan di navbar dan footer
- Navbar: logo & tombol "Masuk App" dibuat `nowrap` agar tidak pecah di mobile

### Branding Concern Dev — `050aeef`, `fcb7abf`

| Commit    | Isi                                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `050aeef` | Komponen `ConcernAttribution` (logo + link `concern.web.id`); ditempatkan di footer landing, `AuthShell`, halaman legal, dan profil base publik; `index.html` dapat `meta author/publisher` + JSON-LD Organization |
| `fcb7abf` | `src/data/organization.js` sebagai satu sumber kebenaran; `concern-logo.png` 41 KB → 1,3 KB (PNG 96 px, palet 48 warna, tetap tajam di 20 px)                                                                      |

### Template & konsol Super Admin

| Commit    | Isi                                                                                 |
| --------- | ----------------------------------------------------------------------------------- |
| `1adf378` | Katalog template SVG diambil dari API (PR #1)                                       |
| `a92534f` | Konsol template, harga fess per base, paket top-up berbasis DB, kupon promo (PR #2) |
| `2cd7573` | Pratinjau slide cover otomatis di modal publish                                     |
| `f83622b` | Tombol isi otomatis metadata template lewat AI                                      |
| `fd073ed` | Usulan metadata AI diabaikan bila SVG sudah diganti                                 |
| `6446df3` | Pratinjau carousel bisa berhenti di posisi mana pun                                 |
| `a06be82` | Template khusus base ditandai di pemilih template                                   |

### Lain-lain

| Commit    | Isi                                                           |
| --------- | ------------------------------------------------------------- |
| `085c27b` | Tampilkan baris baru (Enter) pada isi fess                    |
| `3b20e9c` | Analitik fess digabung ke Analitik Konten + grafik tren & jam |

---

## Catatan status repo

### Branch

| Branch                                           | Status                                        |
| ------------------------------------------------ | --------------------------------------------- |
| `main`                                           | aktif, sama dengan `origin/main`              |
| `feat/seo-sitemap-favicon`                       | sudah merge ke `main` (fast-forward)          |
| `backup/main-sebelum-seo`                        | cadangan sebelum merge SEO                    |
| `feat/midtrans-public-pricing`, `redesign-hikam` | isinya sudah masuk `main` (0 commit di depan) |

Branch remote yang isinya sudah 100% ada di `main` dan aman dihapus:
`feat/ai-thumbnail`, `feat/svg-templates-db`, `feat/template-eksklusif`,
`feat/template-admin-import`.

> `feat/template-admin-import` **tidak muncul** di `git branch --merged`, karena masuk lewat
> _squash merge_ (PR #2 → satu commit `a92534f`). Membandingkan file membuktikan tidak ada
> yang tertinggal — dan menggabungkannya ulang justru menghapus 248 baris
> `TemplatesPage.vue` yang sudah lebih baru di `main`.

### Test backend yang gagal (di luar lingkup frontend)

`tests/template-admin.util.test.ts` — 7 gagal dengan
`SyntaxError: Invalid or unexpected token`.

Penyebab: `scripts/measure-templates.mjs` diawali shebang `#!/usr/bin/env node`. Node biasa
bisa meng-import file itu (sudah diuji), tetapi transformer Vitest/esbuild menolaknya.

- **Bukan** akibat perubahan SEO/domain
- **Tidak** memengaruhi produksi
- Sudah dipastikan gagal juga pada `facae06` sebelum perubahan apa pun

Status keseluruhan backend: **629 lulus / 7 gagal (semua dari satu file di atas)**.
