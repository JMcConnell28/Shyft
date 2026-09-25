import * as React from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { getErrorMessage } from "@/lib/errors"
import {
  createStaffInviteLink,
  ensureActiveStaffInviteLink,
  getActiveStaffInviteLink,
} from "@/lib/onboarding"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type InviteSelection = {
  locationId: string
  defaultStaffGroupId: string
  mode: "automatic" | "replace"
}

function useStaffInviteLink(scopeId: string) {
  const getActiveInvite = useServerFn(getActiveStaffInviteLink)
  const createInvite = useServerFn(createStaffInviteLink)
  const ensureInvite = useServerFn(ensureActiveStaffInviteLink)
  const [createdUrl, setCreatedUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const autoCreateAttempted = React.useRef(false)

  const inviteQuery = useQuery({
    queryKey: ["sidebar-invite-link", scopeId],
    queryFn: () => getActiveInvite(),
  })
  const createMutation = useMutation({
    mutationFn: ({ locationId, defaultStaffGroupId, mode }: InviteSelection) =>
      mode === "automatic"
        ? ensureInvite({ data: { locationId, defaultStaffGroupId } })
        : createInvite({ data: { locationId, defaultStaffGroupId } }),
    onSuccess: (result, selection) => {
      setCreatedUrl(result.joinUrl)
      void inviteQuery.refetch()
      if (selection.mode === "replace") {
        showSuccessToast("New invite link ready.")
      }
    },
    onError: (error, selection) => {
      if (selection.mode === "replace") {
        showErrorToast(error, {
          fallbackMessage: "Could not create a new link.",
        })
      }
    },
  })

  const defaults = inviteQuery.data?.defaults
  React.useEffect(() => {
    if (
      !inviteQuery.isSuccess ||
      inviteQuery.isFetching ||
      inviteQuery.data.activeInvite ||
      !defaults ||
      autoCreateAttempted.current
    ) {
      return
    }

    autoCreateAttempted.current = true
    createMutation.mutate({
      locationId: defaults.locationId,
      defaultStaffGroupId: defaults.defaultStaffGroupId,
      mode: "automatic",
    })
  }, [
    inviteQuery.isSuccess,
    inviteQuery.isFetching,
    inviteQuery.data,
    defaults,
    createMutation.mutate,
  ])

  const activeInvite =
    createdUrl && createdUrl !== inviteQuery.data?.activeInvite?.joinUrl
      ? null
      : inviteQuery.data?.activeInvite
  const inviteUrl =
    createdUrl ?? (inviteQuery.isFetching ? null : activeInvite?.joinUrl)
  const isPreparing =
    !inviteUrl &&
    (inviteQuery.isPending ||
      inviteQuery.isFetching ||
      createMutation.isPending ||
      (inviteQuery.isSuccess && Boolean(defaults) && !createMutation.isError))
  const error = inviteQuery.isError
    ? getErrorMessage(inviteQuery.error, "Could not load the invite link.")
    : createMutation.isError
      ? getErrorMessage(
          createMutation.error,
          "Could not create the invite link."
        )
      : null

  async function copyLink() {
    if (!inviteUrl) return

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      showSuccessToast("Invite link copied.")
      window.setTimeout(() => setCopied(false), 1800)
    } catch (copyError) {
      showErrorToast(copyError, { fallbackMessage: "Could not copy the link." })
    }
  }

  function replaceLink() {
    if (!defaults) return
    createMutation.mutate({
      locationId: defaults.locationId,
      defaultStaffGroupId: defaults.defaultStaffGroupId,
      mode: "replace",
    })
  }

  function retry() {
    if (inviteQuery.isError) {
      void inviteQuery.refetch()
      return
    }

    if (!defaults) return
    createMutation.mutate({
      locationId: defaults.locationId,
      defaultStaffGroupId: defaults.defaultStaffGroupId,
      mode: "automatic",
    })
  }

  return {
    activeInvite,
    copied,
    copyLink,
    defaults,
    error,
    inviteUrl,
    isCreating: createMutation.isPending,
    isPreparing,
    replaceLink,
    retry,
  }
}

export { useStaffInviteLink }
