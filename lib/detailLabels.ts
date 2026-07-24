/**
 * Branchy label descriptors for the plant detail screen
 * (`app/plant/[id].tsx`). Pure + no `t()` import, mirroring
 * `plantsSubtitleLabel` in `lib/plantsSubtitle.ts`, `relativeCareLabel` in
 * `lib/care.ts`, and `lib/calendarLabels.ts`/`lib/insightsLabels.ts`'s
 * descriptors, so the branch selection is unit-testable and the screen
 * renders the result via `translateLabel(t, label)` from `lib/i18n/core`.
 */
import type { CareLabel } from './care';

/**
 * Hero "{n}d with you" age fragment. `null` when the plant has no age yet
 * (acquired today, `ageDays <= 0`) — the caller omits the fragment entirely
 * from the hero meta line rather than rendering "0d with you". Distinct
 * one/many keys per Constraint 4 (no plural engine).
 */
export function plantAgeLabel(ageDays: number): CareLabel | null {
  if (ageDays <= 0) return null;
  return ageDays === 1
    ? { key: 'detail.heroAgeOne' }
    : { key: 'detail.heroAgeMany', params: { days: ageDays } };
}

/**
 * Hero meta line under the plant name — "{category}",
 * "{category} · {location}", "{category} · {age}", or
 * "{category} · {location} · {age}". Four distinct whole-fragment keys
 * chosen by branch (location present/absent × age present/absent), never
 * glued fragments (Constraint 3) — mirrors `rowMetaLabel`'s
 * location-conditional pattern in `lib/calendarLabels.ts`.
 *
 * `category` is the already-translated `domain.category.*` value (the
 * stored `PlantCategory` enum itself is never translated — Constraint 2);
 * `age` is the already-translated `plantAgeLabel` fragment (via
 * `translateLabel`), or `null` when the plant has no age yet; `location` is
 * raw user content (verbatim — Constraint 9, never translated, and empty
 * string is treated as "no location").
 */
export function heroMetaLabel(
  category: string,
  location: string,
  age: string | null
): CareLabel {
  if (location && age) {
    return {
      key: 'detail.heroMetaLocationAge',
      params: { category, location, age },
    };
  }
  if (location) {
    return { key: 'detail.heroMetaLocation', params: { category, location } };
  }
  if (age) {
    return { key: 'detail.heroMetaAge', params: { category, age } };
  }
  return { key: 'detail.heroMeta', params: { category } };
}
