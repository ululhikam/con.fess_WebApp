<template>
  <div class="admin-fess-card-wrapper">
    <FessCard
      ref="fessCardRef"
      v-bind="$attrs"
      :post="post"
      :is-admin="true"
      hide-ig-action
      @take-down="$emit('take-down', $event)"
    >
      <!-- Tombol titik-3 menempel di header kartu (menggantikan ikon
           take down & laporkan yang kini masuk ke dropdown). -->
      <template #headerActions>
        <div ref="menuAnchorRef" class="admin-card-menu-anchor">
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
            <MoreHorizontal :size="16" />
          </button>

          <Transition name="admin-menu">
            <div
              v-if="menuOpen"
              class="admin-card-menu"
              role="menu"
              aria-label="Aksi admin"
              @click.stop
            >
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

              <div class="admin-menu-divider" role="separator" />

              <button type="button" role="menuitem" class="admin-menu-item" @click="runAction(openReportModal)">
                <Flag :size="14" />
                <span>Laporkan Fess</span>
              </button>

              <template v-if="canTakeDown">
                <button
                  type="button"
                  role="menuitem"
                  class="admin-menu-item admin-menu-item--danger"
                  @click="runAction(() => emit('take-down', post.id))"
                >
                  <Trash2 :size="14" />
                  <span>Hapus Fess</span>
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </template>
    </FessCard>
  </div>
</template>

<script setup>
/**
 * AdminFessCard.vue — wrapper FessCard untuk Base Admin.
 *
 * Semua aksi admin diringkas dalam satu menu titik-3 yang menempel di header
 * kartu: Simpan Card, Salin Teks, Post IG Manual, Retry Auto-Post, Lihat
 * Laporan, Laporkan Fess, dan Hapus Fess. Tombol take down & laporkan bawaan
 * FessCard digantikan oleh menu ini lewat slot `headerActions`.
 *
 * Aturan tampil:
 *  - "Post IG Manual" & "Retry Auto-Post" hanya saat auto-post GAGAL
 *    (igStatus === 'failed' dan belum terbit ke IG) — bukan saat masih diproses.
 *  - "Lihat Laporan" hanya saat kartu dibuka dari tab Laporan (prop
 *    showReportAction), bukan di semua tab.
 *  - "Hapus Fess" hanya untuk fess yang sudah terbit (status approved).
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
  Trash2,
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
  'take-down',
]);

const menuOpen = ref(false);
const menuAnchorRef = ref(null);
const fessCardRef = ref(null);

/** Auto-post dianggap gagal hanya bila status failed dan belum terbit ke IG. */
const autoPostFailed = computed(() => {
  const p = props.post;
  if (!p || p.postedToIg) return false;
  return p.igStatus === 'failed';
});

/** Hapus fess hanya relevan untuk fess yang sudah terbit. */
const canTakeDown = computed(() => props.post?.status === 'approved');

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
  if (!menuAnchorRef.value?.contains(event.target)) closeMenu();
}

function onDocumentKeyDown(event) {
  if (event.key === 'Escape') closeMenu();
}

function runAction(action) {
  closeMenu();
  action();
}

function openReportModal() {
  fessCardRef.value?.openReportModal();
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

/* Anchor menu: menempel pada grup aksi kanan header kartu. */
.admin-card-menu-anchor {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.admin-kebab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
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
  top: calc(100% + 6px);
  right: 0;
  z-index: 60;
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

.admin-menu-item--danger {
  color: #f87171;
}

.admin-menu-item--danger:hover {
  background: rgba(239, 68, 68, 0.12);
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