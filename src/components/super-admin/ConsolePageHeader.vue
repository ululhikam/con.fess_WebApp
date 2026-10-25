<template>
  <header class="pc-page-head">
    <div>
      <p v-if="eyebrow" class="pc-eyebrow">{{ eyebrow }}</p>
      <h1 class="pc-page-title">{{ title }}</h1>
      <p v-if="subtitle" class="pc-page-sub">{{ subtitle }}</p>
      <slot />
    </div>

    <div class="pc-page-actions">
      <span v-if="health" class="pc-badge" :class="`pc-badge--${healthTone}`">
        <Activity :size="11" aria-hidden="true" />
        {{ health }}
      </span>
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { Activity } from 'lucide-vue-next';

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  health: { type: String, default: '' },
  healthTone: { type: String, default: 'success' },
});
</script>
