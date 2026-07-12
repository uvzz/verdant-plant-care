import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, CareLog, FamilyMember, Plant } from './types';
import { FREE_AI_USES_PER_MONTH, normalizePlant } from './types';

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
  premiumSource: 'none',
  premiumProductId: null,
  householdName: '',
  familyMembers: [],
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
  // Premium with no purchase trail can only be a dev/demo unlock.
  if (!base.premiumSource || (base.isPremium && base.premiumSource === 'none')) {
    base.premiumSource = base.isPremium ? 'demo' : 'none';
  }
  // Demo Premium is a development convenience only. In release builds any
  // persisted demo entitlement (e.g. carried over from a dev install) is
  // revoked on load — store purchases/restore are the only source of truth.
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  if (!isDevBuild && base.premiumSource === 'demo') {
    base.isPremium = false;
    base.premiumSource = 'none';
    base.premiumProductId = null;
  }
  if (!Array.isArray(base.familyMembers)) {
    base.familyMembers = [];
  }
  if (typeof base.householdName !== 'string') {
    base.householdName = '';
  }
  return base;
}

export async function loadPlants(): Promise<Plant[]> {
  const raw = await AsyncStorage.getItem(KEYS.plants);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Partial<Plant>[];
    return list.map((p) =>
      normalizePlant(p as Partial<Plant> & Pick<Plant, 'id' | 'name'>)
    );
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
  if (!raw) return { ...DEFAULT_SETTINGS, familyMembers: [] };
  try {
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return { ...DEFAULT_SETTINGS, familyMembers: [] };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function replaceCollection(input: {
  plants: Plant[];
  logs: CareLog[];
}): Promise<void> {
  await Promise.all([savePlants(input.plants), saveCareLogs(input.logs)]);
}

export type { FamilyMember };
