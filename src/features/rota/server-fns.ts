import { createServerFn } from "@tanstack/react-start"

import {
  getHasUnreadRotaUpdatesInputSchema,
  getRotaDetailPageDataInputSchema,
  getRotaListPageDataInputSchema,
} from "@/features/rota/schemas/rota-server-schemas"
import {
  createRotaDraft,
  duplicateRotaToNextWeek,
  previewRotaCreation,
} from "@/features/rota/server/create-actions"
import { publishRotaVersion, updateRotaNote } from "@/features/rota/server/update-actions"

const getHasUnreadRotaUpdates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getHasUnreadRotaUpdatesInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/rota/server/access")
    return module.getHasUnreadRotaUpdates(data)
  })

const getRotaListPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getRotaListPageDataInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/rota/server/list")
    return module.getRotaListPageData(data)
  })

const getRotaDetailPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getRotaDetailPageDataInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/rota/server/detail")
    return module.getRotaDetailPageData(data)
  })

export {
  createRotaDraft,
  duplicateRotaToNextWeek,
  getHasUnreadRotaUpdates,
  getRotaDetailPageData,
  getRotaListPageData,
  previewRotaCreation,
  publishRotaVersion,
  updateRotaNote,
}
