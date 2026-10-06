<template>
  <div class="super-admin-page">
    <AdminTopNav active="super-admin" sticky />

    <main class="container py-8">
      <div class="flex flex-col gap-6">
        <SuperAdminHeader
          :title="SUPER_ADMIN_HEADER.title"
          :subtitle="SUPER_ADMIN_HEADER.subtitle"
          :health="SUPER_ADMIN_HEADER.health"
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
          <SystemStatGrid />

          <div class="super-controls-grid">
            <SecurityControlsCard />
            <EngineLogStreamCard :logs="ENGINE_LOGS" />
          </div>
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
 */
import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';

import AdminTopNav from '../components/admin/AdminTopNav.vue';
import SuperAdminHeader from '../components/admin/SuperAdminHeader.vue';
import SystemStatGrid from '../components/admin/SystemStatGrid.vue';
import SecurityControlsCard from '../components/admin/SecurityControlsCard.vue';
import EngineLogStreamCard from '../components/admin/EngineLogStreamCard.vue';

import { useAsyncData } from '../composables/useAsyncData';
import { ENGINE_LOGS, SUPER_ADMIN_HEADER } from '../data/adminData';

/* ---------- initial load (drives the skeleton) ---------- */
const { loading, error, reload } = useAsyncData(async () => true, { delay: 600 });
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
