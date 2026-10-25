# RocketRota performance audit

Investigated 25 October 2026 against baseline commit `2ff2e59`. Changes are local;
no deployment, production migration, permission relaxation, or payment was made.

## Scope and confidence

This is a production-build investigation, with repeatable local release-build,
browser, Lighthouse and configured-database measurements. It is not a measurement
of the hosted dashboard's reported score of 71 or an actual installed phone's
four-second startup. Those two reports remain to be reproduced on their original
environment. In particular, public-page Lighthouse results below are **not**
authenticated-dashboard scores.

The in-app browser had an authenticated session, but its read-only evaluation
API did not expose `performance`. Fresh headless Edge contexts supplied actual
timing data for the public page. After implementing and verifying the optional
production profiler, app-owned logs also supplied authenticated navigation and
React-commit timings. No comparable authenticated baseline was captured.
Authenticated automation state was not exported from the user's browser. The tools in
[`scripts/performance/README.md`](scripts/performance/README.md) provide explicit
test-account/session instructions for the outstanding authenticated measurements.

## Architecture and baseline method

- TanStack Start 1.169.3, Router 1.170.45, Query 5.104.5, React 19.2.4,
  better-auth 1.7.12, Supabase JS 2.100.0, Vite 8.3.5 / Rolldown 1.2.15,
  Nitro 3.0.260903-beta, Node 22.14.0. These are installed versions, not
  assumptions from package version ranges.
- Root npm workspace plus admin app/shared packages; feature-first app modules.
  Server functions validate inputs and delegate to server/data modules. SQL uses
  a shared `pg.Pool`; other reads use privileged server-only Supabase REST.
- `getRouter()` creates a new QueryClient for each router. Query SSR integration
  dehydrates that client's state. Session/workspace navigation keys include user
  and session identity; domain keys generally include organisation, user and
  location. No process-wide user-data cache was introduced.
- Existing intent preloading, route component splitting, 150 ms pending grace,
  zero minimum skeleton duration, shared shell, and scoped Query invalidation
  were retained. Day/attention dashboard prefetching was already parallel after
  access resolution. The earlier development-only navigation audit in
  `docs/engineering/navigation-performance.md` is not a production baseline.
- Native `npm run build` was used, not the Vite development server. The initial
  sandbox build failed resolving a PDFKit asset with EPERM; the same build worked
  with normal filesystem access. Baseline measurement tooling changed no app
  behaviour. The existing Vite devtools plugin demonstrably removes its UI from
  production output.
- Each desktop/mobile browser comparison contains three fresh-context cold/warm
  pairs, with a running server. Desktop: 1280×900. Mobile approximation: 390×844,
  4× CPU, 150 ms latency, 200 kB/s download. Observer window: five seconds after
  load. Cold **browser** does not mean cold server or cold database.
- Lighthouse 12.8.2: three default simulated-mobile runs per comparison in fresh
  temporary Edge profiles. Benchmarks ran serially. An earlier exploratory run
  overlapping other work was excluded; retained baseline scores were 77/76/74.
- Local measurement launcher disables Nitro scheduled tasks via its installed
  `TEST` guard, so profiling does not run attendance/billing jobs.

## Before and after

Medians of three browser samples unless stated otherwise. Decimal kB are used.

| Measure                               |             Baseline |            After | Interpretation                                               |
| ------------------------------------- | -------------------: | ---------------: | ------------------------------------------------------------ |
| Bundler-stage entry JS, uncompressed  |            648,918 B |        589,659 B | 9.1% less code at this build stage                           |
| Bundler-stage entry JS, gzip          |            210,112 B |        193,342 B | 8.0% smaller                                                 |
| Bundler-stage entry JS, Brotli        |            184,962 B |        170,655 B | 7.7% smaller                                                 |
| Bundler-stage entry JS chunks         |                   60 |               60 | No claim of fewer entry requests                             |
| Public-page actual decoded JS         |            799,789 B |        740,798 B | Includes destination chunks                                  |
| Public-page cold JS transfer          |            270,137 B |        255,726 B | Includes HTTP overhead                                       |
| Desktop cold FCP / LCP                |         244 / 244 ms |     128 / 128 ms | First baseline sample was 1,948 ms; noisy cold-start outlier |
| Desktop warm FCP / LCP                |           84 / 84 ms |     100 / 100 ms | No demonstrated warm speedup                                 |
| Mobile cold FCP / LCP                 |     1,400 / 5,600 ms | 1,276 / 1,276 ms | Main observed visible-loading improvement                    |
| Mobile warm FCP / LCP                 |         200 / 200 ms |     204 / 204 ms | Effectively unchanged                                        |
| Mobile CLS                            |             0.004505 |         0.004505 | No measured layout stability change                          |
| Mobile observed blocking, cold / warm |           81 / 73 ms |       67 / 48 ms | Observation-window sum above 50 ms; not Lighthouse TBT       |
| Service worker install assets         | 1,665,557 B, 13 URLs | 68,808 B, 6 URLs | 95.9% less install transfer before HTTP caching              |

