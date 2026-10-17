# Navigation performance investigation

Measured locally on 17 October 2026. No credentials, query parameters, employee records, or tenant identifiers are included in the diagnostic output.

## Environment and method

Installed versions: TanStack Start 1.167.2, Router/router-core 1.168.1, Query 5.95.0, better-auth 1.4.18, Supabase JS 2.100.0, React 19.2.4, Vite 7.3.1. Implementation was checked against the installed source and the [Router loading documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading).

The browser used the running local Vite app and an existing signed-in owner session. Desktop samples used a 1280 × 900 viewport. Timers run **inside the app**, from `onBeforeNavigate` to `onResolved`, excluding the time taken to issue automation commands or request snapshots. Query-cache events separately measure fetches; development Server-Timing headers and operation logs measure auth, REST, and membership reads. The workspace outlet also has a development React Profiler.

“First visit” below means the first observed client entry to that destination after resetting the client cache, **not** an empty browser HTTP cache or a cold production server. Vite module compilation and external network latency varied. These are diagnostic samples, not medians or an isolated production A/B experiment. `onLoad` is an intermediate router event: time after it can include suspended code/data and is **not** a measurement of React CPU time.

## Observed navigation samples

All numbers are milliseconds. First visits and repeat visits are deliberately separate.

| Destination | Before, first observed | After, first observed | Before, repeat | After, repeat |
| --- | ---: | ---: | ---: | ---: |
| Dashboard shell | 1,648 | 205 | 102 | 105 |
| Rotas | — | 717 | 144 | 125 |
| Rota editor | 2,714 | 1,604 | — | 125 |
| Timesheets | 1,721 | 429 | 757 | 441 |
| Time tracking | 1,709 | 462 | 100 | 100 |
| Settings | 534 (shell only) | 1,530 (settings ready) | 103 | 98 |

- An initial Rotas sample was 2,231 ms, but used the initial mobile viewport; it is excluded from the desktop comparison.
- The Settings loader now waits for its initial settings query. The earlier shell-only result is not comparable to ready settings, so it is not evidence of a regression or speedup.
- The Timesheets repeat samples include navigation-cache revalidation after its 30-second freshness window. Other warm repeats were usually about 100–175 ms. Most already-cached routes were already fast: there is no evidence of a substantial latency reduction for every warm route.
- Dashboard day/attention reads failed during this audit because the configured database lacked `public.dashboard_arrival_resolutions`. Dashboard numbers measure its shell/error feedback, **not successful staffing-data readiness**. The missing migration was subsequently applied as `20261017211620_manager_dashboard_arrival_resolutions.sql` when fixing dashboard loading; these audit measurements have not been reclassified as successful data loads.
- The browser did not provide useful overlapping resource-timing entries in these samples. Zero resource counts are not evidence that no code was downloaded. Instrumentation now reports unavailable resource timing as `null`.
- A separate diagnostic run with document view transitions disabled did not improve repeat navigation consistently, so the existing view-transition setting was retained.

## Findings and changes

