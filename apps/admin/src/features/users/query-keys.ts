const usersQueryKeys = {
  all: ["users"] as const,
  search: (search: string) => [...usersQueryKeys.all, { search }] as const,
}

export { usersQueryKeys }
