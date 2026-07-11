export type PlantCategory =
  | 'Houseplant'
  | 'Orchid'
  | 'Succulent'
  | 'Cactus'
  | 'Fern'
  | 'Herb'
  | 'Other';

export type CareLogType = 'water' | 'fertilize' | 'note' | 'photo';

export interface Plant {
  id: string;
  name: string;
  species: string;
  category: PlantCategory;
  photoUri: string | null;
  acquiredDate: string; // ISO date YYYY-MM-DD
  location: string;
  waterIntervalDays: number;
  fertilizeIntervalDays: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareLog {
  id: string;
  plantId: string;
  type: CareLogType;
  note: string;
  photoUri: string | null;
  createdAt: string;
}

export interface AppSettings {
  isPremium: boolean;
  notificationsEnabled: boolean;
}

export interface CareDueItem {
  plant: Plant;
  type: 'water' | 'fertilize';
  dueDate: Date;
  daysUntil: number;
  overdue: boolean;
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
};

export const CARE_TYPE_EMOJI: Record<CareLogType, string> = {
  water: '💧',
  fertilize: '🌿',
  note: '📝',
  photo: '📷',
};