| Mobile Lighthouse metric |   Baseline median |      After median |
| ------------------------ | ----------------: | ----------------: |
| Performance score        | 76 (77 / 76 / 74) | 81 (80 / 81 / 81) |
| FCP                      |          1,673 ms |          1,675 ms |
| LCP                      |          6,692 ms |          5,042 ms |
| TBT                      |             10 ms |             24 ms |
| CLS                      |          0.004757 |          0.004757 |

Lighthouse's simulated model and the explicitly throttled browser observer are
different methods; their LCP numbers must not be combined. The simulated score
improved modestly, while FCP and CLS did not improve and TBT increased slightly.
The raw after trace still identifies the screenshot as LCP, with most simulated
delay attributed to rendering. The real throttled samples are useful evidence
of reduced visible-loading delay, not proof that all simulated CPU/network
bottlenecks are solved.

The first public HTTP request took 1,275.5 ms before and 116.7 ms after; these
are single observations with different filesystem/module warmth and do **not**
establish a server cold-start improvement. Subsequent complete responses were
7.6–13.1 ms before and 9.2–12.5 ms after. No server speedup is claimed. `/login`
normalizes its default search parameter with a 307, and unauthenticated
`/dashboard?source=pwa` redirects to login; redirect durations are not page-ready
measurements. Local HTML was `private, no-store` and uncompressed.

## Ten verified sources of avoidable work, ordered by priority

Priority combines measured transfer/round-trip cost and breadth of affected
paths. It is not a fabricated ranking of total real-user milliseconds: isolated
REST timings, background transfer bytes and critical-path latency are different
quantities. The effects of bundled changes cannot be attributed independently
to one fix without further isolated A/B runs.

