# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## React Compiler

The main app and admin app enable React Compiler in development and production
through the shared `scripts/vite/react-compiler.ts` Vite plugin, which uses
`reactCompilerPreset` and `@rolldown/plugin-babel`. Its parser overrides also
handle TanStack Start's route splitting query suffixes.
The preset targets client code. Redact redirects the React 19 compiler runtime
to its compatible memo-cache implementation.

The React Hooks ESLint preset reports compiler compatibility issues alongside
Rules of React violations. Run `npm run lint` to check the main app, or
`npx eslint apps/admin/src` to check admin code. The compiler skips functions it
cannot safely optimize; address diagnostics as those components are maintained.

To verify compilation, run `npm run build` (or `npm run build:admin`) and check
the client JavaScript for `react.memo_cache_sentinel`. Keep existing manual
memoization when adopting the compiler. If an individual component needs a
temporary opt-out, put `"use no memo"` at the start of its function body.

See the [React Compiler installation guide](https://react.dev/learn/react-compiler/installation).

## TanStack Redact

Both apps use `@tanstack/redact` through its official Vite plugin, after the
React and compiler plugins. SSR dependencies are bundled so components and their
dependencies share the same runtime during server rendering and hydration.
Application imports and React type definitions remain unchanged.

The default full preset keeps hydration, portals, context, Suspense, lazy loading,
refs, and error boundaries enabled. Redact renders synchronously; it does not
provide React's interruptible rendering. Its `<Profiler>` callback is a no-op,
so profiling builds also use Redact rather than mixing in `react-dom/profiling`.
Browser navigation and Web Vitals measurements remain available.

Rota PDF export uses a separate worker with native React because `@react-pdf`'s
custom reconciler depends on React private internals. The worker build deliberately
does not enable Redact or React Compiler. Worker messages are validated with Zod,
and each export terminates its worker after completion or failure.

Run both production builds and type checks after changing the integration.
Check direct page loads, client navigation, forms, dialogs, rota drag-and-drop,
and PDF export in the browser before release.

See the [TanStack Start integration](https://tanstack.com/redact/latest/docs/start)
and [runtime compatibility guide](https://tanstack.com/redact/latest/docs/compatibility).

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
