/**
 * src/config/templates.js
 *
 * Canvas template configuration for the post composer.
 *
 * Every template is a *canvas*: a bold flat/solid background paired with
 * bespoke geometric SVG textures (no gradients) for a crisp, punchy, modern look.
 * Ratios: 1:1 (square), 4:5 (portrait), and 9:16 (story).
 *
 * Features themes: Modern, Pop, Rock, Tech, Minimalist, Indie, Blueprint, etc.
 */

/** Encode a raw SVG string as a CSS `url()` we can layer over a solid background. */
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const xmlns = "xmlns='http://www.w3.org/2000/svg'";

/* ── Geometric SVG Texture Helpers (Non-Gradient, Flat & Sharp) ────────── */

/** Cyberpunk Circuit Grid (Tech) */
const techGrid = (w = 32, stroke = 'rgba(0,255,102,0.18)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M${w} 0H0v${w}' fill='none' stroke='${stroke}' stroke-width='1'/>` +
      `<circle cx='${w}' cy='${w}' r='1.5' fill='${stroke}'/></svg>`,
  );

/** Neo-Brutalist Bold Halftone Dots (Pop) */
const boldHalftone = (w = 24, r = 2.4, fill = 'rgba(0,0,0,0.16)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<circle cx='${w / 2}' cy='${w / 2}' r='${r}' fill='${fill}'/></svg>`,
  );

/** Rock Grunge Industrial Diagonal Slashes (Rock) */
const rockSlashes = (w = 20, stroke = 'rgba(255,0,60,0.18)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M0 ${w} L${w} 0 M-${w / 2} ${w / 2} L${w / 2} -${w / 2} M${w / 2} ${w + w / 2} L${w + w / 2} ${w / 2}' stroke='${stroke}' stroke-width='1.5'/></svg>`,
  );

/** CRT / Console Scanlines (Tech / Hacker) */
const scanlines = (h = 6, stroke = 'rgba(0,240,255,0.16)') =>
  svgUrl(
    `<svg ${xmlns} width='10' height='${h}'>` +
      `<line x1='0' y1='1' x2='10' y2='1' stroke='${stroke}' stroke-width='1'/></svg>`,
  );

/** Y2K Pop Star Confetti & Sparkles (Pop) */
const popConfetti = (w = 40, fill = 'rgba(255,255,255,0.22)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M10 4 L11 8 L15 9 L11 10 L10 14 L9 10 L5 9 L9 8 Z' fill='${fill}'/>` +
      `<circle cx='28' cy='24' r='1.8' fill='${fill}'/>` +
      `<circle cx='14' cy='32' r='1.2' fill='${fill}'/>` +
      `<path d='M30 8 L30.8 10.5 L33 11 L30.8 11.5 L30 14 L29.2 11.5 L27 11 L29.2 10.5 Z' fill='${fill}'/></svg>`,
  );

/** Swiss Minimalist Architectural Grid (Modern) */
const swissGrid = (w = 28, stroke = 'rgba(0,0,0,0.08)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M${w} 0H0v${w}' fill='none' stroke='${stroke}' stroke-width='1'/></svg>`,
  );

/** Acid Electronic Pulse / Synth Waves (Techno) */
const acidWaves = (w = 36, stroke = 'rgba(204,255,0,0.20)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M0 ${w / 2} Q${w / 4} 0 ${w / 2} ${w / 2} T${w} ${w / 2}' fill='none' stroke='${stroke}' stroke-width='1.5'/></svg>`,
  );

/** Streetwear Crosshairs & Micro-Grid (Modern) */
const crosshairs = (w = 30, stroke = 'rgba(0,0,0,0.16)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M${w / 2 - 3} ${w / 2}h6 M${w / 2} ${w / 2 - 3}v6' stroke='${stroke}' stroke-width='1.2'/></svg>`,
  );

/** Analog Tape Cassette Hatch (Indie Rock) */
const tapeHatch = (w = 16, stroke = 'rgba(253,240,213,0.18)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M0 0 L${w} ${w}' stroke='${stroke}' stroke-width='1.2'/></svg>`,
  );

/** Engineering Blueprint Grid & Rulers (Tech) */
const blueprintGrid = (w = 40, stroke = 'rgba(72,202,228,0.22)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M${w} 0H0v${w}' fill='none' stroke='${stroke}' stroke-width='1.2'/>` +
      `<path d='M${w / 2} 0v${w} M0 ${w / 2}h${w}' fill='none' stroke='${stroke}' stroke-dasharray='2,2' stroke-width='0.8'/></svg>`,
  );

/** Soft classic dot grid (Standard fallback) */
const dots = (w = 28, r = 1.6, fill = 'rgba(255,255,255,0.16)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<circle cx='${w / 4}' cy='${w / 4}' r='${r}' fill='${fill}'/></svg>`,
  );

export const ASPECTS = {
  square:   { key: 'square',   value: '1 / 1',  label: 'Feed Persegi 1:1',   exportWidth: 1080 },
  portrait: { key: 'portrait', value: '4 / 5',  label: 'Feed Potret 4:5',    exportWidth: 1080 },
  story:    { key: 'story',    value: '9 / 16', label: 'Story / Reel 9:16',  exportWidth: 1080 },
};

