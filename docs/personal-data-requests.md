# Personal data requests

The account feature records and tracks personal data access requests independently of workplace access and billing. It is not a general workplace export or an automatic guarantee that every relevant source has been searched.

## User flow

- Account → Privacy & data is available within the workplace shell. `/account/privacy` also works for verified accounts without a workplace.
- The server checks the current Better Auth session directly, bypassing its cookie cache. All account actions derive the subject from that session, never a submitted user ID.
- One pending request per account is enforced in Postgres. Duplicate submissions return the existing request without resetting its original date or generating another receipt.
- The page displays a reference, original received date, expected response date, progress, public correspondence and secure downloads when a response is released.
- Email/support requests and accessible-format requests remain valid alternatives. An administrator can record a verified request received outside the app; the original received date is preserved. Unverified requests should be recorded in the support process immediately while identity is checked proportionately, rather than waiting to acknowledge receipt.

## Admin workflow

Only platform owner/developer roles have `privacy.manage`. Workplace managers and general support/read-only administrators do not receive this permission.

1. Open **Personal data requests** in the separate admin app.
2. Record scope, identity checks and each employer's coordination/authority in internal notes. Use public messages to keep the requester informed. Employer follow-up does not stop or extend the deadline automatically.
3. **Prepare fresh draft** collects allowlisted account, workforce, support and activity records for the linked account in a consistent database transaction. This includes linked former employee profiles. Existing drafts are replaced only after confirmation.
4. Complete further reasonable searches: unlinked employee history, references about the subject in other people's records, server/provider logs, correspondence, billing details, attachments and any additional relevant sources. Add relevant material to the reviewed response. The collector does not automatically search these external or ambiguous sources.
5. Coordinate employer-controlled records under documented instructions. Include RocketRota-controlled information and explain any separate employer response or outstanding component; do not imply the employer can veto access to RocketRota-controlled data.
6. Edit and save the JSON response. Complete all processing explanations, disclosure decisions and scope/redaction notes. Do not omit personal information solely because it appears in an internal note. Apply relevant third-party considerations and restrictions through review.
7. Confirm identity, employer authority, third-party review and external-source searches before releasing the saved draft. Unsaved editor changes cannot be released. Required placeholders and known credential fields block release server-side.
8. The requester can download a readable HTML report (printable from a browser) and JSON data after signing in. Downloads are attachments, private, non-cacheable and expire after seven days. The notification email contains no response data or bearer download token.
9. If disclosure must be withdrawn, **Revoke download** immediately removes the payload and invalidates access, even when another request is pending. Where appropriate, reopen an expired request for review or coordinate the newer pending request.

For requests that exceed 10 MB or 10,000 records in any automatically collected section, arrange a complete response through an agreed secure alternative. Preparation fails explicitly rather than silently truncating. Record the delivery method, verified recipient, scope and outcome in an internal note before marking it completed. An unlinked/deleted account likewise requires verified historical searches and alternative secure delivery.

## Deadlines and retention

The initial expected response date is one calendar month after receipt. A justified extension requires an explanation and a later date within two additional calendar months, entered before the initial deadline. This implementation does not automate clarification-related clock pauses, refusals or exemption decisions; handle those through the privacy process and document the decision.

Released responses and working drafts expire after seven days. Expired payloads are purged by the main app's `privacy:process` task, scheduled every five minutes in production. Downloads enforce expiry even if the task is delayed. Request history and disclosure audit metadata are retained separately; their operational retention policy must be set and maintained as part of the business's privacy-record schedule. Expiry of a download does not end the individual's rights or delete source records.

The same task claims email notifications in batches using row locks, a five-minute lease and stable provider idempotency keys. Failed emails retry after fifteen minutes. The page remains the authoritative status if email delivery fails. Provider idempotency windows mean exactly-once delivery is not guaranteed after a prolonged delivery/database outage.

## Deployment and checks

- Deploy the main and admin apps with migration `20261026201743_personal_data_requests.sql` (applied to the connected Shyft project). The local migration version matches the database history.
- The `privacy_private` schema is server-only, denies browser-role access and enables RLS. Responses are not stored in public buckets or exposed through the Data API.
- Existing `DATABASE_URL`, Better Auth, `BETTER_AUTH_URL` and Resend configuration are reused. There is no new secret or paid service. The main app must run its scheduled Nitro task for cleanup and email delivery.
- In development, existing email test-recipient routing still applies. Do not test by making real user requests or sending production disclosures.
- Run `supabase/tests/personal_data_requests.sql` as written, retaining its `ROLLBACK`. The collection integration test also uses only a disposable subject inside a rolled-back transaction when `DATABASE_URL` is provided.
