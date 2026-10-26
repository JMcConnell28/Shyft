# RocketRota: how the app works

This map describes the workflows implemented in this checkout, reviewed on 26 October 2026. It is based on routes, feature modules, server actions and the in-app help guides; it does not certify the state of a deployed environment. Arrows show workflow or data dependencies, rather than every navigation link.

## 1. Whole-app overview

```mermaid
flowchart TD
  Public["Website, pricing, demo and help"] --> Auth["Create account / sign in"]
  Auth --> Verify["Verify email"]
  Verify --> Access{"Workplace access?"}
  Access -->|Create business| Setup["Create workplace, first location and zones"]
  Access -->|Join business| Join["Accept invitation / request approval"]
  Access -->|Existing member| Workspace["Choose workplace"]
  Setup --> Workspace
  Join --> Workspace
  Workspace --> Dashboard["Personal / manager dashboard"]
  Dashboard --> People["Employees, roles, location access and groups"]
  People --> Draft["Build and save weekly rota"]
  Draft --> Publish["Publish staff version"]
  Publish --> View["Staff view shifts; email / push if enabled"]
  View --> Swaps["Swap / cover request → colleague → manager"]
  Swaps -->|Approved assignment change| View
  View --> Clock["NFC clock-in / out when attendance is activated"]
  Clock --> Review["Review exceptions and correct attendance"]
  Review --> Sheets["Personal / team timesheets"]
  Sheets --> Export["Completed-week Sage CSV → payroll team"]
  Dashboard --> Comms["Announcements, polls and support"]
  Dashboard --> Settings["Workplace and location settings"]
  Settings --> Billing["Trial, subscription and attendance add-on"]
  Billing -.->|Feature access| Draft
  Billing -.->|Attendance access| Clock
  Billing --> Hardware["Clock station claim / extra station order"]
  Hardware --> Admin["Separate admin app: customers, dispatch and support"]
  Comms -->|Support threads| Admin
```

## 2. Accounts, joining and permissions

```mermaid
flowchart TD
  Start["Sign up / sign in"] --> Verified{"Email verified?"}
  Verified -->|No| Email["Verification email"] --> Verified
  Verified -->|Yes| Intent{"Create or join?"}
  Intent -->|Create| Org["Create organization; bootstrap owner and default staff group"]
  Org --> Location["Create first location and zones; set up trial"]
  Location --> Invite["Optionally invite staff"]
  Intent -->|Staff joining link| Request["Submit join request"]
  Request --> Decision{"Authorized manager approves?"}
  Decision -->|No / pending| Status["Denied / awaiting approval"]
  Decision -->|Yes| Link["Create or match employee and link account"]
  Intent -->|Direct organization invitation| Accept["Validate and accept invitation"]
  Invite --> Choose["Choose workplace"]
  Link --> Choose
  Accept --> Choose
  Choose --> Scope["Check organization membership and location scope"]
  Scope --> Role{"Role and capabilities"}
  Role --> Owner["Owner / admin: configuration and company management"]
  Role --> Manager["Manager: rotas, approvals and operations in scope"]
  Role --> Supervisor["Supervisor: limited operational permissions"]
  Role --> Employee["Employee: personal shifts, attendance and requests"]
```

An account can belong to multiple workplaces. Role permissions, location access, staff groups and **Show on rota** have separate purposes. Joining a workplace does not assign shifts. Account settings cover profile, password, passkeys, sessions and preferences; device push and PWA installation support mobile use.

## 3. People and weekly rota planning

```mermaid
flowchart TD
  Company["Company: employee profiles, pay and payroll references"] --> Eligibility["Location activity, staff groups and Show on rota"]
  Config["Location: zones, closing times and rota defaults"] --> New["Choose location and Monday–Sunday week"]
  Eligibility --> New
  New --> Source{"Starting point"}
  Source --> Blank["Blank rota"]
  Source --> Copy["Copy previous rota"]
  Source --> Template["Saved template, when enabled"]
  Blank --> Edit["Add shifts, zones, groups and employees"]
  Copy --> Edit
  Template --> Edit
  Edit --> Checks["Check overlaps, split / overnight shifts, hours and coverage"]
  Checks --> Cost["Review estimated cost and budget, where permitted / enabled"]
  Cost --> Save["Review and save working version"]
  Save --> Publish["Publish a snapshot for staff"]
  Publish --> Staff["Published rota and personal shifts"]
  Publish --> Notify["Email and device push when enabled"]
  Publish --> PDF["Export PDF snapshot"]
  Publish --> Changes["Edit working version; published version remains visible"]
  Changes --> Save
  Save -->|Republish| Publish
```

