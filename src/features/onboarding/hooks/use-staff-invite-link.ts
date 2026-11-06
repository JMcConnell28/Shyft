import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getErrorMessage } from "@/lib/errors"
import {
  createStaffInviteLink,
  getActiveStaffInviteLink,
} from "@/lib/onboarding"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useStaffInviteLink(organizationId: string) {
  const getActiveInvite = useServerFn(getActiveStaffInviteLink)
  const createInvite = useServerFn(createStaffInviteLink)
  const queryClient = useQueryClient()
  const [draftIds, setDraftIds] = useState<Array<string> | null>(null)
  const [copied, setCopied] = useState(false)
  const queryKey = ["sidebar-invite-link", organizationId]
  const inviteQuery = useQuery({
    queryKey,
    queryFn: () => getActiveInvite({ data: { organizationId } }),
  })
  const selectedIds =
    draftIds ?? inviteQuery.data?.activeInvite?.locationIds ?? []
  const active = inviteQuery.data?.activeInvite
  const hasChanges =
    !active ||
    selectedIds.length !== active.locationIds.length ||
    selectedIds.some((id) => !active.locationIds.includes(id))
  const mutation = useMutation({
    mutationFn: async () => {
      const defaultStaffGroupId =
        inviteQuery.data?.defaults?.defaultStaffGroupId
      if (!defaultStaffGroupId)
        throw new Error("Create an Employee staff group before inviting staff.")
      await createInvite({
        data: { organizationId, locationIds: selectedIds, defaultStaffGroupId },
      })
      // Hide the previous link until the new link and its location scope are loaded together.
      return getActiveInvite({ data: { organizationId } })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
      setDraftIds(null)
      setCopied(false)
      showSuccessToast("Invite link ready.")
    },
  })
  const inviteUrl =
    !hasChanges &&
    !mutation.isPending &&
    !mutation.isError &&
    !inviteQuery.isFetching &&
    !inviteQuery.isError
      ? active.joinUrl
      : undefined
  async function copyLink() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      showSuccessToast("Invite link copied.")
    } catch (error) {
      showErrorToast(error, { fallbackMessage: "Could not copy the link." })
    }
  }
  return {
    activeInvite: active,
    locations: inviteQuery.data?.locations ?? [],
    selectedIds,
    setSelectedIds: (ids: Array<string>) => {
      setDraftIds(ids)
      setCopied(false)
    },
    copied,
    copyLink,
    inviteUrl,
    hasChanges,
    defaults: inviteQuery.data?.defaults,
    error:
      inviteQuery.error || mutation.error
        ? getErrorMessage(
            inviteQuery.error ?? mutation.error,
            "Could not prepare the invite link."
          )
        : null,
    isPreparing: inviteQuery.isPending,
    isCreating: mutation.isPending,
    replaceLink: () => mutation.mutate(),
    retry: () => {
      mutation.reset()
      void inviteQuery.refetch()
    },
  }
}

export { useStaffInviteLink }
