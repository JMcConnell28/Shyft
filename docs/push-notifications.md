# Web Push notifications

RocketRota uses the standard Web Push API, the existing `/sw.js` service worker, VAPID, and the server-only `push_private.push_subscriptions` table.

## Environment

Generate one key pair and keep it stable:

```bash
npx web-push generate-vapid-keys --json
```

Configure these values in Coolify for the app service:

```text
VAPID_PUBLIC_KEY=<same public key>
VAPID_PRIVATE_KEY=<private key>
VAPID_SUBJECT=https://rocketrota.com
PUSH_TESTING_ENABLED=true
```

The public key is returned to authenticated clients by a server function when they enable notifications. The subject is a push-provider contact URI, not an email sender. Change it to a monitored `mailto:` address later if desired, but do not rotate the key pair.

Apply `supabase/migrations/20260711202136_push_subscriptions.sql` to the hosted database. The table is in an unexposed private schema and has no browser grants.

## Android test

1. Open the deployed HTTPS app in Chrome and sign in.
2. Open Account → Preferences and find Push notifications.
3. Turn on Notifications on this device and accept the browser prompt.
4. Send a test using the operator CLI below.
5. Background or close the PWA and send another CLI test.
6. Tap it and verify RocketRota opens `/dashboard`.

## iPhone and iPad test

1. Open RocketRota in Safari over HTTPS.
2. Use Share → Add to Home Screen.
3. Open RocketRota from its Home Screen icon and sign in.
4. Open Account → Preferences, enable notifications, and accept the prompt.
5. Send a CLI test, then background the app and send another test.
6. Tap it and verify RocketRota opens the expected internal route.

## Edge cases

- Permission denied: re-enable notifications in OS/browser settings; the app cannot bypass this.
- Unsubscribe: turn off Notifications on this device; this revokes the server row and removes the browser subscription.
- Multiple devices: enable each device separately. Each endpoint is stored once and all active devices receive user-targeted pushes.
- Expired endpoint: HTTP 404 and 410 responses automatically revoke the stored subscription.
- Existing window: tapping a notification focuses an existing RocketRota window and navigates it to the safe internal path.
- VAPID key rotation: an existing browser subscription using a different public key is replaced during the next explicit enable flow.

Rota publication sends only a privacy-conscious “New rota published” message after the database operation succeeds. Email and push delivery failures do not roll back the publication.

## Forced tests

- **CLI user test:** `npm run push:test -- --user <better-auth-user-id>` from a server environment containing the database and VAPID variables.

The account preferences page exposes only the device toggle. Server-side test actions remain available for future diagnostic interfaces; they require `PUSH_TESTING_ENABLED=true` and are rate-limited per user. The CLI is an operator-only server command and never exposes subscription details.

## Announcement notifications

Apply `supabase/migrations/20261001203130_account_notification_preferences.sql` before deploying this feature. Preferences are stored in the server-only `account_private.user_preferences` table.

New announcements send their title and a preview of their contents after their transaction commits. The preview collapses whitespace and truncates text over 240 characters with an ellipsis; tapping opens the announcements page to read the full message. Recipients match announcement visibility: organisation administrators, relevant location managers, and active staff with enabled location assignments. The author is excluded. Edits, polls, pins and archives do not send additional pushes. Delivery failures are logged and do not undo creation.

Account → Preferences → Announcement notifications defaults to on, including accounts without a saved preference. Turning it off stops announcement pushes across every subscribed device without changing other notification types. Users still need to enable push notifications and grant permission on each device.
