/**
 * Pure i18n primitives — no React, no native modules, fully unit-testable.
 *
 * The catalog lives in ./translations. English is the source of truth: every
 * lookup falls back to English, then to the raw key, so a missing translation
 * degrades to readable text instead of a blank or a crash.
 */
import type { CareLabel } from '../care';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  translations,
  type LanguageCode,
} from './translations';

export type TranslateParams = Record<string, string | number>;

/** Shape of `useI18n().t` — a translate function bound to the active language. */
export type TFunction = (key: string, params?: TranslateParams) => string;

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

/** True when `code` is a language we actually ship a catalog for. */
export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_CODES as string[]).includes(code);
}

/**
 * Replace `{name}` placeholders with params. Unknown placeholders are left
 * intact (so a template typo is visible, not silently blanked), and a missing
 * param renders as empty rather than the literal `undefined`.
 */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in params)) return match;
    const value = params[key];
    return value == null ? '' : String(value);
  });
}

/**
 * Look up `key` for `language`, falling back to English and then to the key
 * itself, then interpolate any params.
 */
export function translate(
  language: LanguageCode,
  key: string,
  params?: TranslateParams
): string {
  const template =
    translations[language]?.[key] ??
    translations[DEFAULT_LANGUAGE][key] ??
    key;
  return interpolate(template, params);
}

/**
 * Choose the best language from an ordered list of BCP-47-ish candidates
 * (e.g. the device's `getLocales()` language tags/codes). Matches on the base
 * language subtag so "es-419"/"es-ES" both resolve to "es". Returns the
 * default language when nothing matches.
 */
export function resolveLanguage(candidates: Array<string | null | undefined>): LanguageCode {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.toLowerCase().split(/[-_]/)[0];
    if (isSupportedLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Render a `CareLabel` descriptor (from `relativeCareLabel` in `lib/care.ts`)
 * through a bound `t()`. Exists so call sites stay one-liners instead of
 * repeating `t(label.key, label.params)` everywhere.
 */
export function translateLabel(t: TFunction, label: CareLabel): string {
  return t(label.key, label.params);
}
