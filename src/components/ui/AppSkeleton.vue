<template>
  <span
    :class="['skeleton-bone', `skeleton--${variant}`, className]"
    :style="boneStyle"
    aria-hidden="true"
  />
</template>

<script setup>
/**
 * AppSkeleton — the single primitive every loading placeholder is built from.
 *
 * It only ever renders a "bone" that shimmers via the global
 * `.skeleton-bone` animation defined in src/style.css.
 *
 * Props
 * ------
 * width / height : CSS length or number (number -> px)
 * variant        : text | circle | rect | pill
 * lines          : for variant="text", how many lines to render
 *
 * Accessibility: skeletons are `aria-hidden`. Wrap the region that is loading
 * with `aria-busy="true"` and announce it via a visually-hidden live region.
 */
import { computed } from 'vue';

const props = defineProps({
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: null },
  variant: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'circle', 'rect', 'pill'].includes(v),
  },
  lines: { type: Number, default: 1 },
  lineHeight: { type: [String, Number], default: 12 },
  className: { type: String, default: '' },
});

const toCss = (v) => (typeof v === 'number' ? `${v}px` : v);

const boneStyle = computed(() => {
  const style = { width: toCss(props.width) };
  if (props.height != null) style.height = toCss(props.height);
  else if (props.variant === 'text') style.height = toCss(props.lineHeight);

  if (props.variant === 'circle') style.borderRadius = '50%';
  if (props.variant === 'pill') style.borderRadius = '999px';
  if (props.variant === 'rect') style.borderRadius = '12px';

  return style;
});
</script>

<style scoped>
.skeleton-bone {
  display: block;
  flex-shrink: 0;
  max-width: 100%;
}
</style>
