# Authenticated startup and page loading follow-up

25 October 2026. Baseline: `a3a2502` plus the same optional production timing
instrumentation used for the changed build. The user's OnePlus Nord 4 recording
shows roughly four seconds from opening the installed app to dashboard content.
The phone recording establishes the visible delay; the local measurements below
do not measure Android process startup or the hosted production server.

## Changes

- The PWA still opens its existing `/dashboard?source=pwa` entry. A dedicated
  server read now resolves the latest pending join, actual workplace membership,
  onboarding intent for users without a workplace, and location existence. It no
  longer loads the full onboarding state, staff groups, zones, invite links,
  trial and billing before redirecting. The workspace destination retains its
  session, role, billing and feature checks. Setup pages retain their fresh
  onboarding reads. Session identity and expiry are checked; updating an active
  organization does not extend the navigation session's cache freshness.
- Manager location summaries shared by dashboard, rota and timesheet access use
  the existing Postgres pool after the same role checks. Clock scope reuses this
  organization lookup and keeps a separate single-location read. The legacy
  location-membership and employee-assignment access paths retain their existing
  restrictions. Employee/location assignments and employee details use one
  joined query instead of two sequential REST requests. Both query results are
  validated, retain location scope, and preserve inactive employees and disabled
  assignment exclusions. The manual clock form loads when it is opened.
- Server rendering waits for the manager dashboard's primary staffing snapshot.
  Optional attention begins on the client; client navigation still starts both
  requests without blocking the shell. This avoids racing unawaited server
  prefetches against HTML rendering and query dehydration. Initial staffing errors
  use the route error boundary; refresh errors retain the existing inline state.
- The service worker enables navigation preload when supported and consumes the
  preloaded response, preserving ordinary-fetch and offline fallbacks. Navigation
  HTML is never written to the cache. The existing public-asset cache is retained
  across this update. Browser preload overlaps the document request with worker
  startup; its device-specific benefit still needs a phone check.
  See [Chrome's navigation preload documentation](https://developer.chrome.com/docs/workbox/navigation-preload).
- Optional profiling now records the first mounted dashboard with staffing data,
  separately from route resolution. It reports document elapsed time, document
  response-start time and a server-function request count without tenant IDs,
  credentials or URLs. A normal release disables these logs.

## Measurement method and limits

An existing signed-in local browser session was used for production builds on
loopback, connected to the configured database. No credentials were exported.
Scheduled attendance and billing jobs were disabled for local profiling. The
same desktop browser, account and unthrottled connection were used before and
after, with browser asset caches preserved. These are document reloads through
the PWA entry route and first visits with fresh router/query state; they are not
fresh browser profiles or installed Android launches. Live workspace data was
not frozen between runs.

The final comparison builds the original source in an isolated ignored directory
and runs it on a separate loopback port. Both versions have the same timing hook.
Each measured navigation waits for a new document's content-ready marker and
accepts only a console entry from that origin recorded after navigation began.
Earlier exploratory console samples are excluded because logs can survive
document navigation. Both origins are warmed before the measured samples.

`documentElapsedMs` is the app's content-ready effect measured from the start of
the document navigation. It includes hydration and may occur after content was
first painted by SSR. `documentTtfbMs` is navigation `responseStart`, including
same-origin redirect work. It differs from the public-page harness's narrower
`responseStart - requestStart` value. Route timings come from the app's
`onResolved` event and exclude browser automation command duration.

An early changed build still showed production hydration recovery and large
server-request variance. Its numbers are not the final comparison. An initial
full-suite run encountered five worker-start timeouts; the affected files passed
when rerun with a single thread. The complete final suite passed with one thread:
142 files, 596 tests, including all SQL tests against temporary, rolled-back
tables. After the final shared-location change, 140 files/588 tests passed and
two workers timed out during concurrent builds; those two files then passed
separately (9 tests) with builds stopped. Thus all 142 final files/597 assertions
passed across the final run and isolated rerun. TypeScript and changed-file lint
passed. Development-only source-location attribute warnings were also observed
in the devtools build; these are separate from production text hydration recovery.

## Matched authenticated results

Descriptive medians from six alternating dashboard documents per build and three
first visits per other page, following a fresh dashboard document. Both are
production profiling builds; both asset caches and servers were warmed first.
The complete sanitized samples are in
[`pwa-startup-measurements.json`](pwa-startup-measurements.json).

| Metric | Baseline | Optimized |
| --- | ---: | ---: |
| Dashboard content-ready effect | 759 ms | 586 ms |
| Dashboard document response-start, including redirects | 331 ms | 287.5 ms |
| Dashboard loads with observed React text hydration recovery | 5 of 6 | 0 of 6 |
| First timesheets navigation, route resolved | 176 ms | 145 ms |
| First time-tracking navigation, route resolved | 278 ms | 273 ms |

Dashboard readiness improved by about 23% in these local samples. The
time-tracking median difference is too small to establish a meaningful speedup.
Its first observed visit was 505 ms versus 274 ms, but one pair is not a robust
estimate. Earlier exploratory visits in both builds exposed multi-second REST
waits. The remaining time-tracking data reads still use REST, so these changes
do not eliminate every possible slow response. No hosted dashboard Lighthouse
score or installed-device launch time is inferred from these measurements.

## Release verification

The ordinary production build passed after profiling was disabled. Its delivered
static client entry closure is 607,017 bytes raw / 199,606 gzip / 175,347 Brotli
across 58 chunks; these totals exclude destination-specific lazy chunks. The
output contains no timing log statements, content-ready marker or profiling
renderer. The small shared timing hook compiles to inert React hooks in release.
The generated service worker matches the source and passes a syntax check.

A final authenticated check of this ordinary build rendered both dashboard
views, changed between them, loaded time tracking, and opened and closed its
deferred manual form without submission. No production console errors or
profiling logs were observed in that check. A browser automation wait expired
before one time-tracking visit completed; a subsequent state check confirmed the
page loaded without errors. All temporary profiling servers and the temporary
browser tab were stopped. Changes remain local; no deployment or schema change
was performed.

## On-device check after deployment

Keep the existing OnePlus Nord 4 installation and cache. Open the deployed app
once to allow the updated service worker to activate, then close it. On the same
network, record three launches after removing it from recent apps, three ordinary
background/resume cases, and the same navigation sequence. Compare tap-to-content
time, the logo-only interval and loading placeholders. If multi-second waits
persist, capture an authenticated Android browser network trace and correlate
document, session/workspace and data requests with hosted server timing. The
recording and desktop measurements do not justify a hosting tier upgrade by
themselves.
