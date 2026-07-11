import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@verdant/onboarding_done';

export async function isOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
  return v === '1';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
