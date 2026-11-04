# S01: verified database TLS

Updated 30 October 2026. Code remediation is implemented locally. Deployment and hosted SSL enforcement remain outstanding; S01 is not yet closed.

## Implemented

All three application pool factories now use one connection configuration in `packages/db/src/connection-config.mjs`: the main app, shared database package and dedicated admin authentication database. Database diagnostics and SQL integration fixtures use the same configuration.

The configuration requires TLS 1.2 or newer, certificate verification and Node's default hostname verification. It has no plaintext fallback. Supabase connections trust the bundled public Supabase Root 2021 CA; other hosts use Node's normal trust roots. No private certificate or additional secret is required. Existing server-only guards remain on the application database modules.

`DATABASE_URL` may omit SSL parameters or specify `sslmode=verify-full`. Approved URL flags are removed before passing the URL to `pg`, because its connection-string parser otherwise replaces the explicit SSL object, including its CA. Insecure or conflicting SSL flags are rejected without printing credentials. `PGSSLMODE` cannot weaken the explicit policy.

The bundled CA expires on 26 April 2031. Review it when Supabase rotates its certificate authority. Its public source and SHA-256 fingerprint are recorded alongside the certificate in `packages/db/src/supabase-ca.mjs`.

Local Postgres must also support verified TLS. For a custom development CA on a non-Supabase host, configure Node's `NODE_EXTRA_CA_CERTS` before starting the process. The old default plaintext local Supabase URL is no longer an acceptable configuration.

## Verification

The new regression suite covers the effective `pg` SSL configuration, CA fingerprint, hostname-verification defaults, environment overrides, malformed URLs and conflicting connection-string parameters.

Validation passed: all 23 TLS regression tests, main and admin TypeScript checks, and both production builds. The six selected SQL integration suites were skipped because the test runner had no fixture database configured; the hosted connection check below is separate from those suites.

The read-only hosted check established an authorized TLS 1.3 client socket using the shared application configuration. It separately reported `pg_stat_ssl.ssl = false` for the database backend. The Supabase management CLI reported `currentConfig.database = false` and `appliedSuccessfully = true`: SSL enforcement is off.

These are separate observations. Through Supavisor, `pg_stat_ssl` describes the pooler-to-Postgres connection, not the application's connection to the pooler. The original audit's closure check needed both observations; checking `pg_stat_ssl` alone does not prove client TLS.

Run the check using an existing environment file:

```powershell
npm run db:verify-tls -- .env.local
```

Or run `npm run db:verify-tls` where `DATABASE_URL` is already loaded. It prints only TLS metadata, never the connection string or database records. Exit code zero requires an authorized client TLS socket and an encrypted database backend. Until enforcement is completed, the current hosted backend check intentionally exits with an error.

## Remaining rollout

1. Deploy both the main app and admin app with this code, and restart local development servers too: an existing process can retain an old cached connection pool. Use a URL without SSL flags or with `sslmode=verify-full`; remove conflicting flags. Verify login, an authenticated database read and billing webhook processing through the usual test environment.
2. Check the actual client TLS socket from each deployed runtime using the verifier above. Confirm `client.encrypted` and `client.certificateVerified` are true. The backend result can still fail at this stage.
3. Enable **Enforce SSL on incoming connections** in the project's Supabase database settings. This setting restarts the database, so perform it after the compatible apps are deployed and account for the brief interruption. It was not enabled from this workspace while the existing deployed apps still use the old configuration.
4. Rerun the verifier from both deployed runtimes and development. Require both `client.encrypted` and `databaseBackend.encrypted` to be true, and a successful exit. Confirm a disposable connection with `ssl: false` is refused; never add a plaintext fallback to application code.
5. Recheck main/admin authentication, ordinary database reads and background billing processing after the restart. Close S01 only when these checks pass.

References: [node-postgres SSL configuration](https://node-postgres.com/features/ssl) explains connection-string overrides. [Supabase SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement) documents certificate verification, pooler behavior and the database restart.
