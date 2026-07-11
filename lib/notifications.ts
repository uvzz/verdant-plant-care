import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { CareDueItem } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleGentleReminders(
  dueItems: CareDueItem[],
  enabled: boolean
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  // Schedule local reminders for items due today or tomorrow (gentle, limited).
  const soon = dueItems.filter((d) => d.daysUntil >= 0 && d.daysUntil <= 1).slice(0, 8);

  for (const item of soon) {
    const hour = item.type === 'water' ? 9 : 10;
    const triggerDate = new Date(item.dueDate);
    triggerDate.setHours(hour, 0, 0, 0);
    if (triggerDate.getTime() <= Date.now()) {
      // If already past, nudge in 1 hour
      triggerDate.setTime(Date.now() + 60 * 60 * 1000);
    }

    const action = item.type === 'water' ? 'water' : 'feed';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Gentle plant reminder 🌿',
        body: `Time to ${action} ${item.plant.name}`,
        data: { plantId: item.plant.id, type: item.type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}
