<template>
  <div class="admin-fess-card-wrapper">
    <FessCard v-bind="$props" :is-admin="true" v-on="$attrs" />

    <div v-if="isAdmin && showIgActions" class="admin-ig-actions">
      <button
        type="button"
        class="admin-ig-btn admin-ig-btn--manual"
        title="Post IG Manual"
        aria-label="Post IG Manual"
        @click="$emit('manual-ig-post', post.id)"
      >
        <Instagram :size="12" />
        <span>Post IG Manual</span>
      </button>

      <button
        type="button"
        class="admin-ig-btn admin-ig-btn--retry"
        title="Retry Auto-Post IG"
        aria-label="Retry Auto-Post IG"
        @click="$emit('retry-ig-post', post.id)"
      >
        <RotateCcw :size="12" />
        <span>Retry Auto-Post</span>
      </button>

      <button
        type="button"
        class="admin-ig-btn admin-ig-btn--copy"
        title="Salin Teks Fess"
        aria-label="Salin Teks Fess"
        @click="copyFessText"
      >
        <Copy :size="12" />
        <span>Salin</span>
      </button>

      <button
        type="button"
        class="admin-ig-btn admin-ig-btn--save"
        title="Simpan Card Fess"
        aria-label="Simpan Card Fess"
        @click="saveFessCard"
      >
        <Download :size="12" />
        <span>Simpan Card</span>
      </button>
    </div>

    <button
      v-if="isAdmin"
      type="button"
      class="btn-view-reports"
      title="Lihat dan kelola laporan fess ini"
      aria-label="Lihat dan kelola laporan fess ini"
      @click="$emit('view-reports', post.id)"
    >
      <Flag :size="13" />
      <span>Laporan</span>
    </button>
  </div>
</template>

<script setup>
/**
 * AdminFessCard.vue — Aliased wrapper to unified FessCard component.
 * Automatically enables admin moderation actions (Setujui / Tolak).
 * Tambahan: tindakan "Lihat Laporan" untuk mengelola laporan fess.
 * Tambahan: aksi IG (Manual Post, Retry Auto-Post, Salin, Simpan Card) untuk fess yang gagal/belum post IG.
 */
import { computed } from 'vue';
import FessCard from '../common/FessCard.vue';
import { toast } from '../../composables/useToast';
import { Flag, Instagram, RotateCcw, Copy, Download } from 'lucide-vue-next';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'view-reports',
  'manual-ig-post',
  'retry-ig-post',
  'save-card',
]);

// Show IG action buttons when: auto-post failed OR not posted yet (and has IG connection)
const showIgActions = computed(() => {
  const p = props.post;
  if (!p) return false;
  // Show if auto-post failed
  if (p.igStatus === 'failed') return true;
  // Show if not posted to IG yet but base has IG connected
  if (!p.postedToIg && p.canManageInstagram) return true;
  return false;
});

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

async function saveFessCard() {
  // Render card ditangani parent lewat event (butuh panggilan API + auth).
  emit('save-card', props.post.id);
}
</script>

<style scoped>
.admin-fess-card-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.admin-ig-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--shell-border);
}

.admin-ig-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--shell-border);
  border-radius: 6px;
  background: var(--shell-bg);
  color: var(--shell-text);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.admin-ig-btn:hover {
  border-color: var(--shell-text-muted);
  background: var(--shell-chip);
}

.admin-ig-btn--manual {
  border-color: var(--shell-sub-accent);
  color: var(--shell-sub-accent);
}

.admin-ig-btn--manual:hover {
  background: var(--shell-sub-accent);
  color: white;
  border-color: var(--shell-sub-accent);
}

.admin-ig-btn--retry {
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.admin-ig-btn--retry:hover {
  background: var(--brand-blue);
  color: white;
  border-color: var(--brand-blue);
}

.admin-ig-btn--copy {
  border-color: var(--shell-text-muted);
}

.admin-ig-btn--save {
  border-color: var(--shell-text-muted);
}

.btn-view-reports {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid var(--shell-border);
  border-radius: 8px;
  background: var(--shell-bg);
  color: var(--shell-text);
  cursor: pointer;
}

.btn-view-reports:hover {
  border-color: var(--shell-text-muted);
  background: var(--shell-chip);
}
</style>