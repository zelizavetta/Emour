import { DayPart } from "./common.js";

export interface Symptom {
    id: number;
    symptomType: string;
    createdAtClient: string;
    createdAtServer: string;
    dayPart: DayPart;
}