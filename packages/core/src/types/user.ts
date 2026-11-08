import { Feeling, FeelingType } from "./feelings.js"
import { Note, EmotionType } from "./notes.js"
import { Symptom } from "./symptoms.js"


export interface UserContextType {
    feelings: Feeling[],
    symptoms: Symptom[],
    notes: Note[],
    isLoading: boolean,
    addFeelingRecord: (
        feelingType: FeelingType, 
        score: number, 
        createdAtClient?: string, 
        clientTimezone?: string
    ) => Promise<Feeling | null>,
    addSymptomsRecord: (
        symptom: string[], 
        createdAtClient?: string, 
        clientTimezone?: string
    ) => Promise<Symptom[] | null>,
    addNote: (
        title: string,
        text: string,
        emotion: EmotionType,
        createdAtClient?: string,
        clientTimezone?: string
    ) => Promise<Note | null>,
    updateNote: (
        noteId: number,
        title: string,
        text: string,
        emotion: EmotionType,
        createdAtClient: string,
        clientTimezone: string
    ) => Promise<Note | null>,
    deleteNote: (
        noteId: number
    ) => Promise<void>,
    refresh: () => Promise<void>
}