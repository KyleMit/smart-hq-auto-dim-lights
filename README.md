# smart-hq-auto-dim-lights
Automatically dim lights on GE Fridge using Developer APIs

## Setup

Create `.env`file and fill in your credentials:

```env
SMARTHQ_CLIENT_ID=your_client_id
SMARTHQ_CLIENT_SECRET=your_client_secret
SMARTHQ_REFRESH_TOKEN=your_refresh_token
SMARTHQ_DEVICE_ID=cached_device_id
```

## Scripts

### `npm run auth` — Exchange an Authorization Code for Tokens

Run this **once** after completing the OAuth2 browser flow. Pass the `code` from the redirect URL as an argument.

```bash
npm run auth -- <auth_code>
```

On success it prints your `access_token` and `refresh_token`. Save the `refresh_token` to your `.env` as `SMARTHQ_REFRESH_TOKEN`.

---

### `npm run dim` — Set Fridge Light Brightness

Sends a brightness command to the configured device. Accepts a brightness value (0–100) as an argument. Defaults to `100` if omitted.

```bash
npm run dim          # set to 100%
npm run dim -- 0     # turn off
npm run dim -- 50    # set to 50%
```

The script automatically exchanges the saved refresh token for a fresh access token on each run.

---

## GitHub Action — Scheduled Dimming

`.github/workflows/dim-lights.yml` runs on a schedule to automatically adjust brightness throughout the day (all times ET):

| Time | Brightness |
|------|------------|
| 6am  | 50%        |
| 7am  | 100%       |
| 7pm  | 50%        |
| 9pm  | 15%        |

The action can also be triggered manually from the Actions tab with a custom brightness value.

### Required Repository Secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `SMARTHQ_CLIENT_ID` | OAuth2 client ID |
| `SMARTHQ_CLIENT_SECRET` | OAuth2 client secret |
| `SMARTHQ_REFRESH_TOKEN` | Long-lived refresh token (from `npm run auth`) |
| `SMARTHQ_DEVICE_ID` | Device ID of the refrigerator |
