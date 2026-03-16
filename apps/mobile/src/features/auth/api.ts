import { config } from '@/constants/config';
import { getOrCreateInstallationId } from '@/services/storage/installation';
import { saveAccessToken } from '@/services/storage/tokens';


export async function authByDevice() {
  const API_URL = config.apiUrl;
  const installationId = await getOrCreateInstallationId();

  const res = await fetch(`${API_URL}/auth/device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      installationId,
      platform: 'android',
    }),
  });

  if (!res.ok) {
    throw new Error('Device auth failed');
  }

  const data = await res.json();

  await saveAccessToken(data.accessToken);

  return data;
}