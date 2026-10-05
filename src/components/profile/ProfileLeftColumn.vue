<template>
  <div class="grid-column left-column flex flex-col gap-6">
    <ProfileIntroCard :user="user" />
    <BadgesCard :items="BADGE_LIST" :count="user.badges?.length || 10" />
    <SpotifyCard
      :tracks="SPOTIFY_TRACKS"
      :playing-id="playingTrack"
      @play="$emit('play-track', $event)"
    />
    <TwitterCard :handle="user.handle" :tweet="CROSS_POST_TWEET" />
  </div>
</template>

<script setup>
/**
 * ProfileLeftColumn — intro, badges, playlist and the twitter cross-post.
 * Static content comes from src/data/profileData.js; the playing track is
 * lifted so the centre/right columns keep working independently.
 */
import ProfileIntroCard from './ProfileIntroCard.vue';
import BadgesCard from './BadgesCard.vue';
import SpotifyCard from './SpotifyCard.vue';
import TwitterCard from './TwitterCard.vue';
import { BADGE_LIST, SPOTIFY_TRACKS, CROSS_POST_TWEET } from '../../data/profileData';

defineProps({
  user: { type: Object, required: true },
  playingTrack: { type: [Number, String], default: null },
});

defineEmits(['play-track']);
</script>
