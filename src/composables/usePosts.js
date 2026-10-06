/**
 * src/composables/usePosts.js
 * Unified posts logic: feed, detail, create, vote, comment, share.
 * Uses api layer (mock/real) + format algorithms.
 */

import { ref, computed, watch } from 'vue';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { api } from '../api';
import {
  formatRelativeTime,
  formatCompactNumber,
  calculatePopularityScore,
  isTrending,
  generateShareData,
  validateFessContent,
  calculateRewardPoints,
  generateClientId,
  debounce,
} from '../utils/format';
import { useAuthStore } from '../stores/authStore';

/* ---------- SHARED STATE (module-level) ---------- */
const _feedCache = ref([]);
const _feedPage = ref(1);
const _feedTotal = ref(0);
const _feedLoading = ref(false);
const _feedError = ref(null);
const _searchDebounce = ref(null);

/* ---------- COMPOSABLE ---------- */
export function usePosts() {
  const authStore = useAuthStore();

  /* ---- FEED (paginated) ---- */
  const {
    items: feedPosts,
    loading: feedLoading,
    loadingMore,
    error: feedError,
    hasMore,
    loadMore,
    refresh: refreshFeed,
  } = usePaginatedApi(async ({ page, limit }) => {
    const params = { page, limit, sort: 'newest' };
    const res = await api.getFesses(params);
    _feedPage.value = res.page;
    _feedTotal.value = res.total;
    return res;
  });

  /* ---- SINGLE POST ---- */
  const currentPost = ref(null);
  const postLoading = ref(false);
  const postError = ref(null);

  async function fetchPost(id) {
    postLoading.value = true;
    postError.value = null;
    try {
      const res = await api.getFess(id);
      currentPost.value = enrichPost(res);
      return currentPost.value;
    } catch (e) {
      postError.value = e;
      throw e;
    } finally {
      postLoading.value = false;
    }
  }

  function clearCurrentPost() {
    currentPost.value = null;
    postError.value = null;
  }

  /* ---- MUTATIONS ---- */
  const {
    mutate: createPost,
    loading: creating,
    error: createError,
  } = useMutation((payload) => api.createFess(payload), {
    onMutate: (payload) => {
      // Optimistic: add to feed immediately
      const temp = {
        id: generateClientId('fess'),
        ...payload,
        base_handle: payload.base_handle,
        content: payload.content,
        created_at: Date.now(),
        upvotes: 0,
        downvotes: 0,
        user_vote: null,
        comments_count: 0,
        status: 'pending',
        comments: [],
        _optimistic: true,
      };
      _feedCache.value.unshift(enrichPost(temp));
    },
    onError: (err, payload) => {
      // Rollback optimistic
      _feedCache.value = _feedCache.value.filter(
        (p) => p._optimistic !== true || p.content !== payload.content,
      );
    },
    onSettled: () => refreshFeed(),
  });

  const {
    mutate: votePost,
    loading: voting,
    error: voteError,
  } = useMutation(({ id, type }) => api.voteFess(id, type), {
    onMutate: ({ id, type }) => {
      // Optimistic vote
      const post = findPostById(id);
      if (!post) return;
      post._prevVote = post.userVote;
      post._prevUp = post.upvotes;
      post._prevDown = post.downvotes;

      if (post.userVote === type) {
        // Toggle off
        if (type === 'up') post.upvotes--;
        if (type === 'down') post.downvotes--;
        post.userVote = null;
      } else {
        if (post.userVote === 'up') post.upvotes--;
        if (post.userVote === 'down') post.downvotes--;
        if (type === 'up') post.upvotes++;
        if (type === 'down') post.downvotes++;
        post.userVote = type;
      }
    },
    onError: (err, { id }) => {
      // Rollback
      const post = findPostById(id);
      if (post && post._prevVote !== undefined) {
        post.userVote = post._prevVote;
        post.upvotes = post._prevUp;
        post.downvotes = post._prevDown;
      }
    },
  });

  const { mutate: addComment } = useMutation(({ fessId, text }) => api.addComment(fessId, text), {
    onMutate: ({ fessId, text }) => {
      const post = findPostById(fessId);
      if (!post) return;
      const tempComment = {
        id: generateClientId('c'),
        author: authStore.displayName,
        created_at: Date.now(),
        text,
        _optimistic: true,
      };
      post.comments = [tempComment, ...(post.comments || [])];
      post.commentsCount = (post.commentsCount || 0) + 1;
    },
    onError: (err, { fessId }) => {
      const post = findPostById(fessId);
      if (post) {
        post.comments = (post.comments || []).filter((c) => !c._optimistic);
        post.commentsCount = post.comments.length;
      }
    },
  });

  /* ---- UTILITIES ---- */
  function findPostById(id) {
    // Check current post first
    if (currentPost.value?.id === id) return currentPost.value;
    // Then feed cache
    return _feedCache.value.find((p) => p.id === id) || feedPosts.value.find((p) => p.id === id);
  }

  function enrichPost(raw) {
    return {
      ...raw,
      timeAgo: formatRelativeTime(raw.created_at),
      likesCompact: formatCompactNumber(raw.upvotes),
      commentsCompact: formatCompactNumber(raw.commentsCount || 0),
      popularityScore: calculatePopularityScore({
        upvotes: raw.upvotes,
        downvotes: raw.downvotes,
        commentsCount: raw.commentsCount,
        createdAt: raw.created_at,
      }),
      isTrending: isTrending({
        upvotes: raw.upvotes,
        downvotes: raw.downvotes,
        commentsCount: raw.commentsCount,
        createdAt: raw.created_at,
      }),
      shareData: (baseUrl) => generateShareData(raw, baseUrl),
      rewardPoints: calculateRewardPoints({
        upvotes: raw.upvotes,
        commentsCount: raw.commentsCount,
      }),
      canVote: authStore.isAuthenticated,
      canComment: authStore.isAuthenticated,
      canModerate: authStore.isBaseAdmin,
    };
  }

  /* ---- SEARCH ---- */
  const searchQuery = ref('');
  const searchResults = ref([]);
  const searchLoading = ref(false);

  const debouncedSearch = debounce(async (q) => {
    if (!q.trim()) {
      searchResults.value = [];
      return;
    }
    searchLoading.value = true;
    try {
      const res = await api.getFesses({ query: q, limit: 20, sort: 'newest' });
      searchResults.value = res.data.map(enrichPost);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      searchLoading.value = false;
    }
  }, 300);

  watch(searchQuery, (val) => debouncedSearch(val));

  /* ---- MODERATION (admin) ---- */
  async function moderatePost(id, action) {
    if (action === 'approve') return api.approveFess(id);
    if (action === 'reject') return api.rejectFess(id);
    throw new Error('Invalid action');
  }

  /* ---- EXPORT ---- */
  return {
    // Feed
    feedPosts,
    feedLoading,
    feedLoadingMore,
    feedError,
    hasMore,
    loadMore,
    refreshFeed,

    // Single
    currentPost,
    postLoading,
    postError,
    fetchPost,
    clearCurrentPost,

    // Mutations
    createPost,
    creating,
    createError,
    votePost,
    voting,
    voteError,
    addComment,

    // Search
    searchQuery,
    searchResults,
    searchLoading,

    // Moderation
    moderatePost,

    // Utils
    enrichPost,
    validateFessContent,
    formatRelativeTime,
    formatCompactNumber,
    calculatePopularityScore,
    isTrending,
    generateShareData,
    calculateRewardPoints,
  };
}

