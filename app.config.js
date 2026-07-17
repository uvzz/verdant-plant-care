/**
 * Dynamic Expo config.
 * After `eas init`, set EXPO_PUBLIC_EAS_PROJECT_ID (or EAS_PROJECT_ID).
 */
const appJson = require('./app.json');

const projectId =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  process.env.EAS_PROJECT_ID ||
  appJson.expo?.extra?.eas?.projectId ||
  'replace-after-eas-init';

const privacyUrl =
  process.env.EXPO_PUBLIC_PRIVACY_URL ||
  'https://github.com/uvzz/verdant-plant-care/blob/main/docs/legal/PRIVACY.md';

const termsUrl =
  process.env.EXPO_PUBLIC_TERMS_URL ||
  'https://github.com/uvzz/verdant-plant-care/blob/main/docs/legal/TERMS.md';

function pluginName(p) {
  return Array.isArray(p) ? p[0] : p;
}

const basePlugins = appJson.expo.plugins || [];
const extraPlugins = ['expo-document-picker', 'expo-updates', 'expo-localization'];
const seen = new Set(basePlugins.map(pluginName));
const plugins = [...basePlugins];
for (const p of extraPlugins) {
  if (!seen.has(p)) {
    plugins.push(p);
    seen.add(p);
  }
}

module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...appJson.expo.ios?.infoPlist,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId,
      },
      privacyPolicyUrl: privacyUrl,
      termsOfServiceUrl: termsUrl,
      router: appJson.expo.extra?.router || {},
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: appJson.expo.runtimeVersion || {
      policy: 'appVersion',
    },
  },
};
