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
          <!-- Preview Card -->
          <PostPreview
            :content="form.content"
            :media="form.media"
            :base-handle="form.baseHandle"
            :topic="form.topic"
            :song="form.song"
            :template="form.template"
            :author="author"
            :is-preview="true"
          />

          <!-- Summary -->
          <div class="publish-summary">
            <div class="summary-row">
              <span class="summary-label">Base</span>
              <span class="summary-value">{{ getBaseName(form.baseHandle) }}</span>
            </div>

            <div v-if="form.topic" class="summary-row">
              <span class="summary-label">Topik</span>
              <span class="summary-value">{{ form.topic }}</span>
            </div>

            <div v-if="form.song" class="summary-row">
              <span class="summary-label">Lagu</span>
              <span class="summary-value">{{ form.song.title }} - {{ form.song.artist }}</span>
            </div>

            <div v-if="form.template !== 'default'" class="summary-row">
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
import { computed } from 'vue';
import { X, Calendar, Loader2, AlertCircle } from 'lucide-vue-next';
import PostPreview from './PostPreview.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  form: { type: Object, required: true },
  isScheduled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show', 'confirm', 'cancel']);

const author = computed(() => ({
  username: 'Kamu',
  handle: '@kamu',
}));

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
  const templates = {
    default: 'Standar',
    minimal: 'Minimal',
    card: 'Kartu',
    story: 'Story',
    'text-only': 'Hanya Teks',
    gallery: 'Galeri',
  };
  return templates[key] || key;
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
  max-width: 420px;
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
  cursor: not-allowed.;
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
  cursor: not-allowed.;
}

.btn-primary.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-primary.btn-danger:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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
