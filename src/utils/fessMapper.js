/**
 * src/utils/fessMapper.js
 * ---------------------------------------------------------------------------
 * Normalize API Fess / Comment payloads (see api-contract.yml) into the view
 * models consumed by the feed cards. Kept out of components so every screen
 * (feed, explore, base profile, moderation) maps identically.
 */

import { formatRelativeTime } from './format';

/** Stable avatar colour derived from a handle — no fake brand colours needed. */
const AVATAR_PALETTE = [
  '#0038FF',
  '#7000FF',
  '#FF0055',
  '#00B2FF',
  '#00C853',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#EF4444',
];

export function colorForHandle(handle = '') {
  const s = String(handle).replace(/^@/, '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

/** API Comment → card comment model. */
export function mapFessComment(c) {
  if (!c) return null;
  return {
    id: c.id,
    author: c.author || '@anonim',
    text: c.text,
    time: formatRelativeTime(c.created_at ?? c.createdAt ?? Date.now()),
  };
}

/** API quoted_fess → quoted card model (also the shape POST /fesses wants). */
export function mapQuotedFess(q) {
  if (!q) return null;
  const handle = q.handle ? (q.handle.startsWith('@') ? q.handle : `@${q.handle}`) : '@anonim';
  return {
    id: q.id,
    handle,
    senderHandle: handle,
    time: q.time || '',
    content: q.content,
    avatar_bg: q.avatar_bg || q.avatarBg || colorForHandle(handle),
    avatar_text:
      q.avatar_text || q.avatarText || handle.replace(/^@/, '').slice(0, 2).toUpperCase(),
    avatarBg: q.avatar_bg || q.avatarBg || colorForHandle(handle),
    avatarText: q.avatar_text || q.avatarText || handle.replace(/^@/, '').slice(0, 2).toUpperCase(),
  };
}

/** Avatar base bisa berupa URL/data-URL foto atau inisial teks. */
const IMAGE_URL_RE = /^(data:image\/|https?:\/\/|\/)/i;

/** API Fess → card model used by FessCard / FeedHomeTab / moderation. */
export function mapFessToPost(f) {
  if (!f) return null;
  const rawHandle = f.base_handle || f.baseHandle || f.handle || '@anonim';
  const handle = String(rawHandle).startsWith('@') ? String(rawHandle) : `@${rawHandle}`;
  const clean = handle.replace(/^@/, '');

  // Avatar kartu fess = foto profil base (kalau ada). Backend mengirim
  // `base_avatar` yang bisa berupa foto (URL/data-URL) atau inisial teks.
  const rawBaseAvatar = f.base_avatar ?? f.baseAvatar ?? null;
  const avatarImg =
    typeof rawBaseAvatar === 'string' && IMAGE_URL_RE.test(rawBaseAvatar) ? rawBaseAvatar : null;
  const avatarText =
    !avatarImg &&
    typeof rawBaseAvatar === 'string' &&
    rawBaseAvatar.trim() &&
    rawBaseAvatar.length <= 3
      ? rawBaseAvatar.trim().toUpperCase()
      : clean.slice(0, 2).toUpperCase() || 'FS';

  return {
    id: f.id,
    handle,
    senderHandle: handle,
    time: formatRelativeTime(f.created_at ?? f.createdAt ?? Date.now()),
    // Tag hanya diisi jika backend memang punya tag asli (bukan default palsu).
    tag: f.tag || null,
    content: f.content,
    likes: f.upvotes ?? 0,
    downvotes: f.downvotes ?? 0,
    isLiked: (f.user_vote ?? f.userVote) === 'up',
    userVote: f.user_vote ?? f.userVote ?? null,
    isSaved: Boolean(f.is_saved ?? f.isSaved ?? false),
    commentsCount: f.comments_count ?? f.commentsCount ?? 0,
    comments: Array.isArray(f.comments) ? f.comments.map(mapFessComment) : [],
    // UI badges use 'approved' for published content.
    status: f.status === 'published' ? 'approved' : f.status,
    rawStatus: f.status,
    postedToIg: f.posted_to_ig ?? f.postedToIg ?? false,
    igStatus: f.ig_status ?? f.igStatus ?? 'idle',
    igError: f.ig_error ?? f.igError ?? null,
    // Otorisasi Instagram dari server. `undefined` = payload lama / endpoint
    // yang tidak menghitung izin; komponen akan memakai cek kepemilikan lokal.
    canManageInstagram: f.can_manage_instagram ?? f.canManageInstagram ?? undefined,
    igAttempts: f.ig_attempts ?? f.igAttempts ?? 0,
    igUpdatedAt: f.ig_updated_at ?? f.igUpdatedAt ?? null,
    media: Array.isArray(f.media) ? f.media : [],
    song: f.song || null,
    topic: f.topic || null,
    // Label topik asli dari backend (mis. "cerita" → "Cerita").
    topicLabel: f.topic_label || null,
    template: f.template || 'default',
    scheduledAt: f.scheduled_at ?? null,
    quotedFess: f.quoted_fess ? mapQuotedFess(f.quoted_fess) : null,
    // Hasil filter NLP saat mode auto post (dipakai badge admin).
    autoFlagged: f.auto_flagged ?? f.autoFlagged ?? false,
    flagReason: f.flag_reason ?? f.flagReason ?? null,
    avatarImg,
    avatarBg: f.base_color ?? f.baseColor ?? colorForHandle(handle),
    avatarText,
  };
}
