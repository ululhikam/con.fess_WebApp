/**
 * src/api/mock.js
 * Mock backend that mimics a real REST API using existing stores/composables.
 * Every function returns a Promise to simulate network latency.
 */

import { useFessStore } from '../stores/fessStore';
import { useAuthStore } from '../stores/authStore';
import { useFollowBase } from '../composables/useFollowBase';
import { formatRelativeTime } from '../utils/format';
import { ALL_BASES } from '../data/bases';

/** Configurable fake latency (ms). */
const LATENCY = {
  min: 150,
  max: 400,
  /** Simulate occasional errors for testing error boundaries. */
  errorRate: 0,
};

function delay() {
  const ms = LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min);
  return new Promise((r) => setTimeout(r, ms));
}

function maybeThrow() {
  if (Math.random() < LATENCY.errorRate) {
    throw new Error('Simulated network error');
  }
}

const fessStore = useFessStore();
const authStore = useAuthStore();
const followBase = useFollowBase(['@ustfess', '@codememfess']);

/** Convert internal fess to API shape. */
function serializeFess(fess) {
  return {
    id: fess.id,
    base_handle: fess.baseHandle,
    content: fess.content,
    created_at: Date.now() - parseRelative(fess.timestamp),
    upvotes: fess.upvotes,
    downvotes: fess.downvotes,
    user_vote: fess.userVote,
    comments_count: fess.commentsCount,
    status: fess.status,
    comments: fess.comments.map((c) => ({
      id: c.id,
      author: c.author,
      created_at: Date.now() - parseRelative(c.time),
      text: c.text,
    })),
  };
}

/** Parse "12m ago", "3h ago", "2 hari" → ms. */
function parseRelative(str) {
  const m = String(str).match(/(\d+)\s*(mnt|menit|jam|hari|detik|s)/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('d')) return n * 86400000;
  if (unit.startsWith('h') || unit.startsWith('j')) return n * 3600000;
  if (unit.startsWith('m') || unit.startsWith('mnt')) return n * 60000;
  return n * 1000;
}

/** Convert internal base to API shape. */
function serializeBase(base) {
  return {
    id: base.id,
    name: base.name,
    handle: base.handle,
    members: base.members,
    keyword: base.keyword,
    avatar: base.avatar || base.initial,
    verified: base.verified,
    color: base.color,
    is_following: followBase.isFollowing(base.handle),
  };
}

/** Convert internal user to API shape. */
function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    role: user.role,
    avatar: user.avatar,
    level: user.level,
    bio: user.bio,
    badges: user.badges,
    managed_bases: user.managedBases,
  };
}

/* ---------- PUBLIC API ---------- */

