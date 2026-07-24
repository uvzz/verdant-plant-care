import { describe, expect, it } from 'vitest';
import { relativeCareLabel } from '../care';
import { careVerbLabel, intervalHintLabel, rowMetaLabel } from '../calendarLabels';
import { heroMetaLabel, plantAgeLabel } from '../detailLabels';
import {
  interpolate,
  isSupportedLanguage,
  resolveLanguage,
  translate,
  translateLabel,
  type TranslateParams,
} from '../i18n/core';
import { SUPPORTED_LANGUAGES, translations } from '../i18n/translations';
import { mostActiveLabel } from '../insightsLabels';
import { plantsSubtitleLabel } from '../plantsSubtitle';
import {
  AI_CONFIDENCE_LEVELS,
  AI_URGENCY_LEVELS,
  CARE_LOG_TYPES,
  LIGHT_LEVELS,
  MOISTURE_SNOOZE_DAYS,
  PET_TOXICITY,
  PLANT_CATEGORIES,
  POT_SIZES,
  normalizePlant,
  type CareDueItem,
  type Plant,
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
    // Added for Task 5 (plant detail screen) — Plant.aiIdentityConfidence
    // and CareCoachResult['urgency']/StoredCoachEntry['urgency'] are also
    // persisted, displayed values (Constraint 2).
    { prefix: 'domain.confidence', values: AI_CONFIDENCE_LEVELS },
    { prefix: 'domain.urgency', values: AI_URGENCY_LEVELS },
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

  // one/many boundary + a larger count, mirroring careDaysUntil's shape —
  // exercises `mostActiveLabel` (lib/insightsLabels.ts), the Insights
  // screen's one/many "Most active: {name} (…)" breakdown line.
  const mostActiveCounts = [1, 2, 12];

  // `careVerbLabel` and `intervalHintLabel` (lib/calendarLabels.ts) are the
  // same kind of pure branch-selecting descriptor, added for the Care
  // calendar screen — cover them here too so a typo'd key or mismatched
  // placeholder can't ship unnoticed.
  function testPlant(partial: Partial<Plant> & { id: string; name: string }): Plant {
    return normalizePlant({
      species: '',
      category: 'Houseplant',
      photoUri: null,
      acquiredDate: '2026-01-01',
      location: '',
      waterIntervalDays: 7,
      fertilizeIntervalDays: 30,
      notes: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...partial,
    });
  }

  function testDueItem(
    partial: Partial<CareDueItem> & { plant: Plant }
  ): CareDueItem {
    return {
      type: 'water',
      dueDate: new Date('2026-06-08'),
      daysUntil: 0,
      overdue: false,
      effectiveIntervalDays: 7,
      ...partial,
    };
  }

  const careVerbTypes: Array<CareDueItem['type']> = ['water', 'fertilize'];

  const intervalHintItems: CareDueItem[] = [
    testDueItem({
      plant: testPlant({ id: 'p1', name: 'Fern', checkBeforeWater: true }),
      type: 'water',
    }),
    testDueItem({
      plant: testPlant({ id: 'p2', name: 'Cactus', checkBeforeWater: false }),
      type: 'water',
    }),
    testDueItem({
      plant: testPlant({ id: 'p3', name: 'Orchid' }),
      type: 'fertilize',
      effectiveIntervalDays: 21,
    }),
  ];

  // `rowMetaLabel` (lib/calendarLabels.ts) is the same kind of descriptor,
  // extracted from app/(tabs)/calendar.tsx so its location-present/absent
  // branch is covered by this seam loop too.
  const rowMetaItems: CareDueItem[] = [
    testDueItem({
      plant: testPlant({ id: 'p4', name: 'Pothos', location: 'Living room' }),
      type: 'water',
    }),
    testDueItem({
      plant: testPlant({ id: 'p5', name: 'Snake plant', location: '' }),
      type: 'fertilize',
      daysUntil: 3,
    }),
  ];

  // The remaining keys app/(tabs)/calendar.tsx calls via raw `t(key, params)`
  // rather than through a descriptor function — not covered by any branch
  // loop above. Each entry's `params` mirrors exactly what the screen passes
  // at that call site, so a param-name typo in a catalog placeholder (e.g.
  // `{verb}` where the screen passes `careVerb`) fails here even though
  // every language still agrees with every other language (catalog
  // integrity, above, only compares languages to each other, never to the
  // call site).
  const rawCallSites: Array<{ key: string; params: TranslateParams }> = [
    {
      key: 'calendar.rowA11yLabel',
      params: { name: 'Fern', careVerb: 'Water', relative: 'Due today' },
    },
    { key: 'calendar.philosophyBody', params: { days: MOISTURE_SNOOZE_DAYS } },
    { key: 'calendar.toastWatered', params: { name: 'Fern' } },
    { key: 'calendar.toastFed', params: { name: 'Fern' } },
    { key: 'calendar.toastSnoozed', params: { name: 'Fern', days: MOISTURE_SNOOZE_DAYS } },
  ];

  // The interpolated keys app/(tabs)/insights.tsx calls via raw
  // `t(key, params)` — no descriptor function was extracted for most of
  // these since each is a simple two-way ternary already resolved by the
  // time `t()` is called (mirrors calendar.tsx's toastWatered/toastFed/
  // swipeFed ternaries, which also aren't descriptor-wrapped). The one
  // exception, the "most active" one/many line, *is* wrapped (see
  // `mostActiveLabel` above) since it's a count-branch structurally
  // identical to `plantsSubtitleLabel`/`relativeCareLabel` — its coverage
  // lives in the dedicated loop below instead of this table.
  // Each entry's `params` mirrors exactly what the screen passes at that
  // call site — see "catalog seam" comment above for why that matters.
  const insightsRawCallSites: Array<{ key: string; params: TranslateParams }> = [
    // Header subtitle — {tail} is itself a pre-translated string (either
    // insights.subtitleTailPremium or insights.subtitleTailFree).
    { key: 'insights.subtitle', params: { tail: 'Premium · server AI unlocked.' } },
    // StatTile accessibilityLabel — {label} is itself a pre-translated stat
    // label (e.g. insights.statPlants).
    { key: 'insights.statA11yLabel', params: { label: 'Plants', value: '3' } },
    // Streak stat tile value ("5d"/"5j"/"5T").
    { key: 'insights.streakValue', params: { count: 5 } },
    { key: 'insights.last7and30', params: { sevenDays: 4, thirtyDays: 12 } },
    // {category} is the already-translated domain.category.* value.
    { key: 'insights.categoryRow', params: { category: 'Houseplant', count: 2 } },
    { key: 'insights.dueToday', params: { count: 2 } },
    // {usesLeft} is either a number or the '∞' symbol for unlimited.
    { key: 'insights.aiBodyPremium', params: { usesLeft: 3 } },
    { key: 'insights.aiBodyPremium', params: { usesLeft: '∞' } },
  ];

  // `heroMetaLabel`/`plantAgeLabel` (lib/detailLabels.ts) — the plant
  // detail screen's hero meta line and its "{n}d with you" age fragment.
  // Four states covering each of heroMetaLabel's branches (location ×
  // age presence); the last state also exercises plantAgeLabel's
  // ageDays === 1 (one) branch, distinct from the others' many/none.
  const heroMetaStates: Array<{
    category: Plant['category'];
    location: string;
    ageDays: number;
  }> = [
    { category: 'Houseplant', location: '', ageDays: 0 }, // heroMeta
    { category: 'Houseplant', location: 'Kitchen', ageDays: 0 }, // heroMetaLocation
    { category: 'Fern', location: '', ageDays: 5 }, // heroMetaAge (many)
    { category: 'Fern', location: 'Kitchen', ageDays: 1 }, // heroMetaLocationAge (one)
  ];
  // Separate ageDays sweep so plantAgeLabel's own one/many/none branches are
  // each exercised directly (heroMetaStates above only covers 0/1/5).
  const plantAgeDaysValues = [0, 1, 2, 120];

  // The interpolated `detail.*` keys app/plant/[id].tsx calls via raw
  // `t(key, params)` — not covered by the heroMetaLabel/plantAgeLabel
  // descriptor loop above. Each entry's `params` mirrors exactly what the
  // screen passes at that call site (see "catalog seam" comment above).
  const detailRawCallSites: Array<{ key: string; params: TranslateParams }> = [
    { key: 'detail.deleteAlertBody', params: { name: 'Fern' } },
    { key: 'detail.waterRhythmChip', params: { days: 6 } },
    { key: 'detail.toastSnoozed', params: { days: MOISTURE_SNOOZE_DAYS } },
    // {confidence} is the already-translated domain.confidence.* value.
    { key: 'detail.reidentifyBodyConfidence', params: { confidence: 'High' } },
    // {date} is the untouched date-fns-formatted generatedAt (Constraint 10).
    { key: 'detail.careGuideBodyLast', params: { date: 'Jun 8, 2026' } },
    // {urgency} is the already-translated domain.urgency.* value.
    { key: 'detail.coachUrgency', params: { urgency: 'Watch' } },
    // {date} is the untouched date-fns-formatted createdAt (Constraint 10);
    // {urgency} is the already-translated domain.urgency.* value.
    { key: 'detail.historyMeta', params: { date: 'Jun 8 · 3:00 PM', urgency: 'Watch' } },
    // {commonName}/{scientificName} are raw AI-returned text (Constraint 9);
    // {confidence}/{light}/{pets} are already-translated domain.* values.
    {
      key: 'detail.aiUpdatedBody',
      params: {
        commonName: 'Fern',
        confidence: 'High',
        light: 'Bright indirect',
        pets: 'Pet-safe',
      },
    },
    {
      key: 'detail.aiUpdatedBodyWithScientific',
      params: {
        commonName: 'Fern',
        scientificName: 'Nephrolepis exaltata',
        confidence: 'High',
        light: 'Bright indirect',
        pets: 'Pet-safe',
      },
    },
  ];

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

      it('renders every careVerbLabel branch as real text', () => {
        for (const type of careVerbTypes) {
          const label = careVerbLabel(type);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every intervalHintLabel branch as real text', () => {
        for (const item of intervalHintItems) {
          const label = intervalHintLabel(item);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every rowMetaLabel branch as real text', () => {
        for (const item of rowMetaItems) {
          const careVerb = translateLabel(
            (key, params) => translate(code, key, params),
            careVerbLabel(item.type)
          );
          const relative = translateLabel(
            (key, params) => translate(code, key, params),
            relativeCareLabel(item.daysUntil)
          );
          const label = rowMetaLabel(item, careVerb, relative);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every mostActiveLabel branch as real text', () => {
        for (const count of mostActiveCounts) {
          const label = mostActiveLabel('Fern', count);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every raw t() call site in calendar.tsx as real text', () => {
        for (const { key, params } of rawCallSites) {
          const rendered = translate(code, key, params);
          expect(rendered, `${code} ${key}`).not.toBe(key);
          expect(rendered, `${code} ${key}`).not.toContain('{');
        }
      });

      it('renders every raw t() call site in insights.tsx as real text', () => {
        for (const { key, params } of insightsRawCallSites) {
          const rendered = translate(code, key, params);
          expect(rendered, `${code} ${key}`).not.toBe(key);
          expect(rendered, `${code} ${key}`).not.toContain('{');
        }
      });

      it('renders every heroMetaLabel branch as real text', () => {
        const t = (key: string, params?: TranslateParams) => translate(code, key, params);
        for (const state of heroMetaStates) {
          const category = t(`domain.category.${state.category}`);
          const ageDesc = plantAgeLabel(state.ageDays);
          const age = ageDesc ? translateLabel(t, ageDesc) : null;
          const label = heroMetaLabel(category, state.location, age);
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every plantAgeLabel branch as real text', () => {
        for (const ageDays of plantAgeDaysValues) {
          const label = plantAgeLabel(ageDays);
          if (!label) continue; // ageDays <= 0 — no fragment rendered at all
          const rendered = translate(code, label.key, label.params);
          expect(rendered, `${code} ${label.key}`).not.toBe(label.key);
          expect(rendered, `${code} ${label.key}`).not.toContain('{');
        }
      });

      it('renders every raw t() call site in plant/[id].tsx as real text', () => {
        for (const { key, params } of detailRawCallSites) {
          const rendered = translate(code, key, params);
          expect(rendered, `${code} ${key}`).not.toBe(key);
          expect(rendered, `${code} ${key}`).not.toContain('{');
        }
      });
    });
  }
});
