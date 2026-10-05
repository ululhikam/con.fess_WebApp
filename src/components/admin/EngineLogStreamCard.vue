<template>
  <AdminCard title="Real-time Engine Logs" :icon="Radio">
    <template #actions>
      <span class="text-xs text-muted font-mono">LIVE SLA</span>
    </template>

    <div class="log-stream p-4 rounded-xl font-mono" role="log" aria-label="Log engine real-time">
      <div v-for="log in logs" :key="log.id" class="log-line" :class="`log-line--${log.tone}`">
        [{{ log.time }}] {{ log.source }}: {{ log.message }}
      </div>
    </div>
  </AdminCard>
</template>

<script setup>
/**
 * EngineLogStreamCard — scrollable console with the latest engine events.
 * Log lines come from src/data/adminData.js; tone picks the accent colour.
 */
import { Radio } from 'lucide-vue-next';
import AdminCard from './AdminCard.vue';

defineProps({
  logs: { type: Array, default: () => [] },
});
</script>

<style scoped>
.log-stream {
  background: var(--bg-inset);
  color: var(--text-main);
  height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-line {
  font-size: 11px;
  line-height: 1.5;
}

.log-line--ok {
  color: var(--success-text);
}
.log-line--info {
  color: var(--brand-blue);
}
.log-line--muted {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .log-stream {
    font-size: 10px;
    word-break: break-all;
  }
}
</style>
