/**
 * Cloud sync client — pushes/pulls the collection through the verdant-ai
 * Worker (D1 + KV). Local-first stays true: the device is always usable
 * offline; sync reconciles when reachable.
 *
 * Identity: a random 64-hex sync id generated on device and kept in
 * SecureStore. It is a capability secret — anyone with the id + premium
 * token can read the collection. Linking a second device = entering the
 * same code there.
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { getAiProxyUrl, getPremiumAccessToken } from './aiConfig';
import {
  loadCareLogs,
  loadPlants,
  loadSettings,
  loadTombstones,
  resetLocalCollection,
  saveCareLogs,
  savePlants,
  saveSettings,
  saveTombstones,
} from './storage';
import { shouldResetOnAdopt } from './syncIdentity';
import {
  emptySyncDoc,
  mergeSyncDocs,
  parseSyncDoc,
  type SyncDoc,
} from './syncMerge';
import { normalizeCareLog, normalizePlant, type CareLog, type Plant } from './types';

const SYNC_ID_KEY = 'verdant.sync.id';
const UPLOADED_KEY = '@verdant/sync_uploaded_photos';
const ADOPTED_KEY = '@verdant/sync_id_adopted';
const SYNC_ID_RE = /^[a-f0-9]{32,64}$/;

/**
 * The one sentinel meaning "a sync is already running — this is not an error".
 * Both guards (this module's in-flight lock and PlantContext's re-entry guard)
 * must return exactly this, so callers have a single string to treat as benign.
 * Two different strings previously leaked a false "Linked, but sync failed".
 */
export const SYNC_BUSY_REASON = 'A sync is already in progress.';

export type SyncResult =
  | { ok: true; rev: number; pulledPlants: number; pushedPhotos: number }
  | { ok: false; reason: string };

let syncInFlight = false;

export async function getSyncId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SYNC_ID_KEY);
  } catch {
    return null;
  }
}

export async function getOrCreateSyncId(): Promise<string> {
  const existing = await getSyncId();
  if (existing && SYNC_ID_RE.test(existing)) return existing;
  const bytes = await Crypto.getRandomBytesAsync(32);
  const id = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(SYNC_ID_KEY, id);
  // A device-generated random id is NOT an adopted account — clear the marker
  // so a later first sign-in keeps this offline collection instead of wiping it.
  await AsyncStorage.removeItem(ADOPTED_KEY);
  return id;
}

/** True when the current sync id came from a real account link / sign-in
 *  (as opposed to a device-generated random id). */
export async function wasSyncIdAdopted(): Promise<boolean> {
  return (await AsyncStorage.getItem(ADOPTED_KEY)) === '1';
}

/**
 * Delete this account's cloud collection and photos, and forget the local
 * upload cache. Local plants stay on the device (the user removes those by
 * deleting the app). Backs the in-app "Delete synced data" action, which
 * Apple guideline 5.1.1(v) requires for apps with sign-in.
 */
export async function deleteCloudData(): Promise<
  { ok: true; deletedPhotos: number } | { ok: false; reason: string }
> {
  const token = getPremiumAccessToken();
  if (!token) return { ok: false, reason: 'Sync is not configured for this build.' };
  const syncId = await getSyncId();
  if (!syncId) return { ok: false, reason: 'Nothing is synced from this device.' };

  try {
    const res = await fetch(`${getAiProxyUrl()}/v1/sync`, {
      method: 'DELETE',
      headers: syncHeaders(token, syncId),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, reason: `Delete failed (${res.status}): ${body.slice(0, 120)}` };
    }
    const data = (await res.json().catch(() => ({}))) as { deletedPhotos?: number };
    await AsyncStorage.removeItem(UPLOADED_KEY);
    return { ok: true, deletedPhotos: data.deletedPhotos ?? 0 };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Delete failed.' };
  }
}

/** Adopt another device's sync code (links this device to that collection). */
export async function adoptSyncId(
  raw: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const id = raw.trim().toLowerCase();
  if (!SYNC_ID_RE.test(id)) {
    return { ok: false, reason: 'Sync codes are 32–64 hex characters.' };
  }
  const prev = await getSyncId();
  if (shouldResetOnAdopt(prev, id, await wasSyncIdAdopted())) {
    await resetLocalCollection();
  }
  await SecureStore.setItemAsync(SYNC_ID_KEY, id);
  // This id came from a real account link / sign-in — mark it adopted.
  await AsyncStorage.setItem(ADOPTED_KEY, '1');
  await AsyncStorage.removeItem(UPLOADED_KEY);
  return { ok: true };
}

