import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { removeOrganization } from "@/features/billing/server/workspace-closure-server-fns"

function useRemoveOrganization(organizationId: string) {
  const remove = useServerFn(removeOrganization)

  return useMutation({
    mutationFn: (confirmationName: string) =>
      remove({ data: { organizationId, confirmationName } }),
    onSuccess: () => window.location.replace("/dashboard"),
  })
}

export { useRemoveOrganization }
