import { createFileRoute } from "@tanstack/react-router"

import { createSupportThreadSchema } from "@/features/admin-support/schemas/support-schemas"
import { createSupportThread } from "@/features/admin-support/server/support-actions"

export const Route = createFileRoute("/api/support/thread")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const input = createSupportThreadSchema.parse(await request.json())
        const result = await createSupportThread(input)

        return Response.json(result)
      },
    },
  },
})
