<template>
  <section class="view-stage" aria-labelledby="activity-title">
    <h1 id="activity-title" class="stage-title mb-4 text-center">Aktivitas</h1>

    <div class="segmented-tabs-container mb-8" role="tablist" aria-label="Jenis aktivitas">
      <button
        v-for="filter in filters"
        :key="filter.key"
        type="button"
        role="tab"
        :aria-selected="modelValue === filter.key"
        :class="['segmented-btn', { active: modelValue === filter.key }]"
        @click="$emit('update:modelValue', filter.key)"
      >
        {{ filter.label }}
      </button>
    </div>

    <ContentSkeleton v-if="loading" type="list" :count="3" label="Memuat aktivitas…" />

    <AppStateView
      v-else-if="error"
      variant="error"
      title="Aktivitas gagal dimuat"
      action-label="Coba lagi"
      @action="$emit('retry')"
    />

    <div v-else class="empty-aktivitas-center">
      <Inbox class="empty-icon" :size="34" :stroke-width="1.5" aria-hidden="true" />
      <p class="empty-main-text">Belum ada aktivitas.</p>
      <p class="empty-sub-text">Hanya aktivitas akunmu yang tampil di sini.</p>
    </div>
  </section>
</template>

<script setup>
/**
 * ActivityTab — notifications / activity feed.
 * Ships with an explicit empty state rather than a blank region.
 */
import { Inbox } from 'lucide-vue-next';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

defineProps({
  filters: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
  modelValue: { type: String, default: 'semua' },
});

defineEmits(['update:modelValue', 'retry']);
</script>

<style scoped>
.stage-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--shell-text);
}

.segmented-tabs-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: var(--shell-card);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--shell-border);
}

.segmented-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  padding: 9px;
  font-weight: 800;
  font-size: 13.5px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.segmented-btn.active {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
}

.empty-aktivitas-center {
  background: var(--shell-card);
  border-radius: 24px;
  border: 1px dashed var(--shell-border-strong);
  padding: 70px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: var(--shell-text-muted);
  margin-bottom: 12px;
}
.empty-main-text {
  font-size: 15.5px;
  font-weight: 800;
  margin: 0 0 6px;
  color: var(--shell-text);
}
.empty-sub-text {
  font-size: 12.5px;
  color: var(--shell-text-dim);
  margin: 0;
}
</style>
