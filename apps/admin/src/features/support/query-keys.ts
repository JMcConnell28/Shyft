const supportQueryKeys = {
  all: ["support"] as const,
  lists: ["support", "list"] as const,
  list: (page: number) => ["support", "list", page] as const,
  unread: ["support", "unread"] as const,
  detail: (id: string) => ["support", "detail", id] as const,
}

export { supportQueryKeys }
