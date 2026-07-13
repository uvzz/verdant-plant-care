import { describe, expect, it } from 'vitest';
import { deriveSyncId, verifyIdentityToken } from './auth';

describe('deriveSyncId', () => {
  it('is deterministic per provider+subject and 64 hex chars', async () => {
    const a1 = await deriveSyncId({ provider: 'apple', subject: 'user-1' }, 'secret');
    const a2 = await deriveSyncId({ provider: 'apple', subject: 'user-1' }, 'secret');
    expect(a1).toBe(a2);
    expect(a1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('differs across providers, subjects, and secrets', async () => {
    const base = await deriveSyncId({ provider: 'apple', subject: 'u' }, 's');
    expect(await deriveSyncId({ provider: 'google', subject: 'u' }, 's')).not.toBe(base);
    expect(await deriveSyncId({ provider: 'apple', subject: 'v' }, 's')).not.toBe(base);
    expect(await deriveSyncId({ provider: 'apple', subject: 'u' }, 't')).not.toBe(base);
  });
});

describe('verifyIdentityToken (structural rejections, no network)', () => {
  const env = { GOOGLE_AUDIENCES: 'client-id.apps.googleusercontent.com' };

  it('rejects unknown providers', async () => {
    const r = await verifyIdentityToken('facebook', 'x'.repeat(40), env);
    expect(r.ok).toBe(false);
  });

  it('rejects junk tokens without fetching JWKS', async () => {
    expect((await verifyIdentityToken('apple', '', env)).ok).toBe(false);
    expect((await verifyIdentityToken('apple', 'short', env)).ok).toBe(false);
    expect((await verifyIdentityToken('apple', 'a'.repeat(9000), env)).ok).toBe(false);
    expect((await verifyIdentityToken('apple', 'not.a', env)).ok).toBe(false);
  });

  it('rejects tokens with wrong alg / issuer / expiry before signature work', async () => {
    const b64u = (o: object) =>
      Buffer.from(JSON.stringify(o)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);

    const hs256 = `${b64u({ alg: 'HS256', kid: 'k' })}.${b64u({
      iss: 'https://appleid.apple.com',
      aud: 'com.verdant.plantcare',
      exp: now + 600,
      sub: 'u',
    })}.AAAA`;
    expect((await verifyIdentityToken('apple', hs256, env)).ok).toBe(false);

    const expired = `${b64u({ alg: 'RS256', kid: 'k' })}.${b64u({
      iss: 'https://appleid.apple.com',
      aud: 'com.verdant.plantcare',
      exp: now - 10,
      sub: 'u',
    })}.AAAA`;
    expect((await verifyIdentityToken('apple', expired, env)).ok).toBe(false);

    const wrongIss = `${b64u({ alg: 'RS256', kid: 'k' })}.${b64u({
      iss: 'https://evil.example',
      aud: 'com.verdant.plantcare',
      exp: now + 600,
      sub: 'u',
    })}.AAAA`;
    expect((await verifyIdentityToken('apple', wrongIss, env)).ok).toBe(false);

    const wrongAud = `${b64u({ alg: 'RS256', kid: 'k' })}.${b64u({
      iss: 'https://appleid.apple.com',
      aud: 'com.some.other.app',
      exp: now + 600,
      sub: 'u',
    })}.AAAA`;
    expect((await verifyIdentityToken('apple', wrongAud, env)).ok).toBe(false);
  });

  it('rejects Google sign-in when no audiences configured', async () => {
    const r = await verifyIdentityToken('google', 'x'.repeat(40), {});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('not configured');
  });
});
