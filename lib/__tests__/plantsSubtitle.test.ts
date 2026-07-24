import { describe, expect, it } from 'vitest';
import { plantsSubtitleLabel } from '../plantsSubtitle';

describe('plantsSubtitleLabel', () => {
  it('picks the free/one key for a single plant, no filter', () => {
    expect(
      plantsSubtitleLabel({ count: 1, shown: 1, isPremium: false, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitleFreeOne', params: { limit: 5 } });
  });

  it('picks the free/many key for multiple plants, no filter', () => {
    expect(
      plantsSubtitleLabel({ count: 3, shown: 3, isPremium: false, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitleFreeMany', params: { count: 3, limit: 5 } });
  });

  it('treats zero plants as the "many" (plural) branch', () => {
    expect(
      plantsSubtitleLabel({ count: 0, shown: 0, isPremium: false, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitleFreeMany', params: { count: 0, limit: 5 } });
  });

  it('picks the premium/one key for a single plant, no filter', () => {
    expect(
      plantsSubtitleLabel({ count: 1, shown: 1, isPremium: true, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitlePremiumOne' });
  });

  it('picks the premium/many key for multiple plants, no filter', () => {
    expect(
      plantsSubtitleLabel({ count: 8, shown: 8, isPremium: true, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitlePremiumMany', params: { count: 8 } });
  });

  it('switches to the filtered free/one key when a filter narrows the list', () => {
    expect(
      plantsSubtitleLabel({ count: 1, shown: 0, isPremium: false, freeLimit: 5 })
    ).toEqual({
      key: 'plants.subtitleFreeFilteredOne',
      params: { limit: 5, shown: 0 },
    });
  });

  it('switches to the filtered free/many key when a filter narrows the list', () => {
    expect(
      plantsSubtitleLabel({ count: 6, shown: 2, isPremium: false, freeLimit: 5 })
    ).toEqual({
      key: 'plants.subtitleFreeFilteredMany',
      params: { count: 6, limit: 5, shown: 2 },
    });
  });

  it('switches to the filtered premium/one key when a filter narrows the list', () => {
    expect(
      plantsSubtitleLabel({ count: 1, shown: 0, isPremium: true, freeLimit: 5 })
    ).toEqual({ key: 'plants.subtitlePremiumFilteredOne', params: { shown: 0 } });
  });

  it('switches to the filtered premium/many key when a filter narrows the list', () => {
    expect(
      plantsSubtitleLabel({ count: 8, shown: 4, isPremium: true, freeLimit: 5 })
    ).toEqual({
      key: 'plants.subtitlePremiumFilteredMany',
      params: { count: 8, shown: 4 },
    });
  });
});
