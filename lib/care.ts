import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import type { CareDueItem, CareLog, Plant } from './types';

export function lastCareOfType(
  logs: CareLog[],
  plantId: string,
  type: 'water' | 'fertilize'
): CareLog | undefined {
  return logs
    .filter((l) => l.plantId === plantId && l.type === type)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function nextDueDate(
  plant: Plant,
  logs: CareLog[],
  type: 'water' | 'fertilize'
): Date {
  const last = lastCareOfType(logs, plant.id, type);
  const interval =
    type === 'water' ? plant.waterIntervalDays : plant.fertilizeIntervalDays;
  const base = last ? parseISO(last.createdAt) : parseISO(plant.acquiredDate);
  return startOfDay(addDays(base, interval));
}

export function getCareDueItems(plants: Plant[], logs: CareLog[]): CareDueItem[] {
  const today = startOfDay(new Date());
  const items: CareDueItem[] = [];

  for (const plant of plants) {
    for (const type of ['water', 'fertilize'] as const) {
      const dueDate = nextDueDate(plant, logs, type);
      const daysUntil = differenceInCalendarDays(dueDate, today);
      items.push({
        plant,
        type,
        dueDate,
        daysUntil,
        overdue: daysUntil < 0,
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
