/**
 * src/composables/useFeedPosts.js
 * ---------------------------------------------------------------------------
 * Feed domain logic backed by the real API:
 *   • GET  /fesses            → timeline (paginated / lazy-loaded)
 *   • POST /fesses/:id/vote   → like / unlike
 *   • POST /fesses            → publish a new confession
 *
 * Module-level state so Home and Composer share the same list.
 */

import { ref, computed } from 'vue';
import { api } from '../api';
import { mapFessToPost } from '../utils/fessMapper';

/** Rows per page — the rest stream in via the infinite-scroll sentinel. */
const PAGE_SIZE = 20;

const posts = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const loadMoreError = ref(null);
const error = ref(null);
let postsPage = 1;
let postsTotal = 0;
let loaded = false;
let inflight = null;

/** "Mengikuti" timeline: fess dari base yang diikuti user (server-filtered). */
const followingPosts = ref([]);
const followingLoading = ref(false);
const followingLoadingMore = ref(false);
const followingLoadMoreError = ref(null);
const followingError = ref(null);
let followingPage = 1;
let followingTotal = 0;
let followingLoaded = false;
let followingInflight = null;

/** Append-only merge that keeps ids unique across pages. */
function appendUnique(list, raw, seen) {
  const extra = [];
  for (const item of raw) {
    const mapped = mapFessToPost(item);
    if (!mapped || seen.has(String(mapped.id))) continue;
    seen.add(String(mapped.id));
    extra.push(mapped);
  }
  return [...list, ...extra];
}

export function useFeedPosts() {
  const feedPosts = computed(() => posts.value);
  const followingFeedPosts = computed(() => followingPosts.value);
  const hasMore = computed(() => posts.value.length < postsTotal);
  const followingHasMore = computed(() => followingPosts.value.length < followingTotal);

  /** (Re)load the timeline from the API (first page). */
  async function reload(params = {}) {
    loading.value = true;
    error.value = null;
    loadMoreError.value = null;
    try {
      const res = await api.getFesses({ sort: 'newest', limit: PAGE_SIZE, page: 1, ...params });
      posts.value = (res?.data || []).map(mapFessToPost);
      postsPage = 1;
      postsTotal = res?.total ?? posts.value.length;
      loaded = true;
      return posts.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /** Fetch once, then serve from the module cache. */
  function ensureLoaded(params = {}) {
    if (loaded) return Promise.resolve(posts.value);
    if (!inflight) {
      inflight = reload(params).finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  /** Load the next page of the main timeline (lazy load). */
  async function loadMore(params = {}) {
    if (loading.value || loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    loadMoreError.value = null;
    try {
      const nextPage = postsPage + 1;
      const res = await api.getFesses({
        sort: 'newest',
        limit: PAGE_SIZE,
        page: nextPage,
        ...params,
      });
      const seen = new Set(posts.value.map((p) => String(p.id)));
      posts.value = appendUnique(posts.value, res?.data || [], seen);
      postsPage = nextPage;
      postsTotal = res?.total ?? postsTotal;
    } catch (e) {
      loadMoreError.value = e;
      throw e;
    } finally {
      loadingMore.value = false;
    }
  }

  /** (Re)load the "Mengikuti" timeline — only followed bases. */
  async function reloadFollowing(params = {}) {
    followingLoading.value = true;
    followingError.value = null;
    followingLoadMoreError.value = null;
    try {
      const res = await api.getFesses({
        sort: 'newest',
        limit: PAGE_SIZE,
        page: 1,
        following: true,
        ...params,
      });
      followingPosts.value = (res?.data || []).map(mapFessToPost);
      followingPage = 1;
      followingTotal = res?.total ?? followingPosts.value.length;
      followingLoaded = true;
      return followingPosts.value;
    } catch (e) {
      followingError.value = e;
      throw e;
    } finally {
      followingLoading.value = false;
    }
  }

  /** Fetch the following timeline once, then serve from the module cache. */
  function ensureFollowingLoaded(params = {}) {
    if (followingLoaded) return Promise.resolve(followingPosts.value);
    if (!followingInflight) {
      followingInflight = reloadFollowing(params).finally(() => {
        followingInflight = null;
      });
    }
    return followingInflight;
  }

  /** Load the next page of the "Mengikuti" timeline (lazy load). */
  async function loadMoreFollowing(params = {}) {
    if (followingLoading.value || followingLoadingMore.value || !followingHasMore.value) return;
    followingLoadingMore.value = true;
    followingLoadMoreError.value = null;
    try {
      const nextPage = followingPage + 1;
      const res = await api.getFesses({
        sort: 'newest',
        limit: PAGE_SIZE,
        page: nextPage,
        following: true,
        ...params,
      });
      const seen = new Set(followingPosts.value.map((p) => String(p.id)));
      followingPosts.value = appendUnique(followingPosts.value, res?.data || [], seen);
      followingPage = nextPage;
      followingTotal = res?.total ?? followingTotal;
    } catch (e) {
      followingLoadMoreError.value = e;
      throw e;
    } finally {
      followingLoadingMore.value = false;
    }
  }

  /**
   * Toggle like on a post (optimistic, reconciled with the vote response).
   * Works for rows in either timeline (For You / Mengikuti).
   * @param {string|number} id
   */
  async function toggleLike(id) {
    const post =
      posts.value.find((p) => String(p.id) === String(id)) ||
      followingPosts.value.find((p) => String(p.id) === String(id));
    if (!post) return;

    const wasLiked = post.isLiked;
    post.isLiked = !wasLiked;
    post.likes += post.isLiked ? 1 : -1;

    try {
      const res = await api.voteFess(id, post.isLiked ? 'up' : 'down');
      if (res && typeof res.upvotes === 'number') {
        post.likes = res.upvotes;
        post.downvotes = res.downvotes ?? post.downvotes;
        post.isLiked = res.user_vote === 'up';
        post.userVote = res.user_vote ?? null;
      }
    } catch (e) {
      // Rollback on failure
      post.isLiked = wasLiked;
      post.likes += post.isLiked ? 1 : -1;
      throw e;
    }
  }

  /**
   * Publish a new confession through the API.
   * @param {object} payload — CreateFess payload (base_handle, content, ...)
   * @returns {Promise<object|null>} the created fess mapped for the feed
   */
  async function publish(payload) {
    const res = await api.createFess(payload);
    const created = res?.fess ?? res?.data ?? res;
    if (!created) return null;
    const mapped = mapFessToPost(created);
    posts.value = [mapped, ...posts.value.filter((p) => String(p.id) !== String(mapped.id))];
    postsTotal += 1;
    return mapped;
  }

  return {
    feedPosts,
    loading,
    loadingMore,
    loadMoreError,
    hasMore,
    error,
    reload,
    ensureLoaded,
    loadMore,
    followingPosts: followingFeedPosts,
    followingLoading,
    followingLoadingMore,
    followingLoadMoreError,
    followingHasMore,
    followingError,
    reloadFollowing,
    ensureFollowingLoaded,
    loadMoreFollowing,
    toggleLike,
    publish,
  };
}
