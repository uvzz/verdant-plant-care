import { Share } from 'react-native';
import type { AppSettings, CareLog, FamilyMember, Plant } from './types';
import { normalizeCareLog, normalizePlant } from './types';

export type VerdantBackup = {
  version: 1 | 2;
  exportedAt: string;
  app: 'verdant-plant-care';
  plants: Plant[];
  logs: CareLog[];
  settings: Pick<AppSettings, 'notificationsEnabled' | 'isPremium'>;
  familyMembers?: FamilyMember[];
  householdName?: string;
};

export function buildBackupPayload(input: {
  plants: Plant[];
  logs: CareLog[];
  settings: AppSettings;
  familyMembers?: FamilyMember[];
  householdName?: string;
}): VerdantBackup {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    app: 'verdant-plant-care',
    plants: input.plants,
    logs: input.logs,
    settings: {
      notificationsEnabled: input.settings.notificationsEnabled,
      isPremium: input.settings.isPremium,
    },
    familyMembers: input.familyMembers ?? [],
    householdName: input.householdName ?? '',
  };
}

/**
 * Export collection as JSON. Privacy-first alternative to cloud lock-in.
 */
export async function exportCollectionBackup(input: {
  plants: Plant[];
  logs: CareLog[];
  settings: AppSettings;
  familyMembers?: FamilyMember[];
  householdName?: string;
}): Promise<{ ok: true; path: string } | { ok: false; reason: string }> {
  const payload = buildBackupPayload(input);
  const json = JSON.stringify(payload, null, 2);
  const title = `Verdant backup · ${input.plants.length} plants · ${new Date()
    .toISOString()
    .slice(0, 10)}`;

  try {
    await Share.share({
      message: json,
      title,
    });
    return { ok: true, path: 'share' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Export failed';
    if (/cancel/i.test(msg)) return { ok: true, path: 'cancelled' };
    return { ok: false, reason: msg };
  }
}

export function parseBackupJson(raw: string):
  | { ok: true; backup: VerdantBackup }
  | { ok: false; reason: string } {
  try {
    // Hard cap to avoid OOM from malicious files
    if (raw.length > 8_000_000) {
      return { ok: false, reason: 'Backup file is too large.' };
    }
    const data = JSON.parse(raw) as Partial<VerdantBackup>;
    if (!data || data.app !== 'verdant-plant-care') {
      return { ok: false, reason: 'Not a Verdant backup file.' };
    }
    if (!Array.isArray(data.plants) || !Array.isArray(data.logs)) {
      return { ok: false, reason: 'Backup is missing plants or care logs.' };
    }
    if (data.plants.length > 5_000 || data.logs.length > 50_000) {
      return { ok: false, reason: 'Backup has too many records.' };
    }

    const plants = data.plants
      .slice(0, 5_000)
      .filter((p): p is Plant => !!p && typeof p === 'object')
      .map((p) => {
        try {
          return normalizePlant(p as Plant);
        } catch {
          return null;
        }
      })
      .filter((p): p is Plant => !!p && !!p.id);
    const plantIds = new Set(plants.map((p) => p.id));

    const logs = data.logs
      .slice(0, 50_000)
      .filter((l) => !!l && typeof l === 'object')
      .map((l) => normalizeCareLog(l as CareLog))
      .filter((l): l is CareLog => !!l && plantIds.has(l.plantId));

    const familyMembers = Array.isArray(data.familyMembers)
      ? data.familyMembers
          .filter((m) => m && typeof m.id === 'string' && typeof m.name === 'string')
          .slice(0, 50)
          .map((m) => ({
            id: String(m.id).slice(0, 64),
            name: String(m.name).slice(0, 80),
            role: m.role === 'owner' ? ('owner' as const) : ('member' as const),
            createdAt: m.createdAt || new Date().toISOString(),
          }))
      : [];

    return {
      ok: true,
      backup: {
        version: data.version === 2 ? 2 : 1,
        exportedAt: data.exportedAt ?? new Date().toISOString(),
        app: 'verdant-plant-care',
        plants,
        logs,
        // Never trust backup premium flag for entitlement — local IAP is source of truth
        settings: {
          notificationsEnabled: data.settings?.notificationsEnabled ?? true,
          isPremium: false,
        },
        familyMembers,
        householdName: String(data.householdName ?? '').slice(0, 80),
      },
    };
  } catch {
    return { ok: false, reason: 'Could not parse backup JSON.' };
  }
}
