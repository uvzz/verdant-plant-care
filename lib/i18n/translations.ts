/**
 * Verdant translation catalog.
 *
 * English (`en`) is the source of truth — every other language is expected to
 * mirror its keys, and `translate()` falls back to English for any key a
 * language is missing. Keys are flat dotted strings grouped by surface
 * (nav.*, welcome.*, settings.*). Placeholders use `{name}` syntax and are
 * filled by `interpolate()`.
 *
 * To add a language: add its code to `LanguageCode`, a row to
 * `SUPPORTED_LANGUAGES`, and a catalog block below. Untranslated keys still
 * render (in English) until filled in.
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'de';

export interface LanguageMeta {
  code: LanguageCode;
  /** Name in the language itself, shown in the picker. */
  nativeName: string;
  /** English name, shown as a secondary label. */
  englishName: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export type Messages = Record<string, string>;

const en: Messages = {
  // Tab bar
  'tabs.plants': 'Plants',
  'tabs.care': 'Care',
  'tabs.insights': 'Insights',
  'tabs.settings': 'Settings',
  'tabs.plantsA11y': 'My plants',
  'tabs.careA11y': 'Care calendar',
  'tabs.insightsA11y': 'Collection insights',
  'tabs.settingsA11y': 'Settings',

  // Navigation / screen titles
  'nav.addPlant': 'Add plant',
  'nav.editPlant': 'Edit plant',
  'nav.plant': 'Plant',
  'nav.logCare': 'Log care',
  'nav.privacy': 'Privacy policy',
  'nav.terms': 'Terms of use',

  // Legal screens (app/legal/privacy.tsx, app/legal/terms.tsx) — this is UI
  // chrome (the "Last updated" line), not legal prose, so the SECTIONS-body
  // carve-out in those files (professional-translation-needed legal text
  // stays English) does not cover it. {date} is the file's own hardcoded
  // revision-date string, passed through untouched.
  'legal.lastUpdated': 'Last updated: {date}',

  // Welcome — value pane
  'welcome.valueHeadline': 'Care you can\nsee grow.',
  'welcome.valueSub':
    'A calm, photo-first plant journal that asks you to check the soil before watering — never blind schedules.',
  'welcome.previewWater': 'Water in 3 days · check soil first',
  'welcome.continue': 'Continue',
  // Welcome — privacy pane
  'welcome.privacyMark': 'Yours, privately',
  'welcome.privacyHeadline': 'Private by\ndefault.',
  'welcome.offlineTitle': 'Works fully offline',
  'welcome.offlineBody':
    'Your plants and photos live on your device. No account needed to start.',
  'welcome.syncTitle': 'Sign in only to sync',
  'welcome.syncBody':
    'Optional Apple or Google sign-in backs up and syncs across your devices.',
  'welcome.aiTitle': 'Premium AI, safely',
  'welcome.aiBody':
    'Plant ID and coaching run on our servers — no API key ever on your phone.',
  'welcome.startCollection': 'Start your collection',
  'welcome.signInSync': 'Sign in to back up & sync',
  'welcome.haveePlants': 'I already have plants',

  // Settings — header & collection
  'settings.title': 'Settings',
  'settings.collectionTitle': 'Your collection',
  'settings.collectionSummary': '{count} of {limit} plants · {tier} · {source}',
  'settings.tierPremium': 'Premium',
  'settings.tierFree': 'Free',

  // Settings — premium card
  'settings.premiumBadge': 'Premium',
  'settings.premiumActive': 'Premium active',
  'settings.premiumUnlock': 'Unlock Premium',
  'settings.premiumBlurb':
    'Unlimited plants + server AI. Product IDs ready for App Store / Play ({productId}).',
  'settings.colFeature': 'Feature',
  'settings.colFree': 'Free',
  'settings.colPremium': 'Premium',
  'settings.benefitPlants': 'Plants in your collection',
  'settings.benefitCalendar': 'Check-before-water calendar',
  'settings.benefitFamily': 'Family household & care sheets',
  'settings.benefitAi': 'AI plant identify + coach',
  'settings.benefitSync': 'Cloud backup & device sync',
  'settings.valueUpTo': 'Up to {limit}',
  'settings.valueUnlimited': 'Unlimited',
  'settings.valueIncluded': 'Included',
  'settings.valueServerAi': 'Server AI',
  'settings.valueAutomatic': 'Automatic',
  'settings.valueNone': '—',
  // Primary conversion CTA on the Settings premium card — mirrors
  // paywall.yearlyCta's "Go Premium · {price}" pattern (composed via a
  // placeholder, never a `${PREMIUM_DISPLAY.yearlyLabel} · ${price}`
  // template literal — Constraint 3).
  'settings.buyYearlyCta': 'Premium · yearly · {price}',
  'settings.restore': 'Restore purchases',
  'settings.switchFreeDemo': 'Switch to Free (demo)',
  'settings.managePlan': 'Manage plan in system Settings',
  'settings.storeFootnoteDev':
    'Dev: purchase uses demo unlock until StoreKit / Play is linked in EAS builds.',
  'settings.storeFootnoteProd':
    'Purchases process through Apple / Google when store products are live.',

  // Settings — billing alerts
  'settings.purchaseUnavailable': 'Purchase unavailable',
  'settings.premiumUnlockedTitle': 'Premium unlocked',
  'settings.premiumUnlockedDemo':
    'Development demo unlock. Store products go live with EAS production builds + App Store / Play SKUs.',
  'settings.premiumUnlockedThanks': 'Thank you — Premium is active.',
  'settings.restoreTitle': 'Restore',
  'settings.restoredTitle': 'Restored',
  'settings.restoredBody': 'Your Premium purchase was restored.',
  'settings.noPurchasesTitle': 'No purchases found',
  'settings.noPurchasesBody':
    'No active Verdant Premium subscription on this store account yet.',
  'settings.manageSubTitle': 'Manage subscription',
  'settings.manageSubBody':
    'Cancel or change Premium in iOS Settings → Apple ID → Subscriptions, or Google Play → Payments & subscriptions.',

  // Settings — language
  'settings.languageTitle': 'Language',
  'settings.languageBlurb':
    'Choose the language for Verdant. Follows your device language until you pick one here.',

  // Settings — family sharing
  'settings.familyTitle': 'Family sharing',
  'settings.familyBlurb':
    'Local household — assign caretakers and share care sheets. Link devices from Backup & sync above.',
  'settings.householdName': 'Household name',
  'settings.householdPlaceholder': 'e.g. Our glasshouse',
  'settings.members': 'Members',
  'settings.membersEmpty':
    'No members yet — add partners, roommates, or kids who help water.',
  'settings.roleOwner': 'owner',
  'settings.roleMember': 'member',
  'settings.remove': 'Remove',
  'settings.removeMemberTitle': 'Remove member?',
  'settings.cancel': 'Cancel',
  'settings.namePlaceholder': 'Name',
  'settings.add': 'Add',
  'settings.nameNeededTitle': 'Name needed',
  'settings.nameNeededBody': 'Enter a family member name.',
  'settings.shareCareSheet': 'Share care sheet',
  'settings.inviteFamily': 'Invite family (instructions)',
  'settings.shareFailed': 'Share failed',

  // Settings — AI assistant
  'settings.aiTitle': 'AI assistant',
  'settings.aiBlurb':
    'Identify plants from photos and get calm care coaching. AI runs on Verdant’s servers — no keys or accounts on your device.',
  'settings.aiStatusPremium': 'Status: Premium · AI unlocked',
  'settings.aiStatusFree': 'Status: Free · upgrade for AI',
  'settings.aiEndpoint': 'Endpoint: {url}',

  // Settings — notifications
  'settings.notificationsTitle': 'Gentle notifications',
  'settings.notificationsBlurb': 'Local reminders to check soil when care is due.',
  'settings.notificationsDisabledTitle': 'Notifications disabled',
  'settings.notificationsDisabledBody':
    'Enable notifications in system settings to receive gentle reminders.',

  // Settings — about
  'settings.aboutTitle': 'About',
  'settings.aboutBody':
    '{appName} v{version}\nA calm, photo-first plant journal. Works fully offline — sign in to back up and sync across devices.',
  'settings.privacyPolicy': 'Privacy policy',
  'settings.termsOfUse': 'Terms of use',

  // Paywall
  'paywall.eyebrow': 'Verdant Premium',
  'paywall.title': 'Grow without limits.',
  'paywall.subtitle':
    'Keep every plant, let AI name and coach them, and back it all up across your devices.',
  'paywall.reasonLimit': 'You’ve filled your {limit} free plants. Go unlimited.',
  'paywall.reasonAi': 'AI identify & coaching are part of Premium.',
  'paywall.reasonSync': 'Cloud backup & sync are part of Premium.',
  'paywall.reasonInsights': 'AI collection insights are part of Premium.',
  'paywall.benefitUnlimited': 'Unlimited plants',
  'paywall.benefitUnlimitedBody': 'Grow your whole collection — no 5-plant cap.',
  'paywall.benefitAi': 'AI identify & care coach',
  'paywall.benefitAiBody': 'Snap a photo for species, schedule, and gentle coaching.',
  'paywall.benefitSync': 'Cloud backup & sync',
  'paywall.benefitSyncBody': 'Your plants and photos, safe and on every device.',
  'paywall.benefitInsights': 'Collection insights',
  'paywall.benefitInsightsBody': 'Streaks, activity, and an AI note on how you’re doing.',
  'paywall.yearlyCta': 'Go Premium · {price}',
  'paywall.yearlyTrialCta': 'Start 7-day free trial',
  'paywall.yearlyTrialSub': 'then {price}/year · cancel anytime',
  'paywall.lifetimeCta': 'Pay once, keep forever · {price}',
  'paywall.restore': 'Restore purchases',
  'paywall.legal':
    'Billed through the App Store or Google Play. Cancel anytime in your account settings.',
  'paywall.unlockedTitle': 'Welcome to Premium',
  'paywall.unlockedBody': 'Everything’s unlocked. Happy growing.',
  'paywall.unlockedDemo':
    'Development demo unlock. Real purchases go live in store builds.',
  'paywall.unavailableTitle': 'Purchase unavailable',
  'paywall.restoredTitle': 'Restored',
  'paywall.restoredBody': 'Your Premium purchase is active again.',
  'paywall.noPurchasesTitle': 'No purchases found',
  'paywall.noPurchasesBody': 'No active Verdant Premium on this store account yet.',
  'nav.paywall': 'Verdant Premium',

  // Domain — shared vocabulary for stored enum values (Plant.category,
  // lightLevel, potSize, petToxicity, CareLog.type). The enum keys themselves
  // are persisted/synced and never translated (Constraint 2) — only these
  // display labels are.
  'domain.light.low': 'Low light',
  'domain.light.medium': 'Medium',
  'domain.light.bright': 'Bright indirect',
  'domain.light.direct': 'Direct sun',
  'domain.pot.small': 'Small pot',
  'domain.pot.medium': 'Medium pot',
  'domain.pot.large': 'Large pot',
  'domain.pet.unknown': 'Pets: unknown',
  'domain.pet.safe': 'Pet-safe',
  'domain.pet.caution': 'Pets: caution',
  'domain.pet.toxic': 'Toxic to pets',
  'domain.careType.water': 'Watered',
  'domain.careType.fertilize': 'Fertilized',
  'domain.careType.note': 'Note',
  'domain.careType.photo': 'Photo',
  'domain.careType.check': 'Soil check',
  // Present-tense care-action words ("Water" / "Fertilize") — shared by the
  // Care calendar row meta line/accessibility label (see careVerbLabel in
  // lib/calendarLabels.ts) and the plant detail screen's due-card titles.
  // Deliberately distinct from the past-tense domain.careType.* above, which
  // labels a *completed* log entry (action chips, history badges).
  'domain.careAction.water': 'Water',
  'domain.careAction.fertilize': 'Fertilize',
  'domain.category.Houseplant': 'Houseplant',
  'domain.category.Orchid': 'Orchid',
  'domain.category.Succulent': 'Succulent',
  'domain.category.Cactus': 'Cactus',
  'domain.category.Fern': 'Fern',
  'domain.category.Herb': 'Herb',
  'domain.category.Other': 'Other',

  // Domain — relative-care dates (lib/care.ts relativeCareLabel). Distinct
  // one/many keys per Constraint 4 — there is no plural engine.
  'domain.care.overdueOne': '1 day overdue',
  'domain.care.overdueMany': '{count} days overdue',
  'domain.care.dueToday': 'Due today',
  'domain.care.dueTomorrow': 'Due tomorrow',
  'domain.care.inDays': 'In {count} days',

  // Domain — AI identification confidence (Plant.aiIdentityConfidence /
  // PlantIdResult.confidence) and AI coach urgency (CareCoachResult.urgency /
  // StoredCoachEntry.urgency, persisted on Plant.aiCoachHistory). Both are
  // stored values (Constraint 2) — only these display labels are localized.
  'domain.confidence.high': 'High',
  'domain.confidence.medium': 'Medium',
  'domain.confidence.low': 'Low',
  'domain.urgency.none': 'None',
  'domain.urgency.watch': 'Watch',
  'domain.urgency.soon': 'Soon',
  'domain.urgency.urgent': 'Urgent',
  // Domain — camera flash mode (app/camera.tsx, Task 7b). Screen-local
  // component state, not persisted/synced, but the same rule applies as the
  // stored enums above (Constraint 2): the FlashMode value itself ('off' /
  // 'on' / 'auto') stays untranslated in state, comparisons, and the native
  // CameraView prop — only this display label is localized.
  'domain.flash.off': 'Off',
  'domain.flash.on': 'On',
  'domain.flash.auto': 'Auto',

  // Plants — home screen ("My Plants")
  'plants.title': 'My Plants',
  'plants.searchPlaceholder': 'Search name, species, room…',
  'plants.categoryAll': 'All',
  'plants.roomAll': 'All rooms',
  // Subtitle line — whole-sentence keys chosen by branch (premium tier ×
  // filtered-or-not), split one/many per Constraint 4. See
  // lib/plantsSubtitle.ts for the selection logic.
  'plants.subtitleFreeOne': '1 plant · Free up to {limit}',
  'plants.subtitleFreeMany': '{count} plants · Free up to {limit}',
  'plants.subtitlePremiumOne': '1 plant · Premium',
  'plants.subtitlePremiumMany': '{count} plants · Premium',
  'plants.subtitleFreeFilteredOne': '1 plant · Free up to {limit} · showing {shown}',
  'plants.subtitleFreeFilteredMany':
    '{count} plants · Free up to {limit} · showing {shown}',
  'plants.subtitlePremiumFilteredOne': '1 plant · Premium · showing {shown}',
  'plants.subtitlePremiumFilteredMany': '{count} plants · Premium · showing {shown}',
  'plants.emptyTitle': 'Your glasshouse is quiet',
  'plants.emptyBody':
    'Add a plant with a portrait. Use AI identify to fill species and care intervals — then set room, light, and pot so schedules stay smart.',
  'plants.addFirstPlant': 'Add your first plant',
  'plants.noMatchesTitle': 'No matches',
  'plants.noMatchesBody': 'Try another search, category, or room filter.',
  'plants.clearFilters': 'Clear filters',
  'plants.addPlant': 'Add a plant',
  'plants.upgradeTitle': 'You’ve filled your {limit} free plants',
  'plants.upgradeSubtitle': 'Go Premium for unlimited plants, AI, and cloud sync →',
  'plants.upgradeA11y': 'Upgrade to Premium for unlimited plants',

  // Calendar — Care calendar screen ("Gentle reminders")
  'calendar.eyebrow': 'Care calendar',
  'calendar.title': 'Gentle reminders',
  'calendar.subtitle': 'Soft nudges to check your plants — not orders to water.',
  // Week strip — the 7-day accessibility strip above the list
  // (components/WeekStrip.tsx). `{date}` is fed in from the untouched
  // `format(day, 'EEEE d')` call; distinct none/one/many keys per
  // Constraint 4 rather than pluralizing "due" at render time.
  'calendar.weekStripA11y': 'Next seven days',
  'calendar.weekStripDayNone': '{date}',
  'calendar.weekStripDayOne': '{date}, 1 due',
  'calendar.weekStripDayMany': '{date}, {count} due',
  'calendar.emptyStateTitle': 'Nothing scheduled yet',
  'calendar.emptyStateBody':
    'Add plants with water and fertilize intervals to build a calm care calendar.',
  'calendar.emptyStateAction': 'Add a plant',
  // Philosophy card — full version (new users) and its one-line collapsed
  // form once the user has logged a handful of care actions (see
  // `experienced` in calendar.tsx). `{days}` is MOISTURE_SNOOZE_DAYS —
  // interpolated, never spliced into the string (Constraint 3).
  'calendar.philosophyTitle': 'Check before water',
  'calendar.philosophyBody':
    'Stick a finger in the soil. If it’s still damp, tap Still moist (+{days}d). Swipe a card right to log watering. Intervals also adapt to pot size and light.',
  'calendar.philosophyCollapsed': 'Swipe a card right to log · check soil before watering',
  // Section headings + each section's empty label
  'calendar.sectionOverdue': 'Overdue',
  'calendar.sectionToday': 'Today',
  'calendar.sectionUpcoming': 'Upcoming',
  'calendar.emptyOverdue': 'You’re all caught up',
  'calendar.emptyToday': 'No care due today',
  'calendar.emptyUpcoming': 'No upcoming care',
  // Row meta line under the plant name ("Water · Due today" /
  // "Water · Due today · Living room") and the row accessibilityLabel —
  // single keys with placeholders, never assembled from glued fragments.
  'calendar.rowMeta': '{careVerb} · {relative}',
  'calendar.rowMetaWithLocation': '{careVerb} · {relative} · {location}',
  'calendar.rowA11yLabel':
    '{name}, {careVerb}, {relative}. Tap for plant, long-press to log.',
  // Interval hint line — see intervalHintLabel in lib/calendarLabels.ts.
  'calendar.intervalWater': '~every {days}d (light/pot-aware)',
  'calendar.intervalWaterCheckFirst':
    '~every {days}d (light/pot-aware) · check soil first',
  'calendar.intervalFertilize': 'every {days}d',
  // Action chips + swipe-to-complete labels. Keep these tight — the chips
  // sit several-to-a-row on narrow screens.
  'calendar.actionStillMoist': 'Still moist',
  'calendar.actionLog': 'Log',
  'calendar.actionDetails': 'Details',
  // "Fed" is the swipe panel's short label for a fertilize action (the swipe
  // panel is narrower than the chip row); "Watered" reuses
  // domain.careType.water since the two are identical words.
  'calendar.swipeFed': 'Fed',
  // Toasts
  'calendar.toastWatered': 'Watered {name}',
  'calendar.toastFed': 'Fed {name}',
  'calendar.toastSnoozed': '{name} · snoozed {days}d',
  'calendar.toastError': 'Could not save — try again',

  // Insights — collection stats + AI coach screen
  'insights.title': 'Insights',
  // Header subtitle: fixed lead-in + a tail that differs by premium state.
  // `{tail}` is filled with the *already translated* tail string (see
  // insights.subtitleTailPremium/Free below) — mirrors calendar.rowMeta's
  // pattern of composing pre-translated pieces via a placeholder rather than
  // gluing raw fragments (Constraint 3).
  'insights.subtitle': 'Care history and AI collection coaching. {tail}',
  'insights.subtitleTailPremium': 'Premium · server AI unlocked.',
  'insights.subtitleTailFree': 'Free · AI requires Premium.',
  'insights.emptyTitle': 'No data yet',
  'insights.emptyBody': 'Add plants and log care to unlock stats and AI insights.',
  'insights.emptyAction': 'Add a plant',
  // Stat tile labels — half-width cards under a 26px number; keep tight.
  'insights.statPlants': 'Plants',
  'insights.statCareLogs': 'Care logs',
  'insights.statStreak': 'Streak',
  'insights.statOverdue': 'Overdue',
  'insights.statA11yLabel': '{label}: {value}',
  'insights.tapForCareList': 'Tap for care list',
  // Streak tile value ("5d"). Abbreviated unit suffix, not a plural word —
  // same treatment as calendar.intervalWater/intervalFertilize, which also
  // never split one/many for their {days}d/j/T suffix.
  'insights.streakValue': '{count}d',
  'insights.activityTitle': 'Activity (14 days)',
  'insights.last7and30': 'Last 7 days: {sevenDays} · Last 30 days: {thirtyDays}',
  'insights.breakdownTitle': 'Breakdown',
  // Breakdown row labels — four-to-a-row, keep tight.
  'insights.breakdownWater': 'water',
  'insights.breakdownFeed': 'feed',
  'insights.breakdownNotes': 'notes',
  'insights.breakdownPhotos': 'photos',
  // "{count} logs" pluralizes — distinct one/many keys per Constraint 4.
  'insights.mostActiveOne': 'Most active: {name} (1 log)',
  'insights.mostActiveMany': 'Most active: {name} ({count} logs)',
  // Category legend row. `{category}` is the already-translated
  // domain.category.* value — see lib/care.ts's CareLabel-composition
  // pattern; the stored enum itself is never translated (Constraint 2).
  'insights.categoryRow': '{category} · {count}',
  'insights.dueToday': 'Due today: {count}',
  'insights.aiTitle': 'AI collection insight',
  'insights.aiBodyPremium':
    'A short coach note from your stats. Premium AI · ~{usesLeft} soft uses left today on this device.',
  'insights.aiBodyFree':
    'Premium only — unlock in Settings for a calm coach note on your collection.',
  'insights.aiButtonGenerate': 'Generate insight',
  'insights.aiButtonThinking': 'Thinking…',
  'insights.aiButtonUnlock': 'Unlock Premium for AI',
  'insights.aiHintGenerate': 'Uses Premium AI for a short collection note',
  'insights.aiHintUnlock': 'Opens the Premium upgrade screen',
  // Alert.alert calls — ours, so they get keys. The AI's returned text and
  // e.message from a thrown error stay untranslated (model/dynamic output).
  'insights.alertNoPlantsTitle': 'No plants yet',
  'insights.alertNoPlantsBody': 'Add plants and care logs first.',
  'insights.alertAiLimitTitle': 'AI limit',
  'insights.alertInsightFailedTitle': 'Insight failed',
  'insights.alertUnknownError': 'Unknown error',

  // Detail — plant detail screen (app/plant/[id].tsx)
  // Header Edit/Delete buttons + delete confirmation
  'detail.headerEdit': 'Edit',
  'detail.headerEditA11y': 'Edit plant',
  'detail.headerDelete': 'Delete',
  'detail.headerDeleteA11y': 'Delete plant',
  'detail.deleteAlertTitle': 'Remove plant?',
  'detail.deleteAlertBody':
    'Delete {name} and its care history? This cannot be undone.',
  'detail.cancel': 'Cancel',
  'detail.notFound': 'Plant not found.',
  // Hero meta line — see heroMetaLabel/plantAgeLabel in lib/detailLabels.ts.
  // Four whole-fragment keys chosen by branch (location × age presence),
  // never glued fragments (Constraint 3); the age fragment itself splits
  // one/many (Constraint 4).
  'detail.heroMeta': '{category}',
  'detail.heroMetaLocation': '{category} · {location}',
  'detail.heroMetaAge': '{category} · {age}',
  'detail.heroMetaLocationAge': '{category} · {location} · {age}',
  'detail.heroAgeOne': '1d with you',
  'detail.heroAgeMany': '{days}d with you',
  // Profile chip — water rhythm. light/pot/pet chips reuse domain.* from
  // Task 1 (no new keys needed for those).
  'detail.waterRhythmChip': '~{days}d water rhythm',
  // Action buttons + their care-log toast/error. "Watered" reuses
  // domain.careType.water (no new key); "Water"/"Fertilize" due-card titles
  // reuse domain.careAction.* (no new keys either).
  'detail.actionWateredHint': 'Opens care log to record watering',
  'detail.actionStillMoist': 'Still moist',
  'detail.actionSaving': 'Saving…',
  'detail.actionMoistHint': 'Logs a soil check and delays the water reminder',
  'detail.toastSnoozed': 'Snoozed ~{days} days · check soil again later',
  'detail.saveErrorTitle': 'Could not save',
  'detail.saveErrorBody': 'Try again in a moment.',
  'detail.actionFed': 'Fed',
  'detail.actionNotePhoto': 'Note / photo',
  // Tab labels — three-across, keep tight (Constraint 7)
  'detail.tabLog': 'Care log',
  'detail.tabGallery': 'Progress',
  'detail.tabAi': 'AI assist',
  // Care log tab
  'detail.logEmpty':
    'No care entries yet. Log watering, feeding, notes, and photos as you go.',
  // CareLogRow (components/CareLogRow.tsx) — the delete-confirmation alert
  // and long-press hint for a single care-log row. Rendered only by this
  // screen's Care log tab; treated as this task's territory per the
  // WeekStrip precedent (.superpowers/sdd/progress.md).
  'detail.logRowDeleteTitle': 'Delete entry?',
  'detail.logRowDeleteBody': 'Remove this care log item.',
  'detail.logRowDeleteAction': 'Delete',
  'detail.logRowLongPressHint': 'Long-press to delete',
  // Progress (gallery) tab
  'detail.galleryEmpty': 'Add a portrait or care photos to watch growth over time.',
  'detail.galleryPortraitLabel': 'Portrait',
  // AI assist tab — quota/status hint
  'detail.aiStatusPremium':
    'Premium AI · requests go to Verdant servers (key not on device)',
  'detail.aiStatusFree': 'Premium required for AI · educational only',
  // Re-identify card
  'detail.reidentifyTitle': 'Re-identify from photo',
  'detail.reidentifyBody':
    'Update species, category, and intervals using the current portrait.',
  // {confidence} is the already-translated domain.confidence.* value.
  'detail.reidentifyBodyConfidence':
    'Update species, category, and intervals using the current portrait. Last confidence: {confidence}.',
  'detail.reidentifyButtonIdle': 'AI re-identify',
  'detail.reidentifyButtonLoading': 'Identifying…',
  // Species care guide card. guide.title/light/water/humidity/soil/tips/
  // disclaimer are AI model output — never translated (Constraint 9); only
  // the section LABELS below (ours) are.
  'detail.careGuideTitle': 'Species care guide',
  'detail.careGuideBody': 'Saved on this plant after generation.',
  // {date} is the untouched date-fns-formatted generatedAt (Constraint 10).
  'detail.careGuideBodyLast': 'Saved on this plant after generation. Last: {date}.',
  'detail.careGuideButtonGenerate': 'Generate care guide',
  'detail.careGuideButtonRefresh': 'Refresh care guide',
  'detail.careGuideButtonLoading': 'Writing…',
  'detail.guideLabelLight': 'Light',
  'detail.guideLabelWater': 'Water',
  'detail.guideLabelHumidity': 'Humidity',
  'detail.guideLabelSoil': 'Soil',
  // Care coach card. result.assessment/recommendations/disclaimer and
  // h.question/assessment/recommendations are AI model output or user
  // content — never translated (Constraints 2/9); only the chrome below is.
  'detail.coachTitle': 'Care coach',
  'detail.coachBody': 'Uses log history and portrait. Answers are saved on this plant.',
  'detail.coachPlaceholder': 'e.g. Yellow tips on new leaves — what should I check?',
  // Seeds the coach TextInput's initial value (Constraint: user's own
  // editable free text, never persisted/synced without user intent — see
  // review item 5) and the short fallback used when the user clears the
  // field before submitting.
  'detail.coachDefaultQuestion': 'How is this plant doing? What should I do next?',
  'detail.coachDefaultQuestionShort': 'How is this plant doing?',
  'detail.coachButtonIdle': 'Ask care coach',
  'detail.coachButtonLoading': 'Thinking…',
  // {urgency} is the already-translated domain.urgency.* value.
  'detail.coachUrgency': 'Urgency · {urgency}',
  'detail.savedAnswersTitle': 'Saved answers',
  // Saved-answer history row — {date} is the untouched date-fns-formatted
  // createdAt (Constraint 10); {urgency} is the already-translated
  // domain.urgency.* value. A full key (not raw JSX concatenation) per this
  // catalog's established "A · B" pattern (calendar.rowMeta,
  // insights.categoryRow) — identical text in all four languages since no
  // language-specific word is involved, just the separator.
  'detail.historyMeta': '{date} · {urgency}',
  // Alerts
  'detail.aiLimitTitle': 'AI limit',
  'detail.coachFailedTitle': 'Care coach failed',
  'detail.guideFailedTitle': 'Care guide failed',
  'detail.photoNeededTitle': 'Photo needed',
  'detail.photoNeededBody': 'Add a plant photo first (Edit).',
  'detail.identifyFailedTitle': 'Identify failed',
  'detail.unknownError': 'Unknown error',
  'detail.aiUpdatedTitle': 'Updated from AI',
  // {commonName}/{scientificName} are raw AI-returned text (Constraint 9);
  // {confidence}/{light}/{pets} are already-translated domain.* values.
  // {pets} is the already-translated domain.pet.* value, which is itself
  // self-labelled ('Pets: unknown', 'Pet-safe', 'Toxic to pets', …) — no
  // "Pets:" prefix here, unlike {light} (domain.light.* is NOT
  // self-labelled, e.g. 'Bright indirect', so 'Light: {light}' stays as is).
  'detail.aiUpdatedBody':
    '{commonName}\nConfidence: {confidence}\nLight: {light} · {pets}',
  'detail.aiUpdatedBodyWithScientific':
    '{commonName} · {scientificName}\nConfidence: {confidence}\nLight: {light} · {pets}',

  // Form — Add / Edit plant screens (app/plant/add.tsx, app/plant/edit.tsx).
  // Shared field labels, placeholders, and alerts used by BOTH screens live
  // first (Task 6 brief: put shared labels under form.* and use them from
  // both files rather than duplicating a near-identical key per screen).
  // Category/light/pot/pet picker option text reuses domain.* from Task 1 —
  // no new keys needed for those.
  'form.labelName': 'Name',
  'form.labelSpecies': 'Species',
  'form.labelCategory': 'Category',
  'form.labelLocation': 'Room / location',
  'form.labelLight': 'Light at this spot',
  'form.labelPotSize': 'Pot size',
  'form.labelPetSafety': 'Pet safety',
  'form.labelAcquiredDate': 'Acquired date',
  'form.labelFertilizeDays': 'Fertilize every (days)',
  'form.labelNotes': 'Notes',
  'form.placeholderLocation': 'e.g. Living room · east window',
  'form.library': 'Library',
  'form.camera': 'Camera',
  // Shared validation alert — identical copy on both screens.
  'form.nameRequiredTitle': 'Name required',
  'form.nameRequiredBody': 'Give your plant a name (at least 2 characters).',
  // Shared photo-permission alert, used by add.tsx, edit.tsx, and log.tsx
  // (Task 7). add.tsx and edit.tsx previously had slightly different
  // wording for the same dialog ("Allow photo library access." vs "Allow
  // photo library access to add a plant photo.") — consolidated to one
  // shared key per the brief's "reuse, never duplicate" direction. Later
  // generalized from "…to add a plant photo." to "…to add a photo." (review
  // fix) once log.tsx started reusing this key too: on the Log-care screen
  // the photo attaches to a care-log entry, not the plant profile, so the
  // plant-specific wording was actively wrong there. Still reads correctly
  // on add.tsx/edit.tsx, just less specific.
  'form.photoPermissionTitle': 'Permission needed',
  'form.photoPermissionBody': 'Allow photo library access to add a photo.',
  // Shared "try again" retry body — used by both the add-failed alert
  // (app/plant/add.tsx) and the edit-save-failed alert (app/plant/edit.tsx).
  // Previously two byte-identical form.addFailedBody/form.editSaveFailedBody
  // keys per language; consolidated to one, since only the titles
  // (form.addFailedTitle vs form.editSaveFailedTitle) are legitimately
  // different.
  'form.retryBody': 'Try again in a moment.',

  // Add plant screen (app/plant/add.tsx) only.
  'form.photoPlaceholderAdd': 'Tap to choose a photo',
  'form.aiIdentifyLoading': 'Identifying…',
  'form.aiIdentifyButtonPremium': 'AI identify plant (Premium)',
  'form.aiIdentifyButtonPremiumOnly': 'AI identify (Premium only)',
  'form.aiIdentifyHint':
    'Premium: AI fills name, species, category, and intervals from your photo. Key stays on Verdant’s servers.',
  // AI identify result summary line. {commonName}/{scientificName} are raw
  // AI-returned text (Constraints 9/11 — never translated);
  // {confidence}/{light}/{pets} are the already-translated
  // domain.confidence.*/domain.light.*/domain.pet.* values. Mirrors
  // detail.aiUpdatedBody's exact wording convention ("Confidence:
  // {confidence}", "Light: {light} · {pets}" with {pets} self-labelled and
  // no extra prefix), just joined with · instead of newlines to fit this
  // screen's single-line hint.
  'form.aiHintResult':
    '{commonName} · Confidence: {confidence} · Light: {light} · {pets}',
  'form.aiHintResultWithScientific':
    '{commonName} ({scientificName}) · Confidence: {confidence} · Light: {light} · {pets}',
  'form.placeholderName': 'e.g. Moonlight',
  'form.placeholderSpecies': 'e.g. Philodendron hederaceum',
  'form.labelWaterDays': 'Water every (days)',
  'form.scheduleHint':
    'Schedules adapt to light + pot size. Calendar uses check-before-water (not blind “water now” like most care apps).',
  'form.placeholderNotes': 'Soil mix, provenance…',
  'form.saveButtonAdd': 'Save plant',
  'form.photoNeededTitle': 'Photo needed',
  'form.photoNeededBody': 'Add a plant photo first, then run AI identify.',
  'form.aiLimitTitle': 'AI limit',
  'form.identifyFailedTitle': 'AI identify failed',
  // Fallback for a thrown error with no .message (Constraint 9: the
  // message itself, when present, is dynamic/AI-related and stays
  // untranslated — only this fallback and the Alert title are ours).
  'form.unknownError': 'Unknown error',
  // Title reused for both the addPlant()-rejected path (body = dynamic
  // result.reason from lib/PlantContext.tsx, untranslated — see report) and
  // the generic catch-block fallback below.
  'form.addFailedTitle': 'Could not add plant',

  // Edit plant screen (app/plant/edit.tsx) only.
  'form.notFound': 'Plant not found.',
  'form.photoPlaceholderEdit': 'Add photo',
  'form.labelBaseWaterDays': 'Base water (days)',
  // One/many split (Constraint 4) — previewInterval comes from
  // effectiveWaterIntervalDays() (lib/care.ts), which can round down to 1,
  // and this key spells out the plural word "days" rather than using an
  // abbreviated {days}d suffix (contrast calendar.intervalWater, which never
  // splits one/many because its suffix is abbreviated).
  'form.waterRhythmHintOne':
    'Effective water rhythm ≈ every day (adjusted for light + pot — beats blind schedules that overwater).',
  'form.waterRhythmHintMany':
    'Effective water rhythm ≈ every {days} days (adjusted for light + pot — beats blind schedules that overwater).',
  'form.checkBeforeWaterTitle': 'Check soil before watering',
  // {stillMoist} is the already-translated calendar.actionStillMoist value,
  // composed via a placeholder rather than gluing raw text (Constraint 3) —
  // mirrors insights.subtitle's {tail} pattern of embedding a pre-translated
  // fragment. "Planta" is the competitor app's brand name — kept verbatim
  // in every language.
  'form.checkBeforeWaterBody':
    'Calendar shows “{stillMoist}” snooze — core Verdant vs Planta difference.',
  'form.labelCaretaker': 'Family caretaker',
  'form.caretakerAnyone': 'Anyone',
  'form.saveButtonEdit': 'Save changes',
  'form.editSaveFailedTitle': 'Could not save',

  // components/DateField.tsx — rendered exclusively by these two screens
  // (no other screen uses it), so its hardcoded strings are folded into
  // this task rather than left for Task 7/8, mirroring the WeekStrip
  // (Task 3) / CareLogRow (Task 5) precedent for a single-owner component.
  'form.datePickerLabel': 'Pick a date',
  'form.datePickerDone': 'Done',
  'form.datePickerDoneA11y': 'Done choosing date',

  // Log care screen (app/plant/log.tsx, Task 7). The care-type selector
  // reuses domain.careType.* from Task 1 (displays translated, writes the
  // raw stored CareLogType — Constraint 2); "Library"/"Camera" reuse
  // form.library/form.camera above — same photo-source buttons, a third
  // screen using them now.
  'log.subtitle': 'A quiet moment of care. Photos help you see seasons of growth.',
  'log.careTypeLabel': 'Care type',
  'log.noteLabel': 'Note',
  'log.notePlaceholder': 'New leaf almost open…',
  'log.photoLabel': 'Photo',
  'log.photoBoxPlaceholder': 'Tap to attach a photo',
  // {careType} is the already-translated domain.careType.* value, composed
  // via a placeholder rather than a `Save · ${...}` template literal
  // (Constraint 3).
  'log.saveButton': 'Save · {careType}',
  // Defensive-only alert (title, no body) — see the code comment at its
  // call site; this branch can't actually be reached since the component
  // never mounts the Save button while `plant` is falsy.
  'log.plantMissingTitle': 'Plant missing',
  'log.photoRequiredTitle': 'Photo required',
  'log.photoRequiredBody': 'Add a photo for a photo log entry.',
  // "Could not save" / "Try again in a moment." also exist as
  // detail.saveErrorTitle/Body and form.editSaveFailedTitle/form.retryBody —
  // an accepted per-screen duplicate (see form.notFound/detail.notFound
  // below for the same precedent on "Plant not found."), not a
  // shared-component defect.
  'log.saveErrorTitle': 'Could not save',
  'log.saveErrorBody': 'Try again in a moment.',
  'log.notFound': 'Plant not found.',

  // components/PhotoLightbox.tsx — rendered exclusively by the plant detail
  // screen (app/plant/[id].tsx), so its one hardcoded string is folded in
  // under detail.* per the WeekStrip/CareLogRow/DateField precedent, even
  // though it ships in Task 7 (.superpowers/sdd/progress.md).
  'detail.lightboxClose': 'Close',

  // Backup & sync card (components/CloudSyncCard.tsx, Task 7) — rendered
  // only from the Settings screen, which already owns settings.*; sync gets
  // its own settings.sync* sub-prefix, mirroring settings.ai*/
  // settings.notifications* above (a distinct, self-contained feature, not
  // a handful of shared verbs like settings.family*'s cancel/add/remove).
  'settings.syncTitle': 'Backup & sync',
  'settings.syncPremiumBlurb':
    'Premium: sign in once and your plants, care history, and photos back up automatically and follow you to any device.',
  // "Apple"/"Google" are brand names — passed as the already-decided
  // {provider} param, never translated (mirrors "Planta" elsewhere in this
  // catalog). Two whole-sentence keys (email present or not), not a glued
  // "{a}{b ? ` · ${b}` : ''}" fragment (Constraint 3).
  'settings.syncSignedInBlurb':
    'Signed in with {provider}. Everything syncs automatically — after changes, on app open, and when you return.',
  'settings.syncSignedInBlurbWithEmail':
    'Signed in with {provider} · {email}. Everything syncs automatically — after changes, on app open, and when you return.',
  // syncStatusLabel (lib/syncSchedule.ts) descriptor keys. {date} is the
  // untouched, device-locale `new Date(...).toLocaleString()` output — same
  // class of gotcha as DateField's native picker (Constraint-10-style
  // carve-out; see that function's own comment).
  // Also reused below as the "Sync now" button's loading label
  // (settings.syncNowButton) — same word, one key.
  'settings.syncStatusSyncing': 'Syncing…',
  'settings.syncStatusError': 'Couldn’t sync — will retry automatically.',
  'settings.syncStatusLast': 'Last synced {date}',
  'settings.syncStatusPending': 'First sync pending.',
  'settings.syncNowButton': 'Sync now',
  // Reused for both the "Sign out" button label and the destructive button
  // in its own confirmation alert below.
  'settings.syncSignOutButton': 'Sign out',
  'settings.syncDeleteButton': 'Delete synced data',
  'settings.syncDeletingButton': 'Deleting…',
  'settings.syncDeleteHint': 'Permanently removes your collection from the cloud',
  'settings.syncDeleteTitle': 'Delete synced data?',
  'settings.syncDeleteBody':
    'This permanently removes your plants, care history, and photos from the cloud, and signs you out. Your plants stay on this device — delete the app to remove them too. This cannot be undone.',
  'settings.syncDeleteConfirm': 'Delete',
  'settings.syncDeletedTitle': 'Synced data deleted',
  'settings.syncDeleteFailedTitle': 'Delete failed',
  'settings.syncDeletedBody':
    'Your cloud collection is gone and sync is off. Your plants are still on this device.',
  'settings.syncSignOutTitle': 'Sign out?',
  'settings.syncSignOutBody':
    'Sync pauses on this device. Your plants stay here and in your cloud backup.',
  'settings.syncSignInBlurb':
    'Sign in once — your plants, care history, and photos back up and sync automatically across devices.',
  'settings.syncAppleUnavailable':
    'Sign into an Apple Account in system Settings to enable Sign in with Apple.',
  'settings.syncGoogleButton': 'Continue with Google',
  // result.reason (Google/Apple/sync-code failures below) is a dynamic
  // provider/network error string (Constraint 9) — only these titles are
  // ours to translate.
  'settings.syncGoogleFailedTitle': 'Google sign-in failed',
  'settings.syncAppleSignedInTitle': 'Signed in',
  'settings.syncAppleSignedInBody': 'Your plants now back up and sync automatically.',
  'settings.syncAppleFailedTitle': 'Apple sign-in failed',
  'settings.syncFailedTitle': 'Sync failed',
  'settings.syncAdvancedHide': 'Hide advanced linking',
  'settings.syncAdvancedShow': 'Advanced: link with sync code',
  'settings.syncCodeHide': 'Hide this device’s code',
  'settings.syncCodeShow': 'Show this device’s code',
  'settings.syncCodeWarning': 'Treat it like a password.',
  'settings.syncCodePlaceholder': 'Paste a sync code…',
  'settings.syncLinkButton': 'Link',
  'settings.syncInvalidCodeTitle': 'Invalid code',
  'settings.syncLinkedTitle': 'Device linked',
  'settings.syncLinkedFailedTitle': 'Linked, but sync failed',
  // One/many split (Constraint 4) — pulledPlants spells out the plural noun
  // "plants" rather than an abbreviated suffix.
  'settings.syncLinkedBodyOne': 'Now sharing a collection (1 plant).',
  'settings.syncLinkedBodyMany': 'Now sharing a collection ({count} plants).',
  'settings.syncLinkedSyncing': 'Syncing your collection now…',

  // components/EmptyState.tsx and components/SwipeToComplete.tsx take all
  // their text as props (PrimaryButton-style) — nothing to key here. Swept
  // all 4 EmptyState call sites (Plants home ×2, Care calendar, Insights)
  // and confirmed each already passes translated t() strings from Tasks 2-4.

  // app/paywall.tsx — one accessibility label the sweep found missed by
  // every earlier task.
  'paywall.closeA11y': 'Close',

  // app/+not-found.tsx — Expo Router's default unmatched-route fallback.
  'notFound.title': 'Oops!',
  'notFound.body': 'This screen doesn’t exist.',
  'notFound.link': 'Go to home screen!',

  // Camera overlay (app/camera.tsx, Task 7b) — reachable from the Camera
  // button (form.camera) on add.tsx/edit.tsx/log.tsx. "Library"/"Camera"
  // photo-source buttons, the photo-permission alert, and the generic
  // Cancel label already exist as form.library/form.camera/
  // form.photoPermissionTitle/form.photoPermissionBody/settings.cancel —
  // none of this screen's own strings duplicate those, except the Back
  // button's accessibilityLabel, which reuses settings.cancel directly
  // (its semantic action *is* cancel, distinct from the visible "Back"
  // label) rather than adding a second byte-identical "Cancel" key.
  'camera.permissionTitle': 'Camera access',
  'camera.permissionBody':
    'Verdant needs the camera for plant portraits and progress photos. Photos stay on your device.',
  'camera.permissionAllow': 'Allow camera',
  'camera.permissionDismiss': 'Not now',
  'camera.closeA11y': 'Close camera',
  'camera.titleLive': 'Glasshouse camera',
  'camera.titleReview': 'Review portrait',
  // Rebuilt from a `Flash ${flash}` template literal (Constraint 3 + a raw
  // enum leak — flash is a persisted-shape FlashMode value, Constraint 2).
  // {mode} is the already-translated domain.flash.* label, composed via a
  // placeholder rather than splicing the raw stored value in, mirroring
  // insights.statA11yLabel's "{label}: {value}" pattern.
  'camera.flashA11y': 'Flash: {mode}',
  'camera.tip': 'Fill the frame with a leaf or whole plant · bright, even light works best',
  'camera.retake': 'Retake',
  'camera.retakeA11y': 'Retake photo',
  'camera.usePhoto': 'Use photo',
  'camera.usePhotoA11y': 'Use this photo',
  'camera.flip': 'Flip',
  'camera.flipA11y': 'Flip camera',
  'camera.captureA11y': 'Take photo',
  'camera.back': 'Back',
};

