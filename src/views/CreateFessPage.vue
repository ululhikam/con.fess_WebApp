<template>
  <div class="create-fess-page">
    <!-- Header -->
    <header class="create-header">
      <button type="button" class="btn-back" @click="$router.back()" aria-label="Kembali">
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
          @click="openPublishConfirm"
          :disabled="publishing || !canPublish"
        >
          <Loader2 v-if="publishing" :size="16" class="spin" />
          <span v-else>{{ isScheduled ? 'Jadwalkan' : 'Posting' }}</span>
        </button>
      </div>
    </header>

    <div class="create-content">
      <!-- Main Editor Area -->
      <main class="editor-main">
        <!-- Base Selector (Top) -->
        <BaseSelector v-model="form.baseHandle" :bases="availableBases" @change="onBaseChange" />

        <!-- Text Editor -->
        <EditorArea
          v-model="form.content"
          :placeholder="getPlaceholder()"
          :max-length="2000"
          @input="onContentChange"
          ref="editorRef"
        />

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
            icon="Tag"
            label="Topik"
            :active="!!form.topic"
            @click="showTopicModal = true"
          >
            <span v-if="form.topic" class="toolbar-badge">{{ form.topic }}</span>
          </ToolbarButton>

          <ToolbarButton
            icon="Calendar"
            label="Jadwal"
            :active="!!form.scheduledAt"
            @click="showScheduleModal = true"
          >
            <span v-if="form.scheduledAt" class="toolbar-badge">
              {{ formatScheduleDate(form.scheduledAt) }}
            </span>
          </ToolbarButton>

          <ToolbarButton
            icon="Music"
            label="Lagu"
            :active="!!form.song"
            @click="showSongModal = true"
          >
            <span v-if="form.song" class="toolbar-badge">{{ form.song.title }}</span>
          </ToolbarButton>

          <ToolbarButton
            icon="Layout"
            label="Template"
            :active="form.template !== 'default'"
            @click="showTemplateModal = true"
          >
            <span v-if="form.template !== 'default'" class="toolbar-badge">
              {{ getTemplateLabel(form.template) }}
            </span>
          </ToolbarButton>
        </div>
      </main>

      <!-- Preview Panel (Right Sidebar on Desktop, Bottom on Mobile) -->
      <aside class="preview-panel" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <h2 class="preview-title">Pratinjau</h2>
          <label class="preview-toggle" @click="previewMode = !previewMode">
            <input type="checkbox" v-model="previewMode" />
            <span>{{ previewMode ? 'Mode Preview' : 'Mode Edit' }}</span>
          </label>
        </div>

        <div class="preview-content">
          <PostPreview
            :content="form.content"
            :media="form.media"
            :base-handle="form.baseHandle"
            :topic="form.topic"
            :song="form.song"
            :template="form.template"
            :author="currentUser"
            :is-preview="true"
          />
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

    <!-- Publish Confirmation Modal -->
    <PublishModal
      v-model:show="showPublishModal"
      :form="form"
      :is-scheduled="isScheduled"
      @confirm="publishFess"
      @cancel="showPublishModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ChevronLeft, Loader2, Tag, Calendar, Music, Layout } from 'lucide-vue-next';

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

// Composables & Stores
import { usePosts } from '../composables/usePosts';
import { useAuthStore } from '../stores/authStore';
import { useValidatedForm, rules } from '../composables/useValidatedForm';
import { validateFessContent, generateClientId } from '../utils/format';

// Data
import { TOPICS } from '../data/topics';
import { TEMPLATES } from '../data/templates';
import { SONGS } from '../data/songs';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { createPost } = usePosts();

// Form state
const form = ref({
  baseHandle: '',
  content: '',
  media: [],
  topic: '',
  scheduledAt: null,
  song: null,
  template: 'default',
});

