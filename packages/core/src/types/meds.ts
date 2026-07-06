export interface Med {
  id: number;
  type: 'med';
  name: string;
  dosage: string;
  times: string[]; // "HH:MM" device local time
  enabled: boolean;
  createdAtClient: string;
  clientTimezone: string;
  createdAtServer: string;
}
