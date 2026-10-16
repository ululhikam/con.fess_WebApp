<template>
  <article class="fess-feed-card">
    <!-- Header: Author, Tag / Status, Report Button -->
    <header class="card-header-row">
      <div
        class="user-meta-box"
        :class="{ 'clickable-author': isAuthorClickable }"
        :title="isAuthorClickable ? 'Lihat profil base' : undefined"
        @click="navigateToAuthor(post)"
      >
        <div class="avatar-circle" :style="{ background: post.avatarBg || '#252a3a' }">
          <img v-if="post.avatarImg" :src="post.avatarImg" alt="" class="avatar-img" />
          <span v-else-if="post.avatarText" class="avatar-initial">{{ post.avatarText }}</span>
          <UserRound v-else :size="15" class="avatar-icon" />
        </div>
        <div class="user-handle-box">
          <span class="handle-title">{{ post.handle || post.senderHandle || '@anonim' }}</span>
          <span class="post-time">• {{ post.time || 'Baru saja' }}</span>
        </div>
      </div>

      <div class="header-right-group">
        <!-- Tag / Topic asli dari database (bukan label default palsu) -->
        <span
          v-if="post.topicLabel || post.tag"
          :class="['tag-badge', post.topic === 'tanya' || post.tag === 'Tanya' ? 'tag-tanya' : 'tag-cerita']"
        >
          <Pin :size="11" />
          <span>{{ post.topicLabel || post.tag }}</span>
        </span>

        <!-- Instagram Feed Post Badge (Admin / Feed) -->
        <span v-if="post.postedToIg" class="badge-subtle badge-ig">
          <Instagram :size="12" />
          <span>Feed</span>
        </span>

        <!-- Indikasi filter NLP (mode auto post) — hanya terlihat admin base -->
        <span
          v-if="isAdmin && post.autoFlagged"
          class="badge-subtle badge-nlp"
          :title="`Terindikasi filter NLP: ${post.flagReason || 'konten negatif'}`"
        >
          <ShieldAlert :size="12" />
          <span>NLP</span>
        </span>

        <!-- Status Badge — pemilik base (atau Super Admin), plus daftar Fess Saya -->
        <span
          v-if="showStatusBadge"
          class="badge-subtle"
          :class="statusBadgeClass"
        >
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

      <!-- Media Attachments (Photos and Videos) -->
      <div v-if="hasMedia" class="card-media-stream">
        <!-- 1. Video Player Container -->
        <div
          v-for="(vid, vIdx) in videoMediaList"
          :key="`video-${vIdx}`"
          class="fess-video-container"
        >
          <div class="video-wrapper-frame">
            <video
              :src="vid.url"
              :poster="vid.thumbnail"
              controls
              playsinline
              preload="metadata"
              class="fess-video-player"
            />
            <div class="video-indicator-badge">
              <Film :size="12" />
              <span>Video</span>
              <span v-if="vid.duration" class="video-duration-sub">• {{ vid.duration }}</span>
            </div>
          </div>
          <p v-if="vid.caption" class="media-caption-text">{{ vid.caption }}</p>
        </div>

        <!-- 2. Images Grid Container (1, 2, 3, or 4 images) -->
        <div
          v-if="imageMediaList.length"
          class="fess-images-grid"
          :class="`grid-layout-${Math.min(imageMediaList.length, 4)}`"
        >
          <div
            v-for="(img, imgIdx) in imageMediaList.slice(0, 4)"
            :key="`img-${imgIdx}`"
            class="image-grid-item"
            role="button"
            tabindex="0"
            :title="`Klik untuk memperbesar gambar (${imgIdx + 1} dari ${imageMediaList.length})`"
            @click.stop="openLightbox(imgIdx)"
          >
            <img
              :src="img.url || img"
              :alt="img.caption || `Foto confession ${imgIdx + 1}`"
              loading="lazy"
              class="fess-img-element"
            />
            <div
              v-if="imgIdx === 3 && imageMediaList.length > 4"
              class="more-images-overlay-tag"
            >
              <span>+{{ imageMediaList.length - 4 }}</span>
            </div>
            <button
              type="button"
              class="btn-zoom-corner-overlay"
              title="Perbesar Foto"
              aria-label="Perbesar foto"
              @click.stop="openLightbox(imgIdx)"
            >
              <Maximize2 :size="13" />
            </button>
          </div>
        </div>
      </div>

      <!-- Quoted Fess (Kutipan Fess Orang Lain) -->
      <div
        v-if="post.quotedFess"
        class="quoted-fess-box"
        role="button"
        tabindex="0"
        title="Klik untuk kutip fess ini"
        @click.stop="quoteTargetFess(post.quotedFess)"
      >
        <div class="quoted-fess-header">
          <div class="quoted-avatar" :style="{ background: post.quotedFess.avatarBg || '#0038FF' }">
            <span v-if="post.quotedFess.avatarText">{{ post.quotedFess.avatarText }}</span>
            <span v-else>{{ (post.quotedFess.handle || '@fess').slice(1, 3).toUpperCase() }}</span>
          </div>
          <span class="quoted-handle">{{ post.quotedFess.handle || post.quotedFess.senderHandle }}</span>
          <span class="quoted-time">• {{ post.quotedFess.time || 'Waktu lalu' }}</span>
          <span class="badge-quote-pill">Kutip</span>
        </div>
        <p class="quoted-content">{{ post.quotedFess.content }}</p>
      </div>
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
          <button type="button" class="share-menu-item" @click="shareToInstagram">
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
        @click="toggleBookmark"
      >
        <Bookmark :size="17" :fill="isSaved ? 'currentColor' : 'none'" />
      </button>

      <!-- 5. ADMIN MODERASI & AUTO-POST -->
      <div v-if="isAdmin" class="admin-quick-actions">
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
              <button
                type="button"
                class="btn-reply-link"
                @click="initiateReply(comment)"
              >
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
            :placeholder="replyTarget ? `Balas ${replyTarget.author}...` : 'Tulis komentar anonim kamu...'"
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
      v-if="showReportModal"
      :post-id="post.id"
      :base-handle="post.handle || post.senderHandle"
      @close="showReportModal = false"
      @submit="handleReportSubmitted"
    />

    <!-- FULLSCREEN LIGHTBOX IMAGE VIEWER -->
    <Teleport to="body">
      <Transition name="fade-lightbox">
        <div
          v-if="showLightbox"
          class="fess-lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Foto"
          @click="closeLightbox"
          @keydown.esc="closeLightbox"
        >
          <div class="lightbox-stage-box" @click.stop>
            <div class="lightbox-header-bar">
              <span class="lightbox-index-badge">
                Foto {{ activeImageIndex + 1 }} dari {{ imageMediaList.length }}
              </span>
              <button
                type="button"
                class="btn-close-lightbox"
                title="Tutup (ESC)"
                aria-label="Tutup"
                @click="closeLightbox"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="lightbox-main-viewport">
              <button
                v-if="imageMediaList.length > 1"
                type="button"
                class="lightbox-nav-arrow left"
                title="Sebelumnya"
                aria-label="Sebelumnya"
                @click="prevImage"
              >
                <ChevronLeft :size="26" />
              </button>

              <img
                :src="activeImage?.url || activeImage"
                :alt="activeImage?.caption || 'Pratinjau Foto'"
                class="lightbox-zoom-image"
              />

              <button
                v-if="imageMediaList.length > 1"
                type="button"
                class="lightbox-nav-arrow right"
                title="Selanjutnya"
                aria-label="Selanjutnya"
                @click="nextImage"
              >
                <ChevronRight :size="26" />
              </button>
            </div>

            <p v-if="activeImage?.caption" class="lightbox-caption-text">
              {{ activeImage.caption }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- INSTAGRAM STORY AUTO-POST PREVIEW MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showInstagramModal"
          class="ig-story-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Story Auto-Post"
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
                  <p class="ig-story-sub">Visual card confession (1:1 / 4:5) untuk Instagram Feed base</p>
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
                <p class="text-xs text-muted">Mengonversi template card menjadi visual Feed resolusi tinggi (1:1 / 4:5)</p>
              </div>

              <!-- Content Preview State -->
              <div v-else class="ig-story-preview-container">
                <div class="ig-story-status-pill" :class="{ success: igPostData?.meta_published || post.postedToIg }">
                  <CheckCircle2 v-if="igPostData?.meta_published || post.postedToIg" :size="14" />
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

                <!-- Preview Image Frame (9:16 Aspect Ratio) -->
                <div class="ig-story-card-frame">
                  <img
                    v-if="igPostData?.imageUrl || igPostData?.image_url"
                    :src="igPostData.imageUrl || igPostData.image_url"
                    alt="Card Fess Story"
                    class="ig-story-rendered-img"
                  />
                  <div v-else class="ig-story-fallback-card">
                    <p class="text-sm font-bold">{{ post.content }}</p>
                    <span class="text-xs text-muted mt-2">{{ post.handle }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="ig-story-actions-row">
                  <a
                    v-if="igPostData?.imageUrl || igPostData?.image_url"
                    :href="igPostData.imageUrl || igPostData.image_url"
                    download="fess_feed_card.svg"
                    target="_blank"
                    class="btn-ig-action btn-download"
                  >
                    <Download :size="15" />
                    <span>Unduh Card Feed HD</span>
                  </a>
                  <button
                    type="button"
                    class="btn-ig-action btn-open-ig"
                    @click="openInstagramApp"
                  >
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
import { ref, computed } from 'vue';
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
  Film,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Download,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-vue-next';
import ReportFessModal from './ReportFessModal.vue';
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
  () => props.isAdmin && props.post?.status === 'approved' && isManagedBasePost.value
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

function toggleLike() {
  isLiked.value = !isLiked.value;
  likesCount.value += isLiked.value ? 1 : -1;
  emit('like', { id: props.post.id, isLiked: isLiked.value, count: likesCount.value });
}

/* 2. BOOKMARK STATE */
const isSaved = ref(props.post.isSaved || false);

function toggleBookmark() {
  isSaved.value = !isSaved.value;
  triggerToast(isSaved.value ? 'Fess disimpan ke tab tersimpan' : 'Fess dihapus dari simpanan');
  emit('bookmark', { id: props.post.id, isSaved: isSaved.value });
}

/* MEDIA HANDLING (PHOTOS & VIDEOS) */
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

const imageMediaList = computed(() => {
  return parsedMedia.value.filter((m) => m.type === 'image');
});

const videoMediaList = computed(() => {
  return parsedMedia.value.filter((m) => m.type === 'video');
});

const hasMedia = computed(() => parsedMedia.value.length > 0);

/* LIGHTBOX MODAL STATE */
const showLightbox = ref(false);
const activeImageIndex = ref(0);

const activeImage = computed(() => {
  return imageMediaList.value[activeImageIndex.value] || null;
});

function openLightbox(index = 0) {
  activeImageIndex.value = index;
  showLightbox.value = true;
}

function closeLightbox() {
  showLightbox.value = false;
}

function nextImage() {
  if (activeImageIndex.value < imageMediaList.value.length - 1) {
    activeImageIndex.value++;
  } else {
    activeImageIndex.value = 0;
  }
}

function prevImage() {
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--;
  } else {
    activeImageIndex.value = imageMediaList.value.length - 1;
  }
}

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
  showShareMenu.value = false;
  openInstagramStoryAutoPost();
}

