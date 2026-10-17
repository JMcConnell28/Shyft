# Manager dashboard

Managers and supervisors enter through the existing workspace dashboard route;
employees retain their personal dashboard. Every server function verifies the
session, active organisation, management capability and permitted locations.
Time & Attendance data is gated by each location's existing entitlement.

- Day staffing uses published assignments and recorded attendance. Local day
  boundaries, operating hours, split shifts and overnight shifts are resolved in
  the location's configured timezone. Repeated local times use the same earlier
  instant as the application's timezone helper.
- The attention query has no selected-day input or historical lookback limit.
  It counts all supported unresolved items before paging, prioritising clock
  issues, then unrecorded arrivals, then swap/cover requests. Arrival monitoring
  starts at the clock configuration's creation time and uses its grace period;
  it does not classify an employee as absent.
- Arrival acknowledgements require a reason and retain the authenticated actor
  and timestamp. They do not create attendance or adjust payable time. Reviews use
  the unchanged shift's schedule identity, surviving replaced published snapshot
  IDs when a rota is republished. Apply
  `20261017211620_manager_dashboard_arrival_resolutions.sql` before deploying.
- Clock overrides and approvals reuse the time-clock workflows. Corrections link
  to the exact entry in its original timesheet week. Existing clock/timesheet
  mutations invalidate dashboard queries. Historical attendance does not poll; the independent current
  attention queue refreshes once a minute.
- Break tracking is intentionally deferred. No break controls, statuses or
  changes to paid/unpaid time are introduced.

The SQL integration tests run when `DATABASE_URL` is available. All fixtures use
connection-local temporary tables inside rolled-back transactions; the tests do
not write application records or apply migrations to the configured database.
