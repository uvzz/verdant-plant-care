import {
  addDays,
  differenceInCalendarDays,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { CareDueItem, CareLog, LightLevel, Plant, PotSize } from './types';
import { MOISTURE_SNOOZE_DAYS } from './types';

/** Parse ISO date safely — invalid → today (avoids NaN due chains) */
export function safeParseDate(iso: string | undefined | null): Date {
  if (!iso) return startOfDay(new Date());
  try {
    const d = parseISO(iso);
    if (isValid(d)) return d;
  } catch {
    /* fall through */
  }
  // YYYY-MM-DD only
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const d = parseISO(`${iso}T12:00:00`);
    if (isValid(d)) return d;
  }
  return startOfDay(new Date());
}

export function lastCareOfType(
  logs: CareLog[],
  plantId: string,
  type: CareLog['type']
): CareLog | undefined {
  return logs
    .filter((l) => l.plantId === plantId && l.type === type)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/**
 * Competitors (esp. Planta) ignore pot size and light — growers report
 * overwatering when following schedules blindly.
 * Smaller pots + brighter light → dry faster → shorter effective interval.
 */
export function effectiveWaterIntervalDays(plant: Plant): number {
  const base = Math.max(1, plant.waterIntervalDays || 7);
  const pot = plant.potSize ?? 'medium';
  const light = plant.lightLevel ?? 'medium';

  const potMult: Record<PotSize, number> = {
    small: 0.8, // dries faster
    medium: 1,
    large: 1.25, // holds moisture longer
  };
  const lightMult: Record<LightLevel, number> = {
    low: 1.25,
    medium: 1,
    bright: 0.9,
    direct: 0.8,
  };

  return Math.max(1, Math.round(base * potMult[pot] * lightMult[light]));
}

export function effectiveFertilizeIntervalDays(plant: Plant): number {
  return Math.max(1, plant.fertilizeIntervalDays || 30);
}

/**
 * Next water due:
 * - Base: last water (or acquired) + effective interval (light/pot-aware)
 * - If a more recent soil `check` ("still moist"), snooze from that check
 */
export function nextDueDate(
  plant: Plant,
  logs: CareLog[],
  type: 'water' | 'fertilize'
): Date {
  if (type === 'fertilize') {
    const last = lastCareOfType(logs, plant.id, 'fertilize');
    const interval = effectiveFertilizeIntervalDays(plant);
    const base = last
      ? safeParseDate(last.createdAt)
      : safeParseDate(plant.acquiredDate);
    return startOfDay(addDays(base, interval));
  }

  const lastWater = lastCareOfType(logs, plant.id, 'water');
  const lastCheck = lastCareOfType(logs, plant.id, 'check');
  const interval = effectiveWaterIntervalDays(plant);
  const waterBase = lastWater
    ? safeParseDate(lastWater.createdAt)
    : safeParseDate(plant.acquiredDate);
  const fromWater = startOfDay(addDays(waterBase, interval));

  if (lastCheck) {
    const checkAt = safeParseDate(lastCheck.createdAt);
    const waterAt = lastWater ? safeParseDate(lastWater.createdAt) : null;
    if (!waterAt || checkAt > waterAt) {
      const snoozed = startOfDay(addDays(checkAt, MOISTURE_SNOOZE_DAYS));
      // A "still moist" check may only ever DELAY watering. Returning the
      // snooze unconditionally pulled a not-yet-due plant forward (due in 14d
      // → due in 2d), which pushes people to overwater — the opposite of what
      // check-before-water exists to prevent.
      return snoozed > fromWater ? snoozed : fromWater;
    }
  }

  return fromWater;
}

export function getCareDueItems(plants: Plant[], logs: CareLog[]): CareDueItem[] {
  const today = startOfDay(new Date());
  const items: CareDueItem[] = [];

  for (const plant of plants) {
    for (const type of ['water', 'fertilize'] as const) {
      const dueDate = nextDueDate(plant, logs, type);
      const daysUntil = differenceInCalendarDays(dueDate, today);
      const effectiveIntervalDays =
        type === 'water'
          ? effectiveWaterIntervalDays(plant)
          : effectiveFertilizeIntervalDays(plant);
      items.push({
        plant,
        type,
        dueDate,
        daysUntil,
        overdue: daysUntil < 0,
        effectiveIntervalDays,
      });
    }
  }

  return items.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getPlantLogs(logs: CareLog[], plantId: string): CareLog[] {
  return logs
    .filter((l) => l.plantId === plantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProgressPhotos(logs: CareLog[], plantId: string): CareLog[] {
  return getPlantLogs(logs, plantId).filter(
    (l) => l.photoUri && (l.type === 'photo' || l.type === 'note' || !!l.photoUri)
  );
}

export function formatRelativeCare(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = Math.abs(daysUntil);
    return n === 1 ? '1 day overdue' : `${n} days overdue`;
  }
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  return `In ${daysUntil} days`;
}

/** Unique non-empty locations for room filter chips */
export function listRooms(plants: Plant[]): string[] {
  const set = new Set<string>();
  for (const p of plants) {
    const loc = p.location?.trim();
    if (loc) set.add(loc);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
