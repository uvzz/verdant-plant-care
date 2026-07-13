import { describe, expect, it } from 'vitest';
import {
  AUTO_SYNC_BASE_BACKOFF_MS,
  AUTO_SYNC_MAX_BACKOFF_MS,
  canAutoSyncNow,
  nextBackoffMs,
  syncStatusLabel,
  type SyncSchedState,
} from '../syncSchedule';

function state(partial: Partial<SyncSchedState>): SyncSchedState {
  return {
    now: 1_000_000,
    inFlight: false,
    lastFailureAt: null,
    backoffMs: AUTO_SYNC_BASE_BACKOFF_MS,
    ...partial,
  };
}

describe('canAutoSyncNow', () => {
  it('blocks while a sync is in flight', () => {
    expect(canAutoSyncNow(state({ inFlight: true }))).toBe(false);
  });

  it('blocks inside the backoff window after a failure', () => {
    const s = state({
      lastFailureAt: 1_000_000,
      backoffMs: AUTO_SYNC_BASE_BACKOFF_MS,
      now: 1_000_000 + AUTO_SYNC_BASE_BACKOFF_MS - 1,
    });
    expect(canAutoSyncNow(s)).toBe(false);
  });

  it('allows once the backoff window has passed', () => {
    const s = state({
      lastFailureAt: 1_000_000,
      backoffMs: AUTO_SYNC_BASE_BACKOFF_MS,
      now: 1_000_000 + AUTO_SYNC_BASE_BACKOFF_MS,
    });
    expect(canAutoSyncNow(s)).toBe(true);
  });

  it('allows when there is no prior failure', () => {
    expect(canAutoSyncNow(state({ lastFailureAt: null }))).toBe(true);
  });
});

describe('nextBackoffMs', () => {
  it('goes from 0 to BASE', () => {
    expect(nextBackoffMs(0)).toBe(AUTO_SYNC_BASE_BACKOFF_MS);
  });

  it('doubles from BASE', () => {
    expect(nextBackoffMs(AUTO_SYNC_BASE_BACKOFF_MS)).toBe(
      AUTO_SYNC_BASE_BACKOFF_MS * 2
    );
  });

  it('caps at MAX', () => {
    expect(nextBackoffMs(AUTO_SYNC_MAX_BACKOFF_MS)).toBe(
      AUTO_SYNC_MAX_BACKOFF_MS
    );
    expect(nextBackoffMs(AUTO_SYNC_MAX_BACKOFF_MS * 4)).toBe(
      AUTO_SYNC_MAX_BACKOFF_MS
    );
  });
});

describe('syncStatusLabel', () => {
  it('shows a syncing message while a sync is in progress', () => {
    expect(
      syncStatusLabel({ status: 'syncing', lastSyncError: null, lastSyncAt: null })
    ).toBe('Syncing…');
  });

  it('shows an unalarming retry message on error', () => {
    expect(
      syncStatusLabel({
        status: 'error',
        lastSyncError: 'network request failed',
        lastSyncAt: null,
      })
    ).toBe('Couldn’t sync — will retry automatically.');
  });

  it('shows the last synced time when idle and a prior sync happened', () => {
    const label = syncStatusLabel({
      status: 'idle',
      lastSyncError: null,
      lastSyncAt: '2026-07-01T12:00:00.000Z',
    });
    expect(label).toContain('Last synced');
  });

  it('shows first-sync-pending when idle with no prior sync', () => {
    expect(
      syncStatusLabel({ status: 'idle', lastSyncError: null, lastSyncAt: null })
    ).toBe('First sync pending.');
  });
});
