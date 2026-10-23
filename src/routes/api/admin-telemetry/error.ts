import { createFileRoute } from "@tanstack/react-router"

import { rejectRetiredTelemetry } from "@/features/admin-observability/server/retired-telemetry"

export const Route = createFileRoute("/api/admin-telemetry/error")({
  server: {
    handlers: {
      POST: rejectRetiredTelemetry,
    },
  },
})
