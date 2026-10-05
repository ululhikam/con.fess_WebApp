<template>
  <button type="button" :class="['profile-btn', `profile-btn--${variant}`, `profile-btn--${size}`]">
    <slot />
  </button>
</template>

<script setup>
/**
 * ProfileButton — the pill buttons used across the profile screen
 * (lime primary, blue secondary, grey neutral).
 * It renders no label of its own: callers pass the text/icons as slot content.
 * Click listeners fall through to the native button.
 */
defineProps({
  variant: {
    type: String,
    default: 'lime',
    validator: (v) => ['lime', 'blue', 'gray'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v),
  },
});
</script>

<style scoped>
.profile-btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 800;
  font-size: 13px;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.profile-btn--gray {
  background: var(--border-subtle);
  color: var(--text-secondary);
  font-weight: 700;
  padding: 10px 20px;
}

.profile-btn--sm {
  padding: 8px 20px;
  font-size: 12px;
}

.profile-btn--lime {
  background: var(--lime-primary);
  color: var(--lime-ink);
  box-shadow: 0 4px 12px var(--lime-glow);
}

.profile-btn--blue {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  box-shadow: 0 4px 12px var(--neon-blue-glow);
}

.profile-btn--lime:hover,
.profile-btn--blue:hover {
  transform: scale(1.04);
}

.profile-btn--gray:hover {
  filter: brightness(1.08);
}

@media (max-width: 768px) {
  .profile-btn,
  .profile-btn--sm,
  .profile-btn--gray {
    width: 100%;
    text-align: center;
    padding: 10px 16px;
  }
}
</style>
