/**
 * Verdant — Glasshouse Specimen design tokens
 * @see design/DESIGN_SYSTEM.md
 */
const palette = {
  ink: '#14201B',
  inkSoft: '#5A6B64',
  mist: '#D9E2DC',
  paper: '#EEF2EF',
  glass: '#FFFFFF',
  lichen: '#6F8F63',
  growth: '#C6D45A',
  growthInk: '#2A3318',
  copper: '#B56A4A',
  line: '#C9D4CD',
  night: '#0F1612',
  // dark surfaces
  nightElevated: '#1A2420',
  nightSoft: '#252F2A',
};

export default {
  light: {
    text: palette.ink,
    textMuted: palette.inkSoft,
    background: palette.paper,
    surface: palette.glass,
    surfaceAlt: palette.mist,
    tint: palette.lichen,
    tintDark: palette.ink,
    accent: palette.growth,
    accentInk: palette.growthInk,
    sky: palette.lichen,
    gold: palette.growth,
    danger: palette.copper,
    border: palette.line,
    tabIconDefault: palette.inkSoft,
    tabIconSelected: palette.lichen,
    cardShadow: 'rgba(20, 32, 27, 0.07)',
    night: palette.night,
    growth: palette.growth,
    growthInk: palette.growthInk,
  },
  dark: {
    text: '#E8EFE9',
    textMuted: '#9AABA2',
    background: palette.night,
    surface: palette.nightElevated,
    surfaceAlt: palette.nightSoft,
    tint: palette.lichen,
    tintDark: palette.growth,
    accent: palette.growth,
    accentInk: palette.growthInk,
    sky: '#8FAE9C',
    gold: palette.growth,
    danger: '#D49278',
    border: '#2F3B35',
    tabIconDefault: '#8A8580',
    tabIconSelected: palette.growth,
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    night: palette.night,
    growth: palette.growth,
    growthInk: palette.growthInk,
  },
};

export const FREE_PLANT_LIMIT = 5;
export const APP_NAME = 'Verdant';
export const APP_VERSION = '0.6.0';

/** Specimen / glasshouse raw palette for one-off use */
export const Specimen = palette;
