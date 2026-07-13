# Plan: Sync + Auth Hardening (v0.8.x)

Harden the just-shipped Apple/Google sign-in + automatic cloud sync so it is
production-safe. Three independent tasks, each with pure, fast unit tests.

## Context

- Repo: `verdant-plant-care` (Expo 57 / React Native). Tests: Vitest,
  `npm test`; typecheck `npm run typecheck`. Test files live in
  `lib/__tests__/*.test.ts` and `workers/verdant-ai/src/*.test.ts`.
- Cloud sync client: `lib/sync.ts` (pull→merge→push + photos), pure merge in
  `lib/syncMerge.ts`. Auth client: `lib/auth.ts` (exchanges a provider
  identity token at the Worker for a **deterministic** sync id, then calls
  `adoptSyncId`). Sync id + "uploaded photos" cache live in SecureStore /
  AsyncStorage; keys `verdant.sync.id` and `@verdant/sync_uploaded_photos`.
- `PlantContext.tsx` owns mutations; `scheduleAutoSync()` debounces a push 8s
  after any mutation, plus syncs on launch and foreground (5-min throttle).
  `CloudSyncCard.tsx` is the Settings UI.
- Storage helpers in `lib/storage.ts`: `savePlants/saveCareLogs/saveTombstones`
  and `loadTombstones` exist; `Tombstones = { plants: Record<string,string>;
  logs: Record<string,string> }`.

## Global Constraints

- **Determinism is the security invariant:** the Worker derives a sync id via
  HMAC(provider:subject), so the SAME account always yields the SAME sync id,
  and a DIFFERENT sync id always means a DIFFERENT account. Any "did the
  identity change?" decision MUST rely on this — compare sync ids, never
  emails or provider strings.
- **Never widen data exposure:** a fix must not cause one account's local
  data to be pushed into another account's cloud collection.
- New pure logic goes in its own `lib/*.ts` module and is unit-tested in
  `lib/__tests__/<module>.test.ts`. Do NOT add new SecureStore/AsyncStorage
  test mocks — keep the newly-tested logic pure so existing Vitest config
  (node env, no RN native mocks beyond the current aliases) runs it as-is.
- TypeScript strict: `npm run typecheck` must stay clean. `npm test` must
  stay green (currently 58 passing) and only grow.
- Do not touch the Worker (`workers/verdant-ai/`), the merge engine
  (`lib/syncMerge.ts`), or any screen other than what a task names.

## Task 1: Prevent cross-account data bleed on identity change

**Problem.** `adoptSyncId(newId)` (in `lib/sync.ts`) overwrites the stored
sync id and clears the uploaded-photos cache, but leaves local plants/logs on
device. When a second person signs in on the same device, the next auto-sync
merges the previous person's LOCAL plants into the NEW account's cloud
collection — a privacy leak. Because same account ⇒ same sync id, a new id
that differs from the stored one is provably a different account.

**Implement.**

1. New module `lib/syncIdentity.ts` exporting a pure function:
   ```ts
   /** True iff switching to newId means switching accounts (so local data
    *  from the previous account must be cleared before the first sync).
    *  A first-ever adopt (no previous id) returns false — the user's own
    *  offline-created data legitimately becomes their new cloud collection. */
   export function shouldResetLocalData(
     prevId: string | null | undefined,
     newId: string
   ): boolean
   ```
   Return `true` only when `prevId` is a non-empty string AND `prevId !== newId`.
   Normalize both by trimming + lowercasing before comparison (sync ids are
   lowercase hex).

2. In `lib/storage.ts`, add:
   ```ts
   /** Wipe the on-device collection (used when switching accounts). Settings
    *  are left intact. */
   export async function resetLocalCollection(): Promise<void>
   ```
   It clears plants, care logs, and tombstones — reuse existing
   `savePlants([])`, `saveCareLogs([])`, `saveTombstones({ plants: {}, logs: {} })`.

3. In `lib/sync.ts` `adoptSyncId(raw)`: after validating the id and BEFORE
   writing it to SecureStore, read the current stored id (`getSyncId()`), and
   if `shouldResetLocalData(current, id)` is true, `await resetLocalCollection()`.
   Keep the existing `AsyncStorage.removeItem(UPLOADED_KEY)`. Return the same
   `{ ok: true }` shape as today (no signature change).

**Tests** — `lib/__tests__/syncIdentity.test.ts`, covering `shouldResetLocalData`:
- first-ever adopt (`null` / `undefined` / `''` prev) → `false`
- same id (identical, and differing only by case/whitespace) → `false`
- genuinely different id → `true`

