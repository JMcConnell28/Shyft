---
name: RocketRota dashboard content
description: Approved dashboard design direction informed by Shadcn UI Kit, adapted for hospitality operations.
typography:
  page-title:
    fontFamily: Manrope Variable
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  panel-title:
    fontFamily: Manrope Variable
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  body:
    fontFamily: Manrope Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label:
    fontFamily: Manrope Variable
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  metric:
    fontFamily: Manrope Variable
    fontSize: 30px
    fontWeight: 700
    lineHeight: 36px
rounded:
  control: 8px
  control-comfortable: 10px
  panel: 14px
spacing:
  micro: 4px
  related: 8px
  control: 12px
  panel: 16px
  section: 24px
components:
  dashboard-button:
    typography: "{typography.label}"
    fontWeight: 600
    rounded: "{rounded.control}"
    height: 32px
  dashboard-panel:
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
---

# RocketRota dashboard design standard

## Overview

This is the approved **target for dashboard content**, not a claim that every
existing component already implements it. It applies especially to the manager
dashboard and should guide other dashboard content as it is changed. It does not
authorize redesigning the sidebar, global navigation, logo or rota builder.

The user chose the professionalism of the
[Shadcn UI Kit HR dashboard](https://shadcnuikit.com/dashboard/hr), with supporting
references from [Sales](https://shadcnuikit.com/dashboard/sales),
[CRM](https://shadcnuikit.com/dashboard/crm) and
[Classic](https://shadcnuikit.com/dashboard/default). The goal is their coherence,
clarity and density, adapted to RocketRota's operational tasks. Do not clone their
HR metrics, demo content, sidebar or black primary buttons.

Read [the reference study](docs/design/dashboard-reference-study.md) for measured
evidence, component recipes and the implementation checklist. Read the project
RocketRota UI skill for domain and accessibility rules. This document establishes
the requested dashboard visual direction where older implementation differs.
Neither document overrides application permissions or factual data semantics.

The governing qualities are:

- Quiet neutral surfaces, dark readable text and restrained blue actions.
- A repeatable panel system with subtly differentiated headers and content.
- A small, consistent control vocabulary and predictable alignment.
- Information density suitable for reviewing a team during service.
- Staffing first; outstanding issues remain visible and reachable.

## Colors

Use the existing semantic variables in `src/styles.css`: `background`, `card`,
`foreground`, `muted`, `muted-foreground`, `border`, `primary` and
`primary-foreground`. Preserve RocketRota's existing blue primary and Manrope
identity. The reference uses a largely neutral/black primary; that is a reference
observation, not an instruction to remove RocketRota blue.

Target surface relationships:

| Role | Target treatment |
| --- | --- |
| Main canvas | White or the existing very light neutral background; no additional blue wash |
| Panel frame/header | A barely tinted neutral, such as `bg-muted/30` |
| Panel body | `bg-card`; white in the light theme |
| Main text | `text-foreground`; near-black, not blue on every label |
| Supporting text | `text-muted-foreground`, with readable contrast |
| Edge | One fine neutral border or one subtle outline ring |
| Primary action | Publish button blue (`blue-600`, `blue-700` on hover) |
| Selection | Existing RocketRota blue, with an explicit state marker |
| Success | Soft green with a readable green label |
| Review/exception | Soft amber with a readable amber label |
| Error/destructive | Red reserved for actual errors or destructive actions |

Use blue for action, selection and meaningful data series, not for every title,
card background, number and icon. Semantic status colour must accompany text.
Never classify a missing arrival record as an absence without a domain rule.

Reuse the existing dark theme tokens. Preserve the same hierarchy in dark mode;
do not invert screenshots, hardcode white panel bodies or reuse pale status
backgrounds without dark variants. Verify contrast in both supported themes.

## Typography

Retain **Manrope Variable** throughout. The reference's observed font is DM Sans;
its hierarchy and proportions are the lesson, not a required font substitution.

The frontmatter specifies the target scale. Use 12px/16px for secondary metadata
and compact status badges, not the default for tables, action labels or important
body text. Use 16px inputs on mobile where necessary to avoid browser zoom.
Large metrics may reduce to 24px on narrow screens. Do not use oversized
marketing headings, display fonts or a greeting hero above operational content.

Use medium weight for controls, semibold for panel headings and employee names,
and regular weight for supporting details. Do not make every label bold. Apply
tabular numerals to counts, times, percentages and repeated numeric columns.
Keep headings near normal tracking; avoid exaggerated letter spacing and
uppercase panel labels.

## Layout

Preserve the existing application shell and sidebar. Measure available width
inside that shell; viewport width alone does not determine whether a table fits.

- Desktop content padding: 24px. Mobile: 16px; use 24px only if the remaining
  usable width supports it. Do not stack shell padding and another page gutter.
- Between major rows and panels: 24px desktop, 16px mobile.
- Panel body and horizontal header inset: 16px, matched across the whole page.
- Within a related control group: 8px; icon-to-label and compact metadata: 4–8px.
- Use a fluid container up to the existing application max width. Never stretch
  a small team table into an unnecessarily wide reading surface.

The page header contains a concise title on the left and relevant date/location
scope and actions nearby. Wrap controls into a tidy second row when needed.
Do not combine a large explanatory header, another standalone toolbar card and
another page title before the data. Show scope once, where it can be understood.

Manager dashboard composition:

1. Title and location/date controls, with Create rota as the primary action when
   the user is allowed to create. Rotas and Time tracking are quieter actions.
2. A compact summary using real scheduled/working/attention data.
3. A dominant staffing panel, with a smaller supporting column for outstanding
   attention and upcoming rotas at wide widths.
4. On mobile: staffing first, then attention, then upcoming rotas. Keep the
   attention summary actionable so issues remain immediately reachable.

Use a 12-column mental grid. A staffing panel can span eight columns and the
supporting column four; use `minmax(0, ...)` and allow the layout to stack before
content becomes cramped. Three equal summary items are appropriate when there
are three meaningful metrics. Never invent a fourth to fill a template.

At phone widths, avoid four tall summary cards before staffing. Prefer a compact
three-item strip or an intentionally compact responsive grid. Let each panel
grow to fit its content; align related peers, not unrelated panel bottoms.

Tables may scroll horizontally **inside a constrained container**. All enclosing
flex/grid children need `min-w-0`. Never hide required columns or clip the page
to conceal overflow. For the manager team, use the existing compact row layout
when the full table no longer fits. Preserve all important times, state and
actions; do not shrink text to make a desktop layout fit a phone.

## Elevation & Depth

Separate content primarily through surface tone and a fine outline. The reference
panel framing is subtle: it is not a stack of large floating cards.

Use **one** quiet border or a 1px neutral ring on panels, without adding a large
blurred shadow. Inset white content on a lightly tinted frame is allowed when it
clarifies header/body structure. Do not add another full bordered card around
each inner section. Reserve stronger elevation for menus, popovers and dialogs.

Workspace action buttons follow the rota Publish and Notes treatments: a subtle
inset highlight and short neutral shadow. Do not use the experimental `glossy`
button, glows or coloured halos. A loading or disabled state must remain legible.

## Shapes

Use one panel radius: 14px target, or the nearest shared 12px primitive during a
deliberate migration. Do not randomly mix 8/12/20/24px panel corners.

Controls use 8px corners; the comfortable 10px variant may be used consistently
for a whole control group. Keep icons 16px with consistent Lucide stroke weight.
Avatars may be circular. Status badges can use compact rounded corners or pills,
but choose one status treatment across the page. No oversized icon tiles.

## Components

**Buttons and inputs.** All workspace action buttons, including panel actions,
use 32px desktop height, 14px/20px semibold labels, 10px corners, 12px horizontal
padding and an 8px icon gap. Phone actions use 44px hit targets. Primary uses the
rota Publish blue; secondary matches Notes: a white/card surface, fine neutral
border and subtle shadow. Destructive actions retain red. Match adjacent date
inputs, selects and search. Provide hover, keyboard focus,
active, disabled and pending states. Disable duplicate submissions, retain labels
while loading, and give icon-only actions accessible names.

This button standard is enforced by `ButtonStyleProvider` and
`src/components/ui/button-workspace.css` across workspace content and portaled
dialogs. Layout utilities still control width and placement. The rota routes,
sidebar, public/auth screens and calendar day cells retain their own treatment.
Use `Button` with its semantic variant, including for button-style links; avoid
raw action buttons or `buttonVariants` links that bypass the workspace scope.

**Panels.** Use a lightly tinted frame/header, a white/card content surface and
consistent 16px insets. A simple title/action header is approximately 52px high.
Add a description only when it conveys necessary scope; allow height to grow
naturally rather than padding every header to 72–96px. Header actions align with
the title. Avoid repeated descriptions that restate the heading.

**Summary metrics.** Label, prominent value, optional meaningful supporting
context. Numbers are grounded in real data. A comparison requires a real baseline
and period. No fabricated improvement percentages, fake KPIs, gratuitous arrows,
sparklines or decorative charts. All attention totals visibly say they span all
permitted locations/dates; staffing totals describe the selected location/day.

**Team table.** A panel title and compact toolbar sit above a quiet header row.
Use 14px body text, 12px secondary lines, roughly 40px column headings and
56–64px rows for two-line employee identities. Match header and body grid tracks,
gaps and horizontal padding exactly. Identity gets the flexible column; times
and actions have predictable widths. Use subtle separators, restrained hover
feedback and consistent avatars. Keep Review and clock controls near the row
they affect. Preserve keyboard access and label menu triggers.

**Attention.** Communicate person, location, exception reason, event time and
next action, in that order. The queue spans all permitted locations and dates;
it does not inherit the staffing date filter. Preserve its paging. Missing
records, acknowledged arrivals and payable time retain their existing meanings.

**Upcoming rotas.** Compact rows with week/date, publication state, unfilled
count where available, and one relevant action. Use the same panel, label and
button rules. Do not substitute invented calendars or charts for existing data.

**Charts.** Include only if the product already supplies meaningful series that
help a manager decide. Prefer a quiet plotting area, light grid lines, readable
axes and a small intentional palette. Match category colours across legend,
tooltip and series. No decorative donut simply because the reference has one.

**States.** Use stable skeletons that resemble the loaded layout. Keep useful
cached data during refresh and label refresh failures. Empty panels should give
a concise explanation and an authorized next step where relevant. Never render
zero for unavailable data or show a success state while a query is unresolved.
Portal menus/dialogs outside clipping containers. Restore focus on close and
preserve filters and dates across mutations.

## Do's and Don'ts

- Do inspect current desktop and phone output before declaring visual parity.
- Do use existing shadcn/Base UI primitives and extend shared dashboard
  components; keep route, query, permission and rendering layers separate.
- Do keep the sidebar and established brand intact unless explicitly requested.
- Do keep staffing-first ordering and the manager/supervisor/employee boundaries.
- Do match padding, control heights, type weights and grid tracks across peers.
- Do prefer fewer, better-composed surfaces to a wall of generic metric cards.
- Don't use the current implementation as proof that the requested target is met.
- Don't copy the demo's HR modules, promotional overlays, black brand, or data.
- Don't add new dependencies or a charting system for visual decoration.
- Don't silently replace operational facts or authorization rules with template copy.
- Don't call source-only review a visual review. Report unavailable captures.

Before handoff, check desktop around 1280–1440px and mobile around 390px, long
names, overflow, loading, empty/error states, focus and primary actions. Run the
appropriate existing checks. Deliver a short account of what changed, what was
verified and what remains unverified. Follow-up implementation is a separate
task: this document itself does not change the running interface.
