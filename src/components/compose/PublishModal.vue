<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-modal-title"
      >
        <header class="modal-header">
          <h2 id="publish-modal-title" class="modal-title">
            {{ isScheduled ? 'Konfirmasi Jadwal' : 'Konfirmasi Posting' }}
          </h2>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <!-- Pratinjau: kartu fess hasil render backend + media user, dengan
               urutan slide yang sama persis seperti carousel yang diposting. -->
          <div class="preview-panel">
            <div class="preview-panel__head">
              <span class="preview-panel__title">Pratinjau hasil render</span>
              <button
                v-if="previewImages.length"
                type="button"
                class="btn-download"
                @click="downloadFirstPage"
              >
                <Download :size="13" />
                <span>Unduh PNG</span>
              </button>
            </div>

            <div v-if="previewLoading" class="preview-loading">
              <Loader2 :size="20" class="spin" />
              <span>Merender kartu persis seperti hasil posting…</span>
            </div>
            <template v-else>
              <p v-if="previewError" class="preview-error">
                <AlertCircle :size="14" />
                <span>{{ previewError }}</span>
              </p>
              <PostPreviewCarousel
                :content="form.content"
                :media="form.media"
                :base-handle="form.baseHandle"
                :topic="form.topic"
                :song="form.song"
                :template="form.template"
                :author="author"
                :quoted-fess="form.quotedFess"
                :is-preview="true"
                :card-images="previewImages"
                :carousel-order="form.carouselOrder || []"
                reorderable
                @reorder-slides="$emit('reorder-slides', $event)"
              />
              <p v-if="mediaCount > 0" class="preview-hint">
                <GripVertical :size="13" />
                <span>
                  Geser pegangan media ke posisi mana pun — media bisa jadi slide pertama, di antara
                  kartu, atau terakhir.
                </span>
              </p>
            </template>
          </div>

          <!-- Summary -->
          <div class="publish-summary">
            <div class="summary-row">
              <span class="summary-label">Base</span>
              <span class="summary-value">{{ getBaseName(form.baseHandle) }}</span>
            </div>

            <div v-if="form.topic" class="summary-row">
              <span class="summary-label">Topik</span>
              <span class="summary-value">{{ topicLabel }}</span>
            </div>

            <div v-if="form.song" class="summary-row">
              <span class="summary-label">Lagu</span>
              <span class="summary-value">{{ form.song.title }} - {{ form.song.artist }}</span>
            </div>

            <div v-if="form.template" class="summary-row">
              <span class="summary-label">Template</span>
              <span class="summary-value">{{ getTemplateLabel(form.template) }}</span>
            </div>

            <div v-if="form.media.length > 0" class="summary-row">
              <span class="summary-label">Media</span>
              <span class="summary-value"
                >{{ form.media.length }} file ({{ getTotalMediaSize() }})</span
              >
            </div>

            <div v-if="isScheduled" class="summary-row schedule-row">
              <span class="summary-label"> <Calendar :size="14" /> Jadwal </span>
              <span class="summary-value">{{ formatScheduleDate(form.scheduledAt) }}</span>
            </div>
          </div>

          <!-- Warning for scheduled -->
          <div v-if="isScheduled" class="schedule-warning">
            <AlertCircle :size="16" />
            <span>
              Fess akan diposting otomatis pada waktu yang ditentukan. Pastikan aplikasi tetap
              memiliki akses internet.
            </span>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="close" :disabled="confirming">
            Batal
          </button>
          <button
            type="button"
            class="btn-primary"
            :class="{ 'btn-danger': !isScheduled }"
            @click="handleConfirm"
            :disabled="confirming"
          >
            <Loader2 v-if="confirming" :size="16" class="spin" />
            <span v-else>{{ isScheduled ? 'Jadwalkan' : 'Posting Sekarang' }}</span>
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { X, Calendar, Loader2, AlertCircle, Download, GripVertical } from 'lucide-vue-next';
import PostPreviewCarousel from './PostPreviewCarousel.vue';
import { useTopics } from '../../composables/useTopics';
import { TEMPLATES } from '../../config/templates';
import { api } from '../../api';
import { toast } from '../../composables/useToast';

const props = defineProps({
  show: { type: Boolean, default: false },
  form: { type: Object, required: true },
  isScheduled: { type: Boolean, default: false },
  /** True saat request posting sedang berjalan — kunci tombol konfirmasi. */
  confirming: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'reorder-slides']);

const { getTopicById } = useTopics();

