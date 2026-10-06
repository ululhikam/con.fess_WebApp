<template>
  <div class="base-admin-page">
    <AdminTopNav active="base-admin" />

    <main class="container py-6">
      <AdminPageHeader
        v-model="activeTab"
        :tabs="BASE_ADMIN_TABS"
        title="Dasbor Base Admin — @codememfess"
        subtitle="Kelola pesan anonim, moderasi otomatis, platform cross-post & keuangan komunitas"
      >
        <template #actions>
          <AdminButton variant="outline" @click="activeTab = 'profil'"
            >Lihat Profil Base</AdminButton
          >
          <AdminButton variant="lime" @click="showNewBaseModal = true">
            <Plus :size="14" aria-hidden="true" />
            Tambah Base Baru
          </AdminButton>
        </template>
      </AdminPageHeader>

      <!-- Single tab panel: skeleton → error → the active tab's card. -->
      <div
        :id="ADMIN_PANEL_ID"
        class="tab-panel flex flex-col gap-6"
        role="tabpanel"
        :aria-label="activeTabLabel"
      >
        <ContentSkeleton v-if="loading" type="stats" :count="4" label="Memuat dashboard…" />

        <AppStateView
          v-else-if="error"
          variant="error"
          title="Data gagal dimuat"
          description="Terjadi kesalahan saat memuat data dasbor. Silakan coba lagi."
          action-label="Coba lagi"
          @action="reload"
        />

        <template v-else>
          <template v-if="activeTab === 'ringkasan'">
            <StatCardGrid :stats="overviewStats" />
            <PerformanceChartCard :chart="TRAFFIC_CHART" />
          </template>

          <FessTableCard v-else-if="activeTab === 'konten'" />
          <ModerationQueueCard v-else-if="activeTab === 'moderasi'" />
          <CommunityCard v-else-if="activeTab === 'komunitas'" :summary="COMMUNITY_SUMMARY" />
          <FinanceCard v-else-if="activeTab === 'keuangan'" :treasury="TREASURY" />
          <AutoBaseSettingsCard
            v-else-if="activeTab === 'pengaturan'"
            :fields="BASE_SETTINGS_FIELDS"
          />
          <ApiConnectionsCard
            v-else-if="activeTab === 'koneksi'"
            :connections="PLATFORM_CONNECTIONS"
          />
          <PublicProfilePreviewCard v-else-if="activeTab === 'profil'" :profile="PUBLIC_PROFILE" />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * BaseAdminDashboard — thin shell.
 * Owns nothing but composition: nav + header, loading/error states, and the
 * single tab panel built from src/components/admin/*.
 */
import { Plus } from 'lucide-vue-next';

import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';

import AdminTopNav from '../components/admin/AdminTopNav.vue';
import AdminPageHeader from '../components/admin/AdminPageHeader.vue';
import AdminButton from '../components/admin/AdminButton.vue';
import StatCardGrid from '../components/admin/StatCardGrid.vue';
import PerformanceChartCard from '../components/admin/PerformanceChartCard.vue';
import FessTableCard from '../components/admin/FessTableCard.vue';
import ModerationQueueCard from '../components/admin/ModerationQueueCard.vue';
import CommunityCard from '../components/admin/CommunityCard.vue';
import FinanceCard from '../components/admin/FinanceCard.vue';
import AutoBaseSettingsCard from '../components/admin/AutoBaseSettingsCard.vue';
import ApiConnectionsCard from '../components/admin/ApiConnectionsCard.vue';
import PublicProfilePreviewCard from '../components/admin/PublicProfilePreviewCard.vue';

import { useAsyncData } from '../composables/useAsyncData';
import { useAdminDashboard } from '../composables/useAdminDashboard';
import {
  ADMIN_PANEL_ID,
  BASE_ADMIN_TABS,
  BASE_SETTINGS_FIELDS,
  COMMUNITY_SUMMARY,
  PLATFORM_CONNECTIONS,
  PUBLIC_PROFILE,
  TREASURY,
  TRAFFIC_CHART,
} from '../data/adminData';

/* ---------- tab state, live counters, overview stats ---------- */
const { activeTab, activeTabLabel, showNewBaseModal, overviewStats } = useAdminDashboard();

/* ---------- initial load (drives the skeleton) ---------- */
const { loading, error, reload } = useAsyncData(async () => true, { delay: 600 });
</script>

<style scoped>
.base-admin-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
  padding-bottom: 60px;
}
</style>
