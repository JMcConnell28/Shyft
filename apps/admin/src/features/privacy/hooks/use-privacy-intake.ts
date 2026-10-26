import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { useNavigate } from "@tanstack/react-router"
import { recordPrivacyRequest } from "../server-fns"
import { privacyQueryKeys } from "../query-keys"
import type { recordPrivacyRequestSchema } from "@rocketrota/shared/privacy"
import type { z } from "zod"

function usePrivacyIntake() {
  const record = useServerFn(recordPrivacyRequest)
  const client = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (input: z.infer<typeof recordPrivacyRequestSchema>) =>
      record({ data: input }),
    onSuccess: async ({ id }) => {
      await client.invalidateQueries({ queryKey: privacyQueryKeys.all })
      await navigate({ to: "/privacy/$id", params: { id } })
    },
  })
}
export { usePrivacyIntake }
