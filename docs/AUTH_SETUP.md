# Sign-in & Cloud Sync — Setup

Verdant's cloud backup/sync (Premium) uses **Sign in with Apple** and
**Sign in with Google**. Both are wired in the app; this doc lists the
account-level steps only you can do to make them live in a real build.

Nothing here is needed to run the app offline — sign-in is optional.

## How it works (context)

The device sends the provider's signed identity token to the `verdant-ai`
Worker (`POST /v1/auth/login`). The Worker verifies it against Apple/Google
JWKS and returns a **deterministic sync id** (HMAC of `provider:subject`), so
the same account → the same cloud collection on every device. The raw token
is never stored; only `{provider, email, syncId}` are kept in SecureStore.

## 1. Worker secret — `SYNC_DERIVE_SECRET` (do this first)

The sync id is derived with an HMAC key. Until you set a dedicated secret it
falls back to `PREMIUM_ACCESS_TOKEN`, which means rotating that token would
change every user's sync id (they'd see an empty collection until re-sync).
Decouple them:

```bash
cd workers/verdant-ai
python3 -c "import secrets;print(secrets.token_hex(32))" | npx wrangler secret put SYNC_DERIVE_SECRET
npx wrangler deploy
```

Set it **once** and never change it (changing it re-keys all sync ids).

## 2. Sign in with Apple (iOS)

- Already configured in `app.json`: `ios.usesAppleSignIn: true` +
  `expo-apple-authentication` plugin (adds the entitlement at build time).
- The Worker accepts the app's bundle id (`com.verdant.plantcare`) and the
  Expo Go bundle id as audiences. To pin/override:
  ```bash
  npx wrangler secret put APPLE_AUDIENCES   # e.g. "com.verdant.plantcare"
  ```
- In **Expo Go** the button only appears when an Apple Account is signed into
  the simulator/device. In a **dev/EAS build** it uses the app's own
  entitlement. No Apple Developer portal step is required beyond having the
  bundle id in your team.

## 3. Sign in with Google

Create OAuth client ids in **Google Cloud Console → APIs & Services →
Credentials** for the project, then expose them to the app + Worker.

Create these OAuth 2.0 client ids:
- **Web application** — used by Expo Go and web.
- **iOS** — bundle id `com.verdant.plantcare`.
- **Android** — package `com.verdant.plantcare` + your signing SHA-1.

App env (`.env`, gitignored — all `EXPO_PUBLIC_` so they inline at build):
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android client id>.apps.googleusercontent.com
```
The Google button stays hidden until at least one of these is set
(`googleAuthConfig().configured`).

Worker — the audiences it will accept (comma-separated; include every client
id whose tokens should be honored):
```bash
cd workers/verdant-ai
npx wrangler secret put GOOGLE_AUDIENCES   # "<web>.apps.googleusercontent.com,<ios>...,<android>..."
npx wrangler deploy
```
Google sign-in returns `401 "Google sign-in not configured on server"` until
`GOOGLE_AUDIENCES` is set.

The app's URL scheme (`verdant`, in `app.json`) is already set for the OAuth
redirect.

## 4. Build to test

Apple/Google native sign-in needs a real build (Expo Go can't show custom
entitlements or the native Google flow reliably):

```bash
eas login          # your Expo account (only you can do this)
eas build --profile development --platform ios
```

## Quick verification (server side, no build)

```bash
TOKEN=$(grep EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN .env | cut -d= -f2)
# bad token → 401 with a clear reason; missing premium → 403
curl -sS -X POST https://verdant-ai.nebulatv.workers.dev/v1/auth/login \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"provider":"google","identityToken":"x"}'
```
