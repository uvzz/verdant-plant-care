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

export const CARE_TYPE_EMOJI: Record<CareLogType, string> = {
  water: '💧',
  fertilize: '🌿',
  note: '📝',
  photo: '📷',
  check: '🖐️',
};

/** Normalize older plant records missing new fields */
export function normalizePlant(raw: Partial<Plant> & Pick<Plant, 'id' | 'name'>): Plant {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    name: raw.name || 'Plant',
    species: raw.species ?? '',
    category: raw.category ?? 'Other',
    photoUri: raw.photoUri ?? null,
    acquiredDate: raw.acquiredDate ?? now.slice(0, 10),
    location: raw.location ?? '',
    waterIntervalDays: Math.max(1, Number(raw.waterIntervalDays) || 7),
    fertilizeIntervalDays: Math.max(1, Number(raw.fertilizeIntervalDays) || 30),
    notes: raw.notes ?? '',
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    lightLevel: raw.lightLevel ?? 'medium',
    potSize: raw.potSize ?? 'medium',
    petToxicity: raw.petToxicity ?? 'unknown',
    checkBeforeWater: raw.checkBeforeWater !== false,
    caretakerId: raw.caretakerId ?? null,
    aiGuide: raw.aiGuide ?? null,
    aiCoachHistory: raw.aiCoachHistory ?? [],
    aiIdentityConfidence: raw.aiIdentityConfidence ?? null,
  };
}
