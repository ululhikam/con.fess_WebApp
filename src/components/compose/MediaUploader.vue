<template>
  <div class="media-uploader">
    <!-- Upload Zone -->
    <div
      class="media-uploader__dropzone"
      :class="{ active: dragActive, 'has-files': mediaFiles.length > 0 }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
      role="button"
      tabindex="0"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
      aria-label="Tambah media"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="media-uploader__input"
        @change="onFileSelect"
        accept="image/*,video/*"
        :multiple="maxFiles - mediaFiles.length > 1"
      />

      <div v-if="mediaFiles.length === 0" class="media-uploader__empty">
        <div class="media-uploader__icon">
          <Image :size="30" v-if="!dragActive" />
          <Upload :size="30" v-else class="spin" />
        </div>
        <p class="media-uploader__text">
          <span v-if="!dragActive">Unggah Foto atau Video</span>
          <span v-else>Lepaskan file untuk unggah</span>
        </p>
        <p class="media-uploader__hint">
          Pilih file dari perangkat · Maks {{ maxSizeMB }}MB · Maks {{ maxFiles }} file
        </p>
      </div>
    </div>

    <!-- Media Preview Grid (When media files are selected) -->
    <div v-if="mediaFiles.length > 0" class="media-uploader__preview-grid">
      <div
        v-for="(file, index) in mediaFiles"
        :key="file.id"
        class="media-uploader__preview-item"
      >
        <button
          type="button"
          class="media-uploader__remove"
          title="Hapus media"
          aria-label="Hapus media"
          @click.stop="removeFile(index)"
        >
          <X :size="15" />
        </button>

        <div class="media-uploader__media">
          <img
            v-if="file.type === 'image'"
            :src="file.preview || file.url"
            :alt="file.name"
            loading="lazy"
          />
          <div v-else-if="file.type === 'video'" class="video-preview-wrapper">
            <video
              :src="file.preview || file.url"
              :poster="file.thumbnail"
              muted
              playsinline
              controls
              class="preview-video-tag"
            />
          </div>
        </div>

        <div class="media-uploader__progress" v-if="file.uploading">
          <div class="media-uploader__progress-bar" :style="{ width: (file.progress || 100) + '%' }" />
        </div>

        <div class="media-uploader__info">
          <span class="media-uploader__name" :title="file.name">{{ truncate(file.name, 18) }}</span>
          <span class="media-uploader__size">{{ file.sizeText || formatFileSize(file.size) }}</span>
        </div>

        <div class="media-uploader__type-badge" :class="file.type">
          <Film v-if="file.type === 'video'" :size="11" />
          <Image v-else :size="11" />
          <span>{{ file.type === 'image' ? 'Foto' : 'Video' }}</span>
        </div>
      </div>

      <!-- Add more button if slots remain -->
      <button
        v-if="mediaFiles.length < maxFiles"
        type="button"
        class="media-uploader__add-more"
        title="Tambah media lagi"
        @click="triggerFileInput"
      >
        <Plus :size="22" />
        <span>Tambah</span>
        <span class="slots-counter">{{ maxFiles - mediaFiles.length }} sisa</span>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="media-uploader__error" role="alert">
      <AlertCircle :size="15" />
      <span>{{ error }}</span>
    </p>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Image, Upload, X, Plus, AlertCircle, Film } from 'lucide-vue-next';

import { api } from '../../api';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  maxFiles: { type: Number, default: 4 },
  maxSizeMB: { type: Number, default: 50 },
});

const emit = defineEmits(['update:modelValue', 'change']);

const fileInputRef = ref(null);
const dragActive = ref(false);
const error = ref('');

const mediaFiles = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onDragOver(e) {
  dragActive.value = true;
  e.dataTransfer.dropEffect = 'copy';
}

function onDragLeave() {
  dragActive.value = false;
}

function onDrop(e) {
  dragActive.value = false;
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
}

function onFileSelect(e) {
  const files = Array.from(e.target.files);
  handleFiles(files);
  e.target.value = ''; // Reset for same file re-selection
}

