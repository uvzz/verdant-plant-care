/**
 * Verdant Premium billing.
 *
 * Product IDs must match App Store Connect / Google Play Console.
 * Until store products are live, `purchasePremium` uses a clear demo unlock
 * in __DEV__ / Expo Go; production builds surface restore + purchase hooks
 * ready for StoreKit / Play Billing (wire via EAS + native module next).
 */

export const PREMIUM_PRODUCT_IDS = {
  /** Auto-renewing yearly Premium */
  yearly: 'com.verdant.plantcare.premium.yearly',
  /** One-time lifetime unlock (optional SKU) */
  lifetime: 'com.verdant.plantcare.premium.lifetime',
} as const;

export type PremiumSource = 'none' | 'demo' | 'store' | 'restore' | 'family';

export type PurchaseResult =
  | { ok: true; source: PremiumSource; productId?: string }
  | { ok: false; reason: string; cancelled?: boolean };

export type RestoreResult =
  | { ok: true; restored: boolean; source: PremiumSource }
  | { ok: false; reason: string };

/** Display prices shown until store catalog is linked */
export const PREMIUM_DISPLAY = {
  yearlyLabel: 'Premium · yearly',
  yearlyPriceHint: '$29.99/year',
  lifetimeLabel: 'Premium · lifetime',
  lifetimePriceHint: '$59.99 once',
} as const;

/**
 * Whether native IAP is available (false in Expo Go / web).
 * When true and a purchase module is linked, real store flow is used.
 */
export function isNativeIapAvailable(): boolean {
  // Native IAP requires a custom dev client / store build with a purchase SDK.
  // Keep false until `expo-iap` or RevenueCat is installed in EAS builds.
  return false;
}

/**
 * Purchase Premium. Store path is prepared; until products go live, __DEV__
 * allows an explicit demo unlock so design/QA still work.
 */
export async function purchasePremium(
  product: keyof typeof PREMIUM_PRODUCT_IDS = 'yearly'
): Promise<PurchaseResult> {
  const productId = PREMIUM_PRODUCT_IDS[product];

  if (isNativeIapAvailable()) {
    // Placeholder for StoreKit / Play Billing integration:
    // const result = await Iap.requestPurchase({ sku: productId });
    return {
      ok: false,
      reason: 'Store billing module not linked in this build.',
    };
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return { ok: true, source: 'demo', productId };
  }

  return {
    ok: false,
    reason:
      'In-app purchases require an App Store / Play build. Use Restore if you already subscribed, or try a development build.',
  };
}

/**
 * Restore previous purchases (App Store / Play).
 * Until native IAP is wired, returns no entitlements found.
 */
export async function restorePurchases(): Promise<RestoreResult> {
  if (isNativeIapAvailable()) {
    // const owned = await Iap.getAvailablePurchases();
    // if (owned.some(...premium skus)) return { ok: true, restored: true, source: 'restore' };
    return { ok: true, restored: false, source: 'none' };
  }

  return {
    ok: false,
    reason:
      'Restore needs a store build with your Apple / Google account. In development, use the demo unlock.',
  };
}

export function premiumSourceLabel(source: PremiumSource | undefined): string {
  switch (source) {
    case 'store':
      return 'Active via App Store / Play';
    case 'restore':
      return 'Restored purchase';
    case 'family':
      return 'Family plan';
    case 'demo':
      return 'Demo unlock (development)';
    default:
      return 'Free plan';
  }
}
