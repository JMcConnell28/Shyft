"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { featureFlagsQueryKeys } from "@/features/feature-flags/query-keys"
import { getFeatureFlags } from "@/features/feature-flags/server-fns"

function useFeatureFlagsQuery() {
  const getFeatureFlagsFn = useServerFn(getFeatureFlags)

  return useQuery({
    queryKey: featureFlagsQueryKeys.all,
    queryFn: () => getFeatureFlagsFn(),
  })
}

export { useFeatureFlagsQuery }
