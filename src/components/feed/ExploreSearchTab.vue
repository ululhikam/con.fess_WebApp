<template>
  <section class="view-stage" aria-labelledby="search-title">
    <h1 id="search-title" class="stage-title mb-4 text-center">Search</h1>

    <div class="search-input-container mb-4">
      <span class="search-input-icon"><Search :size="16" /></span>
      <input
        :value="query"
        type="search"
        class="search-input-field"
        placeholder="Cari base atau menfess..."
        aria-label="Cari base"
        @input="$emit('update:query', $event.target.value)"
      />
    </div>

    <p class="search-sub-label mb-3 text-center">Temukan base yang kamu suka</p>

    <!-- Segmented: Base | Menfess -->
    <div class="segmented-tabs-container mb-4" role="tablist" aria-label="Jenis hasil pencarian">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="mode === tab.key"
        :class="['segmented-btn', { active: mode === tab.key }]"
        @click="$emit('update:mode', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Category pills -->
    <div class="sub-pills-row mb-6 justify-center flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        :class="['sub-pill-btn', { active: category === cat }]"
        @click="$emit('update:category', cat)"
      >
        {{ cat }}
      </button>
    </div>

    <h3 class="section-title-md mb-4">Base For You</h3>

    <ContentSkeleton v-if="loading" type="list" :count="4" label="Mencari base…" />

    <AppStateView
      v-else-if="!bases.length"
      variant="empty"
      title="Tidak ada base yang cocok"
      :description="`Tidak ada hasil untuk “${query}”. Coba kata kunci lain.`"
      action-label="Bersihkan pencarian"
      @action="$emit('update:query', '')"
    />

    <div v-else class="explore-base-list flex flex-col gap-3">
      <article v-for="base in bases" :key="base.handle" class="centered-base-card">
        <div class="eb-avatar-box" :style="{ background: base.color }">
          <span>{{ base.initial }}</span>
        </div>
        <div class="eb-meta-info">
          <div class="eb-name-text">{{ base.name }}</div>
          <div class="eb-handle-text">{{ base.handle }}</div>
        </div>
        <button
          type="button"
          :class="['btn-follow-outline', { following: isFollowing(base.handle) }]"
          :aria-pressed="isFollowing(base.handle)"
          @click="$emit('toggleFollow', base.handle)"
        >
          {{ isFollowing(base.handle) ? 'Diikuti' : 'Ikuti' }}
        </button>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * ExploreSearchTab — discovery screen (search + category filter + follow).
 */
import { Search } from 'lucide-vue-next';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

const TABS = [
  { key: 'base', label: 'Base' },
  { key: 'menfess', label: 'Menfess' },
];

defineProps({
  bases: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  query: { type: String, default: '' },
  category: { type: String, default: 'Semua' },
  mode: { type: String, default: 'base' },
  loading: { type: Boolean, default: false },
  isFollowing: { type: Function, default: () => () => false },
});

defineEmits(['update:query', 'update:category', 'update:mode', 'toggleFollow']);
</script>

<style scoped>
.stage-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--shell-text);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: var(--shell-text-muted);
  pointer-events: none;
}

.search-input-field {
  width: 100%;
  background: var(--shell-card);
  border: 1px solid var(--shell-border-strong);
  color: var(--shell-text);
  font-family: inherit;
  border-radius: 16px;
  padding: 13px 16px 13px 44px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.search-input-field:focus {
  border-color: var(--shell-active);
}
.search-input-field::placeholder {
  color: var(--shell-text-muted);
}

.search-sub-label {
  font-size: 12.5px;
  color: var(--shell-text-muted);
  font-weight: 600;
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

.sub-pills-row {
  display: flex;
  gap: 8px;
}

.sub-pill-btn {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  font-family: inherit;
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.sub-pill-btn.active {
  background: var(--brand-blue);
  border-color: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.section-title-md {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.centered-base-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.eb-avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--text-on-accent);
  font-weight: 900;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eb-name-text {
  font-weight: 800;
  font-size: 14px;
  color: var(--shell-text);
}
.eb-handle-text {
  font-size: 12px;
  color: var(--shell-text-muted);
}

.btn-follow-outline {
  margin-left: auto;
  background: transparent;
  border: 1.5px solid var(--shell-sub-accent);
  color: var(--sub-accent-text);
  font-family: inherit;
  padding: 6px 18px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 12.5px;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.btn-follow-outline.following {
  background: var(--shell-chip);
  border-color: transparent;
  color: var(--shell-text-muted);
}
</style>
