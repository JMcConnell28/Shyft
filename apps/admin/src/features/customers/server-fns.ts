import { createServerFn } from "@tanstack/react-start"
import {
  customerDetailSchema,
  customerListSchema,
  setupStationTagSchema,
  updateFulfillmentSchema,
} from "./schemas"

const getCustomers = createServerFn({ method: "POST" })
  .validator((input: unknown) => customerListSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { listCustomers } = await import("./server/queries")
    await requireAdminPermission("workspaces.read")
    return listCustomers(data)
  })

const getCustomer = createServerFn({ method: "POST" })
  .validator((input: unknown) => customerDetailSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { getCustomerDetail } = await import("./server/queries")
    await requireAdminPermission("workspaces.read")
    return getCustomerDetail(data.id)
  })

const getStationQueue = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminPermission } =
    await import("@/features/auth/server/admin-session")
  const { listStationQueue } = await import("./server/queries")
  await requireAdminPermission("clock_stations.manage")
  return listStationQueue()
})

const getStationQueueCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { countStationQueue } = await import("./server/queries")
    await requireAdminPermission("clock_stations.manage")
    return countStationQueue()
  }
)

const getCustomerStationTags = createServerFn({ method: "POST" })
  .validator((input: unknown) => customerDetailSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { getCustomerDetail } = await import("./server/queries")
    const { getTagsForLocations, getAppBaseUrl } =
      await import("@/features/clock-stations/server/queries")
    await requireAdminPermission("clock_stations.manage")
    const customer = await getCustomerDetail(data.id)
    return {
      appBaseUrl: getAppBaseUrl(),
      tags: await getTagsForLocations(
        customer?.locations.map((location) => location.id) ?? []
      ),
    }
  })

const updateStationFulfillment = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateFulfillmentSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { updateFulfillment } = await import("./server/actions")
    const { membership } = await requireAdminPermission("clock_stations.manage")
    return updateFulfillment(data, membership.userId)
  })

const setupStationTag = createServerFn({ method: "POST" })
  .validator((input: unknown) => setupStationTagSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { setupRequestTag } = await import("./server/tag-setup")
    const { membership } = await requireAdminPermission("clock_stations.manage")
    return setupRequestTag(data, membership.userId)
  })

export {
  setupStationTag,
  getCustomers,
  getCustomer,
  getCustomerStationTags,
  getStationQueue,
  getStationQueueCount,
  updateStationFulfillment,
}