const es: Messages = {
  'paywall.eyebrow': 'Verdant Premium',
  'paywall.title': 'Crece sin límites.',
  'paywall.subtitle': 'Guarda todas tus plantas, deja que la IA las identifique y aconseje, y respáldalas en todos tus dispositivos.',
  'paywall.reasonLimit': 'Has llenado tus {limit} plantas gratuitas. Hazte ilimitado.',
  'paywall.reasonAi': 'La identificación y los consejos con IA forman parte de Premium.',
  'paywall.reasonSync': 'La copia y sincronización en la nube forman parte de Premium.',
  'paywall.reasonInsights': 'Los análisis de colección con IA forman parte de Premium.',
  'paywall.benefitUnlimited': 'Plantas ilimitadas',
  'paywall.benefitUnlimitedBody': 'Cultiva toda tu colección, sin el límite de 5 plantas.',
  'paywall.benefitAi': 'Identificación y guía con IA',
  'paywall.benefitAiBody': 'Haz una foto para especie, calendario y consejos.',
  'paywall.benefitSync': 'Copia y sincronización en la nube',
  'paywall.benefitSyncBody': 'Tus plantas y fotos, seguras y en todos tus dispositivos.',
  'paywall.benefitInsights': 'Análisis de colección',
  'paywall.benefitInsightsBody': 'Rachas, actividad y una nota de IA sobre tu progreso.',
  'paywall.yearlyCta': 'Hazte Premium · {price}',
  'paywall.yearlyTrialCta': 'Prueba gratis de 7 días',
  'paywall.yearlyTrialSub': 'luego {price}/año · cancela cuando quieras',
  'paywall.lifetimeCta': 'Paga una vez, para siempre · {price}',
  'paywall.restore': 'Restaurar compras',
  'paywall.legal': 'Facturado a través de App Store o Google Play. Cancela cuando quieras en los ajustes de tu cuenta.',
  'paywall.unlockedTitle': 'Bienvenido a Premium',
  'paywall.unlockedBody': 'Todo desbloqueado. Feliz cultivo.',
  'paywall.unlockedDemo': 'Desbloqueo de demostración. Las compras reales se activan en compilaciones de tienda.',
  'paywall.unavailableTitle': 'Compra no disponible',
  'paywall.restoredTitle': 'Restaurado',
  'paywall.restoredBody': 'Tu compra Premium está activa de nuevo.',
  'paywall.noPurchasesTitle': 'No se encontraron compras',
  'paywall.noPurchasesBody': 'Aún no hay Premium activo en esta cuenta de tienda.',
  'nav.paywall': 'Verdant Premium',
  'tabs.plants': 'Plantas',
  'tabs.care': 'Cuidado',
  'tabs.insights': 'Análisis',
  'tabs.settings': 'Ajustes',
  'tabs.plantsA11y': 'Mis plantas',
  'tabs.careA11y': 'Calendario de cuidado',
  'tabs.insightsA11y': 'Análisis de la colección',
  'tabs.settingsA11y': 'Ajustes',

  'nav.addPlant': 'Añadir planta',
  'nav.editPlant': 'Editar planta',
  'nav.plant': 'Planta',
  'nav.logCare': 'Registrar cuidado',
  'nav.privacy': 'Política de privacidad',
  'nav.terms': 'Términos de uso',
  'legal.lastUpdated': 'Última actualización: {date}',

  'welcome.valueHeadline': 'Cuidado que\nves crecer.',
  'welcome.valueSub':
    'Un diario de plantas tranquilo y con fotos que te pide comprobar la tierra antes de regar, nunca calendarios a ciegas.',
  'welcome.previewWater': 'Regar en 3 días · revisa la tierra primero',
  'welcome.continue': 'Continuar',
  'welcome.privacyMark': 'Tuyo, en privado',
  'welcome.privacyHeadline': 'Privado por\ndefecto.',
  'welcome.offlineTitle': 'Funciona sin conexión',
  'welcome.offlineBody':
    'Tus plantas y fotos viven en tu dispositivo. No necesitas una cuenta para empezar.',
  'welcome.syncTitle': 'Inicia sesión solo para sincronizar',
  'welcome.syncBody':
    'El inicio de sesión opcional con Apple o Google hace copia y sincroniza entre tus dispositivos.',
  'welcome.aiTitle': 'IA Premium, con seguridad',
  'welcome.aiBody':
    'La identificación y el asesoramiento se ejecutan en nuestros servidores: ninguna clave de API en tu teléfono.',
  'welcome.startCollection': 'Empieza tu colección',
  'welcome.signInSync': 'Inicia sesión para copiar y sincronizar',
  'welcome.haveePlants': 'Ya tengo plantas',

  'settings.title': 'Ajustes',
  'settings.collectionTitle': 'Tu colección',
  'settings.collectionSummary': '{count} de {limit} plantas · {tier} · {source}',
  'settings.tierPremium': 'Premium',
  'settings.tierFree': 'Gratis',

  'settings.premiumBadge': 'Premium',
  'settings.premiumActive': 'Premium activo',
  'settings.premiumUnlock': 'Desbloquea Premium',
  'settings.premiumBlurb':
    'Plantas ilimitadas + IA en servidor. IDs de producto listos para App Store / Play ({productId}).',
  'settings.colFeature': 'Función',
  'settings.colFree': 'Gratis',
  'settings.colPremium': 'Premium',
  'settings.benefitPlants': 'Plantas en tu colección',
  'settings.benefitCalendar': 'Calendario de comprobar antes de regar',
  'settings.benefitFamily': 'Hogar familiar y hojas de cuidado',
  'settings.benefitAi': 'Identificación de plantas con IA + asesor',
  'settings.benefitSync': 'Copia en la nube y sincronización',
  'settings.valueUpTo': 'Hasta {limit}',
  'settings.valueUnlimited': 'Ilimitadas',
  'settings.valueIncluded': 'Incluido',
  'settings.valueServerAi': 'IA en servidor',
  'settings.valueAutomatic': 'Automática',
  'settings.valueNone': '—',
  'settings.buyYearlyCta': 'Premium · anual · {price}',
  'settings.restore': 'Restaurar compras',
  'settings.switchFreeDemo': 'Cambiar a Gratis (demo)',
  'settings.managePlan': 'Gestiona el plan en los Ajustes del sistema',
  'settings.storeFootnoteDev':
    'Dev: la compra usa desbloqueo demo hasta enlazar StoreKit / Play en las compilaciones EAS.',
  'settings.storeFootnoteProd':
    'Las compras se procesan a través de Apple / Google cuando los productos estén activos.',

  'settings.purchaseUnavailable': 'Compra no disponible',
  'settings.premiumUnlockedTitle': 'Premium desbloqueado',
  'settings.premiumUnlockedDemo':
    'Desbloqueo demo de desarrollo. Los productos se activan con compilaciones de producción EAS + SKUs de App Store / Play.',
  'settings.premiumUnlockedThanks': 'Gracias: Premium está activo.',
  'settings.restoreTitle': 'Restaurar',
  'settings.restoredTitle': 'Restaurado',
  'settings.restoredBody': 'Tu compra Premium se ha restaurado.',
  'settings.noPurchasesTitle': 'No se encontraron compras',
  'settings.noPurchasesBody':
    'Aún no hay una suscripción Verdant Premium activa en esta cuenta de la tienda.',
  'settings.manageSubTitle': 'Gestionar suscripción',
  'settings.manageSubBody':
    'Cancela o cambia Premium en Ajustes de iOS → ID de Apple → Suscripciones, o Google Play → Pagos y suscripciones.',

  'settings.languageTitle': 'Idioma',
  'settings.languageBlurb':
    'Elige el idioma de Verdant. Sigue el idioma de tu dispositivo hasta que elijas uno aquí.',

  'settings.familyTitle': 'Compartir en familia',
  'settings.familyBlurb':
    'Hogar local: asigna cuidadores y comparte hojas de cuidado. Vincula dispositivos desde Copia y sincronización arriba.',
  'settings.householdName': 'Nombre del hogar',
  'settings.householdPlaceholder': 'p. ej. Nuestro invernadero',
  'settings.members': 'Miembros',
  'settings.membersEmpty':
    'Aún no hay miembros: añade parejas, compañeros o niños que ayuden a regar.',
  'settings.roleOwner': 'propietario',
  'settings.roleMember': 'miembro',
  'settings.remove': 'Quitar',
  'settings.removeMemberTitle': '¿Quitar miembro?',
  'settings.cancel': 'Cancelar',
  'settings.namePlaceholder': 'Nombre',
  'settings.add': 'Añadir',
  'settings.nameNeededTitle': 'Falta el nombre',
  'settings.nameNeededBody': 'Introduce el nombre de un familiar.',
  'settings.shareCareSheet': 'Compartir hoja de cuidado',
  'settings.inviteFamily': 'Invitar a la familia (instrucciones)',
  'settings.shareFailed': 'Error al compartir',

  'settings.aiTitle': 'Asistente de IA',
  'settings.aiBlurb':
    'Identifica plantas a partir de fotos y recibe asesoramiento de cuidado sereno. La IA se ejecuta en los servidores de Verdant: sin claves ni cuentas en tu dispositivo.',
  'settings.aiStatusPremium': 'Estado: Premium · IA desbloqueada',
  'settings.aiStatusFree': 'Estado: Gratis · mejora para la IA',
  'settings.aiEndpoint': 'Endpoint: {url}',

  'settings.notificationsTitle': 'Notificaciones suaves',
  'settings.notificationsBlurb':
    'Recordatorios locales para revisar la tierra cuando toca el cuidado.',
  'settings.notificationsDisabledTitle': 'Notificaciones desactivadas',
  'settings.notificationsDisabledBody':
    'Activa las notificaciones en los ajustes del sistema para recibir recordatorios suaves.',

  'settings.aboutTitle': 'Acerca de',
  'settings.aboutBody':
    '{appName} v{version}\nUn diario de plantas tranquilo y con fotos. Funciona sin conexión: inicia sesión para copiar y sincronizar entre dispositivos.',
  'settings.privacyPolicy': 'Política de privacidad',
  'settings.termsOfUse': 'Términos de uso',

  'domain.light.low': 'Poca luz',
  'domain.light.medium': 'Media',
  'domain.light.bright': 'Luz indirecta brillante',
  'domain.light.direct': 'Sol directo',
  'domain.pot.small': 'Maceta pequeña',
  'domain.pot.medium': 'Maceta mediana',
  'domain.pot.large': 'Maceta grande',
  'domain.pet.unknown': 'Mascotas: desconocido',
  'domain.pet.safe': 'Segura para mascotas',
  'domain.pet.caution': 'Mascotas: precaución',
  'domain.pet.toxic': 'Tóxica para mascotas',
  'domain.careType.water': 'Regada',
  'domain.careType.fertilize': 'Abonada',
  'domain.careType.note': 'Nota',
  'domain.careType.photo': 'Foto',
  'domain.careType.check': 'Revisión de tierra',
  'domain.careAction.water': 'Regar',
  'domain.careAction.fertilize': 'Abonar',
  'domain.category.Houseplant': 'Planta de interior',
  'domain.category.Orchid': 'Orquídea',
  'domain.category.Succulent': 'Suculenta',
  'domain.category.Cactus': 'Cactus',
  'domain.category.Fern': 'Helecho',
  'domain.category.Herb': 'Hierba',
  'domain.category.Other': 'Otra',

  'domain.care.overdueOne': '1 día de retraso',
  'domain.care.overdueMany': '{count} días de retraso',
  'domain.care.dueToday': 'Toca hoy',
  'domain.care.dueTomorrow': 'Toca mañana',
  'domain.care.inDays': 'En {count} días',

  'domain.confidence.high': 'Alta',
  'domain.confidence.medium': 'Media',
  'domain.confidence.low': 'Baja',
  'domain.urgency.none': 'Ninguna',
  'domain.urgency.watch': 'Vigilar',
  'domain.urgency.soon': 'Pronto',
  'domain.urgency.urgent': 'Urgente',
  'domain.flash.off': 'Apagado',
  'domain.flash.on': 'Activado',
  'domain.flash.auto': 'Automático',

  // Plants — home screen ("My Plants")
  'plants.title': 'Mis plantas',
  'plants.searchPlaceholder': 'Buscar nombre, especie, habitación…',
  'plants.categoryAll': 'Todas',
  'plants.roomAll': 'Todas las habitaciones',
  'plants.subtitleFreeOne': '1 planta · Gratis, hasta {limit}',
  'plants.subtitleFreeMany': '{count} plantas · Gratis, hasta {limit}',
  'plants.subtitlePremiumOne': '1 planta · Premium',
  'plants.subtitlePremiumMany': '{count} plantas · Premium',
  'plants.subtitleFreeFilteredOne':
    '1 planta · Gratis, hasta {limit} · mostrando {shown}',
  'plants.subtitleFreeFilteredMany':
    '{count} plantas · Gratis, hasta {limit} · mostrando {shown}',
  'plants.subtitlePremiumFilteredOne': '1 planta · Premium · mostrando {shown}',
  'plants.subtitlePremiumFilteredMany':
    '{count} plantas · Premium · mostrando {shown}',
  'plants.emptyTitle': 'Tu invernadero está tranquilo',
  'plants.emptyBody':
    'Añade una planta con una foto. Usa la identificación con IA para completar especie e intervalos de cuidado — luego define habitación, luz y maceta para que los calendarios sean inteligentes.',
  'plants.addFirstPlant': 'Añade tu primera planta',
  'plants.noMatchesTitle': 'Sin resultados',
  'plants.noMatchesBody': 'Prueba otra búsqueda, categoría o filtro de habitación.',
  'plants.clearFilters': 'Borrar filtros',
  'plants.addPlant': 'Añadir planta',
  'plants.upgradeTitle': 'Has llenado tus {limit} plantas gratuitas',
  'plants.upgradeSubtitle':
    'Hazte Premium para plantas ilimitadas, IA y sincronización en la nube →',
  'plants.upgradeA11y': 'Mejora a Premium para plantas ilimitadas',

  // Calendar — Care calendar screen ("Gentle reminders")
  'calendar.eyebrow': 'Calendario de cuidados',
  'calendar.title': 'Recordatorios suaves',
  'calendar.subtitle': 'Avisos suaves para revisar tus plantas — no órdenes de riego.',
  'calendar.weekStripA11y': 'Próximos siete días',
  'calendar.weekStripDayNone': '{date}',
  'calendar.weekStripDayOne': '{date}, 1 pendiente',
  'calendar.weekStripDayMany': '{date}, {count} pendientes',
  'calendar.emptyStateTitle': 'Nada programado aún',
  'calendar.emptyStateBody':
    'Añade plantas con intervalos de riego y abono para crear un calendario de cuidados tranquilo.',
  'calendar.emptyStateAction': 'Añadir planta',
  'calendar.philosophyTitle': 'Revisa antes de regar',
  'calendar.philosophyBody':
    'Mete un dedo en la tierra. Si sigue húmeda, toca Aún húmeda (+{days}d). Desliza una tarjeta a la derecha para registrar el riego. Los intervalos también se adaptan a la maceta y la luz.',
  'calendar.philosophyCollapsed':
    'Desliza para registrar · revisa la tierra antes de regar',
  'calendar.sectionOverdue': 'Atrasados',
  'calendar.sectionToday': 'Hoy',
  'calendar.sectionUpcoming': 'Próximos',
  'calendar.emptyOverdue': 'Estás al día',
  'calendar.emptyToday': 'Sin cuidados para hoy',
  'calendar.emptyUpcoming': 'Sin cuidados próximos',
  'calendar.rowMeta': '{careVerb} · {relative}',
  'calendar.rowMetaWithLocation': '{careVerb} · {relative} · {location}',
  'calendar.rowA11yLabel':
    '{name}, {careVerb}, {relative}. Toca para ver la planta, mantén pulsado para registrar.',
  'calendar.intervalWater': '~cada {days}d (según luz/maceta)',
  'calendar.intervalWaterCheckFirst':
    '~cada {days}d (según luz/maceta) · revisa la tierra primero',
  'calendar.intervalFertilize': 'cada {days}d',
  'calendar.actionStillMoist': 'Aún húmeda',
  'calendar.actionLog': 'Anotar',
  'calendar.actionDetails': 'Detalles',
  'calendar.swipeFed': 'Abonada',
  'calendar.toastWatered': 'Riego registrado · {name}',
  'calendar.toastFed': 'Abono registrado · {name}',
  'calendar.toastSnoozed': '{name} · pospuesta {days}d',
  'calendar.toastError': 'No se pudo guardar — inténtalo de nuevo',

  // Insights — collection stats + AI coach screen
  'insights.title': 'Análisis',
  'insights.subtitle': 'Historial de cuidados y coaching de IA para tu colección. {tail}',
  'insights.subtitleTailPremium': 'Premium · IA en servidor activada.',
  'insights.subtitleTailFree': 'Gratis · la IA requiere Premium.',
  'insights.emptyTitle': 'Aún sin datos',
  'insights.emptyBody':
    'Añade plantas y registra cuidados para desbloquear estadísticas e IA.',
  'insights.emptyAction': 'Añadir planta',
  'insights.statPlants': 'Plantas',
  'insights.statCareLogs': 'Cuidados',
  'insights.statStreak': 'Racha',
  'insights.statOverdue': 'Atrasados',
  'insights.statA11yLabel': '{label}: {value}',
  'insights.tapForCareList': 'Toca para ver la lista',
  'insights.streakValue': '{count}d',
  'insights.activityTitle': 'Actividad (14 días)',
  'insights.last7and30': 'Últimos 7 días: {sevenDays} · Últimos 30 días: {thirtyDays}',
  'insights.breakdownTitle': 'Desglose',
  'insights.breakdownWater': 'agua',
  'insights.breakdownFeed': 'abono',
  'insights.breakdownNotes': 'notas',
  'insights.breakdownPhotos': 'fotos',
  'insights.mostActiveOne': 'Más activa: {name} (1 registro)',
  'insights.mostActiveMany': 'Más activa: {name} ({count} registros)',
  'insights.categoryRow': '{category} · {count}',
  'insights.dueToday': 'Toca hoy: {count}',
  'insights.aiTitle': 'Consejo de IA para tu colección',
  'insights.aiBodyPremium':
    'Una nota breve de coaching según tus datos. IA Premium · ~{usesLeft} usos suaves restantes hoy en este dispositivo.',
  'insights.aiBodyFree':
    'Solo Premium — actívala en Ajustes para una nota de coaching tranquila sobre tu colección.',
  'insights.aiButtonGenerate': 'Generar consejo',
  'insights.aiButtonThinking': 'Pensando…',
  'insights.aiButtonUnlock': 'Desbloquea Premium para IA',
  'insights.aiHintGenerate': 'Usa la IA Premium para una nota breve sobre tu colección',
  'insights.aiHintUnlock': 'Abre la pantalla de mejora a Premium',
  'insights.alertNoPlantsTitle': 'Aún no hay plantas',
  'insights.alertNoPlantsBody': 'Añade plantas y registros de cuidado primero.',
  'insights.alertAiLimitTitle': 'Límite de IA',
  'insights.alertInsightFailedTitle': 'Error al generar el consejo',
  'insights.alertUnknownError': 'Error desconocido',

  // Detail — plant detail screen (app/plant/[id].tsx)
  'detail.headerEdit': 'Editar',
  'detail.headerEditA11y': 'Editar planta',
  'detail.headerDelete': 'Eliminar',
  'detail.headerDeleteA11y': 'Eliminar planta',
  'detail.deleteAlertTitle': '¿Eliminar planta?',
  'detail.deleteAlertBody':
    '¿Eliminar {name} y su historial de cuidados? Esto no se puede deshacer.',
  'detail.cancel': 'Cancelar',
  'detail.notFound': 'Planta no encontrada.',
  'detail.heroMeta': '{category}',
  'detail.heroMetaLocation': '{category} · {location}',
  'detail.heroMetaAge': '{category} · {age}',
  'detail.heroMetaLocationAge': '{category} · {location} · {age}',
  'detail.heroAgeOne': '1 d contigo',
  'detail.heroAgeMany': '{days} d contigo',
  'detail.waterRhythmChip': 'Riego ~{days}d',
  'detail.actionWateredHint': 'Abre el registro de cuidados para anotar el riego',
  'detail.actionStillMoist': 'Aún húmeda',
  'detail.actionSaving': 'Guardando…',
  'detail.actionMoistHint':
    'Registra una revisión de tierra y retrasa el aviso de riego',
  'detail.toastSnoozed': 'Pospuesto ~{days} días · revisa la tierra más tarde',
  'detail.saveErrorTitle': 'No se pudo guardar',
  'detail.saveErrorBody': 'Inténtalo de nuevo en un momento.',
  'detail.actionFed': 'Abonada',
  'detail.actionNotePhoto': 'Nota / foto',
  'detail.tabLog': 'Cuidados',
  'detail.tabGallery': 'Progreso',
  'detail.tabAi': 'Ayuda IA',
  'detail.logEmpty':
    'Aún no hay registros de cuidado. Anota riegos, abonos, notas y fotos a medida que avances.',
  'detail.logRowDeleteTitle': '¿Eliminar entrada?',
  'detail.logRowDeleteBody': 'Se eliminará este registro de cuidado.',
  'detail.logRowDeleteAction': 'Eliminar',
  'detail.logRowLongPressHint': 'Mantén pulsado para eliminar',
  'detail.galleryEmpty':
    'Añade un retrato o fotos de cuidado para ver el crecimiento con el tiempo.',
  'detail.galleryPortraitLabel': 'Retrato',
  'detail.aiStatusPremium':
    'IA Premium · las solicitudes van a los servidores de Verdant (sin clave en el dispositivo)',
  'detail.aiStatusFree': 'La IA requiere Premium · solo con fines educativos',
  'detail.reidentifyTitle': 'Reidentificar por foto',
  'detail.reidentifyBody':
    'Actualiza especie, categoría e intervalos usando el retrato actual.',
  'detail.reidentifyBodyConfidence':
    'Actualiza especie, categoría e intervalos usando el retrato actual. Última confianza: {confidence}.',
  'detail.reidentifyButtonIdle': 'Reidentificar con IA',
  'detail.reidentifyButtonLoading': 'Identificando…',
  'detail.careGuideTitle': 'Guía de cuidados de la especie',
  'detail.careGuideBody': 'Se guarda en esta planta tras generarse.',
  'detail.careGuideBodyLast': 'Se guarda en esta planta tras generarse. Última: {date}.',
  'detail.careGuideButtonGenerate': 'Generar guía de cuidados',
  'detail.careGuideButtonRefresh': 'Actualizar guía de cuidados',
  'detail.careGuideButtonLoading': 'Escribiendo…',
  'detail.guideLabelLight': 'Luz',
  'detail.guideLabelWater': 'Agua',
  'detail.guideLabelHumidity': 'Humedad',
  'detail.guideLabelSoil': 'Tierra',
  'detail.coachTitle': 'Asesor de cuidados',
  'detail.coachBody':
    'Usa el historial de cuidados y el retrato. Las respuestas se guardan en esta planta.',
  'detail.coachPlaceholder':
    'p. ej. Puntas amarillas en hojas nuevas — ¿qué debería revisar?',
  'detail.coachDefaultQuestion':
    '¿Cómo está esta planta? ¿Qué debería hacer a continuación?',
  'detail.coachDefaultQuestionShort': '¿Cómo está esta planta?',
  'detail.coachButtonIdle': 'Preguntar al asesor',
  'detail.coachButtonLoading': 'Pensando…',
  'detail.coachUrgency': 'Urgencia · {urgency}',
  'detail.savedAnswersTitle': 'Respuestas guardadas',
  'detail.historyMeta': '{date} · {urgency}',
  'detail.aiLimitTitle': 'Límite de IA',
  'detail.coachFailedTitle': 'Error del asesor de cuidados',
  'detail.guideFailedTitle': 'Error al generar la guía',
  'detail.photoNeededTitle': 'Falta una foto',
  'detail.photoNeededBody': 'Añade primero una foto de la planta (Editar).',
  'detail.identifyFailedTitle': 'Error de identificación',
  'detail.unknownError': 'Error desconocido',
  'detail.aiUpdatedTitle': 'Actualizado con IA',
  'detail.aiUpdatedBody':
    '{commonName}\nConfianza: {confidence}\nLuz: {light} · {pets}',
  'detail.aiUpdatedBodyWithScientific':
    '{commonName} · {scientificName}\nConfianza: {confidence}\nLuz: {light} · {pets}',

  // Form — Add / Edit plant screens
  'form.labelName': 'Nombre',
  'form.labelSpecies': 'Especie',
  'form.labelCategory': 'Categoría',
  'form.labelLocation': 'Habitación / ubicación',
  'form.labelLight': 'Luz en este lugar',
  'form.labelPotSize': 'Tamaño de maceta',
  'form.labelPetSafety': 'Seguridad para mascotas',
  'form.labelAcquiredDate': 'Fecha de adquisición',
  'form.labelFertilizeDays': 'Abonar cada (días)',
  'form.labelNotes': 'Notas',
  'form.placeholderLocation': 'p. ej. Salón · ventana este',
  'form.library': 'Galería',
  'form.camera': 'Cámara',
  'form.nameRequiredTitle': 'Nombre obligatorio',
  'form.nameRequiredBody': 'Ponle un nombre a tu planta (al menos 2 caracteres).',
  'form.photoPermissionTitle': 'Permiso necesario',
  'form.photoPermissionBody':
    'Permite el acceso a la galería para añadir una foto.',
  'form.retryBody': 'Inténtalo de nuevo en un momento.',

  'form.photoPlaceholderAdd': 'Toca para elegir una foto',
  'form.aiIdentifyLoading': 'Identificando…',
  'form.aiIdentifyButtonPremium': 'Identificar con IA (Premium)',
  'form.aiIdentifyButtonPremiumOnly': 'Identificar con IA (solo Premium)',
  'form.aiIdentifyHint':
    'Premium: la IA completa nombre, especie, categoría e intervalos a partir de tu foto. La clave permanece en los servidores de Verdant.',
  'form.aiHintResult':
    '{commonName} · Confianza: {confidence} · Luz: {light} · {pets}',
  'form.aiHintResultWithScientific':
    '{commonName} ({scientificName}) · Confianza: {confidence} · Luz: {light} · {pets}',
  'form.placeholderName': 'p. ej. Luna',
  'form.placeholderSpecies': 'p. ej. Philodendron hederaceum',
  'form.labelWaterDays': 'Regar cada (días)',
  'form.scheduleHint':
    'Los horarios se adaptan a la luz y el tamaño de la maceta. El calendario revisa antes de regar (no un «regar ahora» ciego como la mayoría de apps de cuidado).',
  'form.placeholderNotes': 'Sustrato, procedencia…',
  'form.saveButtonAdd': 'Guardar planta',
  'form.photoNeededTitle': 'Falta una foto',
  'form.photoNeededBody':
    'Añade primero una foto de la planta y luego usa la identificación con IA.',
  'form.aiLimitTitle': 'Límite de IA',
  'form.identifyFailedTitle': 'Error de identificación con IA',
  'form.unknownError': 'Error desconocido',
  'form.addFailedTitle': 'No se pudo añadir la planta',

  'form.notFound': 'Planta no encontrada.',
  'form.photoPlaceholderEdit': 'Añadir foto',
  'form.labelBaseWaterDays': 'Riego base (días)',
  'form.waterRhythmHintOne':
    'Ritmo de riego real ≈ cada día (ajustado por luz y maceta — mejor que los horarios ciegos que sobrerriegan).',
  'form.waterRhythmHintMany':
    'Ritmo de riego real ≈ cada {days} días (ajustado por luz y maceta — mejor que los horarios ciegos que sobrerriegan).',
  'form.checkBeforeWaterTitle': 'Revisa la tierra antes de regar',
  'form.checkBeforeWaterBody':
    'El calendario ofrece el aplazamiento «{stillMoist}» — la diferencia clave entre Verdant y la app Planta.',
  'form.labelCaretaker': 'Cuidador familiar',
  'form.caretakerAnyone': 'Cualquiera',
  'form.saveButtonEdit': 'Guardar cambios',
  'form.editSaveFailedTitle': 'No se pudo guardar',

  'form.datePickerLabel': 'Elegir fecha',
  'form.datePickerDone': 'Listo',
  'form.datePickerDoneA11y': 'Terminar de elegir la fecha',

  'log.subtitle':
    'Un momento tranquilo de cuidado. Las fotos te ayudan a ver cómo crece con el paso del tiempo.',
  'log.careTypeLabel': 'Tipo de cuidado',
  'log.noteLabel': 'Nota',
  'log.notePlaceholder': 'Una hoja nueva casi abierta…',
  'log.photoLabel': 'Foto',
  'log.photoBoxPlaceholder': 'Toca para añadir una foto',
  'log.saveButton': 'Guardar · {careType}',
  'log.plantMissingTitle': 'Falta la planta',
  'log.photoRequiredTitle': 'Foto requerida',
  'log.photoRequiredBody': 'Añade una foto para este registro de tipo foto.',
  'log.saveErrorTitle': 'No se pudo guardar',
  'log.saveErrorBody': 'Inténtalo de nuevo en un momento.',
  'log.notFound': 'Planta no encontrada.',

  'detail.lightboxClose': 'Cerrar',

  'settings.syncTitle': 'Copia y sincronización',
  'settings.syncPremiumBlurb':
    'Premium: inicia sesión una vez y tus plantas, historial de cuidados y fotos se respaldan automáticamente y te siguen a cualquier dispositivo.',
  'settings.syncSignedInBlurb':
    'Sesión iniciada con {provider}. Todo se sincroniza automáticamente: tras los cambios, al abrir la app y cuando vuelves.',
  'settings.syncSignedInBlurbWithEmail':
    'Sesión iniciada con {provider} · {email}. Todo se sincroniza automáticamente: tras los cambios, al abrir la app y cuando vuelves.',
  'settings.syncStatusSyncing': 'Sincronizando…',
  'settings.syncStatusError': 'No se pudo sincronizar; se reintentará automáticamente.',
  'settings.syncStatusLast': 'Última sincronización: {date}',
  'settings.syncStatusPending': 'Primera sincronización pendiente.',
  'settings.syncNowButton': 'Sincronizar ahora',
  'settings.syncSignOutButton': 'Cerrar sesión',
  'settings.syncDeleteButton': 'Eliminar datos sincronizados',
  'settings.syncDeletingButton': 'Eliminando…',
  'settings.syncDeleteHint': 'Elimina tu colección de la nube de forma permanente',
  'settings.syncDeleteTitle': '¿Eliminar los datos sincronizados?',
  'settings.syncDeleteBody':
    'Esto elimina de forma permanente tus plantas, historial de cuidados y fotos de la nube, y cierra tu sesión. Tus plantas siguen en este dispositivo; elimina la app para quitarlas también. Esto no se puede deshacer.',
  'settings.syncDeleteConfirm': 'Eliminar',
  'settings.syncDeletedTitle': 'Datos sincronizados eliminados',
  'settings.syncDeleteFailedTitle': 'Error al eliminar',
  'settings.syncDeletedBody':
    'Tu colección en la nube ha desaparecido y la sincronización está desactivada. Tus plantas siguen en este dispositivo.',
  'settings.syncSignOutTitle': '¿Cerrar sesión?',
  'settings.syncSignOutBody':
    'La sincronización se pausa en este dispositivo. Tus plantas siguen aquí y en tu copia en la nube.',
  'settings.syncSignInBlurb':
    'Inicia sesión una vez: tus plantas, historial de cuidados y fotos se respaldan y sincronizan automáticamente entre dispositivos.',
  'settings.syncAppleUnavailable':
    'Inicia sesión en una cuenta de Apple en los Ajustes del sistema para activar Iniciar sesión con Apple.',
  'settings.syncGoogleButton': 'Continuar con Google',
  'settings.syncGoogleFailedTitle': 'Error al iniciar sesión con Google',
  'settings.syncAppleSignedInTitle': 'Sesión iniciada',
  'settings.syncAppleSignedInBody': 'Tus plantas ahora se respaldan y sincronizan automáticamente.',
  'settings.syncAppleFailedTitle': 'Error al iniciar sesión con Apple',
  'settings.syncFailedTitle': 'Error de sincronización',
  'settings.syncAdvancedHide': 'Ocultar vinculación avanzada',
  'settings.syncAdvancedShow': 'Avanzado: vincular con código de sincronización',
  'settings.syncCodeHide': 'Ocultar el código de este dispositivo',
  'settings.syncCodeShow': 'Mostrar el código de este dispositivo',
  'settings.syncCodeWarning': 'Trátalo como una contraseña.',
  'settings.syncCodePlaceholder': 'Pega un código de sincronización…',
  'settings.syncLinkButton': 'Vincular',
  'settings.syncInvalidCodeTitle': 'Código no válido',
  'settings.syncLinkedTitle': 'Dispositivo vinculado',
  'settings.syncLinkedFailedTitle': 'Vinculado, pero la sincronización falló',
  'settings.syncLinkedBodyOne': 'Ahora compartes una colección (1 planta).',
  'settings.syncLinkedBodyMany': 'Ahora compartes una colección ({count} plantas).',
  'settings.syncLinkedSyncing': 'Sincronizando tu colección…',

  'paywall.closeA11y': 'Cerrar',

  'notFound.title': '¡Ups!',
  'notFound.body': 'Esta pantalla no existe.',
  'notFound.link': 'Ir a la pantalla de inicio',

  'camera.permissionTitle': 'Acceso a la cámara',
  'camera.permissionBody':
    'Verdant necesita la cámara para retratos de plantas y fotos de progreso. Las fotos se quedan en tu dispositivo.',
  'camera.permissionAllow': 'Permitir cámara',
  'camera.permissionDismiss': 'Ahora no',
  'camera.closeA11y': 'Cerrar cámara',
  'camera.titleLive': 'Cámara del invernadero',
  'camera.titleReview': 'Revisar retrato',
  'camera.flashA11y': 'Flash: {mode}',
  'camera.tip':
    'Encuadra una hoja o la planta entera · la luz brillante y uniforme funciona mejor',
  'camera.retake': 'Repetir',
  'camera.retakeA11y': 'Repetir foto',
  'camera.usePhoto': 'Usar foto',
  'camera.usePhotoA11y': 'Usar esta foto',
  'camera.flip': 'Cambiar',
  'camera.flipA11y': 'Cambiar cámara',
  'camera.captureA11y': 'Tomar foto',
  'camera.back': 'Atrás',
};

