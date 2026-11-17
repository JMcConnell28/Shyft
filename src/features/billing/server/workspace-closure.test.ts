import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  cancelSubscriptionAsOwner,
  removeOrganizationAsOwner,
} from "./workspace-closure"

const mocks = vi.hoisted(() => ({
  role: vi.fn(),
  query: vi.fn(),
  assertHeld: vi.fn(),
  cancel: vi.fn(),
  settle: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/auth/server/organization-membership", () => ({
  readOrganizationMembershipRole: mocks.role,
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mocks.query }) }))
vi.mock("@/features/billing/server/workspace-billing-lock", () => ({
  withWorkspaceBillingLock: (
    _organizationId: string,
    operation: (assertHeld: () => void) => Promise<unknown>
  ) => operation(mocks.assertHeld),
}))
vi.mock("@/features/billing/server/workspace-closure-billing", () => ({
  cancelWorkspaceRenewal: mocks.cancel,
  settleWorkspaceBillingForRemoval: mocks.settle,
}))

const removal = {
  organizationId: "org-1",
  userId: "owner-1",
  confirmationName: "Waterfront",
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.role.mockResolvedValue("owner")
  mocks.query
    .mockResolvedValueOnce({ rows: [{}] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ id: "org-1" }] })
})

describe("organisation closure", () => {
  it("checks actual ownership before either billing or removal changes", async () => {
    mocks.role.mockResolvedValue("admin")
    await expect(cancelSubscriptionAsOwner("org-1", "admin-1")).rejects.toThrow(
      "Only the organisation owner"
    )
    await expect(removeOrganizationAsOwner(removal)).rejects.toThrow(
      "Only the organisation owner"
    )
    expect(mocks.cancel).not.toHaveBeenCalled()
    expect(mocks.query).not.toHaveBeenCalled()
  })

  it("checks the typed name before touching billing", async () => {
    mocks.query.mockReset().mockResolvedValue({ rows: [] })
    await expect(removeOrganizationAsOwner(removal)).rejects.toThrow(
      "Enter the current organisation name"
    )
    expect(mocks.settle).not.toHaveBeenCalled()
  })

  it("keeps the organisation when Stripe cannot confirm billing has ended", async () => {
    mocks.settle.mockRejectedValue(new Error("Subscription is still active"))
    await expect(removeOrganizationAsOwner(removal)).rejects.toThrow(
      "still active"
    )
    expect(mocks.query).toHaveBeenCalledTimes(2)
  })

  it("deletes only the confirmed organisation and clears its session selections", async () => {
    await removeOrganizationAsOwner(removal)
    expect(mocks.settle).toHaveBeenCalledWith("org-1", mocks.assertHeld)
    expect(mocks.assertHeld.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.query.mock.invocationCallOrder[2]
    )
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.stringContaining(
        'where session."activeOrganizationId" = removed.id'
      ),
      ["org-1", "owner-1", "Waterfront"]
    )
  })
})
