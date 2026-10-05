<template>
  <AdminCard title="Koneksi API & Platform Cross-Post">
    <ul class="conn-list flex flex-col gap-3" aria-label="Koneksi API dan platform cross-post">
      <li
        v-for="connection in connections"
        :key="connection.id"
        class="conn-row p-4 rounded-xl border flex justify-between items-center gap-3"
      >
        <div>
          <div class="text-sm font-bold">{{ connection.name }}</div>
          <div class="text-xs text-muted">Status: {{ connection.status }}</div>
        </div>
        <AdminStatusChip status="connected" label="CONNECTED" />
      </li>
    </ul>
  </AdminCard>
</template>

<script setup>
/**
 * ApiConnectionsCard — cross-posting integrations and their link status.
 */
import AdminCard from './AdminCard.vue';
import AdminStatusChip from './AdminStatusChip.vue';

defineProps({
  connections: {
    type: Array,
    default: () => [],
    // each: { id, name, status }
  },
});
</script>
