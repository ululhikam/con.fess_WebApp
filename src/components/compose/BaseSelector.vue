<template>
  <div class="base-selector">
    <label class="base-selector__label" for="base-select">Base Fess</label>
    <div
      class="base-selector__trigger"
      @click="open = true"
      :aria-expanded="open"
      role="combobox"
      aria-controls="base-list"
      aria-label="Pilih base fess"
    >
      <div class="base-selector__preview">
        <span
          class="base-selector__avatar"
          :style="{ backgroundColor: selectedBase?.color }"
          v-if="selectedBase"
        >
          {{ selectedBase.avatar }}
        </span>
        <span class="base-selector__avatar placeholder" v-else>
          <MessageSquare :size="16" />
        </span>
        <div class="base-selector__info">
          <span class="base-selector__handle">{{ selectedBase?.handle || 'Pilih base fess' }}</span>
          <span class="base-selector__name" v-if="selectedBase">{{ selectedBase.name }}</span>
        </div>
      </div>
      <ChevronDown :size="18" class="base-selector__chevron" :class="{ rotated: open }" />
    </div>

    <transition name="fade">
      <div
        v-if="open"
        class="base-selector__dropdown"
        role="listbox"
        id="base-list"
        aria-label="Daftar base fess"
      >
        <div class="base-selector__search">
          <Search :size="18" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari base..."
            class="base-selector__search-input"
            @click.stop
          />
        </div>
        <div class="base-selector__list" role="listbox">
          <button
            v-for="base in filteredBases"
            :key="base.handle"
            type="button"
            class="base-selector__item"
            :class="{ selected: modelValue === base.handle }"
            role="option"
            :aria-selected="modelValue === base.handle"
            @click="selectBase(base.handle)"
            @mousedown.prevent
          >
            <span class="base-selector__item-avatar" :style="{ backgroundColor: base.color }">
              {{ base.avatar }}
            </span>
            <div class="base-selector__item-info">
              <span class="base-selector__item-handle">{{ base.handle }}</span>
              <span class="base-selector__item-name">{{ base.name }}</span>
            </div>
            <Check :size="16" v-if="modelValue === base.handle" class="base-selector__check" />
          </button>
          <div v-if="filteredBases.length === 0" class="base-selector__empty">
            Base tidak ditemukan
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown, Search, Check, MessageSquare } from 'lucide-vue-next';

defineProps({
  modelValue: { type: String, default: '' },
  bases: { type: Array, default: () => [] },
});

defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const searchQuery = ref('');

const selectedBase = computed(() => props.bases.find((b) => b.handle === props.modelValue));

const filteredBases = computed(() => {
  if (!searchQuery.value) return props.bases;
  const q = searchQuery.value.toLowerCase();
  return props.bases.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.handle.toLowerCase().includes(q) ||
      (b.keyword && b.keyword.toLowerCase().includes(q)),
  );
});

function selectBase(handle) {
  emit('update:modelValue', handle);
  emit('change', handle);
  open.value = false;
}

// Close on outside click
document.addEventListener('click', handleOutsideClick);

function handleOutsideClick(e) {
  if (open.value && !e.target.closest('.base-selector')) {
    open.value = false;
  }
}
</script>

<style scoped>
.base-selector {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 12px 16px;
}

.base-selector__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.base-selector__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  padding: 4px 0;
}

.base-selector__preview {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.base-selector__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  color: var(--text-on-accent);
  flex-shrink: 0;
}

.base-selector__avatar.placeholder {
  background: var(--bg-inset);
  color: var(--text-muted);
}

.base-selector__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.base-selector__handle {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-selector__name {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-selector__chevron {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.base-selector__chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.base-selector__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 12px 32px var(--shadow-color);
  z-index: 100;
  overflow: hidden;
  max-height: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.base-selector__search {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.base-selector__search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
}

.base-selector__search-input:focus {
  border-color: var(--brand-blue);
}

.base-selector__search .lucide {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.base-selector__list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.base-selector__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.base-selector__item:hover {
  background: var(--bg-surface-2);
}

.base-selector__item.selected {
  background: var(--shell-chip);
}

.base-selector__item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  color: var(--text-on-accent);
  flex-shrink: 0;
}

.base-selector__item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.base-selector__item-handle {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-main);
}

.base-selector__item-name {
  font-size: 12px;
  color: var(--text-muted);
}

.base-selector__check {
  color: var(--brand-blue);
  flex-shrink: 0;
}

.base-selector__empty {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
