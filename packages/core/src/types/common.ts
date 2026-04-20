export type DayPart = 'night' | 'morning' | 'afternoon' | 'evening'

export type UserRecordType = 'feeling' | 'symptom' | 'trigger' | 'sleep'

export interface UserRecord {
    id: number;
    type: UserRecordType;
    createdAtClient: string;
    clientTimezone: string;
    createdAtServer: string;
    dayPart: DayPart;
}