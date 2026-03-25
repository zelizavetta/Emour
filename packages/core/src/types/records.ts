export type FeelingType = {
    feelingType: 'mood' | 'anxiety' | 'energy'
}

export interface CreateFeelingRecordReq {
    feelingType: FeelingType
    score: number
    createdAtClient: string
}

export type DayPart = {
    dayPart: 'night' | 'morning' | 'afternoon' | 'evening'
}

export interface CreateFeelingRecordRes {
    id: number
    createdAtServer: string
    dayPart: DayPart
}

export interface Feeling {
    id: number
    feelingType: FeelingType
    score: number
    createdAtServer: string
    createdAtClient: string
    dayPart: DayPart
}

export interface RecordsContextType {
    feelings: Feeling[],
    addFeelingRecord: ({ feelingType, score, createdAtClient }: CreateFeelingRecordReq) => Promise<Feeling | null>
}