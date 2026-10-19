/**
 * src/config/templates.js
 *
 * Canvas template configuration for the post composer.
 *
 * Dua generasi template hidup berdampingan di sini:
 *  - "modern" (10): latar solid + tekstur geometris SVG, dengan banner strip &
 *    subline — dirender identik oleh backend canvas.
 *  - "legacy" (8): template gradasi orisinal — dipertahankan supaya fess lama
 *    tetap tampil persis seperti sebelumnya.
 *
 * Field `panel` menyalin panel kartu yang digambar renderer SVG backend
 * (buildSvgPages) — warna, border, lebar border, dan radius — supaya pratinjau
 * di composer sama dengan PNG yang diposting ke Instagram.
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

/* ── Texture Helpers (Legacy Gradient Templates) ───────────────────────── */

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

/** Panel kartu — mirror `buildSvgPages` backend (cardBg/cardBorder/radius). */
const panel = (bg, border, width = 2, radius = 36) => ({ bg, border, width, radius });

export const ASPECTS = {
  square: { key: 'square', value: '1 / 1', label: 'Feed Persegi 1:1', exportWidth: 1080 },
  portrait: { key: 'portrait', value: '4 / 5', label: 'Feed Potret 4:5', exportWidth: 1080 },
  story: { key: 'story', value: '9 / 16', label: 'Story / Reel 9:16', exportWidth: 1080 },
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
    strip: '[HUD // ENCRYPTED 256-BIT]',
    subline: 'TERMINAL BROADCAST',
    panel: panel('rgba(13, 20, 32, 0.94)', 'rgba(0, 255, 102, 0.4)'),
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
    strip: '* RAW CONFESSION *',
    subline: 'POPARTS EDITION',
    panel: panel('#ffffff', '#000000', 4, 24),
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
    strip: '/// ROCK ARCHIVE // SIDE A ///',
    subline: 'UNFILTERED SOUNDS',
    panel: panel('rgba(22, 22, 22, 0.96)', 'rgba(255, 0, 60, 0.35)'),
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
    strip: 'o o o bash - session_01',
    subline: 'SYSTEM OUTPUT // 200 OK',
    panel: panel('rgba(10, 16, 24, 0.94)', 'rgba(0, 240, 255, 0.35)'),
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
    strip: '+ SWEET CONFESSION +',
    subline: 'Y2K RETRO ARCHIVE',
    panel: panel('rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.4)'),
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
    strip: 'No. 01 / ZURICH EDITORIAL',
    subline: 'ARCHITECTURAL GRID',
    panel: panel('#ffffff', 'rgba(0, 0, 0, 0.12)'),
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
    strip: '[145 BPM // RAW FREQUENCY]',
    subline: 'UNDERGROUND SOUND',
    panel: panel('rgba(28, 12, 44, 0.94)', 'rgba(204, 255, 0, 0.4)'),
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
    strip: '"CONFESSION" - SPEC 2026',
    subline: 'STREETWEAR ARCHIVE',
    panel: panel('#ffffff', 'rgba(0, 0, 0, 0.35)', 3),
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
    strip: '[ CASSETTE SIDE A // 45 RPM ]',
    subline: 'ANALOG MASTER TAPE',
    panel: panel('rgba(56, 18, 10, 0.65)', 'rgba(253, 240, 213, 0.35)'),
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
    strip: 'DWG NO: FNC-2026 // REV A',
    subline: 'SCALE: 1:1 SCHEMATIC',
    panel: panel('rgba(12, 42, 78, 0.90)', 'rgba(72, 202, 228, 0.45)'),
  },

  // ── 11. LEGACY: Tengah Malam ────────────────────────────────────────────
  {
    key: 'midnight',
    label: 'Tengah Malam',
    description: 'Biru tua pekat bertekstur bintang — cocok untuk curhat malam.',
    aspect: 'portrait',
    ink: 'light',
    background: 'radial-gradient(120% 90% at 20% 0%, #16204d 0%, #0a0e22 45%, #05060f 100%)',
    texture: dots(34, 1.2, 'rgba(255,255,255,0.30)'),
    accent: '#7dd3fc',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── 12. LEGACY: Senja ───────────────────────────────────────────────────
  {
    key: 'sunset',
    label: 'Senja',
    description: 'Oranye ke merah muda, hangat dan ramah di feed.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(160deg, #ff7a18 0%, #ff3d6e 52%, #a01fff 100%)',
    texture: hatch(18, 'rgba(255,255,255,0.12)'),
    accent: '#fff4e8',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── 13. LEGACY: Rimba ───────────────────────────────────────────────────
  {
    key: 'forest',
    label: 'Rimba',
    description: 'Hijau teal yang menenangkan, pas untuk opini santai.',
    aspect: 'square',
    ink: 'light',
    background: 'linear-gradient(140deg, #0f766e 0%, #059669 55%, #34d399 100%)',
    texture: speckle(60, 'rgba(255,255,255,0.22)'),
    accent: '#ecfdf5',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── 14. LEGACY: Noir ────────────────────────────────────────────────────
  {
    key: 'noir',
    label: 'Noir',
    description: 'Hitam pekat bergrid neon — gelap, tajam, misterius.',
    aspect: 'square',
    ink: 'light',
    background: 'linear-gradient(180deg, #0b0d14 0%, #12141f 60%, #0b0d14 100%)',
    texture: svgUrl(
      `<svg ${xmlns} width='40' height='40'>` +
        `<path d='M40 0H0v40' fill='none' stroke='rgba(0,56,255,0.35)' stroke-width='1'/></svg>`,
    ),
    accent: '#0038ff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── 15. LEGACY: Kertas ──────────────────────────────────────────────────
  {
    key: 'paper',
    label: 'Kertas',
    description: 'Krem bersih bertekstur arsir — teks gelap, enak dibaca.',
    aspect: 'portrait',
    ink: 'dark',
    background: 'linear-gradient(150deg, #fdf6ec 0%, #f6ead6 60%, #efe0c6 100%)',
    texture: hatch(16, 'rgba(60,40,20,0.10)'),
    accent: '#b45309',
    panel: panel('rgba(255, 255, 255, 0.88)', 'rgba(0, 0, 0, 0.12)'),
  },

  // ── 16. LEGACY: Samudra ─────────────────────────────────────────────────
  {
    key: 'ocean',
    label: 'Samudra',
    description: 'Cyan ke biru tua, segar seperti biru laut.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(200deg, #22d3ee 0%, #0ea5e9 48%, #1e3a8a 100%)',
    texture: svgUrl(
      `<svg ${xmlns} width='64' height='24'>` +
        `<path d='M0 12q8-8 16 0t16 0 16 0 16 0' fill='none' ` +
        `stroke='rgba(255,255,255,0.28)' stroke-width='2'/></svg>`,
    ),
    accent: '#ecfeff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── 17. LEGACY: Violet ──────────────────────────────────────────────────
  {
    key: 'violet',
    label: 'Violet',
    description: 'Format feed potret 4:5, gradien ungu–pink cerah di feed Instagram.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(180deg, #7000ff 0%, #c026d3 45%, #f472b6 100%)',
    texture: rings(90, 'rgba(255,255,255,0.16)'),
    accent: '#fdf4ff',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },

  // ── Standar Fallback ────────────────────────────────────────────────────
  {
    key: 'default',
    label: 'Standar',
    description: 'Gradien biru–ungu khas Fess n Curious, siap pakai di feed.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(135deg, #0038ff 0%, #4b1fff 55%, #7000ff 100%)',
    texture: dots(28, 1.6, 'rgba(255,255,255,0.16)'),
    accent: '#ffffff',
    category: 'standard',
    panel: panel('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)'),
  },
];

const DEFAULT_KEY = 'default';

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
