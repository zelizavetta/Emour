import { getOrCreateInstallationId } from '@/src/storage/installation';
import { saveAccessToken } from '@/src/storage/tokens';

const API_URL = 'http://YOUR_SERVER_IP:3001/api';

export async function authByDevice() {
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