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

    <!-- Base Mode Content -->
    <template v-if="mode === 'base'">
      <h3 class="section-title-md mb-4">{{ baseSectionTitle }}</h3>

      <ContentSkeleton
        v-if="baseIsLoading && !visibleBases.length"
        type="list"
        :count="4"
        label="Mencari base…"
      />

      <AppStateView
        v-else-if="baseError && !visibleBases.length"
        variant="error"
        title="Base gagal dimuat"
        description="Terjadi kesalahan saat mencari base. Coba muat ulang."
        action-label="Coba lagi"
        @action="fetchBaseSearch"
      />

      <AppStateView
        v-else-if="!visibleBases.length"
        variant="empty"
        title="Tidak ada base yang cocok"
        :description="emptyBaseDescription"
        action-label="Bersihkan pencarian"
        @action="$emit('update:query', '')"
      />

      <div v-else class="explore-base-list flex flex-col gap-3">
        <article v-for="base in visibleBases" :key="base.handle" class="centered-base-card">
          <div
            class="eb-clickable-col"
            @click="goToBase(base.handle)"
            title="Lihat profil base"
          >
            <div class="eb-avatar-box" :style="{ background: base.color }">
              <span>{{ base.initial }}</span>
            </div>
            <div class="eb-meta-info">
              <div class="eb-name-text">{{ base.name }}</div>
              <div class="eb-handle-text">{{ base.handle }}</div>
            </div>
          </div>
          <button
            type="button"
            :class="['btn-follow-outline', { following: isFollowing(base.handle) }]"
            :aria-pressed="isFollowing(base.handle)"
            @click.stop="$emit('toggleFollow', base.handle)"
          >
            {{ isFollowing(base.handle) ? 'Diikuti' : 'Ikuti' }}
          </button>
        </article>

        <!-- Lazy load: sentinel + status footer -->
        <div ref="baseSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
        <p v-if="baseLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
        <button
          v-else-if="baseLoadMoreError"
          type="button"
          class="feed-load-retry"
          @click="loadMoreBases"
        >
          Coba lagi memuat
        </button>
      </div>
    </template>

    <!-- Menfess Mode Content -->
    <template v-else-if="mode === 'menfess'">
      <h3 class="section-title-md mb-4">Menfess Terkait &amp; Populer</h3>

      <ContentSkeleton
        v-if="fessLoading && !visibleMenfess.length"
        type="list"
        :count="3"
        label="Mencari menfess…"
      />

      <AppStateView
        v-else-if="fessError && !visibleMenfess.length"
        variant="error"
        title="Menfess gagal dimuat"
        description="Terjadi kesalahan saat mencari menfess. Coba muat ulang."
        action-label="Coba lagi"
        @action="fetchMenfess"
      />

      <AppStateView
        v-else-if="!visibleMenfess.length"
        variant="empty"
        title="Tidak ada menfess yang cocok"
        :description="emptyMenfessDescription"
        action-label="Bersihkan pencarian"
        @action="$emit('update:query', '')"
      />

      <div v-else class="explore-menfess-stream flex flex-col gap-4">
        <FessCard
          v-for="post in visibleMenfess"
          :key="post.id"
          :post="post"
          :is-admin="false"
          @report="handleMenfessReport"
        />

        <!-- Lazy load: sentinel + status footer -->
        <div ref="fessSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
        <p v-if="fessLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
        <button
          v-else-if="fessLoadMoreError"
          type="button"
          class="feed-load-retry"
          @click="loadMoreMenfess"
        >
          Coba lagi memuat
        </button>
      </div>
    </template>
  </section>
</template>

<script setup>
/**
 * ExploreSearchTab — discovery screen (search + category filter + follow).
 * Supports both 'base' and 'menfess' exploration modes.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from 'lucide-vue-next';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';
import FessCard from '../common/FessCard.vue';
import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { mapBase } from '../../composables/useBases';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { mapFessToPost } from '../../utils/fessMapper';

const router = useRouter();

function goToBase(handle) {
  if (!handle) return;
  const clean = handle.replace(/^@/, '');
  router.push(`/base/${clean}`);
}

const TABS = [
  { key: 'base', label: 'Base' },
  { key: 'menfess', label: 'Menfess' },
];

const props = defineProps({
  bases: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  query: { type: String, default: '' },
  category: { type: String, default: 'Semua' },
  mode: { type: String, default: 'base' },
  loading: { type: Boolean, default: false },
  isFollowing: { type: Function, default: () => () => false },
});

defineEmits([
  'update:query',
  'update:category',
  'update:mode',
  'toggleFollow',
  'report',
]);

/* ---------- Menfess search (GET /fesses, debounced + lazy load) ---------- */
const MENFESS_DEBOUNCE_MS = 300;
const MENFESS_PAGE_SIZE = 20;

