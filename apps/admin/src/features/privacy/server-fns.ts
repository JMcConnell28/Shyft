import { createServerFn } from "@tanstack/react-start"
import {
  privacyIdSchema,
  privacyListSchema,
  privacyRevisionSchema,
  recordPrivacyRequestSchema,
  releasePrivacyResponseSchema,
  savePrivacyDraftSchema,
  updatePrivacyRequestSchema,
} from "@rocketrota/shared/privacy"

const listPrivacyRequests = createServerFn({ method: "POST" })
  .validator((input: unknown) => privacyListSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    await requirePrivacyAdmin()
    const { listPrivacyAdminRequests } = await import("@rocketrota/db/privacy")
    return listPrivacyAdminRequests(data.page)
  })
const getPrivacyRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => privacyIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    await requirePrivacyAdmin()
    const { getPrivacyAdminDetail } = await import("@rocketrota/db/privacy")
    return getPrivacyAdminDetail(data.id)
  })
const preparePrivacyRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => privacyRevisionSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { preparePrivacyDraft } = await import("@rocketrota/db/privacy")
    await preparePrivacyDraft(data.id, data.revision, actor)
    return { success: true }
  })
const savePrivacyRequestDraft = createServerFn({ method: "POST" })
  .validator((input: unknown) => savePrivacyDraftSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { savePrivacyDraft } = await import("@rocketrota/db/privacy")
    await savePrivacyDraft(data, actor)
    return { success: true }
  })
const updatePrivacyRequestStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => updatePrivacyRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { updatePrivacyRequest } = await import("@rocketrota/db/privacy")
    await updatePrivacyRequest(data, actor)
    return { success: true }
  })
const releasePrivacyRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => releasePrivacyResponseSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { releasePrivacyResponse } = await import("@rocketrota/db/privacy")
    await releasePrivacyResponse(data, actor)
    return { success: true }
  })
const revokePrivacyRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => privacyRevisionSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { revokePrivacyResponse } = await import("@rocketrota/db/privacy")
    await revokePrivacyResponse(data.id, data.revision, actor)
    return { success: true }
  })
export {
  recordPrivacyRequest,
  getPrivacyRequest,
  listPrivacyRequests,
  preparePrivacyRequest,
  releasePrivacyRequest,
  revokePrivacyRequest,
  savePrivacyRequestDraft,
  updatePrivacyRequestStatus,
}

const recordPrivacyRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => recordPrivacyRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePrivacyAdmin } = await import("./server/access")
    const actor = await requirePrivacyAdmin()
    const { recordManualPrivacyRequest } =
      await import("@rocketrota/db/privacy")
    return { id: await recordManualPrivacyRequest(data, actor) }
  })
