import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FREE_PLANT_LIMIT } from '@/constants/Colors';
import { persistPhoto } from './photos';
import {
  createId,
  DEFAULT_SETTINGS,
  loadCareLogs,
  loadPlants,
  loadSettings,
  saveCareLogs,
  savePlants,
  saveSettings,
} from './storage';
import type {
  AppSettings,
  CareLog,
  CareLogType,
  FamilyMember,
  Plant,
  PremiumSource,
} from './types';
import { normalizePlant } from './types';
import { createFamilyMember, mergeFamilyBackup } from './family';
import { parseBackupJson, type VerdantBackup } from './export';

interface PlantContextValue {
  plants: Plant[];
  logs: CareLog[];
  settings: AppSettings;
  loading: boolean;
  canAddPlant: boolean;
  freeLimit: number;
  canUseAi: boolean;
  aiUsesLeft: number | 'unlimited';
  familyMembers: FamilyMember[];
  addPlant: (
    input: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ ok: true; plant: Plant } | { ok: false; reason: string }>;
  updatePlant: (id: string, patch: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  addCareLog: (input: {
    plantId: string;
    type: CareLogType;
    note?: string;
    photoUri?: string | null;
  }) => Promise<CareLog>;
  deleteCareLog: (id: string) => Promise<void>;
  setPremium: (
    value: boolean,
    meta?: { source?: PremiumSource; productId?: string | null }
  ) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setHouseholdName: (name: string) => Promise<void>;
  addFamilyMember: (name: string) => Promise<FamilyMember>;
  removeFamilyMember: (id: string) => Promise<void>;
  importBackup: (
    raw: string,
    mode: 'merge' | 'replace'
  ) => Promise<{ ok: true; message: string } | { ok: false; reason: string }>;
  /** Premium gate for AI. Returns false if not Premium. */
  consumeAiUse: () => Promise<{ ok: true } | { ok: false; reason: string }>;
  getPlant: (id: string) => Plant | undefined;
  refresh: () => Promise<void>;
}

const PlantContext = createContext<PlantContextValue | null>(null);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_SETTINGS,
    familyMembers: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [p, l, s] = await Promise.all([
      loadPlants(),
      loadCareLogs(),
      loadSettings(),
    ]);
    setPlants(p);
    setLogs(l);
    setSettings(s);
    await saveSettings(s);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const canAddPlant = settings.isPremium || plants.length < FREE_PLANT_LIMIT;
  const canUseAi = settings.isPremium;
  const aiUsesLeft: number | 'unlimited' = settings.isPremium
    ? 'unlimited'
    : 0;
  const familyMembers = settings.familyMembers ?? [];

