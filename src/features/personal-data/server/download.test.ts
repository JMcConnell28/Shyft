import { beforeEach, expect, it, vi } from "vitest"
import { downloadPersonalData } from "./download"
import { privacyFixture } from "./privacy-fixture"

const { session, read } = vi.hoisted(() => ({
  session: vi.fn(),
  read: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./access", () => ({ requirePersonalDataSession: session }))
vi.mock("@rocketrota/db/privacy", () => ({
  readReleasedPersonalDataResponse: read,
}))
beforeEach(() => {
  vi.resetAllMocks()
  session.mockResolvedValue({ user: { id: "subject-user" } })
  read.mockResolvedValue(privacyFixture)
})

it("serves an authenticated attachment with no caching", async () => {
  const response = await downloadPersonalData(
    new Request("https://app.test/api/personal-data/id?format=json"),
    privacyFixture.requestId
  )
  expect(read).toHaveBeenCalledWith(privacyFixture.requestId, "subject-user")
  expect(response.status).toBe(200)
  expect(response.headers.get("cache-control")).toContain("no-store")
  expect(response.headers.get("content-disposition")).toContain("attachment")
  expect(await response.json()).toEqual(privacyFixture)
})
it("does not reveal the existence of a response to an unauthenticated requester", async () => {
  session.mockRejectedValue(new Error("Sign in"))
  const response = await downloadPersonalData(
    new Request("https://app.test/api/personal-data/id"),
    privacyFixture.requestId
  )
  expect(response.status).toBe(404)
  expect(read).not.toHaveBeenCalled()
  expect(response.headers.get("cache-control")).toContain("no-store")
})
it("rejects malformed identifiers and formats before reading data", async () => {
  const response = await downloadPersonalData(
    new Request("https://app.test/api/personal-data/id?format=js"),
    "invalid"
  )
  expect(response.status).toBe(400)
  expect(read).not.toHaveBeenCalled()
})
