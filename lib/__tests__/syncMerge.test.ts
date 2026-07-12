import { describe, expect, it } from 'vitest';
import {
  emptySyncDoc,
  mergeSyncDocs,
  parseSyncDoc,
  type SyncDoc,
} from '../syncMerge';
import type { CareLog, Plant } from '../types';

function plant(id: string, updatedAt: string, name = id): Plant {
  return {
    id,
    name,
    species: '',
    category: 'Houseplant',
    photoUri: null,
    acquiredDate: '2026-01-01',
    location: '',
    waterIntervalDays: 7,
    fertilizeIntervalDays: 30,
    notes: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt,
  } as Plant;
}

function log(id: string, plantId: string): CareLog {
  return {
    id,
    plantId,
    type: 'water',
    note: '',
    photoUri: null,
    createdAt: '2026-06-01T00:00:00Z',
  } as CareLog;
}

function doc(partial: Partial<SyncDoc>): SyncDoc {
  return { ...emptySyncDoc('2026-07-01T00:00:00Z'), ...partial };
}

describe('mergeSyncDocs', () => {
  it('unions plants and keeps the newer edit per id', () => {
    const a = doc({
      plants: [plant('p1', '2026-07-01T00:00:00Z', 'Old name'), plant('p2', '2026-07-01T00:00:00Z')],
    });
    const b = doc({
      plants: [plant('p1', '2026-07-02T00:00:00Z', 'New name'), plant('p3', '2026-07-01T00:00:00Z')],
    });
    const m = mergeSyncDocs(a, b);
    expect(m.plants).toHaveLength(3);
    expect(m.plants.find((p) => p.id === 'p1')?.name).toBe('New name');
  });

  it('tombstone deletes replicate instead of resurrecting', () => {
    const a = doc({ plants: [plant('p1', '2026-07-01T00:00:00Z')] });
    const b = doc({
      plants: [],
      tombstones: { plants: { p1: '2026-07-02T00:00:00Z' }, logs: {} },
    });
    const m = mergeSyncDocs(a, b);
    expect(m.plants).toHaveLength(0);
    expect(m.tombstones.plants.p1).toBeDefined();
  });

  it('edit AFTER delete wins (re-added plant survives)', () => {
    const a = doc({ plants: [plant('p1', '2026-07-03T00:00:00Z')] });
    const b = doc({
      tombstones: { plants: { p1: '2026-07-02T00:00:00Z' }, logs: {} },
    });
    const m = mergeSyncDocs(a, b);
    expect(m.plants).toHaveLength(1);
  });

  it('unions logs, drops tombstoned and orphaned ones', () => {
    const a = doc({
      plants: [plant('p1', '2026-07-01T00:00:00Z')],
      logs: [log('l1', 'p1'), log('l2', 'p1'), log('lx', 'ghost')],
    });
    const b = doc({
      plants: [plant('p1', '2026-07-01T00:00:00Z')],
      logs: [log('l3', 'p1')],
      tombstones: { plants: {}, logs: { l2: '2026-07-02T00:00:00Z' } },
    });
    const m = mergeSyncDocs(a, b);
    expect(m.logs.map((l) => l.id).sort()).toEqual(['l1', 'l3']);
  });

  it('is idempotent (merging twice changes nothing)', () => {
    const a = doc({ plants: [plant('p1', '2026-07-01T00:00:00Z')] });
    const b = doc({
      plants: [plant('p2', '2026-07-01T00:00:00Z')],
      tombstones: { plants: { p3: '2026-07-01T00:00:00Z' }, logs: {} },
    });
    const once = mergeSyncDocs(a, b);
    const twice = mergeSyncDocs(once, b);
    expect(twice.plants.map((p) => p.id).sort()).toEqual(
      once.plants.map((p) => p.id).sort()
    );
    expect(twice.logs).toEqual(once.logs);
  });
});

describe('parseSyncDoc', () => {
  it('accepts only verdant docs and defaults missing fields', () => {
    expect(parseSyncDoc('{"app":"other"}')).toBeNull();
    expect(parseSyncDoc('garbage')).toBeNull();
    const d = parseSyncDoc('{"app":"verdant-plant-care"}');
    expect(d?.plants).toEqual([]);
    expect(d?.tombstones).toEqual({ plants: {}, logs: {} });
  });
});
