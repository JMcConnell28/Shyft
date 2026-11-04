import { beforeEach, describe, expect, it, vi } from "vitest"
import { roleHasAdminPermission } from "@rocketrota/shared/admin"

import { reviewPaymentRisk } from "./payment-risks"

const { query, release, audit } = vi.hoisted(() => ({
  query: vi.fn(),
  release: vi.fn(),
  audit: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  queryMany: vi.fn(),
  getDatabase: () => ({ connect: () => Promise.resolve({ query, release }) }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))
beforeEach(() => {
  vi.resetAllMocks()
  query.mockImplementation((sql: string) =>
    Promise.resolve({
      rows: sql.startsWith("select") ? [{ reviewed_at: null }] : [],
    })
  )
  audit.mockResolvedValue(undefined)
})

describe("payment risk operator decisions", () => {
  it("allows financial reviewers and denies support or readonly operators", () => {
    expect(roleHasAdminPermission("owner", "billing.risks.review")).toBe(true)
    expect(roleHasAdminPermission("developer", "billing.risks.review")).toBe(
      true
    )
    expect(roleHasAdminPermission("support", "billing.risks.review")).toBe(
      false
    )
    expect(roleHasAdminPermission("readonly", "billing.risks.review")).toBe(
      false
    )
  })
  it("commits the review decision and audit together", async () => {
    await reviewPaymentRisk(
      {
        riskId: "00000000-0000-4000-8000-000000000001",
        reason: "Reviewed with Stripe; no ongoing risk.",
      },
      "operator"
    )
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: "operator",
        permission: "billing.risks.review",
      }),
      expect.objectContaining({ query })
    )
    expect(query).toHaveBeenLastCalledWith("commit")
    expect(release).toHaveBeenCalledOnce()
  })
  it("rolls back the decision if audit persistence fails", async () => {
    audit.mockRejectedValueOnce(new Error("Audit unavailable"))
    await expect(
      reviewPaymentRisk(
        {
          riskId: "00000000-0000-4000-8000-000000000001",
          reason: "Reviewed with Stripe.",
        },
        "operator"
      )
    ).rejects.toThrow("Audit unavailable")
    expect(query).toHaveBeenLastCalledWith("rollback")
  })
})
