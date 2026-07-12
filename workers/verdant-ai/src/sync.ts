/**
 * Verdant cloud sync — optimistic-concurrency collection store + photo blobs.
 *
 * Model:
 * - One row per sync id (a 64-hex capability secret generated on device).
 * - PUT is compare-and-swap on `rev`: stale writers get 409 + current doc
 *   and merge client-side, then retry.
 * - Photos are content-addressed by client filename in KV (R2 later).
 *
 * Auth: premium bearer (same as /v1/chat) + X-Sync-Id. The sync id never
 * appears in URLs so it stays out of logs.
 */

// Minimal structural types — repo intentionally avoids @cloudflare/workers-types.
type D1Result = { results?: unknown[] };
export type D1Like = {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<D1Result>;
    };
  };
};
export type KVLike = {
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  put(
    key: string,
    value: ArrayBuffer,
    opts?: { metadata?: Record<string, string> }
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

export const SYNC_LIMITS = {
  maxPayloadChars: 2_000_000,
  maxPhotoBytes: 3_000_000,
  perMinute: 30,
  perDay: 1_000,
  photoPerMinute: 60,
} as const;

const SYNC_ID_RE = /^[a-f0-9]{32,64}$/;
const PHOTO_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validSyncId(id: string | null): id is string {
  return !!id && SYNC_ID_RE.test(id);
}

export function validPhotoName(name: string): boolean {
  return PHOTO_NAME_RE.test(name) && !name.includes('..');
}

type CollectionRow = {
  rev: number;
  payload: string;
  updated_at: string;
};

export async function getCollection(
  db: D1Like,
  syncId: string
): Promise<CollectionRow | null> {
  return db
    .prepare('SELECT rev, payload, updated_at FROM collections WHERE sync_id = ?')
    .bind(syncId)
    .first<CollectionRow>();
}

export type PutResult =
  | { ok: true; rev: number }
  | { ok: false; conflict: true; rev: number; payload: string }
  | { ok: false; conflict?: false; error: string };

export async function putCollection(
  db: D1Like,
  syncId: string,
  baseRev: number,
  payload: string
): Promise<PutResult> {
  if (payload.length > SYNC_LIMITS.maxPayloadChars) {
    return { ok: false, error: 'Payload too large' };
  }
  try {
    const doc = JSON.parse(payload) as { app?: string };
    if (!doc || typeof doc !== 'object' || doc.app !== 'verdant-plant-care') {
      return { ok: false, error: 'Not a Verdant sync payload' };
    }
  } catch {
    return { ok: false, error: 'Payload must be JSON' };
  }

  const now = new Date().toISOString();
  const existing = await getCollection(db, syncId);

  if (!existing) {
    if (baseRev !== 0) {
      return { ok: false, error: 'baseRev must be 0 for first sync' };
    }
    await db
      .prepare(
        'INSERT INTO collections (sync_id, rev, payload, updated_at) VALUES (?, 1, ?, ?)'
      )
      .bind(syncId, payload, now)
      .run();
    return { ok: true, rev: 1 };
  }

  if (existing.rev !== baseRev) {
    return {
      ok: false,
      conflict: true,
      rev: existing.rev,
      payload: existing.payload,
    };
  }

  const nextRev = existing.rev + 1;
  // CAS guard in SQL too — two racing writers can both pass the read above.
  const res = await db
    .prepare(
      'UPDATE collections SET rev = ?, payload = ?, updated_at = ? WHERE sync_id = ? AND rev = ?'
    )
    .bind(nextRev, payload, now, syncId, baseRev)
    .run();
  // D1 exposes changes via meta; structural type keeps it loose — re-read to confirm.
  void res;
  const after = await getCollection(db, syncId);
  if (!after || after.rev !== nextRev) {
    return {
      ok: false,
      conflict: true,
      rev: after?.rev ?? existing.rev,
      payload: after?.payload ?? existing.payload,
    };
  }
  return { ok: true, rev: nextRev };
}

export function photoKey(syncId: string, name: string): string {
  return `p:${syncId}:${name}`;
}

export async function getPhoto(
  kv: KVLike,
  syncId: string,
  name: string
): Promise<ArrayBuffer | null> {
  return kv.get(photoKey(syncId, name), 'arrayBuffer');
}

export async function putPhoto(
  kv: KVLike,
  syncId: string,
  name: string,
  body: ArrayBuffer,
  contentType: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!PHOTO_TYPES.has(contentType)) {
    return { ok: false, error: 'Unsupported photo type' };
  }
  if (body.byteLength === 0 || body.byteLength > SYNC_LIMITS.maxPhotoBytes) {
    return { ok: false, error: 'Photo empty or too large' };
  }
  await kv.put(photoKey(syncId, name), body, {
    metadata: { contentType },
  });
  return { ok: true };
}
