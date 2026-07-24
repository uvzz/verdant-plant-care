# Task 7b report: Localize app/camera.tsx

Status: **DONE**

## Background

Task 7's report explicitly found `app/camera.tsx` fully hardcoded English and
recorded it as out of scope ("it's the size of a whole additional task...
Recording it here for a follow-up task/plan rather than fixing it now"). This
task closes that gap: full translation of the camera overlay screen,
including all 6 `accessibilityLabel`s and the known `` `Flash ${flash}` ``
raw-enum-leak defect.

## Files changed

- `app/camera.tsx` — string swaps only (added `useI18n` import + `const { t }
  = useI18n();`, replaced every hardcoded string/accessibilityLabel with
  `t(...)` calls). No `StyleSheet.create`, colour, or layout touched.
- `lib/i18n/translations.ts` — 20 new keys × 4 languages (80 entries): 3
  `domain.flash.*` + 17 `camera.*`.
- `lib/__tests__/i18n.test.ts` — new `cameraRawCallSites` seam table (3
  entries, one per flash branch) + a new `it('renders every raw t() call
  site in camera.tsx as real text', ...)` per language (4 new tests).
- `lib/billing.ts` — deleted the now-dead `PREMIUM_DISPLAY.yearlyLabel`
  field.

## Full new key list

### `domain.flash.*` (new domain-vocabulary group, 3 keys)

Screen-local `FlashMode` state (`'off' | 'on' | 'auto'`) — not persisted or
synced, but treated with the same Constraint-2 discipline as the app's
persisted enums (`domain.light.*`, `domain.pot.*`, etc.): the raw value stays
in `useState`/comparisons/the native `CameraView` prop, only the display
label is translated.

| Key | en | es | fr | de |
|---|---|---|---|---|
| `domain.flash.off` | Off | Apagado | Désactivé | Aus |
| `domain.flash.on` | On | Activado | Activé | An |
| `domain.flash.auto` | Auto | Automático | Automatique | Automatisch |

Not added to the `i18n.test.ts` "domain vocabulary coverage" `groups` array
(the fixed-array test keyed off `lib/types.ts`-exported enum arrays like
`LIGHT_LEVELS`/`POT_SIZES`) — there's no local `FLASH_MODES` export to hang
it on, and `domain.careAction.*` (an existing enum-shaped group) is already
absent from that array too, so this isn't a new precedent. Key-set +
placeholder parity across all four languages is still enforced by "catalog
integrity" (the always-on test), and correctness at every actual call site
is enforced by the new `cameraRawCallSites` seam-table entries (below).

### `camera.*` (17 keys)

| Key | en |
|---|---|
| `camera.permissionTitle` | Camera access |
| `camera.permissionBody` | Verdant needs the camera for plant portraits and progress photos. Photos stay on your device. |
| `camera.permissionAllow` | Allow camera |
| `camera.permissionDismiss` | Not now |
| `camera.closeA11y` | Close camera |
| `camera.titleLive` | Glasshouse camera |
| `camera.titleReview` | Review portrait |
| `camera.flashA11y` | Flash: {mode} |
| `camera.tip` | Fill the frame with a leaf or whole plant · bright, even light works best |
| `camera.retake` | Retake |
| `camera.retakeA11y` | Retake photo |
| `camera.usePhoto` | Use photo |
| `camera.usePhotoA11y` | Use this photo |
| `camera.flip` | Flip |
| `camera.flipA11y` | Flip camera |
| `camera.captureA11y` | Take photo |
| `camera.back` | Back |

es/fr/de translations are in `lib/i18n/translations.ts`. Notable
quality/vocabulary decisions:
- **French uses "appareil photo", never "caméra"**, for every string that
  names the device (`permissionTitle`, `permissionBody`, `permissionAllow`,
  `closeA11y`, `titleLive`, `flipA11y`) — matches `form.camera: 'Appareil
  photo'` already in the FR catalog and the standing correction noted in
  this task's brief. `camera.flip`'s visible button text ("Inverser") and
  `camera.captureA11y` ("Prendre une photo") don't name the device at all,
  so no risk there either way.
- **`camera.flashA11y` colon spacing follows the established French-
  typography convention** already present in this catalog
  (`insights.statA11yLabel`): en/es/de use `Flash: {mode}` (no space before
  the colon), fr uses `Flash : {mode}` (space before colon, matching
  `{label} : {value}` for the same key in French).
- **German prefers real words over anglicisms** where the catalog already
  does so elsewhere: `Kamera` (not "Camera"), `Blitz` (not "Flash", for
  the domain label) — mirrors the German-vocabulary fixes recorded in Task
  7's review addendum (`Backup & Synchronisierung` over `Backup & Sync`,
  etc.).
