# SmartHQ - Auto Dim Lights

Automatically control the interior light brightness on a GE fridge based on a schedule using the SmartHQ Developer API.

## Setup

### 1. Create a SmartHQ Developer Account

1. Go to <https://docs.smarthq.com/get-started/>
2. Create an account
3. Create an app
   * Set the redirect URI to `http://localhost:8080`
   * Save your client ID and secret

### 2. Complete OAuth Handshake (one-time)

1. Replace the placeholder with your client ID from Step 1:

   ```none
   https://accounts.brillion.geappliances.com/oauth2/auth?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080&access_type=offline
   ```

2. Paste that URL into your browser.

3. Log in with your SmartHQ end-user credentials.

4. Authorize the app.

5. Your browser will redirect to a "Page Not Found" at `localhost:8080` — this is expected. Copy the `code` parameter from the URL bar:

   ```none
   http://localhost:8080/?code=SOME_LONG_AUTH_CODE&expires_in=600
   ```

6. **Copy that code.** You have 10 minutes to use it.

## 3. Exchange Auth Code for Token

1. Pass the `code` from the redirect URL as an argument:

   ```bash
   npm run auth -- <auth_code>
   ```

2. On success it prints your `access_token` (short-lived) and `refresh_token` (long-lived).
3. Save the `refresh_token` — you'll need it in the next step.

## 4. Set Up Environment Variables

### Local

Create an `.env` file and fill in your credentials:

```ini
SMARTHQ_CLIENT_ID=your_client_id
SMARTHQ_CLIENT_SECRET=your_client_secret
SMARTHQ_REFRESH_TOKEN=your_refresh_token
# SMARTHQ_DEVICE_ID=cached_device_id (optional, see below)
```

### GitHub Actions

1. Go to your repository's **Settings > Secrets and variables > Actions**

   e.g. <https://github.com/KyleMit/smart-hq-auto-dim-lights/settings/secrets/actions>

2. Add a repository secret for each variable listed in the Local setup above.

## 5. Run

### Local

Run `npm run dim` to send a brightness command to the configured device. Accepts a value (0–100) as an argument; defaults to `100` if omitted.

```bash
npm run dim          # set to 100%
npm run dim -- 0     # turn off
npm run dim -- 50    # set to 50%
```

The script automatically exchanges the saved refresh token for a fresh access token on each run.

### GitHub Actions

1. Go to your repository's **Actions** tab

   e.g. <https://github.com/KyleMit/smart-hq-auto-dim-lights/actions>

2. Select the **Auto Dim Fridge Lights** workflow.

3. Click **Run workflow** to trigger it manually.

---

## Dimming Schedule

The workflow in `.github/workflows/dim-lights.yml` runs automatically throughout the day (all times ET):

| Time | Brightness |
|------|------------|
| 6am  | 50%        |
| 7am  | 100%       |
| 7pm  | 50%        |
| 8pm  | 0%         |

## Cache Device ID

If you only have a single fridge, you can skip the device discovery lookup on each run by saving the device ID to your environment variables:

```ini
SMARTHQ_DEVICE_ID=your_device_id
```
