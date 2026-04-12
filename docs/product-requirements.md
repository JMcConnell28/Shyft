# Shyft Product Requirements

## 1. Product Summary

Shyft is a rota management web application for hospitality teams and other shift-based businesses that need to build, publish, and adjust weekly schedules quickly. The product should reduce time spent creating rotas, improve staff visibility over shifts, and give managers better control over labour cost, coverage, availability, and change handling.

The first release should focus on a practical scheduling workflow for small to medium multi-role teams:

- Support one organization operating one or more locations.
- Support zones within each location, such as front bar or beer garden.
- Define locations, departments, roles, and staff.
- Collect staff availability and contracted hours.
- Build weekly rotas quickly.
- Publish rotas clearly to staff.
- Handle swaps, time-off, sickness, and last-minute edits.
- Track planned hours against budget and coverage needs.

The defining product bet is that rota creation and distribution should feel faster, easier, and more intuitive than spreadsheets or legacy scheduling tools.

## 2. Problem Statement

Teams in hospitality often manage rotas with spreadsheets, messaging apps, and manual updates. This creates recurring problems:

- Managers spend too much time rebuilding the rota each week.
- Staff do not always know when shifts change.
- Availability, contracted hours, and leave are hard to reconcile.
- Labour cost can drift without visibility during scheduling.
- Shift swaps and sickness are handled informally and are difficult to audit.
- Multi-site businesses struggle to standardize the process.
- Teams that share staff across sister venues struggle to control who can be assigned where.

Shyft should centralize this into one workflow with clear permissions, live updates, and an opinionated weekly scheduling experience.

## 3. Product Goals

- Cut rota creation and update time for managers.
- Increase schedule clarity and trust for staff.
- Reduce under-staffing, over-staffing, and shift conflicts.
- Make labour cost and scheduled hours visible before publishing.
- Create a foundation that scales from one venue to multiple locations.
- Make the weekly rota builder the fastest and most intuitive part of the product.
- Make onboarding fast, simple, and effective for new organizations.

## 4. Non-Goals For MVP

- Payroll processing.
- Full HR information system.
- Recruitment / applicant tracking.
- Detailed POS or accounting integrations.
- Native mobile apps.
- Advanced AI auto-scheduling.

These can be added later, but they should not delay an MVP aimed at weekly rota operations.

## 5. Target Users

### Primary Users

- General managers creating and approving weekly rotas.
- Assistant managers editing rotas and handling shift changes.
- Staff members viewing shifts, availability, and requests.

### Secondary Users

- Area managers overseeing multiple sites.
- Owners or finance leads reviewing labour performance.

## 6A. Operating Model

Shyft should support the following structure:

- An `organization` represents the business.
- A `location` represents a venue or premises owned by that organization.
- A `zone` represents an operational area within a location, such as `Front Bar`, `Beer Garden`, or `Function Room`.

This lets one business manage several venues while still building rotas at the right level of detail within each venue.

## 6. Core User Jobs

### Managers

- Create the next week’s rota from scratch or from a previous template.
- See who is available, trained, and within contracted hours.
- Spot coverage gaps before publishing.
- Publish the rota and notify the team.
- Respond to sickness, leave, and swap requests quickly.

### Staff

- View upcoming shifts clearly on web and mobile browser.
- Submit availability and time-off requests.
- Request shift swaps or offer shifts.
- See schedule updates without confusion.

### Area / Business Leads

- Compare labour plans across locations.
- Monitor rota compliance and labour spend.
- Ensure managers follow a consistent process.

## 7. MVP Scope

### 7.0 Core Feature: Weekly Rota Builder

The core feature of Shyft is a rota creation and distribution system designed primarily for desktop managers, while still working well on mobile for lighter staff-facing actions and limited management tasks.

Product intent for this feature:

- Fast to create a full weekly rota.
- Clear enough to understand at a glance.
- Powerful enough to support hospitality edge cases.
- Intuitive enough that managers can use it with minimal training.

Design direction:

- Desktop-first for building and editing rotas.
- Mobile-friendly for viewing rotas, responding to updates, and limited edits.
- High-performance interactions with minimal friction.

### 7.0.1 Rota Board Layout

