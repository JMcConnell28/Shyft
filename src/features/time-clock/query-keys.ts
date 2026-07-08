const timeClockQueryKeys = {
  all: ["time-clock"] as const,
  adminTags: (input: { userId: string }) =>
    [...timeClockQueryKeys.all, "admin-tags", input] as const,
  employee: (input: { scanSessionId: string; userId: string }) =>
    [...timeClockQueryKeys.all, "employee", input] as const,
  manager: (input: {
    date?: string
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...timeClockQueryKeys.all, "manager", input] as const,
  settings: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...timeClockQueryKeys.all, "settings", input] as const,
}

export { timeClockQueryKeys }
