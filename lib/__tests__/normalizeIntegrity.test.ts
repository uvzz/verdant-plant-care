import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { normalizeCareLog, normalizePlant } from '../types';
import { nextDueDate } from '../care';
import type { CareLog, Plant } from '../types';

const EPOCH = new Date(0).toISOString();

describe('isPlausibleIsoDate must agree with the parser the app reads with', () => {
  // Date.parse accepts these; parseISO (what safeParseDate uses) does not.
  // Keeping them let a corrupt log sort newest and permanently un-due a plant.
  it.each(['3/1/2026', 'March 1, 2026', '0', '5'])(
    'rejects %s (readable by Date.parse but not parseISO)',
    (bad) => {
      const log = normalizeCareLog({ plantId: 'p1', type: 'water', createdAt: bad });
      expect(log).not.toBeNull();
      expect(log!.createdAt).toBe(EPOCH);
    }
  );

  it('keeps genuine ISO timestamps untouched', () => {
    const log = normalizeCareLog({
      plantId: 'p1',
      type: 'water',
      createdAt: '2026-06-01T12:00:00.000Z',
    });
    expect(log!.createdAt).toBe('2026-06-01T12:00:00.000Z');
  });
});

describe('a corrupt care log cannot hijack the schedule', () => {
  it('does not become the newest water and reset the due date', () => {
    const plant = normalizePlant({
      id: 'p1',
      name: 'Fern',
      waterIntervalDays: 7,
      acquiredDate: '2026-01-01',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }) as Plant;
    const logs: CareLog[] = [
      normalizeCareLog({
        id: 'l1',
        plantId: 'p1',
        type: 'water',
        createdAt: '2026-06-01T12:00:00.000Z',
      })!,
      // corrupt: stamped `now` previously → newest → due date reset daily
      normalizeCareLog({
        id: 'l2',
        plantId: 'p1',
        type: 'water',
        createdAt: '3/1/2026',
      })!,
    ];
    // Real water (06-01) + 7d interval must still drive the schedule.
    // Format locally (like the other care tests) — nextDueDate uses startOfDay,
    // so toISOString() would read a day earlier in a UTC+ timezone.
    expect(format(nextDueDate(plant, logs, 'water'), 'yyyy-MM-dd')).toBe('2026-06-08');
  });
});

describe('unknown edit time must lose last-write-wins, not win it', () => {
  it('maps a corrupt updatedAt to epoch (not now) when createdAt is also bad', () => {
    const p = normalizePlant({
      id: 'p1',
      name: 'A',
      createdAt: 'garbage',
      updatedAt: 'garbage',
    });
    expect(p.updatedAt).toBe(EPOCH);
  });

  it('falls back to a genuine createdAt when updatedAt is corrupt', () => {
    const p = normalizePlant({
      id: 'p1',
      name: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '',
    });
    expect(p.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('never invents a fresher updatedAt than a real remote edit', () => {
    const local = normalizePlant({ id: 'p1', name: 'Old', updatedAt: 'garbage' });
    const remoteEdit = '2026-07-10T00:00:00.000Z';
    expect(Date.parse(local.updatedAt)).toBeLessThan(Date.parse(remoteEdit));
  });
});
