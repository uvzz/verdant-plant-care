/**
 * Pure merge engine for cloud sync — no React Native imports so it unit-tests
 * cleanly. Strategy: per-record last-write-wins by updatedAt with tombstones
 * so deletions replicate instead of resurrecting.
 */

import type { CareLog, FamilyMember, Plant } from './types';

export type Tombstones = {
  plants: Record<string, string>;
  logs: Record<string, string>;
};

export type SyncDoc = {
  app: 'verdant-plant-care';
  version: 1;
  exportedAt: string;
  plants: Plant[];
  logs: CareLog[];
  familyMembers: FamilyMember[];
  householdName: string;
  tombstones: Tombstones;
};

const TOMBSTONE_TTL_MS = 120 * 24 * 3600 * 1000;

export function emptySyncDoc(now = new Date().toISOString()): SyncDoc {
  return {
    app: 'verdant-plant-care',
    version: 1,
    exportedAt: now,
    plants: [],
    logs: [],
    familyMembers: [],
    householdName: '',
    tombstones: { plants: {}, logs: {} },
  };
}

export function parseSyncDoc(raw: string): SyncDoc | null {
  try {
    const doc = JSON.parse(raw) as Partial<SyncDoc>;
    if (!doc || doc.app !== 'verdant-plant-care') return null;
    return {
      ...emptySyncDoc(doc.exportedAt || new Date().toISOString()),
      ...doc,
      plants: Array.isArray(doc.plants) ? doc.plants : [],
      logs: Array.isArray(doc.logs) ? doc.logs : [],
      familyMembers: Array.isArray(doc.familyMembers) ? doc.familyMembers : [],
      householdName:
        typeof doc.householdName === 'string' ? doc.householdName : '',
      tombstones: {
        plants: doc.tombstones?.plants ?? {},
        logs: doc.tombstones?.logs ?? {},
      },
    };
  } catch {
    return null;
  }
}

function newerIso(a: string | undefined, b: string | undefined): string {
  const ta = Date.parse(a || '') || 0;
  const tb = Date.parse(b || '') || 0;
  return ta >= tb ? a || b || '' : b || '';
}

function mergeTombstones(a: Tombstones, b: Tombstones, now: number): Tombstones {
  const out: Tombstones = { plants: {}, logs: {} };
  for (const kind of ['plants', 'logs'] as const) {
    const ids = new Set([...Object.keys(a[kind]), ...Object.keys(b[kind])]);
    for (const id of ids) {
      const at = newerIso(a[kind][id], b[kind][id]);
      // prune ancient tombstones so the doc doesn't grow forever
      if (now - (Date.parse(at) || 0) < TOMBSTONE_TTL_MS) {
        out[kind][id] = at;
      }
    }
  }
  return out;
}

/** True when the tombstone is newer than the record's last update. */
function isDeleted(deletedAt: string | undefined, updatedAt: string | undefined): boolean {
  if (!deletedAt) return false;
  return (Date.parse(deletedAt) || 0) > (Date.parse(updatedAt || '') || 0);
}

export function mergeSyncDocs(a: SyncDoc, b: SyncDoc): SyncDoc {
  const now = Date.now();
  const tombstones = mergeTombstones(a.tombstones, b.tombstones, now);

  // Plants: LWW by updatedAt, tombstones win when newer than the record.
  const plantById = new Map<string, Plant>();
  for (const p of [...a.plants, ...b.plants]) {
    if (!p?.id) continue;
    const prev = plantById.get(p.id);
    if (!prev || (Date.parse(p.updatedAt || '') || 0) > (Date.parse(prev.updatedAt || '') || 0)) {
      plantById.set(p.id, p);
    }
  }
  const plants = [...plantById.values()].filter(
    (p) => !isDeleted(tombstones.plants[p.id], p.updatedAt)
  );
  const plantIds = new Set(plants.map((p) => p.id));

  // Logs: immutable — union by id, minus tombstoned and orphaned entries.
  const logById = new Map<string, CareLog>();
  for (const l of [...a.logs, ...b.logs]) {
    if (!l?.id) continue;
    if (!logById.has(l.id)) logById.set(l.id, l);
  }
  const logs = [...logById.values()]
    .filter((l) => !tombstones.logs[l.id])
    .filter((l) => plantIds.has(l.plantId))
    .sort((x, y) => (y.createdAt || '').localeCompare(x.createdAt || ''));

  // Family: union by id (stable ids, no edits to merge).
  const memberById = new Map<string, FamilyMember>();
  for (const m of [...a.familyMembers, ...b.familyMembers]) {
    if (m?.id && !memberById.has(m.id)) memberById.set(m.id, m);
  }

  const newerDoc =
    (Date.parse(a.exportedAt) || 0) >= (Date.parse(b.exportedAt) || 0) ? a : b;
  const householdName =
    newerDoc.householdName || a.householdName || b.householdName || '';

  return {
    app: 'verdant-plant-care',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    plants,
    logs,
    familyMembers: [...memberById.values()],
    householdName,
    tombstones,
  };
}
