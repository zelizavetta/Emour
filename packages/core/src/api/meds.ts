import { get, post, patch, del } from './api.js';
import { ApiResponse } from '../types/api.js';
import { Med } from '../types/meds.js';

export async function apiGetAllMeds(): Promise<Med[]> {
  const response = await get<ApiResponse<Med[]>>('/api/meds/all');
  return response.data;
}

export async function apiCreateMed(
  name: string,
  dosage: string,
  times: string[],
  createdAtClient: string,
  clientTimezone: string,
): Promise<Med> {
  const response = await post<ApiResponse<Med>>('/api/meds', {
    name,
    dosage,
    times,
    createdAtClient,
    clientTimezone,
  });
  return response.data;
}

export async function apiToggleMed(medId: number, enabled: boolean): Promise<void> {
  await patch(`/api/meds/${medId}/enabled`, { enabled });
}

export async function apiDeleteMed(medId: number): Promise<void> {
  await del(`/api/meds/${medId}`);
}
