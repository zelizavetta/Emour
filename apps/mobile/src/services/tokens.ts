import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'emour_access_token';
const ROLE_KEY = 'emour_user_role';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveRole(role: string): Promise<void> {
  await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function getRole(): Promise<string | null> {
  return SecureStore.getItemAsync(ROLE_KEY);
}

export async function removeRole(): Promise<void> {
  await SecureStore.deleteItemAsync(ROLE_KEY);
}
