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
          <div class="fess-meta text-xs font-bold flex items-center gap-2 flex-wrap">
            <span>IDPes: #{{ fess.id }} • {{ fess.timestamp }}</span>
            <span
              v-if="fess.igStatus && fess.igStatus !== 'idle'"
              class="ig-admin-chip"
              :class="`ig-admin-chip--${fess.igStatus}`"
            >
              IG:
              {{
                fess.igStatus === 'published'
                  ? 'terbit'
                  : fess.igStatus === 'failed'
                    ? 'gagal'
                    : fess.igStatus === 'pending'
                      ? 'menunggu video'
                      : 'proses'
              }}
            </span>
          </div>
          <p class="fess-body text-xs leading-relaxed">{{ fess.content }}</p>
          <p
            v-if="fess.igStatus === 'failed' && fess.igError && fess.canManageInstagram === true"
            class="ig-admin-error"
          >
            {{ fess.igError }}
          </p>
        </div>

        <div class="flex gap-2 flex-wrap">
          <AdminButton variant="export" @click="exportCanvas(fess)">Canvas Card</AdminButton>
          <AdminButton
            v-if="
              fess.canManageInstagram === true && fess.igStatus === 'failed' && !fess.postedToIg
            "
            variant="export"
            @click="retryInstagram(fess)"
          >
            Retry IG
          </AdminButton>
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

const { fesses, hide, exportCanvas, retryInstagram } = useFessModeration({ status: 'published' });
</script>

<style scoped>
.fess-row {
  background: var(--bg-surface-2);
}

.fess-meta {
  color: var(--brand-blue);
  margin-bottom: 4px;
}

.ig-admin-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  background: var(--bg-surface-3);
  color: var(--text-muted);
}

.ig-admin-chip--published {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.ig-admin-chip--failed {
  background: rgba(239, 68, 68, 0.14);
  color: #ef4444;
}

.ig-admin-chip--processing,
.ig-admin-chip--pending {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}

.ig-admin-error {
  margin-top: 4px;
  font-size: 10.5px;
  line-height: 1.45;
  color: #ef4444;
  overflow-wrap: anywhere;
}
</style>