const fessPosts = ref([]);
const fessLoading = ref(false);
const fessLoadingMore = ref(false);
const fessLoadMoreError = ref(null);
const fessError = ref(null);
const fessTotal = ref(0);
const fessSentinel = ref(null);

/** Menfess yang dilaporkan user dalam sesi pencarian ini — disembunyikan dari daftar. */
const reportedMenfessIds = ref(new Set());

function handleMenfessReport(postId) {
  reportedMenfessIds.value.add(String(postId));
  toast.success('Fess disembunyikan dari hasil pencarian.', { duration: 2500 });
  emit('report', { postId: String(postId) });
}

let debounceTimer = null;
let requestSeq = 0;
let lastFetchedQuery = null;
let fessPage = 1;

const fessHasMore = computed(() => fessPosts.value.length < fessTotal.value);

/** Fetch fess search results from the backend (query + newest first). */
async function fetchMenfess() {
  clearTimeout(debounceTimer);
  debounceTimer = null;

  const seq = ++requestSeq;
  const q = props.query.trim();
  lastFetchedQuery = q;

  fessLoading.value = true;
  fessError.value = null;
  fessLoadMoreError.value = null;
  try {
    const res = await api.getFesses({
      query: q || undefined,
      limit: MENFESS_PAGE_SIZE,
      page: 1,
      sort: 'newest',
    });
    if (seq !== requestSeq) return;
    fessPosts.value = (res?.data || []).map(mapFessToPost);
    fessTotal.value = res?.total ?? fessPosts.value.length;
    fessPage = 1;
  } catch (e) {
    if (seq !== requestSeq) return;
    fessError.value = e;
    fessPosts.value = [];
  } finally {
    if (seq === requestSeq) fessLoading.value = false;
  }
}

/** Lazy load halaman berikutnya hasil pencarian menfess. */
async function loadMoreMenfess() {
  if (fessLoading.value || fessLoadingMore.value || !fessHasMore.value) return;
  fessLoadingMore.value = true;
  fessLoadMoreError.value = null;
  try {
    const nextPage = fessPage + 1;
    const res = await api.getFesses({
      query: props.query.trim() || undefined,
      limit: MENFESS_PAGE_SIZE,
      page: nextPage,
      sort: 'newest',
    });
    const seen = new Set(fessPosts.value.map((p) => String(p.id)));
    const extra = (res?.data || [])
      .map(mapFessToPost)
      .filter((p) => p && !seen.has(String(p.id)));
    fessPosts.value = [...fessPosts.value, ...extra];
    fessTotal.value = res?.total ?? fessTotal.value;
    fessPage = nextPage;
  } catch (e) {
    fessLoadMoreError.value = e;
  } finally {
    fessLoadingMore.value = false;
  }
}

useInfiniteScroll(fessSentinel, {
  onLoad: loadMoreMenfess,
  canLoad: () =>
    props.mode === 'menfess' &&
    fessHasMore.value &&
    !fessLoading.value &&
    !fessLoadingMore.value &&
    !fessLoadMoreError.value,
  deps: () => [fessPosts.value.length, fessHasMore.value, props.mode],
});

/** Debounce so we only query the API once the user pauses typing. */
function scheduleMenfessFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchMenfess, MENFESS_DEBOUNCE_MS);
}

watch(
  () => props.query,
  () => {
    if (props.mode === 'menfess') scheduleMenfessFetch();
  },
);

