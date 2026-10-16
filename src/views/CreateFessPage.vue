<template>
  <div class="create-fess-page">
    <!-- Header -->
    <header class="create-header">
      <button type="button" class="btn-back" @click="handleBack" aria-label="Kembali">
        <ChevronLeft :size="24" />
      </button>
      <h1 class="header-title">Buat Fess Baru</h1>
      <div class="header-actions">
        <button
          type="button"
          class="btn-save-draft"
          @click="saveDraft"
          :disabled="savingDraft || !hasContent"
        >
          {{ savingDraft ? 'Menyimpan...' : 'Simpan Draf' }}
        </button>
        <button
          type="button"
          class="btn-publish"
          :class="{ 'btn-publish--uploading': hasUploadingMedia }"
          @click="openPublishConfirm"
          :disabled="publishing"
        >
          <Loader2 v-if="publishing" :size="16" class="spin" />
          <template v-else-if="hasUploadingMedia">
            <Loader2 :size="16" class="spin" />
            <span>Mengunggah…</span>
          </template>
          <span v-else>{{ isScheduled ? 'Jadwalkan' : 'Posting' }}</span>
        </button>
      </div>
    </header>

    <div class="create-content">
      <!-- Main Editor Area -->
      <main class="editor-main">
        <!-- Error Banner -->
        <div v-if="publishError" class="publish-error-banner" role="alert">
          <AlertCircle :size="16" class="flex-shrink-0" />
          <span class="error-msg">{{ publishError }}</span>
          <button type="button" class="btn-dismiss-err" @click="publishError = ''" aria-label="Tutup pesan error">
            <X :size="14" />
          </button>
        </div>

        <!-- Base Selector (Top) — terkunci ke base asal saat ada kutipan -->
        <BaseSelector
          v-model="form.baseHandle"
          :bases="availableBases"
          :disabled="baseLocked"
          @change="onBaseChange"
        />

        <!-- Text Editor -->
        <EditorArea v-model="form.content" :placeholder="getPlaceholder" :max-length="2000" />

        <!-- Quoted Fess Display in Composer -->
        <div v-if="form.quotedFess" class="composer-quoted-card">
          <div class="composer-quoted-head">
            <div class="cq-author">
              <Quote :size="13" class="cq-icon" />
              <span class="cq-handle">{{ form.quotedFess.handle || form.quotedFess.senderHandle }}</span>
              <span class="cq-time">• {{ form.quotedFess.time }}</span>
            </div>
            <button
              type="button"
              class="btn-remove-quote"
              title="Hapus kutipan fess"
              aria-label="Hapus kutipan"
              @click="applyQuotedFess(null)"
            >
              <X :size="14" />
            </button>
          </div>
          <p class="cq-text">{{ form.quotedFess.content }}</p>
        </div>

        <!-- Media Upload Section -->
        <MediaUploader
          v-model="form.media"
          :max-files="4"
          :max-size-mb="50"
          @change="onMediaChange"
        />

        <!-- Bottom Toolbar -->
        <div class="editor-toolbar">
          <ToolbarButton
            :icon="Tag"
            label="Topik"
            :active="!!form.topic"
            @click="showTopicModal = true"
          >
            <span v-if="form.topic" class="toolbar-badge">{{ selectedTopicLabel }}</span>
          </ToolbarButton>

          <ToolbarButton
            :icon="Calendar"
            label="Jadwal"
            :active="!!form.scheduledAt"
            @click="showScheduleModal = true"
          >
            <span v-if="form.scheduledAt" class="toolbar-badge">
              {{ formatScheduleDate(form.scheduledAt) }}
            </span>
          </ToolbarButton>

          <ToolbarButton
            :icon="Music"
            label="Lagu"
            :active="!!form.song"
            @click="showSongModal = true"
          >
            <span v-if="form.song" class="toolbar-badge">{{ form.song.title }}</span>
          </ToolbarButton>

          <ToolbarButton
            :icon="Layout"
            label="Template"
            :active="form.template !== 'default'"
            @click="showTemplateModal = true"
          >
            <span v-if="form.template !== 'default'" class="toolbar-badge">
              {{ getTemplateLabel(form.template) }}
            </span>
          </ToolbarButton>

          <ToolbarButton
            :icon="Quote"
            label="Kutip"
            :active="!!form.quotedFess"
            @click="showQuoteModal = true"
          >
            <span v-if="form.quotedFess" class="toolbar-badge">
              {{ form.quotedFess.handle || '@fess' }}
            </span>
          </ToolbarButton>
        </div>
      </main>

      <!-- Preview Panel (Right Sidebar on Desktop, Bottom on Mobile) -->
      <aside class="preview-panel" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <div>
            <h2 class="preview-title">Pratinjau Kartu</h2>
            <p class="preview-subtitle">{{ activeTemplate.label }} · {{ activeAspect.label }}</p>
          </div>
          <button
            type="button"
            class="btn-export"
            :disabled="!hasContent || exporting"
            :title="hasContent ? 'Simpan kartu sebagai gambar PNG' : 'Tulis fess dulu'"
            @click="exportCard"
          >
            <Loader2 v-if="exporting" :size="15" class="spin" />
            <Download v-else :size="15" />
            <span>{{ exporting ? 'Membuat…' : 'Ekspor PNG' }}</span>
          </button>
        </div>

        <div class="preview-content">
          <PostPreview
            ref="previewRef"
            :content="form.content"
            :media="form.media"
            :base-handle="form.baseHandle"
            :topic="form.topic"
            :song="form.song"
            :template="form.template"
            :author="currentUser"
            :quoted-fess="form.quotedFess"
            :is-preview="true"
            :exporting="exporting"
            reorderable
            @reorder-media="onReorderMedia"
          />
          <p v-if="form.media.length > 1" class="preview-hint">
            <GripVertical :size="13" />
            <span>Geser pegangan di sudut media untuk mengatur urutannya (depan → belakang).</span>
          </p>
          <p v-if="exportError" class="preview-error" role="alert">
            <AlertCircle :size="14" /> {{ exportError }}
          </p>
        </div>

        <div class="preview-stats" v-if="hasContent">
          <div class="stat-item">
            <span class="stat-label">Kata</span>
            <span class="stat-value">{{ wordCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Karakter</span>
            <span class="stat-value">{{ charCount }}/2000</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Est. Baca</span>
            <span class="stat-value">{{ readingTime }} menit</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Modals -->
    <TopicModal v-model:show="showTopicModal" v-model:topic="form.topic" :topics="topics" />
    <ScheduleModal v-model:show="showScheduleModal" v-model:date="form.scheduledAt" />
    <SongModal v-model:show="showSongModal" v-model:song="form.song" />
    <TemplateModal v-model:show="showTemplateModal" v-model:template="form.template" />
    <QuoteModal
      v-model:show="showQuoteModal"
      :model-value="form.quotedFess"
      @update:model-value="applyQuotedFess"
    />

    <!-- Publish Confirmation Modal -->
    <PublishModal
      v-model:show="showPublishModal"
      :form="form"
      :is-scheduled="isScheduled"
      :confirming="publishing"
      @confirm="publishFess"
      @cancel="showPublishModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ChevronLeft,
  Loader2,
  Tag,
  Calendar,
  Music,
  Layout,
  Download,
  AlertCircle,
  Quote,
  X,
  GripVertical,
} from 'lucide-vue-next';
import { toPng } from 'html-to-image';

// Components
import BaseSelector from '../components/compose/BaseSelector.vue';
import EditorArea from '../components/compose/EditorArea.vue';
import MediaUploader from '../components/compose/MediaUploader.vue';
import ToolbarButton from '../components/compose/ToolbarButton.vue';
import PostPreview from '../components/compose/PostPreview.vue';
import TopicModal from '../components/compose/TopicModal.vue';
import ScheduleModal from '../components/compose/ScheduleModal.vue';
import SongModal from '../components/compose/SongModal.vue';
import TemplateModal from '../components/compose/TemplateModal.vue';
import PublishModal from '../components/compose/PublishModal.vue';
import QuoteModal from '../components/compose/QuoteModal.vue';

// Composables & Stores
import { useAuthStore } from '../stores/authStore';
import { useFeedPosts } from '../composables/useFeedPosts';
import { useBases, mapBase } from '../composables/useBases';
import { useTopics } from '../composables/useTopics';
import { useFollowBase } from '../composables/useFollowBase';
import { api } from '../api';
import { validateFessContent, generateClientId } from '../utils/format';
import { mapFessToPost, mapQuotedFess } from '../utils/fessMapper';

// Config
import { ASPECTS, getTemplateByKey, TEMPLATES } from '../config/templates';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { publish } = useFeedPosts();
const { syncFollowing } = useFollowBase();

// Form state
const form = ref({
  baseHandle: '',
  content: '',
  media: [],
  topic: '',
  scheduledAt: null,
  song: null,
  template: 'default',
  quotedFess: null,
});

// UI state
const showTopicModal = ref(false);
const showScheduleModal = ref(false);
const showSongModal = ref(false);
const showTemplateModal = ref(false);
const showQuoteModal = ref(false);
const showPublishModal = ref(false);
const savingDraft = ref(false);
const publishing = ref(false);
const publishError = ref('');

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else if (authStore.user?.role === 'Base Admin') {
    router.push('/base-admin');
  } else {
    router.push('/feed');
  }
}

