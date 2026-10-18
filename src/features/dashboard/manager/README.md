# Manager dashboard

Managers and supervisors enter through the existing workspace dashboard route
and can switch between My dashboard and Manager dashboard using the dashboard
tabs. The `view` search parameter preserves the selected view across refreshes
and browser history; management remains their default. Employees retain their
personal dashboard and cannot select the management view. Only the selected
dashboard's data is loaded. Every server function verifies the
session, active organisation, management capability and permitted locations.
Time & Attendance data is gated by each location's existing entitlement.

Personal and manager views are separate lazy client chunks. The dashboard loader
imports the manager data loader only for an authorised management view; employee
visits, including a forged `view=manager` URL, use the personal view. The welcome
tour is imported only when it should be shown. Public JavaScript is not an access
control boundary: manager data and actions remain authorised on the server.

Create rota uses a lightweight trigger and dialog shell. Its form and preview
logic load on first open, then remain mounted for subsequent opens and closing
transitions. Keep the form behind that first-open condition: mounting a lazy
component immediately starts its import even when its dialog is closed.

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
