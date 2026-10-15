/**
 * src/composables/useFeedPosts.js
 * ---------------------------------------------------------------------------
 * Feed domain logic backed by the real API:
 *   • GET  /fesses            → timeline
 *   • POST /fesses/:id/vote   → like / unlike
 *   • POST /fesses            → publish a new confession
 *
 * Module-level state so Home and Composer share the same list.
 */

import { ref, computed } from 'vue';
import { api } from '../api';
import { mapFessToPost } from '../utils/fessMapper';

const posts = ref([]);
const loading = ref(false);
const error = ref(null);
let loaded = false;
let inflight = null;

export function useFeedPosts() {
  const feedPosts = computed(() => posts.value);

  /** (Re)load the timeline from the API. */
  async function reload(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getFesses({ sort: 'newest', limit: 30, ...params });
      posts.value = (res?.data || []).map(mapFessToPost);
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

  /**
   * Toggle like on a post (optimistic, reconciled with the vote response).
   * @param {string|number} id
   */
  async function toggleLike(id) {
    const post = posts.value.find((p) => String(p.id) === String(id));
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
    return mapped;
  }

  return { feedPosts, loading, error, reload, ensureLoaded, toggleLike, publish };
}
