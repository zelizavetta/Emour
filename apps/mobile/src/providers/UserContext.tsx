import { 
    apiCreateFeelingRecord, 
    apiGetAllFeelingRecord, 
    FeelingType, 
    Feeling, 
    UserContextType,
    Symptom,
    apiCreateSympomRecords,
    apiGetAllSymptomRecords
 } from '@emour/core';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [feelings, setFeelings] = useState<Feeling[]>([])
    const [symptoms, setSymptoms] = useState<Symptom[]>([])

    useEffect(() => {
        (async () => {
            try {
                const [ feelings, symptoms ] = await Promise.all([apiGetAllFeelingRecord(), apiGetAllSymptomRecords()])
                // console.log(feelings)
                setFeelings(feelings)
                setSymptoms(symptoms)
            } catch (err) {
                console.warn('records load error', err)
            }
        })()
    }, [])

    const addFeelingRecord = useCallback(async(
        feelingType: FeelingType, 
        score: number, 
        createdAtClient: string
    ): Promise<Feeling | null> => {
        try {
            const record = await apiCreateFeelingRecord(feelingType, score, createdAtClient)
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
        createdAtClient: string
    ): Promise<Symptom[] | null> => {
        try {
            const record = await addSymptomsRecord(symptoms, createdAtClient)
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

    const contextValue: UserContextType = {
        feelings,
        symptoms,
        addFeelingRecord,
        addSymptomsRecord
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