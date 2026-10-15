/**
 * src/composables/useVisibilityRefresh.js
 * ---------------------------------------------------------------------------
 * Refetch data saat tab/aplikasi kembali aktif — pola "refetchOnWindowFocus"
 * ala app native (React Query). Callback hanya dipanggil bila tab benar-benar
 * tersembunyi cukup lama (default 60 dtk), jadi perpindahan tab cepat tidak
 * memicu request beruntun; setelah dipanggil, timer di-reset.
 *
 * Pakai di komponen:
 *   useVisibilityRefresh(() => reloadNotifs(), { staleMs: 30_000 });
 */

import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useVisibilityRefresh(onRefresh, { staleMs = 60_000 } = {}) {
  /** Kapan terakhir data segar (default: saat komponen dipasang). */
  const lastActiveAt = ref(Date.now());

  function markFresh() {
    lastActiveAt.value = Date.now();
  }

  function handleVisibility() {
    if (typeof document === 'undefined' || document.hidden) return;
    if (Date.now() - lastActiveAt.value < staleMs) return;
    markFresh();
    try {
      onRefresh?.();
    } catch {
      // Callback refresh tidak boleh mematikan lifecycle.
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibility);
  });

  return { markFresh };
}
