/**
 * src/composables/useProfile.js
 * ---------------------------------------------------------------------------
 * Profile domain state + actions (tabs, composer, likes, playlist, poll).
 * The view only wires this up and passes the results down as props, so every
 * card under src/components/profile/ stays presentational.
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useFessStore } from '../stores/fessStore';
import { PROFILE_TABS, POLL_OPTIONS } from '../data/profileData';

export function useProfile() {
  const router = useRouter();
  const authStore = useAuthStore();
  const fessStore = useFessStore();

  /* ---------- profile data ---------- */
  const user = computed(() => authStore.user || {});
  const userFesses = computed(() => fessStore.fesses);
  const totalUpvotes = computed(() => userFesses.value.reduce((acc, f) => acc + f.upvotes, 0));

  const locationText = computed(() => {
    if (authStore.isSuperAdmin) return 'System Control HQ, Cyber Server';
    if (authStore.isBaseAdmin) return 'Base Moderator Hub, Jakarta';
    return 'San Francisco, CA';
  });

  /** Stats strip: one entry per box, `tone` picks the number colour. */
  const stats = computed(() => [
    { label: 'Confessions Sent', value: userFesses.value.length, tone: 'blue' },
    { label: 'Total Upvotes', value: totalUpvotes.value, tone: 'lime' },
    { label: 'Creator Rank', value: `LVL ${user.value.level || 12}`, tone: 'blue' },
    { label: 'Badges Unlocked', value: user.value.badges?.length || 8, tone: 'lime' },
  ]);

  /* ---------- tabs ---------- */
  const tabs = PROFILE_TABS;
  const activeTab = ref(PROFILE_TABS[0]);

  /* ---------- post composer ---------- */
  const newPostContent = ref('');
  const likesCount = ref(84);

  function submitPost() {
    if (!newPostContent.value.trim()) return;
    fessStore.addFess({
      baseHandle: '@baseclub',
      content: newPostContent.value,
      senderName: user.value.username,
    });
    newPostContent.value = '';
  }

  function likePost() {
    likesCount.value += 1;
  }

  /* ---------- playlist ---------- */
  const playingTrack = ref(null);

  function playTrack(trackId) {
    playingTrack.value = trackId;
  }

  /* ---------- poll ---------- */
  const selectedPoll = ref(POLL_OPTIONS[0].id);

  function selectPollOption(optionId) {
    selectedPoll.value = optionId;
  }

  /* ---------- session ---------- */
  function handleLogout() {
    authStore.logout();
    router.push('/login');
  }

  return {
    // data
    user,
    userFesses,
    totalUpvotes,
    stats,
    locationText,
    // tabs
    tabs,
    activeTab,
    // composer + likes
    newPostContent,
    submitPost,
    likesCount,
    likePost,
    // playlist
    playingTrack,
    playTrack,
    // poll
    selectedPoll,
    selectPollOption,
    // session
    handleLogout,
  };
}
