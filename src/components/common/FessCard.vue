<template>
  <article ref="cardRootRef" class="fess-feed-card">
    <!-- Header: Author, Tag / Status, Report Button -->
    <header class="card-header-row">
      <div
        class="user-meta-box"
        :class="{ 'clickable-author': isAuthorClickable }"
        :title="isAuthorClickable ? 'Lihat profil base' : undefined"
        @click="navigateToAuthor(post)"
      >
        <div class="avatar-circle" :style="{ background: post.avatarBg || '#252a3a' }">
          <img
            v-if="post.avatarImg && !avatarFailed"
            :src="post.avatarImg"
            alt=""
            class="avatar-img"
            @error="avatarFailed = true"
          />
          <span v-else-if="post.avatarText" class="avatar-initial">{{ post.avatarText }}</span>
          <UserRound v-else :size="15" class="avatar-icon" />
        </div>
        <div class="user-handle-box">
          <span class="handle-title">{{ post.handle || post.senderHandle || '@anonim' }}</span>
          <span class="post-time">• {{ post.time || 'Baru saja' }}</span>
        </div>
      </div>

      <div class="header-right-group">
        <!-- Label topik: topik pilihan user, atau "Confession" sebagai default. -->
        <span
          :class="[
            'tag-badge',
            post.topic === 'tanya' || post.tag === 'Tanya' ? 'tag-tanya' : 'tag-cerita',
          ]"
        >
          <Pin :size="11" />
          <span>{{ post.topicLabel || post.tag || 'Confession' }}</span>
        </span>

        <!-- Status publikasi Instagram (terlihat semua user; detail hanya admin) -->
        <span v-if="post.postedToIg" class="badge-subtle badge-ig">
          <Instagram :size="12" />
          <span>Feed</span>
        </span>
        <span
          v-else-if="post.igStatus === 'failed'"
          class="badge-subtle badge-ig-failed"
          :title="
            canManageInstagram && post.igError
              ? post.igError
              : 'Publikasi Instagram gagal — hubungi admin base untuk mencoba lagi.'
          "
        >
          <AlertTriangle :size="12" />
          <span>IG gagal</span>
        </span>
        <span
          v-else-if="post.igStatus === 'processing'"
          class="badge-subtle badge-ig-pending"
          title="Publikasi Instagram sedang diproses."
        >
          <Loader2 :size="12" class="spin" />
          <span>IG proses</span>
        </span>
        <span
          v-else-if="post.igStatus === 'pending'"
          class="badge-subtle badge-ig-pending"
          title="Video sedang diproses Instagram; postingan akan terbit otomatis."
        >
          <Clock :size="12" />
          <span>IG menunggu</span>
        </span>

        <!-- Indikasi filter NLP (mode auto post) — hanya terlihat admin base -->
        <span
          v-if="isAdmin && isManagedBasePost && post.autoFlagged"
          class="badge-subtle badge-nlp"
          :title="`Terindikasi filter NLP: ${post.flagReason || 'konten negatif'}`"
        >
          <ShieldAlert :size="12" />
          <span>NLP</span>
        </span>

        <!-- Status Badge — pemilik base (atau Super Admin), plus daftar Fess Saya -->
        <span v-if="showStatusBadge" class="badge-subtle" :class="statusBadgeClass">
          <Check v-if="post.status === 'approved'" :size="12" />
          <Clock v-else-if="post.status === 'pending'" :size="12" />
          <X v-else :size="12" />
          <span>{{ statusBadgeLabel }}</span>
        </span>

        <!-- TAKE DOWN (admin base): turunkan fess terbit dari feed & hapus -->
        <button
          v-if="canTakeDown"
          type="button"
          class="btn-takedown"
          title="Take down fess ini"
          aria-label="Take down fess"
          @click="$emit('takeDown', post.id)"
        >
          <Trash2 :size="13" />
        </button>

        <!-- LAPORKAN KONTEN (FLAG BUTTON) -->
        <button
          type="button"
          class="btn-flag-report"
          title="Laporkan Konten"
          aria-label="Laporkan Konten"
          @click="showReportModal = true"
        >
          <Flag :size="13" />
        </button>
      </div>
    </header>

    <!-- Confession Content -->
    <div class="card-body-text">
      <p class="post-body-content">{{ post.content }}</p>

      <!-- Karosel Media — gaya X/Threads: foto berjejer horizontal, berikutnya mengintip -->
      <div v-if="hasMedia" class="card-media-carousel">
        <div
          ref="carouselViewportRef"
          class="carousel-viewport"
          :class="{ 'carousel-merging': pinchGapScale <= 0.5 }"
          :style="carouselViewportStyle"
          @pointerdown="onCarouselPointerDown"
          @pointermove="onCarouselPointerMove"
          @pointerup="onCarouselPointerUp"
          @pointercancel="onCarouselPointerUp"
          @pointerleave="onCarouselPointerLeave"
          @wheel="onCarouselWheel"
          @gesturestart="onCarouselGesture"
          @gesturechange="onCarouselGesture"
        >
          <div class="carousel-track" :style="carouselTrackStyle">
            <div
              v-for="(item, mediaIdx) in allMedia"
              :key="`media-${mediaIdx}`"
              class="carousel-slide"
              :class="{ 'carousel-slide-hidden': viewerOpen && viewerIndex === mediaIdx }"
              :data-media-index="mediaIdx"
              role="button"
              tabindex="0"
              :aria-label="`Buka media ${mediaIdx + 1} dari ${allMedia.length}`"
              @click.stop="onSlideClick(mediaIdx, $event)"
              @keydown.enter.stop="openViewer(mediaIdx, $event)"
            >
              <img
                v-if="item.type === 'image'"
                :src="item.url"
                :alt="item.caption || `Media ${mediaIdx + 1}`"
                :loading="mediaIdx < 2 ? 'eager' : 'lazy'"
                class="carousel-media-element"
                draggable="false"
                @load="recordMediaRatio(mediaIdx, $event.target)"
              />
              <template v-else>
                <video
                  :ref="(el) => registerCarouselVideo(mediaIdx, el)"
                  :src="item.url"
                  :poster="item.thumbnail || undefined"
                  class="carousel-media-element"
                  preload="metadata"
                  muted
                  playsinline
                  loop
                  @loadedmetadata="recordMediaRatio(mediaIdx, $event.target)"
                />
                <span v-if="item.duration" class="carousel-duration-pill">{{ item.duration }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Quoted Fess (Kutipan Fess Orang Lain) -->
      <div
        v-if="post.quotedFess"
        class="quoted-fess-box"
        role="button"
        tabindex="0"
        title="Buka fess ini"
        @click.stop="openQuotedFess(post.quotedFess)"
        @keydown.enter.stop="openQuotedFess(post.quotedFess)"
      >
        <div class="quoted-fess-header">
          <div class="quoted-avatar" :style="{ background: post.quotedFess.avatarBg || '#0038FF' }">
            <span v-if="post.quotedFess.avatarText">{{ post.quotedFess.avatarText }}</span>
            <span v-else>{{ (post.quotedFess.handle || '@fess').slice(1, 3).toUpperCase() }}</span>
          </div>
          <span class="quoted-handle">{{
            post.quotedFess.handle || post.quotedFess.senderHandle
          }}</span>
          <span class="quoted-time">• {{ post.quotedFess.time || 'Waktu lalu' }}</span>
          <span class="badge-quote-pill">Lihat</span>
        </div>
        <p class="quoted-content">{{ post.quotedFess.content }}</p>
      </div>
    </div>

    <!-- Detail kegagalan auto-post Instagram — KHUSUS admin pengelola base. -->
    <div
      v-if="canManageInstagram && post.igStatus === 'failed' && post.igError"
      class="ig-failure-banner"
      role="alert"
    >
      <AlertTriangle :size="15" class="ig-failure-icon" />
      <div class="ig-failure-copy">
        <strong>Publikasi Instagram gagal</strong>
        <span>{{ post.igError }}</span>
        <small v-if="post.igAttempts">Sudah dicoba {{ post.igAttempts }}×.</small>
      </div>
      <button type="button" class="btn-ig-retry" @click="shareToInstagram">
        <RotateCcw :size="13" />
        <span>Coba lagi</span>
      </button>
    </div>

    <!-- Action Bar: Like, Komen, Kutip, Share, Simpan, Moderasi Admin -->
    <footer class="card-action-bar">
      <!-- 1. LIKE BUTTON -->
      <button
        type="button"
        class="action-btn"
        :class="{ liked: isLiked }"
        :aria-pressed="isLiked"
        :title="isLiked ? 'Batal Suka' : 'Suka'"
        @click="toggleLike"
      >
        <Heart :size="17" :fill="isLiked ? 'currentColor' : 'none'" />
        <span class="action-count">{{ formatCount(likesCount) }}</span>
      </button>

      <!-- 2. KOMEN BUTTON -->
      <button
        type="button"
        class="action-btn"
        :class="{ active: showComments }"
        :title="showComments ? 'Tutup Komentar' : 'Lihat Komentar'"
        @click="toggleComments"
      >
        <MessageCircle :size="17" />
        <span class="action-count">{{ formatCount(commentsCount) }}</span>
      </button>

      <!-- 3. KUTIP (QUOTE) BUTTON -->
      <button
        type="button"
        class="action-btn action-btn--quote"
        title="Kutip Fess Ini"
        aria-label="Kutip Fess"
        @click="quoteThisFess"
      >
        <Quote :size="16" />
        <span class="action-label-quote">Kutip</span>
      </button>

      <!-- 4. SHARE BUTTON & POPOVER -->
      <div class="share-dropdown-wrapper">
        <button
          type="button"
          class="action-btn"
          title="Bagikan"
          aria-label="Bagikan"
          @click="toggleShareMenu"
        >
          <Share2 :size="17" />
        </button>

        <div v-if="showShareMenu" class="share-popover-menu">
          <button type="button" class="share-menu-item" @click="quoteThisFess">
            <Quote :size="14" />
            <span>Kutip Fess Ini</span>
          </button>
          <button type="button" class="share-menu-item" @click="copyFessLink">
            <Copy :size="14" />
            <span>Salin Tautan</span>
          </button>
          <button
            v-if="canManageInstagram"
            type="button"
            class="share-menu-item"
            @click="shareToInstagram"
          >
            <Instagram :size="14" />
            <span>Post ke Feed Instagram</span>
          </button>
          <button type="button" class="share-menu-item" @click="shareToTwitter">
            <Twitter :size="14" />
            <span>Bagikan ke X / Twitter</span>
          </button>
        </div>
      </div>

      <!-- 4. SIMPAN (BOOKMARK) BUTTON -->
      <button
        type="button"
        class="action-btn action-btn--bookmark"
        :class="{ saved: isSaved }"
        :title="isSaved ? 'Hapus Simpanan' : 'Simpan'"
        :disabled="bookmarkPending"
        :aria-busy="bookmarkPending"
        @click="toggleBookmark"
      >
        <Bookmark :size="17" :fill="isSaved ? 'currentColor' : 'none'" />
      </button>

      <!-- 5. ADMIN MODERASI & AUTO-POST -->
      <div v-if="isAdmin && isManagedBasePost" class="admin-quick-actions">
        <template v-if="post.status === 'pending'">
          <button
            type="button"
            class="btn-mod-approve"
            title="Setujui dan Terbitkan"
            @click="$emit('approve', post.id)"
          >
            <Check :size="13" />
            <span>Setujui</span>
          </button>
          <button
            type="button"
            class="btn-mod-hide"
            title="Sembunyikan atau Tolak"
            @click="$emit('reject', post.id)"
          >
            <span>Tolak</span>
          </button>
        </template>
        <button
          v-if="canManageInstagram"
          type="button"
          class="btn-mod-ig"
          :class="{ 'is-posted': post.postedToIg }"
          title="Auto-Post Card ke Instagram Feed"
          @click="shareToInstagram"
        >
          <Instagram :size="13" />
          <span>{{ post.postedToIg ? 'Feed ✓' : 'Post IG' }}</span>
        </button>
      </div>
    </footer>

    <!-- TOAST NOTIFICATION -->
    <div v-if="showToast" class="action-toast">
      <Check :size="13" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- COMMENTS THREAD -->
    <div v-if="showComments" class="comments-section-container">
      <div class="comments-header">
        <span class="comments-header-title">Komentar ({{ commentsCount }})</span>
      </div>

      <!-- Loading / Error / Empty states -->
      <p v-if="commentsLoading" class="comment-state-text">Memuat komentar…</p>
      <p v-else-if="commentsError" class="comment-state-text">
        Komentar gagal dimuat.
        <button type="button" class="btn-reply-link" @click="loadComments">Coba lagi</button>
      </p>
      <p v-else-if="!commentsList.length" class="comment-state-text">
        Belum ada komentar. Jadilah yang pertama!
      </p>

      <!-- Comments List -->
      <div v-else class="comments-list">
        <div v-for="comment in commentsList" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            <UserRound :size="12" />
          </div>
          <div class="comment-content-box">
            <div class="comment-meta-row">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>

            <!-- Reply Button (mention-style, flat thread) -->
            <div class="comment-action-links">
              <button type="button" class="btn-reply-link" @click="initiateReply(comment)">
                <CornerDownRight :size="12" />
                <span>Balas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comment / Reply Input Form -->
      <form class="comment-input-form" @submit.prevent="submitComment">
        <!-- Reply Target Chip Indicator -->
        <div v-if="replyTarget" class="reply-target-indicator">
          <span>Membalas {{ replyTarget.author }}</span>
          <button type="button" class="btn-cancel-reply" @click="cancelReply">
            <X :size="12" />
          </button>
        </div>

        <div class="input-row-flex">
          <input
            v-model="newCommentText"
            type="text"
            :placeholder="
              replyTarget ? `Balas ${replyTarget.author}...` : 'Tulis komentar anonim kamu...'
            "
            class="comment-text-field"
            maxlength="280"
          />
          <button
            type="submit"
            class="btn-submit-comment"
            :disabled="!newCommentText.trim() || commentsSending"
          >
            {{ commentsSending ? 'Mengirim…' : 'Kirim' }}
          </button>
        </div>
      </form>
    </div>

    <!-- REPORT MODAL DIALOG -->
    <ReportFessModal
      :show="showReportModal"
      :fess-id="post.id"
      :fess-handle="post.handle || post.senderHandle"
      @close="showReportModal = false"
      @submitted="handleReportSubmitted"
    />

    <!-- PENAMPIL MEDIA GAYA X / THREADS (foto + video menyatu) -->
    <MediaViewer
      v-if="viewerOpen"
      :items="allMedia"
      :initial-index="viewerIndex"
      :origin-rect="viewerOriginRect"
      :resolve-origin="resolveMediaOrigin"
      :post="viewerPostInfo"
      @close="closeViewer"
    />

    <!-- INSTAGRAM STORY AUTO-POST PREVIEW MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showInstagramModal"
          class="ig-story-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Feed Auto-Post"
          @click.self="showInstagramModal = false"
        >
          <div class="ig-story-modal-box" @click.stop>
            <div class="ig-story-modal-header">
              <div class="ig-story-header-left">
                <div class="ig-story-avatar-icon">
                  <Instagram :size="18" />
                </div>
                <div>
                  <h3 class="ig-story-title">Instagram Feed Auto-Post</h3>
                  <p class="ig-story-sub">Visual card confession 4:5 untuk Instagram Feed base</p>
                </div>
              </div>
              <button
                type="button"
                class="btn-close-modal"
                aria-label="Tutup"
                @click="showInstagramModal = false"
              >
                <X :size="18" />
              </button>
            </div>

            <div class="ig-story-modal-body">
              <!-- Loading State -->
              <div v-if="igPostLoading" class="ig-story-loading-state">
                <Loader2 :size="32" class="spin mb-2" />
                <p class="font-bold">Merender Card &amp; Memproses Auto-Post…</p>
                <p class="text-xs text-muted">
                  Mengonversi template card menjadi visual Feed 4:5 resolusi tinggi…
                </p>
              </div>

              <!-- Content Preview State -->
              <div v-else class="ig-story-preview-container">
                <div
                  class="ig-story-status-pill"
                  :class="{
                    success: igPostData?.meta_published || post.postedToIg,
                    pending:
                      igPostData?.ig_pending && !igPostData?.meta_published && !post.postedToIg,
                  }"
                >
                  <CheckCircle2 v-if="igPostData?.meta_published || post.postedToIg" :size="14" />
                  <Loader2 v-else-if="igPostData?.ig_pending" :size="14" class="spin" />
                  <Sparkles v-else :size="14" />
                  <span>
                    {{
                      igPostData?.message ||
                      (post.postedToIg
                        ? `Telah diposting otomatis ke Instagram Feed ${post.handle}`
                        : `Card fess siap diposting ke Feed Instagram`)
                    }}
                  </span>
                </div>

                <!-- Preview Image Frame (4:5 Aspect Ratio) -->
                <div class="ig-story-card-frame">
                  <img
                    v-if="igPostData?.imageUrl || igPostData?.image_url"
                    :src="igPostData.imageUrl || igPostData.image_url"
                    alt="Card Fess Feed"
                    class="ig-story-rendered-img"
                  />
                  <div v-else class="ig-story-fallback-card">
                    <p class="text-sm font-bold">{{ post.content }}</p>
                    <span class="text-xs text-muted mt-2">{{ post.handle }}</span>
                  </div>
                </div>

                <!-- Thumbnail carousel (jika teks panjang → beberapa card) -->
                <div v-if="igCardUrls.length > 1" class="ig-card-strip">
                  <img
                    v-for="(url, i) in igCardUrls"
                    :key="url + i"
                    :src="url"
                    :alt="`Card ${i + 1} dari ${igCardUrls.length}`"
                    class="ig-card-strip-img"
                  />
                </div>
                <p v-if="igCardUrls.length > 1 || igMediaCount > 0" class="ig-card-strip-note">
                  {{ igCarouselSummary }}
                </p>

                <!-- Action Buttons -->
                <div class="ig-story-actions-row">
                  <a
                    v-if="igPostData?.imageUrl || igPostData?.image_url"
                    :href="igPostData.imageUrl || igPostData.image_url"
                    download="fess_feed_card.png"
                    target="_blank"
                    class="btn-ig-action btn-download"
                  >
                    <Download :size="15" />
                    <span>Unduh Card Feed HD</span>
                  </a>
                  <button type="button" class="btn-ig-action btn-open-ig" @click="openInstagramApp">
                    <Instagram :size="15" />
                    <span>Buka Instagram</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup>