- Button/control labels kept short per the brief ("tight controls"):
  `Flip`/`Girar`/`Inverser`/`Wechseln`, `Back`/`Atrás`/`Retour`/`Zurück`,
  `Retake`/`Repetir`/`Reprendre`/`Wiederholen` — all roughly source length,
  no button wraps to a second line.

## Existing keys reused (not duplicated)

- **`settings.cancel`** — reused for the Back button's `accessibilityLabel`
  (the button's visible text is "Back"/`camera.back`, but its semantic
  action *is* cancel — same pattern as the rest of the app's "Cancel"
  buttons). This avoids adding a fourth byte-identical "Cancel" key
  (`settings.cancel`/`detail.cancel` already exist and are already
  byte-identical across all four languages) purely to attach it to a new
  accessibility label. `onCancel` (the handler this button calls) also
  drives the top-bar "Close camera" button, but that one's label is
  semantically distinct ("close" vs "cancel"), so it kept its own
  `camera.closeA11y` key rather than also reusing `settings.cancel`.
- **Checked but not reused**: `form.library`/`form.camera` ("Library"/
  "Camera" photo-source button pair) and `form.photoPermissionTitle`/
  `form.photoPermissionBody` (the photo-*library* permission Alert used by
  add/edit/log.tsx). Neither applies here — `camera.tsx` has no
  Library/Camera picker of its own (it *is* the destination the "Camera"
  button navigates to), and its permission-denied UI is a full in-screen
  view with different copy for a different system permission (camera, not
  photo library), not a native `Alert.alert`. Reusing either would have
  been a false-cognate collision, not a legitimate dedup.

## The `Flash ${flash}` fix

**Before** (line ~270, the defect this task exists to fix):
```tsx
accessibilityLabel={`Flash ${flash}`}
```
This both (a) built a sentence via string concatenation (Constraint 3) and
(b) spliced the *raw stored* `FlashMode` value straight into the UI, so a
screen reader announced literally "Flash auto" / "Flash on" / "Flash off" —
the enum leaking through untranslated regardless of app language.

