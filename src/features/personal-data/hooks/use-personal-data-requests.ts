import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getPersonalDataRequests, requestPersonalData } from "../server-fns"
import { personalDataKeys, personalDataQueryOptions } from "../query-options"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function usePersonalDataRequests(userId: string) {
  const client = useQueryClient()
  const readRequests = useServerFn(getPersonalDataRequests)
  const createRequest = useServerFn(requestPersonalData)
  const query = useQuery(personalDataQueryOptions(userId, readRequests))
  const mutation = useMutation({
    mutationFn: () => createRequest({ data: { confirmed: true } }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: personalDataKeys.user(userId),
      })
      showSuccessToast("Your personal data request has been received.")
    },
    onError: (error) =>
      showErrorToast(error, {
        fallbackMessage:
          "We could not submit your request. Try again or contact us.",
      }),
  })
  return { query, mutation }
}
export { usePersonalDataRequests }
