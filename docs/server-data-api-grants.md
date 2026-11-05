# Server Data API grants

Staging permission failures on 5 November 2026 were caused by missing explicit
service-role grants. Production retained its older grants. The server-only client
in src/lib/supabase.server.ts uses the Data API; direct Postgres queries use a
separate connection and do not need these grants. See [Supabase’s announcement](https://github.com/orgs/supabase/discussions/45329).

Migration 20261105213526_grant_application_server_api_access.sql is applied to
RocketRota Staging. Production was inspected read-only. It covers the 22 tables
referenced by current server Data API queries, with only their required operations.
Existing grants are additive: this migration does not revoke older privileges.
Browser roles, RLS, default privileges, private schemas and function permissions
are unchanged. The three clocking RPC functions already allow service_role execution.

Required operations from the query audit (SELECT is also granted for returned rows):

| Table | Operations |
| --- | --- |
| `clock_attempts` | SELECT |
| `clock_events` | INSERT |
| `clock_scan_sessions` | SELECT |
| `clock_tags` | SELECT |
| `employee_location_assignments` | SELECT |
| `employees` | SELECT |
| `invitation` | SELECT |
| `location_clock_settings` | SELECT, INSERT, UPDATE |
| `locations` | SELECT |
| `organization` | SELECT |
| `organization_onboarding_states` | SELECT, INSERT, UPDATE |
| `rota_published_shift_assignments` | INSERT, SELECT |
| `rota_published_shifts` | DELETE, SELECT |
| `rota_reads` | SELECT, INSERT, UPDATE |
| `rota_shift_assignments` | DELETE, INSERT, SELECT, UPDATE |
| `rota_shifts` | SELECT |
| `rotas` | SELECT, UPDATE |
| `staff_groups` | SELECT, UPDATE |
| `staff_invite_links` | SELECT, UPDATE |
| `time_entries` | INSERT, SELECT, UPDATE |
| `user` | SELECT |
| `zones` | SELECT |

Run supabase/tests/server_api_grants.sql as postgres after applying migrations. It
asserts every required grant, checks RLS and browser-role restrictions, then runs
21 actual reads and representative writes under service_role in a rolled-back
transaction. These checks passed on staging, including the clock-settings upsert.
The security advisor reported the same 13 existing informational notices about
RLS-enabled tables without policies before and after this migration.

When adding a new Data API table or operation, include its explicit service-role
grant in that feature’s migration and update the verification matrix. Direct
Postgres-only tables need no additional Data API exposure.
