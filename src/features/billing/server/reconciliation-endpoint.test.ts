import { beforeEach, describe, expect, it, vi } from "vitest"

import { handleBillingReconciliation } from "./reconciliation-endpoint"

const { secret, reconcile, health } = vi.hoisted(() => ({
  secret: vi.fn(),
  reconcile: vi.fn(),
  health: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/env.server", () => ({ getOptionalEnv: secret }))
vi.mock("./reconciliation", () => ({ reconcileAllBillingAccounts: reconcile }))
vi.mock("@rocketrota/db/billing-reconciliation", () => ({
  getBillingReconciliationHealth: health,
}))
const configuredSecret = "synthetic-reconciliation-secret-32-characters"
function request(token?: string, query = "") {
  return new Request(`https://app.example/api/billing/reconcile${query}`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  secret.mockReturnValue(configuredSecret)
  reconcile.mockResolvedValue({ failedAccountCount: 0, checkedAccountCount: 1 })
  health.mockResolvedValue({ needsAttention: false })
})

describe("reconciliation authorization and operational failures", () => {
  it.each([undefined, "wrong", "short"])(
    "rejects token %j without doing billing work",
    async (token) => {
      expect((await handleBillingReconciliation(request(token))).status).toBe(
        401
      )
      expect(reconcile).not.toHaveBeenCalled()
      expect(health).not.toHaveBeenCalled()
    }
  )
  it.each([
    undefined,
    "",
    "replace-with-a-long-random-reconciliation-secret",
    "short",
  ])(
    "fails closed with controlled status when configuration is %j",
    async (value) => {
      secret.mockReturnValue(value)
      expect((await handleBillingReconciliation(request())).status).toBe(401)
      expect(
        (await handleBillingReconciliation(request(configuredSecret))).status
      ).toBe(503)
      expect(reconcile).not.toHaveBeenCalled()
    }
  )
  it("provides an authorized read-only dry run without Stripe mutations", async () => {
    const response = await handleBillingReconciliation(
      request(configuredSecret, "?dryRun=1")
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      dryRun: true,
      health: { needsAttention: false },
    })
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(health).toHaveBeenCalledOnce()
    expect(reconcile).not.toHaveBeenCalled()
  })
  it("runs an authorized scheduled job and reports account failures as unsuccessful", async () => {
    expect(
      (await handleBillingReconciliation(request(configuredSecret))).status
    ).toBe(200)
    reconcile.mockResolvedValueOnce({ failedAccountCount: 1 })
    expect(
      (await handleBillingReconciliation(request(configuredSecret))).status
    ).toBe(503)
    expect(
      (
        await handleBillingReconciliation(
          request(configuredSecret, "?dryRun=invalid")
        )
      ).status
    ).toBe(400)
  })
  it("does not expose internal exceptions to the caller", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    reconcile.mockRejectedValueOnce(new Error("private database detail"))
    const response = await handleBillingReconciliation(
      request(configuredSecret)
    )
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain("private database")
    vi.restoreAllMocks()
  })
})
