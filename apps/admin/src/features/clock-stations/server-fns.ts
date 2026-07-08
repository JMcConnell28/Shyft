import { createServerFn } from "@tanstack/react-start"

import { generateClockStationTagInputSchema } from "@/features/clock-stations/schemas"

const getClockStations = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminPermission } = await import(
    "@/features/auth/server/admin-session"
  )
  const { getClockStationsPageData } = await import(
    "@/features/clock-stations/server/queries"
  )

  await requireAdminPermission("clock_stations.manage")
  return getClockStationsPageData()
})

const generateClockStationTagServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    generateClockStationTagInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { generateClockStationTag } = await import(
      "@/features/clock-stations/server/actions"
    )

    const { membership } = await requireAdminPermission("clock_stations.manage")
    return generateClockStationTag({
      adminUserId: membership.userId,
      locationId: data.locationId,
    })
  })

export { generateClockStationTagServerFn, getClockStations }
