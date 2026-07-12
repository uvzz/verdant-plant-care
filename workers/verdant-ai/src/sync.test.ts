import { describe, expect, it } from 'vitest';
import {
  putCollection,
  validPhotoName,
  validSyncId,
  type D1Like,
} from './sync';

/** In-memory D1 stand-in implementing just what sync.ts uses. */
function fakeDb() {
  const rows = new Map<string, { rev: number; payload: string; updated_at: string }>();
  const db: D1Like = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first<T>() {
              if (sql.startsWith('SELECT')) {
                const row = rows.get(args[0] as string);
                return (row ? { ...row } : null) as T | null;
              }
              return null;
            },
            async run() {
              if (sql.startsWith('INSERT')) {
                const [syncId, payload, now] = args as string[];
                rows.set(syncId, { rev: 1, payload, updated_at: now });
              } else if (sql.startsWith('UPDATE')) {
                const [nextRev, payload, now, syncId, baseRev] = args as [
                  number,
                  string,
                  string,
                  string,
                  number,
                ];
                const row = rows.get(syncId);
                if (row && row.rev === baseRev) {
                  rows.set(syncId, { rev: nextRev, payload, updated_at: now });
                }
              }
              return {};
            },
          };
        },
      };
    },
  };
  return { db, rows };
}

const SYNC_ID = 'a'.repeat(64);
const doc = (marker: string) =>
  JSON.stringify({ app: 'verdant-plant-care', marker });

describe('sync id / photo name validation', () => {
  it('accepts 32-64 hex ids only', () => {
    expect(validSyncId('a'.repeat(32))).toBe(true);
    expect(validSyncId('a'.repeat(64))).toBe(true);
    expect(validSyncId('A'.repeat(64))).toBe(false);
    expect(validSyncId('a'.repeat(31))).toBe(false);
    expect(validSyncId(null)).toBe(false);
    expect(validSyncId('../etc/passwd')).toBe(false);
  });

  it('rejects traversal and junk photo names', () => {
    expect(validPhotoName('abc123.jpg')).toBe(true);
    expect(validPhotoName('a-b_c.0.webp')).toBe(true);
    expect(validPhotoName('../secret')).toBe(false);
    expect(validPhotoName('.hidden')).toBe(false);
    expect(validPhotoName('a/b.jpg')).toBe(false);
    expect(validPhotoName('x'.repeat(200))).toBe(false);
  });
});

describe('putCollection CAS', () => {
  it('creates at rev 1 with baseRev 0', async () => {
    const { db } = fakeDb();
    const r = await putCollection(db, SYNC_ID, 0, doc('first'));
    expect(r).toEqual({ ok: true, rev: 1 });
  });

  it('rejects first sync with nonzero baseRev', async () => {
    const { db } = fakeDb();
    const r = await putCollection(db, SYNC_ID, 3, doc('x'));
    expect(r.ok).toBe(false);
  });

  it('increments rev on matching baseRev', async () => {
    const { db } = fakeDb();
    await putCollection(db, SYNC_ID, 0, doc('v1'));
    const r = await putCollection(db, SYNC_ID, 1, doc('v2'));
    expect(r).toEqual({ ok: true, rev: 2 });
  });

  it('409s stale writers and returns current doc', async () => {
    const { db } = fakeDb();
    await putCollection(db, SYNC_ID, 0, doc('v1'));
    await putCollection(db, SYNC_ID, 1, doc('v2'));
    const stale = await putCollection(db, SYNC_ID, 1, doc('mine'));
    expect(stale.ok).toBe(false);
    if (!stale.ok && 'conflict' in stale && stale.conflict) {
      expect(stale.rev).toBe(2);
      expect(JSON.parse(stale.payload).marker).toBe('v2');
    } else {
      throw new Error('expected conflict');
    }
  });

  it('rejects non-Verdant and oversized payloads', async () => {
    const { db } = fakeDb();
    expect((await putCollection(db, SYNC_ID, 0, '{"app":"other"}')).ok).toBe(false);
    expect((await putCollection(db, SYNC_ID, 0, 'not json')).ok).toBe(false);
    const huge = JSON.stringify({
      app: 'verdant-plant-care',
      blob: 'x'.repeat(2_100_000),
    });
    expect((await putCollection(db, SYNC_ID, 0, huge)).ok).toBe(false);
  });
});