const fr: Messages = {
  'paywall.eyebrow': 'Verdant Premium',
  'paywall.title': 'Cultivez sans limites.',
  'paywall.subtitle': 'Gardez toutes vos plantes, laissez l’IA les identifier et vous conseiller, et sauvegardez le tout sur vos appareils.',
  'paywall.reasonLimit': 'Vous avez rempli vos {limit} plantes gratuites. Passez à l’illimité.',
  'paywall.reasonAi': 'L’identification et le coaching IA font partie de Premium.',
  'paywall.reasonSync': 'La sauvegarde et la synchro cloud font partie de Premium.',
  'paywall.reasonInsights': 'Les analyses de collection par IA font partie de Premium.',
  'paywall.benefitUnlimited': 'Plantes illimitées',
  'paywall.benefitUnlimitedBody': 'Faites grandir toute votre collection — sans limite de 5 plantes.',
  'paywall.benefitAi': 'Identification et coach IA',
  'paywall.benefitAiBody': 'Une photo pour l’espèce, le calendrier et des conseils.',
  'paywall.benefitSync': 'Sauvegarde et synchro cloud',
  'paywall.benefitSyncBody': 'Vos plantes et photos, en sécurité sur chaque appareil.',
  'paywall.benefitInsights': 'Analyses de collection',
  'paywall.benefitInsightsBody': 'Séries, activité et une note IA sur votre progression.',
  'paywall.yearlyCta': 'Passer à Premium · {price}',
  'paywall.yearlyTrialCta': 'Essai gratuit de 7 jours',
  'paywall.yearlyTrialSub': 'puis {price}/an · annulable à tout moment',
  'paywall.lifetimeCta': 'Payez une fois, pour toujours · {price}',
  'paywall.restore': 'Restaurer les achats',
  'paywall.legal': 'Facturé via l’App Store ou Google Play. Annulable à tout moment dans les réglages de votre compte.',
  'paywall.unlockedTitle': 'Bienvenue dans Premium',
  'paywall.unlockedBody': 'Tout est débloqué. Bonne culture.',
  'paywall.unlockedDemo': 'Déblocage de démonstration. Les achats réels s’activent dans les builds de store.',
  'paywall.unavailableTitle': 'Achat indisponible',
  'paywall.restoredTitle': 'Restauré',
  'paywall.restoredBody': 'Votre achat Premium est de nouveau actif.',
  'paywall.noPurchasesTitle': 'Aucun achat trouvé',
  'paywall.noPurchasesBody': 'Aucun Premium actif sur ce compte de store pour le moment.',
  'nav.paywall': 'Verdant Premium',
  'tabs.plants': 'Plantes',
  'tabs.care': 'Soins',
  'tabs.insights': 'Analyses',
  'tabs.settings': 'Réglages',
  'tabs.plantsA11y': 'Mes plantes',
  'tabs.careA11y': 'Calendrier de soins',
  'tabs.insightsA11y': 'Analyses de la collection',
  'tabs.settingsA11y': 'Réglages',

  'nav.addPlant': 'Ajouter une plante',
  'nav.editPlant': 'Modifier la plante',
  'nav.plant': 'Plante',
  'nav.logCare': 'Noter un soin',
  'nav.privacy': 'Politique de confidentialité',
  'nav.terms': 'Conditions d’utilisation',
  'legal.lastUpdated': 'Dernière mise à jour : {date}',

  'welcome.valueHeadline': 'Des soins que\nvous voyez pousser.',
  'welcome.valueSub':
    'Un journal de plantes apaisant, axé sur la photo, qui vous invite à vérifier la terre avant d’arroser — jamais d’arrosage à l’aveugle.',
  'welcome.previewWater': 'Arroser dans 3 jours · vérifiez la terre d’abord',
  'welcome.continue': 'Continuer',
  'welcome.privacyMark': 'À vous, en privé',
  'welcome.privacyHeadline': 'Privé par\ndéfaut.',
  'welcome.offlineTitle': 'Fonctionne hors ligne',
  'welcome.offlineBody':
    'Vos plantes et vos photos restent sur votre appareil. Aucun compte requis pour commencer.',
  'welcome.syncTitle': 'Connectez-vous seulement pour synchroniser',
  'welcome.syncBody':
    'La connexion facultative Apple ou Google sauvegarde et synchronise vos appareils.',
  'welcome.aiTitle': 'IA Premium, en toute sécurité',
  'welcome.aiBody':
    'L’identification et le coaching s’exécutent sur nos serveurs — aucune clé d’API sur votre téléphone.',
  'welcome.startCollection': 'Commencez votre collection',
  'welcome.signInSync': 'Se connecter pour sauvegarder et synchroniser',
  'welcome.haveePlants': 'J’ai déjà des plantes',

  'settings.title': 'Réglages',
  'settings.collectionTitle': 'Votre collection',
  'settings.collectionSummary': '{count} sur {limit} plantes · {tier} · {source}',
  'settings.tierPremium': 'Premium',
  'settings.tierFree': 'Gratuit',

  'settings.premiumBadge': 'Premium',
  'settings.premiumActive': 'Premium actif',
  'settings.premiumUnlock': 'Débloquer Premium',
  'settings.premiumBlurb':
    'Plantes illimitées + IA sur serveur. Identifiants produit prêts pour l’App Store / Play ({productId}).',
  'settings.colFeature': 'Fonction',
  'settings.colFree': 'Gratuit',
  'settings.colPremium': 'Premium',
  'settings.benefitPlants': 'Plantes dans votre collection',
  'settings.benefitCalendar': 'Calendrier « vérifier avant d’arroser »',
  'settings.benefitFamily': 'Foyer familial et fiches de soins',
  'settings.benefitAi': 'Identification IA + coach',
  'settings.benefitSync': 'Sauvegarde cloud et synchronisation',
  'settings.valueUpTo': 'Jusqu’à {limit}',
  'settings.valueUnlimited': 'Illimitées',
  'settings.valueIncluded': 'Inclus',
  'settings.valueServerAi': 'IA sur serveur',
  'settings.valueAutomatic': 'Automatique',
  'settings.valueNone': '—',
  'settings.buyYearlyCta': 'Premium · annuel · {price}',
  'settings.restore': 'Restaurer les achats',
  'settings.switchFreeDemo': 'Passer à Gratuit (démo)',
  'settings.managePlan': 'Gérer l’abonnement dans les Réglages système',
  'settings.storeFootnoteDev':
    'Dev : l’achat utilise un déblocage démo jusqu’à ce que StoreKit / Play soit lié dans les builds EAS.',
  'settings.storeFootnoteProd':
    'Les achats passent par Apple / Google une fois les produits en ligne.',

  'settings.purchaseUnavailable': 'Achat indisponible',
  'settings.premiumUnlockedTitle': 'Premium débloqué',
  'settings.premiumUnlockedDemo':
    'Déblocage démo de développement. Les produits deviennent réels avec les builds de production EAS + les SKU App Store / Play.',
  'settings.premiumUnlockedThanks': 'Merci — Premium est actif.',
  'settings.restoreTitle': 'Restaurer',
  'settings.restoredTitle': 'Restauré',
  'settings.restoredBody': 'Votre achat Premium a été restauré.',
  'settings.noPurchasesTitle': 'Aucun achat trouvé',
  'settings.noPurchasesBody':
    'Aucun abonnement Verdant Premium actif sur ce compte de magasin pour l’instant.',
  'settings.manageSubTitle': 'Gérer l’abonnement',
  'settings.manageSubBody':
    'Annulez ou modifiez Premium dans Réglages iOS → Identifiant Apple → Abonnements, ou Google Play → Paiements et abonnements.',

  'settings.languageTitle': 'Langue',
  'settings.languageBlurb':
    'Choisissez la langue de Verdant. Suit la langue de votre appareil jusqu’à ce que vous en choisissiez une ici.',

  'settings.familyTitle': 'Partage familial',
  'settings.familyBlurb':
    'Foyer local — attribuez des soigneurs et partagez des fiches de soins. Reliez les appareils depuis Sauvegarde et synchronisation ci-dessus.',
  'settings.householdName': 'Nom du foyer',
  'settings.householdPlaceholder': 'ex. Notre serre',
  'settings.members': 'Membres',
  'settings.membersEmpty':
    'Aucun membre pour l’instant — ajoutez partenaires, colocataires ou enfants qui aident à arroser.',
  'settings.roleOwner': 'propriétaire',
  'settings.roleMember': 'membre',
  'settings.remove': 'Retirer',
  'settings.removeMemberTitle': 'Retirer le membre ?',
  'settings.cancel': 'Annuler',
  'settings.namePlaceholder': 'Nom',
  'settings.add': 'Ajouter',
  'settings.nameNeededTitle': 'Nom requis',
  'settings.nameNeededBody': 'Saisissez le nom d’un membre de la famille.',
  'settings.shareCareSheet': 'Partager la fiche de soins',
  'settings.inviteFamily': 'Inviter la famille (instructions)',
  'settings.shareFailed': 'Échec du partage',

  'settings.aiTitle': 'Assistant IA',
  'settings.aiBlurb':
    'Identifiez les plantes à partir de photos et recevez un coaching de soins apaisant. L’IA s’exécute sur les serveurs de Verdant — aucune clé ni compte sur votre appareil.',
  'settings.aiStatusPremium': 'État : Premium · IA débloquée',
  'settings.aiStatusFree': 'État : Gratuit · passez à Premium pour l’IA',
  'settings.aiEndpoint': 'Endpoint : {url}',

  'settings.notificationsTitle': 'Notifications douces',
  'settings.notificationsBlurb':
    'Rappels locaux pour vérifier la terre quand un soin est dû.',
  'settings.notificationsDisabledTitle': 'Notifications désactivées',
  'settings.notificationsDisabledBody':
    'Activez les notifications dans les réglages système pour recevoir des rappels doux.',

  'settings.aboutTitle': 'À propos',
  'settings.aboutBody':
    '{appName} v{version}\nUn journal de plantes apaisant, axé sur la photo. Fonctionne hors ligne — connectez-vous pour sauvegarder et synchroniser vos appareils.',
  'settings.privacyPolicy': 'Politique de confidentialité',
  'settings.termsOfUse': 'Conditions d’utilisation',

  'domain.light.low': 'Faible luminosité',
  'domain.light.medium': 'Moyenne',
  'domain.light.bright': 'Lumière indirecte vive',
  'domain.light.direct': 'Soleil direct',
  'domain.pot.small': 'Petit pot',
  'domain.pot.medium': 'Pot moyen',
  'domain.pot.large': 'Grand pot',
  'domain.pet.unknown': 'Animaux : inconnu',
  'domain.pet.safe': 'Sans danger',
  'domain.pet.caution': 'Animaux : prudence',
  'domain.pet.toxic': 'Toxique',
  'domain.careType.water': 'Arrosée',
  'domain.careType.fertilize': 'Fertilisée',
  'domain.careType.note': 'Note',
  'domain.careType.photo': 'Photo',
  'domain.careType.check': 'Contrôle de la terre',
  'domain.careAction.water': 'Arroser',
  'domain.careAction.fertilize': 'Fertiliser',
  'domain.category.Houseplant': 'Plante d’intérieur',
  'domain.category.Orchid': 'Orchidée',
  'domain.category.Succulent': 'Plante grasse',
  'domain.category.Cactus': 'Cactus',
  'domain.category.Fern': 'Fougère',
  'domain.category.Herb': 'Herbe aromatique',
  'domain.category.Other': 'Autre',

  'domain.care.overdueOne': '1 jour de retard',
  'domain.care.overdueMany': '{count} jours de retard',
  'domain.care.dueToday': 'À faire aujourd’hui',
  'domain.care.dueTomorrow': 'À faire demain',
  'domain.care.inDays': 'Dans {count} jours',

  'domain.confidence.high': 'Élevée',
  'domain.confidence.medium': 'Moyenne',
  'domain.confidence.low': 'Faible',
  'domain.urgency.none': 'Aucune',
  'domain.urgency.watch': 'À surveiller',
  'domain.urgency.soon': 'Bientôt',
  'domain.urgency.urgent': 'Urgent',
  'domain.flash.off': 'Désactivé',
  'domain.flash.on': 'Activé',
  'domain.flash.auto': 'Automatique',

  // Plants — home screen ("My Plants")
  'plants.title': 'Mes plantes',
  'plants.searchPlaceholder': 'Rechercher nom, espèce, pièce…',
  'plants.categoryAll': 'Toutes',
  'plants.roomAll': 'Toutes les pièces',
  'plants.subtitleFreeOne': '1 plante · Gratuit : {limit}',
  'plants.subtitleFreeMany': '{count} plantes · Gratuit : {limit}',
  'plants.subtitlePremiumOne': '1 plante · Premium',
  'plants.subtitlePremiumMany': '{count} plantes · Premium',
  'plants.subtitleFreeFilteredOne':
    '1 plante · Gratuit : {limit} · {shown} affichées',
  'plants.subtitleFreeFilteredMany':
    '{count} plantes · Gratuit : {limit} · {shown} affichées',
  'plants.subtitlePremiumFilteredOne': '1 plante · Premium · {shown} affichées',
  'plants.subtitlePremiumFilteredMany':
    '{count} plantes · Premium · {shown} affichées',
  'plants.emptyTitle': 'Votre serre est calme',
  'plants.emptyBody':
    'Ajoutez une plante avec une photo. Utilisez l’identification IA pour renseigner l’espèce et les intervalles de soins — puis définissez la pièce, la lumière et le pot pour des calendriers intelligents.',
  'plants.addFirstPlant': 'Ajoutez votre première plante',
  'plants.noMatchesTitle': 'Aucun résultat',
  'plants.noMatchesBody': 'Essayez une autre recherche, catégorie ou pièce.',
  'plants.clearFilters': 'Effacer les filtres',
  'plants.addPlant': 'Ajouter une plante',
  'plants.upgradeTitle': 'Vos {limit} plantes gratuites sont pleines',
  'plants.upgradeSubtitle':
    'Passez à Premium pour des plantes illimitées, l’IA et la synchro cloud →',
  'plants.upgradeA11y': 'Passer à Premium pour des plantes illimitées',

  // Calendar — Care calendar screen ("Gentle reminders")
  'calendar.eyebrow': 'Calendrier de soins',
  'calendar.title': 'Rappels en douceur',
  'calendar.subtitle':
    'De petits rappels pour vérifier vos plantes — jamais des ordres d’arrosage.',
  'calendar.weekStripA11y': 'Sept prochains jours',
  'calendar.weekStripDayNone': '{date}',
  'calendar.weekStripDayOne': '{date}, 1 à faire',
  'calendar.weekStripDayMany': '{date}, {count} à faire',
  'calendar.emptyStateTitle': 'Rien de prévu pour l’instant',
  'calendar.emptyStateBody':
    'Ajoutez des plantes avec des intervalles d’arrosage et de fertilisation pour créer un calendrier de soins apaisant.',
  'calendar.emptyStateAction': 'Ajouter une plante',
  'calendar.philosophyTitle': 'Vérifiez avant d’arroser',
  'calendar.philosophyBody':
    'Plongez un doigt dans la terre. Si elle est encore humide, touchez Encore humide (+{days}j). Glissez une carte vers la droite pour noter l’arrosage. Les intervalles s’adaptent aussi au pot et à la lumière.',
  'calendar.philosophyCollapsed':
    'Glissez pour noter · vérifiez la terre avant d’arroser',
  'calendar.sectionOverdue': 'En retard',
  'calendar.sectionToday': 'Aujourd’hui',
  'calendar.sectionUpcoming': 'À venir',
  'calendar.emptyOverdue': 'Tout est à jour',
  'calendar.emptyToday': 'Aucun soin prévu aujourd’hui',
  'calendar.emptyUpcoming': 'Aucun soin à venir',
  'calendar.rowMeta': '{careVerb} · {relative}',
  'calendar.rowMetaWithLocation': '{careVerb} · {relative} · {location}',
  'calendar.rowA11yLabel':
    '{name}, {careVerb}, {relative}. Touchez pour voir la plante, appui long pour noter.',
  'calendar.intervalWater': '~tous les {days}j (selon lumière/pot)',
  'calendar.intervalWaterCheckFirst':
    '~tous les {days}j (selon lumière/pot) · vérifiez la terre d’abord',
  'calendar.intervalFertilize': 'tous les {days}j',
  'calendar.actionStillMoist': 'Encore humide',
  'calendar.actionLog': 'Noter',
  'calendar.actionDetails': 'Détails',
  'calendar.swipeFed': 'Nourrie',
  'calendar.toastWatered': 'Arrosage noté · {name}',
  'calendar.toastFed': 'Engrais noté · {name}',
  'calendar.toastSnoozed': '{name} · reportée {days}j',
  'calendar.toastError': 'Échec de l’enregistrement — réessayez',

  // Insights — collection stats + AI coach screen
  'insights.title': 'Analyses',
  'insights.subtitle': 'Historique de soins et coaching IA pour votre collection. {tail}',
  'insights.subtitleTailPremium': 'Premium · IA serveur activée.',
  'insights.subtitleTailFree': 'Gratuit · l’IA nécessite Premium.',
  'insights.emptyTitle': 'Aucune donnée pour l’instant',
  'insights.emptyBody':
    'Ajoutez des plantes et notez des soins pour débloquer stats et IA.',
  'insights.emptyAction': 'Ajouter une plante',
  'insights.statPlants': 'Plantes',
  'insights.statCareLogs': 'Soins',
  'insights.statStreak': 'Série',
  'insights.statOverdue': 'En retard',
  'insights.statA11yLabel': '{label} : {value}',
  'insights.tapForCareList': 'Touchez pour la liste',
  'insights.streakValue': '{count}j',
  'insights.activityTitle': 'Activité (14 jours)',
  'insights.last7and30': '7 derniers jours : {sevenDays} · 30 derniers jours : {thirtyDays}',
  'insights.breakdownTitle': 'Répartition',
  'insights.breakdownWater': 'eau',
  'insights.breakdownFeed': 'engrais',
  'insights.breakdownNotes': 'notes',
  'insights.breakdownPhotos': 'photos',
  'insights.mostActiveOne': 'Plus active : {name} (1 soin)',
  'insights.mostActiveMany': 'Plus active : {name} ({count} soins)',
  'insights.categoryRow': '{category} · {count}',
  'insights.dueToday': 'À faire aujourd’hui : {count}',
  'insights.aiTitle': 'Conseil IA sur la collection',
  'insights.aiBodyPremium':
    'Une courte note de coaching selon vos stats. IA Premium · ~{usesLeft} utilisations restantes aujourd’hui sur cet appareil.',
  'insights.aiBodyFree':
    'Réservé à Premium — activez-le dans Réglages pour une note de coaching apaisante sur votre collection.',
  'insights.aiButtonGenerate': 'Générer un conseil',
  'insights.aiButtonThinking': 'Réflexion…',
  'insights.aiButtonUnlock': 'Débloquez Premium pour l’IA',
  'insights.aiHintGenerate': 'Utilise l’IA Premium pour une courte note sur la collection',
  'insights.aiHintUnlock': 'Ouvre l’écran de passage à Premium',
  'insights.alertNoPlantsTitle': 'Pas encore de plantes',
  'insights.alertNoPlantsBody': 'Ajoutez d’abord des plantes et des soins.',
  'insights.alertAiLimitTitle': 'Limite IA',
  'insights.alertInsightFailedTitle': 'Échec du conseil',
  'insights.alertUnknownError': 'Erreur inconnue',

  // Detail — plant detail screen (app/plant/[id].tsx)
  'detail.headerEdit': 'Modifier',
  'detail.headerEditA11y': 'Modifier la plante',
  'detail.headerDelete': 'Supprimer',
  'detail.headerDeleteA11y': 'Supprimer la plante',
  'detail.deleteAlertTitle': 'Supprimer la plante ?',
  'detail.deleteAlertBody':
    'Supprimer {name} et son historique de soins ? Cette action est irréversible.',
  'detail.cancel': 'Annuler',
  'detail.notFound': 'Plante introuvable.',
  'detail.heroMeta': '{category}',
  'detail.heroMetaLocation': '{category} · {location}',
  'detail.heroMetaAge': '{category} · {age}',
  'detail.heroMetaLocationAge': '{category} · {location} · {age}',
  'detail.heroAgeOne': '1 j avec vous',
  'detail.heroAgeMany': '{days} j avec vous',
  'detail.waterRhythmChip': 'Arrosage ~{days}j',
  'detail.actionWateredHint': 'Ouvre le journal de soins pour noter l’arrosage',
  'detail.actionStillMoist': 'Encore humide',
  'detail.actionSaving': 'Enregistrement…',
  'detail.actionMoistHint':
    'Note un contrôle de terre et retarde le rappel d’arrosage',
  'detail.toastSnoozed': 'Reporté ~{days} jours · revérifiez la terre plus tard',
  'detail.saveErrorTitle': 'Échec de l’enregistrement',
  'detail.saveErrorBody': 'Réessayez dans un instant.',
  'detail.actionFed': 'Nourrie',
  'detail.actionNotePhoto': 'Note / photo',
  'detail.tabLog': 'Soins',
  'detail.tabGallery': 'Progrès',
  'detail.tabAi': 'Aide IA',
  'detail.logEmpty':
    'Aucun soin noté pour l’instant. Notez arrosages, engrais, notes et photos au fil du temps.',
  'detail.logRowDeleteTitle': 'Supprimer l’entrée ?',
  'detail.logRowDeleteBody': 'Supprime cette entrée du journal de soins.',
  'detail.logRowDeleteAction': 'Supprimer',
  'detail.logRowLongPressHint': 'Appui long pour supprimer',
  'detail.galleryEmpty':
    'Ajoutez un portrait ou des photos de soins pour observer la croissance dans le temps.',
  'detail.galleryPortraitLabel': 'Portrait',
  'detail.aiStatusPremium':
    'IA Premium · les requêtes passent par les serveurs de Verdant (aucune clé sur l’appareil)',
  'detail.aiStatusFree': 'L’IA nécessite Premium · à but éducatif uniquement',
  'detail.reidentifyTitle': 'Réidentifier depuis la photo',
  'detail.reidentifyBody':
    'Met à jour l’espèce, la catégorie et les intervalles à partir du portrait actuel.',
  'detail.reidentifyBodyConfidence':
    'Met à jour l’espèce, la catégorie et les intervalles à partir du portrait actuel. Dernière confiance : {confidence}.',
  'detail.reidentifyButtonIdle': 'Réidentifier avec l’IA',
  'detail.reidentifyButtonLoading': 'Identification…',
  'detail.careGuideTitle': 'Guide de soins de l’espèce',
  'detail.careGuideBody': 'Enregistré sur cette plante après génération.',
  'detail.careGuideBodyLast':
    'Enregistré sur cette plante après génération. Dernière : {date}.',
  'detail.careGuideButtonGenerate': 'Générer le guide de soins',
  'detail.careGuideButtonRefresh': 'Actualiser le guide de soins',
  'detail.careGuideButtonLoading': 'Rédaction…',
  'detail.guideLabelLight': 'Lumière',
  'detail.guideLabelWater': 'Eau',
  'detail.guideLabelHumidity': 'Humidité',
  'detail.guideLabelSoil': 'Terre',
  'detail.coachTitle': 'Coach de soins',
  'detail.coachBody':
    'Utilise l’historique des soins et le portrait. Les réponses sont enregistrées sur cette plante.',
  'detail.coachPlaceholder':
    'ex. Pointes jaunes sur les nouvelles feuilles — que dois-je vérifier ?',
  'detail.coachDefaultQuestion':
    'Comment va cette plante ? Que devrais-je faire ensuite ?',
  'detail.coachDefaultQuestionShort': 'Comment va cette plante ?',
  'detail.coachButtonIdle': 'Demander au coach',
  'detail.coachButtonLoading': 'Réflexion…',
  'detail.coachUrgency': 'Urgence · {urgency}',
  'detail.savedAnswersTitle': 'Réponses enregistrées',
  'detail.historyMeta': '{date} · {urgency}',
  'detail.aiLimitTitle': 'Limite IA',
  'detail.coachFailedTitle': 'Échec du coach de soins',
  'detail.guideFailedTitle': 'Échec du guide de soins',
  'detail.photoNeededTitle': 'Photo requise',
  'detail.photoNeededBody': 'Ajoutez d’abord une photo de la plante (Modifier).',
  'detail.identifyFailedTitle': 'Échec de l’identification',
  'detail.unknownError': 'Erreur inconnue',
  'detail.aiUpdatedTitle': 'Mis à jour par l’IA',
  'detail.aiUpdatedBody':
    '{commonName}\nConfiance : {confidence}\nLumière : {light} · {pets}',
  'detail.aiUpdatedBodyWithScientific':
    '{commonName} · {scientificName}\nConfiance : {confidence}\nLumière : {light} · {pets}',

  // Form — Add / Edit plant screens
  'form.labelName': 'Nom',
  'form.labelSpecies': 'Espèce',
  'form.labelCategory': 'Catégorie',
  'form.labelLocation': 'Pièce / emplacement',
  'form.labelLight': 'Lumière à cet endroit',
  'form.labelPotSize': 'Taille du pot',
  'form.labelPetSafety': 'Sécurité animaux',
  'form.labelAcquiredDate': 'Date d’acquisition',
  'form.labelFertilizeDays': 'Engrais (jours)',
  'form.labelNotes': 'Notes',
  'form.placeholderLocation': 'ex. Salon · fenêtre est',
  'form.library': 'Galerie',
  'form.camera': 'Appareil photo',
  'form.nameRequiredTitle': 'Nom requis',
  'form.nameRequiredBody': 'Donnez un nom à votre plante (2 caractères minimum).',
  'form.photoPermissionTitle': 'Autorisation requise',
  'form.photoPermissionBody':
    'Autorisez l’accès à la galerie pour ajouter une photo.',
  'form.retryBody': 'Réessayez dans un instant.',

  'form.photoPlaceholderAdd': 'Touchez pour choisir une photo',
  'form.aiIdentifyLoading': 'Identification…',
  'form.aiIdentifyButtonPremium': 'Identifier par IA (Premium)',
  'form.aiIdentifyButtonPremiumOnly': 'Identifier par IA (Premium uniquement)',
  'form.aiIdentifyHint':
    'Premium : l’IA renseigne le nom, l’espèce, la catégorie et les intervalles à partir de votre photo. La clé reste sur les serveurs de Verdant.',
  'form.aiHintResult':
    '{commonName} · Confiance : {confidence} · Lumière : {light} · {pets}',
  'form.aiHintResultWithScientific':
    '{commonName} ({scientificName}) · Confiance : {confidence} · Lumière : {light} · {pets}',
  'form.placeholderName': 'ex. Lune',
  'form.placeholderSpecies': 'ex. Philodendron hederaceum',
  'form.labelWaterDays': 'Arrosage (jours)',
  'form.scheduleHint':
    'Les plannings s’adaptent à la lumière et à la taille du pot. Le calendrier vérifie avant d’arroser (pas un « arroser maintenant » aveugle comme la plupart des applis).',
  'form.placeholderNotes': 'Terreau, provenance…',
  'form.saveButtonAdd': 'Enregistrer la plante',
  'form.photoNeededTitle': 'Photo requise',
  'form.photoNeededBody':
    'Ajoutez d’abord une photo de la plante, puis lancez l’identification par IA.',
  'form.aiLimitTitle': 'Limite IA',
  'form.identifyFailedTitle': 'Échec de l’identification par IA',
  'form.unknownError': 'Erreur inconnue',
  'form.addFailedTitle': 'Impossible d’ajouter la plante',

  'form.notFound': 'Plante introuvable.',
  'form.photoPlaceholderEdit': 'Ajouter une photo',
  'form.labelBaseWaterDays': 'Arrosage de base (jours)',
  'form.waterRhythmHintOne':
    'Rythme d’arrosage réel ≈ tous les jours (ajusté selon la lumière et le pot — mieux que les plannings aveugles qui noient les plantes).',
  'form.waterRhythmHintMany':
    'Rythme d’arrosage réel ≈ tous les {days} jours (ajusté selon la lumière et le pot — mieux que les plannings aveugles qui noient les plantes).',
  'form.checkBeforeWaterTitle': 'Vérifiez la terre avant d’arroser',
  'form.checkBeforeWaterBody':
    'Le calendrier propose le report « {stillMoist} » — la différence essentielle entre Verdant et Planta.',
  'form.labelCaretaker': 'Responsable familial',
  'form.caretakerAnyone': 'Indifférent',
  'form.saveButtonEdit': 'Enregistrer les modifications',
  'form.editSaveFailedTitle': 'Échec de l’enregistrement',

  'form.datePickerLabel': 'Choisir une date',
  'form.datePickerDone': 'Terminé',
  'form.datePickerDoneA11y': 'Terminer le choix de la date',

  'log.subtitle':
    'Un instant de soin tranquille. Les photos vous aident à voir grandir votre plante au fil des saisons.',
  'log.careTypeLabel': 'Type de soin',
  'log.noteLabel': 'Note',
  'log.notePlaceholder': 'Une nouvelle feuille presque ouverte…',
  'log.photoLabel': 'Photo',
  'log.photoBoxPlaceholder': 'Touchez pour ajouter une photo',
  'log.saveButton': 'Enregistrer · {careType}',
  'log.plantMissingTitle': 'Plante manquante',
  'log.photoRequiredTitle': 'Photo requise',
  'log.photoRequiredBody': 'Ajoutez une photo pour cette entrée de type photo.',
  'log.saveErrorTitle': 'Échec de l’enregistrement',
  'log.saveErrorBody': 'Réessayez dans un instant.',
  'log.notFound': 'Plante introuvable.',

  'detail.lightboxClose': 'Fermer',

  'settings.syncTitle': 'Sauvegarde et synchronisation',
  'settings.syncPremiumBlurb':
    'Premium : connectez-vous une fois et vos plantes, historique de soins et photos sont sauvegardés automatiquement et vous suivent sur tous vos appareils.',
  'settings.syncSignedInBlurb':
    'Connecté avec {provider}. Tout se synchronise automatiquement : après chaque modification, à l’ouverture de l’appli et à votre retour.',
  'settings.syncSignedInBlurbWithEmail':
    'Connecté avec {provider} · {email}. Tout se synchronise automatiquement : après chaque modification, à l’ouverture de l’appli et à votre retour.',
  'settings.syncStatusSyncing': 'Synchronisation…',
  'settings.syncStatusError': 'Synchronisation impossible — nouvelle tentative automatique.',
  'settings.syncStatusLast': 'Dernière synchronisation : {date}',
  'settings.syncStatusPending': 'Première synchronisation en attente.',
  'settings.syncNowButton': 'Synchroniser maintenant',
  'settings.syncSignOutButton': 'Se déconnecter',
  'settings.syncDeleteButton': 'Supprimer les données synchronisées',
  'settings.syncDeletingButton': 'Suppression…',
  'settings.syncDeleteHint': 'Supprime définitivement votre collection du cloud',
  'settings.syncDeleteTitle': 'Supprimer les données synchronisées ?',
  'settings.syncDeleteBody':
    'Cette action supprime définitivement vos plantes, votre historique de soins et vos photos du cloud, et vous déconnecte. Vos plantes restent sur cet appareil — supprimez l’appli pour les retirer aussi. Cette action est irréversible.',
  'settings.syncDeleteConfirm': 'Supprimer',
  'settings.syncDeletedTitle': 'Données synchronisées supprimées',
  'settings.syncDeleteFailedTitle': 'Échec de la suppression',
  'settings.syncDeletedBody':
    'Votre collection cloud a disparu et la synchronisation est désactivée. Vos plantes restent sur cet appareil.',
  'settings.syncSignOutTitle': 'Se déconnecter ?',
  'settings.syncSignOutBody':
    'La synchronisation est mise en pause sur cet appareil. Vos plantes restent ici et dans votre sauvegarde cloud.',
  'settings.syncSignInBlurb':
    'Connectez-vous une fois — vos plantes, historique de soins et photos se sauvegardent et se synchronisent automatiquement sur tous vos appareils.',
  'settings.syncAppleUnavailable':
    'Connectez-vous à un compte Apple dans les Réglages système pour activer Se connecter avec Apple.',
  'settings.syncGoogleButton': 'Continuer avec Google',
  'settings.syncGoogleFailedTitle': 'Échec de la connexion avec Google',
  'settings.syncAppleSignedInTitle': 'Connecté',
  'settings.syncAppleSignedInBody': 'Vos plantes se sauvegardent et se synchronisent désormais automatiquement.',
  'settings.syncAppleFailedTitle': 'Échec de la connexion avec Apple',
  'settings.syncFailedTitle': 'Échec de la synchronisation',
  'settings.syncAdvancedHide': 'Masquer la liaison avancée',
  'settings.syncAdvancedShow': 'Avancé : lier avec un code de synchronisation',
  'settings.syncCodeHide': 'Masquer le code de cet appareil',
  'settings.syncCodeShow': 'Afficher le code de cet appareil',
  'settings.syncCodeWarning': 'Traitez-le comme un mot de passe.',
  'settings.syncCodePlaceholder': 'Collez un code de synchronisation…',
  'settings.syncLinkButton': 'Lier',
  'settings.syncInvalidCodeTitle': 'Code invalide',
  'settings.syncLinkedTitle': 'Appareil lié',
  'settings.syncLinkedFailedTitle': 'Lié, mais la synchronisation a échoué',
  'settings.syncLinkedBodyOne': 'Vous partagez maintenant une collection (1 plante).',
  'settings.syncLinkedBodyMany': 'Vous partagez maintenant une collection ({count} plantes).',
  'settings.syncLinkedSyncing': 'Synchronisation de votre collection…',

  'paywall.closeA11y': 'Fermer',

  'notFound.title': 'Oups !',
  'notFound.body': 'Cet écran n’existe pas.',
  'notFound.link': 'Retour à l’accueil',

  // "Appareil photo", not "caméra" — a stills camera, matching form.camera
  // above (a review already corrected this elsewhere in the catalog).
  'camera.permissionTitle': 'Accès à l’appareil photo',
  'camera.permissionBody':
    'Verdant a besoin de l’appareil photo pour les portraits de plantes et les photos de progression. Les photos restent sur votre appareil.',
  'camera.permissionAllow': 'Autoriser l’appareil photo',
  'camera.permissionDismiss': 'Pas maintenant',
  'camera.closeA11y': 'Fermer l’appareil photo',
  'camera.titleLive': 'Appareil photo de la serre',
  'camera.titleReview': 'Vérifier le portrait',
  'camera.flashA11y': 'Flash : {mode}',
  'camera.tip':
    'Cadrez une feuille ou la plante entière · une lumière vive et homogène fonctionne mieux',
  'camera.retake': 'Refaire',
  'camera.retakeA11y': 'Reprendre la photo',
  'camera.usePhoto': 'Utiliser la photo',
  'camera.usePhotoA11y': 'Utiliser cette photo',
  'camera.flip': 'Inverser',
  'camera.flipA11y': 'Changer d’appareil photo',
  'camera.captureA11y': 'Prendre une photo',
  'camera.back': 'Retour',
};

