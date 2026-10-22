# TanStack Start stable migration

This migration follows the [release candidate migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate),
[Nitro hosting guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro),
and [Vite 8 migration guide](https://vite.dev/guide/migration).

## Runtime and dependencies

- Both apps share stable `@tanstack/react-start` 1.169.3 and its matching Router
  1.170.45. Start and Router versions are pinned to keep a single Router instance.
- Vite 8 and its compatible React plugin replace Vite 7. Tailwind's Vite plugin,
  Router Query integration, devtools, and Vitest are updated for compatibility.
- Nitro remains the Node hosting adapter. Its version is pinned instead of using
  `latest`, so a dependency install cannot silently change the server adapter.
- Build and run with Node 22.12 or newer within Node 22. The production commands
  remain `npm run build` and `npm start`; the admin build is `npm run build:admin`.
- Use `npm ci` to install the reviewed lockfile.
- Vite 8's default browser baseline is Chrome/Edge 111, Firefox 114 and Safari
  16.4. Check the supported employee devices against this baseline before rollout.

## Source changes

- Server functions use `.validator()` with their existing Zod parsers. Input rules,
  authorization, and business logic are retained.
- Vite's custom output configuration uses `rolldownOptions`. The NFC metadata
  import is scoped to the SSR environment instead of matching chunk filenames.
- Both TypeScript configurations omit `verbatimModuleSyntax`, as recommended by
  Start's setup guide to preserve server/client import elimination.
- Both apps run the Start plugin before the React plugin, with Nitro providing
  the production server output.
- Both apps and test configurations use Vite's native `resolve.tsconfigPaths`.
- Route error components accept Router's `unknown` error type and use the shared
  error formatter, including a fallback when the thrown value has no message.
- Unit tests use their own Vite configuration rather than running the production
  framework, hosting, scheduled-task, and devtools plugins. Two workers bound
  memory use, and the NFC cryptography tests mock external auth/data dependencies.

## Migration behavior checks

The app uses Better Auth rather than Start's removed `useSession` API. Existing
cookie names and session storage are retained. Auth routes return Better Auth's
responses directly; they do not replace `Set-Cookie` headers through response helpers.
Navigation uses Router redirects rather than setting `Location` on serialized
server-function responses. There is no custom Start server entry to migrate.
Neither app defines a custom `src/start.ts`, so Start supplies its default
same-origin/CSRF middleware for server functions. Browser requests keep their
normal origin and Fetch Metadata headers; cross-site calls should be rejected.

Router can retain the current view while a shared authentication `beforeLoad`
revalidates. The requested navigation selection updates immediately, while the
breadcrumb follows the displayed page until the destination is presented. This
follows the documented [Router presentation state](https://tanstack.com/router/latest/docs/api/router/RouterStateType).

Verify both production builds and test suites before deploying. Exercise login,
logout, protected redirects, manager permissions, rota writes, manual clocking,
Stripe webhook rejection, and the scheduled clock-out job in staging. Authenticated
workflows need test accounts and isolated services; a public-page smoke check does
not establish that billing or database mutations work end to end.

The clock-out task remains scheduled every minute in production. Runtime smoke
checks must use isolated database and notification configuration so that starting
a local production server cannot process live employee attendance.

## Verified on this branch

- A clean dependency install passed without forced or ignored peer dependencies.
  The final lockfile also passed `npm ci --dry-run --ignore-scripts --offline`
  with the machine's standard npm 10. Unchanged direct dependencies retain their
  previous resolved versions.
- Both TypeScript checks and the migration's zero-warning ESLint checks passed.
- Main tests: 450 passed. Admin tests: 25 passed. The 19 conditional Postgres
  integration tests remain skipped without `DATABASE_URL`.
- Both production builds passed from empty output directories. The regenerated
  route trees preserve all 75 main and 16 admin route imports.
- Local production HTTP checks passed for SSR, assets, signed-out redirects,
  session endpoints, malformed URLs, missing pages, rejected cross-site and
  missing-origin RPC requests, and serialized Zod validation errors. Unsigned
  Stripe webhooks and unauthorized billing reconciliation requests were rejected.
- Browser checks confirmed that the help search filters after hydration and
  links navigate to an article through the client router.
- A literal scan of 337 generated public text assets found none of the eight
  configured private environment values checked. The production schedule still
  includes `time-clock:process` every minute.
- The production dependency audit reports no TanStack advisories. Separate
  dependency findings from the beta security review still require remediation.

Rolldown emits module-directive and build-timing warnings for existing dependencies.
They do not fail either build. Authenticated employee, manager, payroll and billing
workflows still need staging verification with isolated accounts and services.

## Rollback

Deploy the previous release artifact if staging or rollout checks fail. This
framework migration does not alter database schemas or require a data rollback.
