// days: expo-notifications weekday convention — 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
export interface Med {
  id: number;
  type: 'med';
  name: string;
  dosage: string;
  times: string[]; // "HH:MM" device local time
  days: number[];  // weekdays to take, all 7 = every day
  enabled: boolean;
  createdAtClient: string;
  clientTimezone: string;
  createdAtServer: string;
}

export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

export const WEEKDAY_LABELS: { value: number; short: string }[] = [
  { value: 2, short: 'Пн' },
  { value: 3, short: 'Вт' },
  { value: 4, short: 'Ср' },
  { value: 5, short: 'Чт' },
  { value: 6, short: 'Пт' },
  { value: 7, short: 'Сб' },
  { value: 1, short: 'Вс' },
];
