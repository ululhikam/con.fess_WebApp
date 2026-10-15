/**
 * src/composables/useInfiniteScroll.js
 * ---------------------------------------------------------------------------
 * Lazy-load trigger shared by every long list (home feed, search, fess saya,
 * base diikuti, notifikasi). Observes a sentinel element and calls `onLoad`
 * when it enters the viewport — including again after new rows render while
 * the sentinel is still visible (via the `deps` watcher).
 */

import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

export function useInfiniteScroll(
  sentinelRef,
  { onLoad, canLoad = () => true, deps = () => null, rootMargin = '400px 0px' } = {},
) {
  const isVisible = ref(false);
  let observer = null;

  /** Emit a load request only when the sentinel is visible and allowed. */
  function maybeLoad() {
    if (!isVisible.value) return;
    if (!canLoad()) return;
    onLoad?.();
  }

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    observer = new IntersectionObserver(
      (entries) => {
        isVisible.value = Boolean(entries[entries.length - 1]?.isIntersecting);
        maybeLoad();
      },
      { rootMargin },
    );
    if (sentinelRef.value) observer.observe(sentinelRef.value);
  });

  // Sentinel elements are v-if'd — observe/unobserve as they mount/unmount.
  watch(
    sentinelRef,
    (el, prevEl) => {
      if (!observer) return;
      if (prevEl) observer.unobserve(prevEl);
      if (el) observer.observe(el);
    },
    { flush: 'post' },
  );

  // Re-evaluate once the list grows (sentinel may still be on screen).
  watch(deps, () => maybeLoad(), { flush: 'post' });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { maybeLoad };
}
