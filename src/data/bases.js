// src/data/bases.js
// Centralized data untuk semua Base yang tersedia di platform

export const ALL_BASES = [
  {
    name: 'Unair Menfess',
    handle: '@unermenfess',
    initial: 'UM',
    color: '#0038FF',
    category: 'Kampus',
    members: '12.4k',
  },
  {
    name: 'ITS Fess',
    handle: '@fess10nopember',
    initial: 'ITS',
    color: '#FF0055',
    category: 'Kampus',
    members: '8.9k',
  },
  {
    name: 'UGM Fess',
    handle: '@fessugm',
    initial: 'UGM',
    color: '#FF6D00',
    category: 'Kampus',
    members: '21.3k',
  },
  {
    name: 'uny.fess',
    handle: '@unyfess',
    initial: 'UNY',
    color: '#00B2FF',
    category: 'Kampus',
    members: '6.1k',
  },
  {
    name: 'Menfess UNESA',
    handle: '@menfessunesa',
    initial: 'UN',
    color: '#00C853',
    category: 'Kampus',
    members: '9.7k',
  },
  {
    name: 'UNS Menfess',
    handle: '@unsmenfess',
    initial: 'UNS',
    color: '#7000FF',
    category: 'Kampus',
    members: '5.5k',
  },
  {
    name: 'Fess Veteran Jatim',
    handle: '@fessveteranjatim',
    initial: 'VJ',
    color: '#7000FF',
    category: 'Kampus',
    members: '3.2k',
  },
  {
    name: 'UTM Menfess',
    handle: '@utm_menfess',
    initial: 'UTM',
    color: '#0038FF',
    category: 'Kampus',
    members: '2.8k',
  },
  {
    name: 'UNEJMenfess',
    handle: '@unejmenfess',
    initial: 'UNJ',
    color: '#FF0055',
    category: 'Kampus',
    members: '4.0k',
  },
  {
    name: 'KLE Comenfess',
    handle: '@klecomenfess',
    initial: 'KL',
    color: '#F59E0B',
    category: 'Kampus',
    members: '7.2k',
  },
  {
    name: 'Darmenfess',
    handle: '@darmenfess',
    initial: 'DM',
    color: '#00B2FF',
    category: 'Kampus',
    members: '5.1k',
  },
  {
    name: 'Tera Menfess',
    handle: '@teramenfess',
    initial: 'TM',
    color: '#EC4899',
    category: 'Kampus',
    members: '3.9k',
  },
  {
    name: 'Surabaya Fess',
    handle: '@surabayafess',
    initial: 'SBY',
    color: '#EF4444',
    category: 'Kota',
    members: '18.6k',
  },
  {
    name: 'Jogja Fess',
    handle: '@jogjafess',
    initial: 'JGA',
    color: '#8B5CF6',
    category: 'Kota',
    members: '14.2k',
  },
  {
    name: 'Jakarta Confess',
    handle: '@jktconfess',
    initial: 'JKT',
    color: '#F97316',
    category: 'Kota',
    members: '32.5k',
  },
  {
    name: 'Malang Fess',
    handle: '@malangfess',
    initial: 'MLG',
    color: '#06B6D4',
    category: 'Kota',
    members: '9.3k',
  },
  {
    name: 'Bandung Fess',
    handle: '@bandungfess',
    initial: 'BDG',
    color: '#10B981',
    category: 'Kota',
    members: '22.1k',
  },
  {
    name: 'Anime & Manga Fess',
    handle: '@anifess',
    initial: 'ANI',
    color: '#EC4899',
    category: 'Hobi',
    members: '11.4k',
  },
  {
    name: 'Gaming Fess',
    handle: '@gamingfess',
    initial: 'GMF',
    color: '#6366F1',
    category: 'Hobi',
    members: '8.7k',
  },
  {
    name: 'Film & Series Fess',
    handle: '@filmfess',
    initial: 'FF',
    color: '#D97706',
    category: 'Hobi',
    members: '6.8k',
  },
  {
    name: 'Musik Fess',
    handle: '@musikfess',
    initial: 'MF',
    color: '#7C3AED',
    category: 'Hobi',
    members: '10.1k',
  },
  {
    name: 'Random Fess',
    handle: '@randomfess',
    initial: 'RF',
    color: '#64748B',
    category: 'Umum',
    members: '45.2k',
  },
  {
    name: 'Rahasia Fess',
    handle: '@rahasiafess',
    initial: 'RS',
    color: '#1E293B',
    category: 'Umum',
    members: '28.9k',
  },
  {
    name: 'Code & Memes Base',
    handle: '@codememfess',
    initial: 'CM',
    color: '#0055FF',
    category: 'Hobi',
    members: '18.4k',
    bio: 'Base resmi komunitas teknologi, programmer, developer & mahasiswa IT. Kirim pertanyaan coding, keluh kesah ngoding, dan meme IT secara anonim!',
    igAccount: '@codememfess_ig',
    rules: [
      'Gunakan keyword #AskDev untuk pertanyaan atau #CurhatIT untuk keluh kesah.',
      'Dilarang membagikan API key, token, kredensial, atau rahasia perusahaan.',
      'Dilarang melakukan doxxing atau flaming antar bahasa pemrograman.',
      'Maksimal 3 fess per pengguna per hari agar antrean tetap lancar.',
    ],
  },
];

