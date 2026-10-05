<template>
  <section class="lp-cta-banner" aria-labelledby="cta-title">
    <div class="cta-inner">
      <h2 id="cta-title">Mulai Kirim Fess Anonim Sekarang!</h2>
      <p>Bergabung dengan ribuan pengguna lainnya di Base Confess Engine.</p>
      <router-link to="/login" class="hero-cta-btn">
        Masuk ke App Sekarang <ArrowRight :size="16" />
      </router-link>
    </div>
  </section>
</template>

<script setup>
/**
 * CtaSection — closing call-to-action banner on the branded shell colour.
 */
import { ArrowRight } from 'lucide-vue-next';
</script>

<style scoped>
.lp-cta-banner {
  background: var(--shell-bg);
  color: var(--shell-text);
  border-radius: 36px;
  padding: 60px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 60px;
}

.cta-inner h2 {
  font-family: var(--font-sans);
  font-size: 36px;
  font-weight: 900;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.cta-inner p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 28px 0;
}

.hero-cta-btn {
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  font-weight: 900;
  font-size: 16px;
  padding: 16px 36px;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 25px var(--shadow-color);
  transition: transform 0.2s ease;
}

.hero-cta-btn:hover {
  transform: scale(1.05);
}
</style>