| #   | Evidence and root cause                                                                                                                                                                                                                | Affected code                                                                    | Implemented change                                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Common logo was 398,821 B at 770×527, displayed around 47×32 on marketing and smaller in the app. Lighthouse identified 398 kB of avoidable image transfer.                                                                            | `brand.tsx`, `shell/location-name.tsx`, marketing header/footer, help shell      | 192×131 lossless WebP derivative, 19,748 B; PDF retains original artwork. Intrinsic dimensions supplied where header width previously depended on decoding.                                                                                                                          |
| 2   | Personal overview called `listAccessibleLocations`, which additionally fetched published rotas then seen versions; overview only uses location IDs. Isolated redundant REST pair: 734 / 333 / 123 ms.                                  | `dashboard/server/shift-overview.ts`, `rota/server/access.ts`, `related-data.ts` | Use existing `listPermittedRotaLocations`, preserving identical role/assignment/location restrictions and fresh authorization. Removes up to two sequential reads; no data-freshness tradeoff.                                                                                       |
| 3   | Worker precached 13 URLs / 1.67 MB, including legacy/duplicate icon variants and artwork unrelated to offline fallback. Installation adds bandwidth competition after boot. It is not proof of the reported four-second device launch. | `public/sw.js`                                                                   | Precache only offline page, manifest, actually referenced install icons and resized favicon: 6 URLs / 68.8 kB.                                                                                                                                                                       |
| 4   | A static import used by `/help/$` head metadata pulled all help article data into every initial entry closure: 59,506 B raw / 16,870 B gzip.                                                                                           | `routes/help/$.tsx`, `help-center/source.ts`                                     | Load help metadata dynamically in the help route loader. Article data is absent from the rebuilt entry closure; article titles/descriptions still work.                                                                                                                              |
| 5   | Lighthouse LCP element was the rota screenshot. Original 1917×907 PNG was 258,557 B for a 370×175 mobile display; it had no priority hint.                                                                                             | `marketing/constants/feature-assets.ts`, `landing-rota-image.tsx`                | Responsive 640/1280/1917 WebP derivatives, 29,832 / 89,864 / 91,192 B, with `srcSet`, `sizes`, high fetch priority and existing dimensions. Full-size derivative is lossless.                                                                                                        |
| 6   | 512-pixel PNG favicon cost 185,724 B on first load despite tiny display size.                                                                                                                                                          | `routes/__root.tsx`, worker asset list                                           | Same artwork resized to 64×64 PNG: 2,626 B, under a new versioned URL.                                                                                                                                                                                                               |
| 7   | Decorative landing background cost 248,537 B as PNG.                                                                                                                                                                                   | marketing landing/pricing pages                                                  | Exact-pixel lossless WebP: 130,068 B.                                                                                                                                                                                                                                                |
| 8   | Worker always created a network fetch even on a cache hit for image/font/style requests; ignored JavaScript, and applied image caching beyond an explicit public allowlist.                                                            | `public/sw.js`                                                                   | Cache-first only for explicit public install assets and hashed build assets (including JS). Cache hits make no fetch. API/user images and HTML are outside asset caching. Cache writes use `waitUntil`; redirected responses are not stored. Cleanup affects only RocketRota caches. |
| 9   | Both dashboard modes awaited a non-critical getting-started preference; an unresolved welcome query prevented useful route completion.                                                                                                 | `dashboard/load-dashboard.ts`, dashboard route                                   | Prefetch without awaiting. A focused query-backed welcome container loads modal code only when required and handles optional-query errors separately. A deferred-promise regression test proves the dashboard can resolve while preferences are pending.                             |
| 10  | Verified NFC loader builds clock page data, then the mounted employee query started empty and fetched the same page again.                                                                                                             | `employee-clock-page.tsx`, `hooks/use-time-clock-query.ts`                       | Dedicated query options seed from the verified loader result with the existing 30 s freshness policy. QueryObserver test confirms zero redundant mount fetch and a normal refetch after invalidation. Keys retain scan and user isolation; mutation authorization is unchanged.      |

Additional clock correctness fixes: `useLiveNow` previously retained its initial
Date while disabled. If an open entry arrived later, that old Date could precede
clock-in and clamp elapsed time to zero until the next tick. It now derives time
on the enabling render and resynchronizes on focus/visibility changes. The
regression fixture shows four minutes immediately, without waiting an interval.
Elapsed duration still comes from the authoritative clock-in timestamp. No
payable-time, timezone, NFC proof or server clock/security calculations changed.
The PWA route allowlist also now accepts direct `/clock` as well as token paths,
avoiding an unintended installed-app redirect for NFC scans.

## Bundle, execution and dependency findings

The bundle report records Vite/Rolldown versions, static/dynamic edges and module
attribution using Vite's native `generateBundle` API. A final artifact check
found the entry changes later in Vite/framework finalization: the final entry
file was 298,411 B although the earlier hook saw 280,564 B. The tool now runs a
post-build finalizer that reads the actual Nitro files and their generated gzip
and Brotli variants. Reports label their analysis stage and comparison rejects
mixed stages. No incompatible Rollup visualizer was added. Reports stay outside
the public build and normal builds do not emit them.

The static-entry rows above and large-chunk table below from the original A/B run
describe the **bundler stage**, not final delivered totals. Both were captured
at the same stage. The actual initial public-page browser decoded/transfer
measurements above include final output and are the stronger payload evidence.
The original final baseline static closure was not retained; it has not been
inferred by adding an assumed bootstrap size.

| Large chunk after changes |         Raw |      Gzip | Startup entry?                                  |
| ------------------------- | ----------: | --------: | ----------------------------------------------- |
| PDF generator             | 1,601,452 B | 537,222 B | No; already imported when exporting             |
| Client entry              |   280,565 B |  84,740 B | Yes                                             |
| Rota workspace            |   142,260 B |  43,239 B | No                                              |
| Zod schemas               |    85,819 B |  24,246 B | Yes                                             |
| Help articles             |    59,647 B |  16,965 B | No, after this change                           |
| Router match/core         |    58,680 B |  20,577 B | Yes                                             |
| Assign-shift dialog       |    53,423 B |  18,043 B | No                                              |
| Calendar                  |    52,958 B |  16,043 B | No                                              |
| Auth client               |    51,842 B |  17,000 B | No in static entry; workspace/login can need it |

