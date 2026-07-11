import * as FileSystem from 'expo-file-system/legacy';
import { createId } from './storage';

const photosDir = () => {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('Document directory unavailable');
  return `${base}verdant-photos/`;
};

async function ensurePhotosDir(): Promise<string> {
  const dir = photosDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * Copy a picker/camera URI into app document storage so it survives
 * gallery cleanup and app restarts.
 */
export async function persistPhoto(sourceUri: string | null | undefined): Promise<string | null> {
  if (!sourceUri) return null;
  // Already in our store
  if (sourceUri.includes('verdant-photos/')) return sourceUri;

  try {
    const dir = await ensurePhotosDir();
    const extMatch = sourceUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = (extMatch?.[1] || 'jpg').toLowerCase().slice(0, 5);
    const dest = `${dir}${createId()}.${ext}`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
  } catch {
    // Fall back to original URI if copy fails (e.g. web)
    return sourceUri;
  }
}

/** Read image as base64 for multimodal API calls */
export async function photoToBase64(
  uri: string
): Promise<{ base64: string; mime: string } | null> {
  try {
    const lower = uri.toLowerCase();
    const mime = lower.endsWith('.png')
      ? 'image/png'
      : lower.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { base64, mime };
  } catch {
    return null;
  }
}
