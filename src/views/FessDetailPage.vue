<template>
  <div class="fess-detail-page">
    <!-- Top Sticky Bar -->
    <header class="detail-top-bar">
      <div class="top-bar-inner">
        <button
          type="button"
          class="btn-back"
          aria-label="Kembali"
          title="Kembali"
          @click="handleBack"
        >
          <ChevronLeft :size="22" />
          <span class="btn-back-text">Kembali</span>
        </button>

        <div class="top-title-col">
          <div class="top-handle-title">
            <span>{{ post?.handle || 'Fess' }}</span>
          </div>
          <span class="top-sub-tag">{{ post ? post.time || 'Fess' : 'Memuat…' }}</span>
        </div>

        <button
          type="button"
          class="btn-icon-action"
          aria-label="Bagikan tautan fess"
          title="Bagikan Tautan"
          @click="shareFessLink"
        >
          <Share2 :size="19" />
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="detail-main-stage">
      <div class="detail-stage-container">
        <!-- Loading skeleton while the fess is fetched -->
        <ContentSkeleton
          v-if="loading && !post"
          type="feed-card"
          :count="1"
          label="Memuat fess…"
        />

        <!-- API error / 404 state -->
        <AppStateView
          v-else-if="error && !post"
          variant="error"
          :title="notFound ? 'Fess tidak ditemukan' : 'Fess gagal dimuat'"
          :description="notFound
            ? 'Fess ini mungkin sudah dihapus atau tautannya salah.'
            : 'Terjadi kesalahan saat mengambil fess. Periksa koneksi internetmu, lalu coba lagi.'"
          :action-label="notFound ? 'Kembali' : 'Coba lagi'"
          @action="notFound ? handleBack() : loadFess()"
        />

        <!-- The fess itself, comments open by default (permalink view) -->
        <FessCard
          v-else-if="post"
          :post="post"
          comments-open
          @like="handleLike"
        />
      </div>
    </main>

    <!-- Toast Notification -->
    <Transition name="fade-toast">
      <div v-if="toastMessage" class="detail-toast-bubble">
        <CheckCircle2 :size="16" class="toast-icon" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
/**
 * FessDetailPage.vue — Halaman tautan tetap (permalink) sebuah fess.
 *
 * Dipakai oleh tautan `/fess/:id` dari tombol "Salin Tautan" dan saat kotak
 * fess kutipan di kartu feed diklik: membuka fess tersebut, bukan langsung
 * membuka mode kutip.
 */
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, Share2, CheckCircle2 } from 'lucide-vue-next';
import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';
import FessCard from '../components/common/FessCard.vue';
import { api } from '../api';
import { mapFessToPost } from '../utils/fessMapper';

const route = useRoute();
const router = useRouter();

/* ---------- Fess state (GET /fesses/:id) ---------- */
const post = ref(null);
const loading = ref(false);
const error = ref(null);
const notFound = computed(() => error.value?.status === 404);

// Guards against out-of-order responses when the route id changes quickly
// (mis. mengklik fess kutipan di dalam fess kutipan).
let requestId = 0;

async function loadFess() {
  const id = String(route.params.id || '');
  const rid = ++requestId;

  if (!id) {
    error.value = new Error('ID fess tidak tersedia');
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  post.value = null;

  try {
    const res = await api.getFess(id);
    if (rid !== requestId) return;
    const mapped = mapFessToPost(res);
    post.value = mapped;
    if (mapped) {
      document.title = `Fess ${mapped.handle} · Fess n Curious`;
    }
  } catch (e) {
    if (rid !== requestId) return;
    error.value = e;
  } finally {
    if (rid === requestId) loading.value = false;
  }
}

onMounted(loadFess);

// Reuse this component when moving between permalinks (nested quoted fess).
watch(
  () => route.params.id,
  (id) => {
    if (id) {
      window.scrollTo({ top: 0 });
      loadFess();
    }
  }
);

/* ---------- Like (optimistic, POST /fesses/:id/vote) ---------- */
async function handleLike({ id, isLiked }) {
  const item = post.value;
  if (!item || String(item.id) !== String(id)) return;

  const previous = { isLiked: item.isLiked, likes: item.likes ?? 0 };
  item.isLiked = isLiked;
  item.likes = Math.max(0, (item.likes ?? 0) + (isLiked ? 1 : -1));

  try {
    const res = await api.voteFess(id, isLiked ? 'up' : 'down');
    if (res && typeof res.upvotes === 'number') {
      item.likes = res.upvotes;
      item.downvotes = res.downvotes ?? item.downvotes;
      item.isLiked = res.user_vote === 'up';
      item.userVote = res.user_vote ?? null;
    }
  } catch {
    item.isLiked = previous.isLiked;
    item.likes = previous.likes;
  }
}

/* ---------- Back & share ---------- */
function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/feed');
  }
}

const toastMessage = ref('');
let toastTimer = null;

function showToast(msg) {
  toastMessage.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 2400);
}

async function shareFessLink() {
  const id = post.value?.id || route.params.id;
  if (!id) return;
  const link = `${window.location.origin}/fess/${id}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Fess di Fess n Curious', url: link });
      return;
    } catch {
      /* user membatalkan share sheet — lanjut ke salin tautan */
    }
  }

  try {
    await navigator.clipboard.writeText(link);
    showToast('Tautan fess disalin ke clipboard');
  } catch {
    showToast(link);
  }
}
</script>

<style scoped>
.fess-detail-page {
  min-height: 100vh;
  background-color: var(--shell-bg, #0b0d14);
  color: var(--shell-text, #f1f3f9);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
}

/* TOP STICKY BAR — mirrors the base public profile top bar */
.detail-top-bar {
  position: sticky;
  top: 0;
  z-index: 80;
  background: var(--shell-header-bg, rgba(11, 13, 20, 0.92));
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.top-bar-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--shell-text, #f1f3f9);
  cursor: pointer;
  padding: 6px 10px 6px 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.07);
}

.btn-back-text {
  font-size: 14px;
  font-weight: 500;
}

.top-title-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.top-handle-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 700;
  color: var(--shell-text, #fff);
}

.top-sub-tag {
  font-size: 11px;
  color: var(--shell-text-muted, #8e95a5);
}

.btn-icon-action {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.1));
  color: var(--shell-text, #f1f3f9);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-action:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05);
}

/* MAIN STAGE */
.detail-main-stage {
  flex: 1;
  padding: 16px 16px 36px;
  display: flex;
  justify-content: center;
}

.detail-stage-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* TOAST BUBBLE */
.detail-toast-bubble {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 120;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 30px;
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  max-width: calc(100vw - 32px);
  word-break: break-all;
}

.toast-icon {
  color: #10b981;
  flex-shrink: 0;
}

.fade-toast-enter-active,
.fade-toast-leave-active {
  transition: all 0.25s ease;
}

.fade-toast-enter-from,
.fade-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
