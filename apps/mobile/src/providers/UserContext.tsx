import { 
    apiCreateFeelingRecord, 
    apiGetAllFeelingRecord, 
    FeelingType, 
    Feeling, 
    UserContextType,
    Symptom,
    apiCreateSympomRecords,
    apiGetAllSymptomRecords,
    Note,
    apiGetAllNotes,
    apiCreateNote,
    Med,
    apiGetAllMeds
 } from '@emour/core';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [feelings, setFeelings] = useState<Feeling[]>([])
    const [symptoms, setSymptoms] = useState<Symptom[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [meds, setMeds] = useState<Med[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const loadRecords = useCallback(async () => {
        try {
            const [feelings, symptoms, notes, meds] = await Promise.all([
                apiGetAllFeelingRecord(),
                apiGetAllSymptomRecords(),
                apiGetAllNotes(),
                apiGetAllMeds()
            ])
            setFeelings(feelings)
            setSymptoms(symptoms)
            setNotes(notes)
            setMeds(meds) 
        } catch (err) {
            console.warn('records load error', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRecords()
    }, [])

    const refresh = useCallback(async () => {
        await loadRecords()
    }, [loadRecords])

    const addFeelingRecord = useCallback(async(
        feelingType: FeelingType, 
        score: number, 
        createdAtClient?: string,
        clientTimezone?: string
    ): Promise<Feeling | null> => {
        const localTime = createdAtClient ?? new Date().toISOString();
        const timezone = clientTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const record = await apiCreateFeelingRecord(feelingType, score, localTime, timezone)
            console.log(record)
            if (record) {
                setFeelings(prev => [record, ...prev])
            }
            return record
        } catch (err) {
            console.warn('add feeling record error', err)
            return null
        }
    }, [])

    const addSymptomsRecord = useCallback(async(
        symptoms: string[], 
        createdAtClient?: string,
        clientTimezone?: string
    ): Promise<Symptom[] | null> => {
        const localTime = createdAtClient ?? new Date().toISOString();
        const timezone = clientTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            console.log('symptoms: ', symptoms)
            const record = await apiCreateSympomRecords(symptoms, localTime, timezone)
            console.log(record)
            if (record) {
                setSymptoms(prev => [...record, ...prev])
            }
            return record
        } catch (err) {
            console.warn('add symptom record error', err)
            return null
        }
    }, [])

    const addNote = useCallback(async(
        title: string,
        text: string,
        createdAtClient?: string,
        clientTimezone?: string
    ): Promise<Note | null> => {
        const localTime = createdAtClient ?? new Date().toISOString();
        const timezone = clientTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            console.log('note: ', text)
            const note = await apiCreateNote(title, text, localTime, timezone)
            console.log(note)
            if (note) {
                setNotes(prev => [note, ...prev])
            }
            return note
        } catch (err) {
            console.warn('add note error', err)
            return null
        }
    }, [])

    const updateNoteTitle = useCallback(async(
        noteId: number,
        title: string,
    ): Promise<number | null> => {
        return null
    }, [])

    const updateNoteText = useCallback(async(
        noteId: number,
        text: string,
    ): Promise<number | null> => {
        return null
    }, [])

    const addMeds = useCallback(async(
        name: string,
        dosage: string,
        frequency: string,
        createdAtClient?: string,
        clientTimezone?: string
    ): Promise<Note | null> => {
        const localTime = createdAtClient ?? new Date().toISOString();
        const timezone = clientTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            console.log('note: ', text)
            const note = await apiCreateNote(title, text, localTime, timezone)
            console.log(note)
            if (note) {
                setNotes(prev => [note, ...prev])
            }
            return note
        } catch (err) {
            console.warn('add note error', err)
            return null
        }
    }, [])

    const contextValue: UserContextType = {
        feelings,
        symptoms,
        notes,
        isLoading,
        refresh,
        addFeelingRecord,
        addSymptomsRecord,
        addNote,
        updateNoteTitle,
        updateNoteText
    }

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserRecords() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useRecords must be used within a UserProvider');
  }
  return context;
}