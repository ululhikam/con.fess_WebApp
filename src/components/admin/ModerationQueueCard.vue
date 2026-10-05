<template>
  <AdminCard title="Antrean Moderasi Fess">
    <template #actions>
      <span class="text-xs text-muted">Batas Frekuensi: 5 fess / min</span>
    </template>

    <ul class="mod-queue flex flex-col gap-4" aria-label="Antrean moderasi fess">
      <li
        v-for="fess in fesses"
        :key="fess.id"
        class="mod-item p-4 rounded-xl border flex justify-between items-center flex-wrap gap-4"
      >
        <div class="flex-1">
          <div class="mod-meta flex items-center gap-2 mb-1">
            <span class="mod-handle text-xs font-bold">{{ fess.baseHandle }}</span>
            <span class="text-xs text-muted">ID Anon: #{{ fess.id }} • {{ fess.timestamp }}</span>
            <AdminStatusChip :status="fess.status" />
          </div>
          <p class="mod-body text-sm leading-relaxed">{{ fess.content }}</p>
        </div>

        <div class="flex items-center gap-2">
          <AdminButton
            v-if="fess.status !== 'approved'"
            variant="approve"
            @click="approve(fess.id)"
          >
            Setujui
          </AdminButton>
          <AdminButton v-if="fess.status !== 'rejected'" variant="reject" @click="hide(fess.id)">
            Tolak
          </AdminButton>
          <AdminButton variant="export" @click="exportCanvas(fess)">Export Canvas</AdminButton>
        </div>
      </li>
    </ul>
  </AdminCard>
</template>

<script setup>
/**
 * ModerationQueueCard — pending fess queue with approve / reject / export.
 * Store access is wrapped by useFessModeration().
 */
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';
import AdminStatusChip from './AdminStatusChip.vue';
import { useFessModeration } from '../../composables/useAdminDashboard';

const { fesses, approve, hide, exportCanvas } = useFessModeration();
</script>

<style scoped>
.mod-item {
  background: var(--bg-surface-2);
}

.mod-handle {
  color: var(--brand-blue);
}
</style>
