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
          <h2 id="template-modal-title" class="modal-title">Pilih Template Card</h2>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="template-grid">
            <button
              v-for="t in templates"
              :key="t.key"
              type="button"
              class="template-card"
              :class="{ selected: template === t.key }"
              @click="selectTemplate(t.key)"
            >
              <div class="template-card__preview" :class="t.key">
                <div class="template-mini-header">
                  <div class="template-mini-avatar" :style="{ backgroundColor: '#7000FF' }">BS</div>
                  <div class="template-mini-meta">
                    <div class="template-mini-name">Nama Base</div>
                    <div class="template-mini-handle">@basehandle</div>
                  </div>
                </div>
                <div class="template-mini-content">
                  <div class="template-mini-text" v-for="i in 3" :key="i" />
                </div>
                <div class="template-mini-media" v-if="t.key !== 'text-only'">
                  <div class="template-mini-img" v-for="i in t.mediaCount" :key="i" />
                </div>
                <div class="template-mini-footer">
                  <div class="template-mini-actions">
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
              <div class="template-card__info">
                <span class="template-card__name">{{ t.label }}</span>
                <span class="template-card__desc">{{ t.description }}</span>
              </div>
              <div class="template-card__check" v-if="template === t.key">
                <Check :size="20" />
              </div>
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
import { X, Check } from 'lucide-vue-next';
import { TEMPLATES } from '../../data/templates';

const props = defineProps({
  show: { type: Boolean, default: false },
  template: { type: String, default: 'default' },
});

const emit = defineEmits(['update:show', 'update:template']);

// Single source of truth is src/data/templates.js; mediaCount derived from features.
const templates = TEMPLATES.map((t) => ({
  ...t,
  mediaCount: t.features.includes('media-grid') ? 4 : t.features.includes('media') ? 1 : 0,
}));

function selectTemplate(key) {
  emit('update:template', key);
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
  max-height: 85vh;
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
  padding: 20px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-card {
  position: relative;
  padding: 12px;
  background: var(--bg-inset);
  border: 2px solid var(--border-subtle);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-color);
}

.template-card.selected {
  border-color: var(--brand-blue);
  background: var(--shell-chip);
}

.template-card__preview {
  aspect-ratio: 3/4;
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-surface);
  margin-bottom: 10px;
  position: relative;
}

.template-card__preview.template-default {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}

.template-card__preview.template-minimal {
  border-left: 3px solid var(--brand-blue);
  border-radius: 0;
}

.template-card__preview.template-card {
  border: 2px solid var(--border-strong);
  border-radius: 16px;
  box-shadow: 0 8px 24px var(--shadow-color);
}

.template-card__preview.template-story {
  aspect-ratio: 9/16;
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%);
  border-radius: 20px;
}

.template-card__preview.template-text-only {
  background: var(--bg-surface);
  border-radius: 12px;
}

.template-card__preview.template-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  aspect-ratio: 1;
  border-radius: 12px;
}

.template-card__preview.template-quote {
  background: linear-gradient(135deg, var(--bg-surface-2), var(--bg-inset));
  border: 1px dashed var(--border-strong);
  border-radius: 16px;
}

.template-card__preview.template-quote .template-mini-header,
.template-card__preview.template-quote .template-mini-media {
  display: none;
}

.template-card__preview.template-quote .template-mini-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 34px);
  padding: 8px;
}

.template-card__preview.template-announcement {
  border: 2px solid var(--danger);
  border-radius: 10px;
}

.template-mini-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.template-mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 10px;
  color: var(--text-on-accent);
}

.template-mini-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.template-mini-name {
  font-weight: 700;
  font-size: 11px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis.;
}

.template-mini-handle {
  font-size: 9px;
  color: var(--text-muted);
}

.template-mini-content {
  padding: 0 8px 8px;
}

.template-mini-text {
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--text-muted) 50%, transparent 50%);
  background-size: 20px 100%;
  margin-bottom: 6px;
  opacity: 0.3;
}

.template-mini-text:last-child {
  width: 60%;
}

.template-mini-media {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 0 8px 8px;
}

.template-mini-img {
  aspect-ratio: 1;
  background: var(--bg-inset);
  border-radius: 6px;
}

.template-mini-footer {
  padding: 8px;
  border-top: 1px solid var(--border-subtle);
}

.template-mini-actions {
  display: flex;
  justify-content: space-around;
  font-size: 10px;
  color: var(--text-muted);
}

.template-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-card__name {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-main);
}

.template-card__desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.3;
}

.template-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--neon-blue-glow);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
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
  transition: all 0.2s ease.;
}

.btn-secondary:hover {
  background: var(--bg-inset);
  border-color: var(--border-strong);
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

.btn-primary:hover {
  box-shadow: 0 4px 12px var(--neon-blue-glow);
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
