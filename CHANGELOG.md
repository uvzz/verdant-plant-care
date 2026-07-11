# Changelog

All notable changes to **Verdant** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Version sources of truth (keep in sync):**

| File | Field |
|------|--------|
| `package.json` | `"version"` |
| `app.json` | `expo.version` |
| `constants/Colors.ts` | `APP_VERSION` |
| this file | release sections |

Use `npm run release -- <patch|minor|major> "Summary of the release"` after big changes.
That script bumps versions, prepends a CHANGELOG entry, commits, tags, and pushes.

---

## [Unreleased]

### Planned

- Real App Store / Play billing (replace Premium demo toggle)
- Family sharing
- Custom app icon and branded splash
- Automated tests and CI
- EAS production builds

---

## [0.3.0] - 2026-07-11

### Notes

- Insights, search, AI guide/coach persistence, photo lightbox, re-identify

## [0.2.1] - 2026-07-11

### Changed

- OpenRouter API key can seed from gitignored `.env` (`EXPO_PUBLIC_OPENROUTER_API_KEY`) into Secure Store on first use
- Documented release process and introduced changelog + version bump tooling

### Security

- Secrets stay in gitignored `.env`; never commit API keys

---

## [0.2.0] - 2026-07-11

### Added

- **OpenRouter AI assist**: plant identify from photo, species care guide, care coach on plant detail
- Secure API key storage (device keychain / Secure Store) and Settings UI to save/clear key
- Free tier: 5 AI uses per calendar month; Premium demo: unlimited AI
- **Edit plant** modal (photo, fields, intervals)
- **Date picker** for acquired date
- **Delete care log** entries (long-press)
- Durable photo storage under app documents (`verdant-photos/`)
- Clear Free vs Premium comparison table in Settings

### Changed

- App version surfaced as 0.2.0 in Settings About

---

## [0.1.1] - 2026-07-11

### Added

- Glasshouse Specimen design system and interactive mockups (`design/`)
- Welcome onboarding screen
- Fraunces + Outfit typography across the app
- Premium plan comparison (initial) in Settings

### Changed

- Full UI restyle: cool mist paper, growth CTAs, specimen plant cards with due filaments

---

## [0.1.0] - 2026-07-11

### Added

- Initial Expo (React Native) app for iOS and Android
- Add plant with photo, species, category, location, care intervals
- Care log: watered, fertilized, notes, photos
- Plant detail with due cards, care log, progress gallery
- Care calendar (overdue / today / upcoming)
- Local gentle notifications scaffolding
- Freemium plant limit (5 free; Premium demo unlock)
- Local-first AsyncStorage data layer
- GitHub repository and Notion project version logs
