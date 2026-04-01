# SmartHQ - Auto Dim Lights

Automatically control the backlight on a GE fridge based on a schedule using the Developer API

## Setup

### 1. Smart HQ Dev Account

1. Go to <https://docs.smarthq.com/get-started/>
2. Create an account
3. Create an app
   * Set the callback url to `http://localhost:8080`
   * Take note of the client id and secret

### 2. Complete OAuth Handshake (one-time)

1. Replace the placeholders with your credentials from Step 1:

   ```none
   https://accounts.brillion.geappliances.com/oauth2/auth?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080&access_type=offline
   ```

2. Paste that URL into your browser.

3. Log in with your SmartHQ end-user credentials.

4. Authorize the app.

5. Your browser will redirect to a "Page Not Found" at localhost:8080, but look at the URL bar. It will look like this:

   ```none
   http://localhost:8080/?code=SOME_LONG_AUTH_CODE&expires_in=600
   ```

6. **Copy that code**. You have 10 minutes to use it.

## 3. Exchange auth code for tokens

1. Run this **once** after completing the OAuth2 browser flow. Pass the `code` from the redirect URL as an argument.

   ```bash
   npm run auth -- <auth_code>
   ```

2. On success it prints your `access_token` (temporary) and `refresh_token` (permanent).
3. Take note of the `refresh_token`.  This will last a long time

## 4. Setup environment variables

### Local Setup

Create `.env` file and fill in your credentials:

```ini
SMARTHQ_CLIENT_ID=your_client_id
SMARTHQ_CLIENT_SECRET=your_client_secret
SMARTHQ_REFRESH_TOKEN=your_refresh_token
# SMARTHQ_DEVICE_ID=cached_device_id (optional caching layer)
```

### Github Actions Setup

1. Go to your repository
2. Settings > Secrets and variables > actions

   i.e. <https://github.com/KyleMit/smart-hq-auto-dim-lights/settings/secrets/actions>

3. Create a repository secret for each of the environment variables in the local setup

## 5. Run Code

### Run Locally

1. Run with `npm run dim` to send a brightness command to the configured device.

   Accepts a brightness value (0–100) as an argument. Defaults to `100` if omitted.

   ```bash
   npm run dim          # set to 100%
   npm run dim -- 0     # turn off
   npm run dim -- 50    # set to 50%
   ```

2. The script automatically exchanges the saved refresh token for a fresh access token on each run.

### Run on Github Actions

1. Go to your repository > Actions

   i.e. <https://github.com/KyleMit/smart-hq-auto-dim-lights/actions>

2. Select the "Auto Dim Fridge Lights" workflow

3. Manually select "Run workflow" to kick off in Github

---

## Dimming Schedule

`.github/workflows/dim-lights.yml` runs on a schedule to automatically adjust brightness throughout the day (all times ET):

| Time | Brightness |
|------|------------|
| 6am  | 50%        |
| 7am  | 100%       |
| 7pm  | 50%        |
| 8pm  | 0%         |


## Cache Device Id

If you only have a single fridge, you can avoid the extra lookup by saving the device id in your environment variables

```ini
SMARTHQ_DEVICE_ID=cached_device_id
```

