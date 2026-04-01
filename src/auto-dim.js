// --- Configuration ---
const config = {
  clientId: process.env.SMARTHQ_CLIENT_ID,
  clientSecret: process.env.SMARTHQ_CLIENT_SECRET,
  refreshToken: process.env.SMARTHQ_REFRESH_TOKEN,
  deviceId: process.env.SMARTHQ_DEVICE_ID,
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

  if (!data.access_token) throw new Error('No access token in response');

  return data.access_token;
}

async function findRefrigerator(accessToken) {
  console.log('--- Searching for Refrigerator ---');

  const response = await fetch(`${API_HOST}/v2/device`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error(`Device list failed: ${await response.text()}`);

  const data = await response.json();

  if (!data.devices || data.devices.length === 0) {
    console.warn('Success, but 0 devices found.');
    console.log('Tip: Ensure your Developer App has "device:read" permissions and you clicked "Authorize" during login.');
    console.log('Tip: Ensure you\'ve registered at least one device in the SmartHQ app and that it\'s online.');
    return;
  }

  const fridge = data.devices.find(d =>
    d.deviceType.toLowerCase().includes('refrigerator')
  );

  if (!fridge) {
    console.log('❌ No refrigerator found in the device list.');
    console.log('Available device types in your account:', data.devices.map(d => d.deviceType));
    return;
  }

  console.log('✅ Refrigerator Found!');
  console.log(`Nickname:  ${fridge.nickname}`);
  console.log(`Model:     ${fridge.model}`);
  console.log(`Device ID: ${fridge.deviceId}`);
  console.log('\nCopy the Device ID above for your automation script.');
  return fridge.deviceId;
}

/**
 * Sets the fridge brightness
 * @param {number} value - 0 to 100
 */
async function setFridgeBrightness(value) {
  try {
    const token = await getAccessToken();

    if (!config.deviceId) {
      console.log('SMARTHQ_DEVICE_ID not set. Attempting to auto-discover refrigerator...');
      console.log('TIP: Manually set in the config to skip discovery in the future.');
      config.deviceId = await findRefrigerator(token);
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 1. Discovery: Get device details to find the specific serviceDeviceType
    const deviceRes = await fetch(`${API_HOST}/v2/device/${config.deviceId}`, { headers });
    const deviceData = await deviceRes.json();

    if (!deviceData.services) {
      console.error('No services found for this device. Cannot proceed.');
      return;
    }

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
// Run manually: node auto-dim.js 10
const targetBrightness = Number(process.argv[2] ?? 100);
setFridgeBrightness(targetBrightness);
