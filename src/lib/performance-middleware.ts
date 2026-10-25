import { createMiddleware } from "@tanstack/react-start"

export const performanceMiddleware = createMiddleware().server(
  async ({ next }) => {
    if (!import.meta.env.DEV && process.env.PERFORMANCE_PROFILE !== "1")
      return next()
    const { timeServerOperation } = await import("@/lib/server-timing")
    return timeServerOperation("request", async () => next())
  }
)
