import { describe, expect, it } from 'vitest';
import { careVerbLabel, intervalHintLabel } from '../calendarLabels';
import { normalizePlant } from '../types';
import type { CareDueItem, Plant } from '../types';

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

function dueItem(partial: Partial<CareDueItem> & { plant: Plant }): CareDueItem {
  return {
    type: 'water',
    dueDate: new Date('2026-06-08'),
    daysUntil: 0,
    overdue: false,
    effectiveIntervalDays: 10,
    ...partial,
  };
}

describe('careVerbLabel', () => {
  it('picks the water key for a water item', () => {
    expect(careVerbLabel('water')).toEqual({ key: 'calendar.careTypeWater' });
  });

  it('picks the fertilize key for a fertilize item', () => {
    expect(careVerbLabel('fertilize')).toEqual({ key: 'calendar.careTypeFertilize' });
  });
});

describe('intervalHintLabel', () => {
  it('uses the check-first water key when the plant wants a soil check', () => {
    const p = plant({
      id: 'p1',
      name: 'Fern',
      waterIntervalDays: 7,
      potSize: 'medium',
      lightLevel: 'medium',
      checkBeforeWater: true,
    });
    const item = dueItem({ plant: p, type: 'water' });
    expect(intervalHintLabel(item)).toEqual({
      key: 'calendar.intervalWaterCheckFirst',
      params: { days: 7 },
    });
  });

  it('defaults checkBeforeWater to true when unset', () => {
    const p = plant({ id: 'p1', name: 'Fern', waterIntervalDays: 7 });
    const item = dueItem({ plant: p, type: 'water' });
    expect(intervalHintLabel(item).key).toBe('calendar.intervalWaterCheckFirst');
  });

  it('uses the plain water key when the plant opted out of check-first', () => {
    const p = plant({
      id: 'p2',
      name: 'Cactus',
      waterIntervalDays: 21,
      checkBeforeWater: false,
    });
    const item = dueItem({ plant: p, type: 'water' });
    expect(intervalHintLabel(item)).toEqual({
      key: 'calendar.intervalWater',
      params: { days: 21 },
    });
  });

  it('accounts for pot/light adjustments in the water interval', () => {
    const p = plant({
      id: 'p3',
      name: 'Succulent',
      waterIntervalDays: 10,
      potSize: 'small',
      lightLevel: 'direct',
      checkBeforeWater: false,
    });
    const item = dueItem({ plant: p, type: 'water' });
    // 10 * 0.8 * 0.8 = 6.4 -> 6
    expect(intervalHintLabel(item)).toEqual({
      key: 'calendar.intervalWater',
      params: { days: 6 },
    });
  });

  it('uses the fertilize key regardless of checkBeforeWater', () => {
    const p = plant({ id: 'p4', name: 'Orchid', checkBeforeWater: true });
    const item = dueItem({
      plant: p,
      type: 'fertilize',
      effectiveIntervalDays: 21,
    });
    expect(intervalHintLabel(item)).toEqual({
      key: 'calendar.intervalFertilize',
      params: { days: 21 },
    });
  });
});
