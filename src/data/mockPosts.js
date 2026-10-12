// src/data/mockPosts.js
// Mock feed data. In production this is replaced by an API call — the shape
// is intentionally identical so swapping the source is a one-line change in
// src/composables/useFeedPosts.js.

import { MOCKUP_IMAGES, MOCKUP_VIDEOS } from './mockupMedia';

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
      'buat yang kemarin main futsal, pakai jersey krem, dan posturnya tinggi... jujur senyum kamu manis banget kak, asli bikin deg-degan.',
    likes: 12,
    isLiked: false,
    avatarBg: '#0038FF',
    avatarText: 'KL',
  },
  {
    id: 2,
    handle: '@unermenfess',
    time: '3 mnt lalu',
    tag: 'Cerita',
    content: 'Suasana perpus lantai 2 sore ini adem dan hening banget, recommended bgt buat yg butuh ketenangan ngerjain tugas akhir!',
    likes: 47,
    isLiked: false,
    avatarBg: '#00C853',
    avatarText: 'UM',
    media: [
      {
        type: 'image',
        url: MOCKUP_IMAGES[0].url,
        thumbnail: MOCKUP_IMAGES[0].thumbnail,
        caption: MOCKUP_IMAGES[0].caption,
      },
    ],
  },
  {
    id: 3,
    handle: '@codememfess',
    time: '6 mnt lalu',
    tag: 'Cerita',
    content: 'Setup nugas weekend ini di coffee shop favorit. Ditemani kopi hitam dan debug query SQL yang lambat :D Ada yg senasib?',
    likes: 68,
    isLiked: true,
    avatarBg: '#0055FF',
    avatarText: 'CM',
    media: [
      {
        type: 'image',
        url: MOCKUP_IMAGES[1].url,
        thumbnail: MOCKUP_IMAGES[1].thumbnail,
        caption: MOCKUP_IMAGES[1].caption,
      },
      {
        type: 'image',
        url: MOCKUP_IMAGES[2].url,
        thumbnail: MOCKUP_IMAGES[2].thumbnail,
        caption: MOCKUP_IMAGES[2].caption,
      },
    ],
  },
  {
    id: 4,
    handle: '@fessugm',
    time: '12 mnt lalu',
    tag: 'Cerita',
    content: 'Vibes jalanan kampus sore hari sehabis hujan, adem dan syahdu bgt min! Ada yang tahu ini jalan sebelah mana?',
    likes: 112,
    isLiked: false,
    avatarBg: '#FF6D00',
    avatarText: 'UGM',
    media: [
      {
        type: 'video',
        url: MOCKUP_VIDEOS[0].url,
        thumbnail: MOCKUP_VIDEOS[0].thumbnail,
        duration: MOCKUP_VIDEOS[0].duration,
        caption: MOCKUP_VIDEOS[0].caption,
      },
    ],
  },
  {
    id: 5,
    handle: '@teramenfess',
    time: '18 mnt lalu',
    tag: 'Cerita',
    content: 'Dokumentasi keseruan acara festival tahunan kampus kemarin! Keren banget panggung sama tata lampunya, gak sabar tahun depan lagi!',
    likes: 95,
    isLiked: false,
    avatarBg: '#FF0055',
    avatarText: 'TM',
    media: [
      {
        type: 'image',
        url: MOCKUP_IMAGES[4].url,
        thumbnail: MOCKUP_IMAGES[4].thumbnail,
      },
      {
        type: 'image',
        url: MOCKUP_IMAGES[3].url,
        thumbnail: MOCKUP_IMAGES[3].thumbnail,
      },
      {
        type: 'image',
        url: MOCKUP_IMAGES[5].url,
        thumbnail: MOCKUP_IMAGES[5].thumbnail,
      },
      {
        type: 'image',
        url: MOCKUP_IMAGES[0].url,
        thumbnail: MOCKUP_IMAGES[0].thumbnail,
      },
    ],
  },
  {
    id: 6,
    handle: '@darmenfess',
    time: '25 mnt lalu',
    tag: 'Tanya',
    content: 'from : maba mesin\nto : info yang bisa ngajarin matematika dasar dan kalkulus dong min, pusing bgt sama turunan',
    likes: 15,
    isLiked: false,
    avatarBg: '#00B2FF',
    avatarText: 'DM',
  },
];

