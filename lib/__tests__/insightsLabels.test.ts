import { describe, expect, it } from 'vitest';
import { mostActiveLabel } from '../insightsLabels';

describe('mostActiveLabel', () => {
  it('picks the one key at the count === 1 boundary', () => {
    expect(mostActiveLabel('Fern', 1)).toEqual({
      key: 'insights.mostActiveOne',
      params: { name: 'Fern' },
    });
  });

  it('picks the many key just above the boundary', () => {
    expect(mostActiveLabel('Fern', 2)).toEqual({
      key: 'insights.mostActiveMany',
      params: { name: 'Fern', count: 2 },
    });
  });

  it('picks the many key for a larger count', () => {
    expect(mostActiveLabel('Fern', 12)).toEqual({
      key: 'insights.mostActiveMany',
      params: { name: 'Fern', count: 12 },
    });
  });

  it('treats zero as the many (plural) branch', () => {
    // Not reachable from the screen (mostActivePlant is only rendered when
    // truthy, and count is always >= 1 there), but the branch itself is a
    // plain count === 1 check — 0 falls on the "many" side of it, same
    // treatment as plantsSubtitleLabel's zero-plants case.
    expect(mostActiveLabel('Fern', 0)).toEqual({
      key: 'insights.mostActiveMany',
      params: { name: 'Fern', count: 0 },
    });
  });
});