- The rota board should display 7 columns, one for each day of the week.
- A persistent employee list should sit on the left side of the screen.
- Managers can drag employees from the left panel into shifts on the relevant day.
- Each day column should support one or more shifts.
- Each day column should have a clear “create shift” action.

### 7.0.2 Shift Creation Model

- Managers create shifts from a button on each day.
- A shift is defined initially by a time slot such as `11:00 - 19:00`.
- The system must support:
- Single shifts
- Split shifts
- Overnight shifts that continue into the next day, such as `19:00 - 03:00`
- Shift cards should visibly communicate start time, end time, role/group context, assigned employees, and status.

### 7.0.3 Drag And Drop

- Drag-and-drop should be implemented with `@dnd-kit`.
- Performance should be treated as a core requirement, especially for boards with many staff and shifts.
- Managers should be able to:
- Drag an employee into an empty shift
- Move an employee between shifts
- Reorder assignments if needed
- Remove an employee from a shift with minimal friction

### 7.0.4 Speed Tools

- The rota builder should include tools that reduce repetitive input.
- MVP acceleration features should include:
- Templates
- Copy and paste
- Clear all
- Duplicate prior rota / prior week
- Bulk edit where sensible

### 7.0.5 Employee Grouping

- Employees can be assigned to custom groups for easier rota management.
- Example groups:
- `Bar staff`
- `Floor staff`
- `Supervisors`
- Managers should be able to filter or visually segment the employee list by group.
- Grouping should support hospitality use cases first, but remain generic enough for other industries later.

### 7.0.6 Employee List Cards

- Each employee in the left-hand panel should be represented by a card.
- The employee card should display:
- Full name
- Group
- Number of assigned shifts for the selected week
- Total scheduled hours for the selected week

### 7.0.7 Validation Rules

- Employees cannot be assigned to multiple shifts in one day unless they are explicitly scheduled on a split shift pattern.
- The system should validate and warn or block on:
- Duplicate same-day assignments
- Overlapping shift times
- Assigning unavailable staff
- Assigning staff on approved leave
- Invalid overnight or split shift configuration

### 7.0.8 Distribution

- Once published, the rota should be distributed to staff through the app and by email notifications where enabled.
- Staff should be able to clearly see their weekly shifts on mobile and desktop.
- Mobile should prioritize viewing, acknowledgement, and lightweight request flows over full rota editing.
- Managers should be able to export the rota to PDF for printing and offline sharing.

### 7.1 Organization Structure

- Businesses can have one or more locations.
- Each location can define zones or work areas.
- Each staff member belongs to one primary location and may optionally work across multiple locations.
- Roles can be assigned per staff member, such as bartender, server, chef, host, supervisor, or manager.
- Zones belong to a single location and should be selectable when creating shifts.
- A rota is created for one location at a time, but shifts within that rota can be assigned to different zones in that location.

### 7.2 User Accounts And Permissions

- Email/password authentication.
- Passkey authentication should be supported for a faster mobile sign-in experience.
- Role-based access control.
- Suggested roles:
- `owner`
- `area_manager`
- `manager`
- `supervisor`
- `employee`

Permission direction:

- Owners and area managers can access multiple locations and reporting.
- Managers can manage staff, availability, leave, and rotas for their location.
- Supervisors can view and optionally edit rota data depending on policy.
- Employees can view their own schedule, availability, requests, and notifications.
- Staff mobile authentication should aim to feel as native as possible within a PWA experience.

### 7.2.2 Onboarding Principles

- Organization onboarding should be quick, simple, and effective.
- The product should avoid long, multi-step setup flows.
- The first-run experience should focus on getting a manager to a usable rota workflow as quickly as possible.
- Default data should be created automatically where helpful.

Default setup on new organization creation should include:

- A default employee group such as `Employees`
- A default owner membership for the creator
- A first location setup step or immediate prompt if not yet created

Recommended onboarding sequence:

1. Create account
2. Create organization
3. Add first location
4. Optionally add first zones
5. Land in a guided employee import or employee creation flow
6. Move into the rota builder quickly

Future improvement:

- Invite teammates during onboarding
- CSV import for employees
- Suggested starter zones for hospitality venues

### 7.2.1 Organization Membership And Location Eligibility

