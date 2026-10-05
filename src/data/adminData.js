/**
 * src/data/adminData.js
 * ---------------------------------------------------------------------------
 * Static content for the Base Admin & Super Admin dashboards.
 *
 * Everything here is plain copy / row definitions — no reactivity, no store
 * access. Runtime values (moderation counts, form state, toggles) live in
 * src/composables/useAdminDashboard.js and src/composables/useSuperAdminDashboard.js.
 */

/** id of the single tab panel rendered by the Base Admin dashboard. */
export const ADMIN_PANEL_ID = 'admin-tabpanel';

/** Options for the role switcher in the admin top nav. */
export const ROLE_OPTIONS = [
  { value: 'User', label: 'User / Anon' },
  { value: 'Base Admin', label: 'Base Admin' },
  { value: 'Super Admin', label: 'Super Admin' },
];

/* ============================================================
   BASE ADMIN DASHBOARD
   ============================================================ */

export const BASE_ADMIN_TABS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'konten', label: 'Konten' },
  { id: 'moderasi', label: 'Moderasi' },
  { id: 'komunitas', label: 'Komunitas' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'pengaturan', label: 'Pengaturan' },
  { id: 'koneksi', label: 'Koneksi Platform' },
  { id: 'profil', label: 'Lihat Profil Base' },
];

/**
 * Overview stat cards. `value` is static copy; when it is missing the value is
 * resolved at runtime from the stat store keyed by `key`.
 * accent: 'blue' | 'lime' | 'plain' (decorative accents, mapped to design tokens)
 */
export const BASE_OVERVIEW_STAT_DEFS = [
  { key: 'pending', label: 'Antrean Moderasi', hint: 'Perlu tindakan', accent: 'blue' },
  { key: 'approved', label: 'Fess Disetujui', hint: 'Tayang di feed', accent: 'lime' },
  {
    key: 'members',
    label: 'Anggota Aktif',
    value: '18.4K',
    hint: 'Pengirim & pembaca',
    accent: 'plain',
  },
  {
    key: 'sla',
    label: 'Status Auto-Canvas',
    value: '100% SLA',
    hint: 'Meta API Connected',
    accent: 'lime',
  },
];

export const TRAFFIC_CHART = {
  title: 'Ringkasan Performa Base',
  description: 'Grafik dan statistik lalu lintas pesan masuk 24 jam terakhir',
  caption: 'Trafik Pesan Harian — Rata-rata 1.240 Fess / Hari',
  bars: [
    { height: '40%', tone: 'blue' },
    { height: '65%', tone: 'blue' },
    { height: '90%', tone: 'blue' },
    { height: '100%', tone: 'lime' },
    { height: '75%', tone: 'blue' },
    { height: '85%', tone: 'blue' },
  ],
};

export const COMMUNITY_SUMMARY = {
  title: 'Manajemen Komunitas & Moderator',
  moderator: {
    caption: 'MODERATOR AKTIF',
    initial: 'M',
    name: 'BaseModerator_Code',
    access: 'Akses: Moderasi & Export',
  },
  blacklist: {
    caption: 'ANGGOTA TERBLACKLST',
    value: '0 IP Terblokir',
    hint: 'Sistem AI auto-filter aktif',
  },
};

export const TREASURY = {
  label: 'Total Saldo Treasury Base',
  balance: '24.580 $CLUB',
  action: 'Penarikan Saldo (Payout)',
};

export const BASE_SETTINGS_FIELDS = [
  { key: 'name', label: 'Nama Base', value: 'Code & Memes Base' },
  { key: 'handle', label: 'Handle Base', value: '@codememfess' },
  { key: 'keywords', label: 'Kata Kunci Auto-Routing', value: '[code], [programming], [dev]' },
];

export const PLATFORM_CONNECTIONS = [
  { id: 'twitter', name: 'Bot Twitter / X Auto-Post', status: 'Terhubung (@codememfess_bot)' },
  {
    id: 'instagram',
    name: 'Instagram Graph API (Canvas Story)',
    status: 'Terhubung (OAuth2 Ready)',
  },
  { id: 'telegram', name: 'Telegram Channel Webhook', status: 'Aktif' },
];

export const PUBLIC_PROFILE = {
  initial: 'C',
  name: 'Code & Memes Base',
  handle: '@codememfess',
  members: '18.4K Anggota',
  bio: 'Base resmi komunitas developer, programmer, dan pengembang software. Kirim confession anonim dengan kata kunci [code]!',
  cta: 'Kunjungi Feed Base',
  route: '/feed',
};

/* ============================================================
   SUPER ADMIN DASHBOARD
   ============================================================ */

export const SUPER_ADMIN_HEADER = {
  title: 'Super Admin Global System Control',
  subtitle: 'Monitor global system SLA, rate limiters, auto-moderation, bad actors & Redis cache',
  health: 'System Health OK',
};

export const SYSTEM_STATS = [
  { key: 'confessions', label: 'Global Confessions Sent', value: '142,890', accent: 'blue' },
  { key: 'bases', label: 'Active Auto-Bases', value: '84 Bases', accent: 'lime' },
  { key: 'load', label: 'System Load / CPU', value: '12.4% SLA', accent: 'pink' },
  { key: 'banned', label: 'Banned Bad Actors', value: '14 Banned', accent: 'plain' },
];

/**
 * Security control rows.
 * kind 'number' → labelled numeric input, kind 'switch' → role="switch" pill.
 */
export const SECURITY_CONTROL_ROWS = [
  {
    id: 'rate-limit',
    kind: 'number',
    title: 'Rate Limit (Per IP)',
    desc: 'Maksimal fess dikirim per menit',
    value: 5,
    min: 1,
    max: 60,
  },
  {
    id: 'ai-filter',
    kind: 'switch',
    title: 'Auto-Moderation AI Filter',
    desc: 'Otomatis filter keyword SARA & Spam',
    onLabel: 'ACTIVE',
    offLabel: 'PAUSED',
    defaultOn: true,
  },
  {
    id: 'canvas-worker',
    kind: 'switch',
    title: 'Canvas Render Worker',
    desc: 'Puppeteer / Canvas background job',
    onLabel: 'RUNNING',
    offLabel: 'STOPPED',
    defaultOn: true,
  },
];

/** Real-time engine log stream. tone: 'ok' | 'info' | 'muted'. */
export const ENGINE_LOGS = [
  {
    id: 'log-1',
    time: '10:48:12',
    source: 'RATE_LIMITER',
    message: 'IP 192.168.1.31 clean (0/5 req)',
    tone: 'ok',
  },
  {
    id: 'log-2',
    time: '10:48:15',
    source: 'CANVAS_WORKER',
    message: 'Fess #142890 rendered in 12ms',
    tone: 'info',
  },
  {
    id: 'log-3',
    time: '10:48:18',
    source: 'AUTO_BASE',
    message: '@codememfess routed 1 new confession',
    tone: 'muted',
  },
  {
    id: 'log-4',
    time: '10:48:22',
    source: 'REDIS_CACHE',
    message: 'Memory usage 42.1MB / 512MB',
    tone: 'ok',
  },
];