/** Ringkasan menampilkan label topik asli (bukan id mentah). */
const topicLabel = computed(() => {
  const id = props.form.topic;
  if (!id) return '';
  return getTopicById(id)?.label || id;
});

const author = computed(() => ({
  username: 'Kamu',
  handle: '@kamu',
}));

/* ---- Pratinjau hasil render (identik dengan PNG yang diposting) ---------- */

const previewImages = ref([]);
const previewLoading = ref(false);
const previewError = ref('');
let previewReqId = 0;

async function loadPreview() {
  const reqId = ++previewReqId;
  previewImages.value = [];
  previewError.value = '';
  previewLoading.value = true;
  try {
    const res = await api.previewFessCanvas({
      base_handle: props.form.baseHandle,
      content: props.form.content,
      template: props.form.template,
      topic: props.form.topic || null,
      quoted_fess: props.form.quotedFess || null,
    });
    if (reqId !== previewReqId) return;
    previewImages.value = Array.isArray(res?.images) ? res.images : [];
  } catch (err) {
    if (reqId !== previewReqId) return;
    previewError.value =
      'Gagal memuat pratinjau hasil render. Pratinjau ringan ditampilkan sebagai cadangan.';
    toast.warning(previewError.value);
    console.warn('[PublishModal] render pratinjau gagal:', err?.message || err);
  } finally {
    if (reqId === previewReqId) previewLoading.value = false;
  }
}

// Muat ulang setiap modal dibuka — konten bisa berubah sejak terakhir dibuka.
watch(
  () => props.show,
  (show) => {
    if (show) {
      loadPreview();
    } else {
      previewReqId += 1;
      previewImages.value = [];
      previewError.value = '';
      previewLoading.value = false;
    }
  },
  { immediate: true },
);

const mediaCount = computed(() => (Array.isArray(props.form.media) ? props.form.media.length : 0));

/** Simpan halaman 1 kartu sebagai PNG — persis gambar yang dirender backend. */
function downloadFirstPage() {
  const src = previewImages.value[0];
  if (!src) return;
  const link = document.createElement('a');
  link.href = src;
  link.download = `fess-${props.form.template}-halaman-1.png`;
  link.click();
  toast.success('Gambar halaman 1 berhasil diunduh.');
}

function getBaseName(handle) {
  const bases = {
    '@codememfess': 'Code Memes & Rants',
    '@gamerfess': 'Gaming Confessions',
    '@indiefess': 'Indie Hacker Secrets',
    '@designfess': 'Design Rants & Feedback',
    '@anonfess': 'Anon Confessions',
  };
  return bases[handle] || handle;
}

function getTemplateLabel(key) {
  return TEMPLATES.find((t) => t.key === key)?.label || key;
}

function formatScheduleDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTotalMediaSize() {
  const total = props.form.media.reduce((sum, m) => sum + (m.size || 0), 0);
  if (total < 1024 * 1024) return (total / 1024).toFixed(1) + ' KB';
  return (total / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleConfirm() {
  // Guard ganda: parent juga mengunci lewat `publishing`, tapi modal ini
  // menolak emit kedua saat request pertama masih berjalan.
  if (props.confirming) return;
  emit('confirm');
}

function close() {
  emit('cancel');
  emit('update:show', false);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px var(--shadow-color);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* ---- pratinjau hasil render ---- */
.preview-panel {
  padding: 14px 16px 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.preview-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.preview-panel__title {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-main);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-download:hover {
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 240px;
  padding: 20px;
  color: var(--text-muted);
  font-size: 12.5px;
  text-align: center;
}

.preview-error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--warning, #f59e0b);
}

.preview-error svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.preview-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--text-muted);
}

.preview-hint svg {
  flex-shrink: 0;
}

.publish-summary {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-row.schedule-row .summary-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--brand-blue);
}

.summary-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(245, 158, 11, 0.15);
  border-radius: 12px;
  margin: 16px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--warning);
  font-size: 12px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-surface-2);
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-inset);
  border-color: var(--border-strong);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px var(--neon-blue-glow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-primary.btn-danger:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 92vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 12px 14px;
  }

  .preview-panel {
    padding: 12px 12px 8px;
  }

  .publish-summary {
    padding: 12px 14px;
  }

  .modal-footer {
    padding: 12px 14px;
    gap: 8px;
  }

  .modal-footer .btn-secondary,
  .modal-footer .btn-primary {
    flex: 1;
    padding: 10px 10px;
    font-size: 12px;
    white-space: nowrap;
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(20px);
}
</style>
