"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaWorkspaceQueryInput } from "@/features/rota/types/workspace-query"
import { rotaWorkspaceQueryOptions } from "@/features/rota/workspace-query-options"
import { getRotaWorkspaceData } from "@/features/rota/server-fns"

function useRotaWorkspaceQuery(input: RotaWorkspaceQueryInput) {
  const getRotaWorkspaceDataFn = useServerFn(getRotaWorkspaceData)

  return useQuery(rotaWorkspaceQueryOptions(input, getRotaWorkspaceDataFn))
}

export { useRotaWorkspaceQuery }