React DOM, Router, Query, server-function transport and Zod account for much of
the remaining entry. Validation was not weakened to reduce payload. `npm ls`
confirmed one app React/React DOM version and one app Zod v4; Zod v3 is present
under the shadcn tool. The PDF chunk contains distinct PDFKit/fontkit and multiple
reconciler implementations; it is a potential export-time investigation, not a
startup dependency. Dnd-kit, form/calendar code and export code already have
destination/on-demand boundaries. Recharts was not found in the measured initial
closure. Manrope is self-hosted with `font-display: swap`; unused language subsets
in CSS do not establish that browsers downloaded all subsets.

No arbitrary memoization, global cache, broad staleTime increase, or forced
manual vendor grouping was introduced. The clock interval remains confined to
clock components. React commit timing is available in the optional local
production profiling renderer; a complete authenticated hydration/CPU profile
and repeated heavy-rota render measurements remain outstanding.

## Database, caching and navigation

Read-only probes against the configured database, without returning records:

| Probe                                          | Measured result                                          |
| ---------------------------------------------- | -------------------------------------------------------- |
| First connection + SELECT 1                    | 210 ms                                                   |
| Warm SELECT 1 round trips                      | 12 / 12 / 10 / 10 ms                                     |
| Membership plan execution                      | 0.049 ms                                                 |
| Locations plan execution                       | 0.516 ms                                                 |
| Rota lookup plan execution                     | 16.029 ms; existing `rotas_organization_lookup_idx` used |
| Enabled employee assignments                   | 2.069 ms                                                 |
| Actual attention SQL, execution                | 12.595 / 0.881 / 1.379 ms                                |
| Actual attention SQL, planning                 | 246.921 / 16.797 / 17.202 ms                             |
| Actual attention SQL, round trip incl. EXPLAIN | 366 / 37 / 35 ms                                         |
| Shared schedule CTE execution                  | 3.871 / 0.119 / 0.126 ms                                 |

These are small sampled tenant plans, not a load test. First samples are not a
cold-database-cache experiment. The schedule probe counts the shared CTE; it is
not the complete day endpoint. The timings do not justify a new index, pool-size
increase, prepared-statement change, or database tier upgrade. REST round trips
were much larger than the sampled SQL execution, so eliminating unnecessary
calls was the lower-risk improvement.

The PWA entry `/dashboard` still checks session, pending join requests and default
viewer, then resolves workspace context before loading dashboard access/data.
Those checks enforce onboarding and organisation boundaries. Cross-request auth
caching or skipping activation was not substituted for them. Navigation's
session/viewer freshness remains 30 s, normal queries 30 s, personal clock status
15 s, and current dashboard polling retains existing intervals. User/location
keys, scoped invalidations, organization-switch document reloads and server-side
membership/entitlement checks are unchanged.

## Authenticated after-change profiling

The optional production profiling build was compiled and exercised in the
existing authenticated browser. Timings originate inside the application, from
`onBeforeNavigate` to `onResolved`, excluding automation/tool round trips. These
are after-change diagnostic samples, not release-build A/B comparisons or
home-screen launches. They were collected on a small existing workspace.

| Destination   |  First observed transition | Three subsequent cycles | Workspace React time in those cycles |
| ------------- | -------------------------: | ----------------------- | ------------------------------------ |
| Timesheets    |                   1,194 ms | 98 / 100 / 90 ms        | 14.3 / 11.3 / 11.2 ms                |
| Time tracking |                   2,076 ms | 64 / 63 / 67 ms         | 9.3 / 8.2 / 7.0 ms                   |
| Dashboard     | Initial document not timed | 518 / 100 / 85 ms       | 27.7 / 21.8 / 15.6 ms                |

The 518 ms dashboard cycle included three server requests after navigation
context became stale. The remaining eight cycle samples had no blocking server
requests in the router timing window. Initial Time tracking included four
server requests and 225.6 ms of workspace React commits. `onResolved` does not
mean every background notification/statistics query has completed.