function handleFiles(files) {
  error.value = '';
  const remainingSlots = props.maxFiles - mediaFiles.value.length;
  if (remainingSlots <= 0) {
    error.value = `Maksimal ${props.maxFiles} file`;
    return;
  }

  const validFiles = files.slice(0, remainingSlots).filter(validateFile);
  validFiles.forEach(processFile);
}

function validateFile(file) {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSize = props.maxSizeMB * 1024 * 1024;

  if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
    error.value = `Format tidak didukung: ${file.name}. Gunakan JPG, PNG, WebP, GIF, MP4, WebM`;
    return false;
  }

  if (file.size > maxSize) {
    error.value = `File terlalu besar: ${file.name} (maks ${props.maxSizeMB}MB)`;
    return false;
  }

  return true;
}

function processFile(file) {
  const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const type = file.type.startsWith('video/') ? 'video' : 'image';
  const preview = URL.createObjectURL(file);

  const mediaItem = {
    id,
    file,
    name: file.name,
    size: file.size,
    type,
    preview,
    url: preview,
    uploading: true,
    progress: 0,
  };

  mediaFiles.value = [...mediaFiles.value, mediaItem];
  emit('change', mediaFiles.value);

  uploadItem(mediaItem);
}

/** Upload the file to the backend and swap the blob preview for the final URL. */
async function uploadItem(item) {
  item.uploading = true;
  item.progress = 0;
  try {
    const res = await api.uploadMedia(item.file, item.type);
    if (res?.url) {
      item.url = res.url;
      item.thumbnail = res.thumbnail || undefined;
      item.size = res.size ?? item.size;
    }
    item.progress = 100;
  } catch (e) {
    error.value = `Gagal mengunggah ${item.name}. Coba lagi.`;
    const idx = mediaFiles.value.indexOf(item);
    if (idx !== -1) removeFile(idx);
  } finally {
    item.uploading = false;
  }
}

function removeFile(index) {
  const item = mediaFiles.value[index];
  if (item?.file && item?.preview) URL.revokeObjectURL(item.preview);
  mediaFiles.value.splice(index, 1);
  emit('change', mediaFiles.value);
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}
</script>

<style scoped>
.media-uploader {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

/* DROPZONE */
.media-uploader__dropzone {
  position: relative;
  padding: 22px 20px;
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  transition: all 0.2s ease;
  cursor: pointer;
}

.media-uploader__dropzone.active {
  background: rgba(0, 85, 255, 0.08);
  border-color: #0055ff;
}

.media-uploader__dropzone.has-files {
  padding: 14px 20px;
}

.media-uploader__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.media-uploader__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  pointer-events: none;
}

.media-uploader__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--shell-sub-accent, #60a5fa);
  transition: all 0.2s ease;
}

.media-uploader__dropzone.active .media-uploader__icon {
  background: #0055ff;
  color: #fff;
  transform: scale(1.08);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.media-uploader__text {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  margin: 0;
}

.media-uploader__hint {
  font-size: 12px;
  color: var(--shell-text-muted, #8e95a5);
  margin: 0;
}

/* MOCKUP PRESET SECTION */
.mockup-preset-section {
  padding: 12px 16px;
  background: rgba(0, 85, 255, 0.035);
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.06));
}

.mockup-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.mockup-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #60a5fa;
}

.sparkle-icon {
  color: #f59e0b;
}

.btn-open-catalog {
  background: transparent;
  border: none;
  color: var(--shell-text-muted, #94a3b8);
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-open-catalog:hover {
  color: #fff;
}

.mockup-carousel-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.mockup-chip-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 10px 6px 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  color: var(--shell-text, #fff);
  text-align: left;
}

.mockup-chip-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(96, 165, 250, 0.4);
  transform: translateY(-1px);
}

.mockup-chip-btn.added {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
}

.mockup-chip-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mockup-chip-thumb-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  background: #000;
}

