import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FREE_PLANT_LIMIT } from '@/constants/Colors';
import {
  createId,
  loadCareLogs,
  loadPlants,
  loadSettings,
  saveCareLogs,
  savePlants,
  saveSettings,
} from './storage';
import type { AppSettings, CareLog, CareLogType, Plant } from './types';

interface PlantContextValue {
  plants: Plant[];
  logs: CareLog[];
  settings: AppSettings;
  loading: boolean;
  canAddPlant: boolean;
  freeLimit: number;
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
  setPremium: (value: boolean) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  getPlant: (id: string) => Plant | undefined;
  refresh: () => Promise<void>;
}

const PlantContext = createContext<PlantContextValue | null>(null);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    isPremium: false,
    notificationsEnabled: true,
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
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const canAddPlant = settings.isPremium || plants.length < FREE_PLANT_LIMIT;

  const addPlant = useCallback(
    async (input: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!settings.isPremium && plants.length >= FREE_PLANT_LIMIT) {
        return {
          ok: false as const,
          reason: `Free plan includes up to ${FREE_PLANT_LIMIT} plants. Upgrade for unlimited plants.`,
        };
      }
      const now = new Date().toISOString();
      const plant: Plant = {
        ...input,
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
      const next = plants.map((p) =>
        p.id === id
          ? { ...p, ...patch, id: p.id, updatedAt: new Date().toISOString() }
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
      const entry: CareLog = {
        id: createId(),
        plantId: input.plantId,
        type: input.type,
        note: input.note ?? '',
        photoUri: input.photoUri ?? null,
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
    async (value: boolean) => {
      const next = { ...settings, isPremium: value };
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
      addPlant,
      updatePlant,
      deletePlant,
      addCareLog,
      deleteCareLog,
      setPremium,
      setNotificationsEnabled,
      getPlant,
      refresh,
    }),
    [
      plants,
      logs,
      settings,
      loading,
      canAddPlant,
      addPlant,
      updatePlant,
      deletePlant,
      addCareLog,
      deleteCareLog,
      setPremium,
      setNotificationsEnabled,
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
