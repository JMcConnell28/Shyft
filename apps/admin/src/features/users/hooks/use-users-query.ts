"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { usersQueryKeys } from "@/features/users/query-keys"
import { getUsers } from "@/features/users/server-fns"

function useUsersQuery(search: string) {
  const getUsersFn = useServerFn(getUsers)

  return useQuery({
    queryKey: usersQueryKeys.search(search),
    queryFn: () => getUsersFn({ data: { search } }),
  })
}

export { useUsersQuery }
