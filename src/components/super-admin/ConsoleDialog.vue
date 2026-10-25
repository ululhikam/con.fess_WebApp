<template>
  <Teleport to="body">
    <Transition name="pc-fade">
      <div
        v-if="modelValue"
        class="pc-modal-backdrop"
        role="presentation"
        @click.self="requestClose"
      >
        <form
          class="pc-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @submit.prevent="$emit('confirm')"
        >
          <header class="pc-modal__head">
            <div>
              <p v-if="eyebrow" class="pc-eyebrow">{{ eyebrow }}</p>
              <h2 :id="titleId" class="pc-modal__title">{{ title }}</h2>
              <p v-if="subtitle" class="pc-modal__sub">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--icon pc-btn--sm"
              aria-label="Tutup dialog"
              :disabled="loading"
              @click="requestClose"
            >
              <X :size="15" />
            </button>
          </header>

          <div class="pc-modal__body">
            <slot />
            <p v-if="error" class="pc-error-text" role="alert">{{ error }}</p>
          </div>

          <footer class="pc-modal__foot">
            <button
              type="button"
              class="pc-btn pc-btn--ghost"
              :disabled="loading"
              @click="requestClose"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="submit"
              class="pc-btn"
              :class="confirmClass"
              :disabled="loading || confirmDisabled"
            >
              <Loader2 v-if="loading" :size="14" class="pc-spin" />
              {{ loading ? loadingLabel : confirmLabel }}
            </button>
          </footer>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { Loader2, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Simpan' },
  loadingLabel: { type: String, default: 'Memproses…' },
  cancelLabel: { type: String, default: 'Batal' },
  tone: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'close']);
const titleId = 'pc-dialog-title';

const confirmClass = computed(() => {
  if (props.tone === 'danger') return 'pc-btn--danger';
  if (props.tone === 'blue') return 'pc-btn--blue';
  return 'pc-btn--primary';
});

function requestClose() {
  if (props.loading) return;
  emit('update:modelValue', false);
  emit('close');
}
</script>
