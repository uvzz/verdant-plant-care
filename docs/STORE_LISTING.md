# Verdant — App Store & Play listing pack

Use this copy when creating listings. Screenshots: capture from Simulator after unlock Premium + a few sample plants (see checklist below).

## App name

**Verdant**

## Subtitle (iOS, 30 chars)

`Local plant journal + AI care`

## Short description (Play, 80 chars)

`Local-first plant journal. Check soil before watering. Premium AI identify.`

## Full description

```
Verdant is a calm, photo-first plant care journal for houseplants, orchids, succulents, and more.

WHY VERDANT
• Local-first — photos and care history stay on your phone
• Check before water — “Still moist” snooze instead of blind schedules
• Light + pot-aware watering rhythms (no autopilot overwatering)
• Rooms, pet safety flags, family caretakers
• Export / import JSON backups — no cloud lock-in
• Premium AI (server-side): identify, care guide, gentle coach
• Honest Premium — free journal works; AI is clearly Premium

FREE
• Up to 5 plants
• Care calendar, logs, photos, insights stats
• Family household + care sheets
• Export & import

PREMIUM
• Unlimited plants
• AI plant identify from photo (light + pet safety suggestions)
• AI care guide & coach
• AI collection insight

Not medical or veterinary advice — educational plant care only.
```

## Keywords (iOS)

`plant,care,water,succulent,orchid,houseplant,garden,journal,reminder,ai`

## Categories

- Primary: Lifestyle  
- Secondary: Education / Productivity  

## Support URL

`https://github.com/uvzz/verdant-plant-care/issues`

## Marketing URL (optional)

`https://github.com/uvzz/verdant-plant-care`

## Privacy policy URL

`https://github.com/uvzz/verdant-plant-care/blob/main/docs/legal/PRIVACY.md`

## Terms URL

`https://github.com/uvzz/verdant-plant-care/blob/main/docs/legal/TERMS.md`

## Screenshot checklist (6.7" / phone)

1. **My Plants** grid with 4+ plants and care filaments  
2. **Calendar** with “Still moist” / Watered actions  
3. **Plant detail** due cards + profile chips (light, pot, pets)  
4. **AI assist** tab (Premium) with guide or coach  
5. **Settings** Premium + family section  
6. **Welcome** glasshouse intro  

Capture: Simulator → Device → Screenshot, or `xcrun simctl io booted screenshot`.

## Feature graphic (Play, 1024×500)

Use `assets/store/feature-graphic.png` (night green + leaf mark + “Verdant”).

## IAP copy

| Product | ID | Display |
|---------|-----|---------|
| Yearly Premium | `com.verdant.plantcare.premium.yearly` | Unlimited plants + AI · billed yearly |
| Lifetime | `com.verdant.plantcare.premium.lifetime` | Unlimited plants + AI · one-time |

## Review notes for Apple/Google

```
Demo Premium: Settings → Unlock Premium (dev builds use demo unlock; production uses StoreKit/Play).
AI requires network; OpenRouter key is server-only on Cloudflare Worker verdant-ai.
No login required. Account deletion N/A (local data — user can delete app / export).
```
