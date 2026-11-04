# S07: retire legacy main-app station administration

Updated 2 November 2026. Implemented locally; main-app deployment and a deployed rejection check remain outstanding.

## Change

The main app's `/admin/clock-tags` route and its two privileged server functions have been removed. The associated email allowlist authorization, provisioning code, hooks, component, schemas and unused types have also been removed. `ADMIN_EMAILS` no longer grants application privileges. Existing main-app accounts remain ordinary customer accounts.

Station provisioning now uses the dedicated admin console's `/clock-stations` tools. Those tools require `clock_stations.manage` and recheck current admin membership and `disabled_at`. Main-app and admin sessions remain separate. Disabling an operator in the dedicated console cannot leave an alternate provisioning route in the main app after this deployment.

## Verification

Sixteen dedicated-admin regression cases pass across the session authorization, clock-station server functions, station actions and customer setup modules. They cover disabled and unprovisioned operators, revocation after an earlier successful request, current permissions overriding stale session roles, authorization before database reads or key generation, authorized operators retaining access, and authenticated operator attribution. Email and database boundaries are mocked; no hosted operator was disabled or customer tag changed.

Source searches and scans of the fresh server/client production artifacts find no remaining main-app `ADMIN_EMAILS` authorization, legacy route, provisioning function or old RPC registration. The main production build passes. A temporary localhost server running that build returns **404** for `/admin/clock-tags`; replaying each of the two old RPC IDs fails with the framework's unknown-function **500** response. Neither RPC is registered in the build. The temporary server was stopped afterward. This verifies removal locally; it does not attest the deployed site's revision.

The final main TypeScript check and focused lint also pass. The router generator removed the route from `routeTree.gen.ts`; that generated file was not edited manually.

## Rollout

1. Deploy the main app and replace every old main-app process. Provision stations through the dedicated admin console.
2. Confirm `/admin/clock-tags` is unavailable on the deployed main origin. Replay the old server-function IDs and confirm no setup data or mutation is available.
3. Using a disposable admin operator, confirm provisioning works, disable the operator, then confirm both setup reads and generation are denied using its existing session.
4. Remove the obsolete `ADMIN_EMAILS` deployment variable during configuration cleanup. It is no longer consumed by the application. No database migration is required for S07.

The original Word audit remains the baseline. The Markdown register and these notes track remediation.
