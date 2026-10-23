# Access and security remediation — 23 October 2026

This records the fixes for B01–B05, B07 and B08 in the
[beta review](../security_best_practices_report.md). Business/privacy completion,
backup/restore, incident handling and other launch gates remain separate.

## Changes

| Finding | Resolution | Hosted status |
| --- | --- | --- |
| B01: dependencies | TanStack's previous patch retained. Better Auth, passkeys, Stripe plugin and CLI aligned to 1.7.12. Vulnerable transitive packages and Supabase CLI updated within existing ranges. | App deployment required. |
| B02/B03: admin privileges and revocation | Existing server-controlled fields and current-account/session checks retained and retested with the new auth library. | Admin deployment required. |
| B04: sensitive employee reads | Browser roles lose table and column privileges on `user` and `employees`. Protected server reads and minimal directory projections remain. | Applied and verified. |
| B05: public telemetry writes | Unused event/error ingestion endpoints return 410 without parsing a body or writing data. The unused ingestion code is removed. | Main app deployment required. |
| B07: beta admission | Missing/invalid configured code closes signup with 503. Wrong submitted code returns 403. No source fallback. | Configure the secret, then deploy. |
| B08: HTTP protections | Shared middleware applies CSP with fresh script nonces, frame/MIME/referrer protections and private dynamic caching. Default server-function CSRF checks are explicitly preserved. | Both app deployments required. |

The CSP permits inline **styles** because Base UI, drag-and-drop and chart
components use style attributes. Inline **scripts** require a nonce; eval and
script event attributes are not enabled. Images can use HTTPS URLs for existing
avatars. Production browser connections are restricted to the app's own origin;
the current billing flow redirects to hosted Stripe Checkout/Portal and does
not embed Stripe.js. Reassess the policy before adding embedded third-party UI.

Development retains framing/base/object protections and private caching without
enforcing production script restrictions on Vite's development tooling.

## Database changes already applied

- `20261023152746_restrict_sensitive_employee_data_api_access.sql`
- `20261023154318_align_better_auth_subscription_schema.sql`
- `20261023155307_lock_auth_helper_search_paths.sql`

The auth schema change adds nullable `billingInterval` and `stripeScheduleId`
fields, preserving existing subscriptions and compatibility with the previous
app version. The search-path migration pins four existing helpers after their
bodies were inspected; it does not change their grants or session resolution.
Local migration versions match the connected project's migration history.

## Verification

- Both apps' production builds pass; existing chunk-size/module-directive
  warnings remain.
- Focused security, signup, permissions, clocking and billing tests pass,
  including all 25 existing admin tests. The billing-portal DOM worker timed
  out during parallel builds; its isolated rerun passes both tests.
- Focused lint passes with zero warnings. App/shared TypeScript checks pass.
- The updated install reports zero npm audit vulnerabilities, including dev
  dependencies. This is the audit result at remediation time, not a future guarantee.
- Both rebuilt public bundles were scanned against the configured private
  environment values: 352 JS/CSS/HTML/map files checked, with no matches.
- Live grants deny both browser roles SELECT on every column of the two
  sensitive base tables. The server role and owner retain access. Data API
  zero-row checks return 401 for the browser key and 200 for the server key.
  Table permissions apply regardless of an employee's organisation or token.
- Synthetic header/cookie/session-token lookups still work with fixed search
  paths. The mutable-search-path advisor warning is cleared. Existing
  GraphQL-discoverability, auth-helper execution and deny-all RLS notices were
  not treated as demonstrated data leaks or broadly reconfigured.
- Local production HTML and auth JSON return the protection headers. All SSR
  script nonces match the header, and the nonce changes on each response. The
  client-only Harbour House demo hydrates under enforced CSP; admin login
  renders. Cross-site and originless server-function POSTs return 403 in both
  apps. Forged telemetry payloads return 410 without database writes.
- The Better Auth CLI reports the configured schema is up to date after the
  billing additions. It notes existing DOB drift: the database stores a
  nullable date while auth validates a required input string. No birth dates
  were backfilled, cast or changed as part of this security work.

Production previews use Nitro's `TEST=1` switch to disable scheduled jobs.
`.env.local` supplies the working pooler connection for local verification;
the direct connection in `.env.hosted.local` was unreachable from this machine.
No preview signs up real users, sends email, charges payments or runs clock jobs.

## Before deploying

1. In Coolify, set `SIGNUP_ACCESS_CODE` to a private six-digit value on the main
   app. Do not put it in a `VITE_` variable, commit it, or paste it into this doc.
   Until configured correctly, signup intentionally returns unavailable.
2. Deploy both the main and admin apps together from the updated lockfile,
   using `npm ci` and their normal production build commands. The database
   migrations above are already applied to the connected project; other
   databases need the same migrations before the new auth version.
3. Check the hosted HTML, auth/API and private-route responses for the same
   headers. Ensure the proxy respects `private, no-store` and does not override
   CSP or cache authenticated documents/JSON. Hashed asset caching remains separate.
4. Smoke-test normal signup/sign-in/out, email verification, passkeys,
   invitations, admin revocation, role/location boundaries, rota writes,
   clocking and billing webhooks in the intended hosted release. Browser preview
   checks and isolated unit tests do not establish deployment status or prove
   live email/payment/device integrations.

The implementation follows the
[Supabase grants/RLS model](https://supabase.com/docs/guides/api/securing-your-api),
[Better Auth upgrade guidance](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/guides/1-7-upgrade-guide.mdx)
and [TanStack's CSP example](https://github.com/TanStack/router/tree/main/e2e/react-start/csp).