const showInstagramModal = ref(false);
const igPostLoading = ref(false);
const igPostData = ref(null);

async function openInstagramStoryAutoPost() {
  showInstagramModal.value = true;
  igPostLoading.value = true;
  igPostData.value = null;

  try {
    const res = await api.postFessToInstagram(props.post.id, {
      template: props.post.template || 'default',
      aspect: props.post.aspect || 'portrait',
    });
    igPostData.value = res?.data || res;
    if (igPostData.value?.meta_published) {
      props.post.postedToIg = true;
      triggerToast('Card fess berhasil diposting ke Instagram Feed!');
    } else {
      triggerToast('Card fess selesai dirender — publikasi Instagram belum berhasil.');
    }
  } catch (err) {
    console.error('Gagal memposting fess ke Instagram:', err);
    triggerToast('Gagal memproses card story. Silakan coba lagi.');
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
    avatarText: targetFess.avatarText || (targetFess.handle ? targetFess.handle.slice(1, 3).toUpperCase() : 'QF'),
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

function quoteTargetFess(target) {
  saveAndNavigateQuote(target);
}

/* 4. COMMENTS STATE — comments are loaded live from the API */
const showComments = ref(false);
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
  margin-bottom: 12px;
}

.user-meta-box {
  display: flex;
  align-items: center;
  gap: 10px;
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
}

.handle-title {
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
  gap: 8px;
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
  transition: color 0.12s ease, background 0.12s ease;
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
  transition: color 0.12s ease, background 0.12s ease;
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
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
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
  .card-action-bar {
    gap: 4px;
    padding-top: 10px;
    justify-content: space-between;
  }
  .action-btn {
    padding: 5px 3px;
    gap: 4px;
    font-size: 11px;
  }
  .action-label-quote, .action-count {
    font-size: 11px;
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
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
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

.ig-story-card-frame {
  width: 100%;
  max-width: 250px;
  aspect-ratio: 9 / 16;
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
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
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
  from { opacity: 0; transform: translate(-50%, -6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
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

.input-row-flex {
  display: flex;
  gap: 8px;
}

.comment-text-field {
  flex: 1;
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

/* Card Media Stream */
.card-media-stream {
  margin-top: 10px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Video Player */
.fess-video-container {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.video-wrapper-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fess-video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.video-indicator-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.media-caption-text {
  font-size: 12px;
  color: var(--shell-text-muted, #94a3b8);
  padding: 6px 10px;
  margin: 0;
}

/* Images Grid Layout */
.fess-images-grid {
  display: grid;
  gap: 4px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  background: rgba(0, 0, 0, 0.2);
}

.fess-images-grid.grid-layout-1 {
  grid-template-columns: 1fr;
  max-height: 440px;
}

.fess-images-grid.grid-layout-2 {
  grid-template-columns: 1fr 1fr;
  aspect-ratio: 16 / 9;
}

.fess-images-grid.grid-layout-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  aspect-ratio: 16 / 10;
}

.fess-images-grid.grid-layout-3 .image-grid-item:first-child {
  grid-row: span 2;
}

.fess-images-grid.grid-layout-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  aspect-ratio: 16 / 10;
}

.image-grid-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #000;
  width: 100%;
  height: 100%;
}

.fess-img-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
  display: block;
}

.image-grid-item:hover .fess-img-element {
  transform: scale(1.03);
}

.btn-zoom-corner-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.2s ease;
  cursor: pointer;
}

.image-grid-item:hover .btn-zoom-corner-overlay {
  opacity: 1;
  transform: scale(1);
}

.more-images-overlay-tag {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
}

/* Lightbox Modal */
.fess-lightbox-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.lightbox-stage-box {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.lightbox-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 14px;
}

.lightbox-index-badge {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
}

.btn-close-lightbox {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-lightbox:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.08);
}

.lightbox-main-viewport {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 300px;
  max-height: 75vh;
}

.lightbox-zoom-image {
  max-width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
}

.lightbox-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.lightbox-nav-arrow:hover {
  background: rgba(0, 85, 255, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav-arrow.left {
  left: 10px;
}

.lightbox-nav-arrow.right {
  right: 10px;
}

.lightbox-caption-text {
  text-align: center;
  font-size: 13px;
  color: #cbd5e1;
  padding-top: 10px;
  margin: 0;
}

.fade-lightbox-enter-active,
.fade-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.fade-lightbox-enter-from,
.fade-lightbox-leave-to {
  opacity: 0;
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
