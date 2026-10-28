# Marketing redesign QA

Scope: pricing and all six pages under Features. The existing landing page is the
visual reference. This is a shared design-language redesign, with page-specific
content and product examples, rather than a pixel clone of the landing page.

## Findings

No remaining visual P0/P1/P2 findings in the final desktop/mobile comparison.
Keyboard focus restoration after closing the mobile menu awaits the final build
and browser check before this report can pass.

## Reference, implementation and normalization

All evidence is saved under `D:/Projects/Shyft/.performance/marketing-redesign/`.

- Source visual truth: `landing-reference-desktop.png` and
  `landing-reference-mobile.png`, captured from `/`.
- Implementation: `pricing`, `rota-planning`, `time-tracking`, `timesheets`,
  `team-management`, `manager-dashboard` and `staff-updates`, each with
  `-desktop.png`, `-mobile.png` and corresponding `-full.png` captures.
- Local implementation: `http://127.0.0.1:3200/pricing` and `/features/<slug>`.
- Requested CSS viewport: 1280 × 900 desktop; 390 × 844 mobile. Browser content
  widths are 1265 and 375 CSS pixels after the scrollbar. Default device density
  is 1; matching source/implementation viewport captures are 1265 × 889 desktop
  and 375 × 811 mobile, with no additional scaling or density normalization.
- Full-page captures use the same API and retain native width (1264 desktop,
  375 mobile) with page-specific heights. They are not compared for equal height.
- State: signed out, light theme, settled entrance animation, default example
  data and default £25 calculator. No real workspace data was changed.
- Combined comparisons opened: `comparison-desktop-final.png` (landing/pricing)
  and `comparison-mobile-final.png` (landing/staff updates). These preserve source
  pixels side by side. `gallery-desktop.png` and `gallery-mobile.png` include the
  landing reference followed by all seven implementations; those overview tiles
  are uniformly reduced and are not used to assess small text.
- Focused evidence opened: `focused-hero-comparison.png` uses equal 780 × 400
  native crops from the landing and pricing captures. `focused-controls.png`
  retains native calculator, estimate and mobile update-reader details.
  Pricing desktop and staff-updates mobile full-page captures were also opened
  to inspect section rhythm, footer, related links and the reading pane.

## Fidelity surfaces

- Fonts and typography: reuses the landing page's Manrope Variable, smooth
  rendering, navy heavy headings, blue emphasis and muted body copy. Hero crops
  confirm matching family, weight, tracking and button treatment. Feature titles
  intentionally differ in length; mobile headings retain readable line breaks.
- Spacing and layout: centered hero, generous section gaps, restrained surfaces,
  shared header/footer and numbered workflow rows match the source hierarchy.
  Pricing uses a single three-column plan panel that stacks on phones. Product
  tables scroll within their previews; the page itself does not overflow.
- Colors and tokens: shared landing ink/muted/blue variables, existing background
  and pale surfaces preserve the source palette. Green/amber are confined to
  meaningful attendance/review states. Focus outlines remain visible.
- Image and icon quality: reuses the original RocketRota logo, landing background
  and actual rota screenshot. No replacement illustration or generated asset.
  Existing Lucide icons stay consistent. Other previews are intentionally native
  interactive examples, clearly labelled with fictional staff/business details.
- Copy and content: each page explains its own feature with concise supporting
  steps. Pricing retains the existing calculation and clearly explains used
  employees, organisation/location scope, optional clocking and VAT exclusion.
  Three formerly missing links now have real public routes and metadata.

## Comparison history and fixes

1. First comparison: `comparison-desktop-r1.png`, `comparison-mobile-r1.png`.
   - P1: mobile menu opened the error boundary (`mobile-navigation-error-r1.png`).
     Wrapped Base UI's group label and feature items in a DropdownMenuGroup.
   - P2: mobile Staff Updates kept two narrow columns. Moved its responsive
     override after its own base layout so the list sits above the reading pane.
   - P2: Staff Updates title wrapped across four phone lines. Tightened the title
     to "Every update. Everyone in the loop." (three lines at the target width).
   - P2: hidden mobile FAQ line break dropped a word boundary. Added an explicit
     text space; browser DOM confirms "A little more clarity.".
   - P2: small menu/filter/search targets. Increased the trigger and interactive
     preview controls to 44px; menu links also have 44px minimum height.
2. Post-fix comparison: all final desktop/mobile captures and combined galleries
   listed above. Visual findings are resolved. `mobile-menu-fixed.png` records
   the working menu; `pricing-small-phone.png` records the compact phone layout.
3. Keyboard iteration: Escape closed the menu but focus returned to the body.
   Added a typed trigger ref and explicit Base UI finalFocus target. Final
   verification and a post-fix screenshot remain pending.

## Functional and responsive checks

- All seven routes render on desktop and mobile. Header controls stay within the
  viewport; document scrollWidth equals clientWidth in every captured route.
- Additional pricing checks at 320 × 740 and 768 × 1024: no horizontal overflow.
- Calculator: 10 employees → £25; 11 → £27.50; clocking at 11 → £28.50;
  adding a 10-person second location → £53.50. Removing the first location leaves
  a correctly relabelled 10-person location, unchecked clocking and a £25 total.
- FAQ expansion works. Slider and checkbox have location-specific labels.
- Team search: Ava returns one row; an unmatched search shows its empty state.
- Attendance filters: Clocked in returns three rows; Needs review returns one.
- Timesheets: review filter returns one entry; Mark reviewed updates the status
  and shows the caught-up empty state (`timesheets-reviewed-mobile.png`).
- Staff Updates: selecting messages changes the reader; marking read reduces
  unread count from three to two and disables the completed action. Re-selecting
  that message preserves its read state.
- Mobile navigation opens with all six feature links, pricing and help; Staff
  Updates navigation succeeds. Keyboard Enter opens and Escape closes it.
- Browser console checked after these interactions: no warning or error entries.
- Reduced motion uses the shared landing page's reduced-motion override.
- TypeScript check passed; six pricing tests passed; production build passed
  before the final menu focus refinement. Final rebuild is in progress.

## Open questions and test limits

No design decision is waiting on user input. Examples are local demonstrations;
this task did not alter authenticated product workflows or billing behavior.
Automated accessibility auditing and every browser/assistive-technology pairing
were outside this pass; semantic labels, keyboard controls and phone layouts
were checked directly.

## Implementation checklist

- [x] Pricing and all six feature routes use the landing visual language.
- [x] Missing Team Management, Manager Dashboard and Staff Updates routes exist.
- [x] Reusable hero, workflow and preview components keep route files focused.
- [x] Resolve visual findings and inspect recaptured comparisons.
- [ ] Verify explicit menu focus return in the final production build.
- [ ] Leave the final local preview open for review.

final result: blocked
