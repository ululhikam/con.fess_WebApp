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

/** Lazy store accessors — called only when Pinia is active. */
function getFessStore() {
  return useFessStore();
}
function getAuthStore() {
  return useAuthStore();
}
function getFollowBase() {
  return useFollowBase(['@ustfess', '@codememfess']);
}

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
function serializeBase(base, fb) {
  const follower = fb || getFollowBase();
  return {
    id: base.id,
    name: base.name,
    handle: base.handle,
    members: base.members,
    keyword: base.keyword,
    avatar: base.avatar || base.initial,
    verified: base.verified,
    color: base.color,
    is_following: follower.isFollowing(base.handle),
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
    const as = getAuthStore();
    as.login(role);
    return { user: serializeUser(as.user), token: as.token };
  },

  async logout() {
    await delay();
    const as = getAuthStore();
    as.logout();
    return { ok: true };
  },

  async me() {
    await delay();
    const as = getAuthStore();
    if (!as.isAuthenticated) throw new Error('Unauthenticated');
    return { user: serializeUser(as.user) };
  },

  async refreshToken() {
    await delay();
    const as = getAuthStore();
    return { token: as.token };
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
    const fb = getFollowBase();
    const base = ALL_BASES.find((b) => b.handle === handle);
    if (!base) throw { status: 404, message: 'Base not found' };
    return serializeBase(base, fb);
  },

  async followBase(handle) {
    await delay();
    maybeThrow();
    const fb = getFollowBase();
    fb.toggleFollowBase(handle);
    return { is_following: fb.isFollowing(handle) };
  },

  /* ---- FESSES (POSTS) ---- */
  async getFesses(params = {}) {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    let list = fs.fesses.map(serializeFess);

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
    const fs = getFessStore();
    const fess = fs.fesses.find((f) => f.id === id);
    if (!fess) throw { status: 404, message: 'Fess not found' };
    return serializeFess(fess);
  },

  async createFess(payload) {
    await delay();
    maybeThrow();
    const as = getAuthStore();
    if (!as.isAuthenticated) throw { status: 401, message: 'Login required' };

    const fs = getFessStore();
    const newFess = fs.addFess(payload.base_handle, payload.content);
    return serializeFess(newFess);
  },

  async voteFess(id, type) {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    fs.vote(id, type);
    const fess = fs.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  async approveFess(id) {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    fs.approveFess(id);
    const fess = fs.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  async rejectFess(id) {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    fs.rejectFess(id);
    const fess = fs.fesses.find((f) => f.id === id);
    return serializeFess(fess);
  },

  /* ---- COMMENTS ---- */
  async getComments(fessId) {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    const fess = fs.fesses.find((f) => f.id === fessId);
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
    const as = getAuthStore();
    if (!as.isAuthenticated) throw { status: 401, message: 'Login required' };

    const fs = getFessStore();
    const fess = fs.fesses.find((f) => f.id === fessId);
    if (!fess) throw { status: 404, message: 'Fess not found' };

    const comment = {
      id: 'c_' + Date.now(),
      author: as.displayName,
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
    const fs = getFessStore();
    // Generate mock notifications from fesses
    const notifs = fs.fesses.flatMap((f) =>
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
    const as = getAuthStore();
    // In mock, we only have current user
    if (as.user && as.user.id === userId) {
      return { user: serializeUser(as.user) };
    }
    throw { status: 404, message: 'User not found' };
  },

  async updateProfile(data) {
    await delay();
    maybeThrow();
    const as = getAuthStore();
    if (!as.isAuthenticated) throw { status: 401 };
    // Mock: just merge
    as.user = { ...as.user, ...data };
    localStorage.setItem('fess_user', JSON.stringify(as.user));
    return { user: serializeUser(as.user) };
  },

  /* ---- STATS / ADMIN ---- */
  async getStats() {
    await delay();
    maybeThrow();
    const fs = getFessStore();
    const total = fs.fesses.length;
    const published = fs.fesses.filter((f) => f.status === 'published').length;
    const pending = fs.fesses.filter((f) => f.status === 'pending').length;
    const rejected = fs.fesses.filter((f) => f.status === 'rejected').length;
    const totalVotes = fs.fesses.reduce((s, f) => s + f.upvotes + f.downvotes, 0);
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
    const fs = getFessStore();
    let list = fs.fesses.filter((f) => f.status === 'pending').map(serializeFess);
    return { data: list, total: list.length };
  },
};

/** Helper — truncate for notifications. */
function truncate(str, max) {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}
