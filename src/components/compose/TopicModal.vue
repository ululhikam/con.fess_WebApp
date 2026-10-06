<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-modal-title"
      >
        <header class="modal-header">
          <h2 id="topic-modal-title" class="modal-title">Pilih Topik</h2>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="topic-search">
            <Search :size="18" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari topik..."
              class="topic-search__input"
            />
          </div>

          <div class="topic-list">
            <button
              type="button"
              class="topic-item"
              :class="{ selected: !topic }"
              @click="selectTopic('')"
            >
              <span class="topic-item__label">Tanpa topik</span>
              <Check :size="16" v-if="!topic" class="topic-item__check" />
            </button>

            <div v-for="t in filteredTopics" :key="t.id" class="topic-divider">
              <span class="topic-category">{{ t.category }}</span>
            </div>

            <button
              v-for="t in filteredTopics"
              :key="t.id"
              type="button"
              class="topic-item"
              :class="{ selected: topic === t.id }"
              @click="selectTopic(t.id)"
            >
              <span class="topic-item__icon" :style="{ backgroundColor: t.color }">
                <component :is="t.icon" :size="16" />
              </span>
              <span class="topic-item__label">{{ t.label }}</span>
              <Check :size="16" v-if="topic === t.id" class="topic-item__check" />
            </button>

            <div v-if="filteredTopics.length === 0" class="topic-empty">Topik tidak ditemukan</div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn-primary" @click="confirm">Selesai</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X, Check, Search } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  topic: { type: String, default: '' },
  topics: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:show', 'update:topic']);

const searchQuery = ref('');

const filteredTopics = computed(() => {
  if (!searchQuery.value) return props.topics;
  const q = searchQuery.value.toLowerCase();
  return props.topics.filter(
    (t) => t.label.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
  );
});

function selectTopic(id) {
  emit('update:topic', id);
}

function confirm() {
  emit('update:show', false);
}

function close() {
  emit('update:show', false);
}

watch(
  () => props.show,
  (val) => {
    if (val) searchQuery.value = '';
  },
);
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px var(--shadow-color);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  padding: 16px 20px;
}

.topic-search {
  position: relative;
  margin-bottom: 16px;
}

.topic-search__input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
}

.topic-search__input:focus {
  border-color: var(--brand-blue);
}

.topic-search .lucide {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-divider {
  margin-top: 8px;
}

.topic-category {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  padding: 8px 0 4px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.topic-item:hover {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
}

.topic-item.selected {
  background: var(--shell-chip);
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.topic-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--text-on-accent);
  flex-shrink: 0;
}

.topic-item__label {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
}

.topic-item__check {
  color: var(--brand-blue);
  flex-shrink: 0;
}

.topic-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
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
  transition: all 0.2s ease;
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

/* Transition */
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
