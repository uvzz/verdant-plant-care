/**
 * Pure auto-sync scheduling decisions. Keeps a failing sync (offline, 5xx)
 * from retriggering on every mutation/foreground with no cooldown — backoff
 * doubles after each failure, capped, and resets on the next success.
 *
 * Only gates AUTOMATIC sync paths (debounced timer, foreground/launch). A
 * user-initiated "Sync now" press must bypass this and call syncNow directly.
 */

export type SyncSchedState = {
  now: number; // ms epoch
  inFlight: boolean;
  lastFailureAt: number | null; // ms epoch of last failed attempt, or null
  backoffMs: number; // current backoff window
};

export const AUTO_SYNC_BASE_BACKOFF_MS = 60_000;
export const AUTO_SYNC_MAX_BACKOFF_MS = 900_000;

/**
 * Whether an auto-sync attempt should proceed now. Blocks while a sync is
 * in flight, and during the backoff window after a failure.
 */
export function canAutoSyncNow(s: SyncSchedState): boolean {
  if (s.inFlight) return false;
  if (s.lastFailureAt != null && s.now - s.lastFailureAt < s.backoffMs) {
    return false;
  }
  return true;
}

/** Next backoff after a failure: doubles from BASE up to MAX. */
export function nextBackoffMs(current: number): number {
  return Math.min(
    AUTO_SYNC_MAX_BACKOFF_MS,
    current > 0 ? current * 2 : AUTO_SYNC_BASE_BACKOFF_MS
  );
}

/**
 * Human-readable status line for the Backup & sync card. Errors stay
 * unalarming — sync is best-effort and auto-retries in the background.
 */
export function syncStatusLabel(input: {
  status: 'idle' | 'syncing' | 'error';
  lastSyncError: string | null;
  lastSyncAt: string | null; // ISO
}): string {
  if (input.status === 'syncing') return 'Syncing…';
  if (input.status === 'error') return 'Couldn’t sync — will retry automatically.';
  if (input.lastSyncAt) return `Last synced ${new Date(input.lastSyncAt).toLocaleString()}`;
  return 'First sync pending.';
}
