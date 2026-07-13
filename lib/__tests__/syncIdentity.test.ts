import { describe, expect, it } from 'vitest';
import { shouldResetLocalData } from '../syncIdentity';

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
