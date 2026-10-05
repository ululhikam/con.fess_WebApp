<template>
  <div class="admin-field" :class="{ 'admin-field--inline': inline }">
    <label v-if="hiddenLabel" :for="inputId" class="visually-hidden">{{ label }}</label>
    <label v-else :for="inputId" class="admin-field__label text-xs font-bold">{{ label }}</label>
    <input
      :id="inputId"
      class="admin-input"
      :class="{ 'admin-input--compact': compact }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      @input="onInput"
    />
  </div>
</template>

<script>
/* Module scope → unique ids across every rendered field. */
let idSeq = 0;
</script>

<script setup>
/**
 * AdminTextField — labelled input used across the admin dashboards.
 * `hiddenLabel` keeps the label for screen readers only (search box in a
 * card header), `inline` renders it next to the control, `compact` is the
 * small numeric stepper used by the security controls.
 */
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hiddenLabel: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
});

const emit = defineEmits(['update:modelValue']);

const inputId = `admin-field-${++idSeq}`;

function onInput(event) {
  const raw = event.target.value;
  emit('update:modelValue', props.type === 'number' ? Number(raw) : raw);
}
</script>

<style scoped>
.admin-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-field--inline {
  flex-direction: row;
  align-items: center;
}

.admin-field__label {
  color: var(--text-main);
}

.admin-input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12px;
  color: var(--text-main);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.15s ease;
}

.admin-input:focus {
  border-color: var(--brand-blue);
}

.admin-input::placeholder {
  color: var(--text-muted);
}

.admin-input--compact {
  width: 64px;
  padding: 6px;
  font-weight: 800;
  text-align: center;
  border-color: var(--border-strong);
}
</style>
