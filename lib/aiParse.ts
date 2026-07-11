import type { LightLevel, PetToxicity, PlantCategory } from './types';
import { LIGHT_LEVELS, PET_TOXICITY, PLANT_CATEGORIES } from './types';

export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}

export function normalizeCategory(raw: string): PlantCategory {
  const hit = PLANT_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase().trim()
  );
  if (hit) return hit;
  const map: Record<string, PlantCategory> = {
    houseplant: 'Houseplant',
    orchid: 'Orchid',
    succulent: 'Succulent',
    cactus: 'Cactus',
    fern: 'Fern',
    herb: 'Herb',
    aroid: 'Houseplant',
    tropical: 'Houseplant',
  };
  return map[raw.toLowerCase().trim()] ?? 'Other';
}

export function normalizeLight(raw: string | undefined): LightLevel {
  const v = (raw || '').toLowerCase().trim();
  if ((LIGHT_LEVELS as string[]).includes(v)) return v as LightLevel;
  if (v.includes('direct') || v.includes('full sun')) return 'direct';
  if (v.includes('bright')) return 'bright';
  if (v.includes('low') || v.includes('shade')) return 'low';
  return 'medium';
}

export function normalizePetToxicity(raw: string | undefined): PetToxicity {
  const v = (raw || '').toLowerCase().trim();
  if ((PET_TOXICITY as string[]).includes(v)) return v as PetToxicity;
  if (v.includes('toxic') || v.includes('poison')) return 'toxic';
  if (v.includes('safe') || v.includes('non-toxic') || v.includes('nontoxic'))
    return 'safe';
  if (v.includes('caution') || v.includes('mild')) return 'caution';
  return 'unknown';
}
