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
      <FeedCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :is-admin="isAdmin"
        @like="$emit('like', $event)"
      />

      <!-- Lazy load: sentinel + status footer -->
      <div ref="loadSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
      <p v-if="loadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
      <button
        v-else-if="loadMoreError"
        type="button"
        class="feed-load-retry"
        @click="$emit('loadMore')"
      >
        Coba lagi memuat
      </button>
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
import { ref } from 'vue';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';

const TABS = [
  { key: 'forYou', label: 'For You' },
  { key: 'mengikuti', label: 'Mengikuti' },
];

const props = defineProps({
  posts: { type: Array, default: () => [] },
  followedHandles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
  modelValue: { type: String, default: 'forYou' },
  /** Admin context (base dashboard): pemegang base boleh melihat status fess. */
  isAdmin: { type: Boolean, default: false },
  /** Lazy load state for the active timeline. */
  hasMore: { type: Boolean, default: false },
  loadingMore: { type: Boolean, default: false },
  loadMoreError: { type: [Error, Object, String], default: null },
});

const emit = defineEmits(['update:modelValue', 'like', 'findMore', 'retry', 'loadMore']);

/** Infinite scroll: load the next page when the footer sentinel appears. */
const loadSentinel = ref(null);
useInfiniteScroll(loadSentinel, {
  onLoad: () => emit('loadMore'),
  canLoad: () =>
    props.hasMore && !props.loading && !props.loadingMore && !props.loadMoreError,
  deps: () => [props.posts.length, props.hasMore, props.loadingMore],
});
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

/* Lazy-load footer */
.feed-load-sentinel {
  height: 1px;
  width: 100%;
}

.feed-load-hint {
  text-align: center;
  font-size: 12.5px;
  color: var(--shell-text-muted);
  padding: 10px 0 4px;
  margin: 0;
}

.feed-load-retry {
  display: block;
  margin: 8px auto 0;
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  border-radius: 999px;
  padding: 7px 16px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.feed-load-retry:hover {
  color: var(--shell-text);
  border-color: var(--shell-border-strong);
}
</style>
