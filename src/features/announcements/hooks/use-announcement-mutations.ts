"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import type {
  AnnouncementFormInput,
  AnnouncementScopeInput,
} from "@/features/announcements/types"
import { announcementQueryKeys } from "@/features/announcements/query-keys"
import {
  archiveAnnouncement,
  createAnnouncement,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  updateAnnouncement,
  voteAnnouncementPoll,
} from "@/features/announcements/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useAnnouncementMutations(scope: AnnouncementScopeInput) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const archiveAnnouncementFn = useServerFn(archiveAnnouncement)
  const createAnnouncementFn = useServerFn(createAnnouncement)
  const markAllAnnouncementsReadFn = useServerFn(markAllAnnouncementsRead)
  const markAnnouncementReadFn = useServerFn(markAnnouncementRead)
  const updateAnnouncementFn = useServerFn(updateAnnouncement)
  const voteAnnouncementPollFn = useServerFn(voteAnnouncementPoll)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: announcementQueryKeys.all,
    })
    await router.invalidate()
  }

  return {
    archiveMutation: useMutation({
      mutationFn: (announcementId: string) =>
        archiveAnnouncementFn({ data: { ...scope, announcementId } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Announcement archived.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not archive that announcement.",
        })
      },
    }),
    createMutation: useMutation({
      mutationFn: (input: AnnouncementFormInput) =>
        createAnnouncementFn({ data: { ...scope, ...input } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Announcement published.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not publish that announcement.",
        })
      },
    }),
    markAllReadMutation: useMutation({
      mutationFn: () => markAllAnnouncementsReadFn({ data: scope }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Announcements marked as read.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not mark announcements as read.",
        })
      },
    }),
    markReadMutation: useMutation({
      mutationFn: (announcementId: string) =>
        markAnnouncementReadFn({ data: { ...scope, announcementId } }),
      onSuccess: async () => {
        await invalidate()
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not mark that announcement as read.",
        })
      },
    }),
    updateMutation: useMutation({
      mutationFn: (
        input: AnnouncementFormInput & {
          announcementId: string
        }
      ) => updateAnnouncementFn({ data: { ...scope, ...input } }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Announcement updated.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not update that announcement.",
        })
      },
    }),
    voteMutation: useMutation({
      mutationFn: (input: { announcementId: string; optionId: string }) =>
        voteAnnouncementPollFn({ data: { ...scope, ...input } }),
      onSuccess: async () => {
        await invalidate()
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not save your vote.",
        })
      },
    }),
  }
}

export { useAnnouncementMutations }
