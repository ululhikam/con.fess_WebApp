// src/composables/useFollowBase.js
// Composable untuk logika follow/unfollow base

import { ref } from 'vue'

export function useFollowBase(initialFollowed = []) {
  const followedHandles = ref([...initialFollowed])

  function isFollowing(handle) {
    return followedHandles.value.includes(handle)
  }

  function toggleFollowBase(handle) {
    if (isFollowing(handle)) {
      followedHandles.value = followedHandles.value.filter(h => h !== handle)
    } else {
      followedHandles.value.push(handle)
    }
  }

  return { followedHandles, isFollowing, toggleFollowBase }
}
