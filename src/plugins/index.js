/**
 * src/plugins/index.js
 * App-wide plugin registration + bootstrap side effects.
 * Keeps main.js down to a single, readable pipeline.
 */
import { createPinia } from 'pinia';
import router from '../router';
import { initTheme } from '../composables/useTheme';
import { api, isMockMode } from '../api';

/** State/plugin instances installed on the app instance. */
export function createAppPlugins() {
  return [createPinia(), router];
}

/** Side effects that must run once, before anything renders. */
export function bootstrap() {
  initTheme();
  // Log API mode at startup
  console.log(`[FessHub] API mode: ${isMockMode() ? 'MOCK' : 'REAL'}`);
}

/**
 * Hook up global diagnostics.
 * `errorHandler` catches errors that escape component `errorCaptured`
 * hooks (event handlers, watchers, lifecycle) so a failure is never silent.
 */
export function configureApp(app) {
  app.config.errorHandler = (err, _instance, info) => {
    // eslint-disable-next-line no-console
    console.error(`[FessHub] ${info}`, err);
  };

  // Development-only: surface warnings instead of dropping them.
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg) => {
      // eslint-disable-next-line no-console
      console.warn(`[FessHub] ${msg}`);
    };
  }

  // Global properties for easy access in components (optional)
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$isMock = isMockMode();
}
