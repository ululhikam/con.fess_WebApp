<template>
  <main class="not-found">
    <div class="not-found__inner">
      <p class="not-found__code">404</p>

      <AppStateView
        variant="empty"
        title="Halaman tidak ditemukan"
        description="Tautan yang kamu buka sudah dipindahkan, dihapus, atau memang tidak pernah ada."
      >
        <router-link to="/" class="not-found__home">Kembali ke Beranda</router-link>
      </AppStateView>
    </div>
  </main>
</template>

<script setup>
import AppStateView from '../components/ui/AppStateView.vue';
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--bg-page);
  color: var(--text-main);
}

.not-found__inner {
  width: min(460px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.not-found__code {
  margin: 0;
  text-align: center;
  font-size: clamp(56px, 15vw, 96px);
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1;
  color: var(--neon-blue);
}

.not-found__home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.15s ease;
}

.not-found__home:hover {
  transform: translateY(-2px);
}
</style>
