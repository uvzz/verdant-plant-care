# Complete Localization

## Context

Verdant ships a working i18n system (`lib/i18n/`) and advertises four languages
in Settings — English, Spanish, French, German. But only Settings (72 `t()`
calls), the paywall (27) and the welcome flow are actually translated. The
screens a user spends their time in are hardcoded English:

| Screen | file | `t()` calls today |
| --- | --- | --- |
| Plants home | `app/(tabs)/index.tsx` | 0 |
| Care calendar | `app/(tabs)/calendar.tsx` | 0 |
| Insights | `app/(tabs)/insights.tsx` | 3 |
| Plant detail | `app/plant/[id].tsx` | 7 |
| Add / Edit plant | `app/plant/add.tsx`, `edit.tsx` | 0 |
| Log care | `app/plant/log.tsx` | 0 |

A Spanish user picks "Español", sees the Settings screen translate, then hits a
fully English app everywhere else. That is a shipping defect, not a nice-to-have:
we make a promise in the language picker that the app does not keep.

This plan makes every user-facing string in the app translatable, with real
es/fr/de translations, and adds a guard test so new hardcoded strings cannot
silently reappear.

## The i18n contract (already built — do not redesign it)

- `lib/i18n/translations.ts` holds four catalogs (`en`, `es`, `fr`, `de`) typed
  as `Messages = Record<string, string>`. Keys are **flat dotted strings**
  grouped by surface (`tabs.*`, `settings.*`, `paywall.*`).
- English is the source of truth. `translate()` falls back en → raw key, so a
  missing key degrades to readable text, never a blank or a crash.
- Placeholders are `{name}` syntax, filled by `interpolate()`.
- Screens call `const { t } = useI18n();` then `t('some.key')` or
  `t('some.key', { count: 3 })`.
- `lib/__tests__/i18n.test.ts` has a **catalog integrity** block that asserts
  (a) every language defines *exactly* the English key set, and (b) every
  language uses the *same placeholders* per key. Adding an English-only key
  fails the suite. This is the gate that keeps translations honest — never
  weaken or skip it.

## Global Constraints

These bind every task. A reviewer should treat a violation as a defect.

1. **Add all four languages in the same change.** Every new key must land in
   `en`, `es`, `fr`, `de` together, or the catalog integrity test fails. Do not
   add English-only keys and "fill in later".

2. **Never translate a persisted value.** `Plant.category` is stored as the
   English string `'Houseplant'`, `'Orchid'`, etc. (`PlantCategory` in
   `lib/types.ts`), and cloud sync round-trips it. Localize only the *display*:
   look the stored value up through a key such as `domain.category.Houseplant`.
   The same rule holds for any stored enum. Changing what gets written to
   storage or sync is out of scope and would corrupt existing user data.

3. **No string concatenation to build sentences.** Use one key with
   placeholders (`'{count} plants'`), never `t('a') + ' ' + count`. Word order
   differs per language; concatenation cannot be translated correctly.

4. **Pluralization uses distinct keys**, chosen by the caller — e.g.
   `care.overdueOne` / `care.overdueMany`. The catalog has no plural engine and
   this plan does not add one.

5. **Accessibility strings are user-facing.** `accessibilityLabel`,
   `accessibilityHint` and `placeholder` all get translated. A screen reader
   user picked Spanish too.

6. **Key naming:** group by surface, camelCase leaf — `plants.searchPlaceholder`,
   `calendar.overdueSection`, `detail.waterCard`. Shared cross-screen vocabulary
   goes under `domain.*`. Match the existing style in `translations.ts`.

7. **Translation quality:** these are real translations for shipping, not
   placeholders. Keep them idiomatic and roughly the source length — UI is
   width-constrained, and German in particular runs long. Preserve the app's
   calm, unhurried voice ("Gentle reminders", not "REMINDERS!"). If a string is
   a term of art (Premium), leave it.

8. **Do not restyle, refactor or "improve" code you are translating.** These
   screens were just through a design pass. Swap the string, leave the layout,
   the colours and the component structure exactly as they are. A diff that
   touches `StyleSheet.create` is out of scope.

9. **Verify per task:** `npx tsc --noEmit` clean and `npx vitest run` fully
   green (143 tests pass today) before reporting DONE.

---

## Task 1: Localize shared domain vocabulary and relative-care dates

The cross-screen foundation. Every later task depends on it, so it goes first.

**`lib/care.ts` — `formatRelativeCare(daysUntil: number): string`** currently
returns English and is called from the home grid, the calendar and the plant
detail:

```ts
export function formatRelativeCare(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = Math.abs(daysUntil);
    return n === 1 ? '1 day overdue' : `${n} days overdue`;
  }
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  return `In ${daysUntil} days`;
}
```

It is a pure, unit-tested function and must stay pure — do not import React or
the `t()` hook into `lib/care.ts`. Instead have it return a descriptor the
caller translates:

