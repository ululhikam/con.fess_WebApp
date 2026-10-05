<template>
  <div class="app-root">
    <!-- Screen-reader announcement for async transitions -->
    <p class="visually-hidden" aria-live="polite" role="status">
      {{ isNavigating ? 'Memuat halaman…' : '' }}
    </p>

    <!-- Top progress bar while a lazy route chunk is being fetched -->
    <span class="route-progress" :class="{ 'is-active': isNavigating }" aria-hidden="true" />

    <!--
      Error boundary. If any descendant throws during render/lifecycle we
      swap the tree for a recoverable screen instead of a white page.
    -->
    <AppStateView
      v-if="fatalError"
      class="app-error"
      variant="error"
      title="Terjadi kesalahan"
      description="Halaman ini gagal dirender. Muat ulang untuk mencoba lagi."
      action-label="Muat ulang"
      @action="reload"
    />

    <template v-else>
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </template>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AppStateView from './components/ui/AppStateView.vue';

const router = useRouter();
const isNavigating = ref(false);
const fatalError = ref(null);

/**
 * `from.name` is undefined on the very first navigation, so the progress bar
 * never flashes on initial paint — only on real client-side transitions.
 */
const stopBefore = router.beforeEach((to, from) => {
  if (from.name) isNavigating.value = true;
});

const stopAfter = router.afterEach(() => {
  isNavigating.value = false;
});

/** Returning `false` halts propagation, keeping the broken subtree contained. */
onErrorCaptured((err) => {
  fatalError.value = err;
  // eslint-disable-next-line no-console
  console.error('[FessHub] render error captured', err);
  return false;
});

function reload() {
  window.location.reload();
}

onBeforeUnmount(() => {
  stopBefore();
  stopAfter();
});
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-error {
  margin: auto;
  width: min(520px, calc(100% - 32px));
}

.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  z-index: 9999;
  background: linear-gradient(90deg, var(--neon-blue), var(--lime-primary));
  opacity: 0;
  transition:
    width 0.25s ease,
    opacity 0.2s ease;
}

.route-progress.is-active {
  width: 70%;
  opacity: 1;
  animation: progress-sweep 1.1s ease-in-out infinite;
}

@keyframes progress-sweep {
  0% {
    width: 8%;
  }
  60% {
    width: 78%;
  }
  100% {
    width: 92%;
  }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
}
</style>