export const mockApi = {
  /* ---- AUTH ---- */
  async login(role = 'User') {
    await delay();
    maybeThrow();
    authStore.login(role);
    return { user: serializeUser(authStore.user), token: authStore.token };
  },

  async logout() {
    await delay();
    authStore.logout();
    return { ok: true };
  },

  async me() {
    await delay();
    if (!authStore.isAuthenticated) throw new Error('Unauthenticated');
    return { user: serializeUser(authStore.user) };
  },

  async refreshToken() {
    await delay();
    return { token: authStore.token };
  },

  /* ---- BASES ---- */
  async getBases(params = {}) {
    await delay();
    maybeThrow();
    let list = ALL_BASES.map(serializeBase);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) => b.name.toLowerCase().includes(q) || b.handle.toLowerCase().includes(q),
      );
    }
    if (params.following === 'true') {
      list = list.filter((b) => b.is_following);
    }
    return { data: list, total: list.length };
  },

  async getBase(handle) {
    await delay();
    maybeThrow();
    const base = ALL_BASES.find((b) => b.handle === handle);
    if (!base) throw { status: 404, message: 'Base not found' };
    return serializeBase(base);
  },

  async followBase(handle) {
    await delay();
    maybeThrow();
    followBase.toggleFollowBase(handle);
    return { is_following: followBase.isFollowing(handle) };
  },

  /* ---- FESSES (POSTS) ---- */
  async getFesses(params = {}) {
    await delay();
    maybeThrow();
    let list = fessStore.fesses.map(serializeFess);

    if (params.base) {
      list = list.filter((f) => f.base_handle === params.base);
    }
    if (params.status) {
      list = list.filter((f) => f.status === params.status);
    }
    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter((f) => f.content.toLowerCase().includes(q));
    }

    // Sorting
    const sort = params.sort || 'newest';
    if (sort === 'popular') {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      list.sort((a, b) => b.created_at - a.created_at);
    }

    // Pagination
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const start = (page - 1) * limit;
    return {
      data: list.slice(start, start + limit),
      total: list.length,
      page,
      limit,
      total_pages: Math.ceil(list.length / limit),
    };
  },

  async getFess(id) {
    await delay();
    maybeThrow();
    const fess = fessStore.fesses.find((f) => f.id === id);
    if (!fess) throw { status: 404, message: 'Fess not found' };
    return serializeFess(fess);
  },

  async createFess(payload) {
    await delay();
    maybeThrow();
    if (!authStore.isAuthenticated) throw { status: 401, message: 'Login required' };

    const newFess = fessStore.addFess(payload.base_handle, payload.content);
    return serializeFess(newFess);
  },

  async voteFess(id, type) {
    await delay();
    maybeThrow();
    fessStore.vote(id, type);
    const fess = fessStore.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  async approveFess(id) {
    await delay();
    maybeThrow();
    fessStore.approveFess(id);
    const fess = fessStore.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  async rejectFess(id) {
    await delay();
    maybeThrow();
    fessStore.rejectFess(id);
    const fess = fessStore.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  /* ---- COMMENTS ---- */
  async getComments(fessId) {
    await delay();
    maybeThrow();
    const fess = fessStore.fesses.find((f) => f.id === fessId);
    if (!fess) throw { status: 404, message: 'Fess not found' };
    return {
      data: fess.comments.map((c) => ({
        id: c.id,
        author: c.author,
        created_at: Date.now() - parseRelative(c.time),
        text: c.text,
      })),
    };
  },

  async addComment(fessId, text) {
    await delay();
    maybeThrow();
    if (!authStore.isAuthenticated) throw { status: 401, message: 'Login required' };

    const fess = fessStore.fesses.find((f) => f.id === fessId);
    if (!fess) throw { status: 404, message: 'Fess not found' };

    const comment = {
      id: 'c_' + Date.now(),
      author: authStore.displayName,
      time: 'baru saja',
      text: String(text).trim(),
    };
    fess.comments.unshift(comment);
    fess.commentsCount = fess.comments.length;
    return comment;
  },

  /* ---- NOTIFICATIONS / ACTIVITY ---- */
  async getNotifications(params = {}) {
    await delay();
    maybeThrow();
    // Generate mock notifications from fesses
    const notifs = fessStore.fesses.flatMap((f) =>
      f.comments.map((c) => ({
        id: `notif_${f.id}_${c.id}`,
        type: 'comment',
        fess_id: f.id,
        fess_content: truncate(f.content, 60),
        actor: c.author,
        text: `membalas fessmu: "${truncate(c.text, 40)}"`,
        created_at: Date.now() - parseRelative(c.time),
        read: Math.random() > 0.5,
      })),
    );
    notifs.sort((a, b) => b.created_at - a.created_at);
    return { data: notifs.slice(0, params.limit || 20) };
  },

  async markNotificationsRead(ids) {
    await delay();
    return { ok: true };
  },

  /* ---- USER PROFILE ---- */
  async getProfile(userId) {
    await delay();
    maybeThrow();
    // In mock, we only have current user
    if (authStore.user && authStore.user.id === userId) {
      return { user: serializeUser(authStore.user) };
    }
    throw { status: 404, message: 'User not found' };
  },

  async updateProfile(data) {
    await delay();
    maybeThrow();
    if (!authStore.isAuthenticated) throw { status: 401 };
    // Mock: just merge
    authStore.user = { ...authStore.user, ...data };
    localStorage.setItem('fess_user', JSON.stringify(authStore.user));
    return { user: serializeUser(authStore.user) };
  },

  /* ---- STATS / ADMIN ---- */
  async getStats() {
    await delay();
    maybeThrow();
    const total = fessStore.fesses.length;
    const published = fessStore.fesses.filter((f) => f.status === 'published').length;
    const pending = fessStore.fesses.filter((f) => f.status === 'pending').length;
    const rejected = fessStore.fesses.filter((f) => f.status === 'rejected').length;
    const totalVotes = fessStore.fesses.reduce((s, f) => s + f.upvotes + f.downvotes, 0);
    return {
      total_fesses: total,
      published,
      pending,
      rejected,
      total_votes: totalVotes,
      total_bases: ALL_BASES.length,
      total_users: 1247, // mock
    };
  },

  async getModerationQueue(params = {}) {
    await delay();
    maybeThrow();
    let list = fessStore.fesses.filter((f) => f.status === 'pending').map(serializeFess);
    return { data: list, total: list.length };
  },
};

/** Helper — truncate for notifications. */
function truncate(str, max) {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}
