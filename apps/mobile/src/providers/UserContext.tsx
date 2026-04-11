import { apiCreateFeelingRecord, apiGetAllFeelingRecord, FeelingType } from '@emour/core';
import { CreateFeelingRecordReq, Feeling, UserContextType } from '@emour/core';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [feelings, setFeelings] = useState<Feeling[]>([])

    useEffect(() => {
        (async () => {
            try {
                const [ feelings ] = await Promise.all([apiGetAllFeelingRecord()])
                // console.log(feelings)
                setFeelings(feelings)
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

    const contextValue: UserContextType = {
        feelings,
        addFeelingRecord
    }

    return (
        <UserContext.Provider value={contextValue}>
        {children}
        </UserContext.Provider>
    );
}

export function useFeelings() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useRecords must be used within a UserProvider');
  }
  return context;
}