# EAS production builds

## Prerequisites

1. Expo account: https://expo.dev
2. Apple Developer + App Store Connect (iOS)
3. Google Play Console (Android)
4. Install CLI: `npm i -g eas-cli` then `eas login`

## First-time project link

```bash
cd verdant-plant-care
eas init   # creates projectId in app.json → expo.extra.eas.projectId
```

## Secrets / env

Set production Premium token for the app build (not the OpenRouter key):

```bash
eas secret:create --name EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN --value "<same as Worker PREMIUM_ACCESS_TOKEN>" --scope project
```

Worker OpenRouter key stays only on Cloudflare:

```bash
cd workers/verdant-ai
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put PREMIUM_ACCESS_TOKEN
```

## Build

```bash
# Internal preview APK / ad-hoc iOS
eas build --profile preview --platform all

# Store production
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Submit

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## In-app purchases

Product IDs (create matching products in App Store Connect / Play Console):

| SKU | ID |
|-----|-----|
| Yearly Premium | `com.verdant.plantcare.premium.yearly` |
| Lifetime | `com.verdant.plantcare.premium.lifetime` |

Wire StoreKit / Play Billing (or RevenueCat) into `lib/billing.ts` → `isNativeIapAvailable()` once you ship a custom dev client / production binary. Until then, `__DEV__` demo unlock works for QA.

## Profiles (`eas.json`)

- **development** — dev client + simulator
- **preview** — internal distribution, Android APK
- **production** — store AAB / iOS release