/**
 * FessCard.vue — Unified Confession Card for both User Feed and Admin Dashboard.
 *
 * Shared Features:
 *  - Interactive Like with counter updates
 *  - Expandable Comments & nested replies with reply chip
 *  - Share menu popover (Copy link, Story, X) with toast trigger
 *  - Bookmark / Simpan toggle
 *  - Report modal dialog (ReportFessModal)
 *  - Admin Moderation actions (Setujui / Tolak) when isAdmin is true
 *
 * Aesthetics:
 *  - 100% theme-token bound (--shell-card, --shell-border, --shell-text, --shell-sub-accent)
 *  - Zero emojis, Lucide SVG icons only.
 */
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  UserRound,
  Pin,
  Flag,
  Copy,
  Instagram,
  Twitter,
  Check,
  Clock,
  CornerDownRight,
  X,
  Quote,
  ShieldAlert,
  Trash2,
  Download,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-vue-next';
import ReportFessModal from './ReportFessModal.vue';
import MediaViewer from './MediaViewer.vue';
import { api } from '../../api';
import { mapFessComment } from '../../utils/fessMapper';
import { useAuthStore } from '../../stores/authStore';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  /** Daftar "Fess Saya": badge status milik sendiri selalu terlihat. */
  showOwnStatus: {
    type: Boolean,
    default: false,
  },
  /** Halaman detail fess (/fess/:id): buka thread komentar otomatis. */
  commentsOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'like',
  'bookmark',
  'comment',
  'reply',
  'share',
  'report',
  'approve',
  'reject',
  'takeDown',
]);

