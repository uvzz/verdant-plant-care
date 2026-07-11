import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'verdant_openrouter_api_key';

/** Optional local-dev fallback from gitignored `.env` (Expo public env). */
function envKey(): string | null {
  const v = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim();
  return v || null;
}

async function setItem(value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

async function getItem(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(KEY);
  }
  return SecureStore.getItemAsync(KEY);
}

async function deleteItem() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

export async function getOpenRouterKey(): Promise<string | null> {
  const stored = (await getItem())?.trim();
  if (stored) return stored;

  // Seed Secure Store once from local .env so Settings shows "Key on device"
  const fromEnv = envKey();
  if (fromEnv) {
    try {
      await setItem(fromEnv);
    } catch {
      /* SecureStore can fail on web; still return env key */
    }
    return fromEnv;
  }
  return null;
}

export async function setOpenRouterKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await deleteItem();
    return;
  }
  await setItem(trimmed);
}

export async function clearOpenRouterKey(): Promise<void> {
  await deleteItem();
}

export async function hasOpenRouterKey(): Promise<boolean> {
  return !!(await getOpenRouterKey());
}
