import { describe, expect, it } from 'vitest';
import {
  deleteAllPhotos,
  deleteCollection,
  getCollection,
  listPhotos,
  putCollection,
  putPhoto,
  validPhotoName,
  validSyncId,
  type D1Like,
  type KVLike,
} from './sync';

/** In-memory KV stand-in implementing just what sync.ts uses. */
function fakeKv() {
  const store = new Map<string, ArrayBuffer>();
  const kv: KVLike = {
    async get(key) {
      return store.get(key) ?? null;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
    async list({ prefix }) {
      const keys = [...store.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((name) => ({ name }));
      return { keys, list_complete: true };
    },
  };
  return { kv, store };
}

const bytes = (n: number) => new Uint8Array(n).fill(1).buffer;

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
              } else if (sql.startsWith('DELETE')) {
                rows.delete(args[0] as string);
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

describe('photo store + manifest', () => {
  const OTHER_ID = 'b'.repeat(64);

  it('stores photos and lists only this sync id', async () => {
    const { kv } = fakeKv();
    expect((await putPhoto(kv, SYNC_ID, 'a.jpg', bytes(10), 'image/jpeg')).ok).toBe(true);
    expect((await putPhoto(kv, SYNC_ID, 'b.png', bytes(10), 'image/png')).ok).toBe(true);
    // A different collection's photo must not leak into the manifest.
    await putPhoto(kv, OTHER_ID, 'c.jpg', bytes(10), 'image/jpeg');

    const names = await listPhotos(kv, SYNC_ID);
    expect(names.sort()).toEqual(['a.jpg', 'b.png']);
    expect(await listPhotos(kv, OTHER_ID)).toEqual(['c.jpg']);
  });

  it('manifest is empty before any upload (the desync self-heal case)', async () => {
    const { kv } = fakeKv();
    expect(await listPhotos(kv, SYNC_ID)).toEqual([]);
  });

  it('deleteAllPhotos removes only this sync id, and reports the count', async () => {
    const { kv } = fakeKv();
    await putPhoto(kv, SYNC_ID, 'a.jpg', bytes(10), 'image/jpeg');
    await putPhoto(kv, SYNC_ID, 'b.png', bytes(10), 'image/png');
    await putPhoto(kv, OTHER_ID, 'keep.jpg', bytes(10), 'image/jpeg');

    expect(await deleteAllPhotos(kv, SYNC_ID)).toBe(2);
    expect(await listPhotos(kv, SYNC_ID)).toEqual([]);
    // Another account's photos must survive.
    expect(await listPhotos(kv, OTHER_ID)).toEqual(['keep.jpg']);
  });

  it('deleteAllPhotos on an empty collection is a no-op', async () => {
    const { kv } = fakeKv();
    expect(await deleteAllPhotos(kv, SYNC_ID)).toBe(0);
  });

  it('rejects empty, oversized, and wrong-type photos', async () => {
    const { kv } = fakeKv();
    expect((await putPhoto(kv, SYNC_ID, 'x.jpg', bytes(0), 'image/jpeg')).ok).toBe(false);
    expect((await putPhoto(kv, SYNC_ID, 'x.jpg', bytes(4_000_000), 'image/jpeg')).ok).toBe(
      false
    );
    expect((await putPhoto(kv, SYNC_ID, 'x.gif', bytes(10), 'image/gif')).ok).toBe(false);
  });
});

describe('deleteCollection', () => {
  it('removes the row so a later read is empty (and re-sync starts fresh)', async () => {
    const { db } = fakeDb();
    await putCollection(db, SYNC_ID, 0, doc('mine'));
    expect(await getCollection(db, SYNC_ID)).not.toBeNull();

    await deleteCollection(db, SYNC_ID);
    expect(await getCollection(db, SYNC_ID)).toBeNull();

    // After deletion the id behaves like a first-ever sync again.
    expect(await putCollection(db, SYNC_ID, 0, doc('fresh'))).toEqual({ ok: true, rev: 1 });
  });
});
