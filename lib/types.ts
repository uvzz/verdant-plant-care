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

export const LIGHT_LABELS: Record<LightLevel, string> = {
  low: 'Low light',
  medium: 'Medium',
  bright: 'Bright indirect',
  direct: 'Direct sun',
};

export const POT_LABELS: Record<PotSize, string> = {
  small: 'Small pot',
  medium: 'Medium pot',
  large: 'Large pot',
};

export const PET_LABELS: Record<PetToxicity, string> = {
  unknown: 'Pets: unknown',
  safe: 'Pet-safe',
  caution: 'Pets: caution',
  toxic: 'Toxic to pets',
};

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

export const CARE_TYPE_LABELS: Record<CareLogType, string> = {
  water: 'Watered',
  fertilize: 'Fertilized',
  note: 'Note',
  photo: 'Photo',
  check: 'Soil check',
};

const VALID_CARE_TYPES: CareLogType[] = [
  'water',
  'fertilize',
  'note',
  'photo',
  'check',
];

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
  return {
    id,
    name: (raw.name || 'Plant').toString().slice(0, 120),
    species: (raw.species ?? '').toString().slice(0, 160),
    category,
    photoUri: raw.photoUri ?? null,
    acquiredDate: acquired,
    location: (raw.location ?? '').toString().slice(0, 120),
    waterIntervalDays: Math.min(365, Math.max(1, Number(raw.waterIntervalDays) || 7)),
    fertilizeIntervalDays: Math.min(
      365,
      Math.max(1, Number(raw.fertilizeIntervalDays) || 30)
    ),
    notes: (raw.notes ?? '').toString().slice(0, 4000),
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
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
  const type = VALID_CARE_TYPES.includes(raw.type as CareLogType)
    ? (raw.type as CareLogType)
    : 'note';
  const now = new Date().toISOString();
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `log-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    plantId,
    type,
    note: (raw.note ?? '').toString().slice(0, 2000),
    photoUri: raw.photoUri ?? null,
    createdAt:
      typeof raw.createdAt === 'string' && raw.createdAt
        ? raw.createdAt
        : now,
  };
}
