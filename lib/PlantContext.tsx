import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { createFamilyMember, mergeFamilyBackup } from './family';
import { parseBackupJson, type VerdantBackup } from './export';
import { peekLocalAiQuota } from './aiSafety';

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
  /** Soft daily remaining when Premium; 0 on free */
  const [aiUsesLeft, setAiUsesLeft] = useState<number | 'unlimited'>(0);

  // Refs keep latest collections for concurrent-safe mutations (no lost updates)
  const plantsRef = useRef(plants);
  const logsRef = useRef(logs);
  const settingsRef = useRef(settings);
  plantsRef.current = plants;
  logsRef.current = logs;
  settingsRef.current = settings;

  const refresh = useCallback(async () => {
    const [p, l, s] = await Promise.all([
      loadPlants(),
      loadCareLogs(),
      loadSettings(),
    ]);
    plantsRef.current = p;
    logsRef.current = l;
    settingsRef.current = s;
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!settings.isPremium) {
        if (!cancelled) setAiUsesLeft(0);
        return;
      }
      const peek = await peekLocalAiQuota(true);
      if (!cancelled) setAiUsesLeft(peek.remainingDay);
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.isPremium, plants.length, logs.length]);

  const familyMembers = settings.familyMembers ?? [];

  const addPlant = useCallback(
    async (input: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      const prev = plantsRef.current;
      const isPremium = settingsRef.current.isPremium;
      if (!isPremium && prev.length >= FREE_PLANT_LIMIT) {
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
      const next = [plant, ...plantsRef.current];
      plantsRef.current = next;
      setPlants(next);
      await savePlants(next);
      return { ok: true as const, plant };
    },
    []
  );

  const updatePlant = useCallback(async (id: string, patch: Partial<Plant>) => {
    let nextPatch = { ...patch };
    if (patch.photoUri !== undefined) {
      nextPatch.photoUri = await persistPhoto(patch.photoUri);
    }
    const next = plantsRef.current.map((p) =>
      p.id === id
        ? { ...p, ...nextPatch, id: p.id, updatedAt: new Date().toISOString() }
        : p
    );
    plantsRef.current = next;
    setPlants(next);
    await savePlants(next);
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    const nextPlants = plantsRef.current.filter((p) => p.id !== id);
    const nextLogs = logsRef.current.filter((l) => l.plantId !== id);
    plantsRef.current = nextPlants;
    logsRef.current = nextLogs;
    setPlants(nextPlants);
    setLogs(nextLogs);
    await Promise.all([savePlants(nextPlants), saveCareLogs(nextLogs)]);
  }, []);

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
      const nextLogs = [entry, ...logsRef.current];
      logsRef.current = nextLogs;
      setLogs(nextLogs);
      await saveCareLogs(nextLogs);

      const nextPlants = plantsRef.current.map((p) =>
        p.id === input.plantId
          ? { ...p, updatedAt: new Date().toISOString() }
          : p
      );
      plantsRef.current = nextPlants;
      setPlants(nextPlants);
      await savePlants(nextPlants);
      return entry;
    },
    []
  );

  const deleteCareLog = useCallback(async (id: string) => {
    const next = logsRef.current.filter((l) => l.id !== id);
    logsRef.current = next;
    setLogs(next);
    await saveCareLogs(next);
  }, []);

  const setPremium = useCallback(
    async (
      value: boolean,
      meta?: { source?: PremiumSource; productId?: string | null }
    ) => {
      const next: AppSettings = {
        ...settingsRef.current,
        isPremium: value,
        premiumSource: value ? meta?.source ?? 'demo' : 'none',
        premiumProductId: value ? meta?.productId ?? null : null,
      };
      settingsRef.current = next;
      setSettings(next);
      await saveSettings(next);
    },
    []
  );

  const setNotificationsEnabled = useCallback(async (value: boolean) => {
    const next = { ...settingsRef.current, notificationsEnabled: value };
    settingsRef.current = next;
    setSettings(next);
    await saveSettings(next);
  }, []);

  const setHouseholdName = useCallback(async (name: string) => {
    const next = { ...settingsRef.current, householdName: name.trim() };
    settingsRef.current = next;
    setSettings(next);
    await saveSettings(next);
  }, []);

  const addFamilyMember = useCallback(async (name: string) => {
    const member = createFamilyMember(name, 'member');
    const members = [...(settingsRef.current.familyMembers ?? []), member];
    const next = { ...settingsRef.current, familyMembers: members };
    settingsRef.current = next;
    setSettings(next);
    await saveSettings(next);
    return member;
  }, []);

  const removeFamilyMember = useCallback(async (id: string) => {
    const members = (settingsRef.current.familyMembers ?? []).filter(
      (m) => m.id !== id
    );
    const nextPlants = plantsRef.current.map((p) =>
      p.caretakerId === id ? { ...p, caretakerId: null } : p
    );
    const next = { ...settingsRef.current, familyMembers: members };
    settingsRef.current = next;
    plantsRef.current = nextPlants;
    setSettings(next);
    setPlants(nextPlants);
    await Promise.all([saveSettings(next), savePlants(nextPlants)]);
  }, []);

  const importBackup = useCallback(
    async (raw: string, mode: 'merge' | 'replace') => {
      const parsed = parseBackupJson(raw);
      if (!parsed.ok) return parsed;

      const backup: VerdantBackup = parsed.backup;
      // Already normalized in parseBackupJson
      const incomingPlants = backup.plants;
      const incomingLogs = backup.logs;

      if (mode === 'replace') {
        plantsRef.current = incomingPlants;
        logsRef.current = incomingLogs;
        setPlants(incomingPlants);
        setLogs(incomingLogs);
        await Promise.all([
          savePlants(incomingPlants),
          saveCareLogs(incomingLogs),
        ]);
        if (backup.familyMembers?.length) {
          const next = {
            ...settingsRef.current,
            familyMembers: backup.familyMembers,
            householdName:
              backup.householdName || settingsRef.current.householdName,
          };
          settingsRef.current = next;
          setSettings(next);
          await saveSettings(next);
        }
        return {
          ok: true as const,
          message: `Replaced collection with ${incomingPlants.length} plants and ${incomingLogs.length} logs.`,
        };
      }

      const merged = mergeFamilyBackup({
        existingPlants: plantsRef.current,
        existingLogs: logsRef.current,
        incomingPlants,
        incomingLogs,
      });
      plantsRef.current = merged.plants;
      logsRef.current = merged.logs;
      setPlants(merged.plants);
      setLogs(merged.logs);
      await Promise.all([
        savePlants(merged.plants),
        saveCareLogs(merged.logs),
      ]);

      if (backup.familyMembers?.length) {
        const existingIds = new Set(
          (settingsRef.current.familyMembers ?? []).map((m) => m.id)
        );
        const extra = backup.familyMembers.filter((m) => !existingIds.has(m.id));
        if (extra.length) {
          const next = {
            ...settingsRef.current,
            familyMembers: [
              ...(settingsRef.current.familyMembers ?? []),
              ...extra,
            ],
            householdName:
              settingsRef.current.householdName ||
              backup.householdName ||
              '',
          };
          settingsRef.current = next;
          setSettings(next);
          await saveSettings(next);
        }
      }

      return {
        ok: true as const,
        message: `Merged ${merged.addedPlants} plants and ${merged.addedLogs} care logs.`,
      };
    },
    []
  );

  const consumeAiUse = useCallback(async () => {
    // Preflight only — actual local charge happens in openrouter.chat
    // so failed network calls do not burn quota.
    if (!settings.isPremium) {
      return {
        ok: false as const,
        reason: 'AI assist is a Premium feature.',
      };
    }
    const peek = await peekLocalAiQuota(true);
    if (peek.blockedReason) {
      return { ok: false as const, reason: peek.blockedReason };
    }
    setAiUsesLeft(peek.remainingDay);
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
