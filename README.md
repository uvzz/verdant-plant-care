# Verdant — Plant Care Tracker

[![GitHub](https://img.shields.io/badge/GitHub-uvzz%2Fverdant--plant-care-5B7F6B)](https://github.com/uvzz/verdant-plant-care)
[![Expo](https://img.shields.io/badge/Expo-57-000020)](https://expo.dev)
[![CI](https://img.shields.io/badge/CI-typecheck%20%2B%20tests-5B7F6B)](./.github/workflows/ci.yml)

**Care you can see grow.**  
Photo-first, local-first plant journal for **iOS** and **Android** — Expo (React Native) with Glasshouse design, check-before-water scheduling, and Premium AI that never puts an API key on the device.

| | |
|--|--|
| **Version** | `0.7.0` (see `CHANGELOG.md`) |
| **Platforms** | iOS · Android · Web (limited) |
| **AI edge** | Cloudflare Worker → OpenRouter |

---

## Why Verdant

Most plant apps either **overwater on autopilot** (blind schedules) or **trap you with dark paywalls and cloud lock-in**. Verdant is different:

| vs competitors | Verdant |
|----------------|---------|
| Blind “water now” | **Check before water** — Still moist snooze |
| Ignores pot / light | **Light + pot-aware** intervals |
| User-pasted API keys | **Server-side AI only** (OpenRouter key on Worker) |
| Cloud-only journals | **Local-first** photos + JSON export/import |
| Dark free trials | **Honest Premium** — free journal works without CC traps |

Longer write-up: [`docs/COMPETITIVE.md`](./docs/COMPETITIVE.md).

---

## Features

### Collection & care
- Add / edit plants with durable photos, species, category, room/location
- **Glasshouse camera** — full-screen capture with viewfinder + shutter animations
- Photo library picker, progress gallery, fullscreen lightbox
- Care log: water, fertilize, soil check, notes, photos
- **Care calendar**: Watered · Still moist · Details (long-press opens plant)
- Local gentle notifications (“check soil…”)

### Smart schedules
- Base water/fertilize intervals per plant
- Adjusted by **light level** and **pot size**
- Pet safety flags (safe / caution / toxic / unknown)
- Family caretaker assignment (local household)

### Insights & family
- Stats: streak, overdue, 14-day activity, category breakdown
- Premium AI collection insight
- Family members, care sheet share, invite text
- **Export / import** JSON backups (merge or replace; file picker + paste)

### Premium AI (server-side)
| Task | Model (OpenRouter) |
|------|---------------------|
| Text guide, coach, insights | `deepseek/deepseek-v4-flash` |
| Photo identify / coach + photo | `qwen/qwen3.5-flash-02-23` |

- Plant identify (name, species, intervals, light, pet toxicity)
- Species care guide + care coach (with history)
- **No user API key UI** — key only on the Worker
- Rate limits, model allowlist, prompt-injection guards — see [`docs/SECURITY.md`](./docs/SECURITY.md)

### Free vs Premium
| | Free | Premium |
|--|------|---------|
| Plants | Up to 5 | Unlimited |
| Journal, calendar, photos | ✓ | ✓ |
| Check-before-water, rooms, family | ✓ | ✓ |
| Export / import | ✓ | ✓ |
| AI identify / guide / coach / insight | — | ✓ |

---

## Architecture

```
┌─────────────────────┐     Bearer premium token      ┌──────────────────┐
│  Verdant app        │ ────────────────────────────► │  verdant-ai      │
│  Expo / RN          │                               │  Cloudflare      │
│  (local journal)    │ ◄──────────────────────────── │  Worker          │
└─────────────────────┘     JSON / chat completions   └────────┬─────────┘
                                                               │ OPENROUTER_API_KEY
                                                               ▼
                                                      ┌──────────────────┐
                                                      │  OpenRouter      │
                                                      │  DeepSeek / Qwen │
                                                      └──────────────────┘
```

- `OPENROUTER_API_KEY` — Worker secret only  
- `PREMIUM_ACCESS_TOKEN` — shared gate (app build env + Worker secret); rate-limited  
- Client `.env` never holds the OpenRouter key  

Production Worker: `https://verdant-ai.nebulatv.workers.dev`

---

## Quick start

```bash
git clone https://github.com/uvzz/verdant-plant-care.git
cd verdant-plant-care
npm install
cp .env.example .env
# Edit .env:
#   EXPO_PUBLIC_VERDANT_AI_URL=https://verdant-ai.nebulatv.workers.dev
#   EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN=<same as Worker PREMIUM_ACCESS_TOKEN>

# Optional: local AI proxy
# Terminal 1
cp workers/verdant-ai/.dev.vars.example workers/verdant-ai/.dev.vars
# fill OPENROUTER_API_KEY + PREMIUM_ACCESS_TOKEN
npm run ai:dev

# Terminal 2
npm run ios      # or: npm start
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm start` / `npm run ios` / `android` | Expo dev |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | TypeScript |
| `npm run ai:dev` | Local Cloudflare Worker (`:8787`) |
| `npm run ai:deploy` | Deploy Worker |
| `npm run release -- patch\|minor\|major "notes"` | Version + changelog + tag + push |
| `npm run you-must-run` | Store / EAS checklist for your accounts |
| `npm run eas:build:preview` | EAS internal builds |
| `npm run eas:build:production` | EAS store builds |

---

## Project layout

```
app/                  Expo Router screens (tabs, plant, camera, legal)
components/           UI (PlantCard, PrimaryButton, EmptyState, …)
constants/            Colors, typography, version
lib/                  Domain logic (care, AI, billing, family, storage)
workers/verdant-ai/   Cloudflare Worker AI proxy
docs/                 Competitive notes, EAS, security, store listing, legal
design/               Design system + HTML mockups
scripts/              release.mjs, you-must-run.sh
```

---

## AI setup

### Local Worker

```bash
cd workers/verdant-ai
# .dev.vars (gitignored):
#   OPENROUTER_API_KEY=sk-or-…
#   PREMIUM_ACCESS_TOKEN=<long random string>
npm run dev    # or from root: npm run ai:dev
```

App `.env`:

```bash
EXPO_PUBLIC_VERDANT_AI_URL=http://127.0.0.1:8787
EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN=<same as PREMIUM_ACCESS_TOKEN>
```

### Production Worker

```bash
cd workers/verdant-ai
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put PREMIUM_ACCESS_TOKEN
npm run deploy
```

Optional rate-limit env (defaults: 8/min · 40/hour · 120/day per IP + token):

- `RATE_LIMIT_PER_MINUTE`
- `RATE_LIMIT_PER_HOUR`
- `RATE_LIMIT_PER_DAY`

Security details: [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## Tests & CI

```bash
npm test
npm run typecheck
```

GitHub Actions on `main`: typecheck + Vitest (`.github/workflows/ci.yml`).

---

## Shipping (EAS / stores)

```bash
npm run you-must-run   # full checklist
eas login && eas init
# secrets: EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN, EXPO_PUBLIC_EAS_PROJECT_ID, …
npm run eas:build:preview
npm run eas:build:production
```

| Doc | Contents |
|-----|----------|
| [`docs/EAS.md`](./docs/EAS.md) | Builds, secrets, IAP SKUs |
| [`docs/STORE_LISTING.md`](./docs/STORE_LISTING.md) | Listing copy + screenshot checklist |
| [`docs/legal/PRIVACY.md`](./docs/legal/PRIVACY.md) | Privacy policy |
| [`docs/legal/TERMS.md`](./docs/legal/TERMS.md) | Terms of use |
| In-app | Settings → About → Privacy / Terms |

**IAP product IDs**

- Yearly: `com.verdant.plantcare.premium.yearly`
- Lifetime: `com.verdant.plantcare.premium.lifetime`

`expo-iap` is wired for store builds; Expo Go / `__DEV__` uses a clear demo unlock.

---

## Versioning

```bash
npm run release -- patch "Bug fixes"
npm run release -- minor "New feature"
```

Keeps in sync: `package.json`, `app.json`, `constants/Colors.ts` (`APP_VERSION`), `CHANGELOG.md`, git tag, push.

---

## Design

Glasshouse Specimen system — Fraunces + Outfit, night green / growth lime, specimen plant cards.

- [`design/DESIGN_SYSTEM.md`](./design/DESIGN_SYSTEM.md)
- [`design/screens.html`](./design/screens.html)

---

## License

Private / all rights reserved unless otherwise noted.
