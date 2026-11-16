# Manager dashboard

Dashboard (`/dashboard`) shows the signed-in user's shifts and announcements.
Manage (`/manage`) shows staffing, attendance and upcoming rotas. Its sidebar
link and route require rota or time tracking management permissions. Old
workspace links with `view=manager` redirect authorised users to Manage with
their date and location filters. Both routes load their own data and lazy client
chunks, and Dashboard hosts the welcome tour.

Every manager server function verifies the session, active organisation,
management capability and permitted locations. Time & Attendance data is gated
by each location's existing entitlement.

Create rota uses a lightweight trigger and dialog shell. Its form and preview
logic load on first open, then remain mounted for subsequent opens and closing
transitions. Keep the form behind that first-open condition: mounting a lazy
component immediately starts its import even when its dialog is closed.

- Day staffing uses published assignments and recorded attendance. Local day
  boundaries, operating hours, split shifts and overnight shifts are resolved in
  the location's configured timezone. Repeated local times use the same earlier
  instant as the application's timezone helper.
- The attention query has no selected-day input or historical lookback limit.
  It counts all supported unresolved items before paging and shows one item at a
  time, newest first across all issue types. Older items remain available through
  compact pagination. Arrival monitoring
  starts at the clock configuration's creation time and uses its grace period;
  it does not classify an employee as absent.
- Arrival acknowledgements require a reason and retain the authenticated actor
  and timestamp. They do not create attendance or adjust payable time. Reviews use
  the unchanged shift's schedule identity, surviving replaced published snapshot
  IDs when a rota is republished. Apply
  `20261017211620_manager_dashboard_arrival_resolutions.sql` before deploying.
- Employee actions use the existing clock-in, clock-out and time review workflows.
  The clock-out applies to the row with the open entry. Timesheet shortcuts link
  to the exact entry in its original week. Existing clock/timesheet
  mutations invalidate dashboard queries. Historical attendance does not poll; the independent current
  attention queue refreshes once a minute.
- Break tracking is intentionally deferred. No break controls, statuses or
  changes to paid/unpaid time are introduced.

The SQL integration tests run when `DATABASE_URL` is available. All fixtures use
connection-local temporary tables inside rolled-back transactions; the tests do
not write application records or apply migrations to the configured database.

## Presentation

On phones, the team appears first, followed by outstanding attention items and
rota planning. At wide widths, the summary cards stack in the left column,
with the team in the centre and attention and planning stacked on the right.

Dashboard content follows the root `DESIGN.md` and its reference study. Team,
attention and planning share `DashboardCard` with the desktop personal dashboard.
It uses PanelUI's `Frame` band variant with a lightly tinted heading and an inset
card surface.
The summary metrics use the same band variant with a button as the frame root.
Manager controls use 32px desktop sizing and 44px phone hit areas. Primary
buttons use the rota Publish blue; secondary actions use the Notes treatment.
Button labels are semibold.

Three summary cards use real counts on tablet and desktop. Location and date
controls establish staffing scope; attention explicitly spans all locations and
dates. The staffing table shares its column tracks and 16px insets between header
and rows, with a compact layout below its container breakpoint. Neutral employee
initials leave colour for actions and text-labelled statuses. Attention paging,
permission checks, data loading and mutation boundaries remain unchanged.
