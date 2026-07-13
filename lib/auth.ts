/**
 * Sign in with Apple / Google → cloud sync identity.
 *
 * The provider's identity token is exchanged at the Worker for a
 * deterministic sync id (HMAC of provider+subject). Same account on any
 * device → same collection, no codes to copy. Tokens are used once for the
 * exchange and never stored; we keep only {provider, email, syncId}.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getAiProxyUrl, getPremiumAccessToken } from './aiConfig';
import { adoptSyncId } from './sync';

const KEY_PROVIDER = 'verdant.auth.provider';
const KEY_EMAIL = 'verdant.auth.email';

export type AuthSession = {
  provider: 'apple' | 'google';
  email: string | null;
};

export type SignInResult =
  | { ok: true; session: AuthSession }
  | { ok: false; reason: string; cancelled?: boolean };

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const provider = await SecureStore.getItemAsync(KEY_PROVIDER);
    if (provider !== 'apple' && provider !== 'google') return null;
    const email = await SecureStore.getItemAsync(KEY_EMAIL);
    return { provider, email: email || null };
  } catch {
    return null;
  }
}

/** Exchange a verified provider token for a sync id and persist the session. */
export async function exchangeIdentityToken(
  provider: 'apple' | 'google',
  identityToken: string
): Promise<SignInResult> {
  const token = getPremiumAccessToken();
  if (!token) return { ok: false, reason: 'Sync is not configured for this build.' };

  try {
    const res = await fetch(`${getAiProxyUrl()}/v1/auth/login`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Verdant-Client': 'verdant-app',
      },
      body: JSON.stringify({ provider, identityToken }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, reason: body.error || `Sign-in failed (${res.status}).` };
    }
    const data = (await res.json()) as { syncId: string; email: string | null };
    const adopted = await adoptSyncId(data.syncId);
    if (!adopted.ok) return { ok: false, reason: adopted.reason };

    await SecureStore.setItemAsync(KEY_PROVIDER, provider);
    if (data.email) await SecureStore.setItemAsync(KEY_EMAIL, data.email);
    else await SecureStore.deleteItemAsync(KEY_EMAIL).catch(() => {});

    return { ok: true, session: { provider, email: data.email } };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : 'Sign-in failed.',
    };
  }
}

/** Native Sign in with Apple (iOS only; Android users use Google). */
export async function signInWithApple(): Promise<SignInResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, reason: 'Sign in with Apple is iOS-only. Use Google.' };
  }
  try {
    const Apple = await import('expo-apple-authentication');
    const available = await Apple.isAvailableAsync();
    if (!available) {
      return {
        ok: false,
        reason:
          'Sign in with Apple is unavailable. Sign into an Apple Account in system Settings first.',
      };
    }
    const credential = await Apple.signInAsync({
      requestedScopes: [Apple.AppleAuthenticationScope.EMAIL],
    });
    if (!credential.identityToken) {
      return { ok: false, reason: 'Apple did not return an identity token.' };
    }
    return exchangeIdentityToken('apple', credential.identityToken);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/canceled|cancelled|ERR_REQUEST_CANCELED/i.test(msg)) {
      return { ok: false, reason: 'Sign-in cancelled.', cancelled: true };
    }
    return { ok: false, reason: msg.slice(0, 160) };
  }
}

/** Google client id (web client id for Expo). Absent → Google button hidden. */
export function googleClientId(): string | null {
  return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || null;
}

/** Sign out: forget the session. Local data stays; sync pauses. */
export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PROVIDER).catch(() => {});
  await SecureStore.deleteItemAsync(KEY_EMAIL).catch(() => {});
}
