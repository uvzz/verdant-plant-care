# Verdant — Plant Care Tracker

[![GitHub](https://img.shields.io/badge/GitHub-uvzz%2Fverdant--plant-care-5B7F6B)](https://github.com/uvzz/verdant-plant-care)

Photo-first, multi-niche plant care tracker for **iOS** and **Android**, built with **Expo (React Native)**.

## Features (v0.3+)

- Add / edit plant with durable photos, date picker, search & category filters
- Care log + progress gallery + fullscreen photos
- Care calendar & local reminders
- **Insights** tab (stats + Premium AI collection insight)
- **Premium AI** (server-side OpenRouter): identify, care guide, coach
- Freemium: free up to 5 plants; Premium unlimited plants + AI

## Architecture: AI (Premium only)

```
App (Premium)  →  Cloudflare Worker (verdant-ai)  →  OpenRouter
                      ↑ OPENROUTER_API_KEY secret (never in the app)
```

- Users **do not** enter an API key.
- OpenRouter key lives **only** on the Worker (`.dev.vars` locally / `wrangler secret` in prod).
- Free users see AI entry points but must unlock Premium.

### Local AI server

```bash
# Terminal 1 — Worker (loads workers/verdant-ai/.dev.vars)
npm run ai:dev

# Terminal 2 — Expo app
# .env must include:
# EXPO_PUBLIC_VERDANT_AI_URL=http://127.0.0.1:8787
# EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN=<same as Worker PREMIUM_ACCESS_TOKEN>
npm run ios
```

### Deploy Worker

```bash
cd workers/verdant-ai
npx wrangler login   # once
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put PREMIUM_ACCESS_TOKEN
npm run deploy
# Production URL: https://verdant-ai.nebulatv.workers.dev
# Set EXPO_PUBLIC_VERDANT_AI_URL to that URL in the app `.env` / EAS secrets.
```

## Quick start

```bash
cd verdant-plant-care
npm install
cp .env.example .env   # fill AI URL + premium token
npm run ai:dev         # separate terminal
npm start
```

## Versioning & changelog

After every big change:

```bash
npm run release -- patch "Short description"
npm run release -- minor "Feature summary"
```

See [`CHANGELOG.md`](./CHANGELOG.md).

## License

Private / all rights reserved unless otherwise noted.
