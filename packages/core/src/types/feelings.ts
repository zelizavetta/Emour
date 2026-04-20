import { DayPart } from "./common.js"

export type FeelingType = 'mood' | 'anxiety' | 'energy'

export interface CreateFeelingRecordReq {
    feelingType: FeelingType
    score: number
    createdAtClient: string
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