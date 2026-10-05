/**
 * src/composables/useLanding.js
 * ---------------------------------------------------------------------------
 * Landing page behaviour, separated from presentation:
 *  • `isScrolled` — drives the sticky navbar's condensed/scrolled state.
 *  • `openFaq` / `toggleFaq` — single-open FAQ accordion.
 *
 * Call once in the page shell and pass the state down to the sections.
 */
import { ref, onMounted, onUnmounted } from 'vue';

export function useLanding() {
  /** First FAQ is open by default. */
  const openFaq = ref(0);
  const isScrolled = ref(false);

  const toggleFaq = (idx) => {
    openFaq.value = openFaq.value === idx ? null : idx;
  };

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 40;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return { isScrolled, openFaq, toggleFaq };
}
