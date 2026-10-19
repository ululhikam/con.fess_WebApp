<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
      >
        <header class="modal-header">
          <div>
            <h2 id="template-modal-title" class="modal-title">Pilih Template Card</h2>
            <p class="modal-subtitle">
              Pilih desain card untuk Instagram Feed — atau gunakan Acak.
            </p>
          </div>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <button type="button" class="template-random-cta" @click="selectRandom">
            <span class="template-random-cta__icon">
              <Shuffle :size="18" />
            </span>
            <span class="template-random-cta__text">
              <strong>Acak template</strong>
              <span>Biarkan sistem memilih desain acak jika kamu tidak memilih.</span>
            </span>
            <span class="template-random-cta__badge">Random</span>
          </button>

          <div class="template-grid">
            <button
              v-for="t in TEMPLATES"
              :key="t.key"
              type="button"
              class="template-card"
              :class="{ selected: template === t.key }"
              :aria-pressed="template === t.key"
              @click="select(t.key)"
            >
              <!-- Real background thumbnail -->
              <span
                class="template-thumb"
                :class="`ink-${t.ink}`"
                :style="{
                  aspectRatio: getTemplateAspectRatio(t),
                  background: getTemplateBackground(t),
                }"
              >
                <span class="template-thumb__head">
                  <span class="template-thumb__dot" />
                  <span class="template-thumb__line is-short" />
                </span>
                <span class="template-thumb__body">
                  <span class="template-thumb__line" />
                  <span class="template-thumb__line" />
                  <span class="template-thumb__line is-short" />
                </span>
                <span class="template-thumb__foot" />
              </span>

              <span class="template-card__info">
                <span class="template-card__name">{{ t.label }}</span>
                <span class="template-card__desc">{{ t.description }}</span>
              </span>

              <div class="template-card__tags">
                <span class="template-card__badge">{{ aspectLabel(t) }}</span>
              </div>

              <span v-if="template === t.key" class="template-card__check">
                <Check :size="14" />
              </span>
            </button>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn-primary" @click="confirm">Gunakan</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X, Check, Shuffle } from 'lucide-vue-next';
import {
  TEMPLATES,
  ASPECTS,
  getTemplateBackground,
  getTemplateAspectRatio,
  pickRandomTemplateKey,
} from '../../config/templates';

const props = defineProps({
  show: { type: Boolean, default: false },
  template: { type: String, default: 'default' },
});

const emit = defineEmits(['update:show', 'update:template', 'randomize']);

function select(key) {
  emit('update:template', key);
}

/** Acak template: parent menandai pilihan sebagai random (bukan pilihan manual). */
function selectRandom() {
  emit('randomize', pickRandomTemplateKey(props.template));
}

function aspectLabel(t) {
  return (ASPECTS[t.aspect] || ASPECTS.portrait).label;
}

function confirm() {
  emit('update:show', false);
}

function close() {
  emit('update:show', false);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim, rgba(6, 8, 15, 0.75));
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 580px;
  max-height: 88vh;
  background: var(--bg-surface, #10141f);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px var(--shadow-color, rgba(0, 0, 0, 0.5));
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  margin: 0;
}

.modal-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.65));
  line-height: 1.4;
}

.modal-close {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted, rgba(255, 255, 255, 0.65));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-surface-2, rgba(255, 255, 255, 0.08));
  color: var(--text-main, #ffffff);
}

/* Category filter bar dihapus — semua template tampil dalam satu grid. */

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 20px;
}

/* ---- random template CTA ---- */
.template-random-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 14px;
  border-radius: 14px;
  border: 1px dashed var(--border-strong, rgba(255, 255, 255, 0.25));
  background: linear-gradient(135deg, rgba(0, 56, 255, 0.16), rgba(112, 0, 255, 0.16));
  color: var(--text-main, #ffffff);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.template-random-cta:hover {
  border-color: var(--brand-blue, #0055ff);
  background: linear-gradient(135deg, rgba(0, 56, 255, 0.26), rgba(112, 0, 255, 0.26));
  transform: translateY(-1px);
}

.template-random-cta__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
}

.template-random-cta__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.template-random-cta__text strong {
  font-size: 14px;
  font-weight: 800;
}

.template-random-cta__text span {
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.65));
}

.template-random-cta__badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.template-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: var(--bg-inset, rgba(255, 255, 255, 0.03));
  border: 2px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.template-card:hover {
  border-color: var(--border-strong, rgba(255, 255, 255, 0.3));
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-color, rgba(0, 0, 0, 0.4));
}

.template-card.selected {
  border-color: var(--brand-blue, #0055ff);
}

/* ---- live thumbnail ---- */
.template-thumb {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  padding: 9px;
  border-radius: 9px;
  overflow: hidden;
  background-repeat: repeat;
}

.template-thumb__head,
.template-thumb__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-thumb__head {
  flex-direction: row;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.template-thumb__dot {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  flex-shrink: 0;
  background: currentColor;
  opacity: 0.85;
}

.template-thumb__line {
  height: 4px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.55;
}

.template-thumb__body .template-thumb__line {
  height: 5px;
}

.template-thumb__line.is-short {
  width: 55%;
}

.template-thumb__foot {
  margin-top: auto;
  height: 4px;
  width: 40%;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.4;
}

.ink-light .template-thumb {
  color: #ffffff;
}
.ink-dark .template-thumb {
  color: #1c1917;
}

/* ---- info ---- */
.template-card__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.template-card__name {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-main, #ffffff);
}

.template-card__desc {
  font-size: 11px;
  color: var(--text-muted, rgba(255, 255, 255, 0.65));
  line-height: 1.35;
}

.template-card__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: auto;
}

.template-card__badge {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--shell-chip, rgba(255, 255, 255, 0.08));
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  letter-spacing: 0.2px;
}

.template-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--brand-blue, #0038ff);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 56, 255, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  background: var(--bg-surface-2, rgba(255, 255, 255, 0.02));
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.15));
  background: transparent;
  color: var(--text-secondary, rgba(255, 255, 255, 0.8));
}

.btn-secondary:hover {
  background: var(--bg-inset, rgba(255, 255, 255, 0.06));
  border-color: var(--border-strong, rgba(255, 255, 255, 0.3));
}

.btn-primary {
  border: none;
  background: var(--brand-blue, #0038ff);
  color: #ffffff;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(0, 56, 255, 0.5);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
