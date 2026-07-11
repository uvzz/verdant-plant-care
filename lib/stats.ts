import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';
import type { CareLog, CareLogType, Plant } from './types';
import { getCareDueItems } from './care';

export type CollectionStats = {
  plantCount: number;
  totalLogs: number;
  waters: number;
  fertilizes: number;
  notes: number;
  photos: number;
  overdueCount: number;
  dueTodayCount: number;
  logsLast7Days: number;
  logsLast30Days: number;
  mostActivePlant: { name: string; count: number } | null;
  categoryBreakdown: { category: string; count: number }[];
  careStreakDays: number;
  byDayLast14: { date: string; count: number }[];
};

function countType(logs: CareLog[], type: CareLogType): number {
  return logs.filter((l) => l.type === type).length;
}

/** Consecutive days (ending today or yesterday) with at least one care log */
function logDayKey(createdAt: string): string | null {
  try {
    const d = parseISO(createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

export function computeCareStreak(logs: CareLog[]): number {
  if (logs.length === 0) return 0;
  const daysWithCare = new Set(
    logs.map((l) => logDayKey(l.createdAt)).filter((d): d is string => !!d)
  );
  let streak = 0;
  let cursor = startOfDay(new Date());
  // Allow streak to start from yesterday if nothing today yet
  if (!daysWithCare.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
  }
  while (daysWithCare.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function computeCollectionStats(
  plants: Plant[],
  logs: CareLog[]
): CollectionStats {
  const due = getCareDueItems(plants, logs);
  const now = new Date();
  const d7 = subDays(now, 7);
  const d30 = subDays(now, 30);

  const byPlant = new Map<string, number>();
  for (const l of logs) {
    byPlant.set(l.plantId, (byPlant.get(l.plantId) || 0) + 1);
  }
  let mostActivePlant: CollectionStats['mostActivePlant'] = null;
  let max = 0;
  for (const [pid, count] of byPlant) {
    if (count > max) {
      max = count;
      const p = plants.find((x) => x.id === pid);
      mostActivePlant = { name: p?.name ?? 'Unknown', count };
    }
  }

  const catMap = new Map<string, number>();
  for (const p of plants) {
    catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
  }
  const categoryBreakdown = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const byDayLast14: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = format(subDays(now, i), 'yyyy-MM-dd');
    const count = logs.filter((l) => logDayKey(l.createdAt) === d).length;
    byDayLast14.push({ date: d, count });
  }

  const validLogTime = (createdAt: string): Date | null => {
    try {
      const t = parseISO(createdAt);
      return Number.isNaN(t.getTime()) ? null : t;
    } catch {
      return null;
    }
  };

  return {
    plantCount: plants.length,
    totalLogs: logs.length,
    waters: countType(logs, 'water'),
    fertilizes: countType(logs, 'fertilize'),
    notes: countType(logs, 'note'),
    photos: countType(logs, 'photo'),
    overdueCount: due.filter((d) => d.overdue && !Number.isNaN(d.daysUntil)).length,
    dueTodayCount: due.filter((d) => d.daysUntil === 0).length,
    logsLast7Days: logs.filter((l) => {
      const t = validLogTime(l.createdAt);
      return t ? t >= d7 : false;
    }).length,
    logsLast30Days: logs.filter((l) => {
      const t = validLogTime(l.createdAt);
      return t ? t >= d30 : false;
    }).length,
    mostActivePlant,
    categoryBreakdown,
    careStreakDays: computeCareStreak(logs),
    byDayLast14,
  };
}

export function plantAgeDays(plant: Plant): number {
  try {
    return Math.max(
      0,
      differenceInCalendarDays(new Date(), parseISO(plant.acquiredDate))
    );
  } catch {
    return 0;
  }
}
