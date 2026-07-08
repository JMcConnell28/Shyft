const shiftSwapQueryKeys = {
  all: ["shift-swaps"] as const,
  page: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...shiftSwapQueryKeys.all, "page", input] as const,
}

export { shiftSwapQueryKeys }
