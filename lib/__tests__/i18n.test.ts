import { describe, expect, it } from 'vitest';
import {
  interpolate,
  isSupportedLanguage,
  resolveLanguage,
  translate,
} from '../i18n/core';
import { SUPPORTED_LANGUAGES, translations } from '../i18n/translations';

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
