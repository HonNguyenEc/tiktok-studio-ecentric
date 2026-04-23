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

- `npm run dev` (run frontend with Vite)
- `npm run dev:vercel` (run frontend + `/api/*` Vercel functions locally)
- `npm run dev:server` (legacy Socket.IO server, no longer required for Vercel-only flow)
- `npm run dev:tiktok` (run `vercel dev` + realtime Socket.IO TikTok bridge together)
- `npm start` (production server for Render: snapshot API + Socket.IO)
- `npm run lint`
- `npm run build`
- `npm run preview`

## TikTok Live Integration (Vercel API + polling + realtime socket)

Project now includes TikTok live snapshot pipeline for **Vercel-only deployment**:

- API route: `api/tiktok/live-snapshot.js` (`tiktok-live-connector`)
- Frontend polling: `src/modules/studio-page/hook/use-session-lifecycle.hook.ts`
- Realtime comments/likes/viewers/gifts bridge: `server/index.js` (Socket.IO)

Polled metrics supported:

- connection status
- viewer count
- total likes (when TikTok returns stats)

### Quick start (under 5 minutes)

1. Install dependencies

```bash
npm install
```

2. Create local env from example

```bash
copy .env.example .env
```

3. Start app for TikTok local dev

```bash
npm run dev:tiktok
```

4. Open `http://localhost:5173`, login, switch to **Tiktok**.
5. In TikTok connection panel, enter **TikTok username** and click **Connect**.

> Notes:
>
> - `npm run dev` starts Vite only.
> - For TikTok polling endpoint (`/api/tiktok/live-snapshot`), this repo proxies `/api/tiktok/*` to local `vercel dev` (default `http://localhost:3000`).
> - For realtime comments, run Socket.IO bridge (`server/index.js`) on port `3001` (included in `npm run dev:tiktok`).

### Environment variables

- `VITE_TIKTOK_POLL_ENDPOINT` default: `/api/tiktok/live-snapshot`
- `VITE_TIKTOK_POLL_INTERVAL_MS` default: `7000`
- `VITE_TIKTOK_SOCKET_URL` default: `http://localhost:3001`

### Deploy notes (Render + Vercel)

For production, do **not** run `vercel dev` on Render.

- Render should run backend only (Express + Socket.IO):
  - Build Command: `yarn install && yarn build`
  - Start Command: `yarn start`
- Render env:
  - `CLIENT_ORIGIN=https://<your-vercel-domain>` (or comma-separated origins)
- Vercel frontend env:
  - `VITE_TIKTOK_POLL_ENDPOINT=https://<your-render-domain>/api/tiktok/live-snapshot`
  - `VITE_TIKTOK_SOCKET_URL=https://<your-render-domain>`

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
