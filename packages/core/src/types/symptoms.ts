import { DayPart, UserRecord } from "./common.js";

// export interface Symptom {
//     id: number;
//     type: string;
//     createdAtClient: string;
//     clientTimezone: string;
//     createdAtServer: string;
//     dayPart: DayPart;
// }

export interface Symptom extends UserRecord {
    type: 'symptom';
    symptomType: string;
}