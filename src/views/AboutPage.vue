<template>
  <main class="about-page">
    <div class="about-wrap">
      <header class="about-top">
        <RouterLink to="/" class="about-back">
          <ChevronLeft :size="16" />
          <span>Kembali</span>
        </RouterLink>
        <span class="about-brand">Fess n Curious</span>
        <RouterLink to="/login" class="about-login">Masuk App</RouterLink>
      </header>

      <!-- HERO -->
      <section class="about-hero" aria-labelledby="about-title">
        <span class="about-badge">{{ ABOUT_HERO.badge }}</span>
        <h1 id="about-title" class="about-title">{{ ABOUT_HERO.title }}</h1>
        <p class="about-subtitle">{{ ABOUT_HERO.subtitle }}</p>
      </section>

      <!-- CERITA -->
      <section class="about-card" aria-labelledby="about-story-title">
        <h2 id="about-story-title" class="about-card-title">{{ ABOUT_STORY.title }}</h2>
        <p v-for="(para, i) in ABOUT_STORY.paragraphs" :key="i" class="about-para">{{ para }}</p>
      </section>

      <!-- NILAI -->
      <section class="about-values" aria-labelledby="about-values-title">
        <h2 id="about-values-title" class="about-section-title">Yang kami jaga</h2>
        <div class="about-grid">
          <article v-for="item in ABOUT_VALUES" :key="item.title" class="about-value-card">
            <span class="about-value-icon" aria-hidden="true">
              <component :is="ICONS[item.icon]" :size="20" />
            </span>
            <h3 class="about-value-title">{{ item.title }}</h3>
            <p class="about-value-desc">{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <!-- PENYELENGGARA -->
      <section class="about-organizer" aria-labelledby="about-organizer-title">
        <div class="about-organizer-head">
          <img
            class="about-organizer-logo"
            :src="ORGANIZER_LOGO"
            alt=""
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
          />
          <h2 id="about-organizer-title" class="about-organizer-title">
            {{ ABOUT_ORGANIZER.title }}
          </h2>
        </div>

        <p
          v-for="(para, i) in ABOUT_ORGANIZER.paragraphs"
          :key="i"
          class="about-para about-para--muted"
        >
          {{ para }}
        </p>

        <a
          class="about-organizer-link"
          :href="ORGANIZER_URL"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Kunjungi {{ ORGANIZER_NAME }}</span>
          <ArrowUpRight :size="15" />
        </a>
      </section>

      <!-- KONTAK -->
      <section class="about-contact" aria-labelledby="about-contact-title">
        <h2 id="about-contact-title" class="about-section-title">{{ ABOUT_CONTACT.title }}</h2>
        <p class="about-para about-para--center">{{ ABOUT_CONTACT.desc }}</p>
        <a class="about-contact-btn" :href="`mailto:${LEGAL_CONTACT_EMAIL}`">
          <Mail :size="16" />
          <span>{{ LEGAL_CONTACT_EMAIL }}</span>
        </a>
        <nav class="about-legal-links" aria-label="Tautan legal">
          <RouterLink to="/privacy">Kebijakan Privasi</RouterLink>
          <RouterLink to="/terms">Ketentuan Layanan</RouterLink>
          <RouterLink to="/data-deletion">Penghapusan Data</RouterLink>
        </nav>
      </section>

      <ConcernAttribution variant="legal" class="about-attribution" />
    </div>
  </main>
</template>

<script setup>
/**
 * AboutPage — halaman publik /about.
 *
 * Isi teks diambil dari src/data/about.js supaya bisa ditinjau tanpa menyentuh
 * markup, dan identitas penyelenggara dari src/data/organization.js (sumber yang
 * sama dengan atribusi footer & halaman legal).
 */
import {
  ChevronLeft,
  ArrowUpRight,
  Mail,
  ShieldCheck,
  MessagesSquare,
  Sparkles,
  Coins,
} from 'lucide-vue-next';
import ConcernAttribution from '../components/common/ConcernAttribution.vue';
import {
  ABOUT_HERO,
  ABOUT_STORY,
  ABOUT_VALUES,
  ABOUT_ORGANIZER,
  ABOUT_CONTACT,
} from '../data/about';
import { ORGANIZER_NAME, ORGANIZER_URL, ORGANIZER_LOGO } from '../data/organization';
import { LEGAL_CONTACT_EMAIL } from '../data/legal';

/** Nama ikon di data/about.js dipetakan ke komponen lucide yang benar-benar diimpor. */
const ICONS = { ShieldCheck, MessagesSquare, Sparkles, Coins };
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
}

.about-wrap {
  width: min(820px, 100%);
  margin: 0 auto;
  padding: 20px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- TOP BAR ---- */
.about-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0 8px;
}

.about-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease;
}

.about-back:hover {
  color: var(--neon-blue);
}

.about-brand {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: var(--text-main);
}

.about-login {
  font-size: 13px;
  font-weight: 800;
  color: var(--neon-blue);
  text-decoration: none;
  white-space: nowrap;
}

.about-login:hover {
  text-decoration: underline;
}

/* ---- HERO ---- */
.about-hero {
  text-align: center;
  padding: 12px 0 4px;
}

.about-badge {
  display: inline-block;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.6px;
  padding: 5px 13px;
  border-radius: var(--radius-pill);
  margin-bottom: 14px;
}

.about-title {
  font-size: clamp(26px, 5vw, 36px);
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.2;
  color: var(--text-main);
}

.about-subtitle {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 620px;
  margin: 12px auto 0;
}

/* ---- KARTU CERITA ---- */
.about-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 20px;
}

.about-card-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 12px;
}

.about-para {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.about-para:last-child {
  margin-bottom: 0;
}

.about-para--muted {
  color: var(--text-secondary);
}

.about-para--center {
  text-align: center;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

/* ---- NILAI ---- */
.about-section-title {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.3px;
  color: var(--text-main);
  margin-bottom: 14px;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.about-value-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-value-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  flex-shrink: 0;
}

.about-value-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.35;
}

.about-value-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
}

/* ---- PENYELENGGARA ---- */
.about-organizer {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 20px;
}

.about-organizer-head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
}

.about-organizer-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  object-fit: contain;
  flex-shrink: 0;
}

.about-organizer-title {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.3px;
  color: var(--text-main);
  line-height: 1.3;
}

.about-organizer-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 800;
  color: var(--neon-blue);
  text-decoration: none;
}

.about-organizer-link:hover {
  text-decoration: underline;
}

/* ---- KONTAK ---- */
.about-contact {
  text-align: center;
  padding: 12px 0 0;
}

.about-contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  padding: 11px 20px;
  border-radius: var(--radius-pill);
  background: var(--neon-blue);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.15s ease;
}

.about-contact-btn:hover {
  background: var(--neon-blue-hover);
}

.about-legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 18px;
  margin-top: 20px;
}

.about-legal-links a {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-decoration: none;
}

.about-legal-links a:hover {
  color: var(--neon-blue);
}

.about-attribution {
  margin-top: 4px;
}

@media (max-width: 640px) {
  .about-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .about-wrap {
    padding: 16px 16px 48px;
    gap: 16px;
  }

  .about-card,
  .about-organizer {
    padding: 16px;
  }
}
</style>
