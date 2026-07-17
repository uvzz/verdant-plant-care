/**
 * Verdant Premium billing via expo-iap (StoreKit / Play Billing).
 *
 * Product IDs must match App Store Connect / Google Play Console.
 * Expo Go / web: demo unlock in __DEV__ only.
 * EAS / store builds: real purchase + restore when SKUs exist.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PREMIUM_PRODUCT_IDS = {
  yearly: 'com.verdant.plantcare.premium.yearly',
  lifetime: 'com.verdant.plantcare.premium.lifetime',
} as const;

export const ALL_PREMIUM_SKUS = Object.values(PREMIUM_PRODUCT_IDS);

export type PremiumSource = 'none' | 'demo' | 'store' | 'restore' | 'family';

export type PurchaseResult =
  | { ok: true; source: PremiumSource; productId?: string }
  | { ok: false; reason: string; cancelled?: boolean };

export type RestoreResult =
  | { ok: true; restored: boolean; source: PremiumSource; productId?: string }
  | { ok: false; reason: string };

export type StoreProductInfo = {
  id: string;
  title: string;
  description: string;
  price: string;
};

export const PREMIUM_DISPLAY = {
  yearlyLabel: 'Premium · yearly',
  yearlyPriceHint: '$29.99/year',
  lifetimeLabel: 'Premium · lifetime',
  lifetimePriceHint: '$59.99 once',
} as const;

/**
 * Whether the yearly plan advertises a free trial. Keep FALSE until an
 * introductory (free-trial) offer is actually configured on the yearly
 * subscription in App Store Connect / Play Console — otherwise the app would
 * promise a trial the store won't honor. Flip to true once the offer is live.
 */
export const PREMIUM_HAS_TRIAL = false;

type IapModule = typeof import('expo-iap');

let iapModule: IapModule | null | undefined;
let connectionReady = false;

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

async function loadIap(): Promise<IapModule | null> {
  if (iapModule !== undefined) return iapModule;
  if (Platform.OS === 'web' || isExpoGo()) {
    iapModule = null;
    return null;
  }
  try {
    iapModule = await import('expo-iap');
    return iapModule;
  } catch {
    iapModule = null;
    return null;
  }
}

export async function isNativeIapAvailable(): Promise<boolean> {
  return Boolean(await loadIap());
}

async function ensureConnection(mod: IapModule): Promise<boolean> {
  if (connectionReady) return true;
  try {
    const ok = await mod.initConnection();
    connectionReady = Boolean(ok);
    return connectionReady;
  } catch {
    connectionReady = false;
    return false;
  }
}

function purchaseProductId(p: {
  productId?: string;
  id?: string;
}): string | undefined {
  return p.productId || p.id;
}

function isPremiumSku(id: string | undefined | null): boolean {
  if (!id) return false;
  return (ALL_PREMIUM_SKUS as string[]).includes(id);
}

function waitForPurchase(
  mod: IapModule,
  timeoutMs = 120_000
): Promise<{ ok: true; productId?: string } | { ok: false; reason: string; cancelled?: boolean }> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (
      value:
        | { ok: true; productId?: string }
        | { ok: false; reason: string; cancelled?: boolean }
    ) => {
      if (settled) return;
      settled = true;
      try {
        subOk.remove();
      } catch {
        /* */
      }
      try {
        subErr.remove();
      } catch {
        /* */
      }
      clearTimeout(timer);
      resolve(value);
    };

    const subOk = mod.purchaseUpdatedListener((purchase) => {
      const id = purchaseProductId(purchase as { productId?: string; id?: string });
      void (async () => {
        try {
          await mod.finishTransaction({
            purchase: purchase as never,
            isConsumable: false,
          });
        } catch {
          /* still grant if store delivered purchase */
        }
        done({ ok: true, productId: id });
      })();
    });

    const subErr = mod.purchaseErrorListener((err) => {
      const msg =
        (err as { message?: string })?.message ||
        (err as { code?: string })?.code ||
        'Purchase failed';
      const cancelled = /cancel|E_USER_CANCELLED/i.test(String(msg));
      done({
        ok: false,
        reason: cancelled ? 'Purchase cancelled.' : String(msg).slice(0, 200),
        cancelled,
      });
    });

    const timer = setTimeout(() => {
      done({
        ok: false,
        reason: 'Purchase timed out. Check store products and try again.',
      });
    }, timeoutMs);
  });
}

