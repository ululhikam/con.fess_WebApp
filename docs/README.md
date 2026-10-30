# Dokumentasi Frontend — Fess n Curious

Kumpulan catatan teknis untuk aplikasi web (`frontend/`). Fokusnya **mengapa** sebuah
keputusan diambil, bukan sekadar daftar file yang berubah — supaya perubahan berikutnya
tidak mengulang masalah yang sama.

Untuk dokumentasi backend, lihat `backend/docs/`.

---

## Daftar dokumen

| Dokumen                                              | Isi                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [`seo-dan-logo-google.md`](./seo-dan-logo-google.md) | Pekerjaan SEO: sitemap, robots.txt, favicon yang memenuhi syarat Google, metadata per halaman, dan langkah Search Console |
| [`keamanan-frontend.md`](./keamanan-frontend.md)     | Pengerasan keamanan: CSP & header, ingest token OAuth, draf fess, penyaringan `href`, email verifikasi                    |
| [`riwayat-perubahan.md`](./riwayat-perubahan.md)     | Kronologi semua perubahan beserta commit dan alasan singkatnya                                                            |

---

## Konteks yang perlu diketahui dulu

### Domain

| Varian                            | Perilaku                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| `https://fnc.web.id`              | `308` → `https://www.fnc.web.id` (oleh Vercel)                |
| `http://fnc.web.id`               | `301` → `https://fnc.web.id` → `www`                          |
| `http://www.fnc.web.id`           | `308` → `https://www.fnc.web.id`                              |
| **`https://www.fnc.web.id`**      | **kanonik** — semua URL absolut di kode menunjuk ke sini      |
| `https://fessncurious.vercel.app` | masih hidup, konten identik; dipakai verifikasi Meta Business |

Karena itu seluruh `canonical`, `og:url`, `sitemap.xml`, dan `SITE_URL` memakai
`https://www.fnc.web.id`. Jangan menulis `fnc.web.id` tanpa `www` di metadata — akan
menghasilkan sinyal kanonik ganda.

### Arsitektur yang membatasi pilihan

- **SPA murni (Vue 3 + Vite).** HTML yang dikirim server selalu `index.html` yang sama;
  metadata berubah di sisi klien lewat `src/utils/seo.js`.
- **`vercel.json` punya rewrite catch-all** `/(.*)` → `/index.html`. Konsekuensi penting:
  URL apa pun yang tidak ada di `public/` akan dibalas `200` + HTML aplikasi, **bukan
  `404`**. Termasuk file verifikasi Google berjenis "HTML file" — metode itu tidak bisa
  dipakai.
- **File di `public/` menang atas rewrite.** Itulah sebabnya `robots.txt` dan `sitemap.xml`
  harus berbentuk file statis, bukan route aplikasi.
