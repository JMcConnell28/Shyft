# Dashboard reference study

Inspected 6 November 2026. This is evidence and implementation guidance supporting
[the approved dashboard standard](../../DESIGN.md). It is not a UI implementation.

## Sources and method

| Reference | What it contributed |
| --- | --- |
| [HR](https://shadcnuikit.com/dashboard/hr) | Main reference: summary, modular panels, attendance content and employee table |
| [Sales](https://shadcnuikit.com/dashboard/sales) | Asymmetric composition: dominant analytical panel with a grouped supporting summary |
| [CRM](https://shadcnuikit.com/dashboard/crm) | Repeated card anatomy across metrics, tasks and pipeline content |
| [Classic](https://shadcnuikit.com/dashboard/default) | Shared treatment across people lists, selectors, metrics and chart containers |

Used rendered screenshots and read-only DOM/computed-style inspection. Desktop
reference viewport was 1280 × 720; HR was also inspected at 390 × 844. Observations
describe the demo's light/default appearance in this session, not every theme or
configuration. Some charts were captured during their initial animation; chart
values and completeness were not treated as evidence of operational correctness.
Dark mode, all hover states and every dropdown were not exhaustively inspected.
The demo's floating purchase promotion is excluded from the design reference.

## What makes the references coherent

The HR screen moves from a restrained title/action row to a regular summary grid,
then mixes equal analytical panels with wider operational content. Sales changes
the proportions while retaining the same card vocabulary. CRM and Classic apply
the same vocabulary to very different content. The transferable lesson is a
shared system, not a requirement that every dashboard has identical modules.

Headers sit on a very lightly tinted frame, with white content beneath. A fine
outline, repeated corner treatment and common inset bind the page together.
Controls and text remain compact. Most visual emphasis comes from type weight,
position, whitespace and data; colour is used sparingly. Tables align names,
metadata, states and actions rather than presenting every item as another card.

## Measured reference values

These are sampled reference values, **not claims about RocketRota's current CSS**.
The `DESIGN.md` targets adapt them to Manrope, blue actions and touch use.

| Element | Observed reference measurement |
| --- | --- |
| Font | DM Sans, with fallback supplied by the site |
| Page title | 24px / 32px, weight 700 |
| Panel title | 14px, weight 600 |
| Common body/controls | 14px / 20px; regular text and medium button labels |
| Metric value | 30px, weight 700 in the sampled HR summary |
| Desktop content inset | 24px |
| Main grid gap | 24px at the inspected desktop width; classes use 16px at smaller layouts |
| Card corner | 14px computed radius |
| Card framing | Fine neutral outline ring; very light muted frame |
| Card header | Approximately 52px high, 10px vertical / 16px horizontal padding |
| Card content | 16px inset |
| Standard date control | 32px high, 14px label, 10px corner, 10px horizontal padding |
| Compact secondary action | 28px high, approximately 13px label, 8px corner |
| Icon-only control | 28–32px square in sampled locations |
| Table header | 40px high; 14px text |
| Employee table rows | Approximately 61px with two-line identities and 12px vertical cell padding |
| Table horizontal inset | 16px at outer edges; 8px within intermediate cells |

The sample rendering reported some thin borders as 0.8px. Treat this as a
rendering/environment measurement; use a standard 1 CSS px edge in RocketRota.
Likewise, do not hardcode the measured 221px metric-card width: the reference uses
a responsive grid, not fixed-width tiles.

The sampled theme exposes a white background, neutral foreground and muted
tokens, and a near-black primary. Keep RocketRota's primary token instead. The
muted header/white-body relationship and subtle neutral framing matter more than
copying a hex approximation of the reference's Lab/OKLab colours.

## Responsive observations and deliberate adaptations

HR's metric grid uses one column by default, two at `sm`, four at `xl`. Other panel
groups move from one to two or three columns. The 390px HR capture places several
tall summary cards before the operational content. That is not the right default
for a hospitality manager who needs to find today's team quickly.

The reference employee table retains an approximately 880px layout inside a
`w-full overflow-x-auto` container while the page remains constrained. Reuse that
overflow principle for wide reference tables such as Role Permissions. For daily
staffing, keep RocketRota's existing container-responsive employee row instead of
forcing a wide table onto every phone.

RocketRota decisions:

- Preserve the current sidebar. Do not transplant the demo shell or its menus.
- Keep Manrope and RocketRota blue; replace inconsistent per-panel styling with
  the shared neutral surface and control rules.
- Use compact mobile summaries and staffing-first reading order.
- Make touch controls approximately 44px even though many sampled demo controls
  are 28–32px. Desktop controls remain compact.
- Keep status text, domain semantics, permissions, filters and actual data.
- Do not add HR hiring/leave/KPI/device modules or invented comparison charts.

## Implementation recipes

### Page and grid

Use `DashboardLayout` once. Apply 24px desktop and 16px mobile page gutters in one
place. Prefer `gap-6` on desktop and `gap-4` on mobile. Align the left edges of
page title, summary, staffing panel and panel content to their respective grid
lines. Do not repeatedly nest padded page wrappers.

A reasonable manager composition, subject to actual available shell width:

```text
Title                       Location / date / actions
Scheduled             Working now             Attention
Staffing table (dominant)                    Attention
                                            Upcoming rotas
```

On mobile, stack staffing before attention and planning. Scope remains visible:
the staffing date is local to the selected location; attention totals span all
permitted locations and dates. A compact attention summary links to that queue.

### Panel anatomy

Use a single shared panel/header/content pattern. The optional description is
for information such as location or query scope, not mandatory filler. Header
and body insets must match. Give title and action their own slots; allow the
action to wrap when needed rather than overlapping the heading. Use 16px body
padding and a 52px baseline header, growing for necessary descriptions.

Implement a tinted frame and white body once in shared dashboard primitives or
a narrowly scoped variant. Do not reproduce long Tailwind strings in each card.
Avoid a bordered card nested inside another bordered card merely to obtain the
reference's layered appearance. Use surface tone and the existing outer edge.

### Buttons and form controls

Use existing `Button`, selects, date controls and inputs. For dashboard defaults,
use the shared workspace button scope: 32px desktop size, 14px semibold labels
and 10px corners, including tertiary actions. Phone hit areas are 44px. Following
the user's button refinement, primary uses the rota Publish blue and secondary
uses the Notes border/surface/shadow. The measured 28px demo actions above remain
reference observations. Rota routes keep their existing styling.

Keep the label short and literal: Create rota, Review, Open rota, Export. Icons
are Lucide, generally 16px, with an 8px text gap. Keep the reference rota buttons'
subtle shadow; no glossy fills, glows or gradients. Focus must remain visible. A pressed state should
be subtle, not a jump that disturbs the control group.

Current `Button` defaults are smaller than this target. Add/reuse a dashboard
size or composition when implementing; do not globally resize every button and
accidentally change the rota builder. Likewise, the reference card radius does
not authorize changing every global `--radius` consumer in one operation.

### Table and list rows

Use one grid-track definition for header and rows. Match their padding and gap;
different 16px and 20px insets create visible column drift. Employee name is the
primary line, zone or other relevant metadata the secondary line. Use real
avatars where available and consistent initials otherwise. Avoid colour-coded
avatars that imply a status they do not represent.

Numerical/time columns use tabular figures. States use a compact text badge, with
colour only where it communicates meaning. Keep actions in a predictable final
column. Size rows for their actual contents; a two-line identity usually needs
56–64px, while wrapped exceptions can grow. Do not truncate the only visible
explanation of an exception without a reachable detail view.

### Analytics without fabricated data

A chart is appropriate only when it answers a supported product question and
has real input data. Preserve units, periods, empty states, denominators and
comparison baselines. Quiet grid lines and a small palette should support
reading, not compete with it. A dashboard without charts is preferable to one
with decorative or misleading analytics.

## Codex application procedure

1. Read `DESIGN.md`, the project UI skill, the dashboard README and the affected
   route/components. Inspect current output; old screenshots may be stale.
2. Identify the manager's immediate decision and the real scope of each query.
3. Reuse the shared layout, panel header, controls, identity and status components.
   Adjust shared APIs deliberately rather than adding parallel near-duplicates.
4. Build layout and type hierarchy first, then tune the common component tokens.
5. Check populated, loading, empty, refresh-error, disabled and pending states.
6. Capture desktop and phone together. Compare the qualities of these references:
   density, edge alignment, card anatomy, control vocabulary and colour restraint.
7. Fix the material findings in a bounded batch, verify, and state limitations.

Acceptance checks:

- The sidebar and navigation still match the existing app.
- Staffing is easy to reach on a phone without passing a wall of KPI cards.
- The same control type has the same height, radius, weight and icon treatment.
- Panel headers and contents share insets; table headings align with values.
- Scope is visible, especially attention's all-location/all-date query.
- Long names, empty locations and permission-limited users still work.
- Only a genuinely wide table scrolls horizontally; the page itself does not.
- Dark mode uses semantic tokens; important text meets contrast requirements.
- No new UI promises, statistics, permissions or calculations were invented.
- Tests/type checks relevant to the implementation pass. Browser failures are
  reported rather than presented as visual approval.

## Existing implementation entry points

| Responsibility | File |
| --- | --- |
| Theme and font tokens | `src/styles.css` |
| Buttons | `src/components/ui/button.tsx` |
| Shared dashboard layout and panels | `src/features/dashboard/components/dashboard-layout.tsx` |
| Manager composition | `src/features/dashboard/manager/components/manager-dashboard.tsx` |
| Header and scope controls | `dashboard-header.tsx`, `dashboard-filters.tsx`, `dashboard-select.tsx` in the same manager components folder |
| Summary | `src/features/dashboard/manager/components/dashboard-summary.tsx` |
| Team and filters | `team-section.tsx`, `team-filters.tsx`, `team-row.tsx` in the manager components folder |
| Attention and upcoming rotas | `attention-section.tsx`, `coming-up.tsx` in the manager components folder |
| Domain and authorization constraints | `src/features/dashboard/manager/README.md` and existing server access helpers |

These paths are an integration map, not instructions to put data access or
business logic into rendering components. Follow the existing feature boundaries.