- Staff should join the organization as employees of the wider business, not as isolated members of a single location.
- An employee can then be toggled on or off for assignment eligibility at specific locations.
- Example:
- `John` belongs to the organization
- `John` may be eligible for `Bar 1`
- `John` may also be eligible for `Bar 2`
- If `John` is toggled off for `Bar 2`, managers of `Bar 2` should no longer be able to assign him to future shifts there

Required behavior:

- Managers can manage location eligibility from the employee list or employee profile.
- Eligible employees appear in that location’s rota employee list.
- Ineligible employees do not appear for future rota assignment in that location.
- Historical rota records must remain intact even if eligibility is later removed.
- Employees should still be able to view past rotas and past assigned shifts for locations where they previously worked.
- Employees should not see future rotas for locations where they are no longer eligible and no longer assigned.
- If a manager removes location eligibility for an employee, the system should warn that the employee will be removed from future assigned rotas for that location.
- Once confirmed, the system should automatically remove that employee from future rota assignments at that location.

### 7.3 Staff Management

- Create and edit employee profiles.
- Store basic employment details:
- Full name
- Contact details
- Employment status
- Primary role
- Secondary roles
- Contracted weekly hours
- Hourly cost or pay band
- Home location
- Start date
- Track skill or role eligibility for specific shifts.
- Mark staff as active or inactive.
- Manage which locations the employee is eligible to work in.
- Optionally define a primary location while still allowing cross-location assignment.
- Active and inactive employee status should be used both operationally and for billing.

### 7.4 Availability Management

- Staff can submit recurring availability.
- Staff can submit one-off unavailability for specific dates.
- Managers can override or edit availability when necessary.
- Availability should be visible directly in the rota-building flow.
- Availability may need to be scoped either organization-wide or by location depending on future policy design.

### 7.5 Time-Off And Absence Requests

- Staff can submit holiday / leave requests.
- Managers can approve or reject requests.
- Approved leave blocks rota assignment for affected periods.
- Managers can record sickness or emergency absence against scheduled shifts.

### 7.6 Shift And Rota Builder

- Create a rota by week for a location.
- Use a 7-column weekly board layout as the primary scheduling interface.
- View rota by day and by employee.
- Add shifts manually with:
- Date
- Start time
- End time
- Break duration
- Role
- Location
- Zone
- Notes
- Shift type:
- Single
- Split
- Overnight
- Duplicate previous week’s rota into a draft.
- Use drag-and-drop assignment powered by `@dnd-kit`.
- Detect common scheduling issues:
- Double-booking
- Overlapping shifts
- Assigning unavailable staff
- Assigning staff on approved leave
- Exceeding contracted hours threshold
- Missing required role coverage
- Multiple same-day shifts without split-shift intent
- Assigning an employee to a location where they are not eligible
- Managers can save rotas as draft until ready to publish.

### 7.7 Publishing And Staff Visibility

- Draft rota is private to managers until published.
- Publishing makes shifts visible to staff.
- Re-publishing after edits updates the live version.
- Staff can see:
- Upcoming shifts
- Shift details
- Location
- Notes
- Change history or “updated” state for modified shifts

- Managers can export the current rota view to PDF.
- Exported PDFs should be formatted for easy printing in the venue.

### 7.8 Shift Swaps And Open Shifts

- Staff can request to swap a shift with another eligible team member.
- Staff can mark a shift as needing cover, subject to policy.
- Managers approve or reject swap / cover outcomes.
- Managers can create open shifts that eligible staff can claim.

### 7.9 Notifications

- In-app notifications are MVP.
- Email notifications are recommended for important events:
- Rota published
- Shift changed
- Swap requested
- Swap approved or rejected
- Time-off approved or rejected

### 7.10 Labour And Coverage Visibility

- Show total scheduled hours for the week by employee and location.
- Show estimated labour cost using shift hours and pay rate / cost band.
- Highlight under-covered or unassigned shift requirements if staffing targets are configured.

### 7.11 PDF Export And Printing

