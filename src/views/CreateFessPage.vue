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
          title="Simpan draf"
          aria-label="Simpan draf"
          @click="saveDraft"
          :disabled="savingDraft || !hasContent"
        >
          <Save :size="15" class="draft-icon" />
          <span class="draft-label">{{ savingDraft ? 'Menyimpan...' : 'Simpan Draf' }}</span>
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
          <button
            type="button"
            class="btn-dismiss-err"
            @click="publishError = ''"
            aria-label="Tutup pesan error"
          >
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
              <span class="cq-handle">{{
                form.quotedFess.handle || form.quotedFess.senderHandle
              }}</span>
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
            :active="!isRandomTemplate"
            @click="showTemplateModal = true"
          >
            <span class="toolbar-badge">
              {{ isRandomTemplate ? 'Otomatis' : getTemplateLabel(form.template) }}
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
    </div>

    <!-- Modals -->
    <TopicModal v-model:show="showTopicModal" v-model:topic="form.topic" :topics="topics" />
    <ScheduleModal v-model:show="showScheduleModal" v-model:date="form.scheduledAt" />
    <SongModal v-model:show="showSongModal" v-model:song="form.song" />
    <TemplateModal
      v-model:show="showTemplateModal"
      :template="form.template"
      @update:template="onTemplatePick"
    />
    <QuoteModal
      v-model:show="showQuoteModal"
      :model-value="form.quotedFess"
      @update:model-value="applyQuotedFess"
    />

    <!-- Publish Confirmation Modal (satu-satunya pratinjau + atur urutan slide) -->
    <PublishModal
      v-model:show="showPublishModal"
      :form="form"
      :is-scheduled="isScheduled"
      :confirming="publishing"
      @confirm="publishFess"
      @cancel="showPublishModal = false"
      @reorder-slides="onReorderSlides"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ChevronLeft,
  Loader2,
  Save,
  Tag,
  Calendar,
  Music,
  Layout,
  AlertCircle,
  Quote,
  X,
} from 'lucide-vue-next';

// Components
import BaseSelector from '../components/compose/BaseSelector.vue';
import EditorArea from '../components/compose/EditorArea.vue';
import MediaUploader from '../components/compose/MediaUploader.vue';
import ToolbarButton from '../components/compose/ToolbarButton.vue';
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
import { TEMPLATES, pickRandomTemplateKey } from '../config/templates';

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
  carouselOrder: [],
  topic: '',
  scheduledAt: null,
  song: null,
  template: pickRandomTemplateKey(),
  quotedFess: null,
});

// UI state
const showTopicModal = ref(false);
const showScheduleModal = ref(false);
const showSongModal = ref(false);
const showTemplateModal = ref(false);
const showQuoteModal = ref(false);
const showPublishModal = ref(false);
// true = user belum memilih template; composer memakai template acak.
const isRandomTemplate = ref(true);
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
          await ensureQuotedBaseInList(
            form.value.quotedFess?.handle || form.value.quotedFess?.senderHandle,
          );
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
    await ensureQuotedBaseInList(
      form.value.quotedFess?.handle || form.value.quotedFess?.senderHandle,
    );
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
    form.value.content.trim().length > 0 || form.value.media.length > 0 || !!form.value.quotedFess,
);

const hasUploadingMedia = computed(() =>
  form.value.media.some((m) => m.uploading || !m.url || String(m.url).startsWith('blob:')),
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

// Template: pilihan manual vs acak (default composer).
function onTemplatePick(key) {
  form.value.template = key;
  isRandomTemplate.value = false;
}

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

/**
 * Terapkan urutan slide baru dari pratinjau. Token kartu (`card:0`) dan media
 * (`media:<id>`) boleh berselang-seling, jadi media bisa menjadi slide pertama.
 * Urutan array media ikut diselaraskan agar grid uploader tetap masuk akal.
 */
function onReorderSlides(order) {
  if (!Array.isArray(order) || !order.length) return;
  form.value.carouselOrder = order.slice();

  const list = form.value.media || [];
  const orderedIds = order
    .filter((token) => String(token).startsWith('media:'))
    .map((token) => String(token).slice('media:'.length));
  if (!orderedIds.length) return;

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
      isRandomTemplate: isRandomTemplate.value,
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
    publishError.value =
      'Foto/video masih dalam proses unggah. Mohon tunggu hingga lingkaran animasi selesai.';
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
      (m) => m.uploading || !m.url || String(m.url).startsWith('blob:'),
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
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnail: m.thumbnail || null,
        duration: m.duration || null,
        width: m.width || null,
        height: m.height || null,
        caption: m.caption || null,
      })),
      carousel_order: form.value.carouselOrder || [],
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
    publishError.value =
      error?.message || 'Gagal mengirim fess. Pastikan format konten valid dan coba lagi.';
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
              (m) => !m.uploading && !!m.url && !String(m.url).startsWith('blob:'),
            ),
            carouselOrder: Array.isArray(draft.carouselOrder) ? draft.carouselOrder : [],
            topic: draft.topic || '',
            scheduledAt: draft.scheduledAt || null,
            song: draft.song || null,
            template: draft.template || 'default',
            quotedFess: null,
          });
          isRandomTemplate.value = draft.isRandomTemplate === true;
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
    form.value.carouselOrder,
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
  },
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.draft-icon {
  display: none;
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

/* ===== CONTENT LAYOUT (editor full width — pratinjau pindah ke modal posting) ===== */
.create-content {
  flex: 1;
  padding: 16px;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (min-width: 900px) {
  .create-content {
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

/* ===== PREVIEW PANEL =====
   Pratinjau live dihapus dari composer — pratinjau + atur urutan slide kini
   hanya ada di modal konfirmasi posting (PublishModal). */

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
.create-content::-webkit-scrollbar {
  width: 6px;
}

.create-content::-webkit-scrollbar-track {
  background: transparent;
}

.create-content::-webkit-scrollbar-thumb {
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
    overflow: visible;
  }

  .editor-toolbar :deep(.toolbar-btn) {
    flex: 0 1 auto;
    max-width: 100%;
    min-width: 0;
  }

  .editor-toolbar :deep(.toolbar-badge) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 380px) {
  .header-title {
    font-size: 14px;
  }

  .btn-save-draft {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .draft-label {
    display: none;
  }

  .draft-icon {
    display: block;
  }

  .btn-publish {
    padding: 7px 11px;
    font-size: 12px;
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
