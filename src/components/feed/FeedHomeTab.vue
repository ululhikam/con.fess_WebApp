<template>
  <section class="view-stage" aria-labelledby="feed-title">
    <div class="stage-header-row">
      <h1 id="feed-title" class="stage-title">Home</h1>

      <div class="feed-sub-tabs" role="tablist" aria-label="Filter timeline">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="modelValue === tab.key"
          :class="['sub-tab-btn', { active: modelValue === tab.key }]"
          @click="$emit('update:modelValue', tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Bases yang diikuti -->
    <div class="followed-base-bar mb-4">
      <span class="fbb-label">Base diikuti:</span>
      <div class="fbb-pills flex gap-2 overflow-x-auto no-scrollbar">
        <span v-for="handle in followedHandles" :key="handle" class="fbb-chip">
          {{ handle.replace('@', '').toUpperCase() }}
        </span>
        <button type="button" class="fbb-chip active" @click="$emit('findMore')">
          + Cari base lain
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="loading" class="flex flex-col gap-3 sm:gap-4">
      <ContentSkeleton type="feed-card" :count="3" label="Memuat feed…" />
    </div>

    <AppStateView
      v-else-if="error"
      variant="error"
      title="Feed gagal dimuat"
      description="Terjadi kesalahan saat mengambil confession. Coba muat ulang."
      action-label="Coba lagi"
      @action="$emit('retry')"
    />

    <AppStateView
      v-else-if="!posts.length"
      variant="empty"
      title="Belum ada confession"
      description="Jadilah yang pertama mengirim menfess ke base yang kamu ikuti."
    />

    <div v-else class="flex flex-col gap-3 sm:gap-4">
      <FeedCard v-for="post in posts" :key="post.id" :post="post" @like="$emit('like', $event)" />
    </div>
  </section>
</template>

<script setup>
/**
 * FeedHomeTab — timeline screen.
 * Pure presentation: receives posts + loading state, emits user intent.
 */
import FeedCard from './FeedCard.vue';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

const TABS = [
  { key: 'forYou', label: 'For You' },
  { key: 'mengikuti', label: 'Mengikuti' },
];

defineProps({
  posts: { type: Array, default: () => [] },
  followedHandles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
  modelValue: { type: String, default: 'forYou' },
});

defineEmits(['update:modelValue', 'like', 'findMore', 'retry']);
</script>

<style scoped>
.stage-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--shell-border);
  padding-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.stage-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--shell-text);
}

.feed-sub-tabs {
  display: flex;
  gap: 8px;
}

.sub-tab-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sub-tab-btn:hover {
  color: var(--shell-text);
}
.sub-tab-btn.active {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
}

.followed-base-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  padding: 10px 14px;
  border-radius: 16px;
}

.fbb-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
  white-space: nowrap;
}

.fbb-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.fbb-chip {
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  background: var(--shell-chip);
  padding: 4px 12px;
  border-radius: 99px;
  color: var(--shell-text);
  white-space: nowrap;
}

button.fbb-chip {
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.fbb-chip.active {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}
</style>
