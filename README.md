# FessHub — Base Confess

Platform sosial anonim berbasis _Base_ (Vue 3 + Vite + Pinia + Vue Router).

---

## Menjalankan

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # output di dist/
npm run preview        # cek hasil build
npm run format         # format seluruh repo dengan Prettier
npm run format:check   # CI: pastikan formatting bersih
```

Formatting ditetapkan oleh `.prettierrc.json` + `.editorconfig`, di-_ignore_ oleh
`.prettierignore`, dan dicek oleh `format:check`.

---

## Struktur

```
src/
├─ assets/                  # gambar, font lokal
├─ components/
│  ├─ admin/                # potongan dashboard admin
│  ├─ auth/                 # AuthShell, AuthLogo, FormField
│  ├─ feed/                 # FeedCard + 4 tab (Home/Search/Aktivitas/Akun) + ComposerModal
│  ├─ landing/              # section-section halaman marketing
│  ├─ layout/               # AppHeader, BottomNavBar (chrome aplikasi)
│  ├─ profile/              # kolom & kartu halaman profil
│  └─ ui/                   # primitif bersama: AppSkeleton, ContentSkeleton,
│                           #   AppStateView, ThemeToggle
├─ composables/             # logika yang bisa dipakai ulang & diuji
│  ├─ useAsyncData.js       # loading / error / reload  → sumber skeleton
│  ├─ useFeedPosts.js       # timeline: like, publish
│  ├─ useFollowBase.js      # follow/unfollow base
│  ├─ useTheme.js           # mode gelap / terang / sistem
│  └─ useValidatedForm.js   # validasi form deklaratif
├─ data/                    # data mock. Ganti dengan API = ubah 1 file.
├─ plugins/                 # registrasi plugin + bootstrap aplikasi
├─ router/                  # route lazy-loaded + guard + scroll behaviour
├─ stores/                  # Pinia (auth, fess)
├─ utils/                   # helper murni (formatNumber, cx, truncate, …)
├─ views/                   # shell tipis (≈150–250 baris) yang menyusun komponen
└─ style.css                # design token + reset + utility global
```

---

## Arsitektur

### 1. Pemisahan Concerns

| Concern          | Rumahnya                                | Contoh                            |
| ---------------- | --------------------------------------- | --------------------------------- |
| State & perilaku | `stores/`, `composables/`               | `useFeedPosts`, `useTheme`        |
| Data statis      | `data/`                                 | `FEED_POSTS`, `ALL_BASES`         |
| Tampilan         | `views/` (shell) → `components/` (blok) | `FeedPage` → `FeedHomeTab`        |
| Gaya             | `<style scoped>` per komponen           | setiap komponen punya CSS sendiri |
| Logika murni     | `utils/`                                | `formatNumber`, `cx`              |

**Aturan:** satu komponen satu tanggung jawab, target < 250 baris.
`views/*` hanya memegang _state navigasi_ dan memasang komponen.

### 2. Design token (dark & light)

Semua warna permukaan/teks/border/box-shadow **diharuskan** memakai variabel CSS
di `src/style.css` — dilarang menulis hex langsung di komponen.

```css
:root {
  /* mode gelap (default) */
  --bg-page: #0b0d14;
  --bg-surface: #131722;
  --text-main: #f3f4f6;
  /* … */
}

[data-theme='light'] {
  --bg-page: #f4f5f8;
  --bg-surface: #ffffff;
  --text-main: #111827;
}
```

Token yang tersedia:

| Kelompok      | Variabel                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Permukaan     | `--bg-page`, `--bg-surface`, `--bg-surface-2`, `--bg-raised`, `--bg-inset`                                              |
| Teks          | `--text-main`, `--text-secondary`, `--text-muted`, `--text-on-accent`                                                   |
| Border        | `--border-subtle`, `--border-strong`, `--border-on-accent`                                                              |
| Brand (tetap) | `--lime-primary`, `--neon-blue`, `--brand-blue`, `--cyber-pink`, `--danger`, `--success`, `--warning`                   |
| Feed shell    | `--shell-bg`, `--shell-stage`, `--shell-card`, `--shell-text`, `--shell-accent`, `--shell-active`, `--shell-sub-accent` |
| Lainnya       | `--shadow-color`, `--skeleton-base`, `--skeleton-shine`, `--overlay-scrim`                                              |
| Radius        | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`                                                            |
| Teks status   | `--danger-text`, `--success-text`, `--warning-text`, `--sub-accent-text`, `--lime-text`                                 |
| Elemen khusus | `--tag-cerita-bg/fg`, `--tag-tanya-bg/fg`, `--social-blue-bg/fg`, `--social-green-bg/fg`, `--neo-edge`                  |

