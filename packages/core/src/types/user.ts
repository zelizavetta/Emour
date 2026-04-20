import { Feeling, FeelingType } from "./feelings.js"
import { Symptom } from "./symptoms.js"


export interface UserContextType {
    feelings: Feeling[],
    symptoms: Symptom[],
    addFeelingRecord: (feelingType: FeelingType, score: number, createdAtClient: string) => Promise<Feeling | null>,
    addSymptomsRecord: (symptom: string[], createdAtClient: string) => Promise<Symptom[] | null>
}