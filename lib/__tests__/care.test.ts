import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import {
  effectiveWaterIntervalDays,
  formatRelativeCare,
  getCareDueItems,
  listRooms,
  nextDueDate,
} from '../care';
import type { CareLog, Plant } from '../types';
import { normalizePlant } from '../types';

function plant(partial: Partial<Plant> & { id: string; name: string }): Plant {
  return normalizePlant({
    species: '',
    category: 'Houseplant',
    photoUri: null,
    acquiredDate: '2026-01-01',
    location: '',
    waterIntervalDays: 10,
    fertilizeIntervalDays: 30,
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  });
}

describe('effectiveWaterIntervalDays', () => {
  it('shortens for small pots and direct light', () => {
    const p = plant({
      id: '1',
      name: 'A',
      waterIntervalDays: 10,
      potSize: 'small',
      lightLevel: 'direct',
    });
    // 10 * 0.8 * 0.8 = 6.4 → 6
    expect(effectiveWaterIntervalDays(p)).toBe(6);
  });

  it('lengthens for large pots and low light', () => {
    const p = plant({
      id: '2',
      name: 'B',
      waterIntervalDays: 10,
      potSize: 'large',
      lightLevel: 'low',
    });
    // 10 * 1.25 * 1.25 = 15.625 → 16
    expect(effectiveWaterIntervalDays(p)).toBe(16);
  });
});

describe('nextDueDate + soil check snooze', () => {
  it('uses water interval from last water', () => {
    const p = plant({
      id: 'p1',
      name: 'Fern',
      waterIntervalDays: 7,
      potSize: 'medium',
      lightLevel: 'medium',
      acquiredDate: '2026-01-01',
    });
    const logs: CareLog[] = [
      {
        id: 'l1',
        plantId: 'p1',
        type: 'water',
        note: '',
        photoUri: null,
        createdAt: '2026-06-01T12:00:00.000Z',
      },
    ];
    const due = nextDueDate(p, logs, 'water');
    expect(format(due, 'yyyy-MM-dd')).toBe('2026-06-08');
  });

  it('snoozes from recent soil check', () => {
    const p = plant({
      id: 'p1',
      name: 'Fern',
      waterIntervalDays: 7,
      potSize: 'medium',
      lightLevel: 'medium',
      acquiredDate: '2026-01-01',
    });
    const logs: CareLog[] = [
      {
        id: 'l1',
        plantId: 'p1',
        type: 'water',
        note: '',
        photoUri: null,
        createdAt: '2026-06-01T12:00:00.000Z',
      },
      {
        id: 'l2',
        plantId: 'p1',
        type: 'check',
        note: 'still moist',
        photoUri: null,
        createdAt: '2026-06-10T12:00:00.000Z',
      },
    ];
    const due = nextDueDate(p, logs, 'water');
    // check + 2 days snooze
    expect(format(due, 'yyyy-MM-dd')).toBe('2026-06-12');
  });

  it('a check BEFORE the plant is due never pulls watering earlier', () => {
    // Regression: checking a not-yet-due plant used to return check+2 days
    // unconditionally, moving "due in 7 days" to "due in 2 days" — i.e. the
    // anti-overwatering feature was telling people to water sooner.
    const p = plant({
      id: 'p1',
      name: 'Fern',
      waterIntervalDays: 7,
      potSize: 'medium',
      lightLevel: 'medium',
      acquiredDate: '2026-01-01',
    });
    const logs: CareLog[] = [
      {
        id: 'l1',
        plantId: 'p1',
        type: 'water',
        note: '',
        photoUri: null,
        createdAt: '2026-06-01T12:00:00.000Z', // due 2026-06-08
      },
      {
        id: 'l2',
        plantId: 'p1',
        type: 'check',
        note: 'still moist',
        photoUri: null,
        createdAt: '2026-06-02T12:00:00.000Z', // checked early
      },
    ];
    // Must stay on the original schedule, NOT jump to 2026-06-04.
    expect(format(nextDueDate(p, logs, 'water'), 'yyyy-MM-dd')).toBe('2026-06-08');
  });

  it('a check on a never-watered plant does not pull the first water earlier', () => {
    const p = plant({
      id: 'p2',
      name: 'New',
      waterIntervalDays: 14,
      potSize: 'medium',
      lightLevel: 'medium',
      acquiredDate: '2026-06-01', // first water due 2026-06-15
    });
    const logs: CareLog[] = [
      {
        id: 'c1',
        plantId: 'p2',
        type: 'check',
        note: 'still moist',
        photoUri: null,
        createdAt: '2026-06-02T12:00:00.000Z',
      },
    ];
    expect(format(nextDueDate(p, logs, 'water'), 'yyyy-MM-dd')).toBe('2026-06-15');
  });
});

describe('formatRelativeCare', () => {
  it('formats overdue and upcoming', () => {
    expect(formatRelativeCare(-2)).toBe('2 days overdue');
    expect(formatRelativeCare(0)).toBe('Due today');
    expect(formatRelativeCare(1)).toBe('Due tomorrow');
    expect(formatRelativeCare(5)).toBe('In 5 days');
  });
});

describe('listRooms', () => {
  it('returns sorted unique rooms', () => {
    const plants = [
      plant({ id: '1', name: 'A', location: 'Kitchen' }),
      plant({ id: '2', name: 'B', location: 'Living' }),
      plant({ id: '3', name: 'C', location: 'Kitchen' }),
      plant({ id: '4', name: 'D', location: '  ' }),
    ];
    expect(listRooms(plants)).toEqual(['Kitchen', 'Living']);
  });
});

describe('getCareDueItems', () => {
  it('returns water and fertilize items sorted by urgency', () => {
    const plants = [
      plant({
        id: 'p1',
        name: 'A',
        waterIntervalDays: 1,
        fertilizeIntervalDays: 100,
        acquiredDate: '2020-01-01',
      }),
    ];
    const items = getCareDueItems(plants, []);
    expect(items).toHaveLength(2);
    expect(items[0].daysUntil).toBeLessThanOrEqual(items[1].daysUntil);
    expect(items.every((i) => typeof i.effectiveIntervalDays === 'number')).toBe(
      true
    );
  });
});
