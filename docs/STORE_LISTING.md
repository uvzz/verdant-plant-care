# Verdant — App Store & Play listing pack

Copy to paste when creating the listings. Screenshots: capture from the
Simulator with Premium unlocked + a few sample plants (checklist below).

## App name

**Verdant**

## Subtitle (iOS, 30 chars)

`Calm plant care journal`

## Short description (Play, 80 chars)

`Check soil before watering. Photo-first plant journal with AI identify.`

## Full description

```
Verdant is a calm, photo-first plant care journal for houseplants, orchids, succulents, and more.

WHY VERDANT
• Check before water — “Still moist” snoozes the reminder instead of a blind schedule
• Light + pot-aware watering rhythms (no autopilot overwatering)
• Photo-first — every plant is a specimen card you watch change over the seasons
• Private by default — works fully offline, no account needed to start
• Rooms, pet-safety flags, family caretakers
• Premium AI (server-side): identify, care guide, gentle coach — the AI key is never on your device
• Honest Premium — the free journal is a real plan, not a trial

FREE
• Up to 5 plants
• Care calendar, logs, progress photos, insights
• Family household + care sheets
• Works fully offline

PREMIUM
• Unlimited plants
• AI plant identify from a photo (light + pet-safety suggestions)
• AI care guide & coach
• AI collection insight
• Cloud backup & sync across your devices (sign in with Apple or Google) — optional, off by default

Not medical or veterinary advice — educational plant care only.
```

## Keywords (iOS)

`plant,care,water,succulent,orchid,houseplant,garden,journal,reminder,ai`

## Categories

- Primary: Lifestyle
- Secondary: Education / Productivity

## URLs

> The GitHub repo is **private** — never use it for listing URLs (reviewers get a 404).
> Use the marketing site.

| Field | Value |
|-------|-------|
| Marketing URL | `https://verdant-bk5.pages.dev` |
| Privacy policy URL | `https://verdant-bk5.pages.dev/privacy` |
| Terms URL | `https://verdant-bk5.pages.dev/terms` |
| Support URL | `https://verdant-bk5.pages.dev` (add a support/contact email in both consoles) |

## Screenshot checklist (6.7" / 6.9" phone)

1. **My Plants** grid with 4+ plants, water rings + due badges
2. **Calendar** — week strip + “Still moist” / Watered actions
3. **Plant detail** — hero, due cards, profile chips (light, pot, pets)
4. **AI assist** tab (Premium) with guide or coach
5. **Settings** — Backup & sync + Premium
6. **Welcome** — glasshouse intro

Capture: `xcrun simctl io booted screenshot`. Use a sim whose size matches an
accepted App Store display size (e.g. iPhone 16 Pro Max for 6.9").

## Feature graphic (Play, 1024×500)

Use `assets/store/feature-graphic.png` (night green + leaf mark + “Verdant”).

## IAP copy

| Product | ID | Display |
|---------|-----|---------|
| Yearly Premium | `com.verdant.plantcare.premium.yearly` | Unlimited plants + AI · billed yearly |
| Lifetime | `com.verdant.plantcare.premium.lifetime` | Unlimited plants + AI · one-time |

## Data safety / privacy questionnaire

Mirror the privacy page (`/privacy`):
- Local-first; no account required; app is fully usable offline.
- **Optional** cloud sync (Apple/Google sign-in) stores plants, care history, and
  photos under the user's own account identifier; encrypted in transit.
- Collected when signed in: email (optional, from the provider) + a derived sync id.
- Premium AI sends prompts/images to Verdant's server, which calls the model provider.
- No ads, no third-party ad SDKs, no tracking, no data sold.

## Review notes for Apple/Google

```
No login required to use the app — it works fully offline as a local journal.
Sign in with Apple / Google is OPTIONAL and only enables cloud backup & sync (Premium).

Premium is IAP (StoreKit / Play Billing). Reviewers can evaluate all core features
for free (up to 5 plants); Premium adds unlimited plants, AI, and sync.

AI requires network. The model-provider API key is server-only, on Cloudflare
Worker "verdant-ai" — it is never shipped in the app.

Account deletion: Settings → Backup & sync → Delete synced data (removes the
cloud collection); Sign out stops syncing. Local data is removed by deleting the app.
```

> ⚠️ **Apple guideline 5.1.1(v)** requires apps that support account sign-in to
> offer account/data deletion **in-app**. Verdant now has optional Apple/Google
> sign-in, so an in-app "Delete synced data" action is required before submitting.
> Keep the review note above accurate with whatever ships.
