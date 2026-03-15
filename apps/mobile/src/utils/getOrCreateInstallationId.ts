import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const INSTALLATION_ID_KEY = 'installation_id';

export async function getOrCreateInstallationId(): Promise<string> {
  let id = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);

  if (!id) {
    id = uuidv4();
    await SecureStore.setItemAsync(INSTALLATION_ID_KEY, id);
  }

  return id;
}