import { isValid, parseISO } from 'date-fns';
export type PlantCategory =
  | 'Houseplant'
  | 'Orchid'
  | 'Succulent'
  | 'Cactus'
  | 'Fern'
  | 'Herb'
  | 'Other';

/** Ambient light where the plant lives — adjusts effective water interval. */
export type LightLevel = 'low' | 'medium' | 'bright' | 'direct';

/** Pot size — smaller pots dry faster. */
export type PotSize = 'small' | 'medium' | 'large';

/** Pet safety flag (owner- or AI-set; educational only). */
export type PetToxicity = 'unknown' | 'safe' | 'toxic' | 'caution';

/**
 * Care log types.
 * `check` = soil moisture check / "still moist" snooze (does not count as watering).
 */
export type CareLogType = 'water' | 'fertilize' | 'note' | 'photo' | 'check';

export type AiUrgency = 'none' | 'watch' | 'soon' | 'urgent';

export interface StoredCareGuide {
  title: string;
  light: string;
  water: string;
  humidity: string;
  soil: string;
  tips: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface StoredCoachEntry {
  id: string;
  question: string;
  assessment: string;
  recommendations: string[];
  urgency: AiUrgency;
  disclaimer: string;
  createdAt: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  category: PlantCategory;
  photoUri: string | null;
  acquiredDate: string; // ISO date YYYY-MM-DD
  /** Room / zone e.g. "Living room · east" */
  location: string;
  waterIntervalDays: number;
  fertilizeIntervalDays: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  /** Light at the plant's spot */
  lightLevel?: LightLevel;
  potSize?: PotSize;
  petToxicity?: PetToxicity;
  /**
   * When true (default), calendar emphasizes check-soil before watering.
   * Competitors fail here by treating schedules as orders.
   */
  checkBeforeWater?: boolean;
  /** Optional household caretaker (family sharing) */
  caretakerId?: string | null;
  /** Cached AI care guide */
  aiGuide?: StoredCareGuide | null;
  /** Recent AI coach Q&A (newest first, max ~10) */
  aiCoachHistory?: StoredCoachEntry[];
  /** Last AI identification confidence if any */
  aiIdentityConfidence?: 'high' | 'medium' | 'low' | null;
}

export interface CareLog {
  id: string;
  plantId: string;
  type: CareLogType;
  note: string;
  photoUri: string | null;
  createdAt: string;
}

export type PremiumSource = 'none' | 'demo' | 'store' | 'restore' | 'family';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
  createdAt: string;
}

export interface AppSettings {
  isPremium: boolean;
  notificationsEnabled: boolean;
  /** Free-tier AI calls remaining this calendar month (legacy; AI is Premium-only) */
  aiFreeUsesRemaining: number;
  /** YYYY-MM of last AI free-quota reset */
  aiQuotaMonth: string;
  /** How Premium was unlocked */
  premiumSource?: PremiumSource;
  /** Store product id if purchased */
  premiumProductId?: string | null;
  /** Local household name for family sharing */
  householdName?: string;
  /** Family members who share this glasshouse */
  familyMembers?: FamilyMember[];
  /** Cloud sync opt-in (Premium) */
  syncEnabled?: boolean;
  /** Last successful cloud sync (ISO) */
  lastSyncAt?: string | null;
}

export const FREE_AI_USES_PER_MONTH = 5;
export const MAX_COACH_HISTORY = 10;

/** Days to push water due after a "still moist" soil check */
export const MOISTURE_SNOOZE_DAYS = 2;

export interface CareDueItem {
  plant: Plant;
  type: 'water' | 'fertilize';
  dueDate: Date;
  daysUntil: number;
  overdue: boolean;
  /** Effective interval used (after light/pot adjustments) */
  effectiveIntervalDays: number;
}

export const PLANT_CATEGORIES: PlantCategory[] = [
  'Houseplant',
  'Orchid',
  'Succulent',
  'Cactus',
  'Fern',
  'Herb',
  'Other',
];

export const LIGHT_LEVELS: LightLevel[] = ['low', 'medium', 'bright', 'direct'];
export const POT_SIZES: PotSize[] = ['small', 'medium', 'large'];
export const PET_TOXICITY: PetToxicity[] = ['unknown', 'safe', 'caution', 'toxic'];

// LIGHT_LABELS / POT_LABELS / PET_LABELS / CARE_TYPE_LABELS (English display
// maps) used to live here. Every caller was a UI component, so they were
// removed in favour of `t('domain.light.*' | 'domain.pot.*' | 'domain.pet.*'
// | 'domain.careType.*')` — one source of truth in `lib/i18n/translations.ts`.
// The enum values below stay untranslated: they are the persisted/synced
// wire format (Constraint 2), only ever used as lookup keys.

export const DEFAULT_INTERVALS: Record<
  PlantCategory,
  { water: number; fertilize: number }
> = {
  Houseplant: { water: 7, fertilize: 30 },
  Orchid: { water: 7, fertilize: 21 },
  Succulent: { water: 14, fertilize: 60 },
  Cactus: { water: 21, fertilize: 90 },
  Fern: { water: 4, fertilize: 30 },
  Herb: { water: 3, fertilize: 21 },
  Other: { water: 7, fertilize: 30 },
};

