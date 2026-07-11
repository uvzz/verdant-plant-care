import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

/**
 * Pick a Verdant backup JSON from Files / Drive and return its text.
 */
export async function pickBackupJsonFile(): Promise<
  | { ok: true; text: string; name: string }
  | { ok: false; reason: string; cancelled?: boolean }
> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', 'public.json', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { ok: false, reason: 'Cancelled', cancelled: true };
    }

    const asset = result.assets[0];
    let text = '';

    if (Platform.OS === 'web' && asset.file) {
      text = await asset.file.text();
    } else {
      // Fetch file URI as text (works with cache-copied files)
      const res = await fetch(asset.uri);
      text = await res.text();
    }

    if (!text.trim()) {
      return { ok: false, reason: 'File is empty.' };
    }

    return { ok: true, text, name: asset.name || 'backup.json' };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : 'Could not open file',
    };
  }
}
