/**
 * App-facing i18n: an I18nProvider that resolves the active language and a
 * `useI18n()` hook exposing `t()` plus the language controls.
 *
 * Language resolution order:
 *   1. A language the user explicitly picked (persisted in AsyncStorage).
 *   2. Otherwise the device language (via expo-localization), if supported.
 *   3. Otherwise English.
 *
 * The initial render uses the device language synchronously (getLocales() is
 * sync), so there is no English flash before hydration for device-matched
 * users; the persisted override is applied on mount.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isSupportedLanguage, resolveLanguage, translate, type TranslateParams } from './core';
import {
  SUPPORTED_LANGUAGES,
  type LanguageCode,
  type LanguageMeta,
} from './translations';

export type { LanguageCode, LanguageMeta } from './translations';
export { SUPPORTED_LANGUAGES } from './translations';

const STORAGE_KEY = '@verdant/language';

/** Ordered language candidates from the device, most-preferred first. */
function deviceLanguageCandidates(): string[] {
  try {
    return getLocales().flatMap(
      (l: { languageCode: string | null; languageTag: string }) =>
        [l.languageCode, l.languageTag].filter(Boolean) as string[]
    );
  } catch {
    return [];
  }
}

interface I18nContextValue {
  /** Translate a key, interpolating any `{name}` params. */
  t: (key: string, params?: TranslateParams) => string;
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  languages: LanguageMeta[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() =>
    resolveLanguage(deviceLanguageCandidates())
  );

  // Apply a previously saved choice once storage is read. A user who never
  // picked a language keeps following the device language.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && saved && isSupportedLanguage(saved)) {
          setLanguageState(saved);
        }
      } catch {
        // Storage unreadable — device-language default already applied.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    setLanguageState(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Persist failed — the in-memory choice still holds for this session.
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TranslateParams) => translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({ t, language, setLanguage, languages: SUPPORTED_LANGUAGES }),
    [t, language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
