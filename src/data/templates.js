/**
 * src/data/templates.js
 * Template card post yang bisa dipilih user
 */

export const TEMPLATES = [
  {
    key: 'default',
    label: 'Standar',
    description: 'Tampilan klasik dengan avatar, teks, media, dan aksi lengkap',
    preview: 'default',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
    layout: 'vertical',
    borderRadius: 16,
    hasBorder: true,
    shadow: 'md',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'Fokus pada konten, header ringan tanpa border tepi',
    preview: 'minimal',
    features: ['avatar', 'header', 'content', 'media', 'actions'],
    layout: 'vertical',
    borderRadius: 0,
    hasBorder: false,
    borderLeft: true,
    shadow: 'none',
  },
  {
    key: 'card',
    label: 'Kartu',
    description: 'Border tebal, bayangan dalam, cocok untuk highlight',
    preview: 'card',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
    layout: 'vertical',
    borderRadius: 20,
    hasBorder: true,
    borderWidth: 2,
    shadow: 'lg',
  },
  {
    key: 'story',
    label: 'Story',
    description: 'Format vertikal full-width, cocok untuk mobile & share ke IG',
    preview: 'story',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
    layout: 'vertical',
    aspectRatio: '9/16',
    borderRadius: 24,
    hasBorder: false,
    background: 'gradient',
    shadow: 'xl',
    fullWidth: true,
  },
  {
    key: 'text-only',
    label: 'Hanya Teks',
    description: 'Tanpa media, fokus maksimal pada tulisan',
    preview: 'text-only',
    features: ['avatar', 'header', 'content', 'actions'],
    layout: 'vertical',
    borderRadius: 16,
    hasBorder: true,
    shadow: 'sm',
    maxWidth: 480,
    centerContent: true,
  },
  {
    key: 'gallery',
    label: 'Galeri',
    description: 'Grid foto/video hingga 4 item, cocok untuk album',
    preview: 'gallery',
    features: ['avatar', 'header', 'content', 'media-grid', 'actions'],
    layout: 'grid',
    borderRadius: 16,
    hasBorder: true,
    mediaGrid: { columns: 2, gap: 2 },
    shadow: 'md',
  },
  {
    key: 'quote',
    label: 'Kutipan',
    description: 'Tampilan seperti kutipan/quote card, estetik untuk share',
    preview: 'quote',
    features: ['content', 'author', 'actions'],
    layout: 'centered',
    borderRadius: 20,
    hasBorder: false,
    background: 'pattern',
    shadow: 'lg',
    hideHeader: true,
  },
  {
    key: 'announcement',
    label: 'Pengumuman',
    description: 'Style resmi dengan border accent, cocok untuk info penting',
    preview: 'announcement',
    features: ['avatar', 'header', 'badge', 'content', 'media', 'actions'],
    layout: 'vertical',
    borderRadius: 12,
    hasBorder: true,
    borderAccent: true,
    shadow: 'md',
  },
];

/** Get template by key */
export function getTemplateByKey(key) {
  return TEMPLATES.find((t) => t.key === key);
}

/** Get templates that support media */
export function getMediaTemplates() {
  return TEMPLATES.filter((t) => t.features.includes('media') || t.features.includes('media-grid'));
}

/** Get templates for story format */
export function getStoryTemplates() {
  return TEMPLATES.filter((t) => t.aspectRatio === '9/16' || t.preview === 'story');
}

/** Get minimal templates */
export function getMinimalTemplates() {
  return TEMPLATES.filter((t) => t.key === 'minimal' || t.key === 'text-only' || t.key === 'quote');
}
