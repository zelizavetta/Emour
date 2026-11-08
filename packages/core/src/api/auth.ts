import { post } from './api.js';
import { ApiResponse } from '../types/api.js';
import { AuthTokens } from '../types/auth.js';

export async function apiLogin(email: string, password: string): Promise<AuthTokens> {
  const response = await post<ApiResponse<AuthTokens>>('/api/auth/login', { email, password });
  return response.data;
}

export async function apiRegister(email: string, password: string): Promise<AuthTokens> {
  const response = await post<ApiResponse<AuthTokens>>('/api/auth/register', { email, password });
  return response.data;
}
