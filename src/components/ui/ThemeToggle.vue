<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
    :title="isDark ? 'Mode terang' : 'Mode gelap'"
    :aria-pressed="isDark"
    @click="toggle"
  >
    <span class="theme-toggle__track" aria-hidden="true">
      <span class="theme-toggle__thumb">
        <Sun v-if="isDark" :size="12" :stroke-width="2.5" />
        <Moon v-else :size="12" :stroke-width="2.5" />
      </span>
    </span>

    <span v-if="label" class="theme-toggle__label" aria-hidden="true">
      {{ isDark ? 'Terang' : 'Gelap' }}
    </span>
  </button>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '../../composables/useTheme';

defineProps({
  /** Show the text label next to the switch. */
  label: { type: Boolean, default: false },
});

const { isDark, toggle } = useTheme();
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
}

.theme-toggle__track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: var(--radius-pill);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle:hover .theme-toggle__track,
.theme-toggle:focus-visible .theme-toggle__track {
  border-color: var(--neon-blue);
}

.theme-toggle__thumb {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neon-blue);
  color: var(--text-on-accent);
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.2s ease;
}

/* Thumb slides to the right in light mode + switches to a sun-like amber. */
[data-theme='light'] .theme-toggle__thumb {
  transform: translate(18px, -50%);
  background: var(--warning);
  color: var(--text-main);
}

.theme-toggle__label {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .theme-toggle__label {
    display: none;
  }
}
</style>
