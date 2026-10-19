/**
 * src/composables/useBases.js
 * ---------------------------------------------------------------------------
 * Shared base directory fetched from the backend (GET /bases).
 * Module-level cache so every screen (feed, explore, landing, admin,
 * compose) reuses the same list instead of fetching it again.
 */

import { ref } from 'vue';
import { api } from '../api';

const bases = ref([]);
const loading = ref(false);
const error = ref(null);
const loaded = ref(false);
let inflight = null;
let lastFetchedAt = 0;

/** Data direktori dianggap segar selama 180 detik / 3 menit (stale-while-revalidate). */
const BASE_CACHE_TTL = 180_000;

/** Normalize an API Base payload into the UI base model. */
export function mapBase(raw) {
  if (!raw) return null;
  const handle = raw.handle
    ? raw.handle.startsWith('@')
      ? raw.handle
      : `@${raw.handle}`
    : '@base';
  return {
    id: raw.id,
    name: raw.name,
    handle,
    initial: raw.initial || handle.replace(/^@/, '').slice(0, 2).toUpperCase(),
    color: raw.color || '#0055FF',
    category: raw.category || 'Umum',
    members: raw.members ?? raw.followers_count ?? 0,
    keyword: raw.keyword || `[${handle.replace(/^@/, '')}]`,
    avatar: raw.avatar || raw.initial || 'BA',
    verified: raw.verified ?? raw.is_verified ?? false,
    isVerified: raw.is_verified ?? raw.verified ?? false,
    isFollowing: raw.is_following ?? false,
    is_following: raw.is_following ?? false,
    bio: raw.bio || '',
    igAccount: raw.ig_account || '',
    rules: Array.isArray(raw.rules) ? raw.rules : [],
    followersCount: raw.followers_count ?? 0,
    followingCount: raw.following_count ?? 0,
    fessCount: raw.fess_count ?? 0,
    established: raw.established || '2024',
  };
}

export function useBases() {
  /**
   * Fetch the base directory (optionally with API filters:
   * search, category, following, page, limit).
   */
  async function fetchBases(params = {}, { silent = false } = {}) {
    if (!silent) loading.value = true;
    error.value = null;
    try {
      const res = await api.getBases({ limit: 100, ...params });
      bases.value = (res?.data || []).map(mapBase);
      loaded.value = true;
      lastFetchedAt = Date.now();
      return bases.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      if (!silent) loading.value = false;
    }
  }

  /**
   * Serve dari cache modul dengan pola stale-while-revalidate:
   * - cache segar (< 90 dtk)  → langsung kembalikan cache;
   * - cache basi              → kembalikan cache SEKARANG, refresh di belakang;
   * - belum ada cache         → tunggu fetch pertama.
   */
  function ensureLoaded() {
    if (loaded.value && bases.value.length) {
      const isStale = Date.now() - lastFetchedAt > BASE_CACHE_TTL;
      if (isStale && !inflight) {
        // Background refresh — senyap, error diabaikan agar UI tetap pakai cache lama.
        inflight = fetchBases({}, { silent: true })
          .catch(() => bases.value)
          .finally(() => {
            inflight = null;
          });
      }
      return Promise.resolve(bases.value);
    }
    if (!inflight) {
      inflight = fetchBases().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  /** Fetch a single base by handle and merge it into the cache. */
  async function fetchBase(handle) {
    const res = await api.getBase(String(handle).replace(/^@/, ''));
    const base = mapBase(res);
    const idx = bases.value.findIndex((b) => b.handle === base.handle);
    if (idx >= 0) bases.value.splice(idx, 1, base);
    else bases.value.push(base);
    return base;
  }

  /** Patch a base in the local cache (after follow/unfollow/settings). */
  function patchBase(handle, patch) {
    const clean = String(handle).replace(/^@/, '');
    const idx = bases.value.findIndex((b) => b.handle.replace(/^@/, '') === clean);
    if (idx >= 0) bases.value.splice(idx, 1, { ...bases.value[idx], ...patch });
  }

  return {
    bases,
    loading,
    error,
    loaded,
    fetchBases,
    ensureLoaded,
    fetchBase,
    patchBase,
    mapBase,
  };
}
