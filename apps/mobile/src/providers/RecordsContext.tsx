import { apiCreateFeelingRecord, apiGetAllFeelingRecord } from '@emour/core/index';
import { CreateFeelingRecordReq, Feeling, RecordsContextType } from '@emour/core/types/records';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';


const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export function RecordsProvider({ children }: { children: ReactNode }) {
    const [feelings, setFeelings] = useState<Feeling[]>([])

    useEffect(() => {
        (async () => {
            try {
                const [ feelings ] = await Promise.all([apiGetAllFeelingRecord()])
                setFeelings(feelings)
            } catch (err) {
                console.warn('records load error', err)
            }
        })()
    }, [])

    const addFeelingRecord = useCallback(async({ feelingType, score, createdAtClient }: CreateFeelingRecordReq): Promise<Feeling | null> => {
        try {
            const record = await apiCreateFeelingRecord({ feelingType, score, createdAtClient })
            if (record) {
                setFeelings(prev => [...prev, record])
            }
            return record
        } catch (err) {
            console.warn('add feeling record error', err)
            return null
        }
    }, [])

    const contextValue: RecordsContextType = {
        feelings,
        addFeelingRecord
    }

    return (
        <RecordsContext.Provider value={contextValue}>
        {children}
        </RecordsContext.Provider>
    );
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}