> **Aturan penting:** `--danger` / `--success` / `--warning` / `--cyber-pink`
> **hanya untuk fill & border**. Sebagai warna teks gunakan varian `*-text`-nya —
> versi aslinya tidak lolos kontras 4.5:1 di kartu putih tema terang.

Warna brand yang bersifat _primitif_ (mis. `#0038FF` tombol CTA) sengaja tidak
berganti antar tema — hanya permukaan dan teks yang berpindah.

### 3. Mode gelap / terang

- `src/composables/useTheme.js` — tiga mode: `system` (default), `dark`, `light`.
- Pilihan disimpan di `localStorage` (`fess_theme`) dan ditulis ke
  `<html data-theme="…">`.
- Skrip inline di `index.html` berjalan **sebelum paint pertama**, sehingga tidak
  ada kilatan tema yang salah (FOUC).
- Ikuti `prefers-color-scheme` selama pengguna belum memilih sendiri.
- Toggle UI: `components/ui/ThemeToggle.vue` (ada di header feed, halaman auth).

### 4. Skeleton & state kosong/gagal

```vue
<ContentSkeleton v-if="loading" type="stats" :count="4" label="Memuat…" />
<AppStateView
  v-else-if="error"
  variant="error"
  title="Gagal memuat"
  action-label="Coba lagi"
  @action="reload"
/>
<AppStateView v-else-if="!items.length" variant="empty" title="Belum ada data" />
<template v-else>…konten…</template>
```

Di-backing oleh `useAsyncData(fetcher, { delay })` → `{ data, loading, error, reload }`.
Tipe skeleton: `page`, `feed-card`, `list`, `stats`, `profile`.

### 5. Routing

- Semua route memakai **dynamic import** → tiap layanan jadi chunk sendiri.
- Guard global: `requiresAuth` → `roles`, lalu set judul dokumen.
- `scrollBehavior` mengembalikan posisi saat back/forward dan menghormati `#anchor`.
- Rute `/:pathMatch(.*)*` → halaman 404.
- `App.vue` menampilkan _progress bar_ tipis + transisi antar halaman.

### 6. Ikon

Pakai [`lucide-vue-next`](https://lucide.dev). **Jangan pakai emoji sebagai
ikon** — emoji hanya boleh muncul di konten buatan pengguna (isi post, bio).
Ikon yang butuh label aksesibel wajib diberi `aria-label` (tombol ikon saja)
atau `aria-hidden="true"` (ikon dekoratif).

---

## Konvensi

- `<script setup>` di setiap SFC; impor ikon per komponen, bukan global.
- Utility class (`.flex`, `.mb-4`, `.gap-3`, `.text-xs`, `.font-bold`, …)
  sudah ada di `src/style.css` global — **jangan didefinisikan ulang** di `<style scoped>`.
- Semua `<button>` harus punya `type="button"` kecuali submit dalam `<form>`.
- `<input>` harus punya `<label for>` (pakai `components/auth/FormField.vue`).
- Aksesibilitas: `aria-label`, `aria-current`, `aria-selected`, `aria-expanded`,
  `role="tablist"`/`"tab"`/`"switch"`, dan `:focus-visible` global.
- Hormati `prefers-reduced-motion` (sudah ditangani di `style.css`).

---

## Struktur file penting

| File                   | Peran                                                  |
| ---------------------- | ------------------------------------------------------ |
| `index.html`           | link Google Fonts (Poppins) + bootstrap tema anti-FOUC |
| `src/style.css`        | token desain, reset, animasi, utility global           |
| `src/main.js`          | pipeline bootstrapping (`plugins/index.js`)            |
| `src/plugins/index.js` | `createPinia()`, router, `initTheme()`                 |
| `src/router/index.js`  | route, guard, scroll, judul dokumen                    |
