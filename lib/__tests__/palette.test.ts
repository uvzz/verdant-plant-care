import { describe, expect, it } from 'vitest';

import {
  CARE_HUES,
  CATEGORY_HUES,
  STATUS_HUES,
  careColor,
  categoryColor,
  gradientPair,
  lighten,
  onHue,
  softBorder,
  softFill,
  statusColor,
  withAlpha,
  type Scheme,
} from '@/constants/Palette';
import { CARE_TYPE_LABELS, PLANT_CATEGORIES } from '@/lib/types';

const SCHEMES: Scheme[] = ['light', 'dark'];

/** sRGB relative luminance, per WCAG 2.1. */
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

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The page background each scheme's hues must survive on. */
const BACKGROUND: Record<Scheme, string> = {
  light: '#FFFFFF', // c.surface — cards, the strictest light case
  dark: '#1A2420', // c.surface (nightElevated)
};

function allHues(scheme: Scheme): Array<[string, string]> {
  return [
    ...Object.entries(CATEGORY_HUES).map(
      ([k, v]) => [`category.${k}`, v[scheme]] as [string, string]
    ),
    ...Object.entries(CARE_HUES).map(([k, v]) => [`care.${k}`, v[scheme]] as [string, string]),
    ...Object.entries(STATUS_HUES).map(
      ([k, v]) => [`status.${k}`, v[scheme]] as [string, string]
    ),
  ];
}

