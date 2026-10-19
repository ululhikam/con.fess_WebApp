/**
 * src/config/templates.js
 *
 * Canvas template configuration for the post composer.
 *
 * Tiga generasi template hidup berdampingan di sini:
 *  - "modern" (30): latar solid + tekstur geometris SVG — dirender identik
 *    oleh backend canvas.
 *  - "legacy" (7): template solid orisinal — dipertahankan supaya fess lama
 *    tetap tampil persis seperti sebelumnya.
 *  - "default": fallback brand Fess n Curious.
 *
 * Field `panel` menyalin panel kartu yang digambar renderer SVG backend
 * (buildSvgPages) — warna, border, lebar border, radius, dan pola putus-putus —
 * supaya pratinjau di composer sama dengan PNG yang diposting ke Instagram.
 *
 * Field `typography` menentukan format teks per template (keluarga font,
 * weight, kapital, perataan, jarak huruf, tinggi baris, skala ukuran).
 */

/** Encode a raw SVG string as a CSS `url()` we can layer over a solid background. */
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const xmlns = "xmlns='http://www.w3.org/2000/svg'";

/** Bungkus isi SVG menjadi tile texture berulang. */
const tile = (w, h, inner) => svgUrl(`<svg ${xmlns} width='${w}' height='${h}'>${inner}</svg>`);

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

/* ── Texture Helpers (Legacy Solid Templates) ──────────────────────────── */

/** Repeating dot grid — the most common texture on share cards. */
const dots = (w = 28, r = 1.6, fill = 'rgba(255,255,255,0.16)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<circle cx='${w / 4}' cy='${w / 4}' r='${r}' fill='${fill}'/></svg>`,
  );

/** Fine diagonal hatch, reads as "paper"/"risograph". */
const hatch = (w = 18, stroke = 'rgba(255,255,255,0.10)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<path d='M-${w},0 l${w * 2},${w * 2} M0,-${w} l${w * 2},${w * 2} ` +
      `M${w},${w * 2} l${w * 2},${w * 2}' stroke='${stroke}' stroke-width='2'/></svg>`,
  );

/** Soft scattered speckle, used on the warmer templates. */
const speckle = (w = 60, fill = 'rgba(255,255,255,0.20)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<circle cx='7' cy='11' r='1.5' fill='${fill}'/>` +
      `<circle cx='31' cy='6' r='1.1' fill='${fill}'/>` +
      `<circle cx='46' cy='24' r='1.7' fill='${fill}'/>` +
      `<circle cx='19' cy='38' r='1.2' fill='${fill}'/>` +
      `<circle cx='52' cy='49' r='1.4' fill='${fill}'/>` +
      `<circle cx='34' cy='53' r='1' fill='${fill}'/></svg>`,
  );

/** Thin concentric rings, gives the "announcement"/"quote" templates depth. */
const rings = (w = 90, stroke = 'rgba(255,255,255,0.12)') =>
  svgUrl(
    `<svg ${xmlns} width='${w}' height='${w}'>` +
      `<circle cx='${w / 2}' cy='${w / 2}' r='18' fill='none' stroke='${stroke}'/>` +
      `<circle cx='${w / 2}' cy='${w / 2}' r='34' fill='none' stroke='${stroke}'/></svg>`,
  );

/** Panel kartu — mirror `buildSvgPages` backend (cardBg/cardBorder/radius/dash). */
const panel = (bg, border, width = 2, radius = 36, dash = null, shadow = 'soft') => ({
  bg,
  border,
  width,
  radius,
  ...(dash ? { dash } : {}),
  shadow,
});

export const ASPECTS = {
  square: { key: 'square', value: '1 / 1', label: 'Feed Persegi 1:1', exportWidth: 1080 },
  portrait: { key: 'portrait', value: '4 / 5', label: 'Feed Potret 4:5', exportWidth: 1080 },
  story: { key: 'story', value: '9 / 16', label: 'Story / Reel 9:16', exportWidth: 1080 },
};

