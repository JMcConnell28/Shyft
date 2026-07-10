import { createServerFn } from "@tanstack/react-start"

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
  .inputValidator((input: unknown) => listShiftSwapPageDataInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/shift-swaps/server/queries")
    return module.listShiftSwapPageData(data)
  })

const createShiftSwapRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSwapRequestInputSchema.parse(input))
  .handler(async ({ data }) => createSwapRequest(data))

const createShiftCoverRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createCoverRequestInputSchema.parse(input))
  .handler(async ({ data }) => createCoverRequest(data))

const respondToShiftSwapRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => respondToSwapRequestInputSchema.parse(input))
  .handler(async ({ data }) => respondToSwapRequest(data))

const offerShiftCover = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => offerCoverInputSchema.parse(input))
  .handler(async ({ data }) => offerCover(data))

const cancelShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => cancelShiftSwapRequestInputSchema.parse(input))
  .handler(async ({ data }) => cancelShiftSwapRequest(data))

const approveShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => managerShiftSwapActionInputSchema.parse(input))
  .handler(async ({ data }) => approveShiftSwapRequest(data))

const denyShiftSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => managerShiftSwapActionInputSchema.parse(input))
  .handler(async ({ data }) => denyShiftSwapRequest(data))

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
