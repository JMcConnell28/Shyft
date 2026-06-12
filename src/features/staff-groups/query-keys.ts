const staffGroupQueryKeys = {
  all: ["staff-groups"] as const,
  settings: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...staffGroupQueryKeys.all, "settings", input] as const,
}

export { staffGroupQueryKeys }
