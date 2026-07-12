import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Light impact for taps on chips/buttons. No-op on web, never throws. */
export function tapLight(): void {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Success notification for completed care actions. */
export function tapSuccess(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {}
  );
}
