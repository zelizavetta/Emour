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
    EmotionType,
    apiGetAllNotes,
    apiCreateNote,
    apiUpdateNote,
    apiDeleteNote,
 } from '@emour/core';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [feelings, setFeelings] = useState<Feeling[]>([])
    const [symptoms, setSymptoms] = useState<Symptom[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const loadRecords = useCallback(async () => {
        try {
            const [feelings, symptoms, notes] = await Promise.all([
                apiGetAllFeelingRecord(),
                apiGetAllSymptomRecords(),
                apiGetAllNotes(),
            ])
            setFeelings(feelings)
            setSymptoms(symptoms)
            setNotes(notes)
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
        emotion: EmotionType,
        createdAtClient?: string,
        clientTimezone?: string
    ): Promise<Note | null> => {
        const localTime = createdAtClient ?? new Date().toISOString();
        const timezone = clientTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const note = await apiCreateNote(title, text, emotion, localTime, timezone)
            if (note) {
                setNotes(prev => [note, ...prev])
            }
            return note
        } catch (err) {
            console.warn('add note error', err)
            return null
        }
    }, [])

    const updateNote = useCallback(async(
        noteId: number,
        title: string,
        text: string,
        emotion: EmotionType,
        createdAtClient: string,
        clientTimezone: string
    ): Promise<Note | null> => {
        try {
            const note = await apiUpdateNote(noteId, title, text, emotion, createdAtClient, clientTimezone)
            if (note) {
                setNotes(prev => prev.map(n => n.id === noteId ? note : n))
            }
            return note
        } catch (err) {
            console.warn('update note error', err)
            return null
        }
    }, [])

    const deleteNote = useCallback(async(noteId: number): Promise<void> => {
        try {
            await apiDeleteNote(noteId)
            setNotes(prev => prev.filter(n => n.id !== noteId))
        } catch (err) {
            console.warn('delete note error', err)
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
        updateNote,
        deleteNote
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