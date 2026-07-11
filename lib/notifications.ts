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

/** Avoid cancel+reschedule thrash when calendar re-renders often */
let lastScheduleKey = '';

export async function scheduleGentleReminders(
  dueItems: CareDueItem[],
  enabled: boolean
): Promise<void> {
  if (Platform.OS === 'web') return;

  const key = `${enabled}|${dueItems
    .filter((d) => d.daysUntil >= 0 && d.daysUntil <= 1)
    .map((d) => `${d.plant.id}:${d.type}:${d.daysUntil}`)
    .sort()
    .join(',')}`;
  if (key === lastScheduleKey) return;
  lastScheduleKey = key;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  // Schedule local reminders for items due today or tomorrow (gentle, limited).
  const soon = dueItems
    .filter((d) => d.daysUntil >= 0 && d.daysUntil <= 1 && !Number.isNaN(d.daysUntil))
    .slice(0, 8);

  // Stagger “already past” nudges so they don't all fire at once
  let overdueOffsetMin = 0;

  for (const item of soon) {
    const hour = item.type === 'water' ? 9 : 10;
    const triggerDate = new Date(item.dueDate);
    if (Number.isNaN(triggerDate.getTime())) continue;
    triggerDate.setHours(hour, 0, 0, 0);
    if (triggerDate.getTime() <= Date.now()) {
      overdueOffsetMin += 15;
      triggerDate.setTime(Date.now() + overdueOffsetMin * 60 * 1000);
    }

    const body =
      item.type === 'water'
        ? `Check soil on ${item.plant.name} — water only if dry`
        : `Consider feeding ${item.plant.name}`;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Gentle plant reminder 🌿',
        body,
        data: { plantId: item.plant.id, type: item.type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}
