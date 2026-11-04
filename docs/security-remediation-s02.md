# S02: protect NFC station keys

Updated 30 October 2026. The database restriction is applied and verified on hosted Supabase project `txcleqsbnblbkuihndyc`. The customer-response fix is implemented and tested locally, awaiting deployment of the main app. S02 remains open until that deployment is verified.

## What was exposed

The `clock_tags_select_manager` RLS policy allowed workplace owners, admins, managers and supervisors to read their location's complete `public.clock_tags` rows through the Data API. Both browser roles, `anon` and `authenticated`, had table-level privileges covering the AES key and legacy token hash. A valid Better Auth session could satisfy the policy. RLS restricted which rows were visible, but did not hide secret columns.

Remediation also found that `getClockSettingsPageData` selected `ntag_aes_key_hex` and returned it as `ntagTags[].aesKeyHex` to customers authorized to update clock settings. This path used the privileged server client, so blocking browser database roles alone would not close the finding.

## Changes

- Hosted migration `20261030153203_restrict_clock_tag_browser_access` removes all table and column privileges on `public.clock_tags` from `PUBLIC`, `anon` and `authenticated`. It removes the workforce read policy, keeps RLS enabled and establishes an explicit server-role policy. Server access and server-only scan RPCs remain available.
- Customer settings now use a separate server module that selects only station metadata. Its validated response has no AES key or token hash. A dedicated summary type keeps customer data separate from operator provisioning data. Station counts and settings UI remain available.
- Operator provisioning retains its permission checks and existing audit logging. The dedicated admin tests verify that `clock_stations.manage` is required before setup reads or generation, and that generation uses the authenticated operator identity. The separate legacy-admin allowlist issue remains S07.

No existing tag key was fetched, changed or rotated. Existing stations were not disabled.

## Verification evidence

The migration was first tested against hosted Supabase inside a transaction that was rolled back, including simulated historical column-only grants. It was then applied and the same fixture checks were repeated against the actual hosted permissions.

| Check | Result |
| --- | --- |
| Effective table and column reads for `anon` and `authenticated` | Denied |
| Valid synthetic owner, admin, manager and supervisor sessions through both browser roles | AES and wildcard reads denied in all eight combinations |
| Direct Data API AES and wildcard queries with the browser publishable key | HTTP 401, using `limit=0` |
| The same zero-row Data API requests with the server secret key | HTTP 200 |
| Server-role tag creation and key lookup | Passed using disposable fixture data |
| Server scan claim, counter replay rejection and clock-in/clock-out recording | Passed using disposable fixtures in `supabase/tests/clock_tag_access.sql` |
| Customer metadata, NFC cryptographic vectors and clock settings tests | 11 passed |
| Dedicated admin permission, generation and station assignment tests | 8 passed |
| Main and admin TypeScript checks; focused ESLint | Passed |
| Main app production build | Passed |

All synthetic users, sessions, workplace records, tag data and scan activity were rolled back. The HTTP checks requested zero rows. Existing customer records and real keys were not retrieved. Migration history in the repository matches the hosted migration version.

The post-change Supabase advisors no longer list `clock_tags` among browser-visible GraphQL tables. Other existing advisor findings remain outside S02. The relevant advisor references are [anonymous GraphQL table exposure](https://supabase.com/docs/guides/database/database-linter?lint=0026_pg_graphql_anon_table_exposed) and [authenticated GraphQL table exposure](https://supabase.com/docs/guides/database/database-linter?lint=0027_pg_graphql_authenticated_table_exposed). Effective privileges and actual API requests were also checked directly.

## Remaining rollout and key review

1. Deploy the main app containing the customer-summary change. The database restriction is already active and is compatible with the existing privileged server clients. The dedicated admin runtime has no production-code change in this fix.
2. Load clock settings as a disposable customer manager. Inspect the actual server response and confirm there is no `aesKeyHex`, `ntag_aes_key_hex` or token hash; confirm registered-station counts still display. Test authorized operator setup and a physical station tap through the normal test workbook.
3. Treat keys previously delivered to an untrusted customer browser as exposed. If real customer accounts used the old clock-settings page, disable the affected old tag credentials and physically reprogram those stations with fresh keys. Coordinate this because a key change requires updating the physical tag. No bulk rotation was performed automatically.
4. Close S02 after the deployed customer response is verified and any required key rotation is complete.

References: [Supabase column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security) explains why a column revoke cannot override an existing table grant. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) explains row policies and privileged server access.
