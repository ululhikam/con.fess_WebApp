/**
 * src/data/templates.js
 *
 * Single source of truth for post card templates.
 *
 * Every template is a *canvas*: a background (gradient + optional SVG texture)
 * with a portrait/square aspect ratio so the finished card can be exported as a
 * still image and posted straight to Instagram. Aspect ratios are the three
 * Instagram accepts: 1:1, 4:5 and 9:16.
 *
 * `ink` decides text colour — never rely on the app theme here, because the
 * exported PNG has no `data-theme` attribute.
 */

/** Encode a raw SVG string as a CSS `url()` we can layer over a gradient. */
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const xmlns = "xmlns='http://www.w3.org/2000/svg'";

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

export const ASPECTS = {
  square: { key: 'square', value: '1 / 1', label: 'Persegi 1:1', exportWidth: 1080 },
  portrait: { key: 'portrait', value: '4 / 5', label: 'Potret 4:5', exportWidth: 1080 },
  story: { key: 'story', value: '9 / 16', label: 'Story 9:16', exportWidth: 1080 },
};

export const TEMPLATES = [
  {
    key: 'default',
    label: 'Standar',
    description: 'Gradien biru–ungu khas FessHub, siap pakai.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(135deg, #0038ff 0%, #4b1fff 55%, #7000ff 100%)',
    texture: dots(28, 1.6, 'rgba(255,255,255,0.16)'),
    accent: '#ffffff',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
  {
    key: 'midnight',
    label: 'Tengah Malam',
    description: 'Biru tua pekat bertekstur bintang — cocok untuk curhat malam.',
    aspect: 'portrait',
    ink: 'light',
    background: 'radial-gradient(120% 90% at 20% 0%, #16204d 0%, #0a0e22 45%, #05060f 100%)',
    texture: dots(34, 1.2, 'rgba(255,255,255,0.30)'),
    accent: '#7dd3fc',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
  {
    key: 'sunset',
    label: 'Senja',
    description: 'Oranye ke merah muda, hangat dan ramah di feed.',
    aspect: 'portrait',
    ink: 'light',
    background: 'linear-gradient(160deg, #ff7a18 0%, #ff3d6e 52%, #a01fff 100%)',
    texture: hatch(18, 'rgba(255,255,255,0.12)'),
    accent: '#fff4e8',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
  {
    key: 'forest',
    label: 'Rimba',
    description: 'Hijau teal yang menenangkan, pas untuk opini santai.',
    aspect: 'square',
    ink: 'light',
    background: 'linear-gradient(140deg, #0f766e 0%, #059669 55%, #34d399 100%)',
    texture: speckle(60, 'rgba(255,255,255,0.22)'),
    accent: '#ecfdf5',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
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
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
  {
    key: 'paper',
    label: 'Kertas',
    description: 'Krem bersih bertekstur arsir — teks gelap, enak dibaca.',
    aspect: 'portrait',
    ink: 'dark',
    background: 'linear-gradient(150deg, #fdf6ec 0%, #f6ead6 60%, #efe0c6 100%)',
    texture: hatch(16, 'rgba(60,40,20,0.10)'),
    accent: '#b45309',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
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
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
  {
    key: 'violet',
    label: 'Cerita',
    description: 'Format story 9:16, dirancang untuk story Instagram.',
    aspect: 'story',
    ink: 'light',
    background: 'linear-gradient(180deg, #7000ff 0%, #c026d3 45%, #f472b6 100%)',
    texture: rings(90, 'rgba(255,255,255,0.16)'),
    accent: '#fdf4ff',
    features: ['avatar', 'header', 'content', 'media', 'song', 'actions'],
  },
];

/** Look up one template by its key, falling back to the default canvas. */
export function getTemplateByKey(key) {
  return TEMPLATES.find((t) => t.key === key) || TEMPLATES[0];
}

/** Resolve the CSS `background` shorthand (texture layered over gradient). */
export function getTemplateBackground(template) {
  const t = template || getTemplateByKey('default');
  return t.texture ? `${t.texture} repeat, ${t.background}` : t.background;
}

/** Resolve the CSS `aspect-ratio` value for a template. */
export function getTemplateAspectRatio(template) {
  const t = template || getTemplateByKey('default');
  return (ASPECTS[t.aspect] || ASPECTS.portrait).value;
}
