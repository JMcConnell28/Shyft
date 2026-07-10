"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { shiftSwapQueryKeys } from "@/features/shift-swaps/query-keys"
import {
  approveShiftSwap,
  cancelShiftSwap,
  createShiftCoverRequest,
  createShiftSwapRequest,
  denyShiftSwap,
  offerShiftCover,
  respondToShiftSwapRequest,
} from "@/features/shift-swaps/server-fns"
import type { ShiftSwapScopeInput } from "@/features/shift-swaps/hooks/use-shift-swap-page-query"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useShiftSwapMutations(input: ShiftSwapScopeInput) {
  const queryClient = useQueryClient()
  const approveShiftSwapFn = useServerFn(approveShiftSwap)
  const cancelShiftSwapFn = useServerFn(cancelShiftSwap)
  const createShiftCoverRequestFn = useServerFn(createShiftCoverRequest)
  const createShiftSwapRequestFn = useServerFn(createShiftSwapRequest)
  const denyShiftSwapFn = useServerFn(denyShiftSwap)
  const offerShiftCoverFn = useServerFn(offerShiftCover)
  const respondToShiftSwapRequestFn = useServerFn(respondToShiftSwapRequest)

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: shiftSwapQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: rotaQueryKeys.all }),
    ])
  }

  return {
    approveMutation: useMutation({
      mutationFn: (variables: { requestId: string; note?: string }) =>
        approveShiftSwapFn({ data: { ...input, ...variables } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Shift change approved.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not approve that shift change.",
        })
      },
    }),
    cancelMutation: useMutation({
      mutationFn: (requestId: string) =>
        cancelShiftSwapFn({ data: { ...input, requestId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Request cancelled.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not cancel that request.",
        })
      },
    }),
    createCoverMutation: useMutation({
      mutationFn: (sourceAssignmentId: string) =>
        createShiftCoverRequestFn({ data: { ...input, sourceAssignmentId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Cover request opened.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not open that cover request.",
        })
      },
    }),
    createSwapMutation: useMutation({
      mutationFn: (variables: {
        sourceAssignmentId: string
        targetAssignmentId: string
      }) => createShiftSwapRequestFn({ data: { ...input, ...variables } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Swap request sent.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not send that swap request.",
        })
      },
    }),
    denyMutation: useMutation({
      mutationFn: (variables: { requestId: string; note?: string }) =>
        denyShiftSwapFn({ data: { ...input, ...variables } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Shift change denied.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not deny that shift change.",
        })
      },
    }),
    offerCoverMutation: useMutation({
      mutationFn: (requestId: string) =>
        offerShiftCoverFn({ data: { ...input, requestId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Cover offer sent for approval.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not offer cover for that shift.",
        })
      },
    }),
    respondMutation: useMutation({
      mutationFn: (variables: {
        requestId: string
        decision: "accept" | "decline"
      }) => respondToShiftSwapRequestFn({ data: { ...input, ...variables } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Swap response saved.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not update that swap request.",
        })
      },
    }),
  }
}

export { useShiftSwapMutations }