- Managers should be able to export a weekly rota to PDF.
- The exported PDF should be print-friendly and easy to read in a venue environment.
- The initial PDF export should include:
- Organization name
- Location name
- Week range
- Day columns
- Shift times
- Employee assignments
- Zone information where relevant
- Future enhancement: support alternate print layouts such as by employee or by zone.
- The PDF layout should be optimized for paper rather than mirroring the on-screen rota board exactly.

## 8. Future Features

### Phase 2

- Multi-location dashboard and cross-site staff sharing.
- Role-based staffing templates per daypart.
- Shift approval workflows for supervisors.
- Better drag-and-drop planning board.
- SMS / WhatsApp style notification integrations.
- Employee acknowledgment of rota changes.
- Clock-in / clock-out integration.
- Export to payroll systems.

### Phase 3

- Demand forecasting based on sales or covers.
- Auto-scheduling suggestions based on availability, costs, and role needs.
- Compliance rules engine:
- Minimum rest periods
- Maximum weekly hours
- Break compliance
- Under-18 restrictions
- Location-specific labour law rules
- Document storage for contracts / certifications.
- Mobile apps.

## 9. Improvement Opportunities

These are product improvements we should intentionally design for even if they do not ship in v1:

- Faster rota creation using templates, cloning, and bulk actions.
- Cleaner staff self-service to reduce manager admin.
- Strong audit history for every rota change.
- Better visibility of “why” a shift is flagged.
- Flexible policies per business or location.
- A reporting model that can expand without redesigning the core data structure.

## 10. Functional Requirements

### Permissions And Access Control

- Permissions should be organization-aware through Better Auth organization membership.
- App access should then be scoped further by location access and employee/location eligibility rules inside the scheduling domain.
- Permissions should be easy to reason about, audit, and extend later.

Recommended permission roles for MVP:

- `owner`
- `admin`
- `manager`
- `supervisor`
- `employee`

Role intent:

- `owner`
- Full access across the organization
- Manage billing, organization settings, locations, zones, roles, and all users
- Can view and manage all rotas and reports

- `admin`
- Broad operational access across the organization without being the commercial owner
- Can manage locations, zones, employees, and rota configuration
- Can view and manage rotas across allowed locations

- `manager`
- Responsible for rota creation and staff management within assigned locations
- Can create, edit, publish, and export rotas for permitted locations
- Can manage employee location eligibility for permitted locations
- Can approve leave, swaps, and shift changes for permitted locations

- `supervisor`
- Limited operational access for day-to-day support
- Can view rotas for permitted locations
- May edit draft rotas if enabled by organization policy
- May manage certain requests if enabled by organization policy
- Should not change core organization settings by default

- `employee`
- Can view their own assigned shifts and rota history
- Can manage their own availability and requests
- Cannot edit rotas or manage other employees

Permission scope model:

- Organization roles determine broad access level.
- Location access determines which locations a non-owner user can operate in.
- Employee location eligibility determines where an employee can be scheduled.
- These are separate concerns and should not be collapsed into one rule.

Manager-facing permission rules:

- Owners and admins can create and manage locations and zones.
- Owners and admins can assign managers and supervisors to specific locations.
- Managers can only create or publish rotas for locations they have access to.
- Managers can only edit employees, requests, and assignments for locations they manage.
- Supervisors should be permissioned through feature flags or policy toggles where behavior may vary by business.

Employee-facing permission rules:

- Employees can see past shifts for locations where they were historically assigned.
- Employees can see future shifts only where they are currently assigned.
- Employees do not need general access to browse all location rotas in the organization.

Audit requirements for permissions:

- The system should log key permission changes such as:
- Role assignment
- Location access granted or removed
- Employee location eligibility toggled on or off
- Managers should be able to see who changed permissions and when.

### Scheduling Rules

- A shift belongs to one employee, one date, one location, and one role.
- A shift may optionally belong to a zone within the location.
- Shifts must support unpaid or paid break duration.
- Shifts must support overnight end times that roll into the next calendar day.
- Shifts must support explicit split-shift scheduling.
- A draft rota can contain unpublished changes.
- Published rota should preserve a revision history.
- The system should prevent or warn on conflicting assignments.
- A staff member cannot have multiple shifts on the same day unless those shifts are recorded as part of a valid split-shift arrangement.
- A staff member must be location-eligible to be assigned to future shifts at that location.
- Removing location eligibility must not delete or rewrite historical shift records.
- Removing location eligibility should automatically unassign the employee from future scheduled shifts at that location after manager confirmation.

