# S05: operator provisioning and required admin MFA

Updated 2 November 2026. Implemented locally; hosted migration `20261102211014_harden_admin_authentication` is applied. Admin deployment and live operator enrollment remain outstanding.

Public admin signup is disabled. The auth creation hook also refuses account creation, and `ADMIN_BOOTSTRAP_EMAILS` no longer grants anything. The signup UI has been removed. Provisioning requires an authorized database operator using `scripts/admin/provision.mjs`; matching an email address cannot create an owner.

The dedicated admin console now requires authenticator-based MFA. A password-only session can enroll an authenticator but cannot use private admin tools or their server functions. Current membership is checked in the database on every protected call. Initial authenticator verification revokes all older password-only sessions before issuing a replacement. Later sign-ins do not issue an authenticated session until the second factor is verified. Cookie caching and remembered-device bypasses are disabled. Recovery codes work once. Public MFA disablement is blocked.

## Operator procedure

Run `node scripts/admin/provision.mjs --help` for the exact flags. Use a protected server environment with verified database TLS. Verify the person's identity and email ownership outside the application before provisioning. Supply their initial password through protected standard input with `--password-stdin`, never in command-line arguments or a committed file. New passwords must be 16–128 characters. Explicitly request `--role=owner` only for an intended owner; the default is readonly. The script creates the credential and audit record in a single transaction and never prints passwords or hashes.

For a lost authenticator, prefer a saved recovery code. If all codes are lost, an authorized database operator must verify the person's identity and run the CLI with `--email`, `--operator` and `--reset-mfa`. This removes the authenticator, every session and outstanding challenge, and writes an audit event. It refuses disabled accounts. The user must sign in and enroll again before regaining private access. This procedure does not change their role or password.

## Verification

Thirty focused admin cases pass, including signup rejection even for a former allowlist address, creation-hook rejection, enrollment and session rotation, password-only denial, second-factor challenges, single-use recovery, disabled accounts, permission checks and protected profile fields. Two additional Postgres integration cases previewed the migration and exercised actual provisioning/recovery SQL inside a rolled-back transaction. No synthetic operator was committed. No existing hosted account, password, session or authenticator was changed.

The admin production build and TypeScript check pass. The additive hosted migration creates the private MFA table and a false-by-default flag; it does not enroll or disable anyone. The old deployed app ignores these additions until deployment.

## Rollout

1. Review the existing operator list and remove any unrecognized account through the established operator process. The fix cannot establish who controlled an account created under the previous bootstrap mechanism.
2. Deploy the admin app. Existing authorized users sign in and complete authenticator enrollment using their password; the setup page supplies a manual authenticator key and recovery codes. Store those codes privately.
3. Check direct calls to private server functions are denied before enrollment. Verify a later login needs an authenticator or a recovery code, and old sessions fail after enrollment or recovery.
4. Remove obsolete `ADMIN_BOOTSTRAP_EMAILS` from hosting configuration. It is ignored by the new code. Do not re-enable public signup for recovery.

References: [Better Auth MFA](https://better-auth.com/docs/plugins/2fa), [Better Auth hooks](https://better-auth.com/docs/concepts/hooks). The installed plugin's database fields, challenge consumption and session-rotation ordering were checked directly.
