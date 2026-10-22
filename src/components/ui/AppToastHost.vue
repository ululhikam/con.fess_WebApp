<template>
  <Teleport to="body">
    <div class="app-toast-viewport" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="app-toast">
        <div
          v-for="item in toastItems"
          :key="item.id"
          class="app-toast"
          :class="`is-${item.type}`"
          role="status"
        >
          <span class="app-toast-icon" aria-hidden="true">
            <component
              :is="iconFor(item.type)"
              :size="17"
              :class="{ 'is-spinning': item.type === 'pending' }"
            />
          </span>

          <p class="app-toast-message">{{ item.message }}</p>

          <button
            type="button"
            class="app-toast-close"
            aria-label="Tutup notifikasi"
            @click="toast.dismiss(item.id)"
          >
            <X :size="14" />
          </button>

          <span
            v-if="item.duration"
            class="app-toast-progress"
            :style="{ animationDuration: `${item.duration}ms` }"
            aria-hidden="true"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-vue-next';
import { toast, toastItems } from '../../composables/useToast';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Loader2,
};

function iconFor(type) {
  return ICONS[type] || CheckCircle2;
}
</script>

<style scoped>
.app-toast-viewport {
  position: fixed;
  top: calc(14px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 5000;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  width: min(460px, calc(100vw - 32px));
  pointer-events: none;
}

.app-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--bg-raised);
  color: var(--text-main);
  box-shadow: 0 10px 24px var(--shadow-color);
  pointer-events: auto;
}

.app-toast-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  margin-top: 2px;
  border-radius: 50%;
}

.app-toast.is-success .app-toast-icon {
  background: rgba(34, 197, 94, 0.10);
  color: var(--success-text);
}

.app-toast.is-error .app-toast-icon {
  background: rgba(239, 68, 68, 0.10);
  color: var(--danger-text);
}

.app-toast.is-warning .app-toast-icon {
  background: rgba(245, 158, 11, 0.10);
  color: var(--warning-text);
}

.app-toast.is-info .app-toast-icon {
  background: rgba(0, 56, 255, 0.08);
  color: var(--brand-blue);
}

.app-toast.is-pending .app-toast-icon {
  background: rgba(245, 158, 11, 0.10);
  color: var(--warning-text);
}

.app-toast-message {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-main);
  overflow-wrap: anywhere;
}

.app-toast-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  margin-top: 2px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.app-toast-close:hover {
  background: var(--bg-inset);
  color: var(--text-main);
}

.app-toast-close:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: 1px;
}

.app-toast-progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  transform-origin: left;
  background: currentColor;
  opacity: 0.25;
  animation: app-toast-countdown linear forwards;
}

.app-toast.is-success .app-toast-progress {
  color: var(--success-text);
}

.app-toast.is-error .app-toast-progress {
  color: var(--danger-text);
}

.app-toast.is-warning .app-toast-progress,
.app-toast.is-pending .app-toast-progress {
  color: var(--warning-text);
}

.app-toast.is-info .app-toast-progress {
  color: var(--brand-blue);
}

.is-spinning {
  animation: app-toast-spin 0.9s linear infinite;
}

@keyframes app-toast-countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@keyframes app-toast-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.app-toast-move {
  transition: transform 0.24s ease;
}

@media (max-width: 480px) {
  .app-toast-viewport {
    top: calc(10px + env(safe-area-inset-top, 0px));
    width: calc(100vw - 24px);
  }

  .app-toast {
    padding: 9px 12px;
  }

  .app-toast-message {
    font-size: 12.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-toast-enter-active,
  .app-toast-leave-active,
  .app-toast-move {
    transition-duration: 0.01ms;
  }

  .app-toast-progress {
    animation: none;
    opacity: 0.3;
  }

  .is-spinning {
    animation-duration: 2.4s;
  }
}
</style>