/** Trending/base tags used by the "Aktivitas" tab filters. */
export const ACTIVITY_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'balasan', label: 'Balasan' },
];

/** Dummy menfess posts for Search tab and Quote picker modal. */
export const DUMMY_MENFESS_POSTS = [
  {
    id: 101,
    handle: '@codememfess',
    time: '8 mnt lalu',
    tag: 'Cerita',
    content: 'Jujur aja, pindah dari JavaScript ke TypeScript awalnya pusing mikirin generic type dan inference. Tapi pas udah jalan, berasa tenang banget karena compile time error langsung ketahuan.',
    likes: 48,
    isLiked: false,
    avatarBg: '#0038FF',
    avatarText: 'CM',
    category: 'Teknologi',
    quotedFess: {
      id: 201,
      handle: '@devrant',
      time: '2j lalu',
      content: 'Kenapa masih banyak orang ragu pindah ke TypeScript padahal tooling 2026 udah matang banget ya?',
      avatarBg: '#7000FF',
      avatarText: 'DR',
    },
  },
  {
    id: 102,
    handle: '@unermenfess',
    time: '22 mnt lalu',
    tag: 'Tanya',
    content: 'Info rekomendasi cafe atau spot nugas yang colokannya banyak dan wifinya stabil di sekitar kampus B dong, deadline revisi skripsi mepet.',
    likes: 19,
    isLiked: false,
    avatarBg: '#00C853',
    avatarText: 'UM',
    category: 'Kampus',
  },
  {
    id: 103,
    handle: '@gamerfess',
    time: '45 mnt lalu',
    tag: 'Cerita',
    content: 'Ada yang main Helldivers 2 malam ini? Butuh 2 squadmates buat difficulty Helldive, santai tapi objektif selesai.',
    likes: 31,
    isLiked: true,
    avatarBg: '#FF0055',
    avatarText: 'GF',
    category: 'Gaming',
    quotedFess: {
      id: 202,
      handle: '@mabarzone',
      time: '3j lalu',
      content: 'Mencari rekan mabar weekend yang komunikatif dan no drama!',
      avatarBg: '#FF6D00',
      avatarText: 'MZ',
    },
  },
  {
    id: 104,
    handle: '@teramenfess',
    time: '1j lalu',
    tag: 'Cerita',
    content: 'Makasih banyak buat mas ojol yang nemuin dompet saya jatuh di deket gerbang utama dan dianterin balik ke asrama. Semoga rezekinya berlimpah berkah selalu.',
    likes: 85,
    isLiked: false,
    avatarBg: '#FF0055',
    avatarText: 'TM',
    category: 'Kampus',
  },
  {
    id: 105,
    handle: '@designfess',
    time: '2j lalu',
    tag: 'Tanya',
    content: 'Kalian kalau bikin wireframe lebih suka explore langsung di Figma atau coret-coret di notebook dulu? Rasanya tangan lebih leluasa di kertas.',
    likes: 62,
    isLiked: false,
    avatarBg: '#00B2FF',
    avatarText: 'DF',
    category: 'Desain',
  },
  {
    id: 106,
    handle: '@curhatfess',
    time: '3j lalu',
    tag: 'Cerita',
    content: 'Terkadang kita terlalu sibuk memikirkan masa depan sampai lupa menikmati proses hari ini. Semangat buat pejuang karir pertama!',
    likes: 114,
    isLiked: false,
    avatarBg: '#7000FF',
    avatarText: 'CF',
    category: 'Curhat',
  },
];

