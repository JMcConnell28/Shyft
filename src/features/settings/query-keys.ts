const settingsQueryKeys = {
  all: ["settings"] as const,
  general: (input: { organizationId: string; userId: string }) =>
    [...settingsQueryKeys.all, "general", input] as const,
  locations: (input: { organizationId?: string; locationId?: string; userId: string }) =>
    [...settingsQueryKeys.all, "locations", input] as const,
  connections: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...settingsQueryKeys.all, "connections", input] as const,
  rota: (input: { organizationId?: string; locationId?: string; userId: string }) =>
    [...settingsQueryKeys.all, "rota", input] as const,
}

export { settingsQueryKeys }
