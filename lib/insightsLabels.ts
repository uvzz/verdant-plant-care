/**
 * Branchy label descriptor for the Insights screen
 * (`app/(tabs)/insights.tsx`). Pure + no `t()` import, mirroring
 * `plantsSubtitleLabel` in `lib/plantsSubtitle.ts`, `relativeCareLabel` in
 * `lib/care.ts`, and `lib/calendarLabels.ts`'s descriptors, so the branch
 * selection is unit-testable and the screen renders the result via
 * `translateLabel(t, label)` from `lib/i18n/core`.
 */
import type { CareLabel } from './care';

/**
 * "Most active" breakdown line — "Most active: {name} (1 log)" vs "Most
 * active: {name} ({count} logs)". Distinct one/many keys per Constraint 4
 * (no plural engine). Branch: `count === 1`.
 */
export function mostActiveLabel(name: string, count: number): CareLabel {
  return count === 1
    ? { key: 'insights.mostActiveOne', params: { name } }
    : { key: 'insights.mostActiveMany', params: { name, count } };
}
