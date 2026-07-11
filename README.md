# Verdant — Plant Care Tracker

[![GitHub](https://img.shields.io/badge/GitHub-uvzz%2Fverdant--plant-care-5B7F6B)](https://github.com/uvzz/verdant-plant-care)

Photo-first, multi-niche plant care tracker for **iOS** and **Android**, built with **Expo (React Native)**.

Calm, premium presentation for houseplants, orchids, succulents, ferns, herbs, and more — with care logs, visual progress galleries, and gentle reminders.

## Features (MVP v0.1)

- **Add plant** with photo, species, category, acquired date, location, care intervals
- **Care log** — watered, fertilized, notes, photos over time
- **Plant detail** — hero photo, due dates, log + progress gallery
- **Care calendar** — overdue / today / upcoming, taps through to log care
- **Gentle notifications** — local reminders for due care
- **Freemium scaffolding** — free up to 5 plants; Premium unlock (demo toggle)

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

## Versioning

Git is the source of truth. Project milestones and release notes are tracked in Notion:

- **Hub:** Verdant — Plant Care Tracker (Project Hub)
- **DB:** Verdant Version Logs

## License

Private / all rights reserved unless otherwise noted.