export const BASE_CATEGORIES = ['Semua', 'Kampus', 'Kota', 'Hobi', 'Umum'];

export const FEED_CATEGORIES = ['Semua', 'Kampus', 'Kota', 'Hobi'];

/**
 * Default rules template for any base that does not have custom rules.
 */
export const DEFAULT_BASE_RULES = [
  'Gunakan bahasa yang santun dan hormati sesama anggota komunitas.',
  'Dilarang mengandung unsur SARA, pornografi, doxxing, atau konten ilegal.',
  'Sertakan tag yang relevan seperti #Tanya atau #Cerita.',
  'Fess yang melanggar ketentuan akan ditolak atau dihapus oleh moderator.',
  'Dilarang melakukan spam atau promosi berbayar tanpa izin pengelola.',
];

/**
 * Get base details by handle (case-insensitive, with or without leading @).
 * Returns a fallback base object if handle not found in ALL_BASES.
 */
export function getBaseByHandle(handle) {
  if (!handle) return null;
  const clean = String(handle).trim().replace(/^@/, '').toLowerCase();
  const found = ALL_BASES.find(
    (b) => b.handle.replace(/^@/, '').toLowerCase() === clean
  );

  if (found) {
    return {
      name: found.name,
      handle: found.handle.startsWith('@') ? found.handle : `@${found.handle}`,
      initial: found.initial || found.name.slice(0, 2).toUpperCase(),
      color: found.color || '#0055FF',
      category: found.category || 'Umum',
      members: found.members || '10.5k',
      followersCount: parseInt(found.members) * 1000 || 12400,
      followingCount: found.followingCount || 42,
      fessCount: found.fessCount || 865,
      bio:
        found.bio ||
        `Base resmi komunitas ${found.name}. Wadah berbagi cerita, tanya jawab, dan diskusi anonim terpercaya.`,
      igAccount: found.igAccount || `@${clean}_ig`,
      rules: found.rules && found.rules.length ? found.rules : DEFAULT_BASE_RULES,
      isVerified: true,
      established: found.established || '2023',
    };
  }

  // Fallback for custom / dynamically registered base
  const formattedName = clean
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    name: formattedName ? `${formattedName} Base` : 'Komunitas Fess',
    handle: `@${clean}`,
    initial: clean.slice(0, 2).toUpperCase() || 'FB',
    color: '#0055FF',
    category: 'Komunitas',
    members: '5.2k',
    followersCount: 5200,
    followingCount: 18,
    fessCount: 340,
    bio: `Base resmi ${formattedName || clean}. Kirim fess dan curhat anonim dengan aman dan teratur.`,
    igAccount: `@${clean}_ig`,
    rules: DEFAULT_BASE_RULES,
    isVerified: true,
    established: '2024',
  };
}

/**
 * Sample realistic published confessions for each base when mock posts are requested.
 */
export function getSampleFessesForBase(base) {
  const handle = base.handle.startsWith('@') ? base.handle : `@${base.handle}`;
  const initial = base.initial || 'FS';
  const color = base.color || '#0055FF';

  return [
    {
      id: Number(`90${Math.floor(Math.random() * 899 + 100)}`),
      handle: handle,
      senderHandle: handle,
      time: '15 mnt lalu',
      tag: 'Cerita',
      content: `Haloo warga ${base.name}! Mau berterima kasih banget buat yang tadi siang bantuin balikin kunci motor yang ketinggalan di parkiran. Asli baik banget, semoga berkah rezekinya kak!`,
      likes: 24,
      isLiked: false,
      avatarBg: color,
      avatarText: initial,
      status: 'approved',
      postedToIg: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
          caption: `Suasana di sekitar ${base.name}`,
        },
      ],
    },
    {
      id: Number(`91${Math.floor(Math.random() * 899 + 100)}`),
      handle: handle,
      senderHandle: handle,
      time: '1 jam lalu',
      tag: 'Tanya',
      content: `[Tanya] Info rekomendasi tempat nugas / coworking space yang wifinya kenceng dan colokannya banyak dong sekitaran sini? Mau marathon ngerjain tugas akhir bareng temen.`,
      likes: 18,
      isLiked: false,
      avatarBg: color,
      avatarText: initial,
      status: 'approved',
      postedToIg: true,
      media: [
        {
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
          duration: '0:15',
          caption: 'Video dokumentasi sunset sore',
        },
      ],
    },
    {
      id: Number(`92${Math.floor(Math.random() * 899 + 100)}`),
      handle: handle,
      senderHandle: handle,
      time: '4 jam lalu',
      tag: 'Cerita',
      content: `Jujur kangen banget vibes kumpul offline bareng anak-anak base. Kapan ya ada gathering atau mabar lagi min? Gassken dong min adain meetup santai!`,
      likes: 42,
      isLiked: false,
      avatarBg: color,
      avatarText: initial,
      status: 'approved',
      postedToIg: false,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
  ];
}
