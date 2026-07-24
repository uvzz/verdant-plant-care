import { describe, expect, it } from 'vitest';
import { heroMetaLabel, plantAgeLabel } from '../detailLabels';

describe('plantAgeLabel', () => {
  it('returns null when the plant has no age yet', () => {
    expect(plantAgeLabel(0)).toBeNull();
  });

  it('returns null for a negative age (clock skew / bad data)', () => {
    expect(plantAgeLabel(-1)).toBeNull();
  });

  it('picks the one key at the ageDays === 1 boundary', () => {
    expect(plantAgeLabel(1)).toEqual({ key: 'detail.heroAgeOne' });
  });

  it('picks the many key just above the boundary', () => {
    expect(plantAgeLabel(2)).toEqual({
      key: 'detail.heroAgeMany',
      params: { days: 2 },
    });
  });

  it('picks the many key for a larger age', () => {
    expect(plantAgeLabel(120)).toEqual({
      key: 'detail.heroAgeMany',
      params: { days: 120 },
    });
  });
});

describe('heroMetaLabel', () => {
  it('picks the plain key with no location and no age', () => {
    expect(heroMetaLabel('Houseplant', '', null)).toEqual({
      key: 'detail.heroMeta',
      params: { category: 'Houseplant' },
    });
  });

  it('picks the with-location key when there is a location but no age', () => {
    expect(heroMetaLabel('Houseplant', 'Kitchen', null)).toEqual({
      key: 'detail.heroMetaLocation',
      params: { category: 'Houseplant', location: 'Kitchen' },
    });
  });

  it('picks the with-age key when there is an age but no location', () => {
    expect(heroMetaLabel('Fern', '', '5d with you')).toEqual({
      key: 'detail.heroMetaAge',
      params: { category: 'Fern', age: '5d with you' },
    });
  });

  it('picks the with-location-and-age key when both are present', () => {
    expect(heroMetaLabel('Fern', 'Kitchen', '5d with you')).toEqual({
      key: 'detail.heroMetaLocationAge',
      params: { category: 'Fern', location: 'Kitchen', age: '5d with you' },
    });
  });

  it('treats an empty-string location the same as no location', () => {
    // `plant.location` is `''` by default (never undefined) — the falsy
    // check must not require a null/undefined distinction.
    expect(heroMetaLabel('Cactus', '', '1d with you')).toEqual({
      key: 'detail.heroMetaAge',
      params: { category: 'Cactus', age: '1d with you' },
    });
  });
});
