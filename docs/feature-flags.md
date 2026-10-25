# Managed feature flags

The admin **Feature flags** page controls implemented features across all locations.
Each customer's location also has a **Feature access** section for location overrides.
Only admins with `feature_flags.manage` can read or change these settings.

## Settings and precedence

- **Off everywhere** blocks the feature, including locations with an Enabled override.
- **Selected locations** enables only locations with an Enabled override.
- **All locations** enables the feature unless a location has a Disabled override.
- A location can choose **Use global setting**, **Enabled**, or **Disabled**.

Location overrides remain stored when a feature is turned off everywhere. Removing an
override restores inheritance. The UI shows the effective decision and its source.
Every change records the actor, time, before/after settings and optional reason in
the admin audit log. Revision checks prevent overwriting another admin's changes.

## Implemented catalogue

| Key | Controlled behavior |
| --- | --- |
| `rota.budget_manager` | Weekly budget editing, budget suggestions, variance indicators and publish warnings; saved budgets and labour cost totals are retained |
| `rota.templates` | Create, update and apply saved templates, including template-based draft creation |
| `rota.publishing` | Publish, republish and unpublish rotas |
| `shift_swaps` | Swap and cover workflows at permitted, enabled locations |
| `time_clock.clock_in` | Start new employee and manager clock-ins |
| `station_purchases` | Start checkout for extra physical stations |

Existing flags default to enabled so deployment preserves current behavior. Flags
restrict access in addition to billing entitlements, workspace settings and user
permissions; enabling a flag does not grant those permissions or paid access.
Published rota viewing, clock-out, time history and existing hardware orders remain
available. Disabling station purchases does not cancel checkout sessions already
created or interrupt payment processing and fulfilment.

## Evaluation and availability

Server reads batch all registered flags per location, deduplicate concurrent reads
and cache snapshots for 10 seconds. Customer controls poll every 20 seconds; normal
propagation is within approximately 30 seconds. Admin queries refresh every 15 seconds.
Direct server mutations enforce the same decisions; hiding a control is insufficient.
A database trigger additionally blocks new open time entries when clock-in is disabled,
including entries submitted through the existing clock RPC. Clock-out updates are allowed.

If a database refresh fails, the evaluator logs the error and retains that process's
last known snapshot, retrying after five seconds. A location with no cached snapshot
uses catalogue defaults. Flags therefore do not provide immediate shutdown guarantees
during database outages. Malformed boolean configuration is rejected rather than
coerced from strings. Workspace targeting and percentage rollout are not implemented.

## Adding a feature

1. Add the typed definition and intended default to
   `packages/shared/src/feature-flags/index.ts`.
2. Add a migration to register its initial configuration.
3. Enforce it at each server entry point after existing authorization. Use the
   location derived from trusted resource data, not an unchecked client location.
4. Connect the UI to the location snapshot and explain unavailable actions.
5. Test disabled direct requests, location precedence and workflows that must remain safe.

The migration `20261024193713_managed_feature_flags.sql` was applied to the connected
Supabase project during implementation. `supabase/tests/managed_feature_flags.sql`
contains rollback-only database checks for precedence and clock-in/clock-out behavior.
