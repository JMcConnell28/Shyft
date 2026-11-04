---
name: rocketrota-ui
description: Design, implement, redesign, or polish RocketRota interfaces and workflows, including responsive layouts, interaction states, and accessibility. Use for RocketRota product UI, PWA screens, and shared components. Backend-only tasks and unrelated products are outside scope.
---

# RocketRota UI

Design for hospitality teams using RocketRota during planning, service and pay review. Keep Manrope, the existing logo and RocketRota blues. The screen should help its user make the next decision quickly, with enough context to act confidently.

## Workflow

1. Identify the user, their immediate task, the information they must compare and the consequence of their next action. Distinguish manager and employee capabilities, workspace and location scope, and the active day, week or zone.
2. Inspect the route, feature components, shared primitives and existing states. Read [RocketRota design system](references/design-system.md) for source locations, brand values and shell conventions. Use the current code as the source of truth.
3. Consult [Screenshot findings](references/screenshot-findings.md) and any visuals provided for the current task. Choose a composition based on the job. Use rows for repeated records, a grid for time comparisons, and a focused form for a single decision. Give each surface a clear purpose.
4. Use [Workflow and interaction patterns](references/workflow-patterns.md) for role-specific decisions, mobile ergonomics and state handling. Keep route, data and mutation boundaries intact. Reuse the existing primitives, hooks and formatters, and extend them when a real shared need appears. Keep design-only requests at the requested fidelity.
5. Use [Review checklist](references/review-checklist.md) to check the implementation. When browser tooling is available, inspect the rendered UI at narrow mobile and desktop widths, exercise the primary action and a meaningful failure state, and fix issues before handoff. Report any checks that require unavailable tooling, fixtures or access.
