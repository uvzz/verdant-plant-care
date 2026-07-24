/**
 * Branchy label descriptors for the Care calendar screen
 * (`app/(tabs)/calendar.tsx`). Pure + no `t()` import, mirroring
 * `plantsSubtitleLabel` in `lib/plantsSubtitle.ts` and `relativeCareLabel` in
 * `lib/care.ts`, so the branch selection is unit-testable and the screen
 * renders the result via `translateLabel(t, label)` from `lib/i18n/core`.
 */
import type { CareDueItem } from './types';
import { effectiveWaterIntervalDays, type CareLabel } from './care';

/**
 * Present-tense care-type word for a calendar row ("Water" / "Fertilize") —
 * used in the row's meta line and its accessibilityLabel. Deliberately
 * distinct from `domain.careType.water`/`domain.careType.fertilize`
 * ("Watered" / "Fertilized", past tense), which label a *completed* log entry
 * elsewhere (action chips, history badges). Saying "Watered · Due today"
 * would read as already-done when the row is actually asking for the action.
 * Extracted to one function so the meta line and accessibility label can't
 * drift onto different words for the same row.
 */
export function careVerbLabel(type: CareDueItem['type']): CareLabel {
  return {
    key: type === 'water' ? 'calendar.careTypeWater' : 'calendar.careTypeFertilize',
  };
}

/**
 * Interval hint shown under each calendar row, e.g. "~every 6d
 * (light/pot-aware)", "every 30d", or "~every 6d (light/pot-aware) · check
 * soil first". Branches on care type and whether the plant wants a soil
 * check before watering (mirrors the `checkFirst` condition in
 * `lib/care.ts`'s `nextDueDate`/row rendering) — a distinct catalog key per
 * branch rather than gluing " · check soil first" onto the string at render
 * time (Constraint 3: no sentence-building via concatenation).
 */
export function intervalHintLabel(item: CareDueItem): CareLabel {
  if (item.type === 'water') {
    const days = effectiveWaterIntervalDays(item.plant);
    const checkFirst = item.plant.checkBeforeWater !== false;
    return checkFirst
      ? { key: 'calendar.intervalWaterCheckFirst', params: { days } }
      : { key: 'calendar.intervalWater', params: { days } };
  }
  return {
    key: 'calendar.intervalFertilize',
    params: { days: item.effectiveIntervalDays },
  };
}
