/**
 * Verdant — the living palette.
 *
 * Colour here is SEMANTIC, never decorative. A hue always answers one of two
 * questions: "what kind of plant is this?" (category) or "what kind of care is
 * this?" (care type). That is what keeps a colourful UI legible instead of
 * noisy — the user learns blue = water, amber = feed, coral = overdue, and can
 * then read a screen without reading a single word.
 *
 * Every hue ships a light and a dark variant. The dark variants are lifted in
 * lightness and pulled back in chroma: the same saturated mid-tone that reads
 * calmly on paper vibrates against a near-black background and drops under the
 * 4.5:1 contrast floor. They are NOT the light hue with opacity applied.
 *
 * Neutrals (surface, text, border) still come from `constants/Colors.ts`. This
 * module only supplies accent hues, so the glasshouse base stays intact.
 */
import type { CareLogType, PlantCategory } from '@/lib/types';

export type Scheme = 'light' | 'dark';

/** A hue with a variant per theme. */
export interface ThemedHue {
  light: string;
  dark: string;
}

function pick(hue: ThemedHue, scheme: Scheme): string {
  return scheme === 'dark' ? hue.dark : hue.light;
}

/**
 * Plant categories, spread around the wheel so that neighbours in the filter
 * chip row (the one place they all appear at once) never collide. Houseplant
 * and Herb are both greens, but they sit three chips apart and differ in
 * lightness, so they stay tellable.
 */
export const CATEGORY_HUES: Record<PlantCategory, ThemedHue> = {
  Houseplant: { light: '#398253', dark: '#6FC08A' }, // emerald
  Orchid: { light: '#AF5395', dark: '#E08CC6' }, // orchid pink
  Succulent: { light: '#2A7F8B', dark: '#5FC3D0' }, // jade teal
  Cactus: { light: '#9D6A25', dark: '#E0AE62' }, // desert amber
  Fern: { light: '#2D826E', dark: '#5FBAA2' }, // shaded pine
  Herb: { light: '#677D1C', dark: '#B7D24F' }, // basil lime
  Other: { light: '#677783', dark: '#9FB0BD' }, // slate
};

/**
 * Care types. Water is deliberately the only BLUE in the whole app — nothing
 * else competes with it — because "does this need water?" is the question the
 * app exists to answer.
 */
export const CARE_HUES: Record<CareLogType, ThemedHue> = {
  water: { light: '#2C78B9', dark: '#6BADE6' },
  fertilize: { light: '#9D6A25', dark: '#E0AE62' },
  check: { light: '#548042', dark: '#96C47C' },
  note: { light: '#7566B8', dark: '#A99AE0' },
  photo: { light: '#B45B47', dark: '#E89076' },
};

/** Schedule status. Overdue is the app's only true red-orange. */
export const STATUS_HUES = {
  overdue: { light: '#C1523A', dark: '#F08E70' },
  dueToday: { light: '#976C24', dark: '#E5B45C' },
  healthy: { light: '#398253', dark: '#6FC08A' },
} satisfies Record<string, ThemedHue>;

export function categoryColor(category: PlantCategory | string, scheme: Scheme): string {
  const hue = CATEGORY_HUES[category as PlantCategory] ?? CATEGORY_HUES.Other;
  return pick(hue, scheme);
}

export function careColor(type: CareLogType | string, scheme: Scheme): string {
  const hue = CARE_HUES[type as CareLogType] ?? CARE_HUES.check;
  return pick(hue, scheme);
}

export function statusColor(status: keyof typeof STATUS_HUES, scheme: Scheme): string {
  return pick(STATUS_HUES[status], scheme);
}

/** Ink used as the dark foreground on light fills. Matches `palette.night`. */
const INK = '#0F1612';

/** WCAG 2.1 relative luminance for a 6-digit hex. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Text/icon colour to place ON a solid hue fill.
 *
 * MEASURED, not assumed. The light-mode hues are deep enough to take white,
 * while the dark-mode hues are deliberately light (that is what makes them
 * legible on near-black) and need ink — but rather than hardcode that split by
 * theme, this picks whichever foreground actually wins on the given hue. So a
 * future bright accent added to the light palette can't silently ship white
 * text at 3:1. Always use this instead of hardcoding '#FFFFFF'.
 */
export function onHue(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return '#FFFFFF';
  return contrastRatio('#FFFFFF', hex) >= contrastRatio(INK, hex) ? '#FFFFFF' : INK;
}

/**
 * `#RRGGBB` + alpha -> `#RRGGBBAA`. Returns the input untouched if it isn't a
 * plain 6-digit hex, so an already-alpha'd or `rgba()` colour passes through
 * rather than producing an invalid string that RN would throw on.
 */
export function withAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const clamped = Math.max(0, Math.min(1, alpha));
  const byte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${byte}`;
}

/**
 * The tinted background behind a coloured icon or chip. Dark mode needs a
 * heavier wash: the same 12% alpha that reads as a soft tint on white is
 * essentially invisible over a near-black surface.
 */
export function softFill(hex: string, scheme: Scheme): string {
  return withAlpha(hex, scheme === 'dark' ? 0.22 : 0.12);
}

/** The hairline border that pairs with `softFill`. */
export function softBorder(hex: string, scheme: Scheme): string {
  return withAlpha(hex, scheme === 'dark' ? 0.4 : 0.26);
}

/**
 * Two stops for a subtle gradient on a solid accent — lighter at the top-left,
 * the source hue at the bottom-right, so orbs and buttons read as lit from
 * above instead of as flat fills.
 */
export function gradientPair(hex: string, scheme: Scheme): [string, string] {
  return scheme === 'dark'
    ? [withAlpha(hex, 0.95), withAlpha(hex, 0.62)]
    : [lighten(hex, 0.18), hex];
}

/** Mix a hex toward white by `amount` (0..1). */
export function lighten(hex: string, amount: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * Math.max(0, Math.min(1, amount)));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
