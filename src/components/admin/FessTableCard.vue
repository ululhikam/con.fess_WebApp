<template>
  <AdminCard title="Daftar Konten Confession Terbit">
    <template #actions>
      <AdminTextField
        v-model="contentSearch"
        label="Cari konten ID atau teks"
        placeholder="Cari konten ID atau teks..."
        hidden-label
        inline
      />
    </template>

    <ul class="fess-list flex flex-col gap-3" aria-label="Daftar confession terbit">
      <li
        v-for="fess in fesses"
        :key="fess.id"
        class="fess-row p-4 rounded-xl border flex justify-between items-center flex-wrap gap-3"
      >
        <div class="flex-1">
          <div class="fess-meta text-xs font-bold">
            IDPes: #{{ fess.id }} • {{ fess.timestamp }}
          </div>
          <p class="fess-body text-xs leading-relaxed">{{ fess.content }}</p>
        </div>

        <div class="flex gap-2">
          <AdminButton variant="export" @click="exportCanvas(fess)">Canvas Card</AdminButton>
          <AdminButton variant="reject" @click="hide(fess.id)">Sembunyikan</AdminButton>
        </div>
      </li>
    </ul>
  </AdminCard>
</template>

<script setup>
/**
 * FessTableCard — published confession list with search + quick actions.
 * Store access is wrapped by useFessModeration().
 */
import { ref } from 'vue';
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';
import AdminTextField from './AdminTextField.vue';
import { useFessModeration } from '../../composables/useAdminDashboard';

const contentSearch = ref('');

const { fesses, hide, exportCanvas } = useFessModeration();
</script>

<style scoped>
.fess-row {
  background: var(--bg-surface-2);
}

.fess-meta {
  color: var(--brand-blue);
  margin-bottom: 4px;
}
</style>
