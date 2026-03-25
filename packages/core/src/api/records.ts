import { get, post, patch, del } from './api';
import { ApiResponse } from '../types/api';
import { CreateFeelingRecordReq, CreateFeelingRecordRes, Feeling } from '../types/records';


export async function apiCreateFeelingRecord({ feelingType, score, createdAtClient }: CreateFeelingRecordReq): Promise<Feeling> {
  const response = await post<ApiResponse<Feeling>>('/api/checks');
  return response.data;
}

export async function apiGetAllFeelingRecord(): Promise<Feeling[]> {
  const response = await get<ApiResponse<Feeling[]>>('/api/checks/all');
  return response.data;
}