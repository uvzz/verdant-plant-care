/**
 * Subtitle line under "My Plants": "{count} plants · Free up to {limit} ·
 * showing {shown}" — mixes plant count, free-tier limit, and filter state.
 *
 * Kept as whole-sentence catalog keys chosen by branch (never assembled from
 * `t('a') + ' ' + count` fragments) and split one/many per count, since there
 * is no plural engine. Pure + no `t()` import, mirroring `relativeCareLabel`
 * in `lib/care.ts`, so the branch selection is unit-testable and the screen
 * renders it via `translateLabel(t, label)` from `lib/i18n/core`.
 */
export interface PlantsSubtitleLabel {
  key: string;
  params?: Record<string, string | number>;
}

export function plantsSubtitleLabel(state: {
  /** Total plants owned (before filtering). */
  count: number;
  /** Plants remaining after search/category/room filters. */
  shown: number;
  isPremium: boolean;
  freeLimit: number;
}): PlantsSubtitleLabel {
  const { count, shown, isPremium, freeLimit } = state;
  const isOne = count === 1;
  const isFiltered = shown !== count;

  if (isPremium) {
    if (isFiltered) {
      return isOne
        ? { key: 'plants.subtitlePremiumFilteredOne', params: { shown } }
        : { key: 'plants.subtitlePremiumFilteredMany', params: { count, shown } };
    }
    return isOne
      ? { key: 'plants.subtitlePremiumOne' }
      : { key: 'plants.subtitlePremiumMany', params: { count } };
  }

  if (isFiltered) {
    return isOne
      ? { key: 'plants.subtitleFreeFilteredOne', params: { limit: freeLimit, shown } }
      : {
          key: 'plants.subtitleFreeFilteredMany',
          params: { count, limit: freeLimit, shown },
        };
  }
  return isOne
    ? { key: 'plants.subtitleFreeOne', params: { limit: freeLimit } }
    : { key: 'plants.subtitleFreeMany', params: { count, limit: freeLimit } };
}