1. **Requested URL and rendered route were different sources of truth.** The shell read `useLocation()` before the old outlet had been replaced. Breadcrumbs now read the active matches, so they switch with pending, successful, or error content. Sidebar selection still follows the requested location, after navigation blockers accept it.
2. **Missing route pending states inherited 1,000 ms / 500 ms router defaults.** The app now uses its established 150 ms grace period and zero minimum display time, with destination-oriented skeletons. Near-instant transitions avoid a skeleton flash. Errors stay inside the shell with a guarded retry action.
3. **Membership REST calls were much slower than their SQL.** Observed REST calls were commonly 120–220 ms, while pooled SQL round trips were 12 ms and the membership plan executed in 0.045 ms. The existing central membership helper now performs a parameterized SQL read, validated with Zod. A live read measured 13 ms. Every server authorization still reads membership freshly; no authorization cache was added.
4. **Attendance location access fetched unrelated unread-rota state.** Dashboard access and Timesheets now use the same permission/location logic without fetching published rotas and read versions. Rota callers retain the original unread calculations. This removes two sequential reads from each affected access resolution.
5. **Dashboard day and attention requests waited for page mounting.** They now begin as soon as the access query identifies the permitted location, in parallel with the welcome preference/component work. They share the mounted query keys and in-flight requests. Inaccessible locations never trigger a day fetch.
6. **Repeat navigation forced redundant support and welcome requests.** Notifications now respect query freshness rather than force-refetching every path change. Existing focus/mutation refresh remains; no polling was added. Welcome preferences are cached by user, workspace ID and type, with the cache updated after successful dismissal.
7. **Two independent cache layers could delay query revalidation.** The selected query-backed routes pass loader/preload decisions to Query (`staleTime` / `preloadStaleTime` zero on those routes), preserving each query's freshness. Cached list, hours and clock data can render immediately while stale queries revalidate. The rota editor's existing non-refetching preload policy remains intact to protect unsaved changes.
8. **Background failures needed visible feedback.** Attendance now labels its last-loaded data if refresh fails. Timesheets and Settings offer retry actions. Dashboard authorization/data failures are not repeatedly retried on mount after a failed prefetch; its existing live polling and explicit retries remain.

## Database analysis

`node scripts/profile-navigation-db.mjs [workspace-slug]` uses the existing local environment configuration, a single pooled connection, a read-only transaction, and a five-second statement timeout. It prints durations and plan-node summaries only.

| Probe | Execution time |
| --- | ---: |
| Membership by organization + user | 0.045 ms |
| Workspace locations | 0.050 ms |
| Location rotas ordered by week | 0.068 ms |
| Enabled employee assignments | 0.907 ms |

Connection plus first query took 98 ms; subsequent `select 1` round trips were 12 ms. These tables were small and the planner appropriately selected sequential scans. No new index or schema change was justified by this sample, and none was made.

## Correctness and checks

Existing organization, location, user, week/date, permission and editor cache identities remain. New welcome keys include user, workspace ID and workspace type. Existing mutation invalidations, clock polling and server authorization remain. No employee data is stored in timing output; profiling is development-only.

Regression coverage includes immediate selection, atomic breadcrumb/pending content, no fast-transition flash, stable shared auth layout, superseded requests, unsaved navigation blocking, error/retry, tenant-scoped fresh membership, unread-state compatibility, prefetch deduplication, inaccessible Dashboard locations, welcome dismissal, keyboard assignment/search, attendance review and weekly Timesheets.

Final checks: TypeScript (`tsc --noEmit`), ESLint on the changed files, `git diff --check`, and the complete client/SSR/Nitro production build passed. The final targeted regression run used the existing Vitest configuration with `--maxWorkers=1`: **22 files / 100 tests passed**, including eight SQL integration cases. The temporary runner-isolation configuration was removed. No dependency, schema, or test-timeout changes were made.

## Limits and follow-up

- Re-measure successful Dashboard data readiness now that its required migration has been applied.
- Repeat cold and warm measurements on a production preview with fixed network/CPU conditions and several samples per journey. Development compilation explains part of the apparent first-visit gains; these numbers are not a production speed guarantee.
- Profile larger real-world rosters and histories before changing indexes, virtualization or rota state structure. React work was approximately 7–58 ms in the sampled follow-up runs, substantially below the slowest data waits; no calculation rewrite was justified here.
- Route code splitting was already enabled. The PDF exporter remains a separate lazy chunk; no blanket route preload or new dependency was introduced.
- The inherited Vite/Nitro test configuration prints a shutdown warning after successful Vitest runs. Concurrent builds/test workers also produced a Nitro transport timeout and keyboard-test timeouts. Those cases passed in the final one-worker run after the production build finished; avoid oversubscribing the machine for comparable measurements.