**After**:
```tsx
accessibilityLabel={t('camera.flashA11y', { mode: t(`domain.flash.${flash}`) })}
```
Two-step translation, matching the app's established `{alreadyTranslated}`
placeholder-composition pattern (e.g. `log.saveButton`'s `{careType}`,
`form.aiHintResult`'s `{confidence}/{light}/{pets}`):
1. `flash` (raw state, `'off' | 'on' | 'auto'`) is looked up against the new
   `domain.flash.*` group to get the *translated* mode word.
2. That translated word is interpolated into `camera.flashA11y`'s `{mode}`
   placeholder — never concatenated as a raw JS template literal.

The `flash` variable itself, its `useState<FlashMode>` type, the cycling
logic (`f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'`), and the
`<CameraView flash={flash} .../>` prop are **all untouched** — confirmed by
re-reading the full diff: no line other than the `accessibilityLabel` prop
changed in that block. `facing`/`setFacing`/`<CameraView facing={facing}
.../>` were never touched at all (the "Flip camera" button's visible text
and accessibility label are both fixed strings, not derived from the
`facing` value).

## Interpolated-key seam coverage

`camera.flashA11y` is the **only** interpolated key this task added (every
other new `camera.*`/`domain.flash.*` key is a plain lookup, covered by the
always-on catalog-integrity tests). Added to `lib/__tests__/i18n.test.ts`:

```ts
const cameraRawCallSites: Array<{ key: string; params: TranslateParams }> = [
  { key: 'camera.flashA11y', params: { mode: 'Off' } },
  { key: 'camera.flashA11y', params: { mode: 'On' } },
  { key: 'camera.flashA11y', params: { mode: 'Auto' } },
];
```

plus a new per-language `it('renders every raw t() call site in camera.tsx
as real text', ...)` block that runs each entry through real `translate()`
for en/es/fr/de and asserts the result is neither the raw key nor contains
`{`. All three `FlashMode` branches are covered individually (not a
one/many pair, so there's no zero-param branch to add here — unlike
`form.waterRhythmHintOne`/`settings.syncLinkedBodyOne`, which do get a
`params: {}` entry per that established convention).

## `date-fns` `format()` calls

None. `app/camera.tsx` does not call `date-fns` (or any date formatting) at
all — nothing to list for Constraint 9.

## `PREMIUM_DISPLAY.yearlyLabel` outcome

**Deleted.** Grepped every file under `app/`, `lib/`, `components/` for
`PREMIUM_DISPLAY.yearlyLabel` and `yearlyLabel` — the only remaining hits
were two stale code *comments* (`lib/__tests__/i18n.test.ts:416`,
`lib/i18n/translations.ts:113`) describing the template-literal bug Task 7's
review addendum already fixed by introducing `settings.buyYearlyCta`; there
is no live call site left. Removed the field from `lib/billing.ts`:

```diff
 export const PREMIUM_DISPLAY = {
-  yearlyLabel: 'Premium · yearly',
   yearlyPriceHint: '$29.99/year',
   lifetimeLabel: 'Premium · lifetime',
   lifetimePriceHint: '$59.99 once',
 } as const;
```

**Correction (added during the Task 7b review-fix pass — see the report
appended at the end of this file): the line below was wrong.**
`yearlyPriceHint`/`lifetimePriceHint` are still referenced (`app/paywall.tsx`,
`app/(tabs)/settings.tsx`) and were left untouched per the brief, but
`lifetimeLabel` was **not** still referenced — its only hit anywhere in the
repo was its own declaration. That's exactly what the very next paragraph
below already said; this line contradicted it. `lib/__tests__/billing.test.ts`
(4 tests) doesn't reference `yearlyLabel` or `lifetimeLabel` at all and still
passes unchanged.

**Aside, out of this task's scope**: `PREMIUM_DISPLAY.lifetimeLabel` also
appears to have zero live call sites (only its own declaration matched a
grep across `app/`, `lib/`, `components/`). The brief named only
`yearlyLabel` for removal, and this predates Task 7b's changes (not
something this task's localization work caused), so it was left in place
rather than pulled into scope here. Worth a follow-up look.
**Update: this follow-up landed in the Task 7b review-fix pass — see the
report appended at the end of this file. `lifetimeLabel` is now deleted.**

## Verification

`npx tsc --noEmit` — clean, no errors.

`npx vitest run`:
```
 Test Files  21 passed (21)
      Tests  251 passed (251)
```
Up from 247 before this task (+4: 1 new `cameraRawCallSites` `it` block ×
4 languages, mirroring the existing `logRawCallSites`/`settingsRawCallSites`
single-table pattern).

Confirmed via direct import that `lib/i18n/translations.ts`'s English
catalog has exactly 20 new top-level keys under `camera.*`/`domain.flash.*`
(3 `domain.flash.*` + 17 `camera.*`), and `es`/`fr`/`de` each define exactly
the same 20 keys (enforced by the "catalog integrity" key-set-parity test,
which is part of the 251 passing).

## Commit

Committed on `feat/complete-localization`.

---

# Task 7b review-fix report

Status: **DONE**

Five items from the Task 7b code review, applied on `feat/complete-localization`.

## 1. `domain.flash.*` composed-key seam gap (Important)

`app/camera.tsx:273`'s `accessibilityLabel={t('camera.flashA11y', { mode: t(\`domain.flash.${flash}\`) })}`
makes an inner composed-key `t()` call that no test ever actually executed —
`cameraRawCallSites` in `lib/__tests__/i18n.test.ts` only covered the outer
call with a hardcoded English literal (`mode: 'Off'`), and `domain.flash`
was missing from the `domain vocabulary coverage` `groups` array. Since
`t()` is typed `(key: string, …)`, TypeScript gives no protection on a
composed key either.

Fixed both gaps:
- Added a module-level `FLASH_MODES = ['off', 'on', 'auto'] as const` (no
  existing exported constant to reuse — it's screen-local `FlashMode`
  state, not a `lib/types.ts` enum).
- Added `{ prefix: 'domain.flash', values: FLASH_MODES }` to the `domain
  vocabulary coverage` `groups` array.
- Added a new per-language test, `renders every camera flash-mode a11y
  label as real text`, that composes the key exactly as the screen does
  (`translate(code, 'camera.flashA11y', { mode: translate(code,
  \`domain.flash.${mode}\`) })`) for all three flash modes, and asserts the
  result contains neither `'domain.flash'` nor `'{'`.

**Deliberate-rename verification (what I actually saw):** temporarily
renamed `domain.flash.*` → `domain.flashMode.*` for all three keys in all
four language blocks in `lib/i18n/translations.ts` (a real rename would
touch every language to preserve parity, so this is the realistic failure
mode, not a single-language typo). Ran the full suite:
- **New test failed as intended**, once per language (4 failures) — e.g.
  `AssertionError: es off: expected 'Flash: domain.flash.off' not to
  contain 'domain.flash'`, and likewise for en/fr/de (`Blitz:
  domain.flash.off`, etc.).
- The `domain vocabulary coverage` test **also failed** (now that
  `domain.flash` is in its `groups` array) — a second, independent signal
  catching the same rename.
- `catalog integrity` (key-set parity) stayed green, as the review predicted
  — all four languages still agreed with each other.
- `npx tsc --noEmit` stayed clean — no type error on the composed key, as
  the review predicted.
- All 251 pre-existing tests stayed green; only the two flash-related test
  groups (5 assertions total: 4 new + 1 existing) failed.
Reverted the rename (`git checkout -- lib/i18n/translations.ts`) and
re-ran — back to fully green. The test catches the exact bug it targets.

## 2. German/French `camera.retake` overflow (Important)

`styles.secondaryCtl` is a fixed `width: 72` with no `numberOfLines`, and
`Wiederholen`/`Reprendre` overflow/near-overflow it per the review's TTF
measurements. Changed only the two catalog values, `camera.retakeA11y` left
untouched in both languages (accessibility strings have no width
constraint):
- `lib/i18n/translations.ts`: de `camera.retake` `'Wiederholen'` →
  `'Erneut'`; fr `camera.retake` `'Reprendre'` → `'Refaire'`.

## 3. Back button label-in-name violation (Minor)

`app/camera.tsx:397` set the Back button's `accessibilityLabel` to
`t('settings.cancel')` while its visible text is `t('camera.back')` —
violates WCAG 2.5.3 (a voice-control user saying "tap Zurück" wouldn't
match "Abbrechen"). Changed the one prop:
`accessibilityLabel={t('camera.back')}`. This also drops the cross-screen
`settings.cancel` coupling the original Task 7b report called out.

## 4. Spanish `camera.flip` wording (Minor)

`'Girar'` means rotate; the control switches front/rear cameras, not
rotates. Spanish platform convention is *Cambiar cámara* (French/German
already used "switch"/"change" wording). Changed:
`lib/i18n/translations.ts` es `camera.flip` `'Girar'` → `'Cambiar'`;
`camera.flipA11y` `'Girar cámara'` → `'Cambiar cámara'`.

## 5. Dead `PREMIUM_DISPLAY.lifetimeLabel` (Minor)

Grepped the whole repo (excluding `node_modules`) for `lifetimeLabel` before
touching anything — the only hit was its own declaration at
`lib/billing.ts:38`. Deleted it from `lib/billing.ts`; left
`yearlyPriceHint`/`lifetimePriceHint` and the rest of `PREMIUM_DISPLAY`
untouched. This also fixes a factual error in the report above this one
(now corrected inline): it claimed `lifetimeLabel` was "still referenced,"
which contradicted the report's own aside a few lines later that it had
zero live call sites.

## Constraints honored

- All four languages (en/es/fr/de) still have exact key-set parity with
  identical placeholders per key — enforced by `catalog integrity`, still
  passing. No keys were added or removed, only five existing string values
  changed (de/fr `camera.retake`, es `camera.flip`/`camera.flipA11y`) plus
  one deletion from a plain TS object (`lifetimeLabel`, not part of the
  i18n catalog).
- `StyleSheet.create`, colours, and layout in `app/camera.tsx` untouched —
  confirmed via `git diff app/camera.tsx`: the only changed line is the
  `accessibilityLabel` prop in item 3.
- No existing test was weakened — the `i18n.test.ts` diff is purely
  additive (one new module-level constant, one new `groups` entry, one new
  per-language `it` block); every pre-existing assertion is untouched.

## Verification

```
npx vitest run
```
```
 Test Files  21 passed (21)
      Tests  255 passed (255)
```
Up from 251 before this pass (+4: the new per-language flash-mode a11y
test, one per language — mirrors the existing per-language test-count
pattern in this file).

```
npx tsc --noEmit
```
Clean, no output, exit 0.

## Files changed

- `app/camera.tsx` — 1 line (`accessibilityLabel` on the Back button).
- `lib/i18n/translations.ts` — 5 string-value edits (de/fr `camera.retake`;
  es `camera.flip`/`camera.flipA11y`), no key additions/removals.
- `lib/billing.ts` — 1 line deleted (`lifetimeLabel`).
- `lib/__tests__/i18n.test.ts` — additive only: 1 module-level constant, 1
  `groups` array entry, 1 new per-language `it` block.
- `.superpowers/sdd/task-7b-report.md` — corrected the `lifetimeLabel`
  factual error in the original report; this report appended.

## Commit

Committed on `feat/complete-localization`.
