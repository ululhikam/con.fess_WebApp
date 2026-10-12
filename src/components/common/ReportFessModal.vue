<template>
  <div
    v-if="show"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Laporkan Konten Fess"
    @click.self="$emit('close')"
  >
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <Flag :size="18" class="header-icon" />
          <h3 class="modal-title">Laporkan Konten</h3>
        </div>
        <button type="button" class="btn-close" aria-label="Tutup" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <p class="modal-desc">
          Bantu kami menjaga kenyamanan komunitas FessHub. Pilih kategori pelanggaran untuk konten
          <strong>{{ fessHandle || 'ini' }}</strong>:
        </p>

        <div class="report-reasons-list">
          <label
            v-for="r in REPORT_REASONS"
            :key="r.id"
            class="reason-option-label"
            :class="{ selected: selectedReason === r.id }"
          >
            <input
              v-model="selectedReason"
              type="radio"
              name="reportReason"
              :value="r.id"
              class="reason-radio"
              required
            />
            <div class="reason-text-box">
              <span class="reason-title">{{ r.label }}</span>
              <span class="reason-desc">{{ r.desc }}</span>
            </div>
          </label>
        </div>

        <div class="form-group mt-3">
          <label class="form-label" for="report-note">Catatan Tambahan (Opsional)</label>
          <textarea
            id="report-note"
            v-model="reportNote"
            rows="2"
            class="form-textarea"
            placeholder="Jelaskan konteks pelanggaran jika diperlukan..."
            maxlength="250"
          ></textarea>
        </div>

        <div class="modal-footer mt-4">
          <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn-submit-report" :disabled="!selectedReason">
            Kirim Laporan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * ReportFessModal — Shared modal for reporting confessions.
 * Clean, harmonized colors, zero emojis.
 */
import { ref } from 'vue';
import { Flag, X } from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, default: false },
  fessId: { type: [String, Number], default: '' },
  fessHandle: { type: String, default: '' },
});

const emit = defineEmits(['close', 'submitted']);

const REPORT_REASONS = [
  {
    id: 'spam',
    label: 'Spam atau Promosi Ilegal',
    desc: 'Tautan berbahaya, bot, judi online, atau iklan massal tidak pantas',
  },
  {
    id: 'sara',
    label: 'Ujaran Kebencian & SARA',
    desc: 'Menghina suku, agama, ras, atau golongan secara diskriminatif',
  },
  {
    id: 'pelecehan',
    label: 'Pelecehan & Doxxing',
    desc: 'Menyebarkan identitas pribadi tanpa izin, ancaman, atau perundungan',
  },
  {
    id: 'dewasa',
    label: 'Konten Asusila & Dewasa',
    desc: 'Pornografi, eksploitasi, atau materi tidak senonoh',
  },
  {
    id: 'hoaks',
    label: 'Informasi Palsu (Hoaks)',
    desc: 'Fitnah, manipulasi fakta yang merugikan publik',
  },
];

const selectedReason = ref('spam');
const reportNote = ref('');

function handleSubmit() {
  if (!selectedReason.value) return;
  emit('submitted', {
    reason: selectedReason.value,
    note: reportNote.value.trim(),
  });
  selectedReason.value = 'spam';
  reportNote.value = '';
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.18s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: var(--shell-text-muted);
}

.modal-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  color: var(--shell-text);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease;
}

.btn-close:hover {
  background: var(--shell-chip);
  color: var(--shell-text);
}

.modal-body {
  padding: 18px 20px 22px;
}

.modal-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--shell-text-muted);
  margin: 0 0 14px;
}

.report-reasons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-option-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  background: var(--shell-card-subtle);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.reason-option-label:hover {
  background: var(--shell-chip);
}

.reason-option-label.selected {
  border-color: var(--shell-text-dim);
  background: var(--shell-chip);
}

.reason-radio {
  margin-top: 3px;
  accent-color: var(--shell-text);
}

.reason-text-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reason-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--shell-text);
}

.reason-desc {
  font-size: 11.5px;
  color: var(--shell-text-dim);
  line-height: 1.4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.form-textarea {
  background: var(--shell-card-subtle);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--shell-text);
  font-family: inherit;
  resize: vertical;
  outline: none;
}

.form-textarea:focus {
  border-color: var(--shell-text-dim);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  padding: 8px 18px;
  color: var(--shell-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s ease;
}

.btn-cancel:hover {
  background: var(--shell-chip);
}

.btn-submit-report {
  background: var(--shell-text);
  color: var(--shell-bg);
  border: none;
  border-radius: var(--radius-pill);
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.12s ease;
}

.btn-submit-report:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-submit-report:not(:disabled):hover {
  opacity: 0.9;
}
</style>
