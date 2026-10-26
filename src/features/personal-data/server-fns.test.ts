import { beforeEach, expect, it, vi } from "vitest"
import { getPersonalDataRequests, requestPersonalData } from "./server-fns"

const { access, list, events, create } = vi.hoisted(() => ({
  access: vi.fn(),
  list: vi.fn(),
  events: vi.fn(),
  create: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validate = (value: unknown): unknown => value
    return {
      validator(parser: (value: unknown) => unknown) {
        validate = parser
        return this
      },
      handler(handler: (context: { data: unknown }) => unknown) {
        return (options?: { data: unknown }) =>
          handler({ data: validate(options?.data) })
      },
    }
  },
}))
vi.mock("./server/access", () => ({ requirePersonalDataSession: access }))
vi.mock("@rocketrota/db/privacy", () => ({
  listPersonalDataRequests: list,
  listPersonalDataEvents: events,
  createPersonalDataRequest: create,
}))
beforeEach(() => {
  vi.resetAllMocks()
  access.mockResolvedValue({ user: { id: "verified-subject" } })
  list.mockResolvedValue([])
  events.mockResolvedValue([])
})

it("derives request ownership from the verified session", async () => {
  await requestPersonalData({ data: { confirmed: true } })
  expect(create).toHaveBeenCalledWith("verified-subject")
})
it("lists only the signed-in subject's requests and public events", async () => {
  await getPersonalDataRequests()
  expect(list).toHaveBeenCalledWith("verified-subject")
  expect(events).toHaveBeenCalledWith("verified-subject")
})
it("blocks all record access when session verification fails", async () => {
  access.mockRejectedValue(new Error("Sign in"))
  await expect(getPersonalDataRequests()).rejects.toThrow("Sign in")
  await expect(
    requestPersonalData({ data: { confirmed: true } })
  ).rejects.toThrow("Sign in")
  expect(create).not.toHaveBeenCalled()
  expect(list).not.toHaveBeenCalled()
})
