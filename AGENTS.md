# AGENTS.md

## Purpose

This project must stay maintainable, lightweight, readable, and easy to extend.

The codebase should prioritize:

- clear separation of concerns
- small focused files and functions
- strong typing
- predictable data flow
- reusable UI and logic
- good performance by default
- consistency across the whole app

When making changes, always prefer clarity, composition, and long-term maintainability over fast hacks.

---

## Tech Stack

This project uses:

- TanStack Start
- Supabase Postgres
- better-auth
- TanStack Query
- TanStack Form
- Zod
- shadcn/ui
- Base UI
- Tailwind CSS v4
- dnd-kit
- TypeScript

All code must follow best practices for these tools.

---

## Core Principles

### 1. Keep files small and focused

- Do not create massive files.
- Prefer files under 200 lines when practical.
- Components should usually stay under 150-200 lines.
- Hooks should do one thing well.
- Utilities should be small and single-purpose.
- If a file grows too much, split it.

### 2. Single responsibility everywhere

- A component should primarily handle rendering and local UI behavior.
- A hook should encapsulate one piece of reusable stateful logic.
- A function should do one thing.
- A module should have one clear purpose.

### 3. Never mix concerns

Do not mix:

- database logic with UI
- auth logic with presentational components
- validation logic with rendering
- server logic with client-only code
- drag-and-drop logic with unrelated layout logic
- query logic directly inside components when it should live in hooks/services

### 4. Prefer composition over prop drilling

- Avoid passing props through many layers.
- Use composition, context, or colocated hooks where appropriate.
- Do not introduce global state unless necessary.
- Keep state as close as possible to where it is used, but not duplicated.

### 5. Strong typing always

- Use explicit TypeScript types for public APIs.
- Create shared domain types where appropriate.
- Never use `any`.
- Avoid unsafe casts.
- Prefer inferred types when they remain clear, otherwise define named types.

### 6. Validation at boundaries

- Validate all external input with Zod.
- Parse server input, form input, URL params, and unknown API data.
- Do not trust raw data from forms, search params, Supabase, or external sources.

### 7. Reuse patterns consistently

- Follow existing architecture and naming conventions.
- Reuse components, hooks, utilities, schemas, and query patterns before creating new ones.
- Do not duplicate logic.

### 8. Performance is a default requirement

- Avoid unnecessary re-renders.
- Avoid fetching more data than needed.
- Lazy-load heavy code where appropriate.
- Keep client bundles small.
- Memoize only when it actually helps.
- Prefer server-side work when appropriate.

---

## Hard Rules

### Never do these

- no inline SQL in components, hooks, or random files
- no giant components with hundreds of lines of mixed logic
- no giant functions that do multiple unrelated things
- no prop drilling across many layers when composition/context/custom hooks solve it better
- no duplicated validation logic
- no duplicated query logic
- no business logic directly in presentational components
- no database queries directly inside UI components
- no untyped return values for important shared functions
- no `any`
- no magic strings/constants scattered across files
- no copy-paste coding
- no dead code
- no commented-out old code
- no unrelated changes in the same task
- no premature abstraction without a real repeated pattern
- no deeply nested conditional rendering when it can be extracted
- no massive page files that contain all logic, data access, forms, dialogs, lists, and item rendering together

### Always do these

- extract reusable logic into hooks
- extract reusable UI into components
- extract schemas into dedicated schema files
- extract database access into dedicated server/data modules
- extract shared types into dedicated type files when reused
- keep functions small and descriptive
- use clear naming
- colocate code when it improves understanding
- split code when a file starts doing too much
- handle loading, empty, and error states properly
- make invalid states hard to represent

---

## Architecture Rules

## Preferred folder intent

Use a feature-first structure where practical.

Example:

```txt
src/
  features/
    bookings/
      components/
      hooks/
      utils/
      schemas/
      types/
      server/
      constants/
    customers/
      components/
      hooks/
      utils/
      schemas/
      types/
      server/
  components/
    ui/
    shared/
  lib/
    auth/
    supabase/
    utils/
  routes/
```

Adapt to the current project structure, but move toward this style.

### Folder responsibilities

- `components/`: reusable UI pieces
- `hooks/`: reusable stateful logic
- `schemas/`: zod schemas and validation helpers
- `types/`: shared domain types and DTO-like shapes
- `server/`: server-only data access and business logic
- `utils/`: pure helper functions
- `constants/`: shared constants and option lists

### Import rules

- UI components must not directly own database access.
- Prefer importing from feature modules instead of deep cross-feature imports.
- Avoid circular dependencies.
- Keep dependency direction clean:
  - UI -> hooks -> server/data/utils
  - never server/data <- UI

---

## TanStack Start Rules

