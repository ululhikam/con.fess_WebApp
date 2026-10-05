/**
 * src/composables/useTheme.js
 * ---------------------------------------------------------------------------
 * Single source of truth for the colour scheme.
 *
 * Three user-facing modes:
 *   'system' — follow the OS setting (default, never written to storage)
 *   'dark'   | 'light' — explicit override, persisted to localStorage
 *
 * The resolved theme is written to `document.documentElement[data-theme]`,
 * which the design tokens in src/style.css key off. The inline bootstrap
 * script in index.html mirrors this logic to avoid a flash of wrong theme.
 *
 * Usage:
 *   const { mode, theme, isDark, setMode, toggle } = useTheme()
 */

import { ref, computed, watch } from 'vue';

export const THEME_STORAGE_KEY = 'fess_theme';
export const THEME_MODES = Object.freeze(['system', 'dark', 'light']);

/** Module-level singleton so every caller shares one reactive state. */
const systemPref = ref(readSystemPref());
const mode = ref(readStoredMode());

function readSystemPref() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readStoredMode() {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (THEME_MODES.includes(saved)) return saved;
  } catch {
    /* storage blocked (private mode) — fall through */
  }
  return 'system';
}

const theme = computed(() => (mode.value === 'system' ? systemPref.value : mode.value));

function apply(value) {
  document.documentElement.setAttribute('data-theme', value);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', value === 'light' ? '#EEF3FF' : '#0038FF');
}

/** Call once from main.js before mount. */
export function initTheme() {
  apply(theme.value);

  const media = window.matchMedia?.('(prefers-color-scheme: light)');
  media?.addEventListener?.('change', (event) => {
    systemPref.value = event.matches ? 'light' : 'dark';
  });

  watch(theme, apply, { immediate: false });
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark');

  /**
   * @param {'system'|'dark'|'light'} next
   */
  function setMode(next) {
    if (!THEME_MODES.includes(next)) return;
    mode.value = next;

    try {
      if (next === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  /** Dark <-> light, leaving 'system' mode. */
  function toggle() {
    setMode(isDark.value ? 'light' : 'dark');
  }

  /** Full cycle: system -> dark -> light -> system. */
  function cycle() {
    const index = THEME_MODES.indexOf(mode.value);
    setMode(THEME_MODES[(index + 1) % THEME_MODES.length]);
  }

  return { mode, theme, isDark, setMode, toggle, cycle };
}
