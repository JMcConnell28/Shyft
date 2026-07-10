import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import type { z } from "zod"

import type {
  captureAppErrorSchema,
  captureAppEventSchema,
} from "@/features/admin-observability/schemas/telemetry-schemas"
import { getDatabase } from "@/lib/db"

type CaptureAppErrorInput = z.infer<typeof captureAppErrorSchema>
type CaptureAppEventInput = z.infer<typeof captureAppEventSchema>

async function captureAppError(input: CaptureAppErrorInput) {
  const fingerprint = createErrorFingerprint(input)

  await getDatabase().query(
    `insert into admin_private.app_error_reports (
       fingerprint,
       source,
       severity,
       message,
       stack,
       route_path,
       user_id,
       organization_id,
       location_id,
       user_agent,
       metadata
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (fingerprint)
     do update set last_seen_at = timezone('utc', now()),
                   occurrence_count = admin_private.app_error_reports.occurrence_count + 1,
                   metadata = admin_private.app_error_reports.metadata || excluded.metadata`,
    [
      fingerprint,
      input.source,
      input.severity,
      input.message,
      input.stack ?? null,
      input.routePath ?? null,
      input.userId ?? null,
      input.organizationId ?? null,
      input.locationId ?? null,
      input.userAgent ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  )

  return { fingerprint }
}

async function captureAppEvent(input: CaptureAppEventInput) {
  await getDatabase().query(
    `insert into admin_private.app_events (
       event_type,
       actor_user_id,
       organization_id,
       location_id,
       target_type,
       target_id,
       metadata
     ) values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.eventType,
      input.userId ?? null,
      input.organizationId ?? null,
      input.locationId ?? null,
      input.targetType ?? null,
      input.targetId ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  )

  return { success: true }
}

function createErrorFingerprint(input: CaptureAppErrorInput) {
  return createHash("sha256")
    .update([input.source, input.routePath ?? "", input.message, input.stack ?? ""].join("|"))
    .digest("hex")
}

export { captureAppError, captureAppEvent }