function photoName(uri: string | null | undefined): string | null {
  if (!uri || !uri.startsWith('file')) return null;
  const base = uri.split('/').pop() || '';
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(base) ? base : null;
}

/**
 * Content-Type for a photo UPLOAD. Constrained to what the Worker accepts
 * (PHOTO_TYPES = jpeg|png|webp): sending image/gif or image/heic gets a hard
 * "Unsupported photo type" reject, and the photo then silently never syncs.
 * Anything else is labelled jpeg, which is what the pickers/camera produce.
 */
function mimeFor(name: string): string {
  const n = name.toLowerCase().split(/[?#]/)[0] ?? '';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

async function buildLocalDoc(): Promise<SyncDoc> {
  const [plants, logs, settings, tombstones] = await Promise.all([
    loadPlants(),
    loadCareLogs(),
    loadSettings(),
    loadTombstones(),
  ]);
  return {
    ...emptySyncDoc(),
    plants,
    logs,
    familyMembers: settings.familyMembers ?? [],
    householdName: settings.householdName ?? '',
    tombstones,
  };
}

/** Sanitize remote/merged records before persisting (corrupt cloud payloads). */
function sanitizeDoc(doc: SyncDoc): SyncDoc {
  const plants = (Array.isArray(doc.plants) ? doc.plants : [])
    // Drop garbage BEFORE normalizing: normalizePlant always mints an id and
    // name, so feeding it `null` produced a phantom plant called "Plant" that
    // got saved locally and pushed to the cloud. (The old
    // `.filter((p) => !!p.id)` afterwards could never remove anything.)
    .filter(
      (p): p is Plant =>
        !!p && typeof p === 'object' && typeof (p as Plant).id === 'string'
    )
    .map((p) => normalizePlant(p as Partial<Plant> & Pick<Plant, 'id' | 'name'>));
  const plantIds = new Set(plants.map((p) => p.id));
  const logs = doc.logs
    .map((l) => normalizeCareLog((l ?? {}) as Partial<CareLog>))
    .filter((l): l is CareLog => l != null && plantIds.has(l.plantId));
  return { ...doc, plants, logs };
}

async function applyDocLocally(doc: SyncDoc): Promise<void> {
  const clean = sanitizeDoc(doc);
  const settings = await loadSettings();
  await Promise.all([
    savePlants(clean.plants),
    saveCareLogs(clean.logs),
    saveTombstones(clean.tombstones),
    saveSettings({
      ...settings,
      familyMembers: clean.familyMembers,
      householdName: clean.householdName || settings.householdName || '',
      lastSyncAt: new Date().toISOString(),
    }),
  ]);
}

function syncHeaders(token: string, syncId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'X-Sync-Id': syncId,
    'X-Verdant-Client': 'verdant-app',
  };
}

/**
 * Full sync pass: pull → merge → push (CAS retry once) → photo sync →
 * apply locally. Never throws; returns a result the UI can show.
 */
export async function syncNow(): Promise<SyncResult> {
  if (syncInFlight) return { ok: false, reason: SYNC_BUSY_REASON };
  syncInFlight = true;
  try {
    const token = getPremiumAccessToken();
    if (!token) return { ok: false, reason: 'Sync is not configured for this build.' };
    const settings = await loadSettings();
    if (!settings.isPremium) {
      return { ok: false, reason: 'Cloud sync is a Premium feature.' };
    }

    const syncId = await getOrCreateSyncId();
    const base = getAiProxyUrl();
    const headers = syncHeaders(token, syncId);

    // 1. Pull
    const pullRes = await fetch(`${base}/v1/sync`, { headers });
    if (!pullRes.ok) {
      return { ok: false, reason: `Sync pull failed (${pullRes.status}).` };
    }
    const pull = (await pullRes.json()) as { rev: number; payload: string | null };
    const remoteDoc = pull.payload ? parseSyncDoc(pull.payload) : null;

    // 2. Merge
    const localDoc = await buildLocalDoc();
    let merged = remoteDoc ? mergeSyncDocs(localDoc, remoteDoc) : localDoc;
    let baseRev = pull.rev ?? 0;

    // 3. Push with one CAS retry
    for (let attempt = 0; attempt < 2; attempt++) {
      const pushRes = await fetch(`${base}/v1/sync`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseRev,
          payload: JSON.stringify({ ...merged, exportedAt: new Date().toISOString() }),
        }),
      });
      if (pushRes.ok) {
        const { rev } = (await pushRes.json()) as { rev: number };
        baseRev = rev;
        break;
      }
      if (pushRes.status === 409 && attempt === 0) {
        const conflict = (await pushRes.json()) as { rev: number; payload: string };
        const conflictDoc = parseSyncDoc(conflict.payload);
        if (!conflictDoc) return { ok: false, reason: 'Remote data unreadable.' };
        merged = mergeSyncDocs(merged, conflictDoc);
        baseRev = conflict.rev;
        continue;
      }
      const body = await pushRes.text().catch(() => '');
      return { ok: false, reason: `Sync push failed (${pushRes.status}): ${body.slice(0, 120)}` };
    }

    // 4. Photos — best-effort, failures don't fail the sync
    const pushedPhotos = await syncPhotos(base, headers, merged).catch(() => 0);

    // 5. Apply merged result locally
    await applyDocLocally(merged);

    return {
      ok: true,
      rev: baseRev,
      pulledPlants: merged.plants.length,
      pushedPhotos,
    };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : 'Sync failed.',
    };
  } finally {
    syncInFlight = false;
  }
}

