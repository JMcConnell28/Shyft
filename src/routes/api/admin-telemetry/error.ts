import { createFileRoute } from "@tanstack/react-router"

import { captureAppErrorSchema } from "@/features/admin-observability/schemas/telemetry-schemas"
import { captureAppError } from "@/features/admin-observability/server/telemetry"

export const Route = createFileRoute("/api/admin-telemetry/error")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const input = captureAppErrorSchema.parse(await request.json())
        const result = await captureAppError(input)

        return Response.json(result)
      },
    },
  },
})
