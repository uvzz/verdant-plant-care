import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'verdant_openrouter_api_key';

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
  const v = await getItem();
  return v?.trim() || null;
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