.mockup-chip-thumb-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mockup-video-overlay-icon {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.mockup-type-badge-mini {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 8px;
  font-weight: 800;
  text-align: center;
  padding: 1px 0;
  text-transform: uppercase;
}

.mockup-type-badge-mini.image {
  background: rgba(16, 185, 129, 0.85);
  color: #fff;
}

.mockup-type-badge-mini.video {
  background: rgba(239, 68, 68, 0.85);
  color: #fff;
}

.mockup-chip-text-col {
  display: flex;
  flex-direction: column;
  max-width: 110px;
}

.mockup-chip-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shell-text, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mockup-chip-size {
  font-size: 10px;
  color: var(--shell-text-muted, #8e95a5);
}

.mockup-check-badge {
  color: #10b981;
}

.mockup-plus-icon {
  color: var(--shell-text-muted, #8e95a5);
}

/* MEDIA PREVIEW GRID */
.media-uploader__preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  padding: 14px;
}

.media-uploader__preview-item {
  position: relative;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.media-uploader__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
}

.media-uploader__remove:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.media-uploader__media {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.media-uploader__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video-tag {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-uploader__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.media-uploader__progress-bar {
  height: 100%;
  background: #0055ff;
  transition: width 0.1s ease;
}

.media-uploader__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.85) 100%);
  display: flex;
  flex-direction: column;
}

.media-uploader__name {
  font-size: 10.5px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-uploader__size {
  font-size: 9.5px;
  color: #cbd5e1;
}

.media-uploader__type-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 3px 7px;
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  z-index: 2;
}

.media-uploader__type-badge.image {
  background: rgba(16, 185, 129, 0.85);
  backdrop-filter: blur(4px);
}

.media-uploader__type-badge.video {
  background: rgba(239, 68, 68, 0.85);
  backdrop-filter: blur(4px);
}

.media-uploader__add-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px dashed var(--shell-border, rgba(255, 255, 255, 0.15));
  border-radius: 12px;
  color: var(--shell-text-muted, #8e95a5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.media-uploader__add-more:hover {
  border-color: #0055ff;
  color: #fff;
  background: rgba(0, 85, 255, 0.06);
}

.slots-counter {
  font-size: 10px;
  color: var(--shell-text-muted, #64748b);
}

.media-uploader__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: #ef4444;
  font-size: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  margin: 0;
}

/* CATALOG MODAL */
.mockup-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.mockup-modal-window {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.1));
  border-radius: 20px;
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.mockup-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.modal-head-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-head-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mockup-modal-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--shell-border, rgba(255, 255, 255, 0.06));
}

.modal-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: var(--shell-text-muted, #94a3b8);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-tab-btn:hover {
  color: #fff;
}

.modal-tab-btn.active {
  background: #0055ff;
  border-color: #0055ff;
  color: #fff;
}

.mockup-modal-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.mockup-grid-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.mockup-grid-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.modal-card-thumb {
  height: 120px;
  position: relative;
  background: #000;
}

.modal-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-type-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  color: #fff;
  backdrop-filter: blur(6px);
}

.card-type-tag.image {
  background: rgba(16, 185, 129, 0.85);
}

.card-type-tag.video {
  background: rgba(239, 68, 68, 0.85);
}

.modal-card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.card-desc {
  font-size: 11.5px;
  color: var(--shell-text-muted, #94a3b8);
  margin: 0;
  line-height: 1.45;
  flex: 1;
}

.card-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.card-size-pill {
  font-size: 10.5px;
  color: var(--shell-text-muted, #8e95a5);
}

.btn-toggle-attach {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(0, 85, 255, 0.15);
  border: 1px solid rgba(0, 85, 255, 0.35);
  color: #60a5fa;
  transition: all 0.2s ease;
}

.btn-toggle-attach:hover:not(:disabled) {
  background: #0055ff;
  color: #fff;
}

.btn-toggle-attach.attached {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.btn-toggle-attach:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mockup-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.footer-count-text {
  font-size: 12.5px;
  color: var(--shell-text-muted, #94a3b8);
}

.btn-done-modal {
  padding: 8px 22px;
  background: #0055ff;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-done-modal:hover {
  filter: brightness(1.1);
}

@media (max-width: 600px) {
  .mockup-modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
