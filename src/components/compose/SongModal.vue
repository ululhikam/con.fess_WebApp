<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container modal-container--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="song-modal-title"
      >
        <header class="modal-header">
          <h2 id="song-modal-title" class="modal-title">Pilih Lagu</h2>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="song-search">
            <Search :size="18" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari lagu, artis..."
              class="song-search__input"
            />
          </div>

          <div class="song-list">
            <button
              type="button"
              class="song-item"
              :class="{ selected: !song }"
              @click="selectSong(null)"
            >
              <div class="song-item__cover none-selected">
                <Music :size="24" />
              </div>
              <div class="song-item__info">
                <span class="song-item__title">Tanpa lagu</span>
                <span class="song-item__artist">Hapus lagu yang dipilih</span>
              </div>
              <Check :size="16" v-if="!song" class="song-item__check" />
            </button>

            <button
              v-for="s in filteredSongs"
              :key="s.id"
              type="button"
              class="song-item"
              :class="{ selected: song?.id === s.id, playing: playingId === s.id }"
              @click="selectSong(s)"
            >
              <div class="song-item__cover">
                <img :src="s.cover" :alt="s.title" loading="lazy" />
                <button
                  type="button"
                  class="song-play-btn"
                  @click.stop="togglePlay(s)"
                  aria-label="Putar/pause"
                >
                  <Play v-if="playingId !== s.id" :size="20" />
                  <Pause v-else :size="20" />
                </button>
              </div>
              <div class="song-item__info">
                <span class="song-item__title">{{ s.title }}</span>
                <span class="song-item__artist">{{ s.artist }}</span>
              </div>
              <Check :size="16" v-if="song?.id === s.id" class="song-item__check" />
            </button>

            <div v-if="filteredSongs.length === 0" class="song-empty">
              <Music :size="32" />
              <p>Lagu tidak ditemukan</p>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn-primary" @click="confirm">Selesai</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X, Music, Check, Search, Play, Pause, Volume2 } from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, default: false },
  song: { type: Object, default: null },
  songs: { type: Array, default: () => [] },
});

defineEmits(['update:show', 'update:song']);

const searchQuery = ref('');
const playingId = ref(null);

const filteredSongs = computed(() => {
  if (!searchQuery.value) return props.songs;
  const q = searchQuery.value.toLowerCase();
  return props.songs.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
  );
});

function selectSong(s) {
  emit('update:song', s);
}

function togglePlay(s) {
  if (playingId.value === s.id) {
    playingId.value = null;
    // In real app: pause audio
  } else {
    playingId.value = s.id;
    // In real app: play preview
  }
}

function confirm() {
  emit('update:show', false);
}

function close() {
  emit('update:show', false);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px var(--shadow-color);
}

.modal-container--wide {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.song-search {
  position: relative;
  margin-bottom: 16px;
}

.song-search__input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
}

.song-search__input:focus {
  border-color: var(--brand-blue);
}

.song-search .lucide {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.song-item:hover {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
}

.song-item.selected {
  background: var(--shell-chip);
  border-color: var(--brand-blue);
}

.song-item.playing {
  border-color: var(--brand-blue);
}

.song-item__cover {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-inset);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.song-item__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-item__cover.none-selected {
  border: 2px dashed var(--border-subtle);
}

.song-play-btn {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.song-item:hover .song-play-btn {
  opacity: 1;
}

.song-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item__artist {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis.;
}

.song-item__check {
  color: var(--brand-blue);
  flex-shrink: 0;
}

.song-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.song-empty p {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-inset);
  border-color: var(--border-strong);
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px var(--neon-blue-glow);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(20px);
}
</style>