/** Font stack per keluarga tipografi (dipakai fallback preview + modal). */
export const FONT_STACKS = {
  sans: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  display: "'Bebas Neue', 'Poppins', sans-serif",
  serif: "'DM Serif Display', 'Poppins', serif",
  mono: "'Fira Mono', 'Poppins', monospace",
};

export const DEFAULT_TYPOGRAPHY = {
  family: 'sans',
  weight: 600,
  uppercase: false,
  align: 'left',
  letterSpacing: 0,
  lineHeight: 1.42,
  scale: 1,
};

export function getTemplateTypography(template) {
  return { ...DEFAULT_TYPOGRAPHY, ...(template?.typography || {}) };
}

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
    panel: panel('rgba(13, 20, 32, 0.94)', 'rgba(0, 255, 102, 0.4)'),
    typography: {
      family: 'mono',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.01,
      lineHeight: 1.5,
      scale: 0.95,
    },
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
    panel: panel('#ffffff', '#000000', 4, 24, null, 'hard'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.18,
      scale: 1.08,
    },
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
    panel: panel('rgba(22, 22, 22, 0.96)', 'rgba(255, 0, 60, 0.35)'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.02,
      lineHeight: 1.2,
      scale: 1.08,
    },
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
    panel: panel('rgba(10, 16, 24, 0.94)', 'rgba(0, 240, 255, 0.35)'),
    typography: {
      family: 'mono',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.95,
    },
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
    panel: panel('rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.4)'),
    typography: {
      family: 'sans',
      weight: 600,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.45,
      scale: 1,
    },
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
    panel: panel('#ffffff', 'rgba(0, 0, 0, 0.12)'),
    typography: {
      family: 'sans',
      weight: 500,
      uppercase: false,
      align: 'left',
      letterSpacing: -0.005,
      lineHeight: 1.4,
      scale: 1,
    },
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
    panel: panel('rgba(28, 12, 44, 0.94)', 'rgba(204, 255, 0, 0.4)'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.015,
      lineHeight: 1.25,
      scale: 1.05,
    },
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
    panel: panel('#ffffff', 'rgba(0, 0, 0, 0.35)', 3),
    typography: {
      family: 'sans',
      weight: 700,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.02,
      lineHeight: 1.35,
      scale: 1,
    },
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
    panel: panel('rgba(56, 18, 10, 0.65)', 'rgba(253, 240, 213, 0.35)'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.5,
      scale: 1,
    },
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
    panel: panel('rgba(12, 42, 78, 0.90)', 'rgba(72, 202, 228, 0.45)'),
    typography: {
      family: 'mono',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.01,
      lineHeight: 1.5,
      scale: 0.92,
    },
  },

  // ── 11. LEGACY: Tengah Malam ────────────────────────────────────────────
  {
    key: 'midnight',
    label: 'Tengah Malam',
    description: 'Biru tua pekat — cocok untuk curhat malam.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0a0e27',
    texture: dots(34, 1.2, 'rgba(255,255,255,0.30)'),
    accent: '#7dd3fc',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },

  // ── 12. LEGACY: Senja ───────────────────────────────────────────────────
  {
    key: 'sunset',
    label: 'Senja',
    description: 'Merah rose hangat dan ramah di feed.',
    aspect: 'portrait',
    ink: 'light',
    background: '#e11d48',
    texture: hatch(18, 'rgba(255,255,255,0.12)'),
    accent: '#fff4e8',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'sans',
      weight: 600,
      uppercase: false,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.45,
      scale: 1,
    },
  },

  // ── 13. LEGACY: Rimba ───────────────────────────────────────────────────
  {
    key: 'forest',
    label: 'Rimba',
    description: 'Hijau emerald yang menenangkan, pas untuk opini santai.',
    aspect: 'square',
    ink: 'light',
    background: '#065f46',
    texture: speckle(60, 'rgba(255,255,255,0.22)'),
    accent: '#ecfdf5',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.5,
      scale: 0.98,
    },
  },

  // ── 14. LEGACY: Noir ────────────────────────────────────────────────────
  {
    key: 'noir',
    label: 'Noir',
    description: 'Hitam pekat bergrid neon — gelap, tajam, misterius.',
    aspect: 'square',
    ink: 'light',
    background: '#0b0d14',
    texture: svgUrl(
      `<svg ${xmlns} width='40' height='40'>` +
        `<path d='M40 0H0v40' fill='none' stroke='rgba(0,56,255,0.35)' stroke-width='1'/></svg>`,
    ),
    accent: '#0038ff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.02,
      lineHeight: 1.4,
      scale: 1,
    },
  },

  // ── 15. LEGACY: Kertas ──────────────────────────────────────────────────
  {
    key: 'paper',
    label: 'Kertas',
    description: 'Krem bersih bertekstur arsir — teks gelap, enak dibaca.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#f5ede0',
    texture: hatch(16, 'rgba(60,40,20,0.10)'),
    accent: '#b45309',
    panel: panel('rgba(255, 255, 255, 0.88)', 'rgba(0, 0, 0, 0.12)'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },

  // ── 16. LEGACY: Samudra ─────────────────────────────────────────────────
  {
    key: 'ocean',
    label: 'Samudra',
    description: 'Biru laut dalam, segar dan tenang.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0369a1',
    texture: svgUrl(
      `<svg ${xmlns} width='64' height='24'>` +
        `<path d='M0 12q8-8 16 0t16 0 16 0 16 0' fill='none' ` +
        `stroke='rgba(255,255,255,0.28)' stroke-width='2'/></svg>`,
    ),
    accent: '#ecfeff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'sans',
      weight: 500,
      uppercase: false,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.5,
      scale: 1,
    },
  },

  // ── 17. LEGACY: Violet ──────────────────────────────────────────────────
  {
    key: 'violet',
    label: 'Violet',
    description: 'Ungu cerah yang menonjol di feed Instagram.',
    aspect: 'portrait',
    ink: 'light',
    background: '#7c3aed',
    texture: rings(90, 'rgba(255,255,255,0.16)'),
    accent: '#fdf4ff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'sans',
      weight: 600,
      uppercase: false,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.45,
      scale: 1,
    },
  },

  // ── 18. Standar Fallback ────────────────────────────────────────────────
  {
    key: 'default',
    label: 'Standar',
    description: 'Biru khas Fess n Curious, siap pakai di feed.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0038ff',
    texture: dots(28, 1.6, 'rgba(255,255,255,0.16)'),
    accent: '#ffffff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
    typography: {
      family: 'sans',
      weight: 600,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.42,
      scale: 1,
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  // 20 TEMPLATE BARU — variasi bentuk, warna, dan format teks.
  // ════════════════════════════════════════════════════════════════════════

  // ── 19. RETRO: Sunburst 70s ─────────────────────────────────────────────
  {
    key: 'sunburst',
    label: 'Sunburst 70s',
    description: 'Retro 70an — mustard hangat dengan burst matahari dan tipografi poster.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#f2b705',
    accent: '#d64309',
    texture: tile(
      96,
      96,
      `<circle cx='48' cy='48' r='30' fill='none' stroke='rgba(214,67,9,0.16)' stroke-width='2'/>` +
        `<circle cx='48' cy='48' r='18' fill='none' stroke='rgba(214,67,9,0.16)' stroke-width='2'/>` +
        `<path d='M48 6v84 M6 48h84 M18 18l60 60 M78 18L18 78' stroke='rgba(214,67,9,0.12)' stroke-width='2'/>`,
    ),
    panel: panel('#fff8e1', '#d64309', 2, 28),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.01,
      lineHeight: 1.22,
      scale: 1.08,
    },
  },

  // ── 20. EDITORIAL: Koran ────────────────────────────────────────────────
  {
    key: 'newsprint',
    label: 'Koran',
    description: 'Editorial koran klasik — kertas krem, garis kolom, dan serif yang tegas.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#f3efe4',
    accent: '#111827',
    texture: tile(
      60,
      40,
      `<path d='M0 0v40' stroke='rgba(0,0,0,0.08)' stroke-width='1'/>` +
        `<path d='M8 8h20 M8 14h30 M8 20h16 M8 26h26' stroke='rgba(0,0,0,0.06)' stroke-width='1'/>`,
    ),
    panel: panel('rgba(255,255,255,0.55)', 'rgba(17,24,39,0.30)', 2, 8, null, 'none'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 1,
    },
  },

  // ── 21. POSTER: Poster Merah ────────────────────────────────────────────
  {
    key: 'poster',
    label: 'Poster Merah',
    description: 'Poster konser tegas — hitam pekat, aksen merah menyala, teks kapital besar.',
    aspect: 'square',
    ink: 'light',
    background: '#111111',
    accent: '#ff2d2d',
    texture: tile(
      22,
      22,
      `<circle cx='11' cy='11' r='3' fill='rgba(255,45,45,0.16)'/>`,
    ),
    panel: panel('#181818', '#ff2d2d', 3, 10, null, 'none'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.015,
      lineHeight: 1.12,
      scale: 1.15,
    },
  },

  // ── 22. GAME: Arcade ────────────────────────────────────────────────────
  {
    key: 'arcade',
    label: 'Arcade',
    description: 'Game arcade 8-bit — ungu malam, piksel neon, dan teks monospace.',
    aspect: 'square',
    ink: 'light',
    background: '#120a2e',
    accent: '#ff2ec4',
    texture: tile(
      32,
      32,
      `<rect x='0' y='0' width='6' height='6' fill='rgba(255,46,196,0.18)'/>` +
        `<rect x='16' y='16' width='6' height='6' fill='rgba(0,229,255,0.14)'/>` +
        `<path d='M32 0H0v32' stroke='rgba(0,229,255,0.10)' stroke-width='1'/>`,
    ),
    panel: panel('rgba(18,10,46,0.92)', '#00e5ff', 2, 8),
    typography: {
      family: 'mono',
      weight: 700,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.02,
      lineHeight: 1.45,
      scale: 0.92,
    },
  },

  // ── 23. POP: Memphis 80s ────────────────────────────────────────────────
  {
    key: 'memphis',
    label: 'Memphis 80s',
    description: 'Memphis colorful — krem ceria dengan squiggle, segitiga, dan bentuk playful.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#fdf6e3',
    accent: '#ff6b6b',
    texture: tile(
      80,
      80,
      `<path d='M8 20q8-12 16 0t16 0' fill='none' stroke='rgba(13,148,136,0.35)' stroke-width='3'/>` +
        `<circle cx='60' cy='16' r='4' fill='rgba(255,107,107,0.4)'/>` +
        `<path d='M56 52l10 16H46z' fill='none' stroke='rgba(234,179,8,0.5)' stroke-width='3'/>` +
        `<circle cx='20' cy='62' r='3' fill='rgba(59,130,246,0.35)'/>`,
    ),
    panel: panel('#ffffff', '#1f2937', 3, 20, null, 'hard'),
    typography: {
      family: 'sans',
      weight: 700,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.42,
      scale: 1,
    },
  },

  // ── 24. ORGANIC: Botanical ──────────────────────────────────────────────
  {
    key: 'botanical',
    label: 'Botanical',
    description: 'Botani elegan — hijau hutan dalam dengan garis daun dan serif klasik.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0f3d2e',
    accent: '#d4e157',
    texture: tile(
      64,
      64,
      `<path d='M12 52q20-40 40-40 M20 52q12-28 32-32' fill='none' stroke='rgba(212,225,87,0.22)' stroke-width='1.5'/>` +
        `<circle cx='50' cy='14' r='3' fill='rgba(212,225,87,0.25)'/>`,
    ),
    panel: panel('rgba(255,255,255,0.06)', 'rgba(212,225,87,0.50)', 1.5, 32),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },

  // ── 25. SOFT: Coquette ──────────────────────────────────────────────────
  {
    key: 'coquette',
    label: 'Coquette',
    description: 'Soft girl aesthetic — blush pink, pita kecil, dan serif yang lembut.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#f7d6df',
    accent: '#9d174d',
    texture: tile(
      48,
      48,
      `<path d='M24 18c-4-6-12-4-10 2 1 4 7 5 10 2 3 3 9 2 10-2 2-6-6-8-10-2z' fill='none' stroke='rgba(157,23,77,0.22)' stroke-width='1.5'/>` +
        `<circle cx='10' cy='36' r='1.6' fill='rgba(157,23,77,0.25)'/>` +
        `<circle cx='38' cy='10' r='1.2' fill='rgba(157,23,77,0.20)'/>`,
    ),
    panel: panel('rgba(255,255,255,0.68)', 'rgba(157,23,77,0.35)', 1.5, 28),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'center',
      letterSpacing: 0.01,
      lineHeight: 1.55,
      scale: 0.96,
    },
  },

  // ── 26. STREET: Graffiti ────────────────────────────────────────────────
  {
    key: 'graffiti',
    label: 'Graffiti',
    description: 'Street art — beton terang, drip cat oranye, dan tipografi poster berani.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#d4d4d8',
    accent: '#ff3d00',
    texture: tile(
      56,
      56,
      `<path d='M4 8c8 2 10 14 4 22M28 4v18M40 30c6 2 8 10 2 16' stroke='rgba(255,61,0,0.35)' stroke-width='3' stroke-linecap='round' fill='none'/>` +
        `<circle cx='18' cy='42' r='2' fill='rgba(255,61,0,0.30)'/>` +
        `<circle cx='48' cy='12' r='1.5' fill='rgba(0,0,0,0.20)'/>`,
    ),
    panel: panel('#18181b', '#ff3d00', 3, 6, null, 'hard'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.01,
      lineHeight: 1.2,
      scale: 1.06,
    },
  },

  // ── 27. TRAVEL: Postcard ────────────────────────────────────────────────
  {
    key: 'postcard',
    label: 'Postcard',
    description: 'Kartu pos — langit biru, ombak santai, dan nuansa surat perjalanan.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#a5d8ff',
    accent: '#e8590c',
    texture: tile(
      72,
      36,
      `<path d='M0 24q9-10 18 0t18 0 18 0 18 0' fill='none' stroke='rgba(30,64,175,0.25)' stroke-width='2'/>` +
        `<circle cx='62' cy='8' r='4' fill='rgba(232,89,12,0.30)'/>`,
    ),
    panel: panel('#fffdf5', '#c2410c', 2, 14, '8 6'),
    typography: {
      family: 'sans',
      weight: 500,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },

  // ── 28. NIGHT: Nightclub ────────────────────────────────────────────────
  {
    key: 'nightclub',
    label: 'Nightclub',
    description: 'Club malam — hitam neon, barcode cyan, dan tipografi teknis tajam.',
    aspect: 'portrait',
    ink: 'light',
    background: '#05060f',
    accent: '#00d1ff',
    texture: tile(
      40,
      24,
      `<path d='M4 0v24M8 0v24M10 0v24M16 0v24M22 0v24M25 0v24M31 0v24M36 0v24' stroke='rgba(0,209,255,0.16)' stroke-width='1.5'/>`,
    ),
    panel: panel('rgba(13,16,32,0.92)', 'rgba(0,209,255,0.50)', 2, 0),
    typography: {
      family: 'mono',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.03,
      lineHeight: 1.5,
      scale: 0.93,
    },
  },

  // ── 29. WARM: Sunrise ───────────────────────────────────────────────────
  {
    key: 'sunrise',
    label: 'Sunrise',
    description: 'Sunrise hangat — oranye coral, lingkaran matahari, dan headline kapital.',
    aspect: 'square',
    ink: 'dark',
    background: '#f97316',
    accent: '#fff7ed',
    texture: tile(
      100,
      100,
      `<circle cx='50' cy='50' r='18' fill='none' stroke='rgba(255,247,237,0.22)' stroke-width='2'/>` +
        `<circle cx='50' cy='50' r='30' fill='none' stroke='rgba(255,247,237,0.22)' stroke-width='2'/>` +
        `<circle cx='50' cy='50' r='42' fill='none' stroke='rgba(255,247,237,0.22)' stroke-width='2'/>`,
    ),
    panel: panel('rgba(124,45,18,0.35)', 'rgba(255,247,237,0.50)', 2, 32, null, 'none'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.18,
      scale: 1.1,
    },
  },

  // ── 30. MINIMAL: Grid Minimal ───────────────────────────────────────────
  {
    key: 'minimalgrid',
    label: 'Grid Minimal',
    description: 'Minimalis tenang — abu hangat, grid tipis, dan ruang putih yang lapang.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#e7e5e4',
    accent: '#2563eb',
    texture: tile(
      36,
      36,
      `<path d='M36 0H0v36' fill='none' stroke='rgba(0,0,0,0.10)' stroke-width='1'/>`,
    ),
    panel: panel('#fafaf9', 'rgba(0,0,0,0.12)', 1.5, 4, null, 'none'),
    typography: {
      family: 'sans',
      weight: 500,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.6,
      scale: 0.98,
    },
  },

  // ── 31. COMIC: Comic Zine ───────────────────────────────────────────────
  {
    key: 'comiczine',
    label: 'Comic Zine',
    description: 'Zine komik — kuning cerah, halftone, dan headline ekspresif.',
    aspect: 'square',
    ink: 'dark',
    background: '#fde68a',
    accent: '#111827',
    texture: tile(
      18,
      18,
      `<circle cx='4' cy='4' r='2' fill='rgba(17,24,39,0.16)'/>` +
        `<circle cx='13' cy='13' r='2' fill='rgba(17,24,39,0.16)'/>`,
    ),
    panel: panel('#ffffff', '#111827', 4, 4, null, 'hard'),
    typography: {
      family: 'display',
      weight: 400,
      uppercase: true,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.18,
      scale: 1.06,
    },
  },

  // ── 32. METALLIC: Blue Chrome ───────────────────────────────────────────
  {
    key: 'bluechrome',
    label: 'Blue Chrome',
    description: 'Chrome futuristik — biru malam, garis metalik, dan teks kapital berjarak.',
    aspect: 'portrait',
    ink: 'light',
    background: '#0f172a',
    accent: '#93c5fd',
    texture: tile(
      24,
      24,
      `<path d='M-6 6L6-6M0 24L24 0M18 30L30 18' stroke='rgba(147,197,253,0.22)' stroke-width='2'/>`,
    ),
    panel: panel('rgba(30,41,59,0.88)', 'rgba(147,197,253,0.50)', 2, 18),
    typography: {
      family: 'sans',
      weight: 600,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.04,
      lineHeight: 1.35,
      scale: 1,
    },
  },

  // ── 33. INDUSTRIAL: Railway ─────────────────────────────────────────────
  {
    key: 'railway',
    label: 'Railway',
    description: 'Industrial — abu beton, garis hazard oranye, dan label monospace tegas.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#e5e5e5',
    accent: '#ea580c',
    texture: tile(
      40,
      40,
      `<path d='M-10 10L10-10M10 50L50 10' stroke='rgba(234,88,12,0.14)' stroke-width='8'/>`,
    ),
    panel: panel('#fafafa', '#1c1917', 3, 0, null, 'none'),
    typography: {
      family: 'mono',
      weight: 700,
      uppercase: true,
      align: 'left',
      letterSpacing: 0.01,
      lineHeight: 1.45,
      scale: 0.92,
    },
  },

  // ── 34. EARTH: Terracotta ───────────────────────────────────────────────
  {
    key: 'terracotta',
    label: 'Terracotta',
    description: 'Tanah liat — terracotta hangat dengan lengkungan arsitektural dan serif.',
    aspect: 'portrait',
    ink: 'light',
    background: '#c2410c',
    accent: '#fed7aa',
    texture: tile(
      90,
      90,
      `<path d='M15 85V55a30 30 0 0 1 60 0v30' fill='none' stroke='rgba(254,215,170,0.20)' stroke-width='2'/>` +
        `<path d='M30 85V60a15 15 0 0 1 30 0v25' fill='none' stroke='rgba(254,215,170,0.16)' stroke-width='1.5'/>`,
    ),
    panel: panel('rgba(67,20,7,0.42)', 'rgba(254,215,170,0.45)', 2, 40),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.5,
      scale: 1,
    },
  },

  // ── 35. DREAMY: Hologram ────────────────────────────────────────────────
  {
    key: 'hologram',
    label: 'Hologram',
    description: 'Holografik dreamy — teal gelap dengan kilau permata dan teks mengambang.',
    aspect: 'square',
    ink: 'light',
    background: '#042f2e',
    accent: '#5eead4',
    texture: tile(
      56,
      56,
      `<path d='M28 6l22 22-22 22L6 28z' fill='none' stroke='rgba(94,234,212,0.14)' stroke-width='1.5'/>` +
        `<rect x='38' y='4' width='8' height='8' fill='rgba(244,114,182,0.14)' transform='rotate(45 42 8)'/>` +
        `<rect x='6' y='40' width='7' height='7' fill='rgba(147,197,253,0.14)' transform='rotate(45 9.5 43.5)'/>`,
    ),
    panel: panel('rgba(4,47,46,0.85)', 'rgba(94,234,212,0.50)', 2, 24),
    typography: {
      family: 'sans',
      weight: 500,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },

  // ── 36. PRINT: Zine Riso ────────────────────────────────────────────────
  {
    key: 'zine',
    label: 'Zine Riso',
    description: 'Cetak riso — krem zine, coretan tinta, dan monospace yang eksperimental.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#fef3c7',
    accent: '#be123c',
    texture: tile(
      64,
      64,
      `<path d='M8 18l12 8M46 12l8 12M20 46l10-6' stroke='rgba(190,18,60,0.22)' stroke-width='2'/>` +
        `<circle cx='52' cy='52' r='2' fill='rgba(29,78,216,0.20)'/>` +
        `<circle cx='14' cy='36' r='1.5' fill='rgba(190,18,60,0.25)'/>`,
    ),
    panel: panel('rgba(255,255,255,0.60)', '#be123c', 2, 2, '6 5', 'none'),
    typography: {
      family: 'mono',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.94,
    },
  },

  // ── 37. CINEMA: Noir Film ───────────────────────────────────────────────
  {
    key: 'noirfilm',
    label: 'Noir Film',
    description: 'Sinema hitam-putih — perforasi film, tekstur grain, dan serif dramatis.',
    aspect: 'portrait',
    ink: 'light',
    background: '#000000',
    accent: '#e5e5e5',
    texture: tile(
      80,
      40,
      `<rect x='4' y='6' width='6' height='8' rx='1' fill='rgba(255,255,255,0.12)'/>` +
        `<rect x='4' y='26' width='6' height='8' rx='1' fill='rgba(255,255,255,0.12)'/>` +
        `<path d='M30 0v40M68 0v40' stroke='rgba(255,255,255,0.06)' stroke-width='1'/>`,
    ),
    panel: panel('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.35)', 1.5, 0, null, 'none'),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: true,
      align: 'center',
      letterSpacing: 0.03,
      lineHeight: 1.5,
      scale: 1,
    },
  },

  // ── 38. ORGANIC: Meadow ─────────────────────────────────────────────────
  {
    key: 'meadow',
    label: 'Meadow',
    description: 'Padang rumput — hijau mint lembut dengan bunga kecil dan serif hangat.',
    aspect: 'portrait',
    ink: 'dark',
    background: '#dcfce7',
    accent: '#15803d',
    texture: tile(
      70,
      70,
      `<path d='M10 60V42M10 48l-5-6M10 46l5-7M28 64V50M28 56l-4-5' stroke='rgba(21,128,61,0.28)' stroke-width='1.5'/>` +
        `<circle cx='48' cy='22' r='3' fill='rgba(21,128,61,0.28)'/>` +
        `<circle cx='48' cy='22' r='7' fill='none' stroke='rgba(21,128,61,0.18)' stroke-width='1'/>` +
        `<circle cx='58' cy='54' r='2' fill='rgba(21,128,61,0.24)'/>`,
    ),
    panel: panel('#f0fdf4', 'rgba(21,128,61,0.35)', 1.5, 28),
    typography: {
      family: 'serif',
      weight: 400,
      uppercase: false,
      align: 'left',
      letterSpacing: 0,
      lineHeight: 1.55,
      scale: 0.98,
    },
  },
];

