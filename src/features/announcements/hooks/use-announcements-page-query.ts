"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type {
  AnnouncementPageData,
  AnnouncementScopeInput,
} from "@/features/announcements/types"
import { announcementQueryKeys } from "@/features/announcements/query-keys"
import { getAnnouncementsPageData } from "@/features/announcements/server-fns"

function useAnnouncementsPageQuery(
  input: AnnouncementScopeInput,
  initialData?: AnnouncementPageData
) {
  const getAnnouncementsPageDataFn = useServerFn(getAnnouncementsPageData)

  return useQuery({
    queryKey: announcementQueryKeys.page(input),
    queryFn: () => getAnnouncementsPageDataFn({ data: input }),
    initialData,
  })
}

export { useAnnouncementsPageQuery }
