# S08: shared password-recovery abuse controls

Updated 2 November 2026. The private counter migration is applied to hosted Supabase; application changes are implemented locally and still need deployment and a live recovery check.

## Change

Both recovery entry points now use the same guard in the main Better Auth `hooks.before`: the public TanStack server functions and the direct Better Auth HTTP routes. This does not rely on the HTTP router's in-memory limiter, which direct `auth.api` calls bypass. Other auth operations retain the existing router controls.

The wrappers supply the actual incoming `Request` and headers. The guard requires request context, validates caller origins against the existing auth configuration, validates recovery inputs with shared Zod schemas and pins reset destinations to `/reset-password` on `BETTER_AUTH_URL`. Client UI no longer chooses an absolute callback origin. External destinations and alternate internal paths are rejected. Known and unknown addresses receive the same ordinary success response and consume the same budgets.

The guard consumes atomic database quotas in this order: global, source, then normalized email or reset token. A single PostgreSQL UPSERT decides each allowance, using the database clock. Workers share counters, denied requests do not extend a window, and counters saturate rather than growing indefinitely. Global limits are checked before allocating attacker-selected identity keys. Each consume removes at most 100 expired buckets with `SKIP LOCKED`; expired rows are not returned to browsers. Cleanup runs when recovery is attempted, so the last inactive expired buckets can remain until the next attempt.

Limits use fixed 15-minute windows, starting with the first attempt:

| Operation | Global | Trusted source | Shared unknown-source fallback | Email or token |
| --- | --- | --- | --- | --- |
| Request reset email | 500 | 20 | 100 | 3 per normalized email |
| Submit reset password | 1,000 | 60 | 100 | 10 per reset token |

Source addresses use server-native request metadata when available. IPv4-mapped IPv6 addresses normalize to IPv4, and IPv6 sources share a `/64` budget. Arbitrary forwarding headers are ignored by default. Missing trustworthy metadata uses an enforced shared fallback bucket rather than disabling protection. Large shared networks and unknown-source deployments can hit shared limits; tune only after observing legitimate usage.

`AUTH_RECOVERY_TRUSTED_IP_HEADER` is an optional **server-only** setting. Configure it only after verifying that the ingress overwrites that single-IP header, removes attacker-supplied values, and the app origin cannot be reached directly. Comma-separated forwarding chains are rejected. No real environment variables were changed in this task. The safe fallback works without this setting; reverse-proxy behavior must be verified during rollout before relying on individual public-IP attribution.

Counters contain HMAC-SHA256 keys derived with `BETTER_AUTH_SECRET`, a count and an expiry. Raw addresses, emails and reset tokens are not stored in this table. All workers must share the same auth secret and database. Limit exhaustion returns a generic error; HTTP auth responses include `Retry-After`. If the database limiter is unavailable, recovery fails closed with a generic temporary-unavailability error. The TanStack wrapper propagates the error through its normal server-function error handling.

## Hosted migration

Migration `20261102204507_protect_password_recovery_limits` creates `account_private.password_recovery_limits` with RLS, a service-role policy and an expiry index. Browser roles and PUBLIC have no table privileges. The CLI-created local migration was renamed to the version assigned by the hosted migration service.

Before applying it, three tests ran the actual SQL inside a transaction and rolled it back. After applying it, four integration tests passed against hosted Supabase: budget saturation and stable expiry, expiry reset, browser privilege/RLS checks, and thirty simultaneous attempts across six connections allowing exactly three when the quota is three. The concurrency case briefly committed one random synthetic counter and removed it afterward. A final metadata query confirmed zero remaining buckets. No hosted accounts, sessions, passwords or customer records were changed, and no real recovery emails were sent.

The Supabase security advisor reports no finding for the new private table. Existing broader grant/advisor issues remain outside this fix and are tracked by S15; this is not a clean bill of health for the whole project.

## Verification and rollout

Production-auth regression tests use the real Better Auth handlers and production configuration, with isolated auth storage, mocked mail and a shared test counter backend. They cover both wrappers and HTTP routes, a second auth instance, account limits despite changed source addresses, source limits despite changed emails/forwarding headers, unknown-source fallback, token limits, fixed destinations, origin rejection, missing request context, fail-closed storage and global allocation bounds. Existing S03/S06 recovery and immediate-revocation tests also run.

All 46 focused cases pass: 26 main-auth/source cases, four hosted counter integration cases and 16 dedicated-admin cases. The fresh main production build and TypeScript check pass. Focused lint has no remaining errors; its existing `organization` shadowing warning in the auth callback remains. Broader account-directory lint also reports two existing errors in `use-passkey-support.ts` and `passkey-queries.ts`; those unrelated files were not changed by this remediation.

1. Deploy the main app to all workers. The hosted migration is already present; apply it first in any other environment. Until deployment, the old hosted recovery paths retain their previous behavior.
2. Verify the production ingress's source metadata. Leave `AUTH_RECOVERY_TRUSTED_IP_HEADER` unset unless its trust conditions are met.
3. Using a disposable account and controlled mail, check a normal recovery, expired/reused links and immediate rejection of old sessions. Exercise both the wrapper and HTTP routes against the same target and confirm their combined quota is enforced across workers and after a worker restart.
4. Check generic unknown-account responses and rejection of an external callback. Include the shared-network/fallback quota behavior in operational testing.

References: [Better Auth rate limiting](https://better-auth.com/docs/concepts/rate-limit), [Better Auth hooks](https://better-auth.com/docs/concepts/hooks), [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) and [Supabase private schemas and API hardening](https://supabase.com/docs/guides/database/hardening-data-api). Installed Better Auth 1.7.12 dispatch and middleware source was checked because direct API calls differ from router dispatch.