const authStore = useAuthStore();

/**
 * True bila fess berasal dari base yang dikelola user (admin base tsb atau
 * Super Admin) — dipakai badge status, badge NLP, dan tombol take down.
 */
const isManagedBasePost = computed(() => {
  if (!props.post?.handle) return false;
  if (authStore.user?.role === 'Super Admin') return true;

  const postHandle = String(props.post.handle).replace(/^@/, '').toLowerCase();
  const managed = authStore.user?.managedBases || [];
  return managed.some((h) => String(h).replace(/^@/, '').toLowerCase() === postHandle);
});

/**
 * Badge status "Terbit"/"Antrean"/"Ditolak" hanya terlihat oleh yang memegang
 * base dari fess tersebut (Base Admin pemiliknya / Super Admin), atau di
 * daftar "Fess Saya" milik pengirim itu sendiri (showOwnStatus).
 */
const showStatusBadge = computed(() => {
  if (!props.post?.status) return false;
  if (props.showOwnStatus) return true;
  if (!props.isAdmin) return false;
  return isManagedBasePost.value;
});

/** Take down hanya untuk admin base yang memegang fess ber-status terbit. */
const canTakeDown = computed(
  () => props.isAdmin && props.post?.status === 'approved' && isManagedBasePost.value,
);

/** Posting/retry Instagram = admin pengelola base, hanya untuk fess terbit
 *  yang belum pernah sukses dipublikasikan (mencegah duplikat). */
const canManageInstagram = computed(
  () =>
    props.isAdmin &&
    isManagedBasePost.value &&
    // Flag dari server bersifat otoritatif. `undefined` berarti payload lama
    // (mis. endpoint non-admin), jadi cek kepemilikan lokal tetap dipakai.
    props.post?.canManageInstagram !== false &&
    ['approved', 'published'].includes(props.post?.status) &&
    !props.post?.postedToIg,
);

const statusBadgeLabel = computed(() => {
  if (props.post?.status === 'approved') return 'Terbit';
  if (props.post?.status === 'pending') return 'Antrean';
  if (props.post?.status === 'rejected') return 'Ditolak';
  return '';
});

const statusBadgeClass = computed(() => {
  if (props.post?.status === 'approved') return 'badge-approved';
  if (props.post?.status === 'rejected') return 'badge-rejected';
  return 'badge-pending';
});

/* 1. LIKE STATE */
const isLiked = ref(props.post.isLiked || false);
const likesCount = ref(props.post.likes ?? 0);

/** Jika URL/data-URI avatar rusak, tampilkan inisial alih-alih gambar kosong. */
const avatarFailed = ref(false);
watch(
  () => props.post?.avatarImg,
  () => {
    avatarFailed.value = false;
  },
);

function toggleLike() {
  isLiked.value = !isLiked.value;
  likesCount.value += isLiked.value ? 1 : -1;
  emit('like', { id: props.post.id, isLiked: isLiked.value, count: likesCount.value });
}

/* 2. BOOKMARK STATE */
const isSaved = ref(Boolean(props.post.isSaved));
const bookmarkPending = ref(false);

// Sinkronkan kartu saat daftar induk di-refresh (mis. tab Tersimpan).
watch(
  () => props.post?.isSaved,
  (value) => {
    isSaved.value = Boolean(value);
  }
);

async function toggleBookmark() {
  if (bookmarkPending.value) return;

  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    });
    return;
  }

  const next = !isSaved.value;
  const previous = isSaved.value;
  isSaved.value = next;
  bookmarkPending.value = true;

  try {
    if (next) {
      await api.bookmarkFess(props.post.id);
    } else {
      await api.unbookmarkFess(props.post.id);
    }
    triggerToast(
      next ? 'Fess disimpan ke tab Tersimpan' : 'Fess dihapus dari simpanan'
    );
    emit('bookmark', { id: props.post.id, isSaved: next });
  } catch (err) {
    isSaved.value = previous;
    triggerToast(
      err?.status === 401
        ? 'Sesi kamu berakhir. Masuk lagi untuk menyimpan fess.'
        : next
          ? 'Gagal menyimpan fess. Coba lagi.'
          : 'Gagal menghapus simpanan. Coba lagi.'
    );
  } finally {
    bookmarkPending.value = false;
  }
}