const de: Messages = {
  'paywall.eyebrow': 'Verdant Premium',
  'paywall.title': 'Wachse ohne Grenzen.',
  'paywall.subtitle': 'Behalte jede Pflanze, lass die KI sie bestimmen und beraten, und sichere alles auf deinen Geräten.',
  'paywall.reasonLimit': 'Du hast deine {limit} kostenlosen Pflanzen gefüllt. Werde unbegrenzt.',
  'paywall.reasonAi': 'KI-Bestimmung und -Coaching gehören zu Premium.',
  'paywall.reasonSync': 'Cloud-Backup und -Synchronisierung gehören zu Premium.',
  'paywall.reasonInsights': 'KI-Sammlungsanalysen gehören zu Premium.',
  'paywall.benefitUnlimited': 'Unbegrenzte Pflanzen',
  'paywall.benefitUnlimitedBody': 'Lass deine ganze Sammlung wachsen — ohne 5-Pflanzen-Limit.',
  'paywall.benefitAi': 'KI-Bestimmung & Pflege-Coach',
  'paywall.benefitAiBody': 'Ein Foto für Art, Zeitplan und sanftes Coaching.',
  'paywall.benefitSync': 'Cloud-Backup & Sync',
  'paywall.benefitSyncBody': 'Deine Pflanzen und Fotos, sicher auf jedem Gerät.',
  'paywall.benefitInsights': 'Sammlungsanalysen',
  'paywall.benefitInsightsBody': 'Serien, Aktivität und eine KI-Notiz zu deinem Fortschritt.',
  'paywall.yearlyCta': 'Premium holen · {price}',
  'paywall.yearlyTrialCta': '7 Tage kostenlos testen',
  'paywall.yearlyTrialSub': 'danach {price}/Jahr · jederzeit kündbar',
  'paywall.lifetimeCta': 'Einmal zahlen, für immer · {price}',
  'paywall.restore': 'Käufe wiederherstellen',
  'paywall.legal': 'Abrechnung über App Store oder Google Play. Jederzeit in deinen Kontoeinstellungen kündbar.',
  'paywall.unlockedTitle': 'Willkommen bei Premium',
  'paywall.unlockedBody': 'Alles freigeschaltet. Viel Freude beim Gärtnern.',
  'paywall.unlockedDemo': 'Demo-Freischaltung. Echte Käufe werden in Store-Builds aktiv.',
  'paywall.unavailableTitle': 'Kauf nicht verfügbar',
  'paywall.restoredTitle': 'Wiederhergestellt',
  'paywall.restoredBody': 'Dein Premium-Kauf ist wieder aktiv.',
  'paywall.noPurchasesTitle': 'Keine Käufe gefunden',
  'paywall.noPurchasesBody': 'Noch kein aktives Verdant Premium auf diesem Store-Konto.',
  'nav.paywall': 'Verdant Premium',
  'tabs.plants': 'Pflanzen',
  'tabs.care': 'Pflege',
  'tabs.insights': 'Einblicke',
  'tabs.settings': 'Einstellungen',
  'tabs.plantsA11y': 'Meine Pflanzen',
  'tabs.careA11y': 'Pflegekalender',
  'tabs.insightsA11y': 'Sammlungs-Einblicke',
  'tabs.settingsA11y': 'Einstellungen',

  'nav.addPlant': 'Pflanze hinzufügen',
  'nav.editPlant': 'Pflanze bearbeiten',
  'nav.plant': 'Pflanze',
  'nav.logCare': 'Pflege notieren',
  'nav.privacy': 'Datenschutzerklärung',
  'nav.terms': 'Nutzungsbedingungen',
  'legal.lastUpdated': 'Zuletzt aktualisiert: {date}',

  'welcome.valueHeadline': 'Pflege, die du\nwachsen siehst.',
  'welcome.valueSub':
    'Ein ruhiges, fotobasiertes Pflanzentagebuch, das dich bittet, die Erde vor dem Gießen zu prüfen — nie blinde Zeitpläne.',
  'welcome.previewWater': 'In 3 Tagen gießen · zuerst Erde prüfen',
  'welcome.continue': 'Weiter',
  'welcome.privacyMark': 'Deins, privat',
  'welcome.privacyHeadline': 'Privat von\nAnfang an.',
  'welcome.offlineTitle': 'Funktioniert komplett offline',
  'welcome.offlineBody':
    'Deine Pflanzen und Fotos bleiben auf deinem Gerät. Kein Konto nötig, um zu starten.',
  'welcome.syncTitle': 'Nur zum Sync anmelden',
  'welcome.syncBody':
    'Die optionale Apple- oder Google-Anmeldung sichert und synchronisiert über deine Geräte.',
  'welcome.aiTitle': 'Premium-KI, sicher',
  'welcome.aiBody':
    'Pflanzenerkennung und Coaching laufen auf unseren Servern — nie ein API-Schlüssel auf deinem Handy.',
  'welcome.startCollection': 'Starte deine Sammlung',
  'welcome.signInSync': 'Anmelden zum Sichern & Synchronisieren',
  'welcome.haveePlants': 'Ich habe schon Pflanzen',

  'settings.title': 'Einstellungen',
  'settings.collectionTitle': 'Deine Sammlung',
  'settings.collectionSummary': '{count} von {limit} Pflanzen · {tier} · {source}',
  'settings.tierPremium': 'Premium',
  'settings.tierFree': 'Kostenlos',

  'settings.premiumBadge': 'Premium',
  'settings.premiumActive': 'Premium aktiv',
  'settings.premiumUnlock': 'Premium freischalten',
  'settings.premiumBlurb':
    'Unbegrenzte Pflanzen + Server-KI. Produkt-IDs bereit für App Store / Play ({productId}).',
  'settings.colFeature': 'Funktion',
  'settings.colFree': 'Kostenlos',
  'settings.colPremium': 'Premium',
  'settings.benefitPlants': 'Pflanzen in deiner Sammlung',
  'settings.benefitCalendar': 'Kalender „vor dem Gießen prüfen“',
  'settings.benefitFamily': 'Familien-Haushalt & Pflegeblätter',
  'settings.benefitAi': 'KI-Pflanzenerkennung + Coach',
  'settings.benefitSync': 'Cloud-Backup & Geräte-Sync',
  'settings.valueUpTo': 'Bis zu {limit}',
  'settings.valueUnlimited': 'Unbegrenzt',
  'settings.valueIncluded': 'Enthalten',
  'settings.valueServerAi': 'Server-KI',
  'settings.valueAutomatic': 'Automatisch',
  'settings.valueNone': '—',
  'settings.buyYearlyCta': 'Premium · jährlich · {price}',
  'settings.restore': 'Käufe wiederherstellen',
  'settings.switchFreeDemo': 'Zu Kostenlos wechseln (Demo)',
  'settings.managePlan': 'Abo in den System­einstellungen verwalten',
  'settings.storeFootnoteDev':
    'Dev: Kauf nutzt Demo-Freischaltung, bis StoreKit / Play in EAS-Builds verknüpft ist.',
  'settings.storeFootnoteProd':
    'Käufe laufen über Apple / Google, sobald die Store-Produkte live sind.',

  'settings.purchaseUnavailable': 'Kauf nicht verfügbar',
  'settings.premiumUnlockedTitle': 'Premium freigeschaltet',
  'settings.premiumUnlockedDemo':
    'Demo-Freischaltung für die Entwicklung. Store-Produkte gehen mit EAS-Produktions-Builds + App Store / Play-SKUs live.',
  'settings.premiumUnlockedThanks': 'Danke — Premium ist aktiv.',
  'settings.restoreTitle': 'Wiederherstellen',
  'settings.restoredTitle': 'Wiederhergestellt',
  'settings.restoredBody': 'Dein Premium-Kauf wurde wiederhergestellt.',
  'settings.noPurchasesTitle': 'Keine Käufe gefunden',
  'settings.noPurchasesBody':
    'Noch kein aktives Verdant-Premium-Abo mit diesem Store-Konto.',
  'settings.manageSubTitle': 'Abo verwalten',
  'settings.manageSubBody':
    'Kündige oder ändere Premium in iOS-Einstellungen → Apple-ID → Abonnements oder Google Play → Zahlungen & Abos.',

  'settings.languageTitle': 'Sprache',
  'settings.languageBlurb':
    'Wähle die Sprache für Verdant. Folgt deiner Gerätesprache, bis du hier eine wählst.',

  'settings.familyTitle': 'Familienfreigabe',
  'settings.familyBlurb':
    'Lokaler Haushalt — weise Pfleger zu und teile Pflegeblätter. Verknüpfe Geräte oben über Backup & Sync.',
  'settings.householdName': 'Haushaltsname',
  'settings.householdPlaceholder': 'z. B. Unser Gewächshaus',
  'settings.members': 'Mitglieder',
  'settings.membersEmpty':
    'Noch keine Mitglieder — füge Partner, Mitbewohner oder Kinder hinzu, die beim Gießen helfen.',
  'settings.roleOwner': 'Eigentümer',
  'settings.roleMember': 'Mitglied',
  'settings.remove': 'Entfernen',
  'settings.removeMemberTitle': 'Mitglied entfernen?',
  'settings.cancel': 'Abbrechen',
  'settings.namePlaceholder': 'Name',
  'settings.add': 'Hinzufügen',
  'settings.nameNeededTitle': 'Name fehlt',
  'settings.nameNeededBody': 'Gib den Namen eines Familienmitglieds ein.',
  'settings.shareCareSheet': 'Pflegeblatt teilen',
  'settings.inviteFamily': 'Familie einladen (Anleitung)',
  'settings.shareFailed': 'Teilen fehlgeschlagen',

  'settings.aiTitle': 'KI-Assistent',
  'settings.aiBlurb':
    'Erkenne Pflanzen aus Fotos und erhalte ruhiges Pflege-Coaching. Die KI läuft auf Verdants Servern — keine Schlüssel oder Konten auf deinem Gerät.',
  'settings.aiStatusPremium': 'Status: Premium · KI freigeschaltet',
  'settings.aiStatusFree': 'Status: Kostenlos · Upgrade für KI',
  'settings.aiEndpoint': 'Endpoint: {url}',

  'settings.notificationsTitle': 'Sanfte Benachrichtigungen',
  'settings.notificationsBlurb':
    'Lokale Erinnerungen, die Erde zu prüfen, wenn Pflege ansteht.',
  'settings.notificationsDisabledTitle': 'Benachrichtigungen deaktiviert',
  'settings.notificationsDisabledBody':
    'Aktiviere Benachrichtigungen in den Systemeinstellungen, um sanfte Erinnerungen zu erhalten.',

  'settings.aboutTitle': 'Über',
  'settings.aboutBody':
    '{appName} v{version}\nEin ruhiges, fotobasiertes Pflanzentagebuch. Funktioniert komplett offline — melde dich an, um über Geräte zu sichern und zu synchronisieren.',
  'settings.privacyPolicy': 'Datenschutzerklärung',
  'settings.termsOfUse': 'Nutzungsbedingungen',

  'domain.light.low': 'Wenig Licht',
  'domain.light.medium': 'Mittel',
  'domain.light.bright': 'Helles indirektes Licht',
  'domain.light.direct': 'Direkte Sonne',
  'domain.pot.small': 'Kleiner Topf',
  'domain.pot.medium': 'Mittlerer Topf',
  'domain.pot.large': 'Großer Topf',
  'domain.pet.unknown': 'Haustiere: unbekannt',
  'domain.pet.safe': 'Haustierfreundlich',
  'domain.pet.caution': 'Haustiere: Vorsicht',
  'domain.pet.toxic': 'Giftig für Haustiere',
  'domain.careType.water': 'Gegossen',
  'domain.careType.fertilize': 'Gedüngt',
  'domain.careType.note': 'Notiz',
  'domain.careType.photo': 'Foto',
  'domain.careType.check': 'Erde geprüft',
  'domain.careAction.water': 'Gießen',
  'domain.careAction.fertilize': 'Düngen',
  'domain.category.Houseplant': 'Zimmerpflanze',
  'domain.category.Orchid': 'Orchidee',
  'domain.category.Succulent': 'Sukkulente',
  'domain.category.Cactus': 'Kaktus',
  'domain.category.Fern': 'Farn',
  'domain.category.Herb': 'Kräuter',
  'domain.category.Other': 'Andere',

  'domain.care.overdueOne': '1 Tag überfällig',
  'domain.care.overdueMany': '{count} Tage überfällig',
  'domain.care.dueToday': 'Heute fällig',
  'domain.care.dueTomorrow': 'Morgen fällig',
  'domain.care.inDays': 'In {count} Tagen',

  'domain.confidence.high': 'Hoch',
  'domain.confidence.medium': 'Mittel',
  'domain.confidence.low': 'Niedrig',
  'domain.urgency.none': 'Keine',
  'domain.urgency.watch': 'Beobachten',
  'domain.urgency.soon': 'Bald',
  'domain.urgency.urgent': 'Dringend',
  'domain.flash.off': 'Aus',
  'domain.flash.on': 'An',
  'domain.flash.auto': 'Automatisch',

  // Plants — home screen ("My Plants")
  'plants.title': 'Meine Pflanzen',
  'plants.searchPlaceholder': 'Name, Art, Raum suchen…',
  'plants.categoryAll': 'Alle',
  'plants.roomAll': 'Alle Räume',
  'plants.subtitleFreeOne': '1 Pflanze · Kostenlos: {limit}',
  'plants.subtitleFreeMany': '{count} Pflanzen · Kostenlos: {limit}',
  'plants.subtitlePremiumOne': '1 Pflanze · Premium',
  'plants.subtitlePremiumMany': '{count} Pflanzen · Premium',
  'plants.subtitleFreeFilteredOne':
    '1 Pflanze · Kostenlos: {limit} · {shown} sichtbar',
  'plants.subtitleFreeFilteredMany':
    '{count} Pflanzen · Kostenlos: {limit} · {shown} sichtbar',
  'plants.subtitlePremiumFilteredOne': '1 Pflanze · Premium · {shown} sichtbar',
  'plants.subtitlePremiumFilteredMany':
    '{count} Pflanzen · Premium · {shown} sichtbar',
  'plants.emptyTitle': 'Dein Gewächshaus ist still',
  'plants.emptyBody':
    'Füge eine Pflanze mit einem Foto hinzu. Nutze die KI-Bestimmung, um Art und Pflegeintervalle auszufüllen — dann lege Raum, Licht und Topf fest, damit die Zeitpläne mitdenken.',
  'plants.addFirstPlant': 'Füge deine erste Pflanze hinzu',
  'plants.noMatchesTitle': 'Keine Treffer',
  'plants.noMatchesBody':
    'Versuche eine andere Suche, Kategorie oder einen anderen Raumfilter.',
  'plants.clearFilters': 'Filter zurücksetzen',
  'plants.addPlant': 'Pflanze hinzufügen',
  'plants.upgradeTitle': 'Deine {limit} Gratis-Pflanzen sind voll',
  'plants.upgradeSubtitle':
    'Hol dir Premium für unbegrenzte Pflanzen, KI und Cloud-Sync →',
  'plants.upgradeA11y': 'Für unbegrenzte Pflanzen auf Premium upgraden',

  // Calendar — Care calendar screen ("Gentle reminders")
  'calendar.eyebrow': 'Pflegekalender',
  'calendar.title': 'Sanfte Erinnerungen',
  'calendar.subtitle':
    'Sanfte Hinweise, nach deinen Pflanzen zu sehen — keine Gießbefehle.',
  'calendar.weekStripA11y': 'Nächste sieben Tage',
  'calendar.weekStripDayNone': '{date}',
  'calendar.weekStripDayOne': '{date}, 1 fällig',
  'calendar.weekStripDayMany': '{date}, {count} fällig',
  'calendar.emptyStateTitle': 'Noch nichts geplant',
  'calendar.emptyStateBody':
    'Füge Pflanzen mit Gieß- und Düngeintervallen hinzu, um einen ruhigen Pflegekalender aufzubauen.',
  'calendar.emptyStateAction': 'Pflanze hinzufügen',
  'calendar.philosophyTitle': 'Vor dem Gießen prüfen',
  'calendar.philosophyBody':
    'Stecke einen Finger in die Erde. Ist sie noch feucht, tippe auf Noch feucht (+{days}T). Wische eine Karte nach rechts, um das Gießen zu notieren. Die Intervalle passen sich außerdem an Topfgröße und Licht an.',
  'calendar.philosophyCollapsed':
    'Wischen zum Notieren · vor dem Gießen Erde prüfen',
  'calendar.sectionOverdue': 'Überfällig',
  'calendar.sectionToday': 'Heute',
  'calendar.sectionUpcoming': 'Bevorstehend',
  'calendar.emptyOverdue': 'Alles erledigt',
  'calendar.emptyToday': 'Heute keine Pflege fällig',
  'calendar.emptyUpcoming': 'Keine Pflege in Sicht',
  'calendar.rowMeta': '{careVerb} · {relative}',
  'calendar.rowMetaWithLocation': '{careVerb} · {relative} · {location}',
  'calendar.rowA11yLabel':
    '{name}, {careVerb}, {relative}. Tippen für die Pflanze, lange drücken zum Notieren.',
  'calendar.intervalWater': '~alle {days}T (licht-/topfabhängig)',
  'calendar.intervalWaterCheckFirst':
    '~alle {days}T (licht-/topfabhängig) · zuerst Erde prüfen',
  'calendar.intervalFertilize': 'alle {days}T',
  'calendar.actionStillMoist': 'Noch feucht',
  'calendar.actionLog': 'Notieren',
  'calendar.actionDetails': 'Details',
  'calendar.swipeFed': 'Gedüngt',
  'calendar.toastWatered': '{name} gegossen',
  'calendar.toastFed': '{name} gedüngt',
  'calendar.toastSnoozed': '{name} · verschoben um {days}T',
  'calendar.toastError': 'Konnte nicht gespeichert werden — bitte erneut versuchen',

  // Insights — collection stats + AI coach screen
  'insights.title': 'Einblicke',
  'insights.subtitle': 'Pflegeverlauf und KI-Coaching für deine Sammlung. {tail}',
  'insights.subtitleTailPremium': 'Premium · Server-KI freigeschaltet.',
  'insights.subtitleTailFree': 'Kostenlos · KI erfordert Premium.',
  'insights.emptyTitle': 'Noch keine Daten',
  'insights.emptyBody':
    'Füge Pflanzen hinzu und notiere Pflege, um Statistiken und KI freizuschalten.',
  'insights.emptyAction': 'Pflanze hinzufügen',
  'insights.statPlants': 'Pflanzen',
  'insights.statCareLogs': 'Einträge',
  'insights.statStreak': 'Serie',
  'insights.statOverdue': 'Überfällig',
  'insights.statA11yLabel': '{label}: {value}',
  'insights.tapForCareList': 'Für Liste tippen',
  'insights.streakValue': '{count}T',
  'insights.activityTitle': 'Aktivität (14 Tage)',
  'insights.last7and30': 'Letzte 7 Tage: {sevenDays} · Letzte 30 Tage: {thirtyDays}',
  'insights.breakdownTitle': 'Übersicht',
  'insights.breakdownWater': 'Wasser',
  'insights.breakdownFeed': 'Dünger',
  'insights.breakdownNotes': 'Notizen',
  'insights.breakdownPhotos': 'Fotos',
  'insights.mostActiveOne': 'Aktivste: {name} (1 Eintrag)',
  'insights.mostActiveMany': 'Aktivste: {name} ({count} Einträge)',
  'insights.categoryRow': '{category} · {count}',
  'insights.dueToday': 'Heute fällig: {count}',
  'insights.aiTitle': 'KI-Einblick zur Sammlung',
  'insights.aiBodyPremium':
    'Eine kurze Coaching-Notiz zu deinen Daten. Premium-KI · ~{usesLeft} sanfte Nutzungen heute auf diesem Gerät übrig.',
  'insights.aiBodyFree':
    'Nur Premium — schalte es in den Einstellungen frei für eine ruhige Coaching-Notiz zu deiner Sammlung.',
  'insights.aiButtonGenerate': 'Einblick erzeugen',
  'insights.aiButtonThinking': 'Denkt nach…',
  'insights.aiButtonUnlock': 'Premium für KI freischalten',
  'insights.aiHintGenerate': 'Nutzt Premium-KI für eine kurze Notiz zur Sammlung',
  'insights.aiHintUnlock': 'Öffnet den Premium-Upgrade-Bildschirm',
  'insights.alertNoPlantsTitle': 'Noch keine Pflanzen',
  'insights.alertNoPlantsBody': 'Füge zuerst Pflanzen und Pflegeeinträge hinzu.',
  'insights.alertAiLimitTitle': 'KI-Limit',
  'insights.alertInsightFailedTitle': 'Einblick fehlgeschlagen',
  'insights.alertUnknownError': 'Unbekannter Fehler',

  // Detail — plant detail screen (app/plant/[id].tsx)
  'detail.headerEdit': 'Bearbeiten',
  'detail.headerEditA11y': 'Pflanze bearbeiten',
  'detail.headerDelete': 'Löschen',
  'detail.headerDeleteA11y': 'Pflanze löschen',
  'detail.deleteAlertTitle': 'Pflanze entfernen?',
  'detail.deleteAlertBody':
    '{name} und ihre Pflegehistorie löschen? Das kann nicht rückgängig gemacht werden.',
  'detail.cancel': 'Abbrechen',
  'detail.notFound': 'Pflanze nicht gefunden.',
  'detail.heroMeta': '{category}',
  'detail.heroMetaLocation': '{category} · {location}',
  'detail.heroMetaAge': '{category} · {age}',
  'detail.heroMetaLocationAge': '{category} · {location} · {age}',
  'detail.heroAgeOne': '1 T bei dir',
  'detail.heroAgeMany': '{days} T bei dir',
  'detail.waterRhythmChip': 'Gießrhythmus ~{days}T',
  'detail.actionWateredHint': 'Öffnet den Pflegeeintrag, um das Gießen zu notieren',
  'detail.actionStillMoist': 'Noch feucht',
  'detail.actionSaving': 'Speichern…',
  'detail.actionMoistHint':
    'Notiert eine Erdprüfung und verschiebt die Gießerinnerung',
  'detail.toastSnoozed': 'Um ~{days} Tage verschoben · Erde später erneut prüfen',
  'detail.saveErrorTitle': 'Konnte nicht gespeichert werden',
  'detail.saveErrorBody': 'Versuche es gleich noch einmal.',
  'detail.actionFed': 'Gedüngt',
  'detail.actionNotePhoto': 'Notiz / Foto',
  'detail.tabLog': 'Einträge',
  'detail.tabGallery': 'Wachstum',
  'detail.tabAi': 'KI-Hilfe',
  'detail.logEmpty':
    'Noch keine Pflegeeinträge. Notiere Gießen, Düngen, Notizen und Fotos nach und nach.',
  'detail.logRowDeleteTitle': 'Eintrag löschen?',
  'detail.logRowDeleteBody': 'Entfernt diesen Pflegeeintrag.',
  'detail.logRowDeleteAction': 'Löschen',
  'detail.logRowLongPressHint': 'Lange drücken zum Löschen',
  'detail.galleryEmpty':
    'Füge ein Foto oder Pflegefotos hinzu, um das Wachstum über die Zeit zu sehen.',
  'detail.galleryPortraitLabel': 'Porträt',
  'detail.aiStatusPremium':
    'Premium-KI · Anfragen laufen über Verdant-Server (kein Schlüssel auf dem Gerät)',
  'detail.aiStatusFree': 'KI erfordert Premium · nur zu Informationszwecken',
  'detail.reidentifyTitle': 'Aus Foto neu bestimmen',
  'detail.reidentifyBody':
    'Aktualisiert Art, Kategorie und Intervalle anhand des aktuellen Fotos.',
  'detail.reidentifyBodyConfidence':
    'Aktualisiert Art, Kategorie und Intervalle anhand des aktuellen Fotos. Letzte Sicherheit: {confidence}.',
  'detail.reidentifyButtonIdle': 'KI neu bestimmen',
  'detail.reidentifyButtonLoading': 'Wird bestimmt…',
  'detail.careGuideTitle': 'Pflegeleitfaden zur Art',
  'detail.careGuideBody': 'Wird nach der Erstellung auf dieser Pflanze gespeichert.',
  'detail.careGuideBodyLast':
    'Wird nach der Erstellung auf dieser Pflanze gespeichert. Zuletzt: {date}.',
  'detail.careGuideButtonGenerate': 'Pflegeleitfaden erstellen',
  'detail.careGuideButtonRefresh': 'Pflegeleitfaden aktualisieren',
  'detail.careGuideButtonLoading': 'Wird geschrieben…',
  'detail.guideLabelLight': 'Licht',
  'detail.guideLabelWater': 'Wasser',
  'detail.guideLabelHumidity': 'Luftfeuchtigkeit',
  'detail.guideLabelSoil': 'Erde',
  'detail.coachTitle': 'Pflege-Coach',
  'detail.coachBody':
    'Nutzt Pflegeverlauf und Foto. Antworten werden auf dieser Pflanze gespeichert.',
  'detail.coachPlaceholder':
    'z. B. Gelbe Spitzen an neuen Blättern — was sollte ich prüfen?',
  'detail.coachDefaultQuestion':
    'Wie geht es dieser Pflanze? Was sollte ich als Nächstes tun?',
  'detail.coachDefaultQuestionShort': 'Wie geht es dieser Pflanze?',
  'detail.coachButtonIdle': 'Coach fragen',
  'detail.coachButtonLoading': 'Denkt nach…',
  'detail.coachUrgency': 'Dringlichkeit · {urgency}',
  'detail.savedAnswersTitle': 'Gespeicherte Antworten',
  'detail.historyMeta': '{date} · {urgency}',
  'detail.aiLimitTitle': 'KI-Limit',
  'detail.coachFailedTitle': 'Pflege-Coach fehlgeschlagen',
  'detail.guideFailedTitle': 'Pflegeleitfaden fehlgeschlagen',
  'detail.photoNeededTitle': 'Foto benötigt',
  'detail.photoNeededBody': 'Füge zuerst ein Pflanzenfoto hinzu (Bearbeiten).',
  'detail.identifyFailedTitle': 'Bestimmung fehlgeschlagen',
  'detail.unknownError': 'Unbekannter Fehler',
  'detail.aiUpdatedTitle': 'Von KI aktualisiert',
  'detail.aiUpdatedBody':
    '{commonName}\nSicherheit: {confidence}\nLicht: {light} · {pets}',
  'detail.aiUpdatedBodyWithScientific':
    '{commonName} · {scientificName}\nSicherheit: {confidence}\nLicht: {light} · {pets}',

  // Form — Add / Edit plant screens
  'form.labelName': 'Name',
  'form.labelSpecies': 'Art',
  'form.labelCategory': 'Kategorie',
  'form.labelLocation': 'Raum / Standort',
  'form.labelLight': 'Licht an diesem Ort',
  'form.labelPotSize': 'Topfgröße',
  'form.labelPetSafety': 'Haustiersicherheit',
  'form.labelAcquiredDate': 'Erworben am',
  'form.labelFertilizeDays': 'Düngen alle (Tage)',
  'form.labelNotes': 'Notizen',
  'form.placeholderLocation': 'z. B. Wohnzimmer · Ostfenster',
  'form.library': 'Galerie',
  'form.camera': 'Kamera',
  'form.nameRequiredTitle': 'Name erforderlich',
  'form.nameRequiredBody': 'Gib deiner Pflanze einen Namen (mind. 2 Zeichen).',
  'form.photoPermissionTitle': 'Berechtigung erforderlich',
  'form.photoPermissionBody':
    'Erlaube den Zugriff auf die Galerie, um ein Foto hinzuzufügen.',
  'form.retryBody': 'Versuche es gleich noch einmal.',

  'form.photoPlaceholderAdd': 'Tippen, um ein Foto zu wählen',
  'form.aiIdentifyLoading': 'Wird bestimmt…',
  'form.aiIdentifyButtonPremium': 'KI-Bestimmung (Premium)',
  'form.aiIdentifyButtonPremiumOnly': 'KI-Bestimmung (nur Premium)',
  'form.aiIdentifyHint':
    'Premium: Die KI füllt Name, Art, Kategorie und Intervalle anhand deines Fotos aus. Der Schlüssel bleibt auf Verdant-Servern.',
  'form.aiHintResult':
    '{commonName} · Sicherheit: {confidence} · Licht: {light} · {pets}',
  'form.aiHintResultWithScientific':
    '{commonName} ({scientificName}) · Sicherheit: {confidence} · Licht: {light} · {pets}',
  'form.placeholderName': 'z. B. Mondschein',
  'form.placeholderSpecies': 'z. B. Philodendron hederaceum',
  'form.labelWaterDays': 'Gießen alle (Tage)',
  'form.scheduleHint':
    'Zeitpläne passen sich an Licht und Topfgröße an. Der Kalender nutzt „Erde prüfen vor dem Gießen“ (kein blindes „jetzt gießen“ wie bei den meisten Pflege-Apps).',
  'form.placeholderNotes': 'Erdmischung, Herkunft…',
  'form.saveButtonAdd': 'Pflanze speichern',
  'form.photoNeededTitle': 'Foto benötigt',
  'form.photoNeededBody':
    'Füge zuerst ein Pflanzenfoto hinzu und starte dann die KI-Bestimmung.',
  'form.aiLimitTitle': 'KI-Limit',
  'form.identifyFailedTitle': 'KI-Bestimmung fehlgeschlagen',
  'form.unknownError': 'Unbekannter Fehler',
  'form.addFailedTitle': 'Pflanze konnte nicht hinzugefügt werden',

  'form.notFound': 'Pflanze nicht gefunden.',
  'form.photoPlaceholderEdit': 'Foto hinzufügen',
  'form.labelBaseWaterDays': 'Basis-Gießen (Tage)',
  'form.waterRhythmHintOne':
    'Tatsächlicher Gießrhythmus ≈ jeden Tag (angepasst an Licht und Topf — besser als blinde Zeitpläne, die zu viel gießen).',
  'form.waterRhythmHintMany':
    'Tatsächlicher Gießrhythmus ≈ alle {days} Tage (angepasst an Licht und Topf — besser als blinde Zeitpläne, die zu viel gießen).',
  'form.checkBeforeWaterTitle': 'Erde vor dem Gießen prüfen',
  'form.checkBeforeWaterBody':
    'Der Kalender zeigt die Verschiebung „{stillMoist}“ — der zentrale Unterschied zwischen Verdant und Planta.',
  'form.labelCaretaker': 'Pflegeperson (Familie)',
  'form.caretakerAnyone': 'Beliebig',
  'form.saveButtonEdit': 'Änderungen speichern',
  'form.editSaveFailedTitle': 'Konnte nicht gespeichert werden',

  'form.datePickerLabel': 'Datum wählen',
  'form.datePickerDone': 'Fertig',
  'form.datePickerDoneA11y': 'Datumsauswahl abschließen',

  'log.subtitle':
    'Ein ruhiger Moment der Pflege. Fotos zeigen dir, wie deine Pflanze mit den Jahreszeiten wächst.',
  'log.careTypeLabel': 'Pflegeart',
  'log.noteLabel': 'Notiz',
  'log.notePlaceholder': 'Neues Blatt fast entfaltet…',
  'log.photoLabel': 'Foto',
  'log.photoBoxPlaceholder': 'Tippen, um ein Foto hinzuzufügen',
  'log.saveButton': 'Speichern · {careType}',
  'log.plantMissingTitle': 'Pflanze fehlt',
  'log.photoRequiredTitle': 'Foto erforderlich',
  'log.photoRequiredBody': 'Füge ein Foto für diesen Foto-Eintrag hinzu.',
  'log.saveErrorTitle': 'Konnte nicht gespeichert werden',
  'log.saveErrorBody': 'Versuche es gleich noch einmal.',
  'log.notFound': 'Pflanze nicht gefunden.',

  'detail.lightboxClose': 'Schließen',

  'settings.syncTitle': 'Backup & Synchronisierung',
  'settings.syncPremiumBlurb':
    'Premium: Melde dich einmal an, und deine Pflanzen, dein Pflegeverlauf und deine Fotos werden automatisch gesichert und folgen dir auf jedes Gerät.',
  'settings.syncSignedInBlurb':
    'Angemeldet mit {provider}. Alles wird automatisch synchronisiert — nach Änderungen, beim Öffnen der App und wenn du zurückkehrst.',
  'settings.syncSignedInBlurbWithEmail':
    'Angemeldet mit {provider} · {email}. Alles wird automatisch synchronisiert — nach Änderungen, beim Öffnen der App und wenn du zurückkehrst.',
  'settings.syncStatusSyncing': 'Wird synchronisiert…',
  'settings.syncStatusError': 'Synchronisierung nicht möglich — wird automatisch erneut versucht.',
  'settings.syncStatusLast': 'Zuletzt synchronisiert: {date}',
  'settings.syncStatusPending': 'Erste Synchronisierung ausstehend.',
  'settings.syncNowButton': 'Jetzt synchronisieren',
  'settings.syncSignOutButton': 'Abmelden',
  'settings.syncDeleteButton': 'Synchronisierte Daten löschen',
  'settings.syncDeletingButton': 'Wird gelöscht…',
  'settings.syncDeleteHint': 'Entfernt deine Sammlung dauerhaft aus der Cloud',
  'settings.syncDeleteTitle': 'Synchronisierte Daten löschen?',
  'settings.syncDeleteBody':
    'Dadurch werden deine Pflanzen, dein Pflegeverlauf und deine Fotos dauerhaft aus der Cloud entfernt, und du wirst abgemeldet. Deine Pflanzen bleiben auf diesem Gerät — lösche die App, um auch sie zu entfernen. Das kann nicht rückgängig gemacht werden.',
  'settings.syncDeleteConfirm': 'Löschen',
  'settings.syncDeletedTitle': 'Synchronisierte Daten gelöscht',
  'settings.syncDeleteFailedTitle': 'Löschen fehlgeschlagen',
  'settings.syncDeletedBody':
    'Deine Cloud-Sammlung ist weg, und die Synchronisierung ist deaktiviert. Deine Pflanzen sind weiterhin auf diesem Gerät.',
  'settings.syncSignOutTitle': 'Abmelden?',
  'settings.syncSignOutBody':
    'Die Synchronisierung wird auf diesem Gerät pausiert. Deine Pflanzen bleiben hier und in deinem Cloud-Backup.',
  'settings.syncSignInBlurb':
    'Melde dich einmal an — deine Pflanzen, dein Pflegeverlauf und deine Fotos werden automatisch gesichert und geräteübergreifend synchronisiert.',
  'settings.syncAppleUnavailable':
    'Melde dich in den Systemeinstellungen bei einem Apple-Account an, um „Mit Apple anmelden“ zu aktivieren.',
  'settings.syncGoogleButton': 'Mit Google fortfahren',
  'settings.syncGoogleFailedTitle': 'Anmeldung mit Google fehlgeschlagen',
  'settings.syncAppleSignedInTitle': 'Angemeldet',
  'settings.syncAppleSignedInBody': 'Deine Pflanzen werden jetzt automatisch gesichert und synchronisiert.',
  'settings.syncAppleFailedTitle': 'Anmeldung mit Apple fehlgeschlagen',
  'settings.syncFailedTitle': 'Synchronisierung fehlgeschlagen',
  'settings.syncAdvancedHide': 'Erweiterte Verknüpfung ausblenden',
  'settings.syncAdvancedShow': 'Erweitert: mit Sync-Code verknüpfen',
  'settings.syncCodeHide': 'Code dieses Geräts ausblenden',
  'settings.syncCodeShow': 'Code dieses Geräts anzeigen',
  'settings.syncCodeWarning': 'Behandle ihn wie ein Passwort.',
  'settings.syncCodePlaceholder': 'Sync-Code einfügen…',
  'settings.syncLinkButton': 'Verknüpfen',
  'settings.syncInvalidCodeTitle': 'Ungültiger Code',
  'settings.syncLinkedTitle': 'Gerät verknüpft',
  'settings.syncLinkedFailedTitle': 'Verknüpft, aber Synchronisierung fehlgeschlagen',
  'settings.syncLinkedBodyOne': 'Du teilst jetzt eine Sammlung (1 Pflanze).',
  'settings.syncLinkedBodyMany': 'Du teilst jetzt eine Sammlung ({count} Pflanzen).',
  'settings.syncLinkedSyncing': 'Deine Sammlung wird synchronisiert…',

  'paywall.closeA11y': 'Schließen',

  'notFound.title': 'Hoppla!',
  'notFound.body': 'Diesen Bildschirm gibt es nicht.',
  'notFound.link': 'Zur Startseite',

  'camera.permissionTitle': 'Kamerazugriff',
  'camera.permissionBody':
    'Verdant braucht die Kamera für Pflanzenporträts und Fortschrittsfotos. Fotos bleiben auf deinem Gerät.',
  'camera.permissionAllow': 'Kamera erlauben',
  'camera.permissionDismiss': 'Nicht jetzt',
  'camera.closeA11y': 'Kamera schließen',
  'camera.titleLive': 'Gewächshaus-Kamera',
  'camera.titleReview': 'Porträt prüfen',
  'camera.flashA11y': 'Blitz: {mode}',
  'camera.tip':
    'Fülle den Rahmen mit einem Blatt oder der ganzen Pflanze · helles, gleichmäßiges Licht wirkt am besten',
  'camera.retake': 'Erneut',
  'camera.retakeA11y': 'Foto wiederholen',
  'camera.usePhoto': 'Foto verwenden',
  'camera.usePhotoA11y': 'Dieses Foto verwenden',
  'camera.flip': 'Wechseln',
  'camera.flipA11y': 'Kamera wechseln',
  'camera.captureA11y': 'Foto aufnehmen',
  'camera.back': 'Zurück',
};

export const translations: Record<LanguageCode, Messages> = { en, es, fr, de };