  const addPlant = useCallback(
    async (input: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!settings.isPremium && plants.length >= FREE_PLANT_LIMIT) {
        return {
          ok: false as const,
          reason: `Free plan includes up to ${FREE_PLANT_LIMIT} plants. Upgrade for unlimited plants.`,
        };
      }
      const photoUri = await persistPhoto(input.photoUri);
      const now = new Date().toISOString();
      const plant: Plant = {
        ...input,
        photoUri,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      };
      const next = [plant, ...plants];
      setPlants(next);
      await savePlants(next);
      return { ok: true as const, plant };
    },
    [plants, settings.isPremium]
  );

  const updatePlant = useCallback(
    async (id: string, patch: Partial<Plant>) => {
      let nextPatch = { ...patch };
      if (patch.photoUri !== undefined) {
        nextPatch.photoUri = await persistPhoto(patch.photoUri);
      }
      const next = plants.map((p) =>
        p.id === id
          ? { ...p, ...nextPatch, id: p.id, updatedAt: new Date().toISOString() }
          : p
      );
      setPlants(next);
      await savePlants(next);
    },
    [plants]
  );

  const deletePlant = useCallback(
    async (id: string) => {
      const nextPlants = plants.filter((p) => p.id !== id);
      const nextLogs = logs.filter((l) => l.plantId !== id);
      setPlants(nextPlants);
      setLogs(nextLogs);
      await Promise.all([savePlants(nextPlants), saveCareLogs(nextLogs)]);
    },
    [plants, logs]
  );

  const addCareLog = useCallback(
    async (input: {
      plantId: string;
      type: CareLogType;
      note?: string;
      photoUri?: string | null;
    }) => {
      const photoUri = await persistPhoto(input.photoUri);
      const entry: CareLog = {
        id: createId(),
        plantId: input.plantId,
        type: input.type,
        note: input.note ?? '',
        photoUri,
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...logs];
      setLogs(next);
      await saveCareLogs(next);
      await updatePlant(input.plantId, {});
      return entry;
    },
    [logs, updatePlant]
  );

  const deleteCareLog = useCallback(
    async (id: string) => {
      const next = logs.filter((l) => l.id !== id);
      setLogs(next);
      await saveCareLogs(next);
    },
    [logs]
  );

  const setPremium = useCallback(
    async (
      value: boolean,
      meta?: { source?: PremiumSource; productId?: string | null }
    ) => {
      const next: AppSettings = {
        ...settings,
        isPremium: value,
        premiumSource: value ? meta?.source ?? 'demo' : 'none',
        premiumProductId: value ? meta?.productId ?? null : null,
      };
      setSettings(next);
      await saveSettings(next);
    },
    [settings]
  );

  const setNotificationsEnabled = useCallback(
    async (value: boolean) => {
      const next = { ...settings, notificationsEnabled: value };
      setSettings(next);
      await saveSettings(next);
    },
    [settings]
  );

  const setHouseholdName = useCallback(
    async (name: string) => {
      const next = { ...settings, householdName: name.trim() };
      setSettings(next);
      await saveSettings(next);
    },
    [settings]
  );

  const addFamilyMember = useCallback(
    async (name: string) => {
      const member = createFamilyMember(name, 'member');
      const members = [...(settings.familyMembers ?? []), member];
      const next = { ...settings, familyMembers: members };
      setSettings(next);
      await saveSettings(next);
      return member;
    },
    [settings]
  );

  const removeFamilyMember = useCallback(
    async (id: string) => {
      const members = (settings.familyMembers ?? []).filter((m) => m.id !== id);
      const nextPlants = plants.map((p) =>
        p.caretakerId === id ? { ...p, caretakerId: null } : p
      );
      const next = { ...settings, familyMembers: members };
      setSettings(next);
      setPlants(nextPlants);
      await Promise.all([saveSettings(next), savePlants(nextPlants)]);
    },
    [settings, plants]
  );

  const importBackup = useCallback(
    async (raw: string, mode: 'merge' | 'replace') => {
      const parsed = parseBackupJson(raw);
      if (!parsed.ok) return parsed;

      const backup: VerdantBackup = parsed.backup;
      const incomingPlants = backup.plants.map((p) =>
        normalizePlant(p as Plant)
      );
      const incomingLogs = backup.logs;

      if (mode === 'replace') {
        setPlants(incomingPlants);
        setLogs(incomingLogs);
        await Promise.all([
          savePlants(incomingPlants),
          saveCareLogs(incomingLogs),
        ]);
        if (backup.familyMembers?.length) {
          const next = {
            ...settings,
            familyMembers: backup.familyMembers,
            householdName: backup.householdName || settings.householdName,
          };
          setSettings(next);
          await saveSettings(next);
        }
        return {
          ok: true as const,
          message: `Replaced collection with ${incomingPlants.length} plants and ${incomingLogs.length} logs.`,
        };
      }

      const merged = mergeFamilyBackup({
        existingPlants: plants,
        existingLogs: logs,
        incomingPlants,
        incomingLogs,
      });
      setPlants(merged.plants);
      setLogs(merged.logs);
      await Promise.all([
        savePlants(merged.plants),
        saveCareLogs(merged.logs),
      ]);

      if (backup.familyMembers?.length) {
        const existingIds = new Set(
          (settings.familyMembers ?? []).map((m) => m.id)
        );
        const extra = backup.familyMembers.filter((m) => !existingIds.has(m.id));
        if (extra.length) {
          const next = {
            ...settings,
            familyMembers: [...(settings.familyMembers ?? []), ...extra],
            householdName:
              settings.householdName || backup.householdName || '',
          };
          setSettings(next);
          await saveSettings(next);
        }
      }

      return {
        ok: true as const,
        message: `Merged ${merged.addedPlants} plants and ${merged.addedLogs} care logs.`,
      };
    },
    [plants, logs, settings]
  );

  const consumeAiUse = useCallback(async () => {
    if (!settings.isPremium) {
      return {
        ok: false as const,
        reason:
          'AI assist is a Premium feature. Unlock Premium to use plant identify, care guides, and the coach.',
      };
    }
    return { ok: true as const };
  }, [settings.isPremium]);

  const getPlant = useCallback(
    (id: string) => plants.find((p) => p.id === id),
    [plants]
  );

  const value = useMemo(
    () => ({
      plants,
      logs,
      settings,
      loading,
      canAddPlant,
      freeLimit: FREE_PLANT_LIMIT,
      canUseAi,
      aiUsesLeft,
      familyMembers,
      addPlant,
      updatePlant,
      deletePlant,
      addCareLog,
      deleteCareLog,
      setPremium,
      setNotificationsEnabled,
      setHouseholdName,
      addFamilyMember,
      removeFamilyMember,
      importBackup,
      consumeAiUse,
      getPlant,
      refresh,
    }),
    [
      plants,
      logs,
      settings,
      loading,
      canAddPlant,
      canUseAi,
      aiUsesLeft,
      familyMembers,
      addPlant,
      updatePlant,
      deletePlant,
      addCareLog,
      deleteCareLog,
      setPremium,
      setNotificationsEnabled,
      setHouseholdName,
      addFamilyMember,
      removeFamilyMember,
      importBackup,
      consumeAiUse,
      getPlant,
      refresh,
    ]
  );

  return (
    <PlantContext.Provider value={value}>{children}</PlantContext.Provider>
  );
}

export function usePlants() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlants must be used within PlantProvider');
  return ctx;
}
