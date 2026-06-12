import { createServerFn } from "@tanstack/react-start"

import {
  getHasUnreadRotaUpdatesInputSchema,
  getRotaDetailPageDataInputSchema,
  getRotaListPageDataInputSchema,
  getRotaWorkspaceDataInputSchema,
} from "@/features/rota/schemas/rota-server-schemas"
import {
  createRotaDraft,
  duplicateRotaToNextWeek,
  previewRotaCreation,
} from "@/features/rota/server/create-actions"
import {
  deleteDraftRota,
  unpublishRota,
} from "@/features/rota/server/lifecycle-actions"
import { publishRotaVersion, updateRotaNote } from "@/features/rota/server/update-actions"
import {
  assignRotaShiftEmployee,
  copyRotaBoard,
  createRotaShift,
  moveRotaShiftAssignment,
  removeRotaShiftAssignment,
  saveRotaWorkspace,
} from "@/features/rota/server/workspace-write"
import {
  applyRotaTemplateToRota,
  createRotaTemplateFromRota,
  overrideRotaTemplateFromRota,
} from "@/features/rota/server/template-actions"

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

const getRotaWorkspaceData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getRotaWorkspaceDataInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/rota/server/workspace-read")
    return module.getRotaWorkspaceData(data)
  })

export {
  assignRotaShiftEmployee,
  applyRotaTemplateToRota,
  copyRotaBoard,
  createRotaDraft,
  createRotaTemplateFromRota,
  deleteDraftRota,
  createRotaShift,
  duplicateRotaToNextWeek,
  getHasUnreadRotaUpdates,
  getRotaDetailPageData,
  getRotaListPageData,
  getRotaWorkspaceData,
  moveRotaShiftAssignment,
  overrideRotaTemplateFromRota,
  previewRotaCreation,
  publishRotaVersion,
  removeRotaShiftAssignment,
  saveRotaWorkspace,
  unpublishRota,
  updateRotaNote,
}