// CARE_TYPE_LABELS (English display map) used to live here — removed with
// LIGHT_LABELS/POT_LABELS/PET_LABELS above; use `t('domain.careType.*')`.

export const CARE_LOG_TYPES: CareLogType[] = [
  'water',
  'fertilize',
  'note',
  'photo',
  'check',
];

/**
 * True when a string is a date the REST OF THE APP can actually read.
 *
 * Must use the same parser the consumers use (`parseISO`, via
 * care.ts safeParseDate) — validating with `Date.parse` accepted things
 * parseISO rejects ("3/1/2026", "March 1, 2026", "0"), so corrupt values
 * passed the gate, then failed at read time and silently fell back to
 * "today" — which made a plant permanently not-due.
 */
function isPlausibleIsoDate(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return isValid(parseISO(value));
}

/** Epoch — an unknown edit time must LOSE last-write-wins, never win it. */
const UNKNOWN_TIME = new Date(0).toISOString();

/** Normalize older plant records missing new fields */
export function normalizePlant(
  raw: Partial<Plant> & { id?: string; name?: string }
): Plant {
  const now = new Date().toISOString();
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `plant-${now.slice(0, 10)}-${Math.random().toString(36).slice(2, 8)}`;
  const acquired =
    typeof raw.acquiredDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw.acquiredDate)
      ? raw.acquiredDate.slice(0, 10)
      : now.slice(0, 10);
  const category = PLANT_CATEGORIES.includes(raw.category as PlantCategory)
    ? (raw.category as PlantCategory)
    : 'Other';
  const rawCreatedValid =
    typeof raw.createdAt === 'string' && isPlausibleIsoDate(raw.createdAt);
  const createdAt = rawCreatedValid ? (raw.createdAt as string) : now;
  // A missing/corrupt updatedAt must not be stamped `now`: loadPlants()
  // re-normalizes on EVERY load (and every sync's buildLocalDoc), so `now`
  // made the broken record beat every real remote edit, forever — silently
  // destroying another device's changes. Fall back to a genuine creation
  // time, else epoch, so last-write-wins resolves against it.
  const updatedAt =
    typeof raw.updatedAt === 'string' && isPlausibleIsoDate(raw.updatedAt)
      ? raw.updatedAt
      : rawCreatedValid
        ? (raw.createdAt as string)
        : UNKNOWN_TIME;
  return {
    id,
    name: (raw.name || 'Plant').toString().slice(0, 120),
    species: (raw.species ?? '').toString().slice(0, 160),
    category,
    photoUri: typeof raw.photoUri === 'string' ? raw.photoUri : null,
    acquiredDate: acquired,
    location: (raw.location ?? '').toString().slice(0, 120),
    waterIntervalDays: Math.min(365, Math.max(1, Number(raw.waterIntervalDays) || 7)),
    fertilizeIntervalDays: Math.min(
      365,
      Math.max(1, Number(raw.fertilizeIntervalDays) || 30)
    ),
    notes: (raw.notes ?? '').toString().slice(0, 4000),
    createdAt,
    updatedAt,
    lightLevel: raw.lightLevel ?? 'medium',
    potSize: raw.potSize ?? 'medium',
    petToxicity: raw.petToxicity ?? 'unknown',
    checkBeforeWater: raw.checkBeforeWater !== false,
    caretakerId: raw.caretakerId ?? null,
    aiGuide: raw.aiGuide ?? null,
    aiCoachHistory: Array.isArray(raw.aiCoachHistory)
      ? raw.aiCoachHistory.slice(0, MAX_COACH_HISTORY)
      : [],
    aiIdentityConfidence: raw.aiIdentityConfidence ?? null,
  };
}

/** Drop/normalize corrupt care logs from backups */
export function normalizeCareLog(
  raw: Partial<CareLog> & { id?: string }
): CareLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const plantId = typeof raw.plantId === 'string' ? raw.plantId.trim() : '';
  if (!plantId) return null;
  const type = CARE_LOG_TYPES.includes(raw.type as CareLogType)
    ? (raw.type as CareLogType)
    : 'note';
  const now = new Date().toISOString();
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `log-${Math.random().toString(36).slice(2, 10)}`;
  // Care logs drive scheduling: lastCareOfType picks the newest by createdAt.
  // Stamping a corrupt date `now` would make the broken log the "most recent
  // water/check" and silently reset the plant's due date every load. Epoch
  // keeps the entry visible in history without letting it hijack the schedule.
  const createdAt =
    typeof raw.createdAt === 'string' && isPlausibleIsoDate(raw.createdAt)
      ? raw.createdAt
      : UNKNOWN_TIME;
  return {
    id,
    plantId,
    type,
    note: (raw.note ?? '').toString().slice(0, 2000),
    photoUri: typeof raw.photoUri === 'string' ? raw.photoUri : null,
    createdAt,
  };
}
