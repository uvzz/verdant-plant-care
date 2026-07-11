# Verdant Privacy Policy

**Last updated:** 2026-07-11

## Overview

Verdant is a **local-first** plant care journal for iOS and Android. This policy explains what stays on your device, what is sent for optional Premium AI, and what we do not do.

## Data stored on your device

- Plant profiles, photos, care logs, settings, family household members, and Premium entitlement status are stored **locally** (app storage).
- Photos you add are copied into the app’s document directory on your device.
- We do **not** require a Verdant cloud account that uploads your collection by default.

## Premium AI (optional)

When you use Premium AI (plant identify, care guide, coach, collection insights):

1. The app sends the minimum content needed (text prompts; for identify / photo coach, image data) to **Verdant’s edge proxy**.
2. The proxy calls OpenRouter / model providers using a server-held API key.
3. The OpenRouter key is **never** stored as a user-entered secret in the mobile app.

Do not include sensitive personal data in AI prompts that you would not want processed by AI providers.

## Purchases

In-app purchases are handled by **Apple App Store** or **Google Play**. We receive entitlement status from store APIs. We do not receive your full payment card numbers.

## Analytics & advertising

Verdant does **not** include third-party advertising SDKs and does not sell plant photos for advertising. Platform crash/performance tooling, if enabled in a future build, will be disclosed here.

## Backups you export

Export creates a JSON file **you** control. Sharing or importing a backup is your choice. Imported data is stored locally like other journal data.

## Children

Verdant is not directed at children under 13. Do not use Premium AI with personal information of children.

## Contact

- GitHub: [uvzz/verdant-plant-care](https://github.com/uvzz/verdant-plant-care)
- Or the developer contact email on the App Store / Play listing when published.

## Changes

We may update this policy. Material changes will bump the “Last updated” date and ship with the app.
