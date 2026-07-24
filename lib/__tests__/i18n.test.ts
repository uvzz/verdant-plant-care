import { describe, expect, it } from 'vitest';
import { relativeCareLabel } from '../care';
import {
  interpolate,
  isSupportedLanguage,
  resolveLanguage,
  translate,
  translateLabel,
} from '../i18n/core';
import { SUPPORTED_LANGUAGES, translations } from '../i18n/translations';
import { plantsSubtitleLabel } from '../plantsSubtitle';
import {
  CARE_LOG_TYPES,
  LIGHT_LEVELS,
  PET_TOXICITY,
  PLANT_CATEGORIES,
  POT_SIZES,
} from '../types';

describe('interpolate', () => {
  it('fills known placeholders', () => {
    expect(interpolate('{count} of {limit}', { count: 2, limit: 5 })).toBe('2 of 5');
  });

  it('leaves unmatched placeholders intact so typos are visible', () => {
    // {place} has no matching param — it must survive, not blank out.
    expect(interpolate('Hi {name} from {place}', { name: 'Fern' })).toBe(
      'Hi Fern from {place}'
    );
  });

  it('renders a null/undefined param as empty, never the literal word', () => {
    expect(interpolate('v{version}', { version: undefined as never })).toBe('v');
  });

  it('is a no-op without params', () => {
    expect(interpolate('plain text')).toBe('plain text');
  });
});

describe('translate', () => {
  it('returns the requested language string', () => {
    expect(translate('es', 'tabs.plants')).toBe('Plantas');
    expect(translate('fr', 'tabs.settings')).toBe('Réglages');
    expect(translate('de', 'nav.addPlant')).toBe('Pflanze hinzufügen');
  });

  it('interpolates params', () => {
    expect(translate('en', 'settings.valueUpTo', { limit: 5 })).toBe('Up to 5');
  });

  it('falls back to English when a language lacks a key', () => {
    // 'en' is the source of truth; a bogus language resolves through English.
    expect(translate('es', '__missing_key_only_in_en__')).toBe(
      '__missing_key_only_in_en__'
    );
  });

  it('falls back to the raw key when no catalog has it', () => {
    expect(translate('en', 'totally.unknown.key')).toBe('totally.unknown.key');
  });
});

describe('resolveLanguage', () => {
  it('matches the base subtag of a regional tag', () => {
    expect(resolveLanguage(['es-419'])).toBe('es');
    expect(resolveLanguage(['fr-CA'])).toBe('fr');
  });

  it('prefers the first supported candidate', () => {
    expect(resolveLanguage(['pt-BR', 'de-DE', 'en'])).toBe('de');
  });

  it('ignores nullish entries', () => {
    expect(resolveLanguage([null, undefined, 'en-US'])).toBe('en');
  });

  it('defaults to English when nothing is supported', () => {
    expect(resolveLanguage(['pt', 'ja', 'zh'])).toBe('en');
    expect(resolveLanguage([])).toBe('en');
  });
});

describe('isSupportedLanguage', () => {
  it('recognizes shipped languages and rejects others', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('de')).toBe(true);
    expect(isSupportedLanguage('pt')).toBe(false);
  });
});

describe('catalog integrity', () => {
  const englishKeys = Object.keys(translations.en).sort();

  it('every language defines exactly the English key set', () => {
    for (const { code } of SUPPORTED_LANGUAGES) {
      expect(Object.keys(translations[code]).sort()).toEqual(englishKeys);
    }
  });

  it('every language keeps the same placeholders per key', () => {
    const placeholders = (s: string) =>
      (s.match(/\{(\w+)\}/g) ?? []).sort().join(',');
    for (const { code } of SUPPORTED_LANGUAGES) {
      for (const key of englishKeys) {
        expect(placeholders(translations[code][key])).toBe(
          placeholders(translations.en[key])
        );
      }
    }
  });
});