- Keep route files focused on route concerns.
- Do not pack route files with all page logic.
- Extract complex UI into feature components.
- Extract data access and transformations out of route components.
- Prefer clear server/client boundaries.
- Use route-level code splitting where it improves performance.
- Lazy load heavy dialogs, editors, boards, and drag-and-drop-heavy views when sensible.

### Route files should usually do only these things

- read params/search params
- invoke route-level data/loading logic
- assemble page sections
- render the page shell

They should not become giant god files.

---

## Supabase + Postgres Rules

### Database access

- Never write inline SQL inside UI components.
- Never scatter raw database access across random files.
- Centralize database logic into dedicated server/data modules.
- Each query/mutation should have a named function with a clear purpose.

### Query design

- Fetch only the fields needed.
- Avoid overfetching.
- Keep query functions focused and composable.
- Prefer descriptive function names like:
  - `getBoardById`
  - `listUserBookingsForDate`
  - `createCustomer`
  - `updateShiftOrder`

### Data shaping

- Transform database results close to the data layer when useful.
- Do not spread raw database response shapes throughout the UI.
- Map raw rows into cleaner app-facing shapes when needed.

### Types

- Use typed database helpers where possible.
- Keep reusable row/domain types in dedicated type files.
- Separate raw DB row shapes from UI view models when helpful.

### Mutations

- Validate input with Zod before mutations.
- Keep mutation logic outside components.
- Return predictable typed results.

---

## better-auth Rules

- Keep auth logic centralized.
- Do not duplicate session/user access logic throughout the app.
- Use dedicated auth utilities/hooks/helpers.
- Protect server-only auth code from leaking into client code.
- Components should consume clean auth state, not manually rebuild it everywhere.

---

## TanStack Query Rules

- Query logic belongs in dedicated hooks or query option factories, not directly inside large UI components.
- Use stable query keys from a consistent location.
- Keep query keys structured and predictable.
- Separate:
  - query key creation
  - query function
  - hook wrapper

### Preferred pattern

- `queries.ts` or `query-options.ts` for query options / keys
- `hooks/` for `useXyzQuery` and `useXyzMutation`

### Example expectations

- one hook per clear purpose
- query keys are reusable
- invalidation is intentional and scoped
- optimistic updates only when appropriate and safe

### Avoid

- inline anonymous query logic all over components
- inconsistent query keys
- mutation side effects scattered everywhere
- components knowing too much about cache internals

---

## TanStack Form Rules

- Keep schemas and form defaults out of giant component bodies when possible.
- Reusable field groups should be extracted into components.
- Shared validation rules should come from Zod schemas, not duplicated inline.
- Form submit handlers should stay small and delegate real work outward.
- Do not mix large form rendering, transformation, mutation, and UI layout all in one file.

### Preferred structure

- schema in `schemas/`
- form hook/config in `hooks/`
- field components in `components/`
- submit action in `server/` or mutation module

---

## Zod Rules

- Use Zod for all boundary validation.
- Keep schemas in dedicated files.
- Reuse schemas across forms, server actions, and parsers when appropriate.
- Derive TypeScript types from schemas when that is the source of truth.
- Keep schemas composable and named clearly.

### Naming examples

- `createBookingSchema`
- `updateCustomerSchema`
- `bookingFiltersSchema`

---

## Component Rules

### Presentational vs smart components

Prefer separating:

- presentational components
- stateful/container components

Not every component must be split, but if a component handles too much logic, split it.

### Component size

Extract when a component contains too many of these:

- complex query logic
- complex mutation logic
- multiple dialogs
- multiple unrelated render sections
- repeated JSX blocks
- nested conditionals
- local helper functions that should be reusable
- drag-and-drop logic mixed with layout and business logic

### Reusability

Create shared components when patterns repeat.
Do not create fake abstractions for one-off markup.

### Accessibility

- Use accessible primitives from Base UI and shadcn correctly.
- Ensure keyboard interaction works.
- Use proper labels, roles, and semantics.
- Do not break focus behavior in dialogs, dropdowns, forms, or drag-and-drop UIs.

---

## shadcn/ui + Base UI Rules

- Prefer existing UI primitives before reinventing components.
- Wrap primitives into app-specific components when repeated behavior or styling appears.
- Keep styling consistent with the project design system.
- Do not dump massive Tailwind class strings into every component if they are reused; extract helper components or variants.

### Styling

- Tailwind should be used cleanly and consistently.
- Prefer readable class composition.
- Avoid unreadable class soup.
- Extract repeated style patterns.

---

## Tailwind CSS v4 Rules

- Keep utility usage readable.
- Reuse patterns through components, variants, or helper functions.
- Do not overuse inline conditional class chaos.
- Prefer semantic component APIs over passing giant class strings everywhere.
- Keep spacing, sizing, and layout consistent.

---

## dnd-kit Rules

