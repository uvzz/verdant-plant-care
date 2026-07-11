import { TextStyle } from 'react-native';

/** Font family names match @expo-google-fonts exports */
export const Fonts = {
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  body: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  bodySemi: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
} as const;

export const Type: Record<string, TextStyle> = {
  displayL: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  displayM: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  displayHero: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  title: {
    fontFamily: Fonts.bodySemi,
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  micro: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  latin: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  button: {
    fontFamily: Fonts.bodySemi,
    fontSize: 16,
    letterSpacing: -0.2,
  },
};
