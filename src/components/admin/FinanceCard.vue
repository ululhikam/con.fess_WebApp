<template>
  <AdminCard
    title="Keuangan & Saldo $CLUB"
    description="Pendapatan komunitas dari kontribusi creator & auto-crossposting"
  >
    <div class="treasury-banner p-5 flex justify-between items-center flex-wrap gap-4">
      <div>
        <span class="treasury-label text-xs font-bold">{{ treasury.label }}</span>
        <div class="treasury-balance text-3xl mt-1">{{ treasury.balance }}</div>
      </div>
      <AdminButton variant="lime">{{ treasury.action }}</AdminButton>
    </div>
  </AdminCard>
</template>

<script setup>
/**
 * FinanceCard — treasury balance banner for the keuangan tab.
 */
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';

defineProps({
  treasury: {
    type: Object,
    required: true,
    // { label, balance, action }
  },
});
</script>

<style scoped>
.treasury-banner {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border-radius: var(--radius-lg);
}

.treasury-label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.treasury-balance {
  font-weight: 800;
  color: var(--lime-primary);
}
</style>
