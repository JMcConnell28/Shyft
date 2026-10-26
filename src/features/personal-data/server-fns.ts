import { createServerFn } from "@tanstack/react-start"
import { requestPersonalDataSchema } from "@rocketrota/shared/privacy"

const getPersonalDataRequests = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requirePersonalDataSession } = await import("./server/access")
    const { listPersonalDataRequests, listPersonalDataEvents } =
      await import("@rocketrota/db/privacy")
    const { user } = await requirePersonalDataSession()
    const [requests, events] = await Promise.all([
      listPersonalDataRequests(user.id),
      listPersonalDataEvents(user.id),
    ])
    return { requests, events }
  }
)
const requestPersonalData = createServerFn({ method: "POST" })
  .validator((input: unknown) => requestPersonalDataSchema.parse(input))
  .handler(async () => {
    const { requirePersonalDataSession } = await import("./server/access")
    const { createPersonalDataRequest } = await import("@rocketrota/db/privacy")
    const { user } = await requirePersonalDataSession()
    return createPersonalDataRequest(user.id)
  })
export { getPersonalDataRequests, requestPersonalData }
