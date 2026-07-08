import { createFileRoute } from "@tanstack/react-router"

import { captureAppEventSchema } from "@/features/admin-observability/schemas/telemetry-schemas"
import { captureAppEvent } from "@/features/admin-observability/server/telemetry"

export const Route = createFileRoute("/api/admin-telemetry/event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const input = captureAppEventSchema.parse(await request.json())
        const result = await captureAppEvent(input)

        return Response.json(result)
      },
    },
  },
})