/**
 * Fetch the set of photo names the server already holds for this sync id.
 * Returns null if the manifest can't be read (older worker, network error) —
 * callers treat null as "unknown" and fall back to attempting every upload
 * (PUT is idempotent, so re-uploading is safe, just wasteful).
 */
async function fetchServerPhotos(
  base: string,
  headers: Record<string, string>
): Promise<Set<string> | null> {
  try {
    const res = await fetch(`${base}/v1/photos`, { headers });
    if (!res.ok) return null;
    const body = (await res.json()) as { photos?: string[] };
    return new Set(body.photos ?? []);
  } catch {
    return null;
  }
}

/**
 * Upload local photos the server doesn't have; download missing ones.
 *
 * The server's photo manifest is the authority for what's already stored —
 * NOT a device-local cache. A local "already uploaded" cache silently
 * desyncs (KV wiped, or a name marked uploaded before the PUT landed), which
 * left KV empty forever. Reconciling against the server each sync self-heals
 * that and makes cross-device pulls correct.
 */
async function syncPhotos(
  base: string,
  headers: Record<string, string>,
  doc: SyncDoc
): Promise<number> {
  let pushed = 0;

  // Server truth (null = unknown → upload everything, idempotently).
  const have = await fetchServerPhotos(base, headers);

  const entries: Array<{ uri: string | null | undefined; set: (u: string) => void }> = [
    ...doc.plants.map((p) => ({
      uri: p.photoUri,
      set: (u: string) => {
        p.photoUri = u;
      },
    })),
    ...doc.logs.map((l) => ({
      uri: l.photoUri,
      set: (u: string) => {
        l.photoUri = u;
      },
    })),
  ];

  const dir = `${FileSystem.documentDirectory}verdant-photos/`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  }

  for (const entry of entries) {
    const name = photoName(entry.uri);
    if (!name || !entry.uri) continue;

    const info = await FileSystem.getInfoAsync(entry.uri).catch(() => ({ exists: false }));
    if (info.exists) {
      // Local file — upload unless the server already has it. uploadAsync
      // streams the file natively (RN fetch can't reliably send binary bodies).
      if (have && have.has(name)) continue;
      try {
        const size = 'size' in info ? (info as { size?: number }).size ?? 0 : 0;
        if (size > 3_000_000) {
          console.warn('[sync] photo skipped (over 3MB cap)', name, size);
          continue; // server cap
        }
        const res = await FileSystem.uploadAsync(
          `${base}/v1/photos/${encodeURIComponent(name)}`,
          entry.uri,
          {
            httpMethod: 'PUT',
            headers: { ...headers, 'Content-Type': mimeFor(name) },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        );
        if (res.status === 200) {
          have?.add(name);
          pushed++;
        } else {
          console.warn('[sync] photo upload rejected', name, res.status, res.body?.slice(0, 120));
        }
      } catch (e) {
        console.warn('[sync] photo upload failed', name, e);
      }
    } else {
      // Missing locally (came from another device) — download if the server
      // has it. If the manifest is unknown, still try; a 404 is handled.
      if (have && !have.has(name)) continue;
      const local = `${dir}${name}`;
      const localInfo = await FileSystem.getInfoAsync(local).catch(() => ({ exists: false }));
      if (!localInfo.exists) {
        try {
          const dl = await FileSystem.downloadAsync(
            `${base}/v1/photos/${encodeURIComponent(name)}`,
            local,
            { headers }
          );
          if (dl.status !== 200) {
            console.warn('[sync] photo download rejected', name, dl.status);
            await FileSystem.deleteAsync(local, { idempotent: true }).catch(() => {});
            continue;
          }
        } catch (e) {
          console.warn('[sync] photo download failed', name, e);
          continue;
        }
      }
      entry.set(local);
    }
  }

  return pushed;
}

