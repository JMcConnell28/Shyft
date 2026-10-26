const companyQueryKeys = {
  all: ["company"] as const,
  sageImportAccess: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...companyQueryKeys.all, "sage-import-access", input] as const,
  employees: (input: {
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...companyQueryKeys.all, "employees", input] as const,
  employee: (input: {
    employeeId: string
    organizationId?: string
    locationId?: string
    userId: string
  }) => [...companyQueryKeys.all, "employee", input] as const,
}

export { companyQueryKeys }
