<template>
  <main class="legal-page">
    <div class="legal-wrap">
      <header class="legal-top">
        <RouterLink to="/" class="legal-back">
          <ChevronLeft :size="16" />
          <span>Kembali</span>
        </RouterLink>
        <span class="legal-brand">Fess n Curious</span>
        <span class="legal-top-spacer" aria-hidden="true" />
      </header>

      <div class="legal-hero">
        <component :is="page.icon" :size="36" class="legal-icon" />
        <h1 class="legal-title">{{ page.title }}</h1>
        <p class="legal-updated">Terakhir diperbarui: {{ LEGAL_LAST_UPDATED }}</p>
      </div>

      <div class="legal-content">
        <section v-for="sec in page.sections" :key="sec.title" class="legal-section">
          <h2 class="legal-section-title">{{ sec.title }}</h2>
          <p v-for="(para, i) in sec.paragraphs" :key="i" class="legal-para">{{ para }}</p>
        </section>
      </div>

      <p class="legal-foot">
        Ada pertanyaan? Hubungi
        <a :href="`mailto:${LEGAL_CONTACT_EMAIL}`">{{ LEGAL_CONTACT_EMAIL }}</a>
      </p>

      <ConcernAttribution variant="legal" class="legal-attribution" />
    </div>
  </main>
</template>

<script setup>
/**
 * LegalPage — halaman legal publik (tanpa login) untuk Meta App Review:
 * /privacy, /terms, /data-deletion. Kontennya berasal dari satu sumber yang
 * sama dengan panel in-app (src/data/legal.js) agar tidak pernah beda teks.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronLeft, Shield, ScrollText, Trash2 } from 'lucide-vue-next';
import ConcernAttribution from '../components/common/ConcernAttribution.vue';
import {
  TERMS_SECTIONS,
  PRIVACY_SECTIONS,
  DATA_DELETION_SECTIONS,
  LEGAL_LAST_UPDATED,
  LEGAL_CONTACT_EMAIL,
} from '../data/legal';

const route = useRoute();

const LEGAL_PAGES = {
  privacy: { title: 'Kebijakan Privasi', icon: Shield, sections: PRIVACY_SECTIONS },
  terms: { title: 'Ketentuan Layanan', icon: ScrollText, sections: TERMS_SECTIONS },
  'data-deletion': { title: 'Penghapusan Data', icon: Trash2, sections: DATA_DELETION_SECTIONS },
};

const page = computed(() => LEGAL_PAGES[route.meta.legal] || LEGAL_PAGES.privacy);
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
}

.legal-wrap {
  width: min(760px, 100%);
  margin: 0 auto;
  padding: 20px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.legal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 8px;
}

.legal-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease;
}

.legal-back:hover {
  color: var(--neon-blue);
}

.legal-brand {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: var(--text-main);
}

.legal-top-spacer {
  width: 64px;
}

.legal-hero {
  text-align: center;
  padding: 8px 0 4px;
}

.legal-icon {
  color: var(--neon-blue);
  margin: 0 auto 12px;
  display: block;
}

.legal-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-main);
}

.legal-updated {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.legal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legal-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 16px;
}

.legal-section-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 10px;
}

.legal-para {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.legal-para:last-child {
  margin-bottom: 0;
}

.legal-foot {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.legal-foot a {
  color: var(--neon-blue);
  font-weight: 700;
  text-decoration: none;
}

.legal-foot a:hover {
  text-decoration: underline;
}

.legal-attribution {
  margin-top: 4px;
}
</style>
