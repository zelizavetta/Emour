import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'emour_notif_ids_v1';
const FOLLOWUP_KEY = 'emour_followup_ids_v1';
const TAKEN_KEY = 'emour_taken_today_v1';

type NotifMap = Record<string, string[]>;
type FollowUpMap = Record<string, string[]>;
type TakenMap = Record<string, true>;

// ── Main notification IDs ──────────────────────────────────────────────────

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

// ── Follow-up notification IDs ─────────────────────────────────────────────

async function loadFollowUps(): Promise<FollowUpMap> {
  const raw = await AsyncStorage.getItem(FOLLOWUP_KEY);
  return raw ? (JSON.parse(raw) as FollowUpMap) : {};
}
async function saveFollowUps(map: FollowUpMap): Promise<void> {
  await AsyncStorage.setItem(FOLLOWUP_KEY, JSON.stringify(map));
}

export async function getFollowUpIds(medId: number): Promise<string[]> {
  const map = await loadFollowUps();
  return map[String(medId)] ?? [];
}
export async function saveFollowUpIds(medId: number, ids: string[]): Promise<void> {
  const map = await loadFollowUps();
  map[String(medId)] = ids;
  await saveFollowUps(map);
}
export async function removeFollowUpIds(medId: number): Promise<void> {
  const map = await loadFollowUps();
  delete map[String(medId)];
  await saveFollowUps(map);
}

// ── "Taken today" tracking ─────────────────────────────────────────────────

function localDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function takenKey(medId: number): string {
  return `${medId}_${localDateStr()}`;
}

async function loadTaken(): Promise<TakenMap> {
  const raw = await AsyncStorage.getItem(TAKEN_KEY);
  return raw ? (JSON.parse(raw) as TakenMap) : {};
}
async function saveTaken(map: TakenMap): Promise<void> {
  await AsyncStorage.setItem(TAKEN_KEY, JSON.stringify(map));
}

export async function isMedTakenToday(medId: number): Promise<boolean> {
  const map = await loadTaken();
  return !!map[takenKey(medId)];
}
export async function markMedTakenToday(medId: number): Promise<void> {
  const map = await loadTaken();
  map[takenKey(medId)] = true;
  await saveTaken(map);
}

export async function loadAllTakenTodayIds(): Promise<number[]> {
  const map = await loadTaken();
  const suffix = `_${localDateStr()}`;
  return Object.keys(map)
    .filter(k => k.endsWith(suffix))
    .map(k => Number(k.slice(0, -suffix.length)))
    .filter(n => !isNaN(n));
}