Saving and publishing are separate. Templates and copying reduce setup work; managers still confirm availability with staff. Approved swap overrides are reapplied when a rota is republished. Authorized users can also unpublish a rota or delete a draft. Employee removal revokes access and removes future assignments while retaining historical records; rehiring restores employee access with selected locations.

## 4. Shift swaps and cover

```mermaid
flowchart TD
  Shift["Employee chooses eligible future published shift"] --> Type{"Request type"}
  Type -->|Swap| Swap["Select colleague and their shift"]
  Swap --> Peer{"Colleague response"}
  Peer -->|Accept| Pending["Pending manager review"]
  Peer -->|Decline| Denied["Denied; assignments stay unchanged"]
  Type -->|Cover| Open["Open cover request"]
  Open --> Offer["Eligible colleague offers cover"]
  Offer --> Pending
  Pending --> Recheck["Recheck shifts, location / group eligibility, overlaps and timing"]
  Recheck --> Decision{"Manager decision"}
  Decision -->|Approve| Apply["Update published assignments and record override"]
  Decision -->|Deny| Denied
  Apply --> Updated["Updated staff schedule"]
  Shift -.-> Cancel["Cancellation / expiry leaves assignments unchanged"]
```

This workflow requires enabled workplace settings, relevant location feature access and user permissions. A peer's acceptance alone does not change the rota.

## 5. Clocking, attendance review and payroll export

```mermaid
flowchart TD
  Setup["Register NFC station; activate location attendance; configure rules"] --> Tap["Employee signs in and taps station"]
  Tap --> Verify["Verify secure tag and fresh scan session"]
  Verify --> Match["Match employee, location and scheduled working period"]
  Match --> In["Confirm clock-in; record actual and payable start"]
  In --> Open["Open attendance entry"]
  Open --> Out["Fresh tap and confirmed clock-out"]
  Open --> Missed["Overdue background check"]
  Missed --> Reminder["Attempt reminder when due"]
  Missed --> Auto["At configured limit: estimated automatic finish"]
  Out --> Rules["Apply payable-time rules and review flags"]
  Auto --> Review["Manager review required"]
  Rules --> Review
  Manual["Manager records missed punch with actual time and reason"] --> Review
  Review --> Resolution["Approve accurate record / correct with reason and audit history"]
  Resolution --> Timesheets["Personal / team timesheets: scheduled, worked and payable time"]
  Timesheets --> Ready{"Completed week; no open / unreviewed entries; Sage references present?"}
  Ready -->|No| Fix["Resolve attendance or employee reference issues"] --> Timesheets
  Ready -->|Yes| CSV["Download Sage CSV"]
  CSV --> Payroll["Payroll team checks file and imports into Sage"]
```

The manager dashboard combines published staffing and attendance, with an attention queue for clock issues, unrecorded arrivals and swap requests. Acknowledging an arrival alert records a reason; it does not create attendance. Automatic clock-out proceeds independently of reminder delivery. Routine valid clock-outs can close directly; exceptional and automatic entries require review. Sage output is a file export; payroll processing remains outside RocketRota.

## 6. Communication, support and personal controls

```mermaid
flowchart TD
  Manager["Authorized manager"] --> Post["Create announcement for workplace / selected locations"]
  Post --> Feed["Announcement feed and dashboard"]
  Post --> Push["New-announcement push to eligible opted-in devices"]
  Feed --> Read["Read / unread tracking"]
  Feed --> Poll["Vote in optional poll"]
  Manager --> Maintain["Edit, pin or archive announcement"]
  User["Workspace user"] --> Help["Search help centre"]
  User --> Ticket["Create support, bug or feature-request thread"]
  Ticket --> Admin["Admin support queue"]
  Admin --> Reply["Reply; manage open / waiting / resolved / closed state"]
  Reply --> Inbox["Customer thread and unread notifications"]
  Inbox -->|Customer replies| Admin
  User --> Account["Account profile, security and notification preferences"]
```

