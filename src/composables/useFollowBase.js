// src/composables/useFollowBase.js
// Composable untuk logika follow/unfollow base dengan sinkronisasi localStorage

import { ref } from 'vue';

const STORAGE_KEY = 'fess_followed_bases';
const DEFAULT_FOLLOWED = ['@unermenfess', '@codememfess', '@fessugm', '@teramenfess'];

function getInitialFollowed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_FOLLOWED;
}

// Shared module-level reactive state so changes sync across all components!
const sharedFollowedHandles = ref(getInitialFollowed());

export function useFollowBase(initialFollowed = []) {
  if (initialFollowed && initialFollowed.length && !sharedFollowedHandles.value.length) {
    sharedFollowedHandles.value = [...initialFollowed];
  }

  function isFollowing(handle) {
    if (!handle) return false;
    const clean = handle.startsWith('@') ? handle : `@${handle}`;
    return sharedFollowedHandles.value.includes(clean);
  }

  function toggleFollowBase(handle) {
    if (!handle) return false;
    const clean = handle.startsWith('@') ? handle : `@${handle}`;
    if (isFollowing(clean)) {
      sharedFollowedHandles.value = sharedFollowedHandles.value.filter((h) => h !== clean);
    } else {
      sharedFollowedHandles.value.push(clean);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedFollowedHandles.value));
    } catch (e) {
      // ignore
    }
    return isFollowing(clean);
  }

  return {
    followedHandles: sharedFollowedHandles,
    isFollowing,
    toggleFollowBase,
  };
}
