<template>
  <div class="wallet-page">
    <header class="wallet-page-header">
      <router-link :to="homeRoute" class="wallet-back-link">
        <ArrowLeft :size="17" />
        <span>Kembali</span>
      </router-link>
      <div class="wallet-page-title">
        <span class="wallet-page-icon"><Wallet :size="18" /></span>
        <div>
          <h1>Dompet CTF</h1>
          <p>Top up dan riwayat transaksi</p>
        </div>
      </div>
      <span class="wallet-secure-badge"><ShieldCheck :size="14" /> Aman</span>
    </header>

    <main class="wallet-page-main">
      <TopUpFlow :initial-order-id="orderId" />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-vue-next';
import TopUpFlow from '../components/payments/TopUpFlow.vue';
import { useAuthStore } from '../stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const orderId = computed(() =>
  typeof route.query.order_id === 'string' ? route.query.order_id : '',
);

const homeRoute = computed(() => {
  const role = authStore.user?.role;
  if (role === 'Super Admin') return '/super-admin';
  if (role === 'Base Admin') return '/base-admin';
  return '/feed';
});

onMounted(() => {
  // Refresh the authoritative wallet balance when the wallet page opens. A
  // webhook may have credited CTF while the user was away.
  authStore.fetchMe().catch(() => {});
});
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% -10%, rgba(205, 242, 43, 0.08), transparent 36%), var(--bg-page);
  color: var(--shell-text);
  font-family: var(--font-sans);
}

.wallet-page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
  padding: 14px 20px;
  background: color-mix(in srgb, var(--bg-page) 88%, transparent);
  border-bottom: 1px solid var(--shell-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.wallet-back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  justify-self: start;
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.wallet-back-link:hover {
  color: var(--shell-text);
}

.wallet-page-title {
  display: flex;
  align-items: center;
  gap: 9px;
  justify-self: center;
}

.wallet-page-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--shell-chip);
  color: var(--shell-accent);
}

.wallet-page-title h1 {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;
}

.wallet-page-title p {
  margin: 1px 0 0;
  font-size: 9.5px;
  color: var(--shell-text-dim);
}

.wallet-secure-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: end;
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-text);
  font-size: 10px;
  font-weight: 900;
}

.wallet-page-main {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 16px 48px;
}

@media (max-width: 520px) {
  .wallet-page-header {
    grid-template-columns: auto 1fr auto;
    padding: 11px 13px;
  }
  .wallet-back-link span,
  .wallet-page-title p,
  .wallet-secure-badge {
    display: none;
  }
  .wallet-page-title {
    justify-self: start;
  }
  .wallet-page-main {
    padding: 14px 11px 40px;
  }
}
</style>
