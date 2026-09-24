import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { invalidateNavigationCache } from "@/features/navigation/invalidate-navigation-cache"
import { navigationQueryKeys } from "@/features/navigation/query-keys"

describe("invalidateNavigationCache", () => {
  it("keeps an in-flight route session query alive", async () => {
    const queryClient = new QueryClient()
    let resolveSession: (value: string) => void = () => {}
    const pendingSession = new Promise<string>((resolve) => {
      resolveSession = resolve
    })
    const sessionPromise = queryClient.fetchQuery({
      queryKey: navigationQueryKeys.session,
      queryFn: () => pendingSession,
    })

    await invalidateNavigationCache(queryClient)
    resolveSession("unverified-session")

    await expect(sessionPromise).resolves.toBe("unverified-session")
    expect(queryClient.getQueryData(navigationQueryKeys.session)).toBe(
      "unverified-session"
    )
    queryClient.clear()
  })

  it("rechecks a previously cached session on the next navigation", async () => {
    const queryClient = new QueryClient()
    const getSession = vi.fn().mockResolvedValueOnce("old").mockResolvedValue("new")
    const options = {
      queryKey: navigationQueryKeys.session,
      queryFn: getSession,
      staleTime: Infinity,
    }

    expect(await queryClient.fetchQuery(options)).toBe("old")
    await invalidateNavigationCache(queryClient)
    expect(await queryClient.fetchQuery(options)).toBe("new")
    expect(getSession).toHaveBeenCalledTimes(2)
    queryClient.clear()
  })
})
