# Remaining audit remediation

Work started 2 November 2026. Updated 4 November 2026. The original Word audit is the baseline. The Markdown register tracks remediation and rollout. [Findings register](./security-audit-2026-10-30.md#findings-register)

| Priority | Finding | Remediation | Rollout state |
| --- | --- | --- | --- |
| 1 | S05 | Closed public signup on the admin app and required authenticator MFA. | Hosted schema ready. Deploy the admin app, review existing operators and enroll them. |
| 2 | S13 | Updated compatible dependencies, moved the UI generator to development, and removed the vulnerable email rendering chain from runtime. | Production builds verified. App deployment pending. Development advisories tracked below. |
| 3 | S12 | Serialized webhook processing and subscription refresh. Added a queue for refunds, disputes and early fraud warnings. | Hosted schema ready. Deploy both apps and check the Stripe event subscriptions. |
| 4 | S09 | Restricted post-authentication navigation to valid internal paths. | Main deployment and workbook sign-in check. |
| 5 | S10 | Blocked formula-like payroll text while preserving validated amounts, hours and ordinary payroll IDs. | Main deployment and workbook checks in Excel and Sage. |
| 6 | S14 | Added controlled authorization failures, an authenticated read-only check and an admin job health indicator. | Deploy both apps and verify the hosting secret and schedule. |
| 7 | S16 | Preserved the stricter sandbox policy on privacy downloads. | Main deployment and workbook download check. |
| 8 | S15 | Revoked unused browser Data API grants, set stricter defaults and enabled RLS on private tables. | Applied and verified on hosted Supabase. |
| Deferred | S11 | Development environment isolation and application credential scope. | Deferred at Jack's request. |

## What changed

- **S05** The admin signup endpoint and former bootstrap allowlist cannot create accounts. Private admin tools require MFA. Password-only sessions can enroll an authenticator, and enrollment revokes older sessions. A database operator can provision accounts or recover lost MFA through an audited CLI. Hosted migration `20261102211014_harden_admin_authentication` is applied. [Admin rollout notes](./security-remediation-s05.md)
- **S12** The webhook verifies the Stripe signature before taking a database claim for the event. An in-flight duplicate receives a retryable response. Subscription updates fetch current Stripe state inside a per-subscription lock, so an old event cannot restore stale access. A late paid invoice cannot create a station task for an inactive subscription. Refunds, disputes and early fraud warnings create review items. An open review linked to a billing account holds station dispatch until an owner or developer records a decision. Partial refunds go to operator review and do not automatically cancel subscriptions. Hosted migration `20261102213342_add_billing_risk_review` is applied. [Stripe webhook delivery](https://docs.stripe.com/webhooks)
- **S09** Login, signup and email verification use the same validator. External, protocol-relative, malformed and encoded redirect attempts fall back to `/dashboard`. Valid internal paths retain their query and fragment.
- **S10** CSV exports reject spreadsheet formula prefixes in free text and tell the manager which kind of field needs correction. The numeric export path validates formats separately, including negative corrections and hours in `H:MM` format. Quoting, line endings, the UTF-8 marker and leading zeroes in ordinary payroll IDs remain compatible with the existing Sage export. [OWASP CSV injection guidance](https://owasp.org/www-community/attacks/CSV_Injection)
- **S14** Reconciliation returns 401 for missing or invalid authorization, and a controlled 503 when configuration or processing fails. An authorized `--dry-run` call reads aggregate job health without running reconciliation. The admin dashboard and billing page flag failed, stalled or overdue runs.
- **S16** The shared response middleware keeps the route's sandbox and default-deny CSP alongside the global CSP. An HTTP check showed that TanStack Start applies earlier helper writes as it adopts a route response. The middleware now composes the policies after receiving the route response and writes the combined policy through the framework's response helpers. [TanStack Start response handling](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point), [CSP policy enforcement](https://www.w3.org/TR/CSP3/#multiple-policies)
- **S15** Hosted migration `20261102215637_restrict_application_data_api_grants` removes application table, column, sequence and routine privileges for browser roles and PUBLIC. It also restricts future Postgres-owned objects by default and adds RLS to the private schemas. Zero-row browser Data API probes returned 401. Rolled-back fixture tests confirmed server-role station setup, scan and clock flows still work. The hosted security advisor returned zero warnings or errors and 13 informational notices for deliberately closed tables with no browser policy. [Supabase Data API hardening](https://supabase.com/docs/guides/database/hardening-data-api)

## Dependency notes for S13

The compatible lockfile updates remove known production advisories. Transactional templates use the required React Email components directly. The server renders HTML with React and sends it with the existing plain-text message through Resend's HTTPS API. The request retains the configured sender, recipient routing and idempotency key, and it has a timeout. [Resend send API](https://resend.com/docs/api-reference/emails/send-email)

On 4 November, `npm audit --omit=dev` reported zero advisories. The full audit reported 52 affected development package entries (10 high, 40 moderate, 2 low). These counts include dependents in the advisory chains.

Lighthouse brings browser, archive, proxy and telemetry dependencies and a nested Zod 3. The performance command accepts loopback URLs and uses an installed browser with an isolated profile. shadcn is used at build time for CSS and as a developer generator. The patched minimatch major removed an export the current ESLint plugin imports, so the compatible version was restored. The newer Lighthouse release requires a later Node 22 patch than the one used for this check. Keep these advisories in the dependency register until compatible tooling updates are available. [minimatch version 11 changes](https://github.com/isaacs/minimatch/blob/main/changelog.md)


## Regression checks

- The focused main suite passed 326 tests. It covered login redirects, session revocation and recovery limits, signed webhook replay, station payment eligibility, reconciliation authorization, email rendering and delivery, CSV safety, push endpoints and privacy response headers. Six database fixtures were skipped in that run because they require a database connection.
- All 64 admin tests passed, including Better Auth enrollment and challenge flows, single-use recovery, permission checks, payment review and dispatch controls.
- Both TypeScript checks and the targeted lint checks passed. The payment retry recheck passed 17 tests, including persistence of a dispatch hold when a later Stripe lookup fails. The focused privacy, reconciliation and email rerun passed 30 tests.
- Both production builds passed. Artifact checks inspected 800 main and 163 admin files for excluded tooling and retired paths. The secret scan found no matching configured private values in 384 browser files.
- The built main server returned 404 for the retired admin page and rejected its two retired server functions. The login page's rendered script nonce matched its CSP header. Synthetic unauthenticated HTML and JSON privacy requests returned 404 and kept both CSP policies. Reconciliation returned 401 for missing or invalid authorization and 200 for an authorized read-only dry run.
- Hosted database checks used synthetic fixtures in rolled-back transactions to verify provisioning, lock contention, reconciliation health and private API grants. The hosted security advisor was rechecked on 4 November.

## Deployment and live checks

1. Review the current admin operators and follow the S05 enrollment procedure when deploying the admin app. Verify both apps before enabling Supabase TLS enforcement under S01. [TLS rollout notes](./security-remediation-s01.md)
2. After deploying the main app, verify the Stripe endpoint receives the handled refund, dispute and early fraud warning events. Test concurrent delivery and review-to-dispatch in a Stripe test environment. The review queue and dispatch hold require the new application builds.
3. Configure the reconciliation secret and schedule in the deployment environment. Run the authenticated dry run and check the admin health indicator. Confirm a regular run succeeds and that failures reach the operator who can investigate them.
4. Use the existing test workbook for sign-in redirects, recovery, browser push, CSV opening and Sage import, and authenticated HTML and JSON privacy downloads. Include the earlier S02 clock key review and S03, S04, S06, S07 and S08 rollout checks.