Push delivery depends on user preferences and device subscriptions. Edits, pinning and poll activity do not trigger another new-announcement push. Support threads connect the customer app to the separate admin app.

## 7. Billing, hardware and platform administration

```mermaid
flowchart TD
  Owner["Authorized billing owner / administrator"] --> Billing["Billing settings: trial, payment method, subscription, usage and invoices"]
  Billing --> Stripe["Stripe checkout / billing portal"]
  Stripe --> Events["Verified webhook events and reconciliation"]
  Events --> Access["Location entitlement: trial / active / grace / recovery"]
  Access --> Core["Allow relevant writes or show view-only restriction"]
  Owner --> Attendance["Clocking setup: activate Time & Attendance per location"]
  Attendance --> Addon["Attendance add-on billing and access"]
  Addon --> Claim["Claim included station; qualifying paid invoice required for dispatch"]
  Addon --> Extra["Eligible paid location orders additional station"]
  Extra --> Payment["One-off checkout; validate settled payment"]
  Claim --> Queue["Admin customer / clock-station queue"]
  Payment --> Queue
  Queue --> Prepare["Confirm eligibility, delivery address and assigned active NFC tag"]
  Prepare --> Dispatch["Needs setup → ready to send → sent → delivered"]
  Admin["Separate platform admin app"] --> Queue
  Admin --> Operations["Customers, workspaces, users and billing oversight"]
  Admin --> Support["Support conversations"]
  Admin --> Flags["Global feature flags and location overrides"]
  Admin --> Audit["Events, errors and audit records"]
  Flags -.-> Core
  Flags -.-> Addon
```

Feature availability combines billing entitlements, user permissions, workplace settings and platform feature flags. Enabling a flag does not grant a paid entitlement or permission. Station payment and eligibility checks precede dispatch; a checkout return page alone does not release hardware.

## 8. How the code supports these workflows

```mermaid
flowchart TD
  Browser["Browser / installed PWA"] --> Routes["TanStack Start routes and feature components"]
  Routes --> Hooks["Feature hooks, TanStack Query cache and forms"]
  Hooks --> Server["Typed server functions"]
  Server --> Validate["Zod input validation"]
  Validate --> Auth["Better Auth session, membership and permissions"]
  Auth --> Guards["Location scope, billing and feature checks"]
  Guards --> Data["Feature server / data modules"]
  Data --> DB["Supabase Postgres via server clients / database pool"]
  Data --> Services["Billing, email and Web Push services"]
  DB --> Result["Typed results and feature query refresh"]
  Result --> Browser
  Workers["Background tasks"] --> Jobs["Missed clock-outs, billing reconciliation and station alerts"]
  Jobs --> Data
```

This is the principal application request path; authentication handlers, webhooks, background jobs and legacy paths have their own entry points. Server actions enforce access independently of visible UI controls.

## Scope and source references

The original product requirements include aspirations beyond the implemented app. Standalone leave / availability management, tracked breaks, automated scheduling, payroll processing and a live Sage sync are not represented here as shipped workflows.

- [Routes](../src/routes), [platform admin routes](../apps/admin/src/routes) and [feature modules](../src/features).
- [Role permissions](../src/lib/auth/permissions.ts), [onboarding actions](../src/features/onboarding/server/organization-actions.ts) and [join approvals](../src/features/join-approvals/server/actions.ts).
- [Rota publishing](../src/features/rota/server/update-actions.ts), [publish notifications](../src/features/rota/server/publish-notifications.ts) and [swap actions](../src/features/shift-swaps/server/actions.ts).
- [Clock actions](../src/features/time-clock/server/actions.ts), [timesheet actions](../src/features/timesheets/server/actions.ts), [manager dashboard](../src/features/dashboard/manager/README.md) and [automatic clock-outs](automatic-clock-out.md).
- [In-app help guides](../src/features/help-center/data), [feature flags](feature-flags.md) and [station fulfillment](customer-station-fulfillment.md).