```ts
export interface CareLabel {
  key: string;
  params?: Record<string, string | number>;
}

export function relativeCareLabel(daysUntil: number): CareLabel {
  if (daysUntil < 0) {
    const n = Math.abs(daysUntil);
    return n === 1
      ? { key: 'domain.care.overdueOne' }
      : { key: 'domain.care.overdueMany', params: { count: n } };
  }
  if (daysUntil === 0) return { key: 'domain.care.dueToday' };
  if (daysUntil === 1) return { key: 'domain.care.dueTomorrow' };
  return { key: 'domain.care.inDays', params: { count: daysUntil } };
}
```

Callers then do `t(label.key, label.params)`. Add a tiny helper so call sites
stay one-liners — put it in `lib/i18n/` (it needs `t`, so it does not belong in
`lib/care.ts`):

```ts
export function translateLabel(t: TFunction, label: CareLabel): string {
  return t(label.key, label.params);
}
```

Delete `formatRelativeCare` and update all three call sites, or keep it only if
something non-UI needs English — if nothing does, delete it rather than leave
a second unused code path.

**Domain label maps.** `lib/types.ts` exports four English `Record<enum, string>`
maps used across screens:

```ts
LIGHT_LABELS  = { low: 'Low light', medium: 'Medium', bright: 'Bright indirect', direct: 'Direct sun' }
POT_LABELS    = { small: 'Small pot', medium: 'Medium pot', large: 'Large pot' }
PET_LABELS    = { unknown: 'Pets: unknown', safe: 'Pet-safe', caution: 'Pets: caution', toxic: 'Toxic to pets' }
CARE_TYPE_LABELS = { water: 'Watered', fertilize: 'Fertilized', note: 'Note', photo: 'Photo', check: 'Soil check' }
```

Keep the enum keys (they are stored values — Constraint 2). Add catalog keys
`domain.light.low`, `domain.pot.small`, `domain.pet.safe`,
`domain.careType.water`, and `domain.category.Houseplant` … `domain.category.Other`
for all seven `PLANT_CATEGORIES`. Leave the existing English maps in place only
if a non-UI caller needs them; otherwise remove them so there is one source of
truth.

Add all four languages for every key. Update `lib/__tests__/care.test.ts` where
it asserts the old English return values — assert the returned key and params
instead. Add a test that every `PlantCategory`, `LightLevel`, `PotSize`,
`PetToxicity` and `CareLogType` value has a catalog key in all four languages,
so a future enum addition fails loudly instead of rendering a raw dotted key.

**Do not touch any screen in this task.** Screens come next.

---

## Task 2: Localize the Plants home screen

`app/(tabs)/index.tsx` (436 lines, 0 `t()` calls today). Every user-facing
string becomes a `plants.*` key, in all four languages.

Strings include: the "My Plants" title; the count/limit subtitle line (which
mixes plant count, free-limit and filter state — use placeholders, and split
into separate keys rather than concatenating fragments per Constraint 3); the
search placeholder "Search name, species, room…"; the `All` chip and the
`All rooms` chip; both empty states ("Your glasshouse is quiet" / "No matches"
with their body copy, and the "Clear filters" action); the "Add a plant" and
"Add your first plant" CTAs; the premium limit banner; and every
`accessibilityLabel` on the screen.

Category chip labels use the `domain.category.*` keys from Task 1 — the chip
shows the translated label while `setCategory` keeps storing the English value
(Constraint 2). This is the highest-risk spot in the task: the filter compares
against stored values, so translate the label only, never the comparison.

Room chips come from user data (`listRooms`) and stay verbatim — never
translate user content. `'All rooms'` is ours and gets a key.

---

## Task 3: Localize the Care calendar

`app/(tabs)/calendar.tsx` (426 lines, 0 `t()` calls today) → `calendar.*` keys.

Strings include: the "Care calendar" eyebrow and "Gentle reminders" title with
its subtitle; the philosophy card ("Check before water" and its body, which
interpolates `MOISTURE_SNOOZE_DAYS` — keep it a placeholder) and the collapsed
one-line variant for experienced users; the three section headings (Overdue /
Today / Upcoming) and each one's empty label ("You're all caught up", "No care
due today", "No upcoming care"); the action chips (Watered, Fertilized, Still
moist, Log, Details); the swipe labels (Watered / Fed); the toast strings
including the failure text "Could not save — try again" and the snooze toast
which interpolates the plant name and day count; the interval hints
("~every {n}d (light/pot-aware)", "every {n}d", "check soil first"); and the
row `accessibilityLabel`, which is assembled from several fragments today —
rebuild it as one key with placeholders (Constraint 3).

`WeekStrip`'s weekday letters come from `date-fns` `format()`. Localizing
date formatting is **out of scope** for this plan — leave `format()` calls
alone and note it as a follow-up.

Relative-care text uses Task 1's `relativeCareLabel`.

---

## Task 4: Localize Insights

`app/(tabs)/insights.tsx` (391 lines, 3 `t()` calls today) → `insights.*` keys.

