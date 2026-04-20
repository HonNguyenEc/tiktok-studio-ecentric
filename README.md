# Ecentric AI Studio

Dashboard manage AI live studio with third platform.

## Architecture Rules (Required)

This project uses strict **pages ↔ modules mirror** architecture.

- `pages/*` contains only `index.tsx`
- `modules/*` contains page implementations (`component/hook/util/interface`)
- `common/route/*` contains all route groups + `index.route.tsx`
- Shared logic only in `common/*`

Full rulebook: **`docs/architecture-rules.md`**

## Scripts

- `npm run dev` (run frontend + TikTok realtime backend together)
- `npm run lint`
- `npm run build`
- `npm run preview`

## TikTok Realtime Integration (inside existing TikTok section)

Project now includes realtime TikTok livestream data pipeline:

- Backend: `server/index.js` (Express + Socket.IO + `tiktok-live-connector`)
- Frontend: integrated directly into the current TikTok UI flow

Realtime events supported:

- `chat` → comment stream
- `like` → total likes
- `roomUser` → viewer count
- `gift` → gift popup notification

### Quick start (under 5 minutes)

1. Install dependencies

```bash
npm install
```

2. Create local env from example

```bash
copy .env.example .env
```

3. Start app

```bash
npm run dev
```

4. Open `http://localhost:5173`, login, switch to **Tiktok**.
5. In TikTok connection panel, enter **TikTok username** and click **Connect**.

### Environment variables

- `VITE_TIKTOK_SOCKET_URL` default: `http://localhost:3001`
- `SERVER_PORT` default: `3001`
- `CLIENT_ORIGIN` default: `http://localhost:5173`

## Environment

Current default flow runs in ** Mode** and does not require real marketplace credentials.

You can still keep `.env` for local configuration, but this should not use real partner/shop/customer data.

### OBS Local (WebSocket)

To control OBS locally from this app:

- Enable OBS WebSocket in OBS (Tools → WebSocket Server Settings)
- Set `.env` values:
  - `VITE_OBS_WS_URL=ws://127.0.0.1:4455`
  - `VITE_OBS_WS_PASSWORD=<your_password>`

The app now supports platform-scoped OBS control (Shopee/Tiktok), with isolated session persistence keys:

- `live_session_shopee`
- `live_session_tiktok`

and isolated OBS config keys:

- `obs_config_shopee`
- `obs_config_tiktok`

## Platform Isolation & Ops Safeguards

- Session lifecycle state is separated by platform (Shopee does not mutate Tiktok state, and vice versa).
- OBS command execution is queued per platform to avoid race conditions.
- Start/End actions include cooldown guard and structured logs (`platform`, `result`, `errorCode`, `requestId`).
- End Stream action requires explicit confirmation.

## Local Verification Checklist

1. Open app and login.
2. Select **Shopee**, connect OBS, create/start/end session.
3. Switch to **Tiktok**, verify session and OBS form values are independent.
4. Confirm **Shopee actions do not change Tiktok session state**.
5. Reload page and verify each platform restores its own saved session/config.
6. Negative checks:
   - wrong OBS password
   - OBS closed
   - invalid OBS endpoint
   Ensure error log includes platform + error code.

## API Review Readiness (Recommended Pack)

Before requesting real platform API permissions, prepare:

- Privacy Policy / Terms / Data Deletion URL
- Feature-to-scope mapping document (least privilege)
- Security note (token storage/rotation/revoke, audit logs)
- script/video for reviewer (authorize → use feature → revoke)

## Scope & Safety

- This project is a UI/UX + workflow prototype with **mock behavior only**.
- Shopee and TikTok are now separated in logic (profile, stream URL pattern, comment cadence, metrics behavior).
- No production API call is required in the default flow.
- Do not place real credentials or personal/customer information in this repository.