export async function fetchStoreProducts(): Promise<StoreProductInfo[]> {
  const mod = await loadIap();
  if (!mod) return [];
  try {
    if (!(await ensureConnection(mod))) return [];
    const subs = (await mod
      .fetchProducts({
        skus: [PREMIUM_PRODUCT_IDS.yearly],
        type: 'subs',
      })
      .catch(() => [])) as Array<Record<string, string>>;
    const ones = (await mod
      .fetchProducts({
        skus: [PREMIUM_PRODUCT_IDS.lifetime],
        type: 'in-app',
      })
      .catch(() => [])) as Array<Record<string, string>>;

    return [...(subs || []), ...(ones || [])]
      .map((p) => ({
        id: p.id || p.productId || '',
        title: p.title || p.id || '',
        description: p.description || '',
        price: p.displayPrice || p.localizedPrice || '',
      }))
      .filter((p) => p.id);
  } catch {
    return [];
  }
}

export async function purchasePremium(
  product: keyof typeof PREMIUM_PRODUCT_IDS = 'yearly'
): Promise<PurchaseResult> {
  const productId = PREMIUM_PRODUCT_IDS[product];
  const mod = await loadIap();

  if (mod) {
    try {
      if (!(await ensureConnection(mod))) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          return { ok: true, source: 'demo', productId };
        }
        return {
          ok: false,
          reason: 'Could not connect to the App Store / Play Billing.',
        };
      }

      const waiter = waitForPurchase(mod);
      await mod.requestPurchase({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
        type: product === 'yearly' ? 'subs' : 'in-app',
      });

      const outcome = await waiter;
      if (outcome.ok) {
        return {
          ok: true,
          source: 'store',
          productId: outcome.productId || productId,
        };
      }
      if (outcome.cancelled) return outcome;
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // SKUs often missing until store products are created
        return { ok: true, source: 'demo', productId };
      }
      return outcome;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/cancel|E_USER_CANCELLED/i.test(msg)) {
        return { ok: false, reason: 'Purchase cancelled.', cancelled: true };
      }
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        return { ok: true, source: 'demo', productId };
      }
      return {
        ok: false,
        reason:
          msg.slice(0, 200) ||
          'Purchase failed. Confirm product IDs exist in App Store Connect / Play Console.',
      };
    }
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return { ok: true, source: 'demo', productId };
  }

  return {
    ok: false,
    reason:
      'In-app purchases need an App Store / Play build (not Expo Go). Use Restore if you already subscribed, or run an EAS development build.',
  };
}

export async function restorePurchases(): Promise<RestoreResult> {
  const mod = await loadIap();
  if (!mod) {
    return {
      ok: false,
      reason:
        typeof __DEV__ !== 'undefined' && __DEV__
          ? 'Restore needs a store build. In Expo Go, use demo unlock under Premium.'
          : 'Restore needs a store build with your Apple / Google account.',
    };
  }

  try {
    if (!(await ensureConnection(mod))) {
      return { ok: false, reason: 'Could not connect to the store.' };
    }

    try {
      await mod.restorePurchases();
    } catch {
      /* Android may no-op; still query purchases */
    }

    const owned = (await mod.getAvailablePurchases().catch(() => [])) as Array<{
      productId?: string;
      id?: string;
    }>;
    const hit = owned.find((p) => isPremiumSku(purchaseProductId(p)));
    if (hit) {
      try {
        await mod.finishTransaction({
          purchase: hit as never,
          isConsumable: false,
        });
      } catch {
        /* */
      }
      return {
        ok: true,
        restored: true,
        source: 'restore',
        productId: purchaseProductId(hit),
      };
    }

    // Also check active subscriptions API
    try {
      const has = await mod.hasActiveSubscriptions([PREMIUM_PRODUCT_IDS.yearly]);
      if (has) {
        return {
          ok: true,
          restored: true,
          source: 'restore',
          productId: PREMIUM_PRODUCT_IDS.yearly,
        };
      }
    } catch {
      /* */
    }

    return { ok: true, restored: false, source: 'none' };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : 'Restore failed',
    };
  }
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

export async function endBillingConnection(): Promise<void> {
  const mod = await loadIap();
  if (!mod || !connectionReady) return;
  try {
    await mod.endConnection();
  } catch {
    /* */
  }
  connectionReady = false;
}
