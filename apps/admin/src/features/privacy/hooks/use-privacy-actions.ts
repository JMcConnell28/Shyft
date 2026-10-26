import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { personalDataResponseSchema } from "@rocketrota/shared/privacy"
import {
  preparePrivacyRequest,
  releasePrivacyRequest,
  revokePrivacyRequest,
  savePrivacyRequestDraft,
  updatePrivacyRequestStatus,
} from "../server-fns"
import { privacyQueryKeys } from "../query-keys"
import type {
  ReleasePrivacyResponseInput,
  UpdatePrivacyRequestInput,
} from "@rocketrota/shared/privacy"

function usePrivacyActions(id: string, revision: number) {
  const client = useQueryClient()
  const prepareFn = useServerFn(preparePrivacyRequest)
  const saveFn = useServerFn(savePrivacyRequestDraft)
  const updateFn = useServerFn(updatePrivacyRequestStatus)
  const releaseFn = useServerFn(releasePrivacyRequest)
  const revokeFn = useServerFn(revokePrivacyRequest)
  const refresh = () =>
    client.invalidateQueries({ queryKey: privacyQueryKeys.all })
  const prepare = useMutation({
    mutationFn: () => prepareFn({ data: { id, revision } }),
    onSuccess: refresh,
  })
  const save = useMutation({
    mutationFn: (text: string) =>
      saveFn({
        data: {
          id,
          revision,
          response: personalDataResponseSchema.parse(JSON.parse(text)),
        },
      }),
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: (data: Omit<UpdatePrivacyRequestInput, "id" | "revision">) =>
      updateFn({ data: { ...data, id, revision } }),
    onSuccess: refresh,
  })
  const release = useMutation({
    mutationFn: (data: Omit<ReleasePrivacyResponseInput, "id" | "revision">) =>
      releaseFn({ data: { ...data, id, revision } }),
    onSuccess: refresh,
  })
  const revoke = useMutation({
    mutationFn: () => revokeFn({ data: { id, revision } }),
    onSuccess: refresh,
  })
  return { prepare, save, update, release, revoke }
}
export { usePrivacyActions }
