# S04: restrict outbound push destinations

Updated 2 November 2026. The fix is implemented locally. Main-app deployment and real-browser notification checks remain outstanding; S04 is not yet closed in production.

## Changes

New subscriptions accept only HTTPS endpoints on port 443 belonging to the supported push services:

| Provider | Allowed hostname |
| --- | --- |
| Google/FCM | `fcm.googleapis.com` |
| Mozilla | `updates.push.services.mozilla.com` |
| Apple | Subdomains of `push.apple.com` |
| Microsoft/WNS | Subdomains of `notify.windows.com` |

The policy rejects URL credentials, fragments, custom ports, whitespace/control characters, backslashes, IP literals, localhost and unrelated or lookalike domains. It checks the raw string before URL normalization. Provider paths and query strings remain opaque so browser-issued subscription tokens are preserved.

Delivery rechecks each stored endpoint too. Historical endpoints outside the policy are blocked before any network request and are revoked through the existing subscription cleanup path. Removal and status operations still accept historical URL values, so an unsupported device can turn notifications off.

The connection's HTTPS agent resolves the approved hostname and rejects the whole result if any address is private, loopback, link-local, multicast, reserved, a translation/transition address or otherwise outside global unicast space. A pinned `ipaddr.js` dependency classifies IP ranges. The exact checked address list is handed to the socket; there is no second unchecked DNS lookup. Each delivery uses a new agent, with certificate and hostname verification retained and TLS 1.2 or newer required.

`web-push` still creates the encrypted body and VAPID signature. A small Node HTTPS transport sends that request with:

- No redirect following or caller-supplied proxy options.
- A ten-second total request deadline, including DNS, connection, TLS and response processing.
- A five-second socket inactivity timeout.
- Eight-KiB limits on response headers and body. Provider response bodies are discarded rather than copied into errors or logs.
- Five concurrent deliveries per batch, while retaining expired-subscription cleanup and per-device failure isolation.

Registration is limited to ten active devices per account. Registration uses a PostgreSQL transaction at READ COMMITTED isolation and a per-user transaction advisory lock. The count happens after acquiring the lock, in a fresh statement, so different app instances serialize registrations for the same account. Refreshing an existing endpoint at the cap is allowed; revoking a device frees its slot. Existing endpoint ownership checks remain enforced. The quota applies through this application data layer; the private subscription table remains unavailable to browser database roles.

## Verification

Automated coverage includes supported provider URLs, private IPv4/IPv6 and encoded address forms, metadata addresses, hostile host suffixes, credentials, ports, fragments and parser-normalization tricks. Socket tests cover mixed public/private DNS answers, changing DNS answers, single/all-address callbacks and passing the exact checked addresses to the connection.

Transport tests use real disposable encryption/VAPID keys and a mocked HTTPS request. They check encrypted requests, rejected historical endpoints, redirects, provider errors, idle timeouts, total cancellation, oversized responses and agent cleanup. No test connects to a private destination or sends a real notification.

Postgres integration tests run the actual registration function against synthetic users and subscriptions inside outer rollback transactions. They verify the ten-device cap, refresh at the cap, freed slots, account ownership and the transaction lock blocking a second database connection. The test adapter traps application commits inside savepoints, so fixtures are never committed. A separate hosted check found zero remaining S04 fixture users and confirmed `anon`/`authenticated` lack schema usage, SELECT and INSERT on the private subscription table.

Validation passed for 109 offline push tests and three hosted Postgres integration cases. The final full push-suite run used one worker thread after a forked JSDOM worker hit a startup timeout during concurrent build/check activity; the complete suite passed on retry. The extra DNS-deadline regression also passed separately. Type checking, focused ESLint and the final production build passed. Verification logs are under `tmp/security-audit-2026-10-30/s04-*`.

No Supabase migration is required. No existing customer subscriptions, endpoint tokens or push encryption keys were retrieved or changed during verification.

## Remaining rollout

1. Deploy the main app with the updated lockfile and server transport. This is an application change; hosted delivery still uses the old code until deployment.
2. Use the existing test workbook to enable notifications and receive a test message on Chrome/Chromium, Firefox, Safari/iOS installed web apps, and Edge where those are supported. Check that expiry cleanup and disabling notifications still work. Automated transport tests do not establish actual browser delivery.
3. Exercise device registration limits and refresh, and check the deployed logs for provider failures without printing subscription URLs or keys. New browser push-provider domains require a reviewed policy update.
4. Review host-level egress rules as defense in depth: restrict push traffic to the supported services and retain blocks on internal/metadata destinations. Host firewall configuration was not accessed from this workspace. The application independently validates and pins public destination addresses.
5. Close S04 after deployment and the real-browser checks pass.

References: [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [web-push request generation](https://github.com/web-push-libs/web-push#generaterequestdetailspushsubscription-payload-options), [ipaddr.js](https://github.com/whitequark/ipaddr.js), [Google push endpoints](https://developer.chrome.com/blog/push-notifications-on-the-open-web), [Mozilla push endpoints](https://blog.mozilla.org/services/2016/08/23/sending-VAPID-identified-WebPush-notifications-via-mozillas-push-service/), [Apple Web Push server requirements](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers), and [WNS sender domains](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/push-notifications/firewall-allowlist-config).
