# Verdant — Plant Care Tracker Design

**Date:** 2026-07-11  
**Status:** Approved  
**Version:** 0.1.0 MVP

## Summary

Verdant is a photo-first, multi-niche plant care tracker for iOS and Android (Expo / React Native). It prioritizes calm, premium photo presentation over generic utility UI.

## Goals

- Help collectors track plants across niches (houseplant, orchid, succulent, cactus, fern, herb, other)
- Make care logging fast and visual
- Show growth progress through galleries over time
- Provide gentle care calendar + local notifications
- Scaffold freemium monetization without full billing in v0.1

## Non-goals (v0.1)

- Real App Store / Play billing
- Cloud sync / multi-device accounts
- AI plant identification
- Family sharing backend

## Architecture

- **Client:** Expo Router, TypeScript, React Native
- **State:** React Context + AsyncStorage
- **Media:** expo-image-picker, expo-image (local URIs)
- **Notifications:** expo-notifications (local scheduled)
- **Theme:** Sage / cream botanical palette, light + dark

## Data model

### Plant

id, name, species, category, photoUri, acquiredDate, location, waterIntervalDays, fertilizeIntervalDays, notes, createdAt, updatedAt

### CareLog

id, plantId, type (water | fertilize | note | photo), note, photoUri, createdAt

### Settings

isPremium, notificationsEnabled

## Screens

1. My Plants (grid)
2. Add Plant (modal)
3. Plant Detail (hero, due cards, log / progress tabs)
4. Log Care (modal)
5. Care calendar
6. Settings (notifications, premium demo, about)

## Freemium

- Free: max 5 plants
- Premium (demo toggle): unlimited plants; UI copy for guides / family sharing / stats

## Ops

- Git version control in `Documents/verdant-plant-care`
- Notion project hub + Version Logs database
