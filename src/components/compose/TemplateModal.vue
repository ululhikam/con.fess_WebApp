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
              Template dipilih acak otomatis saat kamu menulis. Pilih satu kalau ingin desain
              tertentu.
            </p>
          </div>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div v-if="templateStore.loading && !templateStore.items.length" class="template-state">
            <Loader2 :size="18" class="spin" />
            <span>Memuat template…</span>
          </div>

          <div
            v-else-if="templateStore.error && !templateStore.items.length"
            class="template-state is-error"
          >
            <AlertCircle :size="16" />
            <span>{{ templateStore.error }}</span>
            <button type="button" class="btn-secondary" @click="reload">Coba lagi</button>
          </div>

          <div v-else class="template-grid">
            <button
              v-for="t in templateStore.items"
              :key="t.key"
              type="button"
              class="template-card"
              :class="{ selected: template === t.key }"
              :aria-pressed="template === t.key"
              @click="select(t.key)"
            >
              <!-- Thumbnail resmi bila tersedia; jika belum, kartu warna palet. -->
              <span class="template-thumb" :style="thumbStyle(t)">
                <img
                  v-if="t.thumbnail_url"
                  class="template-thumb__img"
                  :src="t.thumbnail_url"
                  :alt="t.label"
                  loading="lazy"
                />
                <template v-else>
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
                </template>
              </span>

              <span class="template-card__info">
                <span class="template-card__name">{{ t.label }}</span>
                <span v-if="t.description" class="template-card__desc">{{ t.description }}</span>
              </span>

              <div class="template-card__tags">
                <span class="template-card__badge">{{ aspectLabel(t) }}</span>
                <span v-if="t.category" class="template-card__badge">{{
                  categoryLabel(t.category)
                }}</span>
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
import { watch } from 'vue';
import { X, Check, Loader2, AlertCircle } from 'lucide-vue-next';
import { useTemplateStore } from '../../stores/templateStore';

const props = defineProps({
  show: { type: Boolean, default: false },
  template: { type: String, default: 'default' },
});

const emit = defineEmits(['update:show', 'update:template']);

const templateStore = useTemplateStore();

watch(
  () => props.show,
  (show) => {
    if (show) templateStore.load().catch(() => {});
  },
  { immediate: true },
);

function reload() {
  templateStore.load(true).catch(() => {});
}

function select(key) {
  emit('update:template', key);
}

/** Warna kartu contoh memakai palette dari database (bukan salinan di frontend). */
function thumbStyle(t) {
  const palette = t.palette || {};
  return {
    background: palette.bg || 'var(--bg-inset, rgba(255, 255, 255, 0.05))',
    color: palette.ink || 'var(--text-main, #ffffff)',
    '--tpl-accent': palette.accent || 'var(--brand-blue, #0055ff)',
  };
}

const ASPECT_LABELS = {
  portrait: 'Feed Potret 4:5',
  square: 'Feed Persegi 1:1',
  story: 'Story 9:16',
};

const CATEGORY_LABELS = {
  classic: 'Klasik',
  campus: 'Kampus',
  playful: 'Playful',
  editorial: 'Editorial',
};

function aspectLabel(t) {
  return ASPECT_LABELS[t.aspect] || 'Feed Potret 4:5';
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
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

/* ---- thumbnail kartu ---- */
.template-thumb {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 9px;
  border-radius: 9px;
  overflow: hidden;
}

.template-thumb__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background: var(--tpl-accent, currentColor);
  opacity: 0.9;
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
  background: var(--tpl-accent, currentColor);
  opacity: 0.75;
}

/* ---- state memuat / gagal ---- */
.template-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.65));
  font-size: 13px;
  text-align: center;
}

.template-state.is-error {
  flex-direction: column;
  color: var(--danger-text, #ff8b8b);
}

.spin {
  animation: template-spin 0.8s linear infinite;
}

@keyframes template-spin {
  to {
    transform: rotate(360deg);
  }
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

@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 92vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 14px;
  }

  .modal-body {
    padding: 10px 12px 16px;
  }

  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }

  .template-card {
    padding: 8px;
    gap: 8px;
  }

  .template-card__desc {
    font-size: 10.5px;
  }
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