Strings include: the title and the subtitle whose tail differs by premium state;
the four stat tile labels (Plants, Care logs, Streak, Overdue) and the
"Tap for care list" affordance; the "Activity (14 days)" card title and its
"Last 7 days: {a} · Last 30 days: {b}" line; the Breakdown card title, its four
stat labels (water, feed, notes, photos), the "Most active: {name} ({count} logs)"
line and "Due today: {count}"; the AI insight card (title, both body variants
for premium/free, the button labels "Generate insight" / "Thinking…" /
"Unlock Premium for AI", and the accessibility hints); and the empty state.

The category breakdown legend uses `domain.category.*` from Task 1.

Two `Alert.alert` calls ("No plants yet", "AI limit", "Insight failed") are
user-facing and get keys. The AI's *returned text* is model output and is not
translated here.

---

## Task 5: Localize the plant detail screen

`app/plant/[id].tsx` (977 lines, 7 `t()` calls today) → `detail.*` keys. The
largest screen; if it turns out to exceed one comfortable pass, say so in your
report rather than half-finishing it.

Strings include: the hero meta line ("{category} · {location} · {n}d with you" —
one key with placeholders, and the days-with-you fragment needs its own
one/many keys per Constraint 4); the profile chips (light, pot, pet — via Task
1's `domain.*` keys — plus the "~{n}d water rhythm" chip); the two due cards
(Water / Fertilize titles); the four action buttons (Watered, Still moist, Fed,
Note / photo); the three tab labels (Care log, Progress, AI assist); the care
log empty text; the AI assist panel (identify/care-guide copy, button labels,
the quota hint, the disclaimer); the delete confirmation `Alert` (title, body,
Cancel/Delete); every toast; and the header Edit/Delete buttons with their
accessibility labels.

Care log rows render `CARE_TYPE_LABELS` — use `domain.careType.*`.
Relative-care text uses `relativeCareLabel`. The plant's own name, species,
location and notes are user content and stay verbatim.

---

## Task 6: Localize the Add and Edit plant forms

`app/plant/add.tsx` (490 lines) and `app/plant/edit.tsx` (489 lines) → `form.*`
keys. They share most of their vocabulary, so they are one task: put the shared
labels under `form.*` and use them from both files rather than duplicating keys
per screen.

Strings include: every field label and placeholder (name, species, location/room,
notes, water interval, fertilize interval, acquired date); the category, light
level and pot size pickers (via `domain.*` from Task 1); the pet-toxicity picker;
the photo actions (take photo / choose from library / remove); the AI identify
button and its states; the save/cancel buttons; the "check before water" toggle
and its explanatory copy; and all validation messages — including the
name-required and minimum-length errors, and the `Alert`s on save failure.

Validation *logic* must not change. In particular `edit.tsx` only enforces the
minimum-name-length rule when the name actually changed (so legacy plants can
still be saved) — preserve that behaviour exactly; you are translating the
message, not the rule.

---

## Task 7: Localize Log care and the remaining shared components

`app/plant/log.tsx` (261 lines) → `log.*` keys: the screen title, the care-type
selector (via `domain.careType.*`), the note field label and placeholder, the
photo attach actions, the date/time field, the save button, and the failure
`Alert`.

Then sweep the shared components for hardcoded user-facing text:
`components/EmptyState.tsx` (its default body), `components/CloudSyncCard.tsx`,
`components/PhotoLightbox.tsx`, `components/SwipeToComplete.tsx`, and any
`Stack.Screen` `title`/`headerBackTitle` options in `app/_layout.tsx` and
`app/plant/_layout.tsx` not already using `nav.*` keys.

`components/PrimaryButton.tsx` and other purely presentational components take
their text as props — they need no keys, only their *callers* do.

---

## Task 8: Add a guard test and verify the whole app in a non-English language

Two deliverables.

**A guard test** (`lib/__tests__/i18nCoverage.test.ts`) that reads the screen
source files and fails on hardcoded user-facing strings, so this work cannot
silently rot. Scan `app/**/*.tsx` and the components touched above for
string literals passed to the props that render text — `title=`, `label=`,
`placeholder=`, `body=`, `accessibilityLabel=`, `accessibilityHint=`,
`actionLabel=` — and for bare text children of `<Text>`.

Getting the false-positive rate right matters more than catching everything.
The test must not flag: keys themselves, `style`/`testID`/`accessibilityRole`
values, icon names, and genuinely non-linguistic literals. Prefer a curated
allowlist of known-safe exceptions (each with a comment saying why) over a loose
regex that everyone learns to ignore. If a rule proves too noisy to be useful,
leave it out and say so in your report — a narrow test people trust beats a
broad one they disable.

**A verification pass.** Confirm `npx vitest run` and `npx tsc --noEmit` are
clean, then report the final key count per language and confirm all four
catalogs are equal in size. List anything deliberately left untranslated
(user content, `date-fns` formatting, AI model output) so the follow-up is
written down rather than forgotten.

## Out of scope

- Localized **date and number formatting** (`date-fns` locales, weekday letters
  in `WeekStrip`, `toLocaleString`). Real work, deserves its own plan.
- **RTL layout.** No RTL language ships today; adding one needs a layout audit.
- Adding new **languages** beyond the four already shipping.
- Translating **user content** (plant names, notes, rooms) or **AI output**.
- The marketing site under `web/` — separate surface, separate plan.
