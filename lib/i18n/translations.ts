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

  // Plants — home screen ("My Plants")
  'plants.title': 'Mes plantes',
  'plants.searchPlaceholder': 'Rechercher nom, espèce, pièce…',
  'plants.categoryAll': 'Toutes',
  'plants.roomAll': 'Toutes les pièces',
  'plants.subtitleFreeOne': '1 plante · Gratuit, jusqu’à {limit}',
  'plants.subtitleFreeMany': '{count} plantes · Gratuit, jusqu’à {limit}',
  'plants.subtitlePremiumOne': '1 plante · Premium',
  'plants.subtitlePremiumMany': '{count} plantes · Premium',
  'plants.subtitleFreeFilteredOne':
    '1 plante · Gratuit, jusqu’à {limit} · affichage de {shown}',
  'plants.subtitleFreeFilteredMany':
    '{count} plantes · Gratuit, jusqu’à {limit} · affichage de {shown}',
  'plants.subtitlePremiumFilteredOne': '1 plante · Premium · affichage de {shown}',
  'plants.subtitlePremiumFilteredMany':
    '{count} plantes · Premium · affichage de {shown}',
  'plants.emptyTitle': 'Votre serre est calme',
  'plants.emptyBody':
    'Ajoutez une plante avec une photo. Utilisez l’identification IA pour renseigner l’espèce et les intervalles de soins — puis définissez la pièce, la lumière et le pot pour des calendriers intelligents.',
  'plants.addFirstPlant': 'Ajoutez votre première plante',
  'plants.noMatchesTitle': 'Aucun résultat',
  'plants.noMatchesBody': 'Essayez une autre recherche, catégorie ou pièce.',
  'plants.clearFilters': 'Effacer les filtres',
  'plants.addPlant': 'Ajouter une plante',
  'plants.upgradeTitle': 'Vous avez rempli vos {limit} plantes gratuites',
  'plants.upgradeSubtitle':
    'Passez à Premium pour des plantes illimitées, l’IA et la synchro cloud →',
  'plants.upgradeA11y': 'Passer à Premium pour des plantes illimitées',
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

  // Plants — home screen ("My Plants")
  'plants.title': 'Meine Pflanzen',
  'plants.searchPlaceholder': 'Name, Art, Raum suchen…',
  'plants.categoryAll': 'Alle',
  'plants.roomAll': 'Alle Räume',
  'plants.subtitleFreeOne': '1 Pflanze · Kostenlos, bis zu {limit}',
  'plants.subtitleFreeMany': '{count} Pflanzen · Kostenlos, bis zu {limit}',
  'plants.subtitlePremiumOne': '1 Pflanze · Premium',
  'plants.subtitlePremiumMany': '{count} Pflanzen · Premium',
  'plants.subtitleFreeFilteredOne':
    '1 Pflanze · Kostenlos, bis zu {limit} · {shown} angezeigt',
  'plants.subtitleFreeFilteredMany':
    '{count} Pflanzen · Kostenlos, bis zu {limit} · {shown} angezeigt',
  'plants.subtitlePremiumFilteredOne': '1 Pflanze · Premium · {shown} angezeigt',
  'plants.subtitlePremiumFilteredMany':
    '{count} Pflanzen · Premium · {shown} angezeigt',
  'plants.emptyTitle': 'Dein Gewächshaus ist still',
  'plants.emptyBody':
    'Füge eine Pflanze mit einem Foto hinzu. Nutze die KI-Bestimmung, um Art und Pflegeintervalle auszufüllen — dann lege Raum, Licht und Topf fest, damit die Zeitpläne mitdenken.',
  'plants.addFirstPlant': 'Füge deine erste Pflanze hinzu',
  'plants.noMatchesTitle': 'Keine Treffer',
  'plants.noMatchesBody':
    'Versuche eine andere Suche, Kategorie oder einen anderen Raumfilter.',
  'plants.clearFilters': 'Filter zurücksetzen',
  'plants.addPlant': 'Pflanze hinzufügen',
  'plants.upgradeTitle': 'Du hast deine {limit} kostenlosen Pflanzen gefüllt',
  'plants.upgradeSubtitle':
    'Hol dir Premium für unbegrenzte Pflanzen, KI und Cloud-Sync →',
  'plants.upgradeA11y': 'Auf Premium upgraden für unbegrenzte Pflanzen',
};

export const translations: Record<LanguageCode, Messages> = { en, es, fr, de };
