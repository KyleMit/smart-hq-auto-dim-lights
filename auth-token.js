/**
 * SmartHQ Initial OAuth2 Token Exchange
 * Run this once after getting your 'code' from the browser redirect.
 */

const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  authCode: 'THE_CODE_FROM_YOUR_BROWSER_URL',
  redirectUri: 'http://localhost:8080', // Must match the portal exactly
};

const TOKEN_URL = 'https://accounts.brillion.geappliances.com/oauth2/token';

async function exchangeCodeForTokens() {
  console.log('--- Initiating Token Exchange ---');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: config.authCode,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Exchange Failed:', data);
      return;
    }

    console.log('SUCCESS! Tokens received:\n');
    console.log('ACCESS_TOKEN (Expires in 1hr):');
    console.log(data.access_token);
    console.log('\nREFRESH_TOKEN (Save this for your automation):');
    console.log(data.refresh_token);
    console.log('\n--- End of Output ---');

  } catch (error) {
    console.error('Network or Parsing Error:', error.message);
  }
}

exchangeCodeForTokens();
