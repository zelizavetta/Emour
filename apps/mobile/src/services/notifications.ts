import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show alert + sound when notification fires while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const MED_TAKEN_ACTION = 'med_taken';
const MED_CATEGORY = 'med_reminder';

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('meds', {
    name: 'Таблетки',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FA57B7',
  });
}

export async function setupMedCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(MED_CATEGORY, [
    {
      identifier: MED_TAKEN_ACTION,
      buttonTitle: '✓ Приняла',
      options: { opensAppToForeground: false },
    },
  ]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedNotifications(
  medId: number,
  name: string,
  dosage: string,
  times: string[],
  days: number[],
): Promise<string[]> {
  const ids: string[] = [];
  const body = dosage ? `${name} — ${dosage}` : name;
  const content = {
    title: 'Таблетки',
    body,
    sound: true,
    android: { channelId: 'meds' },
    categoryIdentifier: MED_CATEGORY,
    data: { medId },
  };

  const allDays = days.length === 7;

  for (const time of times) {
    const [hour, minute] = time.split(':').map(Number);

    if (allDays) {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      ids.push(id);
    } else {
      for (const weekday of days) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
          },
        });
        ids.push(id);
      }
    }
  }
  return ids;
}

// Schedule 3 one-time follow-up reminders at +10, +20, +30 minutes from now.
export async function scheduleFollowUpNotifications(
  medId: number,
  name: string,
  dosage: string,
): Promise<string[]> {
  const ids: string[] = [];
  const body = dosage ? `${name} — ${dosage}` : name;
  const content = {
    title: '⏰ Напоминание о таблетках',
    body,
    sound: true,
    android: { channelId: 'meds' },
    categoryIdentifier: MED_CATEGORY,
    data: { medId },
  };

  const now = Date.now();
  for (let i = 1; i <= 3; i++) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(now + i * 10 * 60 * 1000),
      },
    });
    ids.push(id);
  }
  return ids;
}

export async function cancelMedNotifications(notificationIds: string[]): Promise<void> {
  await Promise.all(
    notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id)),
  );
}