/* MEDIA HANDLING (PHOTOS & VIDEOS — kolase menyatu ala X/Threads) */
const parsedMedia = computed(() => {
  const p = props.post;
  if (!p) return [];
  if (Array.isArray(p.media) && p.media.length) {
    return p.media;
  }
  const list = [];
  if (Array.isArray(p.images) && p.images.length) {
    p.images.forEach((img) => list.push({ type: 'image', url: img }));
  } else if (p.image) {
    list.push({ type: 'image', url: p.image });
  }
  if (p.video) {
    list.push({
      type: 'video',
      url: typeof p.video === 'string' ? p.video : p.video.url,
      thumbnail: p.video.thumbnail,
      duration: p.video.duration,
      caption: p.video.caption,
    });
  }
  return list;
});

/** Daftar media gabungan (foto + video) sesuai urutan aslinya. */
const allMedia = computed(() =>
  parsedMedia.value
    .map((m) => {
      if (typeof m === 'string') return { type: 'image', url: m };
      if (!m || typeof m.url !== 'string') return null;
      return { ...m, type: m.type === 'video' ? 'video' : 'image' };
    })
    .filter((m) => m && m.url.length > 0),
);

const hasMedia = computed(() => allMedia.value.length > 0);

/* PENAMPIL MEDIA FULL-SCREEN (gaya X / Threads) */
const viewerOpen = ref(false);
const viewerIndex = ref(0);
const viewerOriginRect = ref(null);
const cardRootRef = ref(null);

