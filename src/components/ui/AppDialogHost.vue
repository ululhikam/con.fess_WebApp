<template>
  <Teleport to="body">
    <Transition name="app-dialog-fade">
      <div
        v-if="current"
        class="app-dialog-overlay"
        role="presentation"
        @click.self="handleBackdropClick"
      >
        <div
          class="app-dialog-card"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
        >
          <div class="app-dialog-icon" :class="`is-${current.variant}`" aria-hidden="true">
            <component :is="iconFor" :size="26" />
          </div>

          <h2 :id="titleId" class="app-dialog-title">{{ current.title }}</h2>
          <p :id="messageId" class="app-dialog-message">{{ current.message }}</p>
          <p v-if="current.detail" class="app-dialog-detail">{{ current.detail }}</p>

          <div class="app-dialog-actions">
            <button
              v-if="current.kind === 'confirm'"
              type="button"
              class="app-dialog-btn is-secondary"
              @click="cancel"
            >
              {{ current.cancelLabel }}
            </button>
            <button
              ref="confirmButton"
              type="button"
              class="app-dialog-btn"
              :class="current.variant === 'danger' ? 'is-danger' : 'is-primary'"
              @click="accept"
            >
              {{ current.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * AppDialogHost — host tunggal untuk dialog global bertema aplikasi
 * (pengganti alert()/confirm() bawaan browser). Dipasang sekali di App.vue;
 * kontennya diarahkan oleh <useAppDialog>.
 *
 * Fitur aksesibilitas:
 *  • role="alertdialog" + aria-modal + aria-labelledby/describedby
 *  • fokus otomatis pindah ke tombol utama saat dialog muncul
 *  • Esc = pilihan netral (confirm dianggap batal, alert ditutup)
 *  • klik backdrop = sama dengan Esc
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-vue-next';
import { useAppDialogHost } from '../../composables/useAppDialog';

const { current, settle } = useAppDialogHost();

const confirmButton = ref(null);
const titleId = 'app-dialog-title';
const messageId = 'app-dialog-message';

const iconFor = computed(() => {
  switch (current.value?.variant) {
    case 'danger':
      return ShieldAlert;
    case 'warning':
      return AlertTriangle;
    case 'success':
      return CheckCircle2;
    default:
      return Info;
  }
});

function accept() {
  settle(true);
}

function cancel() {
  settle(false);
}

/** Klik backdrop: confirm dianggap batal; alert sekadar ditutup. */
function handleBackdropClick() {
  settle(current.value?.kind === 'alert');
}

function onKeydown(event) {
  if (!current.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    handleBackdropClick();
  }
}

watch(current, async (dialog) => {
  if (!dialog) return;
  await nextTick();
  confirmButton.value?.focus();
});

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.app-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  /* Di atas seluruh modal/drawer aplikasi (modal umum: 1000–2000). */
  z-index: 3000;
}

.app-dialog-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 24px 22px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 24px 48px var(--shadow-color);
  transition: transform 0.18s ease;
}

/* ---------- ikon & varian ---------- */
.app-dialog-icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.app-dialog-icon.is-info {
  background: rgba(0, 85, 255, 0.12);
  color: var(--brand-blue);
}

.app-dialog-icon.is-success {
  background: rgba(34, 197, 94, 0.14);
  color: #22c55e;
}

.app-dialog-icon.is-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.app-dialog-icon.is-danger {
  background: rgba(239, 68, 68, 0.14);
  color: var(--danger);
}

/* ---------- teks ---------- */
.app-dialog-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-main);
}

.app-dialog-message {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.app-dialog-detail {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--text-muted);
}

/* ---------- tombol ---------- */
.app-dialog-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
}

.app-dialog-btn {
  flex: 1;
  padding: 11px 18px;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.app-dialog-btn:active {
  transform: scale(0.98);
}

.app-dialog-btn.is-primary {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.app-dialog-btn.is-primary:hover {
  box-shadow: 0 4px 14px var(--neon-blue-glow);
}

.app-dialog-btn.is-danger {
  background: var(--danger);
  color: #fff;
}

.app-dialog-btn.is-danger:hover {
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.app-dialog-btn.is-secondary {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.app-dialog-btn.is-secondary:hover {
  background: var(--bg-inset);
  border-color: var(--border-strong);
}

.app-dialog-btn:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: 2px;
}

/* ---------- transisi ---------- */
.app-dialog-fade-enter-active,
.app-dialog-fade-leave-active {
  transition: opacity 0.18s ease;
}

.app-dialog-fade-enter-from,
.app-dialog-fade-leave-to {
  opacity: 0;
}

.app-dialog-fade-enter-from .app-dialog-card,
.app-dialog-fade-leave-to .app-dialog-card {
  transform: translateY(14px) scale(0.97);
}
</style>
