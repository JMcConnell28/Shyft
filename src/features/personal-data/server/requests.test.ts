import { beforeEach, expect, it, vi } from "vitest"
import {
  createPersonalDataRequest,
  readReleasedPersonalDataResponse,
} from "@rocketrota/db/privacy"
import {
  releasePrivacyResponse,
  revokePrivacyResponse,
} from "../../../../packages/db/src/privacy/admin-actions"
import { privacyFixture } from "./privacy-fixture"

const { query, release } = vi.hoisted(() => ({
  query: vi.fn(),
  release: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  getDatabase: () => ({
    connect: () => Promise.resolve({ query, release }),
    query,
  }),
}))
const summary = {
  id: privacyFixture.requestId,
  status: "requested",
  requested_at: new Date("2026-10-26"),
  due_at: new Date("2026-11-26"),
  expires_at: null,
  public_message: "Request received",
  revision: 0,
}
beforeEach(() => {
  vi.resetAllMocks()
  query.mockResolvedValue({ rows: [], rowCount: 0 })
})

it("deduplicates concurrent submissions without generating another notification", async () => {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [summary] })
  const result = await createPersonalDataRequest("subject-user")
  expect(result.id).toBe(privacyFixture.requestId)
  expect(
    query.mock.calls.some(([sql]) =>
      String(sql).includes("insert into privacy_private.data_request_events")
    )
  ).toBe(false)
  expect(query).toHaveBeenLastCalledWith("commit")
})
it("creates a request and notification in the same transaction", async () => {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [summary] })
  await createPersonalDataRequest("subject-user")
  expect(
    query.mock.calls.some(([sql]) => String(sql).includes("notify_user"))
  ).toBe(true)
  expect(query).toHaveBeenLastCalledWith("commit")
})
it("cannot download another user's response or an unreleased / expired response", async () => {
  await expect(
    readReleasedPersonalDataResponse(privacyFixture.requestId, "other-user")
  ).rejects.toThrow("unavailable")
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining(
      "user_id = $2 and status = 'ready' and expires_at > now()"
    ),
    [privacyFixture.requestId, "other-user"]
  )
  expect(query).toHaveBeenLastCalledWith("rollback")
  expect(release).toHaveBeenCalled()
})
it("rejects a payload with a mismatched subject even if a row is returned", async () => {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ released_response: privacyFixture }] })
  await expect(
    readReleasedPersonalDataResponse(privacyFixture.requestId, "other-user")
  ).rejects.toThrow("does not belong")
  expect(query).toHaveBeenLastCalledWith("rollback")
})
it("rolls back release while draft explanations still need review", async () => {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [{ user_id: "subject-user", revision: 2, status: "in_review" }],
    })
    .mockResolvedValueOnce({
      rows: [
        {
          draft: {
            ...privacyFixture,
            summary: "REVIEW REQUIRED: explain the response",
          },
        },
      ],
    })
  await expect(
    releasePrivacyResponse(
      {
        id: privacyFixture.requestId,
        revision: 2,
        identityChecked: true,
        workplaceAuthorityChecked: true,
        thirdPartyDataReviewed: true,
        externalSourcesChecked: true,
      },
      "admin"
    )
  ).rejects.toThrow("review explanations")
  expect(query).toHaveBeenLastCalledWith("rollback")
})
it("rejects stale admin edits before disclosure", async () => {
  query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
    rows: [{ user_id: "subject-user", revision: 3, status: "in_review" }],
  })
  await expect(
    releasePrivacyResponse(
      {
        id: privacyFixture.requestId,
        revision: 2,
        identityChecked: true,
        workplaceAuthorityChecked: true,
        thirdPartyDataReviewed: true,
        externalSourcesChecked: true,
      },
      "admin"
    )
  ).rejects.toThrow("changed")
  expect(query).toHaveBeenLastCalledWith("rollback")
})
it("revokes a released response without claiming the user's pending-request slot", async () => {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [], rowCount: 1 })
  await revokePrivacyResponse(privacyFixture.requestId, 3, "admin")
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining("status = 'expired', released_response = null"),
    [privacyFixture.requestId, 3]
  )
  expect(query).toHaveBeenLastCalledWith("commit")
})
