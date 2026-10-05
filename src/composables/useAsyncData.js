/**
 * src/composables/useAsyncData.js
 * ---------------------------------------------------------------------------
 * Generic async data loader with loading / error states.
 *
 * Gives every screen the same lifecycle contract so views can render:
 *   <Skeleton  v-if="loading" />
 *   <ErrorState v-else-if="error" />
 *   <Content   v-else />
 *
 * Usage:
 *   const { data, loading, error, reload } = useAsyncData(fetcher, {
 *     delay: 600,          // artificial latency so skeletons are visible
 *   })
 */

import { ref, watch, onScopeDispose } from 'vue';

/**
 * @param {(signal?: AbortSignal) => Promise<any>|any} fetcher
 * @param {{ delay?: number, immediate?: boolean, initial?: any }} options
 */
export function useAsyncData(fetcher, options = {}) {
  const { delay = 0, immediate = true, initial = null } = options;

  const data = ref(initial);
  const loading = ref(false);
  const error = ref(null);

  let controller = null;
  let disposed = false;
  let timer = null;

  const sleep = (ms) =>
    new Promise((resolve) => {
      timer = setTimeout(resolve, ms);
    });

  async function load() {
    controller?.abort();
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

    loading.value = true;
    error.value = null;

    try {
      if (delay > 0) await sleep(delay);
      const result = await fetcher(controller?.signal);
      if (!disposed) data.value = result;
    } catch (err) {
      if (disposed || err?.name === 'AbortError') return;
      error.value = err;
    } finally {
      if (!disposed) loading.value = false;
    }
  }

  const reload = () => load();

  function reset() {
    data.value = initial;
    error.value = null;
    loading.value = false;
  }

  if (immediate) load();

  onScopeDispose(() => {
    disposed = true;
    controller?.abort();
    clearTimeout(timer);
  });

  return { data, loading, error, reload, reset };
}

/**
 * Re-run `load` whenever a reactive source changes (search box, tab, ...).
 * @param {import('vue').Ref|(()=>any)} source
 */
export function useAsyncDataWatch(source, fetcher, options = {}) {
  const handle = useAsyncData(fetcher, { ...options, immediate: false });
  watch(source, () => handle.load(), { immediate: true });
  return handle;
}

/**
 * Minimal helper when a component only needs "show skeleton for N ms"
 * (used for optimistic UI actions like follow / like).
 * @param {number} ms
 * @param {boolean} start
 */
export function useFakeLoading(ms = 700, start = true) {
  const loading = ref(start);
  let timer = null;

  const stop = () => {
    loading.value = false;
  };

  if (start) timer = setTimeout(stop, ms);

  onScopeDispose(() => clearTimeout(timer));

  function run(nextMs = ms) {
    loading.value = true;
    clearTimeout(timer);
    timer = setTimeout(stop, nextMs);
  }

  return { loading, run };
}
