# S03: revoke sessions after password recovery

Updated 30 October 2026. The fix is implemented and verified locally. Main-app deployment and a live recovery check remain outstanding. S03 remains open until that rollout is verified. This change also implements the session-cache fix for S06.

Rechecked 2 November 2026 during S07/S08 remediation. The real-handler recovery and session-cache regressions pass with the shared recovery guard in place. S06 needed no further implementation change; deployment and live checks remain pending. S08 additionally requires its new private counter migration in each environment; it is already applied to the connected hosted project. See [S08 notes](D:/Projects/Shyft/docs/security-remediation-s08.md).

## Implemented

The main Better Auth configuration now enables `emailAndPassword.revokeSessionsOnPasswordReset`. A successful password reset deletes every main-app session for the recovered account, including sessions on other devices. The account recovery server action and the Better Auth HTTP reset endpoint use this same configuration.

The five-minute session cookie cache is disabled. Default session reads therefore consult the server-side session store, including when the browser presents a signed cache cookie issued before this change. This is necessary for immediate revocation: deleting database sessions alone would otherwise leave those cookies accepted until their cache expires. The effective server cache window is now zero; already-running requests are not cancelled.

The existing one-hour reset-link expiry and single-use token checks are retained. Password changes while signed in continue to revoke other sessions and issue a replacement session to the caller.

The installed Better Auth 1.7.12 implementation consumes the reset token, deletes sessions and writes the password through its transaction helper. Its adapter enables transactions for the project's PostgreSQL pool. The new tests exercise the real authentication handlers and production configuration with an isolated memory database and mocked email delivery; they do not establish hosted transaction-failure behaviour.

## Verification

Seven authentication regression cases pass: four password-recovery/change cases plus the three existing signup/sign-in/sign-out cases. They cover:

- Two simultaneous logins, including a signed cache cookie generated using the previous five-minute cache configuration. Both session records are deleted after reset; default session reads return null immediately, without a special cache-bypass query. A protected profile-update endpoint refuses both old cookies.
- Successful sign-in with the new password and rejection of the old password. Reusing the spent reset link fails without revoking a new valid session.
- Unknown and expired reset tokens failing without changing the password or revoking valid sessions. A rejected short password leaves the valid link and sessions usable for a subsequent successful reset.
- A normal signed-in password change revoking previous tokens while retaining the newly issued current session.

The main TypeScript check and production build pass. Focused ESLint has no errors; its two warnings are on existing middleware and organization callback code. Test setup is shared through a small fixture module, so the baseline and new recovery tests use the same real auth configuration without duplicated mocks.

All account, password, reset-token and cookie data in these tests are synthetic. No hosted accounts, session records or credentials were changed, and no real emails were sent.

## Remaining rollout

1. Deploy the main app, including the disabled session cache and reset-session revocation setting together. Restart local development processes to load the new auth configuration too. No Supabase migration or additional environment variable is required.
2. Using a disposable account, sign in in two separate browsers, request recovery and reset the password. Verify that both old browsers are refused on their next authenticated server request. Confirm the old password fails and the new password signs in successfully.
3. Replay a reset link once and test an expired link. Check that normal password changes still retain the newly issued current session and revoke other devices. Include billing, exports and another private-data action in the live session-revocation checks for S06.
4. Close S03 and S06 after those deployed checks pass. If an account was recovered under the old behaviour during a suspected compromise, repeat recovery after deployment to revoke its retained sessions.

Disabling cookie caching adds database session lookups to ordinary authenticated requests. Review navigation latency during the test workbook; preserve authoritative revocation checks when optimizing it. A browser can display already-loaded data until it makes another request, which does not grant continuing server access.

Password recovery revokes sessions, while registered passkeys remain account credentials. For suspected account compromise, review and remove unrecognized passkeys using the account's passkey settings as part of recovery. A password reset alone does not prove those registered credentials are trusted.

References: [Better Auth password-reset session revocation](https://better-auth.com/docs/authentication/email-password#revoking-sessions-on-password-reset), [Better Auth cookie caching and revocation](https://better-auth.com/docs/concepts/session-management#session-caching), and [TanStack Start authentication boundaries](https://tanstack.com/start/latest/docs/framework/react/guide/authentication).
