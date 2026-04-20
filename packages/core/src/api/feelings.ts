import { get, post, patch, del } from './api.js';
import { ApiResponse } from '../types/api.js';
import { CreateFeelingRecordReq, CreateFeelingRecordRes, Feeling, FeelingType } from '../types/feelings.js';


export async function apiCreateFeelingRecord(
    feelingType: FeelingType, 
    score: number, 
    createdAtClient: string,
    clientTimezone: string
  ): Promise<Feeling> {
  const response = await post<ApiResponse<Feeling>>('/api/feelings', { feelingType, score, createdAtClient, clientTimezone });
  return response.data;
}

export async function apiGetAllFeelingRecord(): Promise<Feeling[]> {
  const response = await get<ApiResponse<Feeling[]>>('/api/feelings/all');
  return response.data;
}