import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  Feeling, FeelingType, Symptom, Note, Med, EmotionType,
  apiGetAllFeelingRecord, apiCreateFeelingRecord,
  apiGetAllSymptomRecords, apiCreateSympomRecords,
  apiGetAllNotes, apiCreateNote,
  apiGetAllMeds, apiCreateMed, apiDeleteMed, apiToggleMed,
} from '@emour/core'

interface DataContextType {
  feelings: Feeling[]
  symptoms: Symptom[]
  notes: Note[]
  meds: Med[]
  isLoading: boolean
  refresh: () => Promise<void>
  addFeeling: (type: FeelingType, score: number) => Promise<void>
  addSymptoms: (symptoms: string[]) => Promise<void>
  addNote: (title: string, text: string, emotion?: EmotionType) => Promise<Note | null>
  addMed: (name: string, dosage: string, times: string[], days: number[]) => Promise<void>
  deleteMed: (id: number) => Promise<void>
  toggleMed: (id: number) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [feelings, setFeelings] = useState<Feeling[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [meds, setMeds] = useState<Med[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [f, s, n, m] = await Promise.all([
        apiGetAllFeelingRecord(),
        apiGetAllSymptomRecords(),
        apiGetAllNotes(),
        apiGetAllMeds(),
      ])
      setFeelings(Array.isArray(f) ? f : [])
      setSymptoms(Array.isArray(s) ? s : [])
      setNotes(Array.isArray(n) ? n : [])
      setMeds(Array.isArray(m) ? m : [])
    } catch (err) {
      console.warn('data load error', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = useCallback(() => load(), [load])

  const now = () => ({
    createdAtClient: new Date().toISOString(),
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const addFeeling = useCallback(async (type: FeelingType, score: number) => {
    const { createdAtClient, clientTimezone } = now()
    const record = await apiCreateFeelingRecord(type, score, createdAtClient, clientTimezone)
    setFeelings(prev => [record, ...prev])
  }, [])

  const addSymptoms = useCallback(async (symptoms: string[]) => {
    const { createdAtClient, clientTimezone } = now()
    const records = await apiCreateSympomRecords(symptoms, createdAtClient, clientTimezone)
    setSymptoms(prev => [...records, ...prev])
  }, [])

  const addNote = useCallback(async (title: string, text: string, emotion: EmotionType = 'calm'): Promise<Note | null> => {
    const { createdAtClient, clientTimezone } = now()
    const note = await apiCreateNote(title, text, emotion, createdAtClient, clientTimezone)
    setNotes(prev => [note, ...prev])
    return note
  }, [])

  const addMed = useCallback(async (name: string, dosage: string, times: string[], days: number[]) => {
    const { createdAtClient, clientTimezone } = now()
    const med = await apiCreateMed(name, dosage, times, days, createdAtClient, clientTimezone)
    setMeds(prev => [med, ...prev])
  }, [])

  const deleteMed = useCallback(async (id: number) => {
    await apiDeleteMed(id)
    setMeds(prev => prev.filter(m => m.id !== id))
  }, [])

  const toggleMed = useCallback(async (id: number) => {
    const med = meds.find(m => m.id === id)
    if (!med) return
    await apiToggleMed(id, !med.enabled)
    setMeds(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }, [meds])

  return (
    <DataContext.Provider value={{
      feelings, symptoms, notes, meds, isLoading, refresh,
      addFeeling, addSymptoms, addNote, addMed, deleteMed, toggleMed,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
