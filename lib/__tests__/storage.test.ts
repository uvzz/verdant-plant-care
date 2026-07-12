import { describe, expect, it } from 'vitest';
import { normalizeSettings } from '../storage';

// In Vitest __DEV__ is undefined, so normalizeSettings behaves exactly like a
// release build — which is the C-1 case we must lock down.
describe('normalizeSettings release-build demo guard (C-1)', () => {
  it('revokes persisted demo premium in release builds', () => {
    const settings = normalizeSettings({
      isPremium: true,
      premiumSource: 'demo',
      premiumProductId: 'com.verdant.plantcare.premium.yearly',
    });
    expect(settings.isPremium).toBe(false);
    expect(settings.premiumSource).toBe('none');
    expect(settings.premiumProductId).toBeNull();
  });

  it('revokes legacy premium with no recorded source (defaults to demo)', () => {
    const settings = normalizeSettings({ isPremium: true });
    expect(settings.isPremium).toBe(false);
    expect(settings.premiumSource).toBe('none');
  });

  it('keeps store-purchased premium', () => {
    const settings = normalizeSettings({
      isPremium: true,
      premiumSource: 'store',
      premiumProductId: 'com.verdant.plantcare.premium.yearly',
    });
    expect(settings.isPremium).toBe(true);
    expect(settings.premiumSource).toBe('store');
  });

  it('keeps restored premium', () => {
    const settings = normalizeSettings({
      isPremium: true,
      premiumSource: 'restore',
    });
    expect(settings.isPremium).toBe(true);
  });

  it('leaves free plan untouched', () => {
    const settings = normalizeSettings(null);
    expect(settings.isPremium).toBe(false);
    expect(settings.premiumSource).toBe('none');
  });
});

describe('firstParam route normalization', () => {
  it('collapses arrays and null-ish to a string', async () => {
    const { firstParam } = await import('../routeParams');
    expect(firstParam('abc')).toBe('abc');
    expect(firstParam(['a', 'b'])).toBe('a');
    expect(firstParam([])).toBe('');
    expect(firstParam(undefined)).toBe('');
    expect(firstParam(null)).toBe('');
  });
});
