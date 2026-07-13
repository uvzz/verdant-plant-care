/**
 * Sign in with Apple / Google for cloud sync.
 *
 * The client sends the provider's identity token (a signed JWT). We verify
 * it against the provider's published JWKS, then derive a deterministic
 * sync id: HMAC-SHA256(provider:subject, SYNC_DERIVE_SECRET). Same account →
 * same sync id on every device, which is what makes sync automatic — no
 * codes to copy. The derived id is returned to the client and used as the
 * X-Sync-Id capability for /v1/sync and /v1/photos.
 *
 * The raw identity token is never stored; only the derived id leaves this
 * function. Email/name are echoed back for UI display only.
 */

export type AuthEnv = {
  /** Dedicated HMAC key for sync-id derivation (falls back to premium token). */
  SYNC_DERIVE_SECRET?: string;
  /** Comma-separated audiences allowed for Apple (bundle ids). */
  APPLE_AUDIENCES?: string;
  /** Comma-separated Google OAuth client ids. */
  GOOGLE_AUDIENCES?: string;
};

const APPLE_JWKS = 'https://appleid.apple.com/auth/keys';
const GOOGLE_JWKS = 'https://www.googleapis.com/oauth2/v3/certs';
const APPLE_ISS = 'https://appleid.apple.com';
const GOOGLE_ISS = new Set(['https://accounts.google.com', 'accounts.google.com']);

// Expo Go runs under Apple's shared Expo bundle id; standalone builds use ours.
const DEFAULT_APPLE_AUDS = ['com.verdant.plantcare', 'host.exp.Exponent'];

type Jwk = {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
};

function b64urlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJwtPart<T>(part: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))) as T;
  } catch {
    return null;
  }
}

/** Small in-isolate JWKS cache — Workers isolates live minutes, keys live days. */
const jwksCache = new Map<string, { keys: Jwk[]; fetchedAt: number }>();
const JWKS_TTL_MS = 30 * 60 * 1000;

async function fetchJwks(url: string): Promise<Jwk[]> {
  const hit = jwksCache.get(url);
  if (hit && Date.now() - hit.fetchedAt < JWKS_TTL_MS) return hit.keys;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`JWKS fetch failed (${res.status})`);
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = body.keys ?? [];
  jwksCache.set(url, { keys, fetchedAt: Date.now() });
  return keys;
}

type VerifiedIdentity = {
  provider: 'apple' | 'google';
  subject: string;
  email?: string;
};

async function verifyJwt(
  token: string,
  jwksUrl: string,
  checkClaims: (claims: Record<string, unknown>) => string | null
): Promise<{ ok: true; claims: Record<string, unknown> } | { ok: false; error: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, error: 'Malformed token' };

  const header = decodeJwtPart<{ kid?: string; alg?: string }>(parts[0]);
  const claims = decodeJwtPart<Record<string, unknown>>(parts[1]);
  if (!header || !claims) return { ok: false, error: 'Malformed token' };
  if (header.alg !== 'RS256') return { ok: false, error: 'Unsupported algorithm' };

  const now = Math.floor(Date.now() / 1000);
  const exp = Number(claims.exp) || 0;
  const iat = Number(claims.iat) || 0;
  if (exp < now) return { ok: false, error: 'Token expired' };
  if (iat > now + 300) return { ok: false, error: 'Token from the future' };

  const claimError = checkClaims(claims);
  if (claimError) return { ok: false, error: claimError };

  const keys = await fetchJwks(jwksUrl);
  const jwk = keys.find((k) => k.kid === header.kid && k.kty === 'RSA');
  if (!jwk) return { ok: false, error: 'Unknown signing key' };

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    b64urlToBytes(parts[2]) as unknown as ArrayBuffer,
    data
  );
  if (!valid) return { ok: false, error: 'Invalid signature' };
  return { ok: true, claims };
}

function audList(raw: string | undefined, fallback: string[]): string[] {
  const items = (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

function audMatches(aud: unknown, allowed: string[]): boolean {
  const auds = Array.isArray(aud) ? aud.map(String) : [String(aud ?? '')];
  return auds.some((a) => allowed.includes(a));
}

export async function verifyIdentityToken(
  provider: string,
  token: string,
  env: AuthEnv
): Promise<{ ok: true; identity: VerifiedIdentity } | { ok: false; error: string }> {
  if (typeof token !== 'string' || token.length < 20 || token.length > 8_000) {
    return { ok: false, error: 'Invalid token' };
  }

  if (provider === 'apple') {
    const allowed = audList(env.APPLE_AUDIENCES, DEFAULT_APPLE_AUDS);
    const res = await verifyJwt(token, APPLE_JWKS, (c) => {
      if (c.iss !== APPLE_ISS) return 'Wrong issuer';
      if (!audMatches(c.aud, allowed)) return 'Wrong audience';
      return null;
    });
    if (!res.ok) return res;
    const sub = String(res.claims.sub || '');
    if (!sub) return { ok: false, error: 'Missing subject' };
    return {
      ok: true,
      identity: {
        provider: 'apple',
        subject: sub,
        email: typeof res.claims.email === 'string' ? res.claims.email : undefined,
      },
    };
  }

  if (provider === 'google') {
    const allowed = audList(env.GOOGLE_AUDIENCES, []);
    if (!allowed.length) {
      return { ok: false, error: 'Google sign-in not configured on server' };
    }
    const res = await verifyJwt(token, GOOGLE_JWKS, (c) => {
      if (!GOOGLE_ISS.has(String(c.iss))) return 'Wrong issuer';
      if (!audMatches(c.aud, allowed)) return 'Wrong audience';
      return null;
    });
    if (!res.ok) return res;
    const sub = String(res.claims.sub || '');
    if (!sub) return { ok: false, error: 'Missing subject' };
    return {
      ok: true,
      identity: {
        provider: 'google',
        subject: sub,
        email: typeof res.claims.email === 'string' ? res.claims.email : undefined,
      },
    };
  }

  return { ok: false, error: 'Unknown provider' };
}

/** Deterministic 64-hex sync id from a verified identity. */
export async function deriveSyncId(
  identity: Pick<VerifiedIdentity, 'provider' | 'subject'>,
  secret: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${identity.provider}:${identity.subject}`)
  );
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
