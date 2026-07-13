import { describe, expect, it } from 'vitest';
import { shouldResetLocalData, shouldResetOnAdopt } from '../syncIdentity';

describe('shouldResetLocalData', () => {
  it('is false on first-ever adopt (no previous id)', () => {
    expect(shouldResetLocalData(null, 'abc123')).toBe(false);
    expect(shouldResetLocalData(undefined, 'abc123')).toBe(false);
    expect(shouldResetLocalData('', 'abc123')).toBe(false);
  });

  it('is false when the id is unchanged', () => {
    expect(shouldResetLocalData('abc123', 'abc123')).toBe(false);
  });

  it('is false when the id only differs by case or whitespace', () => {
    expect(shouldResetLocalData('ABC123', 'abc123')).toBe(false);
    expect(shouldResetLocalData('  abc123  ', 'abc123')).toBe(false);
    expect(shouldResetLocalData('abc123', '  ABC123  ')).toBe(false);
  });

  it('is true when switching to a genuinely different id', () => {
    expect(shouldResetLocalData('abc123', 'def456')).toBe(true);
  });
});

describe('shouldResetOnAdopt', () => {
  it('is always false when the previous id was never adopted (even if ids differ)', () => {
    // A device-generated (never-adopted) id is the user's own offline
    // collection — first sign-in must keep it, not wipe unsynced data.
    expect(shouldResetOnAdopt('abc123', 'def456', false)).toBe(false);
    expect(shouldResetOnAdopt('abc123', 'abc123', false)).toBe(false);
    expect(shouldResetOnAdopt(null, 'def456', false)).toBe(false);
  });

  it('is true when a previously-adopted account switches to a different id', () => {
    expect(shouldResetOnAdopt('abc123', 'def456', true)).toBe(true);
  });

  it('is false when a previously-adopted id is unchanged', () => {
    expect(shouldResetOnAdopt('abc123', 'abc123', true)).toBe(false);
  });

  it('is false when the previous id is null/empty even if adopted', () => {
    expect(shouldResetOnAdopt(null, 'def456', true)).toBe(false);
    expect(shouldResetOnAdopt(undefined, 'def456', true)).toBe(false);
    expect(shouldResetOnAdopt('', 'def456', true)).toBe(false);
  });
});
