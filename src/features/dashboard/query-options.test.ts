import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { dashboardWelcomeQueryOptions } from "./query-options"
import { getDashboardWelcome } from "./server-fns"

vi.mock("./server-fns", () => ({ getDashboardWelcome: vi.fn() }))
describe("welcome preferences", () => {
  it("reuses a fresh preference and preserves a successful dismissal", async () => {
    const client = new QueryClient()
    vi.mocked(getDashboardWelcome).mockResolvedValue({ shouldShow: true })
    const options = dashboardWelcomeQueryOptions(
      { type: "organization", id: "org" },
      "user"
    )
    await client.ensureQueryData(options)
    client.setQueryData(options.queryKey, { shouldShow: false })
    expect(await client.ensureQueryData(options)).toEqual({ shouldShow: false })
    expect(getDashboardWelcome).toHaveBeenCalledTimes(1)
    client.clear()
  })
  it("isolates preferences by user, workspace and workspace type", () => {
    const workspace = { type: "organization", id: "org" } as const
    const key = dashboardWelcomeQueryOptions(workspace, "user").queryKey
    expect(key).not.toEqual(
      dashboardWelcomeQueryOptions(workspace, "another-user").queryKey
    )
    expect(key).not.toEqual(
      dashboardWelcomeQueryOptions({ ...workspace, id: "another-org" }, "user")
        .queryKey
    )
    expect(key).not.toEqual(
      dashboardWelcomeQueryOptions({ ...workspace, type: "location" }, "user")
        .queryKey
    )
  })
})
