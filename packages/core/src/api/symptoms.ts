import { get, post, patch, del } from './api.js';
import { ApiResponse } from '../types/api.js';
import { Symptom } from '../types/symptoms.js';


export async function apiGetAllSymptomRecords(): Promise<Symptom[]> {
    const response = await get<ApiResponse<Symptom[]>>(`/api/symptoms/all`)
    return response.data
}

export async function apiCreateSympomRecords(symptoms: string[], createdAtClient: string): Promise<Symptom[]> {
    const response = await post<ApiResponse<Symptom[]>>(`/api/symptoms`, { symptoms, createdAtClient })
    return response.data
}