/* ---------- HOOKS FOR SPECIFIC USE CASES ---------- */

/** Feed page — auto-load on mount. */
export function useFeedPage() {
  const posts = usePosts();
  // Could add onMounted(() => posts.refreshFeed()) here if needed
  return posts;
}

/** Detail page — load single post. */
export function usePostDetail(id) {
  const posts = usePosts();
  return {
    ...posts,
    post: posts.currentPost,
    loading: posts.postLoading,
    error: posts.postError,
    load: () => posts.fetchPost(id),
  };
}

/** Composer modal — create post. */
export function useComposer() {
  const posts = usePosts();
  return {
    create: posts.createPost,
    loading: posts.creating,
    error: posts.createError,
    validate: validateFessContent,
  };
}

/** Admin moderation queue. */
export function useModerationQueue() {
  const { items, loading, loadingMore, error, hasMore, loadMore, refresh } = usePaginatedApi(
    async ({ page, limit }) => api.getModerationQueue({ page, limit }),
  );
  return { posts: items, loading, loadingMore, error, hasMore, loadMore, refresh };
}

/** Notifications/Activity. */
export function useNotifications() {
  const { items, loading, loadingMore, error, hasMore, loadMore, refresh } = usePaginatedApi(
    async ({ page, limit }) => api.getNotifications({ page, limit }),
  );
  return { notifications: items, loading, loadingMore, error, hasMore, loadMore, refresh };
}
