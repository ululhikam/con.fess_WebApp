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
          <p class="app-toast-message">{{ item.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { toastItems } from '../../composables/useToast';
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
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-inline: auto;
  padding: 10px 16px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 9999px;
  background: var(--bg-raised);
  color: var(--text-main);
  box-shadow: 0 10px 24px var(--shadow-color);
  pointer-events: auto;
  min-height: 44px;
}

html[data-theme='dark'] .app-toast {
  background: #ffffff;
  color: #111827;
  border-color: #e5e7eb;
}

html[data-theme='light'] .app-toast {
  background: #1f2937;
  color: #ffffff;
  border-color: #374151;
}

.app-toast-message {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  overflow-wrap: anywhere;
}

/* Animasi masuk: circle jatuh dari atas layar (tengah horizontal), lalu melebar ke kiri-kanan */
.app-toast-enter-from {
  opacity: 0;
  transform: translateY(-150%) scale(0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.app-toast-enter-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-radius 0.4s ease,
    width 0.4s ease,
    height 0.4s ease;
}

.app-toast-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  border-radius: 9999px;
  width: 100%;
  height: auto;
}

/* Animasi keluar */
.app-toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.app-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
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
}
</style>
