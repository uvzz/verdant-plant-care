# Verdant Design System — Glasshouse Specimen

**Version:** 0.2.0-design  
**Date:** 2026-07-11  
**Aesthetic:** Glasshouse Specimen — cool conservatory light, museum labels, photo-first immersion.

## Brief

| | |
|---|---|
| **Product** | Multi-niche plant care journal |
| **Audience** | Collectors who photograph plants obsessively |
| **Job** | Make care feel calm and progress visible |
| **Risk** | Reject spa-green plant-app clichés; use cool mist linen + chartreuse growth tip + specimen labels |

## Tokens

### Color

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `#14201B` | Primary text, icons |
| `ink-soft` | `#5A6B64` | Secondary text |
| `mist` | `#D9E2DC` | Soft fills, chips |
| `paper` | `#EEF2EF` | App background (cool linen, not warm cream) |
| `glass` | `#FFFFFF` | Cards, sheets |
| `lichen` | `#6F8F63` | Selected / healthy state |
| `growth` | `#C6D45A` | Primary CTA, “new growth” signature |
| `growth-ink` | `#2A3318` | Text on growth buttons |
| `copper` | `#B56A4A` | Overdue only |
| `line` | `#C9D4CD` | Hairlines, borders |
| `night` | `#0F1612` | Photo overlays, immersive detail |

### Typography

| Role | Face | Use |
|------|------|-----|
| Display | **Fraunces** (soft optical size) | Plant names, screen titles |
| Body | **Outfit** | UI, buttons, notes |
| Meta | **Outfit** 500 / small caps tracking | Specimen labels, kicker text |

### Type scale (mobile)

| Name | Size / line / weight |
|------|----------------------|
| Display L | 32 / 38 / Fraunces 600 |
| Display M | 24 / 30 / Fraunces 600 |
| Title | 17 / 22 / Outfit 600 |
| Body | 15 / 22 / Outfit 400 |
| Meta | 12 / 16 / Outfit 500, letter-spacing 0.04em |
| Micro | 11 / 14 / Outfit 500, uppercase tracking |

### Spacing

Base unit **4**. Common: 8, 12, 16, 20, 24, 32.  
Screen horizontal padding: **20**.  
Card radius: **20**. Image radius: **16–24**. FAB: **16**.

### Signature element

**Specimen label strip** — a thin museum-style bar under or over photos:

```
MOONLIGHT · Philodendron hederaceum · 💧 due today
```

Italic species · thin middots · quiet meta. Not badge spam.

### Motion

- Screen enter: 220ms ease-out fade + 8px rise  
- Care log success: growth button briefly pulses once  
- Prefer reduced motion: opacity only  

### Components

1. **Plant tile** — square photo, specimen strip, no heavy shadows (soft 0 8 24 ink/6%)  
2. **Due filament** — 2px track under label; copper if overdue, lichen if ok, growth if today  
3. **Primary button** — growth fill, growth-ink text, 14 radius, 52 height  
4. **Secondary button** — glass fill, line border  
5. **Sheet modal** — paper bg, 24 top radius, drag affordance  
6. **Tab bar** — glass, top hairline, growth for active icon/label  

## Screens

1. Splash / welcome  
2. My Plants (populated)  
3. My Plants (empty)  
4. Add Plant  
5. Plant Detail  
6. Progress gallery (tab on detail)  
7. Log Care  
8. Care calendar  
9. Settings + Premium  

## Anti-patterns (avoid)

- Warm cream + terracotta spa palette  
- Generic leaf emoji overload as primary iconography  
- Dense form walls without photo hierarchy  
- Loud gradients and glassmorphism stacked  

## Implementation

- Interactive mockups: `design/screens.html`  
- App tokens: `constants/Colors.ts`  
- Fonts: Expo Google Fonts Fraunces + Outfit (or system fallbacks until linked)
