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
          <Image :size="32" v-if="!dragActive" />
          <Upload :size="32" v-else class="spin" />
        </div>
        <p class="media-uploader__text">
          <span v-if="!dragActive">Klik atau tarik media ke sini</span>
          <span v-else>Lepaskan untuk upload</span>
        </p>
        <p class="media-uploader__hint">
          Foto (JPG, PNG, WebP) atau Video (MP4, WebM) · Maks {{ maxSizeMB }}MB · Maks
          {{ maxFiles }} file
        </p>
      </div>
    </div>

    <!-- Media Preview Grid -->
    <div v-if="mediaFiles.length > 0" class="media-uploader__preview-grid">
      <div v-for="(file, index) in mediaFiles" :key="file.id" class="media-uploader__preview-item">
        <button
          type="button"
          class="media-uploader__remove"
          @click.stop="removeFile(index)"
          aria-label="Hapus media"
        >
          <X :size="16" />
        </button>

        <div class="media-uploader__media">
          <img v-if="file.type === 'image'" :src="file.preview" :alt="file.name" loading="lazy" />
          <video v-else-if="file.type === 'video'" :src="file.preview" muted playsinline controls />
        </div>

        <div class="media-uploader__progress" v-if="file.uploading">
          <div class="media-uploader__progress-bar" :style="{ width: file.progress + '%' }" />
        </div>

        <div class="media-uploader__info">
          <span class="media-uploader__name">{{ truncate(file.name, 20) }}</span>
          <span class="media-uploader__size">{{ formatFileSize(file.size) }}</span>
        </div>

        <div class="media-uploader__type-badge" :class="file.type">
          {{ file.type === 'image' ? 'Foto' : 'Video' }}
        </div>
      </div>

      <!-- Add more button -->
      <button
        v-if="mediaFiles.length < maxFiles"
        type="button"
        class="media-uploader__add-more"
        @click="triggerFileInput"
        :disabled="mediaFiles.length >= maxFiles"
      >
        <Plus :size="24" />
        <span>Tambah</span>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="media-uploader__error" role="alert">
      <AlertCircle :size="14" /> {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Image, Upload, X, Plus, AlertCircle, Video } from 'lucide-vue-next';

defineProps({
  modelValue: { type: Array, default: () => [] },
  maxFiles: { type: Number, default: 4 },
  maxSizeMB: { type: Number, default: 50 },
});

defineEmits(['update:modelValue', 'change']);

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
    uploading: false,
    progress: 0,
  };

  mediaFiles.value = [...mediaFiles.value, mediaItem];
  emit('change', mediaFiles.value);

  // Simulate upload (in real app, upload to server)
  simulateUpload(id);
}

function simulateUpload(id) {
  const item = mediaFiles.value.find((m) => m.id === id);
  if (!item) return;

  item.uploading = true;
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      item.uploading = false;
    }
    item.progress = Math.min(progress, 100);
  }, 150);
}

function removeFile(index) {
  const item = mediaFiles.value[index];
  if (item?.preview) URL.revokeObjectURL(item.preview);
  mediaFiles.value.splice(index, 1);
  emit('change', mediaFiles.value);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function truncate(str, max) {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}
</script>

<style scoped>
.media-uploader {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
}

.media-uploader__dropzone {
  position: relative;
  padding: 24px;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.2s ease;
}

.media-uploader__dropzone.active {
  background: var(--shell-chip);
  border-color: var(--brand-blue);
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
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-inset);
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.media-uploader__dropzone.active .media-uploader__icon {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
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
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.media-uploader__hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.media-uploader__preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 12px;
}

.media-uploader__preview-item {
  position: relative;
  aspect-ratio: 1;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.media-uploader__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 2;
}

.media-uploader__preview-item:hover .media-uploader__remove {
  opacity: 1;
  transform: scale(1);
}

.media-uploader__media {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-uploader__media img,
.media-uploader__media video {
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
  background: var(--bg-inset);
}

.media-uploader__progress-bar {
  height: 100%;
  background: var(--brand-blue);
  border-radius: 0 0 10px 10px;
  transition: width 0.1s ease.;
}

.media-uploader__info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 44px;
}

.media-uploader__name {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-uploader__size {
  font-size: 10px;
  color: var(--text-muted);
}

.media-uploader__type-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  color: var(--text-on-accent);
}

.media-uploader__type-badge.image {
  background: linear-gradient(90deg, var(--success), #22c55e);
}

.media-uploader__type-badge.video {
  background: linear-gradient(90deg, var(--danger), #f87171);
}

.media-uploader__add-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-inset);
  border: 2px dashed var(--border-subtle);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.media-uploader__add-more:hover:not(:disabled) {
  border-color: var(--brand-blue);
  color: var(--brand-blue);
  background: var(--shell-chip);
}

.media-uploader__add-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.media-uploader__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--danger);
  font-size: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid var(--danger);
  margin: 0;
}
</style>
