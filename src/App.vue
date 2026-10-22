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

    <!-- Dialog global bertema app — pengganti alert()/confirm() bawaan browser -->
    <AppDialogHost />

    <!-- Toast global: feedback aksi, selalu di tengah atas layar -->
    <AppToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, onErrorCaptured, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AppStateView from './components/ui/AppStateView.vue';
import AppDialogHost from './components/ui/AppDialogHost.vue';
import AppToastHost from './components/ui/AppToastHost.vue';
import { useBases } from './composables/useBases';
import { toast } from './composables/useToast';
import { useAuthStore } from './stores/authStore';
import { saveVerification } from './utils/emailVerification';

const router = useRouter();
const authStore = useAuthStore();
const isNavigating = ref(false);
const fatalError = ref(null);

function goToLogin(reason = 'expired') {
  if (router.currentRoute.value.name === 'Login') return;
  router.push({ name: 'Login', query: { reason } });
}

function handleSessionEnded(event) {
  authStore.clearSession();
  const reason = event?.detail?.reason || 'expired';
  toast.info(
    reason === 'logged_out'
      ? 'Kamu sudah keluar dari akun ini.'
      : 'Sesi kamu berakhir. Silakan masuk kembali.',
  );
  goToLogin(reason);
}

function handleEmailUnverified(event) {
  const { ticket, email } = event?.detail || {};
  // clearSession mengosongkan sessionStorage, jadi simpan ticket setelahnya.
  authStore.clearSession();
  // Ticket dari 403 belum tentu disertai email OTP; halaman verifikasi akan
  // mengirim ulang sekali secara otomatis.
  if (ticket && email) saveVerification({ ticket, email, needs_send: true });
  router.push({ name: 'VerifyEmail' });
}

function handleStorage(event) {
  // Hanya tab yang benar-benar punya sesi yang perlu dikeluarkan. Tab lain
  // yang sedang di halaman verifikasi tidak boleh kehilangan ticket-nya.
  if (event.key === 'fess_token' && !event.newValue && authStore.token) {
    authStore.clearSession();
    toast.info('Kamu keluar dari akun ini di tab lain.');
    goToLogin('logged_out');
  }
}

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
  console.error('[Fess n Curious] render error captured', err);
  return false;
});

function reload() {
  window.location.reload();
}

onMounted(() => {
  window.addEventListener('auth:session-ended', handleSessionEnded);
  window.addEventListener('auth:email-unverified', handleEmailUnverified);
  window.addEventListener('storage', handleStorage);

  /**
   * Cek exp JWT tersimpan, jadwalkan auto-logout, lalu segarkan profil.
   * Listener dipasang lebih dulu agar 401/403 dari fetchMe ikut tertangani.
   */
  authStore.startSessionWatch();

  /**
   * Warm caches as early as possible so every page finds data already loaded.
   * Both fetches are silent (no loading spinner) and errors are swallowed —
   * pages handle their own loading/error states.
   */
  const { ensureLoaded } = useBases();
  ensureLoaded().catch(() => {});
});


onBeforeUnmount(() => {
  stopBefore();
  stopAfter();
  window.removeEventListener('auth:session-ended', handleSessionEnded);
  window.removeEventListener('auth:email-unverified', handleEmailUnverified);
  window.removeEventListener('storage', handleStorage);
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
