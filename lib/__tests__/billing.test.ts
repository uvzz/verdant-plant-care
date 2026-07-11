import { describe, expect, it } from 'vitest';
import {
  PREMIUM_PRODUCT_IDS,
  premiumSourceLabel,
  purchasePremium,
  restorePurchases,
} from '../billing';

describe('billing product ids', () => {
  it('uses reverse-dns product ids', () => {
    expect(PREMIUM_PRODUCT_IDS.yearly).toContain('com.verdant.plantcare');
    expect(PREMIUM_PRODUCT_IDS.lifetime).toContain('premium');
  });
});

describe('premiumSourceLabel', () => {
  it('labels sources', () => {
    expect(premiumSourceLabel('demo')).toMatch(/Demo/i);
    expect(premiumSourceLabel('none')).toMatch(/Free/i);
    expect(premiumSourceLabel('store')).toMatch(/Store/i);
  });
});

describe('purchasePremium in vitest', () => {
  it('demo-unlocks in development', async () => {
    // vitest / node runs with __DEV__ typically undefined — purchase may fail closed
    const result = await purchasePremium('yearly');
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.source).toBe('demo');
    } else {
      // production-like: store not linked
      expect(result.ok).toBe(false);
    }
  });
});

describe('restorePurchases', () => {
  it('reports when native IAP unavailable', async () => {
    const r = await restorePurchases();
    // without native module: either no purchases or not available
    expect(r.ok === false || (r.ok && r.restored === false)).toBe(true);
  });
});
