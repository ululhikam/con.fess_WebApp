<template>
  <div class="super-admin-page">
    <AdminTopNav active="super-admin" sticky />

    <main class="container py-8">
      <div class="flex flex-col gap-6">
        <SuperAdminHeader
          :title="SUPER_ADMIN_HEADER.title"
          :subtitle="SUPER_ADMIN_HEADER.subtitle"
          :health="healthLabel"
        >
          <template #actions> </template>
        </SuperAdminHeader>

        <ContentSkeleton v-if="loading" type="stats" :count="4" label="Memuat status sistem…" />

        <AppStateView
          v-else-if="error"
          variant="error"
          title="Data sistem gagal dimuat"
          description="Monitor global sedang tidak tersedia. Silakan coba lagi."
          action-label="Coba lagi"
          @action="reload"
        />

        <template v-else>
          <SystemStatGrid :stats="systemStats" />

          <div class="super-controls-grid">
            <SecurityControlsCard />
            <EngineLogStreamCard :logs="engineLogs" />
          </div>

          <SuperAdminRevenuePanel />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * SuperAdminDashboard — thin shell.
 * Composes the header, system gauges and the two control cards; loading and
 * error states are handled with the shared skeleton / state components.
 * Gauges, logs and the security controls all read the real admin API.
 */
import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';

import AdminTopNav from '../components/admin/AdminTopNav.vue';
import SuperAdminHeader from '../components/admin/SuperAdminHeader.vue';
import SystemStatGrid from '../components/admin/SystemStatGrid.vue';
import SecurityControlsCard from '../components/admin/SecurityControlsCard.vue';
import EngineLogStreamCard from '../components/admin/EngineLogStreamCard.vue';
import SuperAdminRevenuePanel from '../components/admin/SuperAdminRevenuePanel.vue';

import { useSuperAdminDashboard } from '../composables/useSuperAdminDashboard';

/** Page copy (static UI text). */
const SUPER_ADMIN_HEADER = {
  title: 'Super Admin Global System Control',
  subtitle:
    'Monitor global system SLA, rate limiters, auto-moderation, bad actors & Redis cache',
};

const { systemStats, engineLogs, healthLabel, loading, error, reload } = useSuperAdminDashboard();
</script>

<style scoped>
.super-admin-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
  padding-bottom: 60px;
}

.super-controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 900px) {
  .super-controls-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