**Done when:** the three test cases pass, `npm test` green, typecheck clean.
Do NOT unit-test `adoptSyncId`/`resetLocalCollection` directly (they touch
SecureStore/AsyncStorage — out of scope for the pure-logic constraint); the
wiring is verified by the reviewer reading the diff.

## Task 2: Auto-sync backoff so failures don't hammer the network

**Problem.** `scheduleAutoSync()` fires a fixed 8s debounce and auto-sync on
launch/foreground; a failing sync (offline, 5xx) retriggers on every mutation
and every foreground with no cooldown. There is no surfaced status, so the UI
can't tell the user a sync failed.

**Implement.**

1. New module `lib/syncSchedule.ts` with a pure decision function:
   ```ts
   export type SyncSchedState = {
     now: number;          // ms epoch
     inFlight: boolean;
     lastFailureAt: number | null;  // ms epoch of last failed attempt, or null
     backoffMs: number;    // current backoff window
   };
   /** Whether an auto-sync attempt should proceed now. Blocks while a sync is
    *  in flight, and during the backoff window after a failure. */
   export function canAutoSyncNow(s: SyncSchedState): boolean
   /** Next backoff after a failure: doubles from BASE up to MAX. */
   export function nextBackoffMs(current: number): number
   export const AUTO_SYNC_BASE_BACKOFF_MS: number  // 60_000
   export const AUTO_SYNC_MAX_BACKOFF_MS: number   // 900_000
   ```
   `canAutoSyncNow`: false if `inFlight`; false if `lastFailureAt != null &&
   now - lastFailureAt < backoffMs`; otherwise true. `nextBackoffMs`: `Math.min(
   MAX, current > 0 ? current * 2 : BASE)`.

2. In `PlantContext.tsx`:
   - Add context fields `syncStatus: 'idle' | 'syncing' | 'error'` and
     `lastSyncError: string | null`; set `syncing`→`'syncing'`, success→
     `'idle'` + clear error, failure→`'error'` + store `result.reason`.
   - Track `lastFailureAt` and `backoffMs` in refs. In `syncNow`, on failure
     set `lastFailureAt = now` and `backoffMs = nextBackoffMs(backoffMs)`; on
     success reset both (`lastFailureAt = null`, `backoffMs = BASE`).
   - In the debounced `scheduleAutoSync` timer body AND the foreground/launch
     `maybeSync`, gate the actual `syncNow()` call behind `canAutoSyncNow(...)`.
     A user-initiated "Sync now" button press must BYPASS the backoff (only
     auto paths are gated).
   - Keep the existing `syncNow`/`setSyncEnabled`/`syncing` fields; add the new
     ones to both the value object and its dependency array.

**Tests** — `lib/__tests__/syncSchedule.test.ts`, covering `canAutoSyncNow`
(in-flight blocks; inside backoff blocks; past backoff allows; no prior
failure allows) and `nextBackoffMs` (0→BASE, BASE→2×, caps at MAX).

**Done when:** tests pass, `npm test` green, typecheck clean. Manual-press
sync must remain un-gated (call it out in the report so the reviewer checks).

## Task 3: Surface sync status in the Backup & sync card

**Problem.** With Task 2 exposing `syncStatus`/`lastSyncError`, the UI should
tell the user when a sync is running or failed, without alarming them (sync is
best-effort and auto-retries).

**Implement.**

1. New pure helper in `lib/syncSchedule.ts` (same module as Task 2, or a small
   `lib/syncStatus.ts` if cleaner — your call, keep it pure):
   ```ts
   export function syncStatusLabel(input: {
     status: 'idle' | 'syncing' | 'error';
     lastSyncError: string | null;
     lastSyncAt: string | null;  // ISO
   }): string
   ```
   - `'syncing'` → `'Syncing…'`
   - `'error'` → `'Couldn’t sync — will retry automatically.'`
   - `'idle'` + `lastSyncAt` → `'Last synced ' + <localized time>` (use
     `new Date(lastSyncAt).toLocaleString()`)
   - `'idle'` + no `lastSyncAt` → `'First sync pending.'`

2. In `components/CloudSyncCard.tsx`, when signed in, replace the current
   ad-hoc "Syncing…/Last synced/First sync pending" line with
   `syncStatusLabel(...)` fed from the context (`syncStatus`, `lastSyncError`,
   `settings.lastSyncAt`). Colour the error state with the existing danger/
   muted token — do not add a new colour. Everything else in the card stays.

**Tests** — `lib/__tests__/syncStatus.test.ts` (or extend
`syncSchedule.test.ts`): one assertion per branch of `syncStatusLabel`
(syncing, error, idle-with-time contains "Last synced", idle-without-time).

**Done when:** tests pass, `npm test` green, typecheck clean.
