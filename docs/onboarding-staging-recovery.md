# Organisation setup recovery

The staging incident on 5 November 2026 came from missing `service_role` table
privileges, confirmed by PostgREST `42501` logs. The first organisation was created
through Better Auth's Postgres connection, but the subsequent setup-state and
staff-group queries through the server Data API failed.

The migration `20261105202020_grant_organization_onboarding_access.sql` grants
only the operations used by this flow: reads of setup states, staff groups,
locations, zones and invite links; insert/update of setup states; and staff-group
normalization updates. It preserves RLS and browser-role restrictions, and makes
no changes to default privileges or function permissions. Supabase documents the
need for explicit grants in [Securing your API](https://supabase.com/docs/guides/api/securing-your-api).

This migration is applied to RocketRota Staging only. The partial organisation
from the reported failure was repaired with its missing setup state, Employee
group and workspace trial. The trial dates derive from the original creation
time. Existing records were preserved with conflict-safe inserts; no duplicate
organisation was created. Refreshing onboarding resumes workspace setup.

The form now subscribes to submission state and preserves the entered name on
failure. Unexpected errors give refresh and support guidance; session errors keep
their sign-in instruction. Submission and error handling live in a focused hook.

Validation includes rendered-form regression tests for repeated failures,
network errors, session errors and name correction. A transaction under staging's
`service_role` verified the setup-state upsert, staff-group update and required
reads, then rolled back. RLS remains enabled and `anon`/`authenticated` still have
no table access to these onboarding records.
