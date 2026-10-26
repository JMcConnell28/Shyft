const privacyQueryKeys = {
  all: ["privacy-requests"] as const,
  list: (page: number) => ["privacy-requests", "list", page] as const,
  detail: (id: string) => ["privacy-requests", "detail", id] as const,
}
export { privacyQueryKeys }