// UI state
const showTopicModal = ref(false);
const showScheduleModal = ref(false);
const showSongModal = ref(false);
const showTemplateModal = ref(false);
const showPublishModal = ref(false);
const previewMode = ref(true);
const savingDraft = ref(false);
const publishing = ref(false);
const editorFocused = ref(false);

const editorRef = ref(null);
const currentUser = computed(() => authStore.user);

const availableBases = computed(() => {
  // In real app, this would come from followed bases API
  return [
    {
      handle: '@codememfess',
      name: 'Code Memes & Rants',
      keyword: '[code]',
      color: '#0038FF',
      avatar: 'CM',
      verified: true,
    },
    {
      handle: '@gamerfess',
      name: 'Gaming Confessions',
      keyword: '[game]',
      color: '#FF0055',
      avatar: 'GC',
      verified: true,
    },
    {
      handle: '@indiefess',
      name: 'Indie Hacker Secrets',
      keyword: '[indie]',
      color: '#FF6D00',
      avatar: 'IH',
      verified: false,
    },
    {
      handle: '@designfess',
      name: 'Design Rants & Feedback',
      keyword: '[design]',
      color: '#00B2FF',
      avatar: 'DR',
      verified: true,
    },
    {
      handle: '@anonfess',
      name: 'Anon Confessions',
      keyword: '[anon]',
      color: '#7000FF',
      avatar: 'AN',
      verified: false,
    },
  ];
});

const topics = ref(TOPICS);
const templates = ref(TEMPLATES);
const songs = ref(SONGS);

const hasContent = computed(
  () => form.value.content.trim().length > 0 || form.value.media.length > 0,
);

const canPublish = computed(() => {
  const validation = validateFessContent(form.value.content);
  return (validation.valid || form.value.media.length > 0) && form.value.baseHandle;
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
  const t = templates.value.find((t) => t.key === key);
  return t?.label || key;
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

function onContentChange(content) {
  form.value.content = content;
}

function onMediaChange(media) {
  form.value.media = media;
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
    // TODO: show toast "Draf tersimpan"
  } finally {
    savingDraft.value = false;
  }
}

function openPublishConfirm() {
  showPublishModal.value = true;
}

async function publishFess() {
  if (!canPublish.value) return;

  publishing.value = true;
  try {
    const payload = {
      base_handle: form.value.baseHandle,
      content: form.value.content.trim(),
      media: form.value.media.map((m) => ({
        type: m.type,
        url: m.url,
        thumbnail: m.thumbnail,
        duration: m.duration,
      })),
      topic: form.value.topic,
      scheduled_at: form.value.scheduledAt,
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
    };

    await createPost(payload);

    // Clear draft
    localStorage.removeItem('fess_draft');

    // Navigate to feed
    router.push('/feed');
  } catch (error) {
    console.error('Publish failed:', error);
    // Error handled by useMutation in usePosts
  } finally {
    publishing.value = false;
    showPublishModal.value = false;
  }
}

// Load draft on mount
onMounted(() => {
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
            media: draft.media || [],
            topic: draft.topic || '',
            scheduledAt: draft.scheduledAt || null,
            song: draft.song || null,
            template: draft.template || 'default',
          });
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }

  // Set default base if user has one followed
  if (!form.value.baseHandle && availableBases.value.length > 0) {
    form.value.baseHandle = availableBases.value[0].handle;
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
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (min-width: 900px) {
  .create-content {
    grid-template-columns: 1fr 360px;
    align-items: start;
  }
}

/* ===== EDITOR MAIN ===== */
.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== PREVIEW PANEL ===== */
.preview-panel {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
}

.preview-panel:not(.has-content) .preview-content {
  opacity: 0.5;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.preview-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.preview-toggle input {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-blue);
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
    padding: 10px 12px;
  }

  .header-title {
    font-size: 16px;
  }

  .btn-save-draft {
    padding: 6px 12px;
    font-size: 12px;
  }

  .btn-publish {
    padding: 8px 16px;
    font-size: 13px;
  }

  .create-content {
    padding: 12px;
    gap: 12px;
  }
}
</style>
