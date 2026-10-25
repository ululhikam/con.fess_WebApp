<template>
  <Teleport to="body">
    <Transition name="pc-drawer">
      <div
        v-if="modelValue"
        class="pc-drawer-backdrop"
        role="presentation"
        @click.self="requestClose"
      >
        <aside
          class="pc-drawer"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="pc-drawer__head">
            <div>
              <p v-if="eyebrow" class="pc-drawer__eyebrow">{{ eyebrow }}</p>
              <h2 :id="titleId" class="pc-drawer__title">{{ title }}</h2>
              <p v-if="subtitle" class="pc-drawer__sub">{{ subtitle }}</p>
            </div>
            <div class="pc-inline">
              <slot name="head-actions" />
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--icon pc-btn--sm"
                aria-label="Tutup panel"
                @click="requestClose"
              >
                <X :size="15" />
              </button>
            </div>
          </header>

          <div class="pc-drawer__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="pc-drawer__foot">
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'close']);
const titleId = 'pc-drawer-title';
let previousOverflow = '';

function requestClose() {
  if (!props.closeOnBackdrop) return;
  emit('update:modelValue', false);
  emit('close');
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) requestClose();
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow || '';
    }
  },
  { immediate: true }
);

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (typeof document !== 'undefined') document.body.style.overflow = previousOverflow || '';
});
</script>