- Isolate drag-and-drop logic from general rendering where possible.
- Keep sortable logic, sensors, collision config, and reorder helpers organized.
- Extract reusable drag-and-drop hooks/helpers for repeated patterns.
- Do not combine board rendering, persistence, sensors, item UI, overlays, and mutation logic all in one file.
- Ensure keyboard accessibility where practical.

### Recommended split

- drag context/container component
- sortable item component
- reorder utility
- persistence mutation hook
- domain-specific board/list renderer

---

## Hooks Rules

### Use custom hooks when

- logic is reused
- logic is stateful
- logic makes components harder to read
- query/mutation setup is repeated
- side effects need to be encapsulated

### Hook constraints

- hooks should have one clear purpose
- keep return values simple
- do not make hooks huge god-objects
- do not hide everything in hooks if a pure utility is better
- name hooks clearly

Examples:

- `useBookingFilters`
- `useCreateCustomerForm`
- `useSortableColumns`
- `useCurrentUser`

---

## Types Rules

Create dedicated type files when:

- a type is shared across multiple files
- a domain concept needs a stable explicit shape
- UI-facing types differ from raw backend/database types

### Prefer type categories

- schema-derived input/output types
- domain types
- UI view model types
- server result types

Do not dump every type into one huge global file.

---

## Function Design Rules

Every function should:

- have a clear name
- have one responsibility
- have explicit inputs
- return a predictable shape
- avoid hidden side effects when possible

### Prefer

- small pure functions
- extracted transformation helpers
- named functions over large inline callbacks when logic is non-trivial

### Avoid

- giant handlers
- giant submit functions
- giant render helpers inside components
- utility files full of unrelated code

---

## State Management Rules

- Keep state local by default.
- Lift state only when truly necessary.
- Use context carefully for shared UI/domain state when prop drilling becomes excessive.
- Do not create unnecessary global stores.
- Avoid duplicating server state in local state unless needed for UI interactions.

---

## Error Handling Rules

- Handle loading, empty, and error states explicitly.
- Do not swallow errors.
- Return user-friendly errors where needed.
- Keep error parsing/formatting reusable when repeated.
- Use safe parsing for untrusted input.

---

## Refactoring Expectations

When cleaning up messy code, do not only make it “work”.
You must improve structure.

For refactors, actively look for:

- oversized files
- duplicated logic
- inline SQL
- mixed concerns
- prop drilling
- repeated markup
- missing shared hooks
- missing shared components
- missing schemas
- missing types
- weak naming
- poor folder structure

### Refactor goals

- reduce file size
- reduce complexity
- improve naming
- improve reuse
- improve testability
- improve readability
- improve performance where relevant

---

## Output Expectations for Codex

When implementing or refactoring:

1. Follow the existing project patterns if they are good.
2. If current patterns are bad, improve them incrementally toward this document.
3. Prefer multiple small files over one giant file.
4. Create new files when separation improves maintainability.
5. Extract hooks, components, types, schemas, constants, and utilities where appropriate.
6. Keep diffs focused and intentional.
7. Explain major structural decisions briefly if helpful.

### Codex must not

- dump everything into one file
- leave inline SQL in components
- solve prop drilling by passing even more props
- create huge monolithic hooks
- create huge monolithic “utils” files
- create abstractions with unclear purpose
- introduce weak typing
- ignore performance implications

### Codex should

- create maintainable module boundaries
- keep components readable
- keep hooks focused
- keep server logic isolated
- keep types and schemas organized
- improve clarity with every change

---

## Preferred Review Checklist

Before finishing any task, verify:

- Is this file doing too much?
- Should any logic be moved into a hook?
- Should any markup be moved into a reusable component?
- Should any validation be extracted into Zod schemas?
- Should any shared types be moved into a type file?
- Is database access isolated from the UI?
- Is prop drilling avoidable here?
- Are query keys and query logic organized properly?
- Are functions small and focused?
- Is this easy for another developer to read in 6 months?
- Is this the lightest reasonable solution?
- Is performance acceptable by default?

If the answer to any of these is no, refactor before finishing.

---

## Style of Work

When asked to build something new:

1. understand the feature boundary
2. identify the domain pieces involved
3. create or reuse types/schemas
4. create data access functions
5. create query/mutation hooks
6. create focused UI components
7. assemble them in the route/page
8. keep each layer small and readable

When asked to refactor:

1. identify mixed concerns
2. split by responsibility
3. extract repeated logic
4. isolate server/data logic
5. introduce missing hooks/components/types/schemas
6. simplify the public surface of each module
7. preserve behavior while improving structure

---

## Final Rule

Do not optimize for the fastest possible output.
Optimize for code quality, maintainability, clarity, and correct architecture.

This project should feel like it was written by a disciplined senior engineer, not generated in a hurry.
