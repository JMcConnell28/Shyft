import { createFileRoute } from "@tanstack/react-router"
import { downloadPersonalData } from "@/features/personal-data/server/download"

export const Route = createFileRoute("/api/personal-data/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) => downloadPersonalData(request, params.id),
    },
  },
})
