// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react"
import { RouterProvider } from "@tanstack/react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"
import { deferred, setup } from "@/features/navigation/test/workspace-navigation-fixture"

// Match the existing DOM-test setup: Vite SSR and react-dom share one React copy.
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("workspace navigation feedback", () => {
  it("selects the destination immediately and swaps its breadcrumb together with pending content", async () => {
    vi.useFakeTimers()
    const loading = deferred()
    const { router, mountCount } = setup(() => loading.promise)
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    await act(async () => {
      void router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(screen.getByTestId("selection").textContent).toContain("timesheets")
    expect(screen.getByTestId("breadcrumb").textContent).toContain("rota")
    expect(
      screen.getByRole("button", { name: "Save current rota" })
    ).toBeTruthy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })
    expect(
      screen.queryByRole("button", { name: "Save current rota" })
    ).toBeNull()
    expect(screen.getByTestId("breadcrumb").textContent).toContain("timesheets")
    expect(
      screen.getByRole("status", { name: "Loading Timesheets" })
    ).toBeTruthy()
    await act(async () => {
      loading.resolve()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(
      screen.getByRole("heading", { name: "Team timesheets" })
    ).toBeTruthy()
    expect(screen.queryByRole("status")).toBeNull()
    expect(mountCount()).toBe(1)
  })

  it("does not flash a skeleton for a cached or near-instant destination", async () => {
    const { router } = setup(() => Promise.resolve())
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      await router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
    })
    expect(
      screen.getByRole("heading", { name: "Team timesheets" })
    ).toBeTruthy()
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("keeps an unsaved editor selected and mounted when navigation is blocked", async () => {
    const loader = vi.fn(() => Promise.resolve())
    const { router } = setup(loader, true)
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      await router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
    })
    expect(router.state.location.pathname).toBe("/app/team/rota")
    expect(
      screen.getByRole("button", { name: "Save current rota" })
    ).toBeTruthy()
    expect(loader).not.toHaveBeenCalled()
  })

  it("keeps the shell and offers a retry after a failed loader", async () => {
    const loader = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValue(undefined)
    const { router } = setup(loader)
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      await router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
    })
    expect(screen.getByRole("alert")).toBeTruthy()
    expect(
      screen.queryByRole("button", { name: "Save current rota" })
    ).toBeNull()
    act(() => {
      screen.getByRole("button", { name: "Try again" }).click()
    })
    expect(
      await screen.findByRole("heading", { name: "Team timesheets" })
    ).toBeTruthy()
    expect(screen.getByTestId("selection")).toBeTruthy()
  })

  it("preserves the shell while a shared authentication boundary revalidates", async () => {
    vi.useFakeTimers()
    const loading = deferred()
    let firstLoad = true
    const { router, mountCount } = setup(
      () => Promise.resolve(),
      false,
      () => {
        if (!firstLoad) return loading.promise
        firstLoad = false
        return undefined
      }
    )
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      void router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
      await vi.advanceTimersByTimeAsync(160)
    })
    expect(screen.getByTestId("selection").textContent).toContain("timesheets")
    expect(
      screen.getByRole("status", { name: "Loading Timesheets" })
    ).toBeTruthy()
    expect(
      screen.queryByRole("button", { name: "Save current rota" })
    ).toBeNull()
    await act(async () => {
      loading.resolve()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mountCount()).toBe(1)
  })

  it("does not replace a newer destination when an older load finishes", async () => {
    vi.useFakeTimers()
    const loading = deferred()
    const { router } = setup(() => loading.promise)
    await router.load()
    render(<RouterProvider router={router} />)
    await act(async () => {
      void router.navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug: "team" },
      })
      await vi.advanceTimersByTimeAsync(160)
    })
    await act(async () => {
      await router.navigate({
        to: "/app/$workspaceSlug/rota",
        params: { workspaceSlug: "team" },
        search: { status: "all", range: "all", page: 1, pageSize: 20 },
      })
    })
    await act(async () => {
      loading.resolve()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(
      screen.getByRole("button", { name: "Save current rota" })
    ).toBeTruthy()
    expect(screen.getByTestId("breadcrumb").textContent).toContain("rota")
    expect(
      screen.queryByRole("heading", { name: "Team timesheets" })
    ).toBeNull()
  })
})