### Request Workflows

- Requests have states such as `pending`, `approved`, `rejected`, `cancelled`.
- Time-off requests must affect scheduling eligibility when approved.
- Swap requests should preserve an approval trail.

### Auditability

- The system should log who created, edited, published, approved, or rejected key records.
- Managers should be able to review recent rota changes.

### Search And Filtering

- Managers should be able to filter by location, role, employee, date range, and request status.
- The rota board should support filtering or grouping the employee panel by custom staff group.

## 11. Non-Functional Requirements

- Mobile-responsive for staff usage on phones.
- Desktop-first management experience for rota building.
- Mobile experience should support rota viewing and limited actions without requiring the full desktop editing workflow.
- The app should be installable as a Progressive Web App.
- The PWA should support a strong mobile home-screen experience for staff and lightweight management usage.
- The staff mobile experience should feel app-like, including low-friction authentication such as passkeys where supported.
- Good performance for weekly views with at least 100 staff at a location.
- Drag-and-drop interactions should remain responsive on rota boards with high shift and employee counts.
- Accessible UI with keyboard support and clear contrast.
- Secure tenant isolation between businesses.
- Historical scheduling data must remain consistent even when staff eligibility changes over time.
- Eligibility changes should have clear confirmation messaging before future shifts are removed.
- Reliable audit trail for key scheduling actions.
- Clear time zone handling at business/location level.

## 12. Initial Tech Stack

This stack reflects the direction we are committing to for the first version of Shyft.

### Frontend

- TanStack Start for app structure and SSR-friendly routing.
- React 19 with TypeScript.
- shadcn/ui + Base UI primitives for the design system.
- Tailwind CSS v4 for styling.
- TanStack Router for typed route organization.
- Progressive Web App support for installability and improved mobile access.

### State And Caching

- TanStack Query for server state and caching.
- Zustand for high-interaction client state, especially within the rota builder.
- Zod for schema validation across forms and API boundaries.
- TanStack Form for application forms and validation flows.

### Authentication And Multi-Tenancy

- Better Auth for authentication.
- Better Auth Organizations plugin for multi-tenant business and location membership flows.
- Better Auth Passkey plugin for passwordless sign-in on supported devices.
- Role and permission logic should align with organization membership and location-scoped access.

Why Better Auth:

- Good fit for app-level auth flows while still using Supabase as the database.
- Organizations support maps well to multi-tenant rota management.
- Gives us flexibility over auth and membership design without tying all auth concerns to Supabase Auth.

### Backend And Database

- Supabase Postgres as the primary relational database.
- Supabase Row Level Security for tenant isolation.
- Supabase Storage for future document uploads if needed.
- Supabase Realtime is optional later for live rota updates, notifications, or presence.

Why Supabase:

- Strong relational model for locations, employees, shifts, leave, and rota versions.
- Fast setup and good operational ergonomics for an early-stage SaaS product.
- Works well alongside Better Auth when we want the database and platform benefits without relying on Supabase Auth as the primary auth layer.

### Email And Notifications

- Resend for transactional email delivery.
- Use for key product emails such as invites, rota published, shift changed, swap status, and leave decision notifications.

### Supporting Libraries

- `date-fns` for date logic, already present.
- Consider `date-fns-tz` or equivalent for time zone helpers.
- `@dnd-kit` for high-performance rota drag-and-drop interactions.
- Consider `sonner` for in-app notifications, already present.
- Prefer a dedicated print view and browser print or HTML-to-PDF approach for rota exports so layout stays maintainable and consistent with the web UI.

### Testing

- Vitest for unit and component tests.
- Testing Library for UI tests.
- Add Playwright later for end-to-end scheduling flows.

## 13. Suggested Data Model Domains

- `organizations`
- `locations`
- `zones`
- `users`
- `memberships`
- `employees`
- `employee_location_assignments`
- `employee_groups`
- `employee_roles`
- `subscriptions`
- `billing_periods`
- `employee_billing_snapshots`
- `availability_rules`
- `availability_exceptions`
- `leave_requests`
- `rotas`
- `rota_versions`
- `shifts`
- `shift_swaps`
- `open_shifts`
- `notifications`
- `audit_logs`

