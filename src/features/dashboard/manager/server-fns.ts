import { createServerFn } from "@tanstack/react-start"
import {
  attentionInputSchema,
  managerDayInputSchema,
  managerScopeSchema,
  resolveArrivalSchema,
} from "./schemas"

const getManagerDashboardAccess = createServerFn({ method: "POST" })
  .validator((input: unknown) => managerScopeSchema.parse(input))
  .handler(async ({ data }) => {
    const { resolveManagerDashboardAccess } = await import("./server/access")
    const { locations, capabilities } = await resolveManagerDashboardAccess(
      data.organizationId
    )
    return { locations, capabilities }
  })
const getManagerDashboardDay = createServerFn({ method: "POST" })
  .validator((input: unknown) => managerDayInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("./server/day")
    return module.getManagerDashboardDay(data)
  })
const getManagerDashboardAttention = createServerFn({ method: "POST" })
  .validator((input: unknown) => attentionInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("./server/attention")
    return module.getManagerDashboardAttention(data)
  })
const resolveDashboardArrival = createServerFn({ method: "POST" })
  .validator((input: unknown) => resolveArrivalSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("./server/resolve-arrival")
    return module.resolveDashboardArrival(data)
  })
export {
  getManagerDashboardAccess,
  getManagerDashboardDay,
  getManagerDashboardAttention,
  resolveDashboardArrival,
}
