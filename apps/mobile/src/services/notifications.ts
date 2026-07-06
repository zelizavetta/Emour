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

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('meds', {
    name: 'Таблетки',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FA57B7',
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedNotifications(
  name: string,
  dosage: string,
  times: string[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const time of times) {
    const [hour, minute] = time.split(':').map(Number);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Таблетки',
        body: dosage ? `${name} — ${dosage}` : name,
        sound: true,
        android: { channelId: 'meds' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
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
