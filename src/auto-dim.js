// --- Configuration ---
const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  refreshToken: 'YOUR_SAVED_REFRESH_TOKEN',
  deviceId: 'YOUR_DEVICE_ID', // Optional: script can auto-discover if left blank
};

const AUTH_HOST = 'https://accounts.brillion.geappliances.com';
const API_HOST = 'https://client.mysmarthq.com';

/**
 * Exchanges the Refresh Token for a fresh Access Token
 */
async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(`${AUTH_HOST}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) throw new Error(`Auth Refresh Failed: ${await response.text()}`);
  const data = await response.json();
  return data.access_token;
}

/**
 * Sets the fridge brightness
 * @param {number} value - 0 to 100
 */
async function setFridgeBrightness(value) {
  try {
    const token = await getAccessToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 1. Discovery: Get device details to find the specific serviceDeviceType
    const deviceUri = `${API_HOST}/v2/device/${config.deviceId}`;
    const deviceRes = await fetch(deviceUri, { headers });
    const deviceData = await deviceRes.json();

    const brightnessService = deviceData.services.find(
      (s) => s.domainType === 'cloud.smarthq.domain.brightness.light'
    );

    if (!brightnessService) {
      console.error('Brightness service not found on this device.');
      return;
    }

    // 2. Command: Construct the payload
    const commandBody = {
      kind: 'service#command',
      deviceId: config.deviceId,
      serviceType: 'cloud.smarthq.service.integer',
      domainType: 'cloud.smarthq.domain.brightness.light',
      serviceDeviceType: brightnessService.serviceDeviceType,
      command: {
        commandType: 'cloud.smarthq.command.integer.set',
        value: Math.floor(value),
      },
    };

    // 3. Execution
    const commandRes = await fetch(`${API_HOST}/v2/command`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commandBody),
    });

    const result = await commandRes.json();
    if (result.success) {
      console.log(`Successfully set brightness to ${value}% (ID: ${result.correlationId})`);
    } else {
      console.warn('Command failed:', result);
    }
  } catch (error) {
    console.error('Execution error:', error.message);
  }
}

// --- Execution Logic ---
// Run manually: node fridge.js 10
const targetBrightness = process.argv[2] || 100;
setFridgeBrightness(targetBrightness);
