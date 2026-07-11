import { Share } from 'react-native';
import type { AppSettings, CareLog, Plant } from './types';

export type VerdantBackup = {
  version: 1;
  exportedAt: string;
  app: 'verdant-plant-care';
  plants: Plant[];
  logs: CareLog[];
  settings: Pick<AppSettings, 'notificationsEnabled' | 'isPremium'>;
};

/**
 * Export collection as JSON. Privacy-first alternative to cloud lock-in
 * (competitors rarely make exit easy).
 */
export async function exportCollectionBackup(input: {
  plants: Plant[];
  logs: CareLog[];
  settings: AppSettings;
}): Promise<{ ok: true; path: string } | { ok: false; reason: string }> {
  const payload: VerdantBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'verdant-plant-care',
    plants: input.plants,
    logs: input.logs,
    settings: {
      notificationsEnabled: input.settings.notificationsEnabled,
      isPremium: input.settings.isPremium,
    },
  };

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
