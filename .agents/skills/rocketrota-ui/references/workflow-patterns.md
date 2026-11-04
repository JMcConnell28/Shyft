# Workflow and interaction patterns

## Manager dashboard

Start with `src/features/dashboard/manager/components/manager-dashboard.tsx` and the shared `dashboard-layout.tsx` under `src/features/dashboard/components/`. Read the manager feature's README for attendance semantics and access constraints.

- **Before service or during a shift.** A manager should know the selected location and date, the staffing position and the next actionable issue without scanning decorative KPIs. Use a compact filter header and a short status summary. Keep the attention review close to its reason and evidence. Use grouped team rows for comparison and reserve a separate surface for a distinct workflow such as attention.
- **Responsive order.** On mobile, put the independent attention queue ahead of the team list after the staffing summary, with coming-up planning after the team. Desktop can show the team and attention side by side. Keep the focus order intelligible when the visual layout changes.
- **Scope and freshness.** The team follows the selected location and day. Attention has separate paging and spans unresolved items across permitted locations and dates. Keep that scope visible even when the pager is present, and handle failures separately. Preserve useful staffing during refresh and indicate stale data if refresh fails. Keep My dashboard and Manager dashboard role-gated and preserve navigation state when changing their UI.
- **Attendance meaning.** Distinguish scheduled, working and review states. Do not present an arrival exception as absence or imply that acknowledgement edits attendance or payable time. Use the existing location timezone and feature formatters.

## Rota management

Start with `src/features/rota/components/`. Read `rota-workspace.tsx`, `tool-bar.tsx`, `week-container.tsx`, `week-summary.tsx` and `shift-actions-menu.tsx` for the editable board. Read `rota-view-workspace.tsx` and `published-rota-day.tsx` for the published view. The list has distinct mobile and desktop compositions.

- **Planning and comparison.** Treat the seven-day grid as the desktop workspace. Align days, shift times, assigned names and summaries. Keep week, zone and draft or published state easy to find during editing. Keep repeated shift surfaces compact and use clear text for vacancies, overlaps and other exceptions. At the lower desktop width, check the seven days with the workspace sidebar (13rem) and employee list (16rem) expanded. Use the existing sidebar collapse affordance before compressing shift labels. Prefer one contained scroll region per axis and keep labels in view when the task depends on them.
- **Touch and keyboard.** The current board uses mouse and touch sensors. Use explicit, keyboard-operable actions for assignment flows touched by the task, including the existing Assign employee dialog. Check that any move or remove action in scope has a discoverable non-drag path. Preserve touch scrolling and provide a clear way to see the active day and reach other days. The published mobile view currently uses two snap columns, while the editable board's week container defaults to one day column.
- **Editing and publication.** Keep Save distinct from Publish or Republish. Preserve unsaved-change protection in `rota-navigation-blocker.tsx`, existing conflict feedback, capability rules and read-only published views. Make busy, blocked and failed actions legible and retain draft context after an error. Show week and publication scope before an action that affects staff.

## Employee shifts and timesheets

Start with `src/features/dashboard/components/personal-dashboard-content.tsx` for clock status, next shift, weekly shifts and announcements. Use `src/features/timesheets/components/timesheet-header.tsx`, `my-timesheet-view.tsx`, `employee-timesheet-entries.tsx` and `timesheet-status.tsx` for personal time records. The team view is a separate, capability-gated workflow.

- **Personal dashboard.** Lead with current clock status or next relevant shift, then let staff scan upcoming shifts. Keep day, time and location together and use contextual links to the relevant rota. Keep management controls out of the employee composition.
- **Timesheet scan.** Put the selected week and useful totals first. On mobile, use the existing date, details and right-aligned duration structure. Keep scheduled time, actual clock record, worked time and payable time distinct wherever shown. Use existing status labels and make missing records different from zero duration. Keep secondary comparisons compact if they push entries out of view. During rapid week navigation, distinguish the pending selection from the week the displayed totals and entries belong to. Check this with a delayed response.
- **Data meaning.** Use the existing time and duration formatters and timezone helpers. Check overnight shifts, multiple entries on a day, open clock records and review-required entries. Preserve privacy and edit capabilities when changing layout. A responsive row may reorder fields, but information needed to understand a discrepancy must remain reachable.

## Mobile and interaction defaults

- Fit the core workflow to a narrow viewport first, then use wider space for comparison, supporting panels or denser tables. Keep a clear scroll owner. Avoid shrinking a desktop grid or hiding a vital field to make it fit. Adapt the layout and keep a usable path to detail.
- Aim for about 44 CSS px hit areas for frequent mobile controls, with space between neighbours. Check the actual hit region of icon buttons and date controls. Use a visible label for ambiguous actions and an accessible name for icon-only controls. Give swipe or drag gestures a control-based alternative where needed.
- Account for the app shell, safe-area insets and the on-screen keyboard. Keep sticky controls from covering the final row, dialog action or focused field. Test short installed-PWA and browser viewports where available. Keep zoom available.
- Preserve search, selection and focus where context still applies. Use visible focus, semantic controls and text or a control marker alongside colour for status and selection. Scope disabled reasons, progress and errors to the affected action. Retain entered values on failure and give users a clear recovery path. Use a toast for brief confirmation and inline feedback for a problem that requires action.
