import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { FREE_PLANT_LIMIT } from '@/constants/Colors';
import { persistPhoto } from './photos';
import {
  addTombstone,
  createId,
  DEFAULT_SETTINGS,
  loadCareLogs,
  loadPlants,
  loadSettings,
  saveCareLogs,
  savePlants,
  saveSettings,
  saveTombstones,
} from './storage';
import { syncNow as runCloudSync, SYNC_BUSY_REASON, type SyncResult } from './sync';
import {
  canAutoSyncNow,
  nextBackoffMs,
  AUTO_SYNC_BASE_BACKOFF_MS,
} from './syncSchedule';
import type {
  AppSettings,
  CareLog,
  CareLogType,
  FamilyMember,
  Plant,
  PremiumSource,
} from './types';
import { createFamilyMember } from './family';
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
  /** Premium gate for AI. Returns false if not Premium. */
  consumeAiUse: () => Promise<{ ok: true } | { ok: false; reason: string }>;
  getPlant: (id: string) => Plant | undefined;
  refresh: () => Promise<void>;
  /** Cloud sync (Premium): run a full pull-merge-push pass now. */
  syncNow: () => Promise<SyncResult>;
  setSyncEnabled: (value: boolean) => Promise<void>;
  syncing: boolean;
  /** 'error' after a failed sync until the next successful one. */
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncError: string | null;
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
      scheduleAutoSync();
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
    scheduleAutoSync();
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    const nextPlants = plantsRef.current.filter((p) => p.id !== id);
    const nextLogs = logsRef.current.filter((l) => l.plantId !== id);
    plantsRef.current = nextPlants;
    logsRef.current = nextLogs;
    setPlants(nextPlants);
    setLogs(nextLogs);
    await Promise.all([
      savePlants(nextPlants),
      saveCareLogs(nextLogs),
      addTombstone('plants', id),
    ]);
    scheduleAutoSync();
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
      scheduleAutoSync();
      return entry;
    },
    []
  );

  const deleteCareLog = useCallback(async (id: string) => {
    const next = logsRef.current.filter((l) => l.id !== id);
    logsRef.current = next;
    setLogs(next);
    await Promise.all([saveCareLogs(next), addTombstone('logs', id)]);
    scheduleAutoSync();
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

  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  syncingRef.current = syncing;
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>(
    'idle'
  );
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Backoff bookkeeping for auto-sync only — a failing sync (offline, 5xx)
  // must not retry on every mutation/foreground with no cooldown. Manual
  // "Sync now" presses bypass this entirely.
  const lastFailureAtRef = useRef<number | null>(null);
  const backoffMsRef = useRef(AUTO_SYNC_BASE_BACKOFF_MS);

  // Debounced push after local mutations — sync is automatic, users never
  // think about it. Ref indirection because mutations are declared above.
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncNowRef = useRef<null | (() => Promise<SyncResult>)>(null);
  const scheduleAutoSync = useCallback(() => {
    const s = settingsRef.current;
    if (!s.isPremium || !s.syncEnabled) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      if (
        !canAutoSyncNow({
          now: Date.now(),
          inFlight: syncingRef.current,
          lastFailureAt: lastFailureAtRef.current,
          backoffMs: backoffMsRef.current,
        })
      ) {
        return;
      }
      void syncNowRef.current?.();
    }, 8_000);
  }, []);
  useEffect(
    () => () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    },
    []
  );

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!settingsRef.current.isPremium) {
      return { ok: false, reason: 'Cloud sync is a Premium feature.' };
    }
    // Re-entry guard: a manual "Sync now" racing an in-flight sync (auto or
    // manual) must not be recorded as a failure. Bail before touching status /
    // backoff so the collision never reaches runCloudSync's in-flight sentinel.
    if (syncingRef.current) {
      return { ok: false, reason: SYNC_BUSY_REASON };
    }
    setSyncing(true);
    setSyncStatus('syncing');
    try {
      const result = await runCloudSync();
      if (result.ok) {
        await refresh();
        lastFailureAtRef.current = null;
        backoffMsRef.current = AUTO_SYNC_BASE_BACKOFF_MS;
        setSyncStatus('idle');
        setLastSyncError(null);
      } else {
        lastFailureAtRef.current = Date.now();
        backoffMsRef.current = nextBackoffMs(backoffMsRef.current);
        setSyncStatus('error');
        setLastSyncError(result.reason);
      }
      return result;
    } finally {
      setSyncing(false);
    }
  }, [refresh]);
  syncNowRef.current = syncNow;

  const setSyncEnabled = useCallback(
    async (value: boolean) => {
      const next = { ...settingsRef.current, syncEnabled: value };
      settingsRef.current = next;
      setSettings(next);
      await saveSettings(next);
      if (value) void syncNow();
    },
    [syncNow]
  );

  // Auto-sync: once after hydration, then on each return to foreground
  // (min 5 minutes apart), gated by canAutoSyncNow so a failing sync backs
  // off instead of retrying every pass. Failures are silent here — next
  // pass (once backoff clears) reconciles.
  const lastAutoSyncRef = useRef(0);
  useEffect(() => {
    const maybeSync = () => {
      if (loading) return;
      const s = settingsRef.current;
      if (!s.isPremium || !s.syncEnabled) return;
      const now = Date.now();
      if (now - lastAutoSyncRef.current < 5 * 60_000) return;
      lastAutoSyncRef.current = now;
      if (
        !canAutoSyncNow({
          now,
          inFlight: syncingRef.current,
          lastFailureAt: lastFailureAtRef.current,
          backoffMs: backoffMsRef.current,
        })
      ) {
        return;
      }
      void syncNow();
    };
    maybeSync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') maybeSync();
    });
    return () => sub.remove();
  }, [loading, syncNow]);

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
      consumeAiUse,
      getPlant,
      refresh,
      syncNow,
      setSyncEnabled,
      syncing,
      syncStatus,
      lastSyncError,
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
      consumeAiUse,
      getPlant,
      refresh,
      syncNow,
      setSyncEnabled,
      syncing,
      syncStatus,
      lastSyncError,
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
