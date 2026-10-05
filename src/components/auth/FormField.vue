<template>
  <div class="form-field" :class="{ 'has-error': !!error }">
    <div class="form-field__label-row">
      <label :for="id" class="form-field__label">
        {{ label }}
        <span v-if="required" class="form-field__required" aria-hidden="true">*</span>
      </label>

      <!-- Slot for trailing links, e.g. "Lupa Sandi?" -->
      <slot name="aside" />
    </div>

    <input
      :id="id"
      class="form-field__input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    />

    <p v-if="error" :id="`${id}-error`" class="form-field__error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="form-field__hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
/**
 * FormField — one place for label + input + hint/error + a11y wiring.
 * Both auth forms use it, so adding a field (or a validation message) is a
 * single change instead of two.
 */
defineProps({
  /** Unique DOM id — required so <label for> points at the input. */
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
});

defineEmits(['update:modelValue', 'blur']);
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.form-field__label {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-secondary);
}

.form-field__required {
  color: var(--danger-text);
}

.form-field__input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  background: var(--bg-inset);
  border: 1.5px solid var(--border-subtle);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field__input::placeholder {
  color: var(--text-muted);
  font-weight: 500;
}

.form-field__input:focus {
  border-color: var(--brand-blue);
  box-shadow: 0 0 10px var(--neon-blue-glow);
}

.form-field.has-error .form-field__input {
  border-color: var(--danger);
}

.form-field__error {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--danger-text);
}

.form-field__hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  /* 16px stops iOS Safari from auto-zooming on focus. */
  .form-field__input {
    font-size: 16px;
  }
}
</style>