describe('translateLabel', () => {
  it('translates a CareLabel with no params', () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      translate('en', key, params);
    expect(translateLabel(t, { key: 'domain.care.dueToday' })).toBe('Due today');
  });

  it('translates a CareLabel with params', () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      translate('de', key, params);
    expect(
      translateLabel(t, { key: 'domain.care.inDays', params: { count: 4 } })
    ).toBe('In 4 Tagen');
  });
});

describe('domain vocabulary coverage', () => {
  // Every stored enum value must resolve to a real catalog key in every
  // language — otherwise a screen renders a raw dotted key like
  // "domain.light.low" instead of falling back gracefully. Also guards
  // against a future enum addition (e.g. a new PlantCategory) shipping
  // without translations.
  const groups: Array<{ prefix: string; values: readonly string[] }> = [
    { prefix: 'domain.category', values: PLANT_CATEGORIES },
    { prefix: 'domain.light', values: LIGHT_LEVELS },
    { prefix: 'domain.pot', values: POT_SIZES },
    { prefix: 'domain.pet', values: PET_TOXICITY },
    { prefix: 'domain.careType', values: CARE_LOG_TYPES },
  ];

  it('every enum value has a catalog key in every shipped language', () => {
    for (const { code } of SUPPORTED_LANGUAGES) {
      for (const { prefix, values } of groups) {
        for (const value of values) {
          const key = `${prefix}.${value}`;
          expect(translations[code][key], `${code} is missing ${key}`).toBeDefined();
        }
      }
    }
  });
});

describe('catalog seam — label descriptors always render as real text', () => {
  // `plantsSubtitleLabel` and `relativeCareLabel` return `{ key, params? }`
  // descriptors, and `plantsSubtitle.test.ts` / `care.test.ts` only assert
  // those descriptors against literal object expectations — neither imports
  // the catalog. That leaves a gap: a typo'd key, or a param name that
  // doesn't match the catalog's placeholder, would still satisfy those
  // tests but ship a raw dotted key (e.g. "plants.subtitleFreOne") or an
  // unfilled placeholder (e.g. "showing {shown}") on screen. The
  // catalog-integrity tests above can't catch this either, since a typo'd
  // key present in all four languages still has parity. These tests close
  // that seam by actually running the descriptors through `translate()`.

  // One state per whole-sentence subtitle key — mirrors the branch inputs
  // in plantsSubtitle.test.ts so all 8 catalog keys are exercised.
  const subtitleStates: Array<Parameters<typeof plantsSubtitleLabel>[0]> = [
    { count: 1, shown: 1, isPremium: false, freeLimit: 5 }, // subtitleFreeOne
    { count: 3, shown: 3, isPremium: false, freeLimit: 5 }, // subtitleFreeMany
    { count: 1, shown: 1, isPremium: true, freeLimit: 5 }, // subtitlePremiumOne
    { count: 8, shown: 8, isPremium: true, freeLimit: 5 }, // subtitlePremiumMany
    { count: 1, shown: 0, isPremium: false, freeLimit: 5 }, // subtitleFreeFilteredOne
    { count: 6, shown: 2, isPremium: false, freeLimit: 5 }, // subtitleFreeFilteredMany
    { count: 1, shown: 0, isPremium: true, freeLimit: 5 }, // subtitlePremiumFilteredOne
    { count: 8, shown: 4, isPremium: true, freeLimit: 5 }, // subtitlePremiumFilteredMany
  ];

  // negative-one, negative-many, zero, one, many
  const careDaysUntil = [-1, -5, 0, 1, 5];

  for (const { code } of SUPPORTED_LANGUAGES) {
    describe(code, () => {
      it('renders every plantsSubtitleLabel branch as real text', () => {
        for (const state of subtitleStates) {
          const label = plantsSubtitleLabel(state);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every relativeCareLabel branch as real text', () => {
        for (const daysUntil of careDaysUntil) {
          const label = relativeCareLabel(daysUntil);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });
    });
  }
});
