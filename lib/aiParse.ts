import type { LightLevel, PetToxicity, PlantCategory } from './types';
import { LIGHT_LEVELS, PET_TOXICITY, PLANT_CATEGORIES } from './types';

export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}

/** Placeholder answers models give when they can't actually name the plant. */
const NAME_JUNK_RE =
  /^(unknown|unidentified|unrecognized|uncertain|not\s+sure|no\s+idea|n\/?a|none|null|undefined|error|plant|houseplant)(\s+(plant|species|variety))?[\s.!?…]*$/i;

/**
 * Validate an AI-suggested common name. Truncated fragments ("As"),
 * placeholders ("Unknown plant"), and symbol-only strings fall back instead
 * of becoming the plant's name. Conservative on purpose — the user can still
 * hand-type any name the guard rejects.
 */
export function normalizeCommonName(
  raw: string | undefined | null,
  fallback = 'Mystery plant'
): string {
  const cleaned = (raw || '')
    .replace(/^["'`\s]+|["'`\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Non-ASCII scripts (CJK etc.) pack a full word into 2 chars; ASCII 2-char
  // strings are usually truncation artifacts like "As".
  const minLen = /[^\x00-\x7F]/.test(cleaned) ? 2 : 3;
  if (cleaned.length < minLen) return fallback;
  if (!/\p{L}/u.test(cleaned)) return fallback;
  if (NAME_JUNK_RE.test(cleaned)) return fallback;
  return cleaned.slice(0, 80);
}

/**
 * Merge an AI care summary into user notes, replacing any previous
 * "AI: …" block so repeated identifies don't stack duplicates.
 */
export function mergeAiNote(notes: string, careSummary: string): string {
  const own = (notes || '').replace(/(^|\n\n)AI: [\s\S]*$/, '').trim();
  return own ? `${own}\n\nAI: ${careSummary}` : `AI: ${careSummary}`;
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
