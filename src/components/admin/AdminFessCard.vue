<template>
  <div class="admin-fess-card-wrapper">
    <FessCard v-bind="$props" :is-admin="true" v-on="$attrs" />
    <button
      v-if="isAdmin"
      type="button"
      class="btn-view-reports"
      title="Lihat dan kelola laporan fess ini"
      aria-label="Lihat dan kelola laporan fess ini"
      @click="$emit('view-reports', post.id)"
    >
      <Flag :size="13" />
      <span>Laporan</span>
    </button>
  </div>
</template>

<script setup>
/**
 * AdminFessCard.vue — Aliased wrapper to unified FessCard component.
 * Automatically enables admin moderation actions (Setujui / Tolak).
 * Tambahan: tindakan "Lihat Laporan" untuk mengelola laporan fess.
 */
import FessCard from '../common/FessCard.vue';
import { Flag } from 'lucide-vue-next';

defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['view-reports']);
</script>

<style scoped>
.admin-fess-card-wrapper {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}

.btn-view-reports {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid var(--shell-border);
  border-radius: 8px;
  background: var(--shell-bg);
  color: var(--shell-text);
  cursor: pointer;
}

.btn-view-reports:hover {
  border-color: var(--shell-text-muted);
  background: var(--shell-chip);
}
</style>
