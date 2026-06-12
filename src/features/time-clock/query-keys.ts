const timeClockQueryKeys = {
  all: ["time-clock"] as const,
  employee: (input: { token: string; userId: string }) =>
    [...timeClockQueryKeys.all, "employee", input] as const,
  manager: (input: {
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