/** Rect slide media di karosel (untuk animasi "menyatu" buka/tutup viewer). */
function resolveMediaOrigin(index) {
  const root = cardRootRef.value;
  if (!root || typeof root.querySelector !== 'function') return null;
  const el = root.querySelector(`[data-media-index="${index}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

const viewerPostInfo = computed(() => ({
  handle: props.post?.handle || props.post?.senderHandle || '@anonim',
  avatarText: props.post?.avatarText,
  avatarBg: props.post?.avatarBg,
  avatarImg: props.post?.avatarImg,
  content: props.post?.content || '',
  time: props.post?.time || 'Baru saja',
}));

/** Buka viewer dari tile yang diketuk — dengan animasi "menyatu" (grid → satu media). */
function openViewer(index = 0, evt = null) {
  viewerIndex.value = Math.max(0, Math.min(index, allMedia.value.length - 1));

  let rect = null;
  const el = evt?.currentTarget;
  if (el && typeof el.getBoundingClientRect === 'function') {
    const r = el.getBoundingClientRect();
    rect = { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  viewerOriginRect.value = rect;
  viewerOpen.value = true;
}

function closeViewer() {
  viewerOpen.value = false;
  pinchGapScale.value = 1; // gap antar foto kembali normal setelah viewer ditutup
}

/* KAROSEL MEDIA (gaya X/Threads): foto berjejer horizontal, berikutnya mengintip */
const CAROUSEL_GAP = 8; // jarak antar media di deretan (px)

const carouselOffset = ref(0); // posisi geser bebas (px) — bisa berhenti di mana saja
const carouselDragging = ref(false);
const carouselMoved = ref(false);
const carouselWheelActive = ref(false);
const carouselViewportRef = ref(null);
const carouselWidth = ref(0);
const mediaRatios = ref({});

const pinchGapScale = ref(1); // 1 = gap normal, 0 = foto menyatu (gap antar foto hilang)
const pinchActive = ref(false);

const carouselVideoEls = new Map(); // mediaIdx → elemen <video> karosel
const carouselInView = ref(true);
let carouselViewObserver = null;
let carouselVisibilityHandler = null;

const carouselPointers = new Map(); // pointerId → { x, y }
let carouselStartX = 0;
let carouselStartY = 0;
let carouselStartOffset = 0;
let carouselPinchStart = 0;
let carouselCaptured = false;
let pinchWasActive = false;
let pointerVelocity = 0; // px/ms (positif = jari bergerak ke kanan)
let lastPointerX = 0;
let lastPointerTime = 0;
let trackpadPinchAccum = 0;
let trackpadPinchTimer = null;
let carouselWheelTimer = null;
let carouselResizeObserver = null;

/** Rasio media aktif (dibatasi 4:5 – 1.91:1 seperti standar feed). */
const activeRatio = computed(() => {
  const raw = Number(mediaRatios.value[carouselIndex.value]);
  const ratio = Number.isFinite(raw) && raw > 0 ? raw : 0.8;
  return Math.min(1.91, Math.max(0.8, ratio));
});

/** Lebar tiap media — tidak penuh agar media berikutnya mengintip di kanan. */
const carouselSlideWidth = computed(() => {
  if (carouselWidth.value <= 0) return 0;
  if (allMedia.value.length <= 1) return carouselWidth.value; // media tunggal: penuh
  const peek = Math.min(72, Math.max(44, carouselWidth.value * 0.16));
  return Math.max(120, carouselWidth.value - peek);
});

/** Gap antar media saat ini — mengecil saat dicubit (foto menyatu). */
const carouselGap = computed(() => CAROUSEL_GAP * pinchGapScale.value);

/** Langkah geser antar media (lebar slide + gap). */
const carouselStep = computed(() => carouselSlideWidth.value + carouselGap.value);

/** Batas geser maksimum — deretan tidak bisa ditarik melewati ujung kanan. */
const carouselMaxOffset = computed(() => {
  const n = allMedia.value.length;
  if (n <= 1 || carouselWidth.value <= 0) return 0;
  const content = n * carouselSlideWidth.value + (n - 1) * carouselGap.value;
  return Math.max(0, content - carouselWidth.value);
});

/** Media paling dekat dengan posisi geser saat ini (untuk tinggi frame & viewer). */
const carouselIndex = computed(() => {
  const step = carouselStep.value || 1;
  const idx = Math.round(carouselOffset.value / step);
  return Math.max(0, Math.min(idx, Math.max(0, allMedia.value.length - 1)));
});

/** Tinggi deretan mengikuti rasio media aktif — dianimasikan ala Threads. */
const carouselViewportStyle = computed(() => {
  const w = carouselSlideWidth.value;
  if (w <= 0) return {};
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const cap = Math.min(560, Math.max(320, vh * 0.8));
  const h = Math.min(cap, Math.max(150, w / activeRatio.value));
  return {
    '--slide-w': `${Math.round(w)}px`,
    height: `${Math.round(h)}px`,
  };
});

const carouselTrackStyle = computed(() => ({
  gap: `${carouselGap.value.toFixed(2)}px`,
  transform: `translate3d(${Math.round(-carouselOffset.value)}px, 0, 0)`,
  transition:
    carouselDragging.value || pinchActive.value || carouselWheelActive.value
      ? 'none'
      : 'transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1), gap 240ms ease',
}));

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Catat rasio asli media supaya tinggi frame karosel pas (tanpa crop besar). */
function recordMediaRatio(index, el) {
  const w = (el && (el.naturalWidth || el.videoWidth)) || 0;
  const h = (el && (el.naturalHeight || el.videoHeight)) || 0;
  if (w > 0 && h > 0 && !mediaRatios.value[index]) {
    mediaRatios.value = { ...mediaRatios.value, [index]: w / h };
  }
}

/** Daftarkan elemen video karosel agar bisa diputar hanya saat tampil. */
function registerCarouselVideo(index, el) {
  if (el) carouselVideoEls.set(index, el);
  else carouselVideoEls.delete(index);
}

/** Autoplay video karosel: video aktif langsung berputar — tanpa ikon play. */
function syncCarouselVideos() {
  const active = carouselIndex.value;
  const canPlay = !viewerOpen.value && carouselInView.value && !document.hidden;
  carouselVideoEls.forEach((el, idx) => {
    if (canPlay && idx === active) {
      if (el.paused) {
        const p = el.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } else if (!el.paused) {
      el.pause();
    }
  });
}

watch([carouselIndex, viewerOpen, carouselInView], syncCarouselVideos);

/** Pindahkan deretan supaya media ke-index berhenti di tepi kiri. */
function goToMedia(index) {
  if (index < 0 || index > allMedia.value.length - 1) return;
  const step = carouselStep.value || 1;
  carouselOffset.value = Math.max(0, Math.min(index * step, carouselMaxOffset.value));
}

function onSlideClick(index, evt) {
  if (carouselMoved.value) return; // barusan menggeser, bukan mengetuk
  const step = carouselStep.value || 1;
  const snapOffset = Math.min(index * step, carouselMaxOffset.value);
  if (Math.abs(carouselOffset.value - snapOffset) > 2) {
    goToMedia(index); // ketuk media lain yang terlihat → pindahkan ke tepi kiri
    return;
  }
  openViewer(index, evt);
}

/** Akhiri cubit: kalau gap sudah hampir penuh menutup → buka viewer (foto menyatu). */
function finishPinch() {
  carouselPinchStart = 0;
  pinchActive.value = false;

  if (pinchGapScale.value <= 0.35) {
    const viewport = carouselViewportRef.value;
    let rect = null;
    if (viewport && typeof viewport.getBoundingClientRect === 'function') {
      const r = viewport.getBoundingClientRect();
      rect = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    viewerIndex.value = carouselIndex.value;
    viewerOriginRect.value = rect;
    viewerOpen.value = true;
    // Gap dibiarkan tertutup selama viewer terbuka; dipulihkan saat closeViewer().
  } else {
    pinchGapScale.value = 1;
  }
}

/* Drag dinamis via pointer events — jalan untuk sentuh DAN mouse. */
function onCarouselPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  carouselPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (carouselPointers.size === 2) {
    // Dua jari → mode cubit (foto menyatu).
    const pts = [...carouselPointers.values()];
    carouselPinchStart = pointerDistance(pts[0], pts[1]);
    pinchWasActive = true;
    pinchActive.value = true;
    carouselMoved.value = true; // klik sisa dari gesture cubit jangan membuka viewer
    carouselDragging.value = false;
    return;
  }
  if (carouselPointers.size !== 1) return;

  carouselPinchStart = 0;
  pinchWasActive = false;
  carouselCaptured = false;
  carouselDragging.value = true;
  carouselMoved.value = false;
  carouselStartX = e.clientX;
  carouselStartY = e.clientY;
  carouselStartOffset = carouselOffset.value;
  pointerVelocity = 0;
  lastPointerX = e.clientX;
  lastPointerTime = performance.now();
}

function onCarouselPointerMove(e) {
  if (carouselPointers.has(e.pointerId)) {
    carouselPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  // Cubit: gap antar foto menutup secara live → foto menyatu.
  if (pinchWasActive && carouselPointers.size >= 2 && carouselPinchStart > 0) {
    const pts = [...carouselPointers.values()];
    const scale = pointerDistance(pts[0], pts[1]) / carouselPinchStart;
    pinchGapScale.value = Math.max(0, Math.min(1, 1 - Math.abs(1 - scale) * 2.2));
    return;
  }

  if (!carouselDragging.value) return;

  const dx = e.clientX - carouselStartX;
  const dy = e.clientY - carouselStartY;

  if (!carouselMoved.value) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      carouselDragging.value = false; // serahkan ke scroll vertikal halaman
      return;
    }
    carouselMoved.value = true;
    // Pointer capture dipasang saat drag benar-benar mulai (bukan saat tap),
    // supaya event click pada foto tetap mengarah ke slide-nya.
    if (!carouselCaptured) {
      carouselCaptured = true;
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch {
        /* pointer capture tidak tersedia — abaikan */
      }
    }
  }

  // Kecepatan jari (px/ms) untuk momentum saat dilepas.
  const now = performance.now();
  const dt = now - lastPointerTime;
  if (dt > 0) {
    const inst = (e.clientX - lastPointerX) / dt;
    pointerVelocity = pointerVelocity * 0.7 + inst * 0.3;
  }
  lastPointerX = e.clientX;
  lastPointerTime = now;

  // Geser bebas 1:1 — bisa berhenti di posisi mana pun; sedikit kenyal di ujung.
  const max = carouselMaxOffset.value;
  let next = carouselStartOffset - dx;
  if (next < 0) next *= 0.35;
  else if (next > max) next = max + (next - max) * 0.35;

  carouselOffset.value = next;
}

function onCarouselPointerUp(e) {
  carouselPointers.delete(e.pointerId);
  carouselCaptured = false;

  if (pinchWasActive) {
    if (carouselPointers.size === 0) {
      pinchWasActive = false;
      finishPinch();
    }
    return;
  }

  if (!carouselDragging.value) return;
  carouselDragging.value = false;

  // Geser bebas: dilepas di mana pun → berhenti di situ (plus momentum singkat),
  // tanpa dipaksa snap ke media terdekat.
  const max = carouselMaxOffset.value;
  const idle = performance.now() - lastPointerTime;
  if (idle > 90) pointerVelocity = 0; // jari sempat diam dulu → tanpa lemparan
  let target = carouselOffset.value;
  if (target <= 0 || target >= max) {
    target = target <= 0 ? 0 : max; // memantul kembali dari ujung
  } else {
    const v = Math.max(-2.4, Math.min(2.4, pointerVelocity)); // px/ms
    target = Math.max(0, Math.min(carouselOffset.value - v * 180, max));
  }
  carouselOffset.value = target;
  pointerVelocity = 0;
}

function onCarouselPointerLeave(e) {
  if (carouselCaptured) return; // drag berjalan dengan pointer capture — biarkan
  carouselPointers.delete(e.pointerId);
  if (carouselPointers.size === 0 && !pinchWasActive) {
    carouselDragging.value = false;
  }
}

/** Cubit di trackpad/laptop (ctrl+wheel) — efek menyatu yang sama. */
function onCarouselWheel(e) {
  // Cubit trackpad → foto menyatu.
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    trackpadPinchAccum += e.deltaY;
    pinchActive.value = true;
    const magnitude = Math.min(1, Math.abs(trackpadPinchAccum) / 160);
    pinchGapScale.value = Math.max(0, 1 - magnitude);

    if (trackpadPinchTimer) clearTimeout(trackpadPinchTimer);
    trackpadPinchTimer = setTimeout(() => {
      trackpadPinchTimer = null;
      trackpadPinchAccum = 0;
      finishPinch();
    }, 200);
    return;
  }

  // Geser bebas dengan trackpad (swipe horizontal) — bisa berhenti di mana saja.
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
  if (!delta) return; // gulir vertikal → biarkan scroll halaman
  e.preventDefault();

  carouselWheelActive.value = true;
  carouselOffset.value = Math.max(
    0,
    Math.min(carouselOffset.value + delta, carouselMaxOffset.value),
  );

  if (carouselWheelTimer) clearTimeout(carouselWheelTimer);
  carouselWheelTimer = setTimeout(() => {
    carouselWheelTimer = null;
    carouselWheelActive.value = false;
  }, 140);
}

/** Cubit trackpad Safari (gesture events) — efek menyatu yang sama. */
function onCarouselGesture(e) {
  if (typeof e.preventDefault === 'function') e.preventDefault();
  pinchActive.value = true;
  const scale = typeof e.scale === 'number' && e.scale > 0 ? e.scale : 1;
  const magnitude = Math.min(1, Math.abs(1 - scale) * 3);
  pinchGapScale.value = Math.max(0, 1 - magnitude);

  if (trackpadPinchTimer) clearTimeout(trackpadPinchTimer);
  trackpadPinchTimer = setTimeout(() => {
    trackpadPinchTimer = null;
    finishPinch();
  }, 200);
}

onMounted(() => {
  const el = carouselViewportRef.value;
  if (el) carouselWidth.value = el.clientWidth;
  if (el && typeof ResizeObserver !== 'undefined') {
    carouselResizeObserver = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width || 0;
      if (w > 0) carouselWidth.value = w;
    });
    carouselResizeObserver.observe(el);
  }
  if (el && typeof IntersectionObserver !== 'undefined') {
    carouselViewObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) carouselInView.value = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    carouselViewObserver.observe(el);
  }
  carouselVisibilityHandler = () => syncCarouselVideos();
  document.addEventListener('visibilitychange', carouselVisibilityHandler);
  nextTick(() => syncCarouselVideos());
  // Halaman detail fess: thread komentar langsung terbuka tanpa klik.
  if (showComments.value) loadComments();
});

onBeforeUnmount(() => {
  if (carouselResizeObserver) {
    carouselResizeObserver.disconnect();
    carouselResizeObserver = null;
  }
  if (carouselViewObserver) {
    carouselViewObserver.disconnect();
    carouselViewObserver = null;
  }
  if (carouselVisibilityHandler) {
    document.removeEventListener('visibilitychange', carouselVisibilityHandler);
    carouselVisibilityHandler = null;
  }
  if (trackpadPinchTimer) {
    clearTimeout(trackpadPinchTimer);
    trackpadPinchTimer = null;
  }
  if (carouselWheelTimer) {
    clearTimeout(carouselWheelTimer);
    carouselWheelTimer = null;
  }
});

/** Jaga posisi geser tetap dalam batas saat lebar/daftar media berubah. */
watch(carouselMaxOffset, (max) => {
  if (carouselOffset.value > max) carouselOffset.value = Math.max(0, max);
});

/** Reset posisi karosel saat daftar media berubah (mis. setelah edit fess). */
watch(allMedia, () => {
  carouselOffset.value = 0;
  mediaRatios.value = {};
  pinchGapScale.value = 1;
  pinchActive.value = false;
  carouselPointers.clear();
  pinchWasActive = false;
  nextTick(() => syncCarouselVideos());
});

/* 3. SHARE MENU & TOAST */
const showShareMenu = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
let toastTimer = null;

function triggerToast(msg) {
  toastMessage.value = msg;
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
  }, 2200);
}

function toggleShareMenu() {
  showShareMenu.value = !showShareMenu.value;
}

function copyFessLink() {
  showShareMenu.value = false;
  const link = `${window.location.origin}/fess/${props.post.id}`;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(link).catch(() => {});
  }
  triggerToast('Tautan fess disalin ke clipboard');
  emit('share', { id: props.post.id, platform: 'link' });
}

function shareToInstagram() {
  if (!canManageInstagram.value) {
    triggerToast('Hanya admin base yang dapat memposting fess ini ke Instagram.');
    return;
  }
  showShareMenu.value = false;
  openInstagramStoryAutoPost();
}

const showInstagramModal = ref(false);
const igPostLoading = ref(false);
const igPostData = ref(null);

/**
 * Polling ringan status IG selama masih processing/pending. Endpoint khusus
 * ini tidak memuat komentar, jadi badge bisa berubah tanpa refresh halaman.
 */
const IG_STATUS_POLL_MS = 3500;
const IG_STATUS_POLL_MAX_MS = 5 * 60_000;
let igStatusPollTimer = null;
let igStatusPolling = false;
let igStatusPollStartedAt = 0;

function stopIgStatusPoll() {
  if (igStatusPollTimer) {
    clearInterval(igStatusPollTimer);
    igStatusPollTimer = null;
  }
}

async function pollIgStatus() {
  if (igStatusPolling || document.hidden) return;

  const postId = props.post?.id;
  if (!postId || !['processing', 'pending'].includes(props.post?.igStatus)) {
    stopIgStatusPoll();
    return;
  }
  if (Date.now() - igStatusPollStartedAt > IG_STATUS_POLL_MAX_MS) {
    stopIgStatusPoll();
    return;
  }

  igStatusPolling = true;
  try {
    const res = await api.getFessIgStatus(String(postId));
    const data = res?.data || res;
    if (!data || String(data.id) !== String(props.post?.id)) return;

    if (data.ig_status) props.post.igStatus = data.ig_status;
    if (typeof data.posted_to_ig === 'boolean') props.post.postedToIg = data.posted_to_ig;
    if (data.ig_attempts != null) props.post.igAttempts = Number(data.ig_attempts) || 0;
    if (data.ig_updated_at !== undefined) props.post.igUpdatedAt = data.ig_updated_at;
    // Detail error hanya dikirim backend untuk admin pengelola base.
    if (Object.prototype.hasOwnProperty.call(data, 'ig_error')) {
      props.post.igError = data.ig_error || null;
    }
  } catch {
    // Biarkan interval berikutnya mencoba lagi.
  } finally {
    igStatusPolling = false;
    if (!['processing', 'pending'].includes(props.post?.igStatus)) {
      stopIgStatusPoll();
    }
  }
}

function startIgStatusPoll() {
  if (igStatusPollTimer) return;
  igStatusPollStartedAt = Date.now();
  igStatusPollTimer = setInterval(pollIgStatus, IG_STATUS_POLL_MS);
}

watch(
  () => [props.post?.id, props.post?.igStatus, props.post?.postedToIg],
  ([id, status, posted], [previousId] = []) => {
    if (id !== previousId) stopIgStatusPoll();
    if (!posted && ['processing', 'pending'].includes(status)) startIgStatusPoll();
    else stopIgStatusPoll();
  },
  { immediate: true },
);

onBeforeUnmount(stopIgStatusPoll);

/** Daftar gambar card hasil render (1 gambar = feed biasa, >1 = carousel). */
const igCardUrls = computed(() => {
  const raw = igPostData.value?.image_urls || igPostData.value?.imageUrls || [];
  if (Array.isArray(raw) && raw.length) return raw;
  const single = igPostData.value?.imageUrl || igPostData.value?.image_url;
  return single ? [single] : [];
});

/** Jumlah media user (gambar/video) yang ikut diposting ke Instagram. */
const igMediaCount = computed(() => {
  const n = Number(igPostData.value?.media_count);
  return Number.isFinite(n) && n > 0 ? n : 0;
});

/** Ringkasan isi carousel: jumlah card + media user. */
const igCarouselSummary = computed(() => {
  const parts = [];
  if (igCardUrls.value.length > 1) parts.push(`${igCardUrls.value.length} card`);
  if (igMediaCount.value > 0) parts.push(`${igMediaCount.value} media`);
  return `${parts.join(' + ')} • diposting sebagai carousel Instagram`;
});

async function openInstagramStoryAutoPost() {
  showInstagramModal.value = true;
  igPostLoading.value = true;
  igPostData.value = null;

  try {
    const res = await api.postFessToInstagram(props.post.id, {
      template: props.post.template || 'default',
      // Semua posting Instagram 4:5; backend juga memaksa portrait.
      aspect: 'portrait',
    });
    igPostData.value = res?.data || res;

    // Sinkronkan status di kartu agar badge/error langsung berubah tanpa reload.
    props.post.igStatus =
      igPostData.value?.ig_status ||
      (igPostData.value?.meta_published
        ? 'published'
        : igPostData.value?.ig_pending
          ? 'pending'
          : 'failed');
    props.post.igError = igPostData.value?.ig_error || null;
    props.post.igAttempts =
      Number(igPostData.value?.ig_result?.ig_attempts) || props.post.igAttempts || 0;

    if (igPostData.value?.meta_published) {
      props.post.postedToIg = true;
      const cardCount = igCardUrls.value.length;
      const mediaCount = igMediaCount.value;
      triggerToast(
        cardCount > 1 || mediaCount > 0
          ? `Card fess berhasil diposting ke Instagram Feed (carousel: ${cardCount} card${mediaCount > 0 ? ` + ${mediaCount} media` : ''})!`
          : 'Card fess berhasil diposting ke Instagram Feed!',
      );
    } else if (igPostData.value?.ig_pending) {
      triggerToast(
        'Video sedang diproses Instagram — postingan akan terbit otomatis dalam ±1 menit.',
      );
    } else if (igPostData.value?.retry_scheduled) {
      triggerToast('Gagal sementara — sistem mencoba lagi otomatis. Pantau badge status IG.');
    } else {
      const reason = igPostData.value?.ig_error || igPostData.value?.message;
      triggerToast(
        reason
          ? `Publikasi Instagram gagal: ${reason}`
          : 'Card fess selesai dirender — publikasi Instagram belum berhasil.',
      );
    }
  } catch (err) {
    console.error('Gagal memposting fess ke Instagram:', err);
    const reason =
      err?.response?.data?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      'Silakan coba lagi.';
    triggerToast(`Gagal memposting ke Instagram: ${reason}`);
  } finally {
    igPostLoading.value = false;
  }
}

function openInstagramApp() {
  window.open('https://instagram.com', '_blank');
}

function shareToTwitter() {
  showShareMenu.value = false;
  const text = encodeURIComponent(`"${props.post.content?.slice(0, 140)}..." via Fess n Curious`);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank');
  emit('share', { id: props.post.id, platform: 'twitter' });
}

const router = useRouter();

const isAuthorClickable = computed(() => {
  const h = props.post?.handle || props.post?.senderHandle;
  return Boolean(h && h.toLowerCase() !== '@anonim' && h.toLowerCase() !== 'anonim');
});

function navigateToAuthor(post) {
  const rawHandle = post?.handle || post?.senderHandle;
  if (!rawHandle || rawHandle.toLowerCase() === '@anonim' || rawHandle.toLowerCase() === 'anonim') {
    return;
  }
  const cleanHandle = String(rawHandle).replace(/^@/, '');
  router.push(`/base/${cleanHandle}`);
}

function saveAndNavigateQuote(targetFess) {
  if (!targetFess) return;
  showShareMenu.value = false;
  const quoteData = {
    id: targetFess.id,
    handle: targetFess.handle || targetFess.senderHandle || '@anonim',
    senderHandle: targetFess.senderHandle || targetFess.handle || '@anonim',
    time: targetFess.time || 'Baru saja',
    content: targetFess.content,
    avatarBg: targetFess.avatarBg || '#0038FF',
    avatarText:
      targetFess.avatarText ||
      (targetFess.handle ? targetFess.handle.slice(1, 3).toUpperCase() : 'QF'),
    tag: targetFess.tag,
  };

  try {
    sessionStorage.setItem('pending_quote_fess', JSON.stringify(quoteData));
  } catch (e) {
    console.error('Failed to store quote in session', e);
  }

  emit('quote', quoteData);
  router.push({
    path: '/create',
    query: { quoteId: targetFess.id },
  });
}

function quoteThisFess() {
  saveAndNavigateQuote(props.post);
}

/**
 * Buka fess yang dikutip di halaman detailnya (/fess/:id) — sama seperti
 * tautan "Salin Tautan". Untuk mengutip fess itu, tombol Kutip tersedia di
 * halaman detailnya.
 */
function openQuotedFess(target) {
  if (!target?.id) return;
  showShareMenu.value = false;
  router.push(`/fess/${target.id}`);
}

/* 4. COMMENTS STATE — comments are loaded live from the API */
const showComments = ref(props.commentsOpen);
const commentsCount = ref(props.post.commentsCount ?? props.post.comments?.length ?? 0);
const replyTarget = ref(null);
const newCommentText = ref('');

const commentsList = ref([]);
const commentsLoading = ref(false);
const commentsError = ref(null);
const commentsSending = ref(false);

async function loadComments() {
  commentsLoading.value = true;
  commentsError.value = null;
  try {
    const res = await api.getComments(props.post.id, { limit: 50 });
    const list = res?.data ?? res ?? [];
    commentsList.value = list.map(mapFessComment);
    commentsCount.value = Math.max(commentsCount.value, commentsList.value.length);
  } catch (e) {
    commentsError.value = e;
  } finally {
    commentsLoading.value = false;
  }
}

function toggleComments() {
  showComments.value = !showComments.value;
  if (showComments.value) {
    loadComments();
  } else {
    replyTarget.value = null;
  }
}

function initiateReply(comment) {
  replyTarget.value = comment;
  // Flat comment thread: reply as a mention-style comment.
  const mention = `${comment.author} `;
  if (!newCommentText.value.startsWith(mention)) {
    newCommentText.value = mention;
  }
}

function cancelReply() {
  replyTarget.value = null;
}

async function submitComment() {
  const text = newCommentText.value.trim();
  if (!text || commentsSending.value) return;

  commentsSending.value = true;
  try {
    await api.addComment(props.post.id, text);
    emit('comment', { postId: props.post.id, text });
    newCommentText.value = '';
    replyTarget.value = null;
    await loadComments();
    commentsCount.value = Math.max(commentsCount.value, commentsList.value.length);
  } catch (e) {
    triggerToast('Gagal mengirim komentar. Coba lagi.');
  } finally {
    commentsSending.value = false;
  }
}

/* 5. REPORT MODAL STATE */
const showReportModal = ref(false);

async function handleReportSubmitted(payload) {
  showReportModal.value = false;
  try {
    await api.reportFess(props.post.id, {
      fess_id: String(props.post.id),
      reason: payload.reason,
      note: payload.note || null,
    });
    triggerToast('Laporan berhasil dikirim ke moderator');
    emit('report', { postId: props.post.id, ...payload });
  } catch {
    triggerToast('Gagal mengirim laporan. Coba lagi.');
  }
}

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num || 0;
}
</script>

<style scoped>
/* Card Container */
.fess-feed-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 18px;
  position: relative;
  transition: border-color 0.15s ease;
}

.fess-feed-card:hover {
  border-color: var(--shell-border-strong);
}

/* Card Header */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  margin-bottom: 12px;
}

.user-meta-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-meta-box.clickable-author {
  cursor: pointer;
  border-radius: 8px;
  padding: 2px 6px;
  margin: -2px -6px;
  transition: all 0.2s ease;
}

.user-meta-box.clickable-author:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-meta-box.clickable-author:hover .handle-title {
  color: var(--shell-sub-accent, #60a5fa);
  text-decoration: underline;
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  letter-spacing: -0.5px;
}

.avatar-icon {
  opacity: 0.85;
}

.user-handle-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.handle-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.post-time {
  font-size: 12px;
  color: var(--shell-text-muted);
}

/* Header Right Group */
.header-right-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: 8px;
  min-width: 0;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
}

.tag-tanya {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.tag-cerita {
  background: rgba(147, 51, 234, 0.15);
  color: #c084fc;
  border: 1px solid rgba(147, 51, 234, 0.25);
}

.badge-subtle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

.badge-ig {
  background: rgba(225, 48, 108, 0.15);
  color: #e1306c;
}

.badge-ig-failed {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-ig-pending {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
}

.spin {
  animation: fess-spin 0.8s linear infinite;
}

@keyframes fess-spin {
  to {
    transform: rotate(360deg);
  }
}

.ig-failure-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 16px 0;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.32);
  background: rgba(239, 68, 68, 0.08);
  border-radius: 10px;
}

.ig-failure-icon {
  color: #f87171;
  flex-shrink: 0;
  margin-top: 2px;
}

.ig-failure-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--shell-sub-accent, #cbd5e1);
  overflow-wrap: anywhere;
}

.ig-failure-copy strong {
  font-size: 12px;
  color: #f87171;
}

.ig-failure-copy small {
  color: var(--shell-sub-accent, #94a3b8);
  font-size: 10.5px;
}

.btn-ig-retry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: transparent;
  color: #fca5a5;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 8px;
  border-radius: 7px;
  cursor: pointer;
}

.btn-ig-retry:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #fff;
}

.badge-approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.badge-rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.badge-nlp {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px dashed rgba(239, 68, 68, 0.45);
}

.btn-takedown {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.12s ease,
    background 0.12s ease;
}

.btn-takedown:hover {
  color: #fff;
  background: #ef4444;
}

.btn-flag-report {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.12s ease,
    background 0.12s ease;
}

.btn-flag-report:hover {
  color: var(--shell-text);
  background: var(--shell-chip);
}

/* Card Body */
.card-body-text {
  margin-bottom: 14px;
}

.post-body-content {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--shell-text);
  margin: 0;
  word-break: break-word;
}

/* Quoted Fess Box */
.quoted-fess-box {
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card-subtle, rgba(255, 255, 255, 0.02));
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.12s ease;
}

.quoted-fess-box:hover {
  border-color: var(--shell-sub-accent, #60a5fa);
  background: rgba(96, 165, 250, 0.05);
}

.quoted-fess-box:active {
  transform: scale(0.99);
}

.quoted-fess-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-quote-pill {
  margin-left: auto;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(96, 165, 250, 0.15);
  color: var(--shell-sub-accent, #60a5fa);
  border: 1px solid rgba(96, 165, 250, 0.25);
  transition: background 0.12s ease;
}

.quoted-fess-box:hover .badge-quote-pill {
  background: var(--shell-sub-accent, #60a5fa);
  color: #ffffff;
}

.quoted-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.quoted-handle {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text);
}

.quoted-time {
  font-size: 11.5px;
  color: var(--shell-text-muted);
}

.quoted-content {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--shell-text-sub);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Action Bar */
.card-action-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--shell-border);
  position: relative;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 5px 7px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.action-btn:hover {
  color: var(--shell-text);
  background: var(--shell-chip);
}

.action-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

.action-btn.liked {
  color: #ef4444;
}

.action-btn.active {
  color: var(--shell-text);
  background: var(--shell-chip);
}

.action-btn.saved {
  color: var(--shell-sub-accent);
}

.action-btn--quote:hover {
  color: var(--shell-sub-accent, #60a5fa);
  background: rgba(96, 165, 250, 0.1);
}

.action-label-quote {
  font-size: 11.5px;
  font-weight: 700;
}

.action-btn--bookmark {
  margin-left: auto;
}

@media (max-width: 480px) {
  .card-header-row {
    gap: 6px;
  }

  .user-meta-box {
    gap: 8px;
  }

  .header-right-group {
    max-width: 58%;
    gap: 4px;
  }

  .tag-badge,
  .badge-subtle {
    padding: 2px 6px;
    font-size: 10px;
  }

  .card-action-bar {
    flex-wrap: wrap;
    row-gap: 8px;
    gap: 4px;
    padding-top: 10px;
    justify-content: space-between;
  }

  .action-btn {
    padding: 5px 3px;
    gap: 4px;
    font-size: 11px;
  }

  .action-label-quote,
  .action-count {
    font-size: 11px;
  }

  .admin-quick-actions {
    width: 100%;
    margin-left: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.action-count {
  font-variant-numeric: tabular-nums;
}

/* Admin Quick Actions (Moderation Setujui / Tolak) */
.admin-quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.btn-mod-approve {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #10b981;
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-mod-approve:hover {
  opacity: 0.9;
}

.btn-mod-hide {
  display: inline-flex;
  align-items: center;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-mod-hide:hover {
  background: var(--shell-card);
}

.btn-mod-ig {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(225, 48, 108, 0.3);
  transition: all 0.15s ease;
}

.btn-mod-ig:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(225, 48, 108, 0.45);
}

.btn-mod-ig.is-posted {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
  box-shadow: none;
}

/* Modal Instagram Story */
.ig-story-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ig-story-modal-box {
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
}

.ig-story-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.ig-story-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ig-story-avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ig-story-title {
  font-size: 14.5px;
  font-weight: 900;
  margin: 0;
  color: var(--shell-text);
}

.ig-story-sub {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin: 2px 0 0;
}

.btn-close-modal {
  background: var(--shell-chip);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--shell-text-muted);
  cursor: pointer;
}

.btn-close-modal:hover {
  color: var(--shell-text);
  background: var(--shell-border);
}

.ig-story-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.ig-story-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.ig-story-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.ig-story-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 800;
  background: rgba(0, 85, 255, 0.12);
  color: var(--brand-blue, #0055ff);
  border: 1px solid rgba(0, 85, 255, 0.25);
  text-align: center;
}

.ig-story-status-pill.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.ig-story-status-pill.pending {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
  border-color: rgba(245, 158, 11, 0.35);
}

.ig-story-card-frame {
  width: 100%;
  max-width: 250px;
  aspect-ratio: 4 / 5;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  border: 2px solid var(--shell-border);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ig-story-rendered-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Strip pratinjau carousel (teks panjang → beberapa card) */
.ig-card-strip {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 340px;
  overflow-x: auto;
  padding: 4px 2px;
  margin-top: 4px;
}

.ig-card-strip-img {
  height: 78px;
  border-radius: 10px;
  border: 1.5px solid var(--shell-border);
  flex-shrink: 0;
  object-fit: contain;
  background: #fff;
}

.ig-card-strip-note {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shell-sub-accent, #60a5fa);
  margin: 0;
}

.ig-story-actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}

.btn-ig-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ig-action.btn-download {
  background: var(--shell-chip);
  border: 1px solid var(--shell-border-strong, var(--shell-border));
  color: var(--shell-text);
}

.btn-ig-action.btn-download:hover {
  background: var(--shell-card);
  border-color: var(--brand-blue);
}

.btn-ig-action.btn-open-ig {
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(220, 39, 67, 0.3);
}

.btn-ig-action.btn-open-ig:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(220, 39, 67, 0.45);
}

/* Share Dropdown Wrapper & Popover */
.share-dropdown-wrapper {
  position: relative;
}

.share-popover-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 100;
  background: var(--shell-card);
  border: 1px solid var(--shell-border-strong);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  min-width: 170px;
}

.share-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text);
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
  transition: background 0.12s ease;
}

.share-menu-item:hover {
  background: var(--shell-chip);
}

/* Toast Message */
.action-toast {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--shell-text);
  color: var(--shell-bg);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  animation: toastFade 0.2s ease;
  z-index: 110;
  pointer-events: none;
}

@keyframes toastFade {
  from {
    opacity: 0;
    transform: translate(-50%, -6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Comments Section */
.comments-section-container {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--shell-border);
}

.comments-header {
  margin-bottom: 12px;
}

.comments-header-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.comment-content-box {
  flex: 1;
}

.comment-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.comment-author {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text);
}

.comment-time {
  font-size: 11px;
  color: var(--shell-text-muted);
}

.comment-text {
  font-size: 13px;
  line-height: 1.45;
  color: var(--shell-text);
  margin: 0;
}

.comment-action-links {
  margin-top: 4px;
}

.btn-reply-link {
  background: none;
  border: none;
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.12s ease;
}

.btn-reply-link:hover {
  color: var(--shell-text);
}

/* Nested Replies List */
.nested-replies-list {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--shell-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nested-reply-item {
  font-size: 12px;
}

.nested-reply-text {
  font-size: 12.5px;
  margin: 0;
  color: var(--shell-text);
  line-height: 1.4;
}

/* Comment Input Form */
.comment-input-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-target-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--shell-sub-accent);
  background: var(--shell-chip);
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  width: fit-content;
}

.btn-cancel-reply {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

/* Baris input komentar — tombol Kirim wajib tetap di dalam kartu di layar mobile */
.input-row-flex {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.comment-text-field {
  flex: 1 1 0%;
  min-width: 0;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--shell-text);
  outline: none;
}

.comment-text-field:focus {
  border-color: var(--shell-sub-accent);
}

.btn-submit-comment {
  flex-shrink: 0;
  white-space: nowrap;
  background: var(--shell-sub-accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-submit-comment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Karosel Media (gaya X/Threads — foto berjejer horizontal, berikutnya mengintip) */
.card-media-carousel {
  position: relative;
  margin-top: 10px;
}

.carousel-viewport {
  position: relative;
  width: 100%;
  min-height: 150px;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
  transition: height 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.carousel-viewport:active,
.carousel-viewport:active .carousel-slide {
  cursor: grabbing;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  position: relative;
  flex: 0 0 auto;
  width: var(--slide-w, 100%);
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  background: #000;
  transition:
    border-radius 220ms ease,
    border-color 220ms ease;
  cursor: grab;
}

.carousel-slide-hidden {
  opacity: 0;
}

/* Saat dicubit: foto menyatu — gap dan sudut hilang, jadi satu deretan utuh. */
.carousel-viewport.carousel-merging .carousel-slide {
  border-radius: 0;
  border-color: transparent;
}

.carousel-media-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  -webkit-user-drag: none;
  user-select: none;
}

.carousel-duration-pill {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
}

@media (max-width: 600px) {
  .fess-feed-card {
    padding: 12px 14px;
    border-radius: 16px;
  }

  .avatar-circle {
    width: 32px;
    height: 32px;
    font-size: 11.5px;
  }

  .handle-title {
    font-size: 12.5px;
  }

  .post-time {
    font-size: 11px;
  }

  .card-body-text {
    font-size: 13px;
    line-height: 1.5;
  }

  .card-actions-row {
    padding-top: 8px;
    margin-top: 8px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 11.5px;
  }
}
</style>
