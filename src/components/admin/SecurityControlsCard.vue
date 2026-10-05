<template>
  <AdminCard title="Global Security & Rate Limiting" :icon="Zap">
    <ul class="flex flex-col gap-4" aria-label="Pengaturan keamanan global">
      <li
        v-for="row in securityRows"
        :key="row.id"
        class="control-row p-3 flex justify-between items-center gap-3"
      >
        <div>
          <div class="control-title text-xs font-bold">{{ row.title }}</div>
          <div class="text-xs text-muted">{{ row.desc }}</div>
        </div>

        <AdminTextField
          v-if="row.kind === 'number'"
          v-model="row.value"
          :label="row.title"
          type="number"
          :min="row.min"
          :max="row.max"
          hidden-label
          inline
          compact
        />

        <button
          v-else
          type="button"
          role="switch"
          class="switch-pill"
          :aria-checked="row.on"
          :aria-label="row.title"
          @click="toggleSecurityRow(row.id)"
        >
          {{ row.on ? row.onLabel : row.offLabel }}
        </button>
      </li>
    </ul>
  </AdminCard>
</template>

<script setup>
/**
 * SecurityControlsCard — rate limit + moderation switches.
 * Switch state is owned by useSuperAdminDashboard() and exposed with
 * role="switch" / aria-checked for assistive tech.
 */
import { Zap } from 'lucide-vue-next';
import AdminCard from './AdminCard.vue';
import AdminTextField from './AdminTextField.vue';
import { useSuperAdminDashboard } from '../../composables/useSuperAdminDashboard';

const { securityRows, toggleSecurityRow } = useSuperAdminDashboard();
</script>

<style scoped>
.control-row {
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.control-title {
  color: var(--text-main);
  margin-bottom: 2px;
}

.switch-pill {
  box-sizing: border-box;
  min-width: 72px;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  cursor: pointer;
  background: rgba(22, 163, 74, 0.15);
  color: var(--success-text);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.switch-pill[aria-checked='false'] {
  background: var(--bg-inset);
  border-color: var(--border-subtle);
  color: var(--text-muted);
}
</style>
