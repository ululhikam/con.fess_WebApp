<template>
  <footer class="lp-footer">
    <div class="footer-left">
      <div class="footer-logo">
        <img src="/logo.png" alt="Fess n Curious Logo" class="footer-logo-img" />
        <span class="logo-text">FESS <strong>N CURIOUS</strong></span>
      </div>
      <p>© 2026 Fess n Curious - Automatic Social Media Confession Platform.</p>
      <ConcernAttribution variant="footer" class="footer-attribution" />
    </div>

    <div class="footer-right">
      <nav class="footer-links" aria-label="Tautan footer">
        <router-link to="/login">Masuk</router-link>
        <a href="#fitur">Fitur</a>
        <a href="#cara-kerja">Cara Kerja</a>
        <a href="#komunitas">Komunitas</a>
        <a href="#faq">FAQ</a>
      </nav>

      <nav class="footer-legal" aria-label="Tautan legal">
        <router-link to="/privacy">Kebijakan Privasi</router-link>
        <router-link to="/terms">Ketentuan Layanan</router-link>
        <router-link to="/data-deletion">Penghapusan Data</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import ConcernAttribution from '../common/ConcernAttribution.vue';

/**
 * SiteFooter — page footer: brand, copyright, quick anchor links, dan
 * navigasi halaman legal publik (Kebijakan Privasi / Ketentuan / Penghapusan Data).
 * Atribusi "Powered by Concern Dev" duduk di bawah copyright sebagai lapisan
 * paling bawah, bukan di dalam pill logo, agar brand utama tetap dominan.
 */
</script>

<style scoped>
.lp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  border-top: 1px solid var(--border-subtle);
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface);
  color: var(--text-main);
  padding: 10px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.3px;
}

.footer-logo-img {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.footer-left p {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* Atribusi Concern: dipisah garis tipis supaya tidak menyaingi copyright. */
.footer-attribution {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  width: fit-content;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-links a,
.footer-legal a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  transition: color 0.15s ease;
}

.footer-links a:hover,
.footer-legal a:hover {
  color: var(--brand-blue);
}

/* ---- Baris legal: Kebijakan Privasi / Ketentuan / Penghapusan Data ---- */
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.footer-legal {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 20px;
}

/* ---- Mobile: footer menumpuk & center supaya rapi ---- */
@media (max-width: 720px) {
  .lp-footer {
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
  }

  .footer-right {
    align-items: center;
    gap: 14px;
  }

  .footer-links,
  .footer-legal {
    justify-content: center;
    gap: 10px 18px;
  }

  .footer-attribution {
    margin-left: auto;
    margin-right: auto;
  }

  .footer-legal {
    padding-top: 14px;
    border-top: 1px solid var(--border-subtle);
  }
}
</style>
