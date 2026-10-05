// src/data/mockPosts.js
// Mock feed data. In production this is replaced by an API call — the shape
// is intentionally identical so swapping the source is a one-line change in
// src/composables/useFeedPosts.js.

/**
 * @typedef {Object} FeedPost
 * @property {number} id
 * @property {string} handle
 * @property {string} time
 * @property {'Cerita'|'Tanya'} tag
 * @property {string} content
 * @property {number} likes
 * @property {boolean} isLiked
 * @property {string} avatarBg
 * @property {string} avatarText
 */

/** @type {FeedPost[]} */
export const FEED_POSTS = [
  {
    id: 1,
    handle: '@klecomenfess',
    time: 'baru saja',
    tag: 'Cerita',
    content:
      'buat yang kemarin main futsal, pakai jersey krem, dan posturnya tinggi... jujur senyum kamu manis banget kak, asli bikin deg-degan 🙈🫣✨',
    likes: 12,
    isLiked: false,
    avatarBg: '#0038FF',
    avatarText: 'KL',
  },
  {
    id: 2,
    handle: '@fessugm',
    time: 'baru saja',
    tag: 'Cerita',
    content: 'pogung?namamu paling unik cwemuu pasti bykk yaa!!??',
    likes: 8,
    isLiked: false,
    avatarBg: '#7000FF',
    avatarText: 'UGM',
  },
  {
    id: 3,
    handle: '@teramenfess',
    time: '2 mnt',
    tag: 'Cerita',
    content: 'min, kasi tau anak TF25 NIM 56, kamu manis bgt kaya gulali warna wari 😸😼',
    likes: 19,
    isLiked: false,
    avatarBg: '#FF0055',
    avatarText: 'TM',
  },
  {
    id: 4,
    handle: '@darmenfess',
    time: '3 mnt',
    tag: 'Tanya',
    content: 'from : maba mesin\nto : info yang bisa ngajarin matematika dong',
    likes: 5,
    isLiked: false,
    avatarBg: '#00B2FF',
    avatarText: 'DM',
  },
  {
    id: 5,
    handle: '@unermenfess',
    time: '4 mnt',
    tag: 'Cerita',
    content:
      'semangat uas buat anak unair angkatan 23, perjalanan masih panjang tapi kita pasti bisa!',
    likes: 34,
    isLiked: false,
    avatarBg: '#00C853',
    avatarText: 'UM',
  },
];

/** Trending/base tags used by the "Aktivitas" tab filters. */
export const ACTIVITY_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'balasan', label: 'Balasan' },
];
