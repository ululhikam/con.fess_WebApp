<template>
  <div class="base-club-profile">
    <!-- Navigation Bar -->
    <ProfileNav @logout="handleLogout" />

    <!-- Loading / error gate: the layout below only renders with real data. -->
    <ContentSkeleton
      v-if="loading"
      type="profile"
      label="Memuat profil…"
      class="container state-frame"
    />

    <AppStateView
      v-else-if="error"
      class="container state-frame"
      variant="error"
      title="Profil gagal dimuat"
      description="Terjadi kesalahan saat memuat halaman profil. Coba muat ulang."
      action-label="Coba lagi"
      @action="reload"
    />

    <template v-else>
      <!-- Main Header Cover & Profile Avatar Stage -->
      <ProfileHero v-model="activeTab" :user="user" :tabs="tabs" :location-text="locationText" />

      <!-- Main Profile Content Body (3-Column Layout like Reference Image) -->
      <div class="profile-body-content container py-8">
        <ProfileStatsStrip :stats="stats" />

        <div class="profile-main-grid">
          <ProfileLeftColumn :user="user" :playing-track="playingTrack" @play-track="playTrack" />

          <ProfileCenterColumn
            v-model="newPostContent"
            :user="user"
            :likes-count="likesCount"
            @submit-post="submitPost"
            @like="likePost"
          />

          <ProfileRightColumn :selected-poll="selectedPoll" @select-poll="selectPollOption" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * ProfilePage — thin shell.
 * Owns the async loading gate and wires src/composables/useProfile.js into the
 * sliced components under src/components/profile/. Static content lives in
 * src/data/profileData.js.
 */
import ContentSkeleton from '../components/ui/ContentSkeleton.vue';
import AppStateView from '../components/ui/AppStateView.vue';
import ProfileNav from '../components/profile/ProfileNav.vue';
import ProfileHero from '../components/profile/ProfileHero.vue';
import ProfileStatsStrip from '../components/profile/ProfileStatsStrip.vue';
import ProfileLeftColumn from '../components/profile/ProfileLeftColumn.vue';
import ProfileCenterColumn from '../components/profile/ProfileCenterColumn.vue';
import ProfileRightColumn from '../components/profile/ProfileRightColumn.vue';

import { useAsyncData } from '../composables/useAsyncData';
import { useProfile } from '../composables/useProfile';

const {
  user,
  stats,
  locationText,
  tabs,
  activeTab,
  newPostContent,
  submitPost,
  likesCount,
  likePost,
  playingTrack,
  playTrack,
  selectedPoll,
  selectPollOption,
  handleLogout,
} = useProfile();

/* ---------- initial load (drives the skeleton) ---------- */
const { loading, error, reload } = useAsyncData(
  async () => {
    // Stand-in for `api.fetchProfile()`; swap this for a real request.
    await Promise.resolve();
    return true;
  },
  { delay: 600 },
);
</script>

<style scoped>
.base-club-profile {
  min-height: 100vh;
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
  padding-bottom: 60px;
}

/* 3 columns grid: intro / timeline / widgets */
.profile-main-grid {
  display: grid;
  grid-template-columns: 290px 1fr 290px;
  gap: 24px;
}

/* Vertical breathing room for the skeleton / error states (beats .container). */
.base-club-profile .state-frame {
  padding-top: 32px;
  padding-bottom: 32px;
}

@media (max-width: 1100px) {
  .profile-main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
