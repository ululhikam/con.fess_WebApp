/**
 * src/composables/useFeedPosts.js
 * ---------------------------------------------------------------------------
 * Feed domain logic, kept out of the view so it can be reused, tested and
 * swapped for a real API without touching any component.
 */

import { ref, computed } from 'vue';
import { FEED_POSTS } from '../data/mockPosts';

/** Module-level state so Home and Composer share the same list. */
const posts = ref(FEED_POSTS.map((p) => ({ ...p })));

export function useFeedPosts() {
  const feedPosts = computed(() => posts.value);

  /** @param {number} id */
  function toggleLike(id) {
    const post = posts.value.find((p) => p.id === id);
    if (!post) return;
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
  }

  /**
   * Publish a new confession.
   * @param {{ handle: string, content: string, avatarBg?: string, avatarText?: string, media?: Array, quotedFess?: any, tag?: string }} payload
   * @returns {boolean} whether the post was accepted
   */
  function publish({
    handle,
    content,
    avatarBg = '#7000FF',
    avatarText = 'FESS',
    media = [],
    quotedFess = null,
    tag = 'Cerita',
  }) {
    const text = String(content ?? '').trim();
    if (!text && (!media || !media.length)) return false;

    posts.value.unshift({
      id: Date.now(),
      handle: handle || '@anonim',
      senderHandle: handle || '@anonim',
      time: 'baru saja',
      tag: tag || 'Cerita',
      content: text,
      likes: 0,
      isLiked: false,
      avatarBg,
      avatarText,
      media: Array.isArray(media) ? media : [],
      quotedFess: quotedFess || null,
      status: 'approved',
    });
    return true;
  }

  return { feedPosts, toggleLike, publish };
}
