import { createServerFn } from "@tanstack/react-start"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"

import {
  cancelShiftSwapRequestInputSchema,
  createCoverRequestInputSchema,
  createSwapRequestInputSchema,
  listShiftSwapPageDataInputSchema,
  managerShiftSwapActionInputSchema,
  offerCoverInputSchema,
  respondToSwapRequestInputSchema,
} from "@/features/shift-swaps/schemas/shift-swap-schemas"
import {
  approveShiftSwapRequest,
  cancelShiftSwapRequest,
  createCoverRequest,
  createSwapRequest,
  denyShiftSwapRequest,
  offerCover,
  respondToSwapRequest,
} from "@/features/shift-swaps/server/actions"

const getShiftSwapPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    listShiftSwapPageDataInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/shift-swaps/server/queries")
    return module.listShiftSwapPageData(data)
  })

const createShiftSwapRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSwapRequestInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return createSwapRequest(data)
  })

const createShiftCoverRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createCoverRequestInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return createCoverRequest(data)
  })

const respondToShiftSwapRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    respondToSwapRequestInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return respondToSwapRequest(data)
  })

const offerShiftCover = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => offerCoverInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return offerCover(data)
  })

const cancelShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    cancelShiftSwapRequestInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return cancelShiftSwapRequest(data)
  })

const approveShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    managerShiftSwapActionInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return approveShiftSwapRequest(data)
  })

const denyShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    managerShiftSwapActionInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    return denyShiftSwapRequest(data)
  })

export {
  approveShiftSwap,
  cancelShiftSwap,
  createShiftCoverRequest,
  createShiftSwapRequest,
  denyShiftSwap,
  getShiftSwapPageData,
  offerShiftCover,
  respondToShiftSwapRequest,
}
