# Harbour House rota demo

Open `/demo`. This public, client-rendered route has no loader, account lookup,
database access or application data fetching. It renders the same `RotaWorkspace`
used by the real rota page, with its existing local state and demo toolbar.

## Controls

- Starts with 24 fictional employees in four staff groups.
- Apply a custom employee count from 0 to 1,000, or choose a preset.
- Lowering the count hides surplus staff and their assignments. Raising it restores
  their existing local assignments, preserving notes, new shifts and budget edits.
- Search, staff group accordions, zone selection, shift creation/deletion,
  drag-and-drop and the keyboard-accessible assignment dialog use the real UI.
- Zones: Front, Beer Garden and Function. Location: Harbour House.
- Notes use **Apply notes** and live only in React state.
- Budget edits also update only local state; demo mode never invokes the budget
  server function or invalidates application queries.
- Export, save, publish, templates and settings look enabled and do nothing when clicked. No invitations,
  emails, push notifications or billing actions are triggered.
- **Reset** restores the initial scenario. Refresh also clears all edits; neither
  browser storage nor database persistence is used.
- **Screenshot view** hides the controls and development badge. Press Escape to
  restore controls; touch devices also have a return button.

The reference week is deliberately fixed to 19–25 October 2026 for reproducible
screenshots. Generated identities are deterministic and retain their IDs when
the count changes. Existing marketing demo fixtures are unchanged.

## Screenshots

- [Clean desktop screenshot](screenshots/harbour-house-demo.png), 15 employees,
  Front selected, 1280 × 720 viewport.
- [Default demo controls](screenshots/harbour-house-demo-controls.png), 24 employees.

## Verification

- TypeScript check passed.
- Focused ESLint check passed with five pre-existing `require-await` warnings in
  the shared workspace state hook.
- 21 tests passed across generated data, roster state preservation, local versus
  real budget persistence, existing shift-assignment interactions and PWA routes.
  React tests used Vitest's single thread worker because Windows fork workers
  timed out during startup.
- Browser checked: all three zone options; new shift and employee assignment;
  overlapping employees disabled in the assignment dialog; zero-employee state;
  restore from zero; notes retained at 1,000 employees; 1,000 employee cards with
  an independently scrolling staff list; local budget change; refresh clearing
  notes/count/added shifts; screenshot mode and Escape; 390px phone layout without
  document overflow.
- An existing root development-tool hydration warning appeared during earlier
  navigation. The final client-rendered demo refresh had no new console errors.
  Drag contexts also receive a stable React ID.

No hosted database, schema, real employee record, subscription or deployment was
changed. Existing landing-page and legal work remains in the working tree.