watch(
  () => props.mode,
  (mode) => {
    if (mode !== 'menfess') return;
    const q = props.query.trim();
    if (lastFetchedQuery !== q || (!fessPosts.value.length && !fessError.value)) {
      scheduleMenfessFetch();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
  clearTimeout(baseDebounceTimer);
});

/** Category pills narrow the result list client-side (server has no pill taxonomy). */
const visibleMenfess = computed(() => {
  const list = fessPosts.value.filter(
    (p) => !reportedMenfessIds.value.has(String(p.id)),
  );
  const cat = props.category;
  if (!cat || cat === 'Semua') return list;
  const needle = cat.toLowerCase();
  return fessPosts.value.filter(
    (m) =>
      (m.tag && m.tag.toLowerCase() === needle) ||
      (m.content && m.content.toLowerCase().includes(needle)),
  );
});

const emptyMenfessDescription = computed(() =>
  props.query.trim()
    ? `Tidak ada menfess untuk “${props.query}”. Coba kata kunci topik atau base lain.`
    : 'Belum ada menfess yang dapat ditampilkan saat ini.',
);

/* ---------- Base search (GET /bases, debounced, server-side + lazy load) ---------- */
const BASE_DEBOUNCE_MS = 300;
const BASE_PAGE_SIZE = 20;

const baseResults = ref([]);
const baseLoading = ref(false);
const baseLoadingMore = ref(false);
const baseLoadMoreError = ref(null);
const baseError = ref(null);
const baseLoaded = ref(false);
const baseTotal = ref(0);
const baseSentinel = ref(null);

let baseDebounceTimer = null;
let baseRequestSeq = 0;
let basePage = 1;

const baseHasMore = computed(() => baseResults.value.length < baseTotal.value);

/** Fetch base search results from the backend (search + category + newest). */
async function fetchBaseSearch() {
  clearTimeout(baseDebounceTimer);
  baseDebounceTimer = null;

  const seq = ++baseRequestSeq;
  const q = props.query.trim();
  const cat = props.category && props.category !== 'Semua' ? props.category : undefined;

  baseLoading.value = true;
  baseError.value = null;
  baseLoadMoreError.value = null;
  try {
    const res = await api.getBases({
      search: q || undefined,
      category: cat,
      limit: BASE_PAGE_SIZE,
      page: 1,
    });
    if (seq !== baseRequestSeq) return;
    baseResults.value = (res?.data || []).map(mapBase).filter(Boolean);
    baseTotal.value = res?.total ?? baseResults.value.length;
    basePage = 1;
    baseLoaded.value = true;
  } catch (e) {
    if (seq !== baseRequestSeq) return;
    baseError.value = e;
    baseResults.value = [];
    baseLoaded.value = true;
  } finally {
    if (seq === baseRequestSeq) baseLoading.value = false;
  }
}

/** Lazy load halaman berikutnya hasil pencarian base. */
async function loadMoreBases() {
  if (baseLoading.value || baseLoadingMore.value || !baseHasMore.value) return;
  baseLoadingMore.value = true;
  baseLoadMoreError.value = null;
  try {
    const q = props.query.trim();
    const cat = props.category && props.category !== 'Semua' ? props.category : undefined;
    const nextPage = basePage + 1;
    const res = await api.getBases({
      search: q || undefined,
      category: cat,
      limit: BASE_PAGE_SIZE,
      page: nextPage,
    });
    const seen = new Set(baseResults.value.map((b) => b.handle));
    const extra = (res?.data || [])
      .map(mapBase)
      .filter((b) => b && !seen.has(b.handle));
    baseResults.value = [...baseResults.value, ...extra];
    baseTotal.value = res?.total ?? baseTotal.value;
    basePage = nextPage;
  } catch (e) {
    baseLoadMoreError.value = e;
  } finally {
    baseLoadingMore.value = false;
  }
}

useInfiniteScroll(baseSentinel, {
  onLoad: loadMoreBases,
  canLoad: () =>
    props.mode === 'base' &&
    baseLoaded.value &&
    baseHasMore.value &&
    !baseLoading.value &&
    !baseLoadingMore.value &&
    !baseLoadMoreError.value,
  deps: () => [baseResults.value.length, baseHasMore.value, props.mode],
});

/** Debounce so we only query the API once the user pauses typing. */
function scheduleBaseFetch() {
  clearTimeout(baseDebounceTimer);
  baseDebounceTimer = setTimeout(fetchBaseSearch, BASE_DEBOUNCE_MS);
}

watch(
  () => props.query,
  () => {
    if (props.mode === 'base') scheduleBaseFetch();
  },
);

watch(
  () => props.category,
  () => {
    if (props.mode === 'base') scheduleBaseFetch();
  },
);

watch(
  () => props.mode,
  (mode) => {
    if (mode !== 'base') return;
    scheduleBaseFetch();
  },
  { immediate: true },
);

/** Server results once loaded; fall back to the parent directory before that. */
const visibleBases = computed(() => (baseLoaded.value ? baseResults.value : props.bases));
const baseIsLoading = computed(() => (baseLoaded.value ? baseLoading.value : props.loading));

const baseSectionTitle = computed(() =>
  props.query.trim() || (props.category && props.category !== 'Semua')
    ? 'Hasil Pencarian Base'
    : 'Base For You',
);

const emptyBaseDescription = computed(() => {
  if (props.query.trim()) {
    return `Tidak ada base untuk “${props.query}”. Coba kata kunci lain.`;
  }
  if (props.category && props.category !== 'Semua') {
    return `Belum ada base dengan kategori ${props.category}.`;
  }
  return 'Belum ada base yang dapat ditampilkan saat ini.';
});

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
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  padding: 2px 0 6px;
}

.sub-pills-row::-webkit-scrollbar {
  display: none;
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
  flex-shrink: 0;
  white-space: nowrap;
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

.eb-clickable-col {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  margin: -4px;
  transition: opacity 0.15s ease;
}

.eb-clickable-col:hover {
  opacity: 0.88;
}

.eb-clickable-col:hover .eb-name-text {
  color: var(--shell-sub-accent, #60a5fa);
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
