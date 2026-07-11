import { Share } from 'react-native';
import type { AppSettings, CareLog, FamilyMember, Plant } from './types';

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
    const data = JSON.parse(raw) as Partial<VerdantBackup>;
    if (!data || data.app !== 'verdant-plant-care') {
      return { ok: false, reason: 'Not a Verdant backup file.' };
    }
    if (!Array.isArray(data.plants) || !Array.isArray(data.logs)) {
      return { ok: false, reason: 'Backup is missing plants or care logs.' };
    }
    return {
      ok: true,
      backup: {
        version: data.version === 2 ? 2 : 1,
        exportedAt: data.exportedAt ?? new Date().toISOString(),
        app: 'verdant-plant-care',
        plants: data.plants as Plant[],
        logs: data.logs as CareLog[],
        settings: {
          notificationsEnabled: data.settings?.notificationsEnabled ?? true,
          isPremium: data.settings?.isPremium ?? false,
        },
        familyMembers: data.familyMembers ?? [],
        householdName: data.householdName ?? '',
      },
    };
  } catch {
    return { ok: false, reason: 'Could not parse backup JSON.' };
  }
}
