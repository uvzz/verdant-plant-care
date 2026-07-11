# Verdant — Plant Care Tracker

[![GitHub](https://img.shields.io/badge/GitHub-uvzz%2Fverdant--plant-care-5B7F6B)](https://github.com/uvzz/verdant-plant-care)

Photo-first, multi-niche plant care tracker for **iOS** and **Android**, built with **Expo (React Native)**.

Calm, premium presentation for houseplants, orchids, succulents, ferns, herbs, and more — with care logs, visual progress galleries, and gentle reminders.

## Features (MVP v0.2)

- **Add / edit plant** with durable photo storage, species, category, date picker, location, intervals
- **Care log** — watered, fertilized, notes, photos; long-press to delete entries
- **Plant detail** — hero photo, due dates, log + progress gallery
- **AI assist (OpenRouter)** — plant identify from photo, species care guide, care coach
- **Care calendar** — overdue / today / upcoming, taps through to log care
- **Gentle notifications** — local reminders for due care
- **Freemium** — free up to 5 plants + 5 AI uses/month; Premium unlimited (demo toggle)

## OpenRouter AI setup

1. Create a key at [openrouter.ai](https://openrouter.ai)
2. Run the app → **Settings → AI assistant**
3. Paste the key (`sk-or-v1-…`) and tap **Save key**

The key is stored in the device keychain (Secure Store). AI requests go to OpenRouter with your key; plant photos are base64-encoded only for that API call.

## Platforms

| Platform | How to run |
| -------- | ---------- |
| iOS | `npm run ios` (simulator or device via Expo Go / dev build) |
| Android | `npm run android` (emulator or device via Expo Go / dev build) |
| Web | `npm run web` (preview only; camera/notifications limited) |

## Quick start

```bash
cd verdant-plant-care
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with **Expo Go** on a physical phone.

### Production builds (stores)

```bash
# Install EAS CLI once
npm i -g eas-cli

# Configure (requires Expo account)
eas build:configure

# Native binaries
eas build --platform ios
eas build --platform android
```

## Project structure

```
app/
  (tabs)/          # My Plants, Care calendar, Settings
  plant/           # Add, detail, log care
components/        # UI building blocks
constants/         # Theme + limits
lib/               # Types, storage, care math, context, notifications
```

## Data

Local-first on device via AsyncStorage. No cloud account required for MVP.

## Versioning & changelog

**After every big change:** bump version, update notes, commit, tag, and push.

```bash
# patch 0.2.1 → 0.2.2
npm run release -- patch "Short description of what changed"

# minor 0.2.x → 0.3.0
npm run release -- minor "New feature summary"

# major → 1.0.0
npm run release -- major "Breaking or 1.0 ship"

# exact version
npm run release -- 0.3.0 "Named release notes"
```

This updates `package.json`, `app.json`, `APP_VERSION`, **`CHANGELOG.md`**, creates git tag `vX.Y.Z`, and pushes to GitHub.

- Human-readable history: [`CHANGELOG.md`](./CHANGELOG.md)
- Semantic versioning: MAJOR.MINOR.PATCH
- Notion (optional ops): Project Hub + Version Logs

`SKIP_PUSH=1 npm run release -- patch "…"` commits/tags locally only.

## License

Private / all rights reserved unless otherwise noted.
