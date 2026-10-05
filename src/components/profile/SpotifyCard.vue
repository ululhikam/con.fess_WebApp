<template>
  <ProfileCard title="My Spotify Playlist">
    <template #meta>
      <span class="text-xs text-muted inline-flex items-center gap-1">
        <Music :size="13" aria-hidden="true" /> {{ tracks.length }} Tracks
      </span>
    </template>

    <div class="spotify-track-list">
      <div v-for="track in tracks" :key="track.id" class="spotify-item">
        <button
          type="button"
          class="play-track-btn"
          :aria-label="(playingId === track.id ? 'Jeda ' : 'Putar ') + track.title"
          :aria-pressed="playingId === track.id"
          @click="$emit('play', track.id)"
        >
          <Pause v-if="playingId === track.id" :size="16" aria-hidden="true" />
          <Play v-else :size="16" aria-hidden="true" />
        </button>

        <div class="track-info flex-1">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">{{ track.artist }}</div>
        </div>

        <span class="track-time">{{ track.time }}</span>
      </div>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * SpotifyCard — playlist widget. Emits `play` with the track id; the active
 * track lives in src/composables/useProfile.js.
 */
import { Music, Play, Pause } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';

defineProps({
  tracks: { type: Array, default: () => [] },
  playingId: { type: [Number, String], default: null },
});

defineEmits(['play']);
</script>

<style scoped>
.spotify-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.play-track-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  cursor: pointer;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.track-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.track-artist {
  font-size: 10px;
  color: var(--text-muted);
}

.track-time {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>