## 14. Suggested Initial Screens

- Marketing / landing page
- Login
- Sign up / business onboarding
- Manager dashboard
- Weekly rota builder
- Weekly rota builder with 7-column drag-and-drop layout
- Print / PDF export view
- Location and zone management
- Staff list
- Employee profile
- Availability management
- Leave requests
- Shift swaps / open shifts
- Notifications / inbox
- Settings:
- Organization settings
- Location settings
- Roles and permissions
- Billing and subscription

## 15. MVP Release Criteria

We can consider MVP ready when a manager can:

1. Create a business and location.
2. Add zones within a location.
3. Add employees and roles.
4. Toggle employee eligibility across one or more locations in the organization.
5. Record availability and time-off.
6. Build a weekly draft rota using the board interface.
7. Create single, split, and overnight shifts.
8. Assign employees through drag-and-drop.
9. Detect basic conflicts before publishing.
10. Publish the rota for staff.
11. Handle at least one common change flow such as leave, sickness, or swaps.
12. Export a print-friendly PDF.

And when an employee can:

1. Log in securely.
2. View their live rota.
3. Submit availability or leave.
4. Receive clear notice when shifts change.

And when the product can:

1. Onboard a new organization without a long setup flow.
2. Create sensible defaults during org creation.
3. Support installable PWA usage.
4. Track active employees for billing purposes.

## 16. Recommended Build Phases

### Phase 1: Foundation

- Product identity and domain language.
- Authentication and tenant model.
- Organization, location, zone, employee, and role data model.
- Employee location-eligibility model.
- Basic dashboard and navigation.
- Fast onboarding flow with sensible defaults.
- PWA foundation.

### Phase 2: Core Scheduling

- Weekly rota builder.
- Shift CRUD.
- Draft and publish flow.
- Conflict detection.
- Employee schedule view.

### Phase 3: Requests And Operations

- Availability workflows.
- Leave approval.
- Shift swaps / open shifts.
- Notifications and audit history.

### Phase 4: Reporting And Optimization

- Labour cost summaries.
- Coverage dashboards.
- Templates and repeatable scheduling flows.
- Billing and subscription workflows.

## 17. Open Questions

These are the main decisions we should answer before implementation gets deep:

- Single location at launch, or multi-location from day one?
- Is pay rate stored directly, or via pay bands / role cost bands?
- Should supervisors edit rotas, or only managers?
- Do staff need to acknowledge rota changes?
- Are open shifts visible to everyone eligible or only invited employees?
- Which countries or labour rules should we support first?
- Do we want full tenant self-serve signup in MVP, or invite-based onboarding?
- Should availability be managed per organization, per location, or support both?
- How exactly should we define an active employee for billing within a billing period?

## 17A. Pricing And Billing Direction

The commercial model should support selling Shyft as a SaaS product.

Initial pricing approach:

- Free trial for new organizations
- Pricing charged per employee
- Billing based on the maximum number of active employees in the billing period

Billing rules:

- Employees can be toggled between `active` and `inactive`
- Only active employees count toward billing
- Billing should use the highest active employee count reached during the billing period
- If an employee is marked inactive part way through a billing period, they still count toward that period’s bill if they were included in the peak active employee count for that period
- Inactive status affects future billing periods rather than retroactively lowering the current period’s peak count
- The system should retain a billing snapshot or equivalent audit record so invoice calculations are explainable

Product implications:

- Employee status changes should be auditable
- Billing state should be visible in organization settings or billing screens
- Owners and admins should be able to understand current usage versus billable usage

## 18. Proposed Direction For This Repo

Given the current starter state, a sensible next step is:

- Keep the existing marketing/auth/dashboard shells as the basis for the product.
- Re-theme the product around Shyft and rota operations.
- Add Better Auth for authentication and organization-aware membership.
- Add Supabase for relational data and tenant-safe policies.
- Add Resend for transactional email flows.
- Build the first real app surface as a weekly rota page rather than expanding generic dashboard widgets.

That will move the project from “premium boilerplate” into a focused vertical product quickly.
