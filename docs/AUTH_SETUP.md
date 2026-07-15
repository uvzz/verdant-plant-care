# Sign-in & Cloud Sync — Setup Guide (Apple + Google)

Enable **Sign in with Apple** and **Sign in with Google** for Verdant's optional
cloud backup/sync. The app code is done; this covers the account-level steps
only the owner can do. Do them in order — the logins need a real (EAS) build,
so **Task 0 comes first**.

Facts this guide is built on (from the repo):

| Thing | Value |
|-------|-------|
| iOS bundle id | `com.verdant.plantcare` |
| Android package | `com.verdant.plantcare` |
| App URL scheme | `verdant` |
| Worker | `verdant-ai` → `https://verdant-ai.nebulatv.workers.dev` |
| Worker Apple audiences (default) | `com.verdant.plantcare`, `host.exp.Exponent` — **already correct**, no action |
| Worker Google audiences (default) | *(empty — must be set, Task 2)* |

Status: `SYNC_DERIVE_SECRET` is already set on the Worker. ✅

---

## How sign-in works (context)

The app gets a signed identity token from Apple/Google, sends it to the Worker
(`POST /v1/auth/login`), which verifies it against the provider's public keys
and returns a **deterministic sync id** (`HMAC(provider:subject, SYNC_DERIVE_SECRET)`).
Same account on any device → same cloud collection. The raw token is never
stored; only `{provider, email, syncId}`.

---

## Task 0 — EAS build (do first)

Sign in with Apple / Google can't be exercised in Expo Go — they need the app's
own entitlement + client config, which only a real build has.

```bash
npm i -g eas-cli          # or use `npx eas-cli@latest`
eas login                 # your Expo account
cd ~/Documents/verdant-plant-care
eas init                  # creates the Expo project; writes a real projectId
```

`eas init` replaces the `extra.eas.projectId` placeholder in `app.json`
(currently `replace-after-eas-init`). **Commit that change.**

Then build a dev client to test on a device:

```bash
eas build --profile development --platform ios       # or: --platform android
```

- iOS build will prompt you to sign into your **Apple Developer account** and
  will **auto-manage** the App ID, provisioning, and the *Sign in with Apple*
  capability. You need an active **Apple Developer Program** membership
  ($99/yr) for device/TestFlight/App Store builds.
- Install the finished build on your device (EAS gives a QR/link), then open
  **Settings → Backup & sync** to see the native sign-in buttons.

---

## Task 1 — Sign in with Apple

Almost turnkey — most of it is already configured.

Already done in the repo:
- `app.json` → `ios.usesAppleSignIn: true` + the `expo-apple-authentication`
  plugin (adds the entitlement at build time).
- The Worker already trusts the `com.verdant.plantcare` audience.

What you do:
1. Nothing in code. During `eas build` (Task 0), let EAS enable the
   *Sign in with Apple* capability on the App ID when prompted (it does this
   automatically with managed credentials).
2. (Only if you ever change the bundle id) set the Worker's allowed audiences:
   ```bash
   cd workers/verdant-ai
   npx wrangler secret put APPLE_AUDIENCES   # e.g. "com.verdant.plantcare"
   npx wrangler deploy
   ```

Test: dev build → Settings → Backup & sync → **Sign in with Apple**. On the iOS
Simulator the button also needs an Apple Account signed into the sim.

---

## Task 2 — Sign in with Google

### 2a. Create the OAuth clients (Google Cloud Console)

1. Go to <https://console.cloud.google.com> → create/select a project (e.g. "Verdant").
2. **APIs & Services → OAuth consent screen**: choose **External**, app name
   *Verdant*, your support email, add scopes `.../auth/userinfo.email` and
   `openid`. Add yourself as a test user (or publish the app).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** —
   create **three**:
   - **Web application** — the app uses this in Expo Go, and it's a valid
     server-side audience. Under *Authorized redirect URIs* add the Expo proxy:
     `https://auth.expo.io/@<your-expo-username>/verdant-plant-care`.
   - **iOS** — bundle id `com.verdant.plantcare`.
   - **Android** — package `com.verdant.plantcare` + your signing **SHA-1**.
     Get it from EAS: `eas credentials` → Android → view the SHA-1 of the
     build keystore.

Each client id looks like `1234-abc.apps.googleusercontent.com`.

### 2b. Give the client ids to the app

All are `EXPO_PUBLIC_` (safe to inline; they're public identifiers, not secrets).
The Google button stays hidden until at least one is set.

- **Local Expo Go dev** — add to `.env` (gitignored):
  ```
  EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web>.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios>.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android>.apps.googleusercontent.com
  ```
- **EAS builds** — add the same three keys to each profile's `env` block in
  `eas.json` (development / preview / production), or set them as EAS secrets
  (`eas env:create`). Values are not sensitive.

### 2c. Tell the Worker which Google tokens to trust

The Worker rejects Google sign-in until `GOOGLE_AUDIENCES` lists the client ids
whose id_tokens it should accept (comma-separated, include all three):

```bash
cd workers/verdant-ai
npx wrangler secret put GOOGLE_AUDIENCES
# paste: <web>.apps.googleusercontent.com,<ios>....,<android>....
npx wrangler deploy
```

Test: dev build (or Expo Go with the web client id) → Settings → Backup & sync →
**Continue with Google**. Until `GOOGLE_AUDIENCES` is set the server returns
`Google sign-in not configured on server`.

---

## Quick server-side check (no build needed)

```bash
TOKEN=$(grep EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN .env | cut -d= -f2)
curl -sS -X POST https://verdant-ai.nebulatv.workers.dev/v1/auth/login \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"provider":"google","identityToken":"x"}'
# bad token → clear 4xx error; missing premium → 403; before GOOGLE_AUDIENCES → "not configured"
```

---

## Order of operations (summary)

1. `eas login` → `eas init` → commit the projectId → `eas build --profile development`.
2. Apple: let EAS enable the capability during the build. Done.
3. Google: create 3 OAuth clients → put ids in `.env` + `eas.json` → set Worker
   `GOOGLE_AUDIENCES` → `wrangler deploy`.
4. Install the dev build, open Settings → Backup & sync, test both buttons.
