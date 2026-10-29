<template>
  <div class="concern-attr" :class="`concern-attr--${variant}`">
    <a class="concern-attr__link" :href="CONCERN_URL" target="_blank" rel="noopener noreferrer">
      <!-- alt kosong: nama brand sudah dibaca dari teks di sebelahnya. -->
      <img
        class="concern-attr__logo"
        :src="CONCERN_LOGO"
        alt=""
        width="20"
        height="20"
        loading="lazy"
        decoding="async"
      />
      <span class="concern-attr__text">
        Powered by <strong class="concern-attr__brand">{{ CONCERN_NAME }}</strong>
      </span>
    </a>
  </div>
</template>

<script setup>
/**
 * ConcernAttribution — atribusi "Powered by Concern" yang dipakai seragam di
 * footer landing, halaman auth (di luar card), halaman legal, dan profil base
 * publik. Satu komponen supaya ukuran, jarak, dan warna tidak melenceng antar
 * tempat, serta otomatis mengikuti tema terang/gelap lewat CSS variable.
 *
 * `variant` hanya mengatur palet & perataan — bukan struktur, jadi markup dan
 * aksesibilitasnya identik di semua pemakaian.
 */
defineProps({
  /**
   * footer  → di bawah copyright landing (muted, kiri di desktop)
   * auth    → di luar auth card, di atas background biru (butuh kontras putih)
   * legal   → di bawah halaman legal (center)
   * profile → di bawah profil base publik (center, di atas bottom nav)
   */
  variant: {
    type: String,
    default: 'footer',
    validator: (v) => ['footer', 'auth', 'legal', 'profile'].includes(v),
  },
});

const CONCERN_NAME = 'Concern Dev';
const CONCERN_URL = 'https://concern.web.id';
const CONCERN_LOGO = '/concern-logo.png';
</script>

<style scoped>
.concern-attr {
  display: flex;
  justify-content: flex-start;
}

.concern-attr__link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  /* Target sentuh nyaman di mobile tanpa membuat baris terlihat besar. */
  min-height: 32px;
  padding: 4px 2px;
  text-decoration: none;
  border-radius: 8px;
  transition:
    opacity 0.15s ease,
    color 0.15s ease;
}

.concern-attr__link:hover {
  opacity: 0.85;
}

.concern-attr__link:focus-visible {
  outline: 2px solid var(--neon-blue);
  outline-offset: 3px;
}

.concern-attr__logo {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  object-fit: contain;
  flex-shrink: 0;
}

.concern-attr__text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  line-height: 1.3;
  white-space: nowrap;
}

.concern-attr__brand {
  font-weight: 900;
}

/* ---- footer landing: muted, menyatu dengan teks copyright ---- */
.concern-attr--footer .concern-attr__link {
  color: var(--text-muted);
}

.concern-attr--footer .concern-attr__brand {
  color: var(--text-secondary);
}

.concern-attr--footer .concern-attr__link:hover {
  color: var(--text-secondary);
}

/* ---- auth: di atas background biru, jadi pakai token shell ---- */
.concern-attr--auth {
  justify-content: center;
}

.concern-attr--auth .concern-attr__link {
  color: var(--shell-text-muted);
}

.concern-attr--auth .concern-attr__brand {
  color: var(--shell-text);
}

.concern-attr--auth .concern-attr__link:hover {
  color: var(--shell-text);
}

.concern-attr--auth .concern-attr__logo {
  width: 20px;
  height: 20px;
}

/* ---- legal: center, muted app token ---- */
.concern-attr--legal {
  justify-content: center;
}

.concern-attr--legal .concern-attr__link {
  color: var(--text-muted);
}

.concern-attr--legal .concern-attr__brand {
  color: var(--text-secondary);
}

.concern-attr--legal .concern-attr__link:hover {
  color: var(--text-secondary);
}

/* ---- profil base publik: halaman ini memakai token --shell-* ---- */
.concern-attr--profile {
  justify-content: center;
}

.concern-attr--profile .concern-attr__link {
  color: var(--shell-text-muted, rgba(255, 255, 255, 0.6));
}

.concern-attr--profile .concern-attr__brand {
  color: var(--shell-text, #ffffff);
}

.concern-attr--profile .concern-attr__link:hover {
  color: var(--shell-text, #ffffff);
}

.concern-attr--profile .concern-attr__link:focus-visible {
  outline-color: var(--shell-accent, #baff00);
}

@media (max-width: 720px) {
  .concern-attr--footer {
    justify-content: center;
  }
}
</style>
