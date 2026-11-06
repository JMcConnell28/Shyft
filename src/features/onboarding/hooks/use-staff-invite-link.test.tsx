// @vitest-environment jsdom
import * as React from "react"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useStaffInviteLink } from "./use-staff-invite-link"

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  create: vi.fn(),
  copy: vi.fn(),
}))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }))
vi.mock("@/lib/onboarding", () => ({
  getActiveStaffInviteLink: mocks.get,
  createStaffInviteLink: mocks.create,
}))
vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}))

const initial = {
  locations: [
    { id: "a", name: "Main" },
    { id: "b", name: "Second" },
  ],
  defaults: { defaultStaffGroupId: "group", defaultStaffGroupName: "Employee" },
  activeInvite: {
    locationIds: ["a"],
    joinUrl: "https://example.com/join/old",
    staffGroupName: "Employee",
    defaultStaffGroupId: "group",
    expiresAt: null,
  },
}
const clients: Array<QueryClient> = []
beforeEach(() => {
  vi.resetAllMocks()
  mocks.get.mockResolvedValue(initial)
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: mocks.copy },
  })
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})
function renderInviteHook() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  return renderHook(() => useStaffInviteLink("org"), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
}

it("does not copy the old link after changing locations, and creates a link for the new selection", async () => {
  const { result } = renderInviteHook()
  await waitFor(() =>
    expect(result.current.inviteUrl).toBe(initial.activeInvite.joinUrl)
  )
  act(() => result.current.setSelectedIds(["a", "b"]))
  expect(result.current.inviteUrl).toBeUndefined()
  await act(() => result.current.copyLink())
  expect(mocks.copy).not.toHaveBeenCalled()
  mocks.create.mockResolvedValue({})
  mocks.get.mockResolvedValue({
    ...initial,
    activeInvite: {
      ...initial.activeInvite,
      locationIds: ["a", "b"],
      joinUrl: "https://example.com/join/new",
    },
  })
  act(() => result.current.replaceLink())
  await waitFor(() =>
    expect(result.current.inviteUrl).toBe("https://example.com/join/new")
  )
  expect(mocks.create).toHaveBeenCalledWith({
    data: {
      organizationId: "org",
      locationIds: ["a", "b"],
      defaultStaffGroupId: "group",
    },
  })
})

it("supports an explicit empty selection without automatically creating a link", async () => {
  mocks.get.mockResolvedValue({ ...initial, activeInvite: null })
  const { result } = renderInviteHook()
  await waitFor(() => expect(result.current.defaults).toEqual(initial.defaults))
  expect(mocks.create).not.toHaveBeenCalled()
  mocks.create.mockResolvedValue({})
  mocks.get.mockResolvedValue({
    ...initial,
    activeInvite: { ...initial.activeInvite, locationIds: [] },
  })
  act(() => result.current.replaceLink())
  await waitFor(() =>
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        organizationId: "org",
        locationIds: [],
        defaultStaffGroupId: "group",
      },
    })
  )
})

it("preserves the draft and clears a creation error when options are reloaded", async () => {
  const { result } = renderInviteHook()
  await waitFor(() => expect(result.current.inviteUrl).toBeDefined())
  act(() => result.current.setSelectedIds(["b"]))
  mocks.create.mockRejectedValue(new Error("Server unavailable"))
  act(() => result.current.replaceLink())
  await waitFor(() => expect(result.current.error).toBe("Server unavailable"))
  expect(result.current.selectedIds).toEqual(["b"])
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.error).toBeNull())
  expect(result.current.selectedIds).toEqual(["b"])
  expect(result.current.inviteUrl).toBeUndefined()
})
