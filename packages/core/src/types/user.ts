import { Feeling, FeelingType } from "./feelings.js"
import { Note } from "./notes.js"
import { Symptom } from "./symptoms.js"


export interface UserContextType {
    feelings: Feeling[],
    symptoms: Symptom[],
    notes: Note[],
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
        createdAtClient?: string, 
        clientTimezone?: string
    ) => Promise<Note | null>,
    updateNoteTitle: (
        noteId: number,
        title: string
    ) => Promise<number | null>,
    updateNoteText: (
        noteId: number,
        text: string
    ) => Promise<number | null>
}