const DEFAULT_KEY = 'default';

/**
 * Template baru (20) tampil full-bleed seperti thumbnail di modal: background
 * dan teksturnya terlihat penuh, tanpa panel penutup. Dipakai PostPreview agar
 * fallback DOM tidak menggambar panel yang sudah tidak ada di hasil render.
 */
const FULL_BLEED_KEYS = new Set([
  'sunburst',
  'newsprint',
  'poster',
  'arcade',
  'memphis',
  'botanical',
  'coquette',
  'graffiti',
  'postcard',
  'nightclub',
  'sunrise',
  'minimalgrid',
  'comiczine',
  'bluechrome',
  'railway',
  'terracotta',
  'hologram',
  'zine',
  'noirfilm',
  'meadow',
]);
for (const template of TEMPLATES) {
  if (FULL_BLEED_KEYS.has(template.key)) template.fullBleed = true;
}

/**
 * Pilih key template acak.
 *
 * Dipakai composer saat user tidak memilih template: setiap fess baru mendapat
 * template acak, tetapi key yang dikirim ke API tetap konkret sehingga pratinjau
 * dan hasil PNG selalu sama.
 */
export function pickRandomTemplateKey(excludeKey) {
  const pool = TEMPLATES.filter((t) => t.key !== excludeKey);
  const list = pool.length ? pool : TEMPLATES;
  return list[Math.floor(Math.random() * list.length)].key;
}

/** Look up one template by its key, falling back to the brand default. */
export function getTemplateByKey(key) {
  return (
    TEMPLATES.find((t) => t.key === key) ||
    TEMPLATES.find((t) => t.key === DEFAULT_KEY) ||
    TEMPLATES[0]
  );
}

/** Resolve the CSS `background` shorthand (texture layered over base background). */
export function getTemplateBackground(template) {
  const t = template || getTemplateByKey(DEFAULT_KEY);
  return t.texture ? `${t.texture} repeat, ${t.background}` : t.background;
}

/** Resolve the CSS `aspect-ratio` value for a template. */
export function getTemplateAspectRatio(template) {
  const t = template || getTemplateByKey(DEFAULT_KEY);
  return (ASPECTS[t.aspect] || ASPECTS.portrait).value;
}
