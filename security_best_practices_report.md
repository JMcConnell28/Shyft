# Beta launch security and readiness review

Reviewed: 18 October 2026. Scope: the current repository, installed dependency lockfile, the connected Shyft Supabase project, and public HTTPS response headers for rocketrota.com.

**Status — 23 October 2026:** B01–B05, B07 and B08 have code remediations. B04's database restriction and the supporting auth schema/search-path migrations are applied to the connected Shyft project. The application fixes still require deployment of both apps and an explicitly configured beta admission code. See [remediation and verification](docs/security-remediation.md). B06's remaining business/privacy details and the operational deployment gates still need completion; this is not an all-clear to launch.

**Remediation update — 18 October 2026:** B02 and B03 are fixed in the local admin code. Protected profile fields are server-controlled, profile requests cannot change them, and current account status and permissions are checked when reading an admin session. Disabled accounts' sessions are revoked. Validation: all 25 admin tests pass, including 19 new authentication regressions; admin TypeScript, zero-warning lint and the production build pass. Deployment is still required.

The original 18 October review was targeted, not a penetration test or a certification. That review did not change application code, production configuration or customer records. Its database checks inspected catalogues, grants and policy definitions; the REST check requested zero rows. The admin profile issue was reproduced against the installed library's input parser, without changing an admin account. The deployed app's exact revision, hosting controls and backup configuration were not established. Later remediation changes and their verification are recorded separately above.

## Confirmed security findings

### B01 — Critical, fixed in code: vulnerable framework/auth dependencies

- **23 October remediation:** the earlier TanStack upgrade is retained; Better Auth, passkeys and its Stripe plugin are now pinned together at 1.7.12, with the matching `auth` CLI. Vulnerable transitive dependencies and the Supabase CLI were updated within allowed ranges. The resulting install audit reports zero vulnerabilities. Both production builds and authentication/access/billing regressions pass. Deploy both apps to activate the package fixes.