describe('palette coverage', () => {
  it('defines a hue for every plant category', () => {
    for (const category of PLANT_CATEGORIES) {
      expect(CATEGORY_HUES[category], `missing hue for ${category}`).toBeDefined();
    }
    // No orphan hues either — a removed category should not linger.
    expect(Object.keys(CATEGORY_HUES).sort()).toEqual([...PLANT_CATEGORIES].sort());
  });

  it('defines a hue for every care log type', () => {
    for (const type of Object.keys(CARE_TYPE_LABELS)) {
      expect(CARE_HUES[type as keyof typeof CARE_HUES], `missing hue for ${type}`).toBeDefined();
    }
  });

  it('every hue is a plain 6-digit hex in both schemes', () => {
    for (const scheme of SCHEMES) {
      for (const [name, hex] of allHues(scheme)) {
        expect(hex, `${name} (${scheme})`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});

describe('palette legibility', () => {
  // 3:1 is the WCAG floor for large text and UI components. These hues are
  // used at display sizes (26px stat numbers) and for icons/borders, not body
  // copy, so 3:1 is the correct bar — but nothing may fall under it.
  it('every hue clears 3:1 against its own scheme surface', () => {
    for (const scheme of SCHEMES) {
      for (const [name, hex] of allHues(scheme)) {
        const ratio = contrast(hex, BACKGROUND[scheme]);
        expect(ratio, `${name} (${scheme}) = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('onHue() clears 4.5:1 on every solid hue fill', () => {
    for (const scheme of SCHEMES) {
      for (const [name, hex] of allHues(scheme)) {
        const ratio = contrast(onHue(hex), hex);
        expect(ratio, `${name} (${scheme}) = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('onHue() picks the better of white/ink rather than a fixed value', () => {
    // Deep light-mode hues take white; the bright dark-mode hues take ink.
    expect(onHue(CATEGORY_HUES.Houseplant.light)).toBe('#FFFFFF');
    expect(onHue(CATEGORY_HUES.Houseplant.dark)).toBe('#0F1612');
  });

  it('onHue() falls back to white on a malformed colour', () => {
    expect(onHue('rgba(0,0,0,0.5)')).toBe('#FFFFFF');
  });

  it('light hues also work as SMALL TEXT on white (idle chip label)', () => {
    // Same 4.5 bar, and it is the same measurement — contrast is symmetric —
    // so one deep-enough hue serves both "white on hue" and "hue on white".
    for (const [name, hex] of allHues('light')) {
      const ratio = contrast(hex, '#FFFFFF');
      expect(ratio, `${name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('categories are visually distinct from their chip-row neighbours', () => {
    // The filter row is the only place all categories appear together, so
    // adjacent pairs are the ones that must not read as the same colour.
    for (const scheme of SCHEMES) {
      for (let i = 1; i < PLANT_CATEGORIES.length; i += 1) {
        const a = categoryColor(PLANT_CATEGORIES[i - 1], scheme);
        const b = categoryColor(PLANT_CATEGORIES[i], scheme);
        expect(a, `${PLANT_CATEGORIES[i - 1]} vs ${PLANT_CATEGORIES[i]} (${scheme})`).not.toBe(b);
      }
    }
  });
});

describe('colour helpers', () => {
  it('withAlpha appends the correct alpha byte', () => {
    expect(withAlpha('#3F8F5B', 1)).toBe('#3F8F5Bff');
    expect(withAlpha('#3F8F5B', 0)).toBe('#3F8F5B00');
    expect(withAlpha('#3F8F5B', 0.5)).toBe('#3F8F5B80');
  });

  it('withAlpha clamps out-of-range alpha instead of emitting bad hex', () => {
    expect(withAlpha('#3F8F5B', 5)).toBe('#3F8F5Bff');
    expect(withAlpha('#3F8F5B', -2)).toBe('#3F8F5B00');
  });

  it('withAlpha passes through anything that is not a 6-digit hex', () => {
    // Guards the case where an already-alpha'd or rgba() colour is piped in;
    // concatenating would produce a string RN throws on.
    expect(withAlpha('rgba(0,0,0,0.5)', 0.3)).toBe('rgba(0,0,0,0.5)');
    expect(withAlpha('#3F8F5Bff', 0.3)).toBe('#3F8F5Bff');
    expect(withAlpha('#FFF', 0.3)).toBe('#FFF');
  });

  it('softFill is heavier in dark mode than light', () => {
    const light = softFill('#3F8F5B', 'light');
    const dark = softFill('#6FC08A', 'dark');
    expect(parseInt(light.slice(7), 16)).toBeLessThan(parseInt(dark.slice(7), 16));
  });

  it('softBorder is stronger than softFill in the same scheme', () => {
    for (const scheme of SCHEMES) {
      const fill = parseInt(softFill('#3F8F5B', scheme).slice(7), 16);
      const border = parseInt(softBorder('#3F8F5B', scheme).slice(7), 16);
      expect(border, scheme).toBeGreaterThan(fill);
    }
  });

  it('lighten moves toward white and stays a valid hex', () => {
    expect(lighten('#000000', 1)).toBe('#ffffff');
    expect(lighten('#000000', 0)).toBe('#000000');
    expect(lighten('#3F8F5B', 0.2)).toMatch(/^#[0-9a-f]{6}$/);
    expect(luminance(lighten('#3F8F5B', 0.3))).toBeGreaterThan(luminance('#3F8F5B'));
  });

  it('lighten pads short channel values (regression: #0a0a0a not #a0a0a)', () => {
    expect(lighten('#000000', 0.04)).toHaveLength(7);
  });

  it('gradientPair returns two stops', () => {
    for (const scheme of SCHEMES) {
      const pair = gradientPair('#3F8F5B', scheme);
      expect(pair).toHaveLength(2);
      expect(pair[0]).not.toBe(pair[1]);
    }
  });
});

describe('lookup fallbacks', () => {
  it('unknown category falls back to Other rather than undefined', () => {
    expect(categoryColor('Bonsai-9000', 'light')).toBe(CATEGORY_HUES.Other.light);
  });

  it('unknown care type falls back to check rather than undefined', () => {
    expect(careColor('repot', 'dark')).toBe(CARE_HUES.check.dark);
  });

  it('statusColor resolves each status in both schemes', () => {
    for (const scheme of SCHEMES) {
      for (const key of Object.keys(STATUS_HUES) as Array<keyof typeof STATUS_HUES>) {
        expect(statusColor(key, scheme)).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});
