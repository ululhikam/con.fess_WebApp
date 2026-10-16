/**
 * src/composables/usePullToRefresh.js
 * ---------------------------------------------------------------------------
 * "Pull-to-refresh" ala Instagram/X — user menarik feed ke bawah dari atas
 * halaman, lepas → feed di-refresh senyap (tanpa skeleton).
 *
 * Behaviour:
 *   - Aktif hanya kalau scroll posisi sudah di paling atas (scrollY < 10px).
 *   - Perlu tarik >= 72px ke bawah untuk trigger refresh.
 *   - Indikator visual muncul (spinner berputar) saat threshold tercapai.
 *   - Touch gesture saja; mouse drag tidak ter-deteksi (sesuai native).
 *
 * Pemakaian:
 *   const { indicatorStyle } = usePullToRefresh(containerRef, onRefresh);
 */

import { onBeforeUnmount, onMounted, ref } from 'vue';

const THRESHOLD = 72; // pixel tarik untuk trigger refresh

export function usePullToRefresh(containerRef, onRefresh) {
  const pulling = ref(false);
  const pullY = ref(0);
  const ready = ref(false); // sudah melampaui threshold → akan refresh saat lepas

  let startY = 0;
  let active = false;

  function onTouchStart(e) {
    const el = containerRef?.value;
    if (!el) return;
    const scrollTop = el.scrollTop ?? window.scrollY ?? 0;
    if (scrollTop > 10) return; // tidak di paling atas
    startY = e.touches[0].clientY;
    active = true;
  }

  function onTouchMove(e) {
    if (!active) return;
    const delta = e.touches[0].clientY - startY;
    if (delta <= 0) {
      active = false;
      pulling.value = false;
      pullY.value = 0;
      ready.value = false;
      return;
    }
    // Beri efek ketahanan (rubberbanding) — semakin ditarik, semakin berat.
    const clamped = Math.min(delta, THRESHOLD * 2);
    pullY.value = clamped * 0.45;
    pulling.value = pullY.value > 8;
    ready.value = pullY.value >= THRESHOLD * 0.45;

    if (pulling.value) {
      e.preventDefault(); // cegah scroll native saat sedang pull
    }
  }

  function onTouchEnd() {
    if (!active) return;
    active = false;
    if (ready.value) {
      try {
        onRefresh?.();
      } catch {
        // ignore
      }
    }
    pulling.value = false;
    pullY.value = 0;
    ready.value = false;
  }

  onMounted(() => {
    const target = containerRef?.value ?? window;
    if (!target) return;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    target.addEventListener('touchcancel', onTouchEnd, { passive: true });
  });

  onBeforeUnmount(() => {
    const target = containerRef?.value ?? window;
    if (!target) return;
    target.removeEventListener('touchstart', onTouchStart);
    target.removeEventListener('touchmove', onTouchMove);
    target.removeEventListener('touchend', onTouchEnd);
    target.removeEventListener('touchcancel', onTouchEnd);
  });

  return { pulling, pullY, ready };
}
