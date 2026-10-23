import { describe, expect, it, vi } from "vitest"

import { rejectRetiredTelemetry } from "./retired-telemetry"
import { Route as eventRoute } from "@/routes/api/admin-telemetry/event"
import { Route as errorRoute } from "@/routes/api/admin-telemetry/error"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

describe("retired public telemetry", () => {
  it.each([eventRoute, errorRoute])(
    "rejects ingestion without a database write",
    (route) => {
      const handlers = route.options.server?.handlers
      if (!handlers || typeof handlers === "function" || !handlers.POST) {
        throw new Error("Expected an explicit retired POST handler.")
      }
      const handler = handlers.POST
      if (typeof handler !== "function")
        throw new Error("Expected a handler function.")
      expect(handler).toBe(rejectRetiredTelemetry)
      const response = rejectRetiredTelemetry()
      expect(response).toBeInstanceOf(Response)
      if (!(response instanceof Response))
        throw new Error("Expected a Response.")
      expect(response.status).toBe(410)
      expect(response.headers.get("Cache-Control")).toBe("no-store")
      expect(query).not.toHaveBeenCalled()
    }
  )
})