This confirms useful cached navigation, and also confirms that uncached/stale
paths still warrant work. During these profiling requests, individual Supabase
reads ranged up to 575 ms, membership round trips up to 118 ms, and dashboard SQL
round trips were observed at 21–92 ms. Requests overlapped; the logs deliberately
omit request URLs, so these values cannot be attributed to a specific SQL call
or added to reconstruct one route's critical path. Further tracing should
correlate fixed operation labels within each request before rewriting those
paths. No authenticated speedup is claimed without a baseline.

The profiling renderer was confirmed in the bundle module report. The public
HTTP probe also verified real headers such as `auth;dur=2.6` and
`request;dur=215.3`. Profiling output is separate from normal release comparisons.

## Server/infrastructure findings

Nitro is built for `node-server`. Public hashed assets already have one-year
immutable cache rules and precompressed gzip/Brotli variants. Brand/PWA assets
have weekly caching. Authenticated HTML must stay private with fresh security
nonces; service-worker HTML caching was deliberately not added. Compression of
dynamic HTML needs verification at the actual proxy: local uncompressed HTML
does not prove the hosted deployment lacks compression.

No hosting CPU/memory metrics, reverse-proxy config, hosted TTFB trace, region
comparison or production resource budget was available in this checkout. Do not
recommend more hardware or a hosting migration based on these local results.
Opt-in request/auth/REST/membership/dashboard-SQL timing now helps distinguish
application handling and round trips; EXPLAIN separates planning/execution.
Concurrent timing totals overlap and cannot simply be subtracted from TTFB.

## Verification and remaining work

- Release build and TypeScript checks passed. Targeted regression tests passed.
- Full suite: 136 files passed, 2 optional integration files skipped; 545 tests
  passed initially, 19 skipped; the final rerun passed 546 after adding the direct
  PWA-clock regression. Those integration files were then run explicitly against
  temporary transaction-local fixtures: all 19 passed.
- Existing coverage includes auth/session/permission isolation, dashboard access,
  rotas, timesheets, pay rules, attendance automation and billing calculations.
  It does not constitute a real NFC tap or live payment/checkout test.
- Authenticated browser checks rendered the manager dashboard, rota list and
  timesheets and time tracking with the shell present. Authenticated after-change
  timings were collected from the verified production profiler as described
  above. A rota guide modal was observed;
  automation should use a seeded test account with guides already dismissed.
- Re-run the original hosted dashboard Lighthouse test with the same account,
  viewport, throttling and data. Record session restoration, first useful
  content, route resolution, query completion and hydration separately.
- Use an actual installed phone for the cold/warm launch/resume protocol in the
  tooling README. The mobile browser samples explicitly reported
  `standalone: false`. The four-second installed-PWA report remains unverified.
- Next investigations: large-tenant attention-query planning/schedule scope,
  authenticated startup's request chain, heavy rota render traces, PDF export
  duplication, and actual proxy/server metrics. Add indexes or infrastructure
  only after those measurements support them.

The measured public mobile content appears substantially sooner, and the app
startup payload and avoidable personal-dashboard requests are smaller. These
results do not certify that every authenticated page or installed device is now
instantaneous.

Final release verification: the optional profiling build compiled and ran, then
an ordinary build was restored. Its **delivered** static entry is 607,505 B raw /
199,726 B gzip / 175,466 B Brotli across 59 chunks. The browser comparison above
uses the preceding measured release artifact; final lint/import cleanup removed
one tiny chunk and changed bundler-stage raw size by one byte. The final build contains neither React's
profiling renderer nor navigation/query timing logs. TypeScript, changed-file
lint and the final 546-test unit run passed; all 19 separate SQL integration
tests passed. The full repository lint run was bounded and stopped; the final
lint verification covers every changed implementation/tooling file.

## Reproduction and references

Runbooks and script arguments: [`scripts/performance/README.md`](scripts/performance/README.md).
Local raw evidence is in ignored `.performance/baseline/` and `.performance/after/`;
use `npm run perf:compare -- baseline after` for medians and bundle totals.
The retained, sanitized results are also in
[`docs/engineering/performance-measurements.json`](docs/engineering/performance-measurements.json).
Build/test logs are under ignored `tmp/performance-*`.

API/method references checked during implementation:
[Vite plugin output metadata](https://vite.dev/guide/api-plugin),
[Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization),
[Supabase plan diagnostics](https://supabase.com/docs/guides/database/debugging-performance).
