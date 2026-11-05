# Settings save performance

The 5 November 2026 investigation found fast SQL execution but slow perceived
saves. Zone and location dialogs awaited broad settings and rota invalidation;
location creation then also awaited a navigation/router refresh. This kept the
save pending while unrelated reads completed.

Confirmed zone writes now patch the scoped rota/location settings caches,
including counts, renamed labels and archived default-zone selections. In-flight
reads are cancelled before applying the response so an older result cannot
overwrite it. Dependent rota boards, lists and creation previews become stale
without an immediate refetch. Unread-rota notifications are unaffected.

Location creation returns its actual initial zones, generated slug and database
closing-time defaults. The visible location list updates from that response.
General-settings location summaries update too. Other rota settings and the
current user's matching workspace viewer become stale for the next navigation;
there is no full navigation/session/router reload on the save path.

Server changes:

| Work                                                    | Previously                | Now                                            |
| ------------------------------------------------------- | ------------------------- | ---------------------------------------------- |
| Zone location validation, duplicate check and insertion | 3 sequential queries      | 1 CTE with the existing unique index           |
| Initial zones for a new location                        | 1 insert per zone         | 1 parameterized bulk insert                    |
| Slug availability                                       | 1 read per suffix attempt | 1 read of matching candidates                  |
| Billing and location permissions                        | Serial checks             | Parallel checks; both must pass before writing |

Location creation remains transactional. The organisation creation lock still
serializes duplicate-name checking and now also covers slug allocation. Names,
role checks, billing restrictions and server-function Zod validation remain in
force. No migrations or permission changes are needed.

Validation includes 22 focused tests for cache scope, stale-response cancellation,
save completion, access denial, duplicates, slug collisions, batching and rollback.
The exact new zone and bulk-insert SQL was exercised on staging inside a fully
rolled-back fixture transaction. This verifies behaviour and reduced request
counts, not a measured end-to-end speedup in a user's browser.