export const TEMPLATES = [
  // ── 1. TECH: Cyberpunk ──────────────────────────────────────────────────
  {
    key: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Tech cyberpunk futuristik — hitam pekat solid bergrid sirkuit neon hijau.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0a0e17',
    texture: techGrid(32, 'rgba(0,255,102,0.18)'),
    accent: '#00ff66',
    category: 'tech',
  },

  // ── 2. POP: Neo-Brutalisme ──────────────────────────────────────────────
  {
    key: 'neobrutalism',
    label: 'Neo-Brutalism',
    description: 'Pop modern bold — kuning elektrik solid dengan polkadot kontras tinggi.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#ffe600',
    texture: boldHalftone(24, 2.4, 'rgba(0,0,0,0.16)'),
    accent: '#000000',
    category: 'pop',
  },

  // ── 3. ROCK: Rock Grunge ────────────────────────────────────────────────
  {
    key: 'rock',
    label: 'Rock Grunge',
    description: 'Underground rock & metal — hitam pekat bergaris tajam merah darah menyala.',
    aspect: 'portrait',
    ink: 'light',
    background: '#121212',
    texture: rockSlashes(20, 'rgba(255,0,60,0.22)'),
    accent: '#ff003c',
    category: 'rock',
  },

  // ── 4. TECH: Terminal Hacker ────────────────────────────────────────────
  {
    key: 'terminal',
    label: 'Terminal Dev',
    description: 'Konsol developer retro-modern — hitam terminal solid bergaris scanline cyan.',
    aspect: 'portrait',
    ink: 'light',
    background: '#080c10',
    texture: scanlines(6, 'rgba(0,240,255,0.18)'),
    accent: '#00f0ff',
    category: 'tech',
  },

  // ── 5. POP: Bubblegum Y2K ───────────────────────────────────────────────
  {
    key: 'bubblegum',
    label: 'Bubblegum Pop',
    description: 'Pop ceria & estetik Y2K — merah muda permen solid beraksen bintang retro.',
    aspect: 'portrait',
    ink: 'light',
    background: '#ff4b8b',
    texture: popConfetti(40, 'rgba(255,255,255,0.24)'),
    accent: '#ffffff',
    category: 'pop',
  },

  // ── 6. MODERN: Swiss Minimalist ─────────────────────────────────────────
  {
    key: 'swiss',
    label: 'Swiss Design',
    description: 'Tipografi modern arsitektural — putih gading solid bergrid minimalis presisi.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#f4f4f0',
    texture: swissGrid(28, 'rgba(0,0,0,0.08)'),
    accent: '#e63946',
    category: 'modern',
  },

  // ── 7. MODERN/TECH: Acid Techno ─────────────────────────────────────────
  {
    key: 'acid',
    label: 'Acid Techno',
    description: 'Kultur rave & synthesizer — ungu malam pekat dengan gelombang limau tajam.',
    aspect: 'portrait',
    ink: 'light',
    background: '#180828',
    texture: acidWaves(36, 'rgba(204,255,0,0.22)'),
    accent: '#ccff00',
    category: 'modern',
  },

  // ── 8. MODERN: Monochrome Bold ──────────────────────────────────────────
  {
    key: 'monochrome',
    label: 'Monochrome',
    description: 'Minimalis streetwear — putih bersih bertekstur crosshairs hitam kontras.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#ffffff',
    texture: crosshairs(30, 'rgba(0,0,0,0.16)'),
    accent: '#000000',
    category: 'modern',
  },

  // ── 9. ROCK: Indie Cassette ─────────────────────────────────────────────
  {
    key: 'indie',
    label: 'Indie Rock',
    description: 'Indie rock & pita kaset analog — merah bata terakota bertekstur arsir vintage.',
    aspect: 'portrait',
    ink: 'light',
    background: '#b84227',
    texture: tapeHatch(16, 'rgba(253,240,213,0.18)'),
    accent: '#fdf0d5',
    category: 'rock',
  },

  // ── 10. TECH: Blueprint Schematic ───────────────────────────────────────
  {
    key: 'blueprint',
    label: 'Blueprint Tech',
    description: 'Skematik teknik digital — biru kobalt solid dengan kisi blueprint kalkulasi.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0a2d54',
    texture: blueprintGrid(40, 'rgba(72,202,228,0.22)'),
    accent: '#48cae4',
    category: 'tech',
  },

  // ── Standar Fallback ────────────────────────────────────────────────────
  {
    key: 'default',
    label: 'Standar Fess',
    description: 'Biru royal solid khas Fess n Curious bertekstur titik halus.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0038ff',
    texture: dots(28, 1.6, 'rgba(255,255,255,0.16)'),
    accent: '#ffffff',
    category: 'standard',
  },
];

/** Look up one template by its key, falling back to the first modern template. */
export function getTemplateByKey(key) {
  return TEMPLATES.find((t) => t.key === key) || TEMPLATES[0];
}

/** Resolve the CSS `background` shorthand (texture layered over solid background). */
export function getTemplateBackground(template) {
  const t = template || getTemplateByKey('cyberpunk');
  return t.texture ? `${t.texture} repeat, ${t.background}` : t.background;
}

/** Resolve the CSS `aspect-ratio` value for a template. */
export function getTemplateAspectRatio(template) {
  const t = template || getTemplateByKey('cyberpunk');
  return (ASPECTS[t.aspect] || ASPECTS.portrait).value;
}
