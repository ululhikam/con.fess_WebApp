<template>
  <div class="editor-area" :class="{ focused: focused }">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="editor-area__textarea"
      @focus="
        focused = true;
        $emit('focus');
      "
      @blur="
        focused = false;
        $emit('blur');
      "
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.tab.prevent="handleTab"
      spellcheck="false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      aria-label="Konten fess"
    />

    <div class="editor-area__footer">
      <div
        class="editor-area__char-count"
        :class="{ warning: charCount > maxLength * 0.9, error: charCount > maxLength }"
      >
        <span class="current">{{ charCount }}</span>
        <span class="separator">/</span>
        <span class="max">{{ maxLength }}</span>
      </div>

      <div class="editor-area__hints">
        <kbd class="hint-kbd">⌘</kbd><span>+</span><kbd class="hint-kbd">Enter</kbd>
        <span class="hint-sep">·</span>
        <span class="hint-text">Posting</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const modelValue = defineModel();

defineProps({
  placeholder: { type: String, default: 'Tulis fessmu di sini...' },
  maxLength: { type: Number, default: 2000 },
});

defineEmits(['update:modelValue', 'focus', 'blur']);

const textareaRef = ref(null);
const focused = ref(false);

const charCount = computed(() => modelValue.value.length);

function handleTab(e) {
  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + 2;

  // Trigger input event
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
}
</script>

<style scoped>
.editor-area {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.editor-area.focused {
  border-color: var(--brand-blue);
  box-shadow: 0 0 0 3px rgba(11, 57, 250, 0.15);
}

.editor-area__textarea {
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  padding: 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-main);
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.editor-area__textarea::placeholder {
  color: var(--text-muted);
}

.editor-area__textarea:focus {
  outline: none;
}

.editor-area__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
  border-radius: 0 0 12px 12px;
  font-size: 12px;
}

.editor-area__char-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.editor-area__char-count.warning {
  color: var(--warning);
}

.editor-area__char-count.error {
  color: var(--danger);
}

.editor-area__char-count .separator {
  color: var(--text-muted);
}

.editor-area__char-count .max {
  color: var(--text-muted);
}

.editor-area__hints {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 11px;
}

.hint-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
}

.hint-sep {
  color: var(--border-subtle);
}

@media (max-width: 600px) {
  .editor-area__textarea {
    min-height: 180px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
