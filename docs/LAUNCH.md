# Verdant — Launch Runbook (owner tasks)

Everything in code + infra is done. These four are the account-level steps only
the owner can perform. Do them roughly in order. Sign-in specifics live in
[AUTH_SETUP.md](./AUTH_SETUP.md); store copy lives in
[STORE_LISTING.md](./STORE_LISTING.md).

Key facts:

| | |
|--|--|
| Bundle id / package | `com.verdant.plantcare` |
| Premium products | `com.verdant.plantcare.premium.yearly` ($29.99/yr, auto-renew sub) · `com.verdant.plantcare.premium.lifetime` ($59.99, non-consumable) |
| Worker | `verdant-ai` → `https://verdant-ai.nebulatv.workers.dev` (`SYNC_DERIVE_SECRET` already set ✅) |
| Marketing site | Cloudflare Pages project `verdant` → `https://verdant-bk5.pages.dev` |

---

## Task 1 — EAS: init, build, submit

```bash
npm i -g eas-cli
eas login                                   # your Expo account
cd ~/Documents/verdant-plant-care
eas init                                    # writes real projectId → commit app.json
eas build --profile development --platform ios     # dev client to test on device
```

Profiles already exist in `eas.json` (development / preview / production). For a
store build later:

```bash
eas build --profile production --platform ios       # and: --platform android
```

Submit needs two placeholders filled in `eas.json → submit.production`:
- **iOS** `ascAppId` → the numeric App Store Connect app id (from Task 2).
- **Android** `serviceAccountKeyPath` → a Play service-account JSON at
  `./secrets/play-service-account.json` (Play Console → Setup → API access →
  create service account → grant it release permissions → download the key).
  `secrets/` is gitignored.

```bash
eas submit --profile production --platform ios       # after production build
eas submit --profile production --platform android
```

> Requires an active **Apple Developer Program** ($99/yr) and a **Google Play
> Developer** account ($25 one-time).

---

## Task 2 — App Store Connect & Play: products, listing, submit

### 2a. Create the in-app products (must match the ids above exactly)

**App Store Connect** → your app → *Subscriptions* / *In-App Purchases*:
- Auto-renewable subscription — Product ID `com.verdant.plantcare.premium.yearly`,
  price $29.99/year, in a subscription group (e.g. "Verdant Premium").
- Non-consumable — Product ID `com.verdant.plantcare.premium.lifetime`, $59.99.

**Google Play Console** → your app → *Monetize*:
- Subscription — Product ID `com.verdant.plantcare.premium.yearly`, $29.99/year.
- One-time product — `com.verdant.plantcare.premium.lifetime`, $59.99.

> The ids must be byte-identical to `PREMIUM_PRODUCT_IDS` in `lib/billing.ts`, or
> the app can't find them and Premium purchase fails.

### 2b. Listing

Paste from [STORE_LISTING.md](./STORE_LISTING.md): name, subtitle, description,
keywords, category (Lifestyle / Health & Fitness). Upload screenshots (capture
from the sim: `xcrun simctl io booted screenshot`), the app icon, and link the
**Privacy Policy** URL → `https://verdant-bk5.pages.dev/privacy` (App Store and
Play both require a privacy URL — you now have one).

Data-safety / privacy questionnaire answers: data is local-first; optional
cloud sync stores plants/photos under the user's account; no ads, no tracking,
no data sold. (Mirrors the privacy page.)

### 2c. Submit

Build with `eas build --profile production`, `eas submit` (Task 1), then in each
console attach the build, fill review notes (mention Premium is IAP; demo
account not needed — app works offline), and submit for review.

---

## Task 3 — Google + Apple sign-in

Full steps in **[AUTH_SETUP.md](./AUTH_SETUP.md)**. Short version:

- **Apple** — near-turnkey; let EAS enable the *Sign in with Apple* capability
  during the Task 1 iOS build. Worker already trusts the bundle id.
- **Google** — create 3 OAuth clients (web / iOS / Android), put their ids in
  `.env` + each `eas.json` profile `env`, then set the Worker's
  `GOOGLE_AUDIENCES` to all three and `wrangler deploy`.

---

## Task 4 — Site launch polish

### 4a. Real store links on the landing page

`web/index.html` has 4 "Coming soon" badges pointing at `#get`/`#`. Once the
store URLs exist, swap them to the real App Store / Play links and redeploy:

```bash
# edit web/index.html badge hrefs, then:
npx wrangler pages deploy web --project-name verdant --branch main --commit-dirty=true
```

(Ask and this can be automated once you paste the two store URLs.)

### 4b. Custom domain (optional)

Cloudflare dashboard → Pages → **verdant** → *Custom domains* → add e.g.
`getverdant.app` (or a subdomain). Point DNS as instructed; Pages issues the
cert. Then update the privacy/terms links + any references from `verdant-bk5`
to the custom domain.

---

## One-glance order

1. `eas login` → `eas init` (commit projectId) → `eas build --profile development` → test on device.
2. Apple: enable capability during build. Google: 3 OAuth clients → app env + Worker `GOOGLE_AUDIENCES`.
3. App Store Connect + Play: create the two products, paste listing, add privacy URL.
4. `eas build --profile production` → `eas submit` → submit for review.
5. On approval: swap the landing store badges to real links + redeploy; optional custom domain.
