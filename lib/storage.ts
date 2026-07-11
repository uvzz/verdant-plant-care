import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, CareLog, Plant } from './types';
import { FREE_AI_USES_PER_MONTH } from './types';

const KEYS = {
  plants: '@verdant/plants',
  logs: '@verdant/care_logs',
  settings: '@verdant/settings',
} as const;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const DEFAULT_SETTINGS: AppSettings = {
  isPremium: false,
  notificationsEnabled: true,
  aiFreeUsesRemaining: FREE_AI_USES_PER_MONTH,
  aiQuotaMonth: currentMonth(),
};

export function normalizeSettings(raw: Partial<AppSettings> | null): AppSettings {
  const base = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  const month = currentMonth();
  if (base.aiQuotaMonth !== month) {
    base.aiQuotaMonth = month;
    base.aiFreeUsesRemaining = FREE_AI_USES_PER_MONTH;
  }
  if (typeof base.aiFreeUsesRemaining !== 'number') {
    base.aiFreeUsesRemaining = FREE_AI_USES_PER_MONTH;
  }
  return base;
}

export async function loadPlants(): Promise<Plant[]> {
  const raw = await AsyncStorage.getItem(KEYS.plants);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Plant[];
  } catch {
    return [];
  }
}

export async function savePlants(plants: Plant[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.plants, JSON.stringify(plants));
}

export async function loadCareLogs(): Promise<CareLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.logs);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CareLog[];
  } catch {
    return [];
  }
}

export async function saveCareLogs(logs: CareLog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
