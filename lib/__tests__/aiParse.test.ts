import { describe, expect, it } from 'vitest';
import {
  normalizeCategory,
  normalizeCommonName,
  normalizeLight,
  normalizePetToxicity,
  parseJsonLoose,
} from '../aiParse';

describe('normalizeCommonName', () => {
  it('keeps real names', () => {
    expect(normalizeCommonName('Monstera deliciosa')).toBe('Monstera deliciosa');
    expect(normalizeCommonName('  Ivy ')).toBe('Ivy');
    expect(normalizeCommonName('"Snake Plant"')).toBe('Snake Plant');
  });

  it('keeps non-Latin names, including 2-char CJK', () => {
    expect(normalizeCommonName('モンステラ')).toBe('モンステラ');
    expect(normalizeCommonName('Фикус Бенджамина')).toBe('Фикус Бенджамина');
    expect(normalizeCommonName('Échevéria élégante')).toBe('Échevéria élégante');
    expect(normalizeCommonName('芦荟')).toBe('芦荟');
  });

  it('rejects truncated fragments like "As"', () => {
    expect(normalizeCommonName('As')).toBe('Mystery plant');
    expect(normalizeCommonName('a')).toBe('Mystery plant');
    expect(normalizeCommonName('')).toBe('Mystery plant');
    expect(normalizeCommonName(undefined)).toBe('Mystery plant');
  });

  it('rejects placeholders and symbol-only strings', () => {
    expect(normalizeCommonName('unknown')).toBe('Mystery plant');
    expect(normalizeCommonName('Unknown.')).toBe('Mystery plant');
    expect(normalizeCommonName('Unknown plant')).toBe('Mystery plant');
    expect(normalizeCommonName('Unidentified species')).toBe('Mystery plant');
    expect(normalizeCommonName('Not sure')).toBe('Mystery plant');
    expect(normalizeCommonName('N/A')).toBe('Mystery plant');
    expect(normalizeCommonName('N/A.')).toBe('Mystery plant');
    expect(normalizeCommonName('???')).toBe('Mystery plant');
    expect(normalizeCommonName('123')).toBe('Mystery plant');
  });

  it('collapses whitespace and caps length', () => {
    expect(normalizeCommonName('Golden   \n Pothos')).toBe('Golden Pothos');
    expect(normalizeCommonName('x'.repeat(200))).toHaveLength(80);
  });
});

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
