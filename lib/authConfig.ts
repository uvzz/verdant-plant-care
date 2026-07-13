/**
 * Pure auth configuration derived from public env. Kept free of native
 * imports (SecureStore etc.) so it unit-tests under the node Vitest env.
 */

export type GoogleAuthConfig = {
  /** OAuth "Web application" client id — used by Expo Go and web. */
  webClientId?: string;
  /** OAuth "iOS" client id — used by standalone iOS builds. */
  iosClientId?: string;
  /** OAuth "Android" client id — used by standalone Android builds. */
  androidClientId?: string;
  /** True when at least one client id is present (drives button visibility). */
  configured: boolean;
};

/**
 * Google sign-in client ids from public env. All optional: Expo Go needs the
 * web client id; standalone builds prefer the native ones. The Google button
 * stays hidden until at least one is set, so an un-configured build never
 * shows a dead button.
 */
export function googleAuthConfig(): GoogleAuthConfig {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || undefined;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined;
  return {
    webClientId,
    iosClientId,
    androidClientId,
    configured: Boolean(webClientId || iosClientId || androidClientId),
  };
}
