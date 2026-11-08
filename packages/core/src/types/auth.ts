export type UserRole = 'owner' | 'viewer';

export interface AuthTokens {
  token: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
