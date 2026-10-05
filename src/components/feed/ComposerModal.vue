<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-backdrop" role="presentation" @click.self="close">
      <div
        ref="dialog"
        class="modal-dialog-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        @keydown.esc="close"
      >
        <header class="modal-dialog-header">
          <h3 id="composer-title">Kirim Menfess Baru</h3>
          <button type="button" class="btn-modal-close" aria-label="Tutup" @click="close">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-dialog-body">
          <div class="form-group mb-3">
            <label class="form-label" for="composer-base">Pilih Base Tujuan:</label>
            <select id="composer-base" v-model="draftBase" class="select-base-input">
              <option v-for="base in bases" :key="base.handle" :value="base.handle">
                {{ base.name }} ({{ base.handle }})
              </option>
            </select>
          </div>

          <label class="visually-hidden" for="composer-text">Isi menfess</label>
          <textarea
            id="composer-text"
            ref="textarea"
            v-model="draftText"
            class="modal-textarea mb-3"
            placeholder="Tuliskan menfess atau curhatan anonim kamu..."
            rows="4"
            :maxlength="maxLength"
          />

          <div class="composer-footer">
            <span
              class="text-xs counter"
              :class="{ 'counter--warn': remaining <= 20 }"
              aria-live="polite"
            >
              {{ draftText.length }}/{{ maxLength }}
            </span>

            <button type="button" class="btn-modal-submit" :disabled="!canSubmit" @click="submit">
              Kirim Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * ComposerModal — send a new confession.
 * Self-contained: owns its draft state, keyboard handling and validation.
 * The parent only listens for `submit`.
 */
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  bases: { type: Array, default: () => [] },
  defaultBase: { type: String, default: '' },
  maxLength: { type: Number, default: 280 },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const textarea = ref(null);
const dialog = ref(null);
const draftBase = ref(props.defaultBase);
const draftText = ref('');

const remaining = computed(() => props.maxLength - draftText.value.length);
const canSubmit = computed(() => draftText.value.trim().length > 0 && remaining.value >= 0);

function close() {
  emit('update:modelValue', false);
}

function submit() {
  if (!canSubmit.value) return;
  emit('submit', { base: draftBase.value, content: draftText.value.trim() });
  draftText.value = '';
  close();
}

/** Trap focus + lock body scroll while the dialog is open. */
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      draftBase.value = draftBase.value || props.defaultBase;
      document.body.style.overflow = 'hidden';
      await nextTick();
      textarea.value?.focus();
    } else {
      document.body.style.overflow = '';
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-dialog-content {
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  border-radius: 24px;
  padding: 24px 20px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 24px 60px var(--shadow-color);
}

.modal-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-dialog-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.btn-modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 8px;
}

.btn-modal-close:hover {
  color: var(--text-main);
  background: var(--bg-surface-2);
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.select-base-input,
.modal-textarea {
  width: 100%;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-family: inherit;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.select-base-input:focus,
.modal-textarea:focus {
  border-color: var(--neon-blue);
}

.modal-textarea {
  resize: vertical;
  min-height: 96px;
  line-height: 1.6;
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.counter {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.counter--warn {
  color: var(--warning-text);
  font-weight: 700;
}

.btn-modal-submit {
  background: var(--lime-primary);
  color: var(--lime-ink);
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.btn-modal-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn-modal-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-active .modal-dialog-content,
.modal-fade-leave-active .modal-dialog-content {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-dialog-content,
.modal-fade-leave-to .modal-dialog-content {
  transform: translateY(12px) scale(0.98);
}
</style>
