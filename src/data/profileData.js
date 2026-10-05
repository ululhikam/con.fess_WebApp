// src/data/profileData.js
// ---------------------------------------------------------------------------
// Static / mock content for the profile screen: intro copy, badges, playlist,
// gallery, friends, favourite bases, poll, blog entries and the timeline posts.
// Kept out of the components so the day this is served by an API only
// src/composables/useProfile.js has to change.

import {
  Zap,
  Shield,
  Trophy,
  Flame,
  Gem,
  Gamepad2,
  Rocket,
  Palette,
  Sparkles,
  Crown,
  Martini,
  Guitar,
  Laptop,
  Pizza,
} from 'lucide-vue-next';

/** Tab bar entries shown under the profile header. */
export const PROFILE_TABS = ['Timeline', 'About', 'Friends', 'Photos', 'Videos', 'Badges'];

/** Cover art behind the avatar stage. */
export const COVER_IMAGE = {
  src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
  alt: 'Mountain Cover',
};

/* ---------- Profile Intro card ---------- */

const INTRO_TV_SHOWS =
  'Breaking Bad, RedDwarf, People of Earth, Silicon Valley, Cyberpunk Edgerunners.';
const INTRO_MUSIC_BANDS = 'System of a Revenge, Linkin Park, Daft Punk, The Prodigy, Gorillaz.';

/**
 * "About Me" is derived from the signed-in user, the rest is static copy.
 * @param {{ username?: string, handle?: string }} user
 * @returns {Array<{ label: string, value: string }>}
 */
export function buildIntroSections(user = {}) {
  return [
    {
      label: 'About Me:',
      value: `Hi, I'm ${user.username}. Digital Designer & Base Creator for ${user.handle}. Building next-gen anonymous social engines!`,
    },
    { label: 'Favorite TV Shows:', value: INTRO_TV_SHOWS },
    { label: 'Favorite Music Bands:', value: INTRO_MUSIC_BANDS },
  ];
}

/**
 * "Other Social Networks" links — the twitter handle follows the profile.
 * @param {{ handle?: string }} user
 * @returns {Array<{ key: string, href: string, label: string }>}
 */
export function buildSocialLinks(user = {}) {
  const handle = String(user.handle || '').replace('@', '');
  return [
    { key: 'facebook', href: '#', label: 'Facebook / JamesDev' },
    { key: 'twitter', href: '#', label: `Twitter / @${handle}` },
    { key: 'github', href: '#', label: 'GitHub / baseclub-dev' },
  ];
}

/* ---------- Badges ---------- */

/** @type {Array<{ icon: import('vue').Component, title: string }>} */
export const BADGE_LIST = [
  { icon: Zap, title: 'Speed Confessor' },
  { icon: Shield, title: 'Base Admin' },
  { icon: Trophy, title: 'Top 1% Creator' },
  { icon: Flame, title: '100 Day Streak' },
  { icon: Gem, title: 'Diamond Member' },
  { icon: Gamepad2, title: 'Gamer Pro' },
  { icon: Rocket, title: 'Meta Cross-Poster' },
  { icon: Palette, title: 'Canvas Master' },
  { icon: Sparkles, title: 'Community Hero' },
  { icon: Crown, title: 'Super Admin' },
];

/* ---------- Spotify playlist ---------- */

export const SPOTIFY_TRACKS = [
  { id: 1, title: 'The Fast Starts High', artist: 'System of a Revenge', time: '3:22' },
  { id: 2, title: 'The Pretender', artist: 'Foo Fighters', time: '4:15' },
  { id: 3, title: 'Blood Brothers', artist: 'Iron Maiden', time: '5:05' },
  { id: 4, title: 'Seven Nation Army', artist: 'The White Stripes', time: '4:17' },
  { id: 5, title: 'Killer Queen', artist: 'Queen', time: '3:40' },
];

/* ---------- Twitter cross-post ---------- */

export const CROSS_POST_TWEET = {
  time: '2 hours ago',
  text: 'Testing the new Base Club Anon Engine with NestJS + Canvas renderer 🚀 Auto-crosspost works like magic!',
};

/* ---------- Photos gallery ---------- */

export const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
];

/* ---------- Friends ---------- */

export const FRIENDS_TOTAL = 85;

export const FRIENDS = [
  { name: 'Felix', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { name: 'Aneka', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { name: 'Bob', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { name: 'Jack', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { name: 'Zoe', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
  { name: 'Sam', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { name: 'Leo', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { name: 'Maya', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
];

/* ---------- Favorite pages ---------- */

/** @type {Array<{ icon: import('vue').Component, name: string, cat: string }>} */
export const FAVORITE_BASES = [
  { icon: Martini, name: 'The Marina Bar', cat: 'Restaurant / Bar' },
  { icon: Guitar, name: 'Taprooms Rock', cat: 'Rock Band' },
  { icon: Laptop, name: 'Pixel Digital Design', cat: 'Company' },
  { icon: Pizza, name: 'Play Bar & Grill', cat: 'Restaurant / Bar' },
];

/* ---------- Interactive poll ---------- */

export const POLL_QUESTION =
  'If you had to choose, which actor do you prefer as the new Dark Knight?';

export const POLL_OPTIONS = [
  { id: 1, name: 'Thomas Bale', percent: 62 },
  { id: 2, name: 'Ben Pattinson', percent: 37 },
  { id: 3, name: 'Michael Keaton', percent: 71 },
];

/* ---------- Blog posts ---------- */

export const BLOG_POSTS = [
  {
    title: 'My Perfect Vacations in South America and Europe',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    time: '7 hours ago',
  },
  {
    title: 'The Big Experience of Travelling Alone',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    time: 'March 18th, 2026',
  },
];

/* ---------- Timeline ---------- */

/**
 * `interactive: true` posts own a live like counter (src/composables/useProfile.js),
 * the other likes stay static mock numbers. `media` is either null, a music
 * preview box or a full-width photo.
 */
export const TIMELINE_POSTS = [
  {
    id: 'post-text',
    authorNote: '',
    time: '15 hours ago',
    tag: 'USER CONFESS',
    content:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
    likes: 84,
    comments: 17,
    shares: 24,
    interactive: true,
    media: null,
  },
  {
    id: 'post-music',
    authorNote: 'shared a link',
    time: '1 hour ago',
    tag: null,
    content:
      'If someone missed it, check out the new song by System of a Revenge! I think they are going back to their roots...',
    likes: 113,
    comments: 3,
    shares: 16,
    interactive: false,
    media: {
      type: 'music',
      image:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
      title: 'System of a Revenge - Nothing Else Matters (LIVE)',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
      source: 'youtube.com',
    },
  },
  {
    id: 'post-photo',
    authorNote: "shared Diana Jameson's photo",
    time: '7 hours ago',
    tag: null,
    content:
      "Hi! Everyone should check out these amazing photographs that my friend shot the past week. Here's one of them... Leave a kind comment!",
    likes: 158,
    comments: 8,
    shares: 15,
    interactive: false,
    media: {
      type: 'photo',
      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      alt: 'Model Portrait',
    },
  },
];
