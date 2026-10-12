<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        <header class="modal-header">
          <div class="modal-title-wrap">
            <Quote :size="18" class="text-accent" />
            <h2 id="quote-modal-title" class="modal-title">Kutip Fess Orang Lain</h2>
          </div>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <p class="modal-hint">
            Pilih confession yang ingin kamu tanggapi atau kutip ke dalam postinganmu.
          </p>

          <div class="quote-search-bar">
            <Search :size="17" class="search-ico" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari fess atau handle (@codememfess, [code])..."
              class="quote-search-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="btn-clear-search"
              @click="searchQuery = ''"
            >
              <X :size="14" />
            </button>
          </div>

          <div class="quote-options-list">
            <!-- Clear Quote Option -->
            <button
              type="button"
              class="quote-item quote-item--empty"
              :class="{ selected: !selectedQuote }"
              @click="selectQuote(null)"
            >
              <span class="quote-empty-label">Tanpa kutipan (Hapus kutipan aktif)</span>
              <Check v-if="!selectedQuote" :size="16" class="quote-check-icon" />
            </button>

            <!-- List of Confessions to Quote -->
            <button
              v-for="post in filteredFesses"
              :key="post.id"
              type="button"
              class="quote-item"
              :class="{ selected: selectedQuote?.id === post.id }"
              @click="selectQuote(post)"
            >
              <div class="quote-item-head">
                <div class="quote-avatar" :style="{ background: post.avatarBg || '#0038FF' }">
                  <span>{{ post.avatarText || (post.handle ? post.handle.slice(1, 3).toUpperCase() : 'QF') }}</span>
                </div>
                <div class="quote-meta">
                  <span class="quote-handle">{{ post.handle || post.senderHandle }}</span>
                  <span class="quote-time">• {{ post.time }}</span>
                </div>
                <span v-if="post.tag" class="quote-tag-chip">{{ post.tag }}</span>
                <Check v-if="selectedQuote?.id === post.id" :size="16" class="quote-check-icon" />
              </div>
              <p class="quote-snippet">{{ post.content }}</p>
            </button>

            <div v-if="filteredFesses.length === 0" class="quote-empty-state">
              <p>Tidak ada confession yang cocok dengan pencarian.</p>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="close">
            Batal
          </button>
          <button type="button" class="btn-modal-confirm" @click="confirm">
            Terapkan
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * QuoteModal.vue — Dialog picker for selecting another user's confession to quote.
 * Strictly adheres to dark neutral theme tokens, zero emojis, Lucide SVG icons.
 */
import { ref, computed, watch } from 'vue';
import { X, Search, Check, Quote } from 'lucide-vue-next';
import { FEED_POSTS, DUMMY_MENFESS_POSTS } from '../../data/mockPosts';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:show', 'update:modelValue']);

const searchQuery = ref('');
const selectedQuote = ref(null);

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      selectedQuote.value = props.modelValue;
      searchQuery.value = '';
    }
  },
  { immediate: true }
);

// All candidates available to quote
const candidates = computed(() => {
  const map = new Map();
  [...DUMMY_MENFESS_POSTS, ...FEED_POSTS].forEach((p) => {
    if (!map.has(p.id)) {
      map.set(p.id, p);
    }
  });
  return Array.from(map.values());
});

const filteredFesses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return candidates.value;
  return candidates.value.filter(
    (p) =>
      p.content.toLowerCase().includes(q) ||
      (p.handle && p.handle.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
  );
});

function selectQuote(quote) {
  selectedQuote.value = quote;
}

function close() {
  emit('update:show', false);
}

function confirm() {
  emit('update:modelValue', selectedQuote.value);
  emit('update:show', false);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: var(--shell-card);
  border: 1px solid var(--shell-border-strong);
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--shell-border);
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-accent {
  color: var(--shell-sub-accent, #60a5fa);
}

.modal-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--shell-text);
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background 0.15s ease;
}

.modal-close:hover {
  color: var(--shell-text);
  background: var(--shell-chip);
}

.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-hint {
  font-size: 13px;
  color: var(--shell-text-muted);
  margin: 0;
  line-height: 1.45;
}

.quote-search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-ico {
  position: absolute;
  left: 14px;
  color: var(--shell-text-muted);
  pointer-events: none;
}

.quote-search-input {
  width: 100%;
  background: var(--shell-bg);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 11px 40px 11px 40px;
  font-size: 13.5px;
  color: var(--shell-text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.quote-search-input:focus {
  border-color: var(--shell-sub-accent, #60a5fa);
}

.btn-clear-search {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.quote-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.quote-item {
  background: var(--shell-bg);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.quote-item:hover {
  border-color: var(--shell-border-strong);
  background: rgba(255, 255, 255, 0.03);
}

.quote-item.selected {
  border-color: var(--shell-sub-accent, #60a5fa);
  background: rgba(96, 165, 250, 0.06);
}

.quote-item--empty {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
}

.quote-empty-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.quote-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quote-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.quote-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.quote-handle {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text);
}

.quote-time {
  font-size: 11.5px;
  color: var(--shell-text-muted);
}

.quote-tag-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--shell-text);
}

.quote-check-icon {
  color: var(--shell-sub-accent, #60a5fa);
  margin-left: auto;
}

.quote-snippet {
  font-size: 13px;
  line-height: 1.45;
  color: var(--shell-text-sub);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quote-empty-state {
  text-align: center;
  padding: 24px 12px;
  color: var(--shell-text-muted);
  font-size: 13px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 22px;
  border-top: 1px solid var(--shell-border);
}

.btn-modal-cancel {
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-modal-cancel:hover {
  background: var(--shell-chip);
}

.btn-modal-confirm {
  background: var(--shell-text);
  border: none;
  color: var(--shell-bg);
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-modal-confirm:hover {
  opacity: 0.9;
}
</style>
