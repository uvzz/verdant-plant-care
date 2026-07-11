import { describe, expect, it } from 'vitest';
import {
  normalizeCategory,
  normalizeLight,
  normalizePetToxicity,
  parseJsonLoose,
} from '../aiParse';

describe('normalizeCategory', () => {
  it('maps known and fuzzy categories', () => {
    expect(normalizeCategory('Orchid')).toBe('Orchid');
    expect(normalizeCategory('aroid')).toBe('Houseplant');
    expect(normalizeCategory('???')).toBe('Other');
  });
});

describe('normalizeLight', () => {
  it('accepts enum and phrases', () => {
    expect(normalizeLight('bright')).toBe('bright');
    expect(normalizeLight('full sun / direct')).toBe('direct');
    expect(normalizeLight('deep shade')).toBe('low');
    expect(normalizeLight(undefined)).toBe('medium');
  });
});

describe('normalizePetToxicity', () => {
  it('maps toxicity language', () => {
    expect(normalizePetToxicity('safe')).toBe('safe');
    expect(normalizePetToxicity('toxic to cats')).toBe('toxic');
    expect(normalizePetToxicity('mild irritation')).toBe('caution');
    expect(normalizePetToxicity('')).toBe('unknown');
  });
});

describe('parseJsonLoose', () => {
  it('strips markdown fences', () => {
    const raw = '```json\n{"a":1}\n```';
    expect(parseJsonLoose<{ a: number }>(raw)).toEqual({ a: 1 });
  });
});