/* ---------- card export ---------- */
const previewRef = ref(null);
const exporting = ref(false);
const exportError = ref('');

const activeTemplate = computed(() => getTemplateByKey(form.value.template));
const activeAspect = computed(() => ASPECTS[activeTemplate.value.aspect] || ASPECTS.portrait);

/**
 * Rasterise the preview card to a PNG sized for Instagram.
 *
 * html-to-image renders the node at its natural CSS size, so we bump
 * `pixelRatio` to reach the export width and keep `cacheBust` on for any
 * uploaded blob/media URLs.
 */
async function exportCard() {
  const node = previewRef.value?.cardEl;
  if (!node || exporting.value) return;

  exporting.value = true;
  exportError.value = '';
  try {
    // Tunggu DOM memperbarui diri (pegangan geser media disembunyikan) sebelum capture.
    await nextTick();
    const targetWidth = activeAspect.value.exportWidth;
    const naturalWidth = node.getBoundingClientRect().width || node.offsetWidth || targetWidth;
    const pixelRatio = Math.max(1, targetWidth / naturalWidth);

    const dataUrl = await toPng(node, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: undefined,
      style: { transform: 'none', margin: '0' },
    });

    const link = document.createElement('a');
    link.download = `fess-${form.value.template}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export failed:', err);
    exportError.value = 'Gagal membuat gambar. Coba lagi.';
  } finally {
    exporting.value = false;
  }
}
const currentUser = computed(() => authStore.user);

const { bases, ensureLoaded: ensureBasesLoaded, fetchBase } = useBases();
const availableBases = ref([]);

/** Base terkunci selama composer memuat kutipan — fess harus dikirim ke base asal kutipan. */
const baseLocked = computed(() => !!form.value.quotedFess);

/** Normalisasi handle base ("concern_fess" → "@concern_fess"). */
function normalizeBaseHandle(handle) {
  const clean = String(handle || '').trim();
  if (!clean) return '';
  return clean.startsWith('@') ? clean : `@${clean}`;
}

/** Pastikan base asal kutipan ada di daftar selector (fetch sekali bila perlu). */
async function ensureQuotedBaseInList(handle) {
  const target = normalizeBaseHandle(handle);
  if (!target) return;
  if (availableBases.value.some((b) => b.handle === target)) return;

  const fromCache = bases.value.find((b) => b.handle === target);
  if (fromCache) {
    availableBases.value = [...availableBases.value, fromCache];
    return;
  }

  try {
    const fetched = await fetchBase(target);
    if (fetched && !availableBases.value.some((b) => b.handle === fetched.handle)) {
      availableBases.value = [...availableBases.value, fetched];
    }
  } catch {
    // Base tetap terisi lewat handle walau detailnya gagal dimuat.
  }
}

/**
 * Terapkan kutipan: base tujuan terkunci ke base asal fess yang dikutip
 * (kebijakan dipilih user — fess kutipan hanya boleh dikirim ke base itu).
 */
function applyQuotedFess(quote) {
  form.value.quotedFess = quote || null;
  if (!quote) return;
  const handle = normalizeBaseHandle(quote.handle || quote.senderHandle);
  if (handle) {
    form.value.baseHandle = handle;
    ensureQuotedBaseInList(handle);
  }
}

/** Load the bases available to post into: followed bases, else the directory. */
async function loadAvailableBases() {
  try {
    if (authStore.isAuthenticated) {
      const res = await api.getMyFollowing({ limit: 100 });
      const list = (res?.data ?? []).map(mapBase);
      if (list.length) {
        availableBases.value = list;
        if (baseLocked.value) {
          await ensureQuotedBaseInList(form.value.quotedFess?.handle || form.value.quotedFess?.senderHandle);
        }
        return;
      }
    }
  } catch {
    // fall through to the public directory
  }
  try {
    await ensureBasesLoaded();
  } catch {
    // directory unavailable — the selector shows its own empty state
  }
  availableBases.value = bases.value;
  if (baseLocked.value) {
    await ensureQuotedBaseInList(form.value.quotedFess?.handle || form.value.quotedFess?.senderHandle);
  }
}

const { topics, ensureLoaded: ensureTopicsLoaded, getTopicById } = useTopics();

/** Badge toolbar "Topik" menampilkan label topik asli, bukan id mentah. */
const selectedTopicLabel = computed(() => {
  const id = form.value.topic;
  if (!id) return '';
  return getTopicById(id)?.label || id;
});

const hasContent = computed(
  () =>
    form.value.content.trim().length > 0 ||
    form.value.media.length > 0 ||
    !!form.value.quotedFess,
);

const hasUploadingMedia = computed(() =>
  form.value.media.some((m) => m.uploading || !m.url || String(m.url).startsWith('blob:'))
);

const canPublish = computed(() => {
  const validation = validateFessContent(form.value.content);
  return (
    (validation.valid || form.value.media.length > 0 || !!form.value.quotedFess) &&
    form.value.baseHandle &&
    !hasUploadingMedia.value
  );
});

const isScheduled = computed(() => !!form.value.scheduledAt);

const wordCount = computed(() => {
  return form.value.content.trim() ? form.value.content.trim().split(/\s+/).length : 0;
});

const charCount = computed(() => form.value.content.length);

const readingTime = computed(() => {
  const words = wordCount.value;
  return Math.max(1, Math.ceil(words / 200));
});

const getPlaceholder = computed(() => {
  if (form.value.baseHandle) {
    const base = availableBases.value.find((b) => b.handle === form.value.baseHandle);
    return base ? `Tulis fess untuk ${base.name}...` : 'Tulis fessmu di sini...';
  }
  return 'Pilih base terlebih dahulu, lalu tulis fessmu...';
});

const getTemplateLabel = (key) => {
  return TEMPLATES.find((t) => t.key === key)?.label || key;
};

const formatScheduleDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Actions
function onBaseChange(handle) {
  form.value.baseHandle = handle;
}

function onMediaChange(media) {
  form.value.media = media;
}

/** Terapkan urutan media baru dari pratinjau (geser depan/tengah/belakang). */
function onReorderMedia(orderedIds) {
  const list = form.value.media || [];
  if (!Array.isArray(orderedIds) || orderedIds.length !== list.length) return;
  const byId = new Map(list.map((m) => [m.id, m]));
  const next = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (item) {
      next.push(item);
      byId.delete(id);
    }
  }
  for (const leftover of byId.values()) next.push(leftover);
  const changed = next.some((item, idx) => item !== list[idx]);
  if (changed) form.value.media = next;
}

async function saveDraft() {
  savingDraft.value = true;
  try {
    const draft = {
      ...form.value,
      id: generateClientId('draft'),
      savedAt: Date.now(),
      isDraft: true,
    };
    localStorage.setItem('fess_draft', JSON.stringify(draft));
  } finally {
    savingDraft.value = false;
  }
}

function openPublishConfirm() {
  if (publishing.value) return;

  if (hasUploadingMedia.value) {
    publishError.value = 'Foto/video masih dalam proses unggah. Mohon tunggu hingga lingkaran animasi selesai.';
    return;
  }
  if (!form.value.baseHandle) {
    publishError.value = 'Silakan pilih base tujuan confession terlebih dahulu.';
    return;
  }
  if (!hasContent.value) {
    publishError.value = 'Silakan tulis isi confession atau lampirkan foto/video.';
    return;
  }

  publishError.value = '';
  showPublishModal.value = true;
}

async function publishFess() {
  // Anti dobel-kirim: kunci di sini juga karena klik cepat berturut-turut
  // bisa terjadi sebelum tombol sempat ter-disable.
  if (publishing.value) return;
  if (!canPublish.value) return;

  publishError.value = '';
  publishing.value = true;
  try {
    const hasUnfinishedUpload = form.value.media.some(
      (m) => m.uploading || !m.url || String(m.url).startsWith('blob:')
    );
    if (hasUnfinishedUpload) {
      publishError.value = 'Mohon tunggu beberapa detik hingga upload media selesai.';
      publishing.value = false;
      return;
    }

    const payload = {
      base_handle: form.value.baseHandle,
      content: form.value.content.trim(),
      media: form.value.media.map((m) => ({
        type: m.type,
        url: m.url,
        thumbnail: m.thumbnail || null,
        duration: m.duration || null,
        caption: m.caption || null,
      })),
      topic: form.value.topic || null,
      scheduled_at: form.value.scheduledAt || null,
      song: form.value.song
        ? {
            id: form.value.song.id,
            title: form.value.song.title,
            artist: form.value.song.artist,
            cover: form.value.song.cover,
            preview_url: form.value.song.previewUrl,
          }
        : null,
      template: form.value.template,
      quoted_fess: form.value.quotedFess ? mapQuotedFess(form.value.quotedFess) : null,
    };

    // Publish through the API — the shared feed store picks up the response.
    const createdFess = await publish(payload);

    // Kirim fess = otomatis mengikuti base tujuan (backend) — segarkan cache follow.
    syncFollowing().catch(() => {});

    // Clear draft
    localStorage.removeItem('fess_draft');

    const fessStatus = createdFess?.rawStatus || createdFess?.status || 'pending';

    // Role-aware navigation: Base Admin returns to /base-admin, regular user to /feed
    if (authStore.user?.role === 'Base Admin') {
      router.push('/base-admin');
    } else {
      router.push({ path: '/feed', query: { postSuccess: fessStatus } });
    }
  } catch (error) {
    console.error('Publish failed:', error);
    publishError.value = error?.message || 'Gagal mengirim fess. Pastikan format konten valid dan coba lagi.';
  } finally {
    publishing.value = false;
    showPublishModal.value = false;
  }
}

/** Resolve a quote target from the API (mount + query changes). */
async function loadQuoteFess(id) {
  try {
    const res = await api.getFess(String(id));
    const fess = res?.fess ?? res?.data ?? res;
    if (fess) applyQuotedFess(mapFessToPost(fess));
  } catch {
    // quote target not found — silently ignore
  }
}

// Load draft and initialize on mount
onMounted(async () => {
  const savedDraft = localStorage.getItem('fess_draft');
  if (savedDraft) {
    try {
      const draft = JSON.parse(savedDraft);
      if (draft.isDraft && Date.now() - draft.savedAt < 7 * 24 * 60 * 60 * 1000) {
        // 7 days
        // Restore form but don't overwrite if user already typed
        if (!hasContent.value) {
          Object.assign(form.value, {
            baseHandle: draft.baseHandle || '',
            content: draft.content || '',
            media: (draft.media || []).filter(
              (m) => !m.uploading && !!m.url && !String(m.url).startsWith('blob:')
            ),
            topic: draft.topic || '',
            scheduledAt: draft.scheduledAt || null,
            song: draft.song || null,
            template: draft.template || 'default',
            quotedFess: null,
          });
          // Kutipan dipulihkan lewat applier supaya base tujuan ikut terkunci.
          if (draft.quotedFess) applyQuotedFess(draft.quotedFess);
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }

  // Pre-fill quote from sessionStorage or query param
  const pendingSessionQuote = sessionStorage.getItem('pending_quote_fess');
  if (pendingSessionQuote) {
    try {
      const parsed = JSON.parse(pendingSessionQuote);
      if (parsed) {
        applyQuotedFess(parsed);
        sessionStorage.removeItem('pending_quote_fess');
      }
    } catch (e) {
      console.error('Failed to parse session quote', e);
    }
  } else if (route.query.quoteId) {
    await loadQuoteFess(route.query.quoteId);
  }

  // Load pickers from the API
  ensureTopicsLoaded().catch(() => {});
  await loadAvailableBases();

  // Pre-fill base handle: query param > admin's managed base > first available.
  // Saat ada kutipan, base sudah terkunci ke base asal kutipan — jangan ditimpa.
  if (route.query.base && !baseLocked.value) {
    const qBase = String(route.query.base).startsWith('@')
      ? String(route.query.base)
      : `@${route.query.base}`;
    form.value.baseHandle = qBase;
  } else if (!form.value.baseHandle) {
    if (authStore.isBaseAdmin && authStore.user?.managedBases?.length) {
      form.value.baseHandle = authStore.user.managedBases[0];
    } else if (availableBases.value.length > 0) {
      form.value.baseHandle = availableBases.value[0].handle;
    }
  }
});

// Auto-save draft
let autoSaveTimer = null;
watch(
  () => [
    form.value.content,
    form.value.media,
    form.value.topic,
    form.value.scheduledAt,
    form.value.song,
    form.value.template,
  ],
  () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveDraft, 3000);
  },
  { deep: true },
);

watch(
  () => route.query.quoteId,
  (newId) => {
    if (newId) {
      const pendingSessionQuote = sessionStorage.getItem('pending_quote_fess');
      if (pendingSessionQuote) {
        try {
          const parsed = JSON.parse(pendingSessionQuote);
          if (parsed) {
            applyQuotedFess(parsed);
            sessionStorage.removeItem('pending_quote_fess');
            return;
          }
        } catch (e) {}
      }
      loadQuoteFess(newId);
    }
  }
);

onUnmounted(() => {
  clearTimeout(autoSaveTimer);
});

// Handle keyboard shortcuts
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    if (canPublish.value && !publishing.value) {
      openPublishConfirm();
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.create-fess-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
}

/* ===== HEADER ===== */
.create-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--shell-header-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--shell-border-strong);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
}

.header-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save-draft {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-draft:hover:not(:disabled) {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
  color: var(--text-main);
}

.btn-save-draft:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-publish {
  padding: 10px 20px;
  border-radius: 24px;
  border: none;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px var(--neon-blue-glow);
}

.btn-publish:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--neon-blue-glow);
}

.btn-publish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== CONTENT LAYOUT ===== */
.create-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (min-width: 900px) {
  .create-content {
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: start;
    gap: 20px;
    padding: 20px 24px;
  }
}

/* ===== EDITOR MAIN ===== */
.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  overflow: hidden;
}

/* ===== PREVIEW PANEL ===== */
.preview-panel {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-panel .preview-content {
  overflow-y: auto;
  flex: 1;
}

.preview-panel:not(.has-content) .preview-content {
  opacity: 0.75;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
}

.preview-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.preview-subtitle {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.2px;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-main);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-export:hover:not(:disabled) {
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.btn-export:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.preview-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--danger-text, #ef4444);
}

/* Petunjuk geser media di pratinjau */
.preview-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--text-muted);
}

.preview-hint svg {
  flex-shrink: 0;
}

.preview-content {
  padding: 16px;
  min-height: 200px;
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
  font-size: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  color: var(--text-muted);
  font-weight: 500;
}

.stat-value {
  color: var(--text-main);
  font-weight: 700;
}

/* ===== EDITOR TOOLBAR ===== */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* ===== SCROLLBAR ===== */
.create-content::-webkit-scrollbar,
.preview-panel::-webkit-scrollbar {
  width: 6px;
}

.create-content::-webkit-scrollbar-track,
.preview-panel::-webkit-scrollbar-track {
  background: transparent;
}

.create-content::-webkit-scrollbar-thumb,
.preview-panel::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 3px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .create-header {
    padding: 8px 12px;
    gap: 8px;
  }

  .btn-back {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .header-title {
    font-size: 14.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-actions {
    gap: 6px;
    flex-shrink: 0;
  }

  .btn-save-draft {
    padding: 6px 10px;
    font-size: 11px;
    white-space: nowrap;
  }

  .btn-publish {
    padding: 7px 14px;
    font-size: 12.5px;
    white-space: nowrap;
  }

  .create-content {
    padding: 10px;
    gap: 12px;
  }

  .editor-toolbar {
    gap: 6px;
    padding: 6px;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }

  .editor-toolbar::-webkit-scrollbar {
    display: none;
  }

  /* Preview panel on mobile: not sticky, just flow */
  .preview-panel {
    position: relative;
    top: 0;
    max-height: none;
  }
}

/* ===== COMPOSER QUOTED CARD ===== */
.composer-quoted-card {
  background: var(--bg-surface, #12151e);
  border: 1px solid var(--border-subtle, #2a3143);
  border-left: 3px solid var(--brand-blue, #60a5fa);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.composer-quoted-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cq-author {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.cq-icon {
  color: var(--brand-blue, #60a5fa);
  flex-shrink: 0;
}

.cq-handle {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.cq-time {
  font-size: 11.5px;
  color: var(--text-muted, #7c889f);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-remove-quote {
  background: transparent;
  border: none;
  color: var(--text-muted, #7c889f);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-remove-quote:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.cq-text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-secondary, #d0d7e5);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;
}

.publish-error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 12px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  line-height: 1.4;
}

.publish-error-banner .error-msg {
  flex: 1;
}

.btn-dismiss-err {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.btn-dismiss-err:hover {
  opacity: 1;
}
</style>
