/**
 * src/composables/useApi.js
 * Composable wrapper around api.* methods with loading, error, retry state.
 * Usage:
 *   const { data, loading, error, execute, refresh } = useApi(() => api.getFesses({ page: 1 }))
 *   onMounted(() => execute())
 *   // In template: <Component v-if="!loading" :items="data" />
 */

import { ref, computed, watchEffect, onScopeDispose } from 'vue';

/**
 * @template T
 * @param {() => Promise<T>} fetcher — async function returning data
 * @param {{ immediate?: boolean, refetchOn?: any[] }?} options
 * @returns {{
 *   data: Ref<T | null>,
 *   loading: Ref<boolean>,
 *   error: Ref<Error | null>,
 *   execute: () => Promise<T | null>,
 *   refresh: () => Promise<T | null>,
 *   abort: () => void
 * }}
 */
export function useApi(fetcher, options = {}) {
  const { immediate = true, refetchOn = [] } = options;

  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const abortController = ref(null);

  async function execute() {
    // Cancel previous in-flight request
    if (abortController.value) abortController.value.abort();
    abortController.value = new AbortController();

    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher(abortController.value.signal);
      data.value = result;
      return result;
    } catch (e) {
      if (e.name === 'AbortError') return null; // cancelled, not an error
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  const refresh = execute;

  function abort() {
    if (abortController.value) abortController.value.abort();
  }

  // Auto-refetch when dependencies change
  if (refetchOn.length) {
    watchEffect(() => {
      refetchOn.forEach((v) => v); // track
      if (!loading.value) execute();
    });
  }

  if (immediate) {
    const promise = execute();
    onScopeDispose(() => abort());
    return { data, loading, error, execute, refresh, abort, _initialPromise: promise };
  }

  onScopeDispose(() => abort());
  return { data, loading, error, execute, refresh, abort };
}

/**
 * Specialized: infinite scroll / pagination.
 * @param {() => Promise<{data: T[], total: number, page: number, limit: number}>} fetcher
 * @returns {{
 *   items: Ref<T[]>,
 *   loading: Ref<boolean>,
 *   loadingMore: Ref<boolean>,
 *   error: Ref<Error|null>,
 *   hasMore: Ref<boolean>,
 *   loadMore: () => Promise<void>,
 *   refresh: () => Promise<void>
 * }}
 */
export function usePaginatedApi(fetcher) {
  const items = ref([]);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref(null);
  const page = ref(1);
  const limit = ref(20);
  const total = ref(0);

  const hasMore = computed(() => items.value.length < total.value);

  async function load(reset = false) {
    if (reset) {
      page.value = 1;
      items.value = [];
      loading.value = true;
    } else {
      if (loadingMore.value || !hasMore.value) return;
      page.value++;
      loadingMore.value = true;
    }
    error.value = null;

    try {
      const res = await fetcher({ page: page.value, limit: limit.value });
      if (reset) items.value = res.data;
      else items.value.push(...res.data);
      total.value = res.total;
    } catch (e) {
      if (!reset) page.value--; // rollback
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  }

  const refresh = () => load(true);
  const loadMore = () => load(false);

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh };
}

/**
 * Mutation helper — POST/PUT/DELETE with optimistic update support.
 * @param {() => Promise<T>} mutator
 * @param {{ onMutate?: (vars) => void, onError?: (err, vars) => void, onSettled?: () => void }?} options
 * @returns {{
 *   mutate: (vars) => Promise<T>,
 *   loading: Ref<boolean>,
 *   error: Ref<Error|null>,
 * }}
 */
export function useMutation(mutator, options = {}) {
  const { onMutate, onError, onSettled } = options;
  const loading = ref(false);
  const error = ref(null);

  async function mutate(vars) {
    loading.value = true;
    error.value = null;
    try {
      onMutate?.(vars);
      const result = await mutator(vars);
      return result;
    } catch (e) {
      error.value = e;
      onError?.(e, vars);
      throw e;
    } finally {
      loading.value = false;
      onSettled?.();
    }
  }

  return { mutate, loading, error };
}