- **Rule:** dependency vulnerability management; CWE-79 and unsafe server-function deserialization.
- **Evidence:** [package-lock.json](D:/Projects/Shyft/package-lock.json:6927) installs `@tanstack/react-start@1.167.2`; [server core](D:/Projects/Shyft/package-lock.json:7311) installs `@tanstack/start-server-core@1.167.1`.
- **Impact:** an attacker can use an affected server-function response to execute JavaScript under the application's origin when a user opens a crafted link. A separate advisory covers invoking another client-referenced server function during deserialization; the consequences depend on that function's own checks.
- **Verification:** `npm audit --omit=dev --json` flagged the installed versions. The maintainers identify fixed versions for both issues: [reflected XSS](https://github.com/TanStack/router/security/advisories/GHSA-qx66-fv34-fjm8), [deserialization](https://github.com/TanStack/router/security/advisories/GHSA-9m65-766c-r333).
- **Fix:** update the TanStack packages and their resolved server core to compatible patched releases, rebuild both apps, and rerun authentication, permissions, clocking and billing checks. Confirm the resolved lockfile versions, not just package.json ranges. Do not use a blind forced audit upgrade.
- **Related dependencies:** `better-auth` and `@better-auth/stripe` are both at `1.4.18`. Review and patch that family together, including passkeys and the admin app. The [Stripe advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-h3rm-78g3-j7cp) has additional prerequisites, including an `authorizeReference` callback; the current configuration does not include that callback, so this review does not claim that particular exploit is reachable.
- **Limit:** the audit reported 7 critical and 29 high package records out of 51 total. These include transitive and build dependencies; they are not 51 demonstrated production exploits. The framework findings above are directly relevant to this app's server functions. Many Better Auth advisories concern plugins not enabled here.

### B02 — High, fixed locally: admin profile updates could set privileged account fields

- **Rule:** server-controlled authorisation fields; CWE-915 / CWE-269.
- **Original issue:** `role` and `disabledAt` were writable additional user fields on the standard auth handler. Permissions use the role stored in the admin user row, allowing a lower-privilege admin to promote themselves through a profile request.
- **Fix implemented:** [additional fields](D:/Projects/Shyft/apps/admin/src/features/auth/server/admin-user-fields.ts:3) now use `input: false`. An explicit [profile guard](D:/Projects/Shyft/apps/admin/src/features/auth/server/require-admin-profile-update.ts:7), wired into the auth before hook, rejects attempts to supply role or disable-status fields, including null/false and the database column alias.
- **Verification:** [auth endpoint tests](D:/Projects/Shyft/apps/admin/src/lib/auth.test.ts:99) exercise the actual configured Better Auth handler with an isolated memory adapter. Forged updates receive 403 without applying accompanying changes; normal profile edits and bootstrap provisioning still work. No live admin account was modified.
- **Deployment:** deploy the updated admin app to activate the fix. Role and status changes remain server-controlled operations.

### B03 — High, fixed locally: disabled admins with an existing session were not rejected

- **Rule:** enforce account revocation on privileged requests; CWE-863.
- **Original issue:** disable status was checked when creating a session, but not by the common request guard for existing sessions.
- **Fix implemented:** [active membership lookup](D:/Projects/Shyft/apps/admin/src/features/auth/server/admin-session.ts:43) reads the current status and revokes that user's admin sessions if disabled. Both optional and required [session reads](D:/Projects/Shyft/apps/admin/src/lib/auth-session.server.ts:15) use this lookup. Optional reads return no session so the login page can render. New session creation uses the same active-account check. Trusted auth-model updates that disable an account also revoke its sessions.
- **Verification:** [session regression tests](D:/Projects/Shyft/apps/admin/src/lib/auth-session.server.test.ts:36) cover existing sessions after disablement, current database roles overriding old owner claims, sign-in denial, scoped session deletion, and failure paths that deny access. A read-only live catalogue query confirmed the existing session and disable column names used by the fix.
- **Deployment and timing:** deploy the updated admin app. A direct database change to the disable flag is enforced and sessions revoked on the next checked request; an already-running operation is not retroactively cancelled. No schema migration is needed.

### B04 — High, fixed in hosted database: shared-workplace sensitive fields

- **23 October remediation:** table and separate column privileges on `public.user` and `public.employees` are revoked from `PUBLIC`, `anon` and `authenticated`. All app directory/profile reads already use authorised server functions; there was no browser caller to migrate. Existing minimal server projections remain the shared directory. The server role and database owner retain access. Live catalog checks confirm browser roles cannot select any column; zero-row Data API checks reject sensitive reads while the server client still succeeds. No personal rows were fetched or modified.

- **Rule:** least-privilege data exposure; CWE-200 / CWE-863.
- **Evidence:** [user RLS policy](D:/Projects/Shyft/supabase/migrations/20260409_better_auth_rls_policies.sql:122) permits SELECT of a user's row by other members of the same organisation. [Auth fields](D:/Projects/Shyft/src/lib/auth-fields.ts:6) include `dateOfBirth`. Live catalogue checks confirmed that `anon` and `authenticated` have SELECT permission on that column and that the shared-organisation policy is active. The `employees` policy also permits organisation members to read rows containing `payroll_id`.
- **Impact:** a member with a valid Better Auth session token can use the Data API access model to request colleagues' birth dates and internal employee identifiers, even if the application UI omits them. RLS controls rows, not a safe subset of columns.
- **Verification:** the configured public Data API accepted `user?select=dateOfBirth&limit=0` with HTTP 200 and returned `[]`. Combined with the live grants and policy predicate, this establishes the exposure configuration without retrieving personal records. It does not mean an unauthenticated caller can read all users.
- **Fix:** remove broad direct SELECT access to sensitive base tables/columns. Provide a minimal team directory projection for genuinely shared fields, and keep birth dates, payroll identifiers and pay data behind self/admin-specific access. Choose a migration that preserves the app's server-only auth/database access. Test both legitimate use and direct API attempts as another employee and another workplace.
- **Mitigation:** do not put real employee birth dates or payroll identifiers into the beta until the access boundary is corrected. Hiding controls or hiding the public API key does not fix it.

### B05 — High, fixed in code: public telemetry database writes

- **23 October remediation:** these endpoints have no callers in the repository, so public ingestion is retired. Both POST handlers now return 410 without reading the request body or writing to the database; the unused ingestion schemas and writers are removed. Existing admin records/read views remain. Local production checks reject forged actor/source payloads, including an oversized payload. Deploy the main app to close the hosted endpoints.

- **Rule:** authenticate sensitive writes, establish actor identity server-side and bound resource consumption; CWE-306 / CWE-400.
- **Evidence:** [event endpoint](D:/Projects/Shyft/src/routes/api/admin-telemetry/event.ts:9) and [error endpoint](D:/Projects/Shyft/src/routes/api/admin-telemetry/error.ts:9) parse caller JSON and write it without an authentication or rate-limit check in these handlers. [Telemetry inserts](D:/Projects/Shyft/src/features/admin-observability/server/telemetry.ts:57) use caller-supplied user and organisation IDs. [Schemas](D:/Projects/Shyft/src/features/admin-observability/schemas/telemetry-schemas.ts:12) accept unrestricted metadata objects; error input also accepts a claimed `server` source.
- **Impact:** anonymous callers can fabricate events or errors attributed to other users and generate database/storage load. These records cannot safely serve as trusted audit evidence.
- **Fix:** derive authenticated identity and permitted workspace from server context, distinguish trusted server events from untrusted browser reports, and enforce request-size, metadata-size and rate limits before expensive parsing/writes. If anonymous login-page errors are needed, give that narrow path strict limits and no trusted actor/source attribution.
- **Limit:** no external proxy configuration was available. Existing edge limits may reduce flooding, but they would not fix forged actor identity in accepted payloads. No spam or write request was sent during this review.

## Other work required before collecting real beta data

### B06 — Launch blocker: finish the privacy and processing information

- [Terms configuration](D:/Projects/Shyft/src/features/legal/terms.ts:7) still has an effective-date placeholder. [Service terms](D:/Projects/Shyft/src/features/legal/content/service-terms.ts:8) still have placeholders for the business identity, address and contact details.
- [Data terms](D:/Projects/Shyft/src/features/legal/content/data-terms.ts:15) still reference a placeholder privacy notice. The same file has unfinished sub-processor, security, transfer, data-return and retention information. These strings are rendered by the existing terms page.
- Replace them with accurate information about the service as actually operated. Provide a working privacy notice and contact route, explain retention/return/deletion, and establish who handles a data incident. Have the final terms and processing arrangements reviewed appropriately for the business.
- The ICO explains that people must receive privacy information when their personal information is collected directly: [right to be informed](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/). Calling the service a beta does not supply the missing information.

### B07 — Medium, fixed in code: beta admission source fallback

- **23 October remediation:** the source fallback is removed in every environment. Missing/malformed `SIGNUP_ACCESS_CODE` returns 503 before signup, and an incorrect supplied code returns 403. Both environment examples document the required private six-digit code. Existing signup throttling remains. Configure the secret in Coolify before deploying; no production secret has been chosen or changed by this work.

- **Evidence:** [signup access check](D:/Projects/Shyft/src/lib/auth/sign-up-access.server.ts:9) has a fixed default, used when `SIGNUP_ACCESS_CODE` is missing at line 14. The production example does not list that variable.
- **Impact:** if beta signup is intended to be restricted, a missing deployment variable silently selects the source-defined code rather than refusing signup. This does not itself grant workplace membership.
- **Fix:** explicitly configure the beta admission secret and fail closed when production configuration is missing. Keep the existing signup throttling. This finding does not require replacing the admission mechanism with a new feature.

### B08 — Medium, fixed in code: production response protections

- **23 October remediation:** shared Start middleware protects both apps with a per-response script nonce, CSP frame-ancestor protection, `X-Frame-Options`, `nosniff`, a referrer policy and private/no-store dynamic response headers. Static asset caching is preserved. The custom Start instances explicitly retain server-function CSRF middleware. Production previews verified HTML/auth JSON, nonce matching/rotation, successful demo hydration and admin login rendering, and rejection of cross-site/originless server-function requests. Hosted response headers still need verification after deployment.

- A public HTTPS HEAD request to `https://rocketrota.com` returned HTTP 200 but did not include CSP, X-Frame-Options, X-Content-Type-Options or Referrer-Policy headers.
- Configure clickjacking protection, MIME sniffing protection and an appropriate referrer policy at the app or proxy. Test a CSP compatible with TanStack's scripts and hydration before enforcing it; a policy that breaks sign-in or rendering is not ready to ship.
- Separately verify private dashboard, auth and API responses cannot be cached across users by the production proxy/CDN. Missing Cache-Control on the public home page does not establish a private-data caching vulnerability.
- This check covers the public home response at review time, not every route or a proven deployment of the current revision.

## Deployment gates — status not established by this review

These are required checks, not claims that the infrastructure currently lacks them. Keep a short record of who verified each one and when.

| Gate | Minimum evidence before inviting real users |
| --- | --- |
| Backup and recovery | Automatic backups enabled, known retention and acceptable data-loss window; a successful restore into an isolated database; a named person with recovery access. Supabase backup availability depends on the plan: [backup documentation](https://supabase.com/docs/guides/platform/backups). |
| Production configuration | A production build served by the always-on Node server; correct HTTPS auth origins and secure cookies; production secrets distinct from development; development bypasses inactive; beta admission explicitly configured; admin bootstrap enrolment closed after provisioning. MFA on hosting, database, billing and source-control operator accounts. |
| Restart and background work | Automatic process restart after failure/reboot; evidence the production clock-out task runs every minute and catches up after downtime; an actionable alert for server/job failures. [The task is configured](D:/Projects/Shyft/vite.config.ts:60), but source configuration alone does not prove a running service. |
| Rollback | A known working application artefact and a deployment rollback procedure, plus a recovery plan for a failed migration. Test on an isolated environment, not the live employee database. |
| Permissions smoke test | Two separate workplaces, employees and managers, and different location access. Verify direct requests cannot read/change another person's timesheet, payroll or manager data; repeat after role changes, offboarding and logout. Include B02–B05 regression checks. |
| Critical workflows | Production-domain verification/reset emails arrive; NFC clock-in/out and a backdated correction save correctly; automatic finish review blocks unresolved payroll export; if charging during beta, signed billing webhooks, retries and reconciliation work in the intended Stripe mode. |
| Incident response | Someone receives failures, knows how to restrict access/rotate a leaked secret/recover data, and can contact affected workplaces. Keep the support and privacy contact details usable. |

## Safeguards already observed

- Main-app manager access resolves a verified session, checks the active organisation and restricts permitted locations: [manager access](D:/Projects/Shyft/src/features/dashboard/manager/server/access.ts:33).
- Main authentication explicitly enables rate limiting. Verification and role-development overrides are guarded against production use in their source modules. Verify the actual proxy client-IP handling and deployment mode rather than assuming local behaviour proves production behaviour.
- The custom Stripe webhook verifies the signature against the raw payload and records processing state: [webhook handler](D:/Projects/Shyft/src/features/billing/server/webhook.ts:35).
- The service worker handles document navigation through the network with an offline fallback, and restricts ordinary caching to assets rather than API JSON or private documents: [service worker](D:/Projects/Shyft/public/sw.js:46).
- A scan of the existing browser build checked 250 JS/CSS/HTML/map files against six configured private environment values and found no matches. Only environment example files were tracked among the checked env/key filenames. This is a useful check on that artefact, not a substitute for scanning the final rebuilt release or the full Git history.
- Supabase advisors did not report a table-with-RLS-disabled finding in the returned set. They did report four mutable function search paths, GraphQL schema discoverability grants and callable security-definer helpers. Some are legitimate in this custom-auth design. The helper function grants and no-policy deny-all tables must not be treated as data leaks without checking their bodies and policies. B04 is the specific data-exposure issue established here. [Advisor remediation guidance](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).

## Suggested order

1. Patch the vulnerable framework/auth dependency families and fix admin role/revocation handling.
2. Restrict sensitive database access and harden public telemetry writes; test the actual permission boundaries.
3. Finalise privacy/contact information and production admission/headers.
4. Complete backup/restore, restart/job, email/billing and rollback checks against the intended release.

No new product features are needed to complete this work.
