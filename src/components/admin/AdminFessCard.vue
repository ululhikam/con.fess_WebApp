<template>
  <div class="admin-fess-card-wrapper">
    <!-- Toolbar admin: satu tombol titik-3, semua aksi masuk dropdown -->
    <div v-if="isAdmin" ref="toolbarRef" class="admin-card-toolbar">
      <button
        type="button"
        class="admin-kebab-btn"
        :class="{ 'is-open': menuOpen }"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        aria-label="Aksi admin untuk fess ini"
        title="Aksi admin"
        @click.stop="toggleMenu"
      >
        <MoreHorizontal :size="18" />
      </button>

      <Transition name="admin-menu">
        <div v-if="menuOpen" class="admin-card-menu" role="menu" aria-label="Aksi admin">
          <button type="button" role="menuitem" class="admin-menu-item" @click="runAction(saveFessCard)">
            <Download :size="14" />
            <span>Simpan Card</span>
          </button>

          <button type="button" role="menuitem" class="admin-menu-item" @click="runAction(copyFessText)">
            <Copy :size="14" />
            <span>Salin Teks Fess</span>
          </button>

          <!-- Aksi IG hanya relevan saat auto-post GAGAL -->
          <template v-if="autoPostFailed">
            <div class="admin-menu-divider" role="separator" />
            <button
              type="button"
              role="menuitem"
              class="admin-menu-item admin-menu-item--warn"
              @click="runAction(() => emit('manual-ig-post', post.id))"
            >
              <Instagram :size="14" />
              <span>Post IG Manual</span>
            </button>
            <button
              type="button"
              role="menuitem"
              class="admin-menu-item admin-menu-item--primary"
              @click="runAction(() => emit('retry-ig-post', post.id))"
            >
              <RotateCcw :size="14" />
              <span>Retry Auto-Post</span>
            </button>
          </template>

          <!-- Kelola laporan hanya di tab Laporan -->
          <template v-if="showReportAction">
            <div class="admin-menu-divider" role="separator" />
            <button
              type="button"
              role="menuitem"
              class="admin-menu-item"
              @click="runAction(() => emit('view-reports', post.id))"
            >
              <Flag :size="14" />
              <span>Lihat Laporan</span>
            </button>
          </template>
        </div>
      </Transition>
    </div>

    <FessCard v-bind="$attrs" :post="post" :is-admin="true" hide-ig-action />
  </div>
</template>

<script setup>
/**
 * AdminFessCard.vue — wrapper FessCard untuk Base Admin.
 *
 * Semua aksi admin (simpan card, salin teks, post IG manual, retry auto-post,
 * lihat laporan) diringkas dalam satu menu titik-3 agar kartu tetap bersih.
 *
 * Aturan tampil:
 *  - "Post IG Manual" & "Retry Auto-Post" hanya saat auto-post GAGAL
 *    (igStatus === 'failed' dan belum terbit ke IG) — bukan saat masih diproses.
 *  - "Lihat Laporan" hanya saat kartu dibuka dari tab Laporan (prop
 *    showReportAction), bukan di semua tab.
 */
import { computed, onBeforeUnmount, ref } from 'vue';
import FessCard from '../common/FessCard.vue';
import { toast } from '../../composables/useToast';
import {
  Copy,
  Download,
  Flag,
  Instagram,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-vue-next';

// Listener & attribute dari parent diteruskan manual ke FessCard,
// jadi matikan pewarisan otomatis agar tidak dobel di wrapper.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  /** Tampilkan aksi "Lihat Laporan" (dipakai di tab Laporan). */
  showReportAction: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'view-reports',
  'manual-ig-post',
  'retry-ig-post',
  'save-card',
]);

const menuOpen = ref(false);
const toolbarRef = ref(null);

/** Auto-post dianggap gagal hanya bila status failed dan belum terbit ke IG. */
const autoPostFailed = computed(() => {
  const p = props.post;
  if (!p || p.postedToIg) return false;
  return p.igStatus === 'failed';
});

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true);
    document.addEventListener('keydown', onDocumentKeyDown);
  } else {
    detachListeners();
  }
}

function closeMenu() {
  menuOpen.value = false;
  detachListeners();
}

function detachListeners() {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
  document.removeEventListener('keydown', onDocumentKeyDown);
}

function onDocumentPointerDown(event) {
  if (!toolbarRef.value?.contains(event.target)) closeMenu();
}

function onDocumentKeyDown(event) {
  if (event.key === 'Escape') closeMenu();
}

function runAction(action) {
  closeMenu();
  action();
}

async function copyFessText() {
  const text = props.post?.content || '';
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Teks fess disalin!');
  } catch {
    toast.error('Gagal menyalin teks.');
  }
}

function saveFessCard() {
  // Render card ditangani parent (butuh API + auth).
  emit('save-card', props.post.id);
}

onBeforeUnmount(detachListeners);
</script>

<style scoped>
.admin-fess-card-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Toolbar tipis di atas kartu, hanya berisi satu tombol titik-3. */
.admin-card-toolbar {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 24px;
  margin-bottom: 2px;
}

.admin-kebab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 26px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.admin-kebab-btn:hover,
.admin-kebab-btn.is-open {
  background: var(--shell-chip);
  border-color: var(--shell-border);
  color: var(--shell-text);
}

.admin-kebab-btn:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: 2px;
}

.admin-card-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 40;
  min-width: 208px;
  padding: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-raised);
  box-shadow: 0 14px 32px var(--shadow-color);
}

.admin-menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-main);
  font-size: 12.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.admin-menu-item:hover {
  background: var(--shell-chip);
}

.admin-menu-item:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: -2px;
}

.admin-menu-item--warn {
  color: var(--warning, #f59e0b);
}

.admin-menu-item--primary {
  color: var(--brand-blue);
}

.admin-menu-divider {
  height: 1px;
  margin: 5px 6px;
  background: var(--border-subtle);
}

.admin-menu-enter-active,
.admin-menu-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.admin-menu-enter-from,
.admin-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .admin-menu-enter-active,
  .admin-menu-leave-active {
    transition: none;
  }
}
</style>