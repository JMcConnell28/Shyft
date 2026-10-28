# Production performance tools

Run from the repository root with Node 22.12–22.x and `npm ci`.
The browser commands use installed Microsoft Edge by default; set
`PERF_BROWSER_CHANNEL=chrome` to use installed Chrome. Reports go to the ignored
`.performance/` directory. All sizes are bytes, not KiB. Run benchmarks serially,
with builds, tests and other CPU-heavy work stopped.

## Comparable release builds

```powershell
npm run perf:build -- baseline
npm run perf:start
```

In a second terminal:

```powershell
$env:PERF_LABEL = 'baseline'
npm run perf:http
npm run perf:browser -- /
$env:PERF_MOBILE = '1'
npm run perf:browser -- /
Remove-Item Env:PERF_MOBILE
npm run perf:lighthouse -- /
```

Stop the profiling server before rebuilding. Repeat with `after` as the build
label and `PERF_LABEL`, then run `npm run perf:compare -- baseline after`.
The Vite plugin records the static client-entry closure, import edges and module
attribution. After the entire build exits, the finalizer reads actual Nitro files
and gzip/Brotli variants, including later entry rewriting. Reports carry an
analysis-stage marker; comparison rejects mixed stages. Module attribution
is before final minification and must not be summed as compressed transfer size.
The initial closure excludes route-specific lazy chunks, CSS and images. The
browser harness measures the actual destination's resources as well.

`perf:start` loads `.env.local` (or `PERF_ENV_FILE`), binds loopback port 3100
(or `PERF_PORT`), and sets the local auth/app URL to that port. It sets Nitro's
installed `TEST=1` switch to disable scheduled attendance/billing jobs. It does
not change application authentication, permissions or data. Do not use this
launcher for deployment. Ordinary release commands remain `npm run build` and
`npm start`.

HTTP results distinguish statuses; a 307 is a redirect, not a completed page.
For example `/login` normalizes its default redirect search parameter. The HTTP
tool does not follow redirects. It measures headers/body time, not paint or
database execution. Its first request can include process initialization, but
only a freshly restarted server establishes a cold-process sample.

The browser harness uses three separate contexts, each with one cold load and
one warm load. The server is already running. Mobile mode uses 390×844, 4× CPU
slowdown, 150 ms latency and 200,000 bytes/s download. This is an approximation,
not a physical handset or installed-PWA measurement. LCP/CLS/long tasks are
observed for five seconds after the load event. `observedBlockingMs` is that
window's sum above 50 ms and is **not** Lighthouse TBT. Failed or redirected
authenticated pages must not be treated as dashboard measurements. Lighthouse
runs three separate default simulated-mobile audits. `PERF_SAVE_RAW=1` also
saves detailed Lighthouse diagnostics locally.

## Authenticated loads, navigation and rendering

Use an ordinary test account and save its local browser state yourself:

```powershell
npx playwright codegen --channel msedge --save-storage=.performance/session.json http://localhost:3100/login
```

Sign in, finish any optional welcome guides, and close that browser. The saved
state contains credentials and stays in the ignored directory. Then:

```powershell
$env:PERF_STORAGE_STATE = '.performance/session.json'
npm run perf:browser -- /app/YOUR-WORKSPACE/dashboard
```

For application-owned navigation/query/render timings, stop the server and make
an explicitly instrumented build:

```powershell
npm run perf:build -- profile --profile
$env:PERFORMANCE_PROFILE = '1'
npm run perf:start
```

From a second terminal with `PERF_STORAGE_STATE` set:

```powershell
$env:PERF_START_PATH = '/app/YOUR-WORKSPACE/dashboard'
$env:PERF_LABEL = 'profile'
npm run perf:navigation
```

This cycles Rotas, Timesheets, Time tracking and Dashboard three times. It waits
for the app's `onResolved` event, not automation command completion. Verify that
the seeded account can access those pages and has dismissed modal guides.
Settings and the rota editor can be investigated interactively with the same
console timings. Query timings, destination section, transferred code and
workspace timing events are logged without tenant IDs or URLs. Redact's
`<Profiler>` callback is a no-op, so React commit-duration samples are unavailable
with this runtime. Profiling builds keep the same Redact renderer; use navigation,
content-ready, browser, and Web Vitals measurements. Compare normal release builds
for headline performance numbers.

The profiling dashboard also emits `[content-ready-timing]` when primary staffing
or personal dashboard data is mounted. `documentElapsedMs` starts at document
navigation (including redirects), rather than router installation, and includes
hydration. It can be later than the first SSR paint. `documentTtfbMs` is navigation
`responseStart`, including same-origin redirects; the browser harness's `ttfbMs`
instead uses `responseStart - requestStart`. Compare each metric consistently.
For installed-entry investigation, navigate through `/dashboard?source=pwa`, not
only directly to a workspace URL. This still does not reproduce Android process
or worker startup on a real phone.
Automation should wait for `html[data-performance-content-ready="true"]` on each
new document and accept only content-ready log entries from the measured origin
whose timestamp is later than navigation start. Console logs can survive a
navigation and must not be reused as a fresh measurement.

`PERFORMANCE_PROFILE=1` opts the server into `Server-Timing` for request handling,
auth reads, membership SQL, Supabase fetches, and dashboard day/attention SQL.
`request` covers handling until a Response is produced, not full streamed-body
completion. SQL/Supabase durations include network/pool wait; separate SQL
execution/planning using the EXPLAIN tools below. Concurrent operation durations
can overlap and must not be subtracted as sequential phases from TTFB.
Outside an HTTP request, background tasks bypass header instrumentation.
Normal release builds contain no navigation/query timing logging.

Unset profiling variables and rebuild normally before using output for release.

## Database and assets

```powershell
npm run perf:db
node scripts/performance/overview-reads.mjs
npm run perf:dashboard-db
npm run perf:images
```

Database tools use the configured database, timeout their reads and print only
durations, counts, plan-node/index names, or buffer statistics. They do not print
credentials, query parameters or application rows. `perf:db` uses a read-only
transaction for scoped plans; `perf:dashboard-db` bundles the actual pure SQL
modules before EXPLAIN ANALYZE inside a read-only transaction. The schedule CTE
probe is not the complete day endpoint. The overview probe measures only the
two eliminated REST reads. Small-tenant results do not predict large-tenant
plans, and sampled first calls do not establish cold database-cache timings.

The image command regenerates committed derivatives from original PNGs. Logo,
background and full-size screenshot use lossless WebP; smaller screenshots use
quality 90 after resizing. PDF export continues using the original artwork.

## Installed PWA and hosted infrastructure

On an actual device, measure three cold and three warm launches from the home
screen on the same network. Separate OS splash/worker startup, document TTFB,
session restoration, hydration and first useful clock/dashboard content. Repeat
after force-closing and after an ordinary background/resume. Use remote browser
DevTools recordings and retain network/CPU settings with each trace. Browser
desktop mode or a viewport override cannot substitute for this measurement.

Run HTTP/browser/Lighthouse commands with `PERF_ORIGIN` pointing at the hosted
environment to compare network and reverse-proxy behaviour. Use that origin's
test-account browser state for authenticated tests. Check actual `Content-Encoding`,
hashed asset `Cache-Control`, server timing and hosting CPU/memory before
recommending resource or regional changes. Do not publicly cache authenticated
HTML, query responses or session data.
