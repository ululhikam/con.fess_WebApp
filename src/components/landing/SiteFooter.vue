<template>
  <footer class="lp-footer">
    <div class="footer-left">
      <div class="footer-logo">
        <img src="/logo.png" alt="Fess n Curious Logo" class="footer-logo-img" />
        <span class="logo-text">FESS <strong>N CURIOUS</strong></span>
      </div>
      <p>© 2026 Fess n Curious - Automatic Social Media Confession Platform.</p>
    </div>

    <nav class="footer-links" aria-label="Tautan footer">
      <router-link to="/login">Masuk</router-link>
      <a href="#fitur">Fitur</a>
      <a href="#cara-kerja">Cara Kerja</a>
      <a href="#komunitas">Komunitas</a>
      <a href="#faq">FAQ</a>
    </nav>
  </footer>
</template>

<script setup>
/**
 * SiteFooter — page footer: brand, copyright and quick anchor links.
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

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}

.footer-links a:hover {
  color: var(--brand-blue);
}
</style>
