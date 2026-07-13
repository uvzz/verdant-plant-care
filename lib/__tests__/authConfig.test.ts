import { afterEach, describe, expect, it } from 'vitest';
import { googleAuthConfig } from '../authConfig';

const KEYS = [
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
];

afterEach(() => {
  for (const k of KEYS) delete process.env[k];
});

describe('googleAuthConfig', () => {
  it('is unconfigured when no client ids are set', () => {
    const g = googleAuthConfig();
    expect(g.configured).toBe(false);
    expect(g.webClientId).toBeUndefined();
    expect(g.iosClientId).toBeUndefined();
    expect(g.androidClientId).toBeUndefined();
  });

  it('is configured when only the web client id is set (Expo Go path)', () => {
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = 'web.apps.googleusercontent.com';
    const g = googleAuthConfig();
    expect(g.configured).toBe(true);
    expect(g.webClientId).toBe('web.apps.googleusercontent.com');
  });

  it('is configured when only a native client id is set', () => {
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'ios.apps.googleusercontent.com';
    const g = googleAuthConfig();
    expect(g.configured).toBe(true);
    expect(g.iosClientId).toBe('ios.apps.googleusercontent.com');
    expect(g.webClientId).toBeUndefined();
  });

  it('surfaces all three ids when set', () => {
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = 'w';
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'i';
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = 'a';
    const g = googleAuthConfig();
    expect(g).toMatchObject({
      webClientId: 'w',
      iosClientId: 'i',
      androidClientId: 'a',
      configured: true,
    });
  });
});
