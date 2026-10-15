/**
 * src/composables/useFollowBase.js
 * ---------------------------------------------------------------------------
 * Follow/unfollow bases through the backend (POST /bases/:handle/follow).
 * The followed list is cached in localStorage for instant first paint and
 * refreshed from GET /users/me/following for authenticated users.
 */

import { ref } from 'vue';
import { api } from '../api';
import { useAuthStore } from '../stores/authStore';

const STORAGE_KEY = 'fess_followed_bases';

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedFollowedHandles.value));
  } catch {
    // storage full/blocked — cache is best-effort
  }
}

// Shared module-level reactive state so changes sync across all components.
const sharedFollowedHandles = ref(readCache());
let syncInflight = null;

const clean = (handle) => {
  const h = String(handle || '');
  return h.startsWith('@') ? h : `@${h}`;
};

export function useFollowBase() {
  const authStore = useAuthStore();

  function isFollowing(handle) {
    if (!handle) return false;
    return sharedFollowedHandles.value.includes(clean(handle));
  }

  /** Refresh the followed list from the backend. */
  function syncFollowing() {
    if (!authStore.isAuthenticated) return Promise.resolve(sharedFollowedHandles.value);
    if (syncInflight) return syncInflight;

    syncInflight = api
      .getMyFollowing()
      .then((res) => {
        const list = (res?.data ?? res ?? []).map((b) => clean(b.handle || b));
        sharedFollowedHandles.value = list;
        persist();
        return list;
      })
      .catch(() => sharedFollowedHandles.value)
      .finally(() => {
        syncInflight = null;
      });

    return syncInflight;
  }

  /**
   * Toggle follow state (optimistic, reconciled with the API response).
   * @returns {Promise<boolean>} the new following state
   */
  async function toggleFollowBase(handle) {
    if (!handle) return false;
    const target = clean(handle);
    const wasFollowing = isFollowing(target);

    // Optimistic update
    if (wasFollowing) {
      sharedFollowedHandles.value = sharedFollowedHandles.value.filter((h) => h !== target);
    } else {
      sharedFollowedHandles.value = [...sharedFollowedHandles.value, target];
    }
    persist();

    if (!authStore.isAuthenticated) return !wasFollowing;

    try {
      const res = await api.followBase(target.replace(/^@/, ''));
      const nowFollowing = res?.is_following ?? !wasFollowing;
      if (nowFollowing) {
        if (!isFollowing(target)) sharedFollowedHandles.value = [...sharedFollowedHandles.value, target];
      } else {
        sharedFollowedHandles.value = sharedFollowedHandles.value.filter((h) => h !== target);
      }
      persist();
      return nowFollowing;
    } catch (e) {
      // Rollback on failure
      if (wasFollowing) {
        if (!isFollowing(target)) sharedFollowedHandles.value = [...sharedFollowedHandles.value, target];
      } else {
        sharedFollowedHandles.value = sharedFollowedHandles.value.filter((h) => h !== target);
      }
      persist();
      throw e;
    }
  }

  return {
    followedHandles: sharedFollowedHandles,
    isFollowing,
    toggleFollowBase,
    syncFollowing,
  };
}
