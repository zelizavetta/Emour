import AsyncStorage from '@react-native-async-storage/async-storage';

// Stores device-specific notification IDs keyed by med ID from the backend.
// Notification IDs are ephemeral and device-local, so they are never sent to the server.

const KEY = 'emour_notif_ids_v1';

type NotifMap = Record<string, string[]>; // medId (as string) → notificationIds

async function load(): Promise<NotifMap> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as NotifMap) : {};
}

async function save(map: NotifMap): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function getNotifIds(medId: number): Promise<string[]> {
  const map = await load();
  return map[String(medId)] ?? [];
}

export async function saveNotifIds(medId: number, ids: string[]): Promise<void> {
  const map = await load();
  map[String(medId)] = ids;
  await save(map);
}

export async function removeNotifIds(medId: number): Promise<void> {
  const map = await load();
  delete map[String(medId)];
  await save(map);
}
