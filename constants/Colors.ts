const palette = {
  sage: '#5B7F6B',
  sageDark: '#3D5A4A',
  sageLight: '#8FAE9C',
  cream: '#F7F4EE',
  creamDark: '#EDE8DC',
  charcoal: '#2C2A26',
  charcoalMuted: '#6B6560',
  white: '#FFFFFF',
  terracotta: '#C4785A',
  sky: '#7BA3B0',
  gold: '#C4A35A',
  danger: '#B54A4A',
  border: '#E0DAD0',
  cardDark: '#1E2420',
  creamDarkMode: '#121614',
};

export default {
  light: {
    text: palette.charcoal,
    textMuted: palette.charcoalMuted,
    background: palette.cream,
    surface: palette.white,
    surfaceAlt: palette.creamDark,
    tint: palette.sage,
    tintDark: palette.sageDark,
    accent: palette.terracotta,
    sky: palette.sky,
    gold: palette.gold,
    danger: palette.danger,
    border: palette.border,
    tabIconDefault: palette.charcoalMuted,
    tabIconSelected: palette.sage,
    cardShadow: 'rgba(44, 42, 38, 0.08)',
  },
  dark: {
    text: '#F2EFE8',
    textMuted: '#A39E96',
    background: palette.creamDarkMode,
    surface: palette.cardDark,
    surfaceAlt: '#252B27',
    tint: palette.sageLight,
    tintDark: palette.sage,
    accent: '#D49278',
    sky: '#9BC0CC',
    gold: '#D4B86A',
    danger: '#D47070',
    border: '#2F3833',
    tabIconDefault: '#8A8580',
    tabIconSelected: palette.sageLight,
    cardShadow: 'rgba(0, 0, 0, 0.35)',
  },
};

export const FREE_PLANT_LIMIT = 5;
export const APP_NAME = 'Verdant';
export const APP_VERSION = '0.1.0';
