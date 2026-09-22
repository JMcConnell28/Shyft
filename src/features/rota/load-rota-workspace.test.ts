import { QueryClient, QueryObserver } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"
import { loadRotaWorkspace } from "@/features/rota/load-rota-workspace"
import { getRotaWorkspaceData } from "@/features/rota/server-fns"
import {
  getRotaWorkspaceQueryInput,
  rotaWorkspaceQueryOptions,
} from "@/features/rota/workspace-query-options"

vi.mock("@/features/rota/server-fns", () => ({ getRotaWorkspaceData: vi.fn() }))

const input = {
  workspace: {
    id: "location-a",
    slug: "cafe",
    name: "Cafe",
    type: "location",
    organizationId: null,
  },
  workspaceType: "location",
  userId: "user-a",
  rotaId: "rota-a",
  publishedOnly: false,
} as const

const board: WorkspaceBoardData = {
  meta: {
    rotaId: input.rotaId,
    status: "draft",
    canManage: true,
    canEdit: true,
    organizationId: null,
    userId: input.userId,
    workspaceType: "location",
    note: null,
    weekStart: "2026-09-21",
    weekEnd: "2026-09-27",
    weekLabel: "21–27 September",
    publishedVersion: 0,
    hasUnpublishedChanges: false,
    publishedSnapshotAvailable: false,
    budgetPence: null,
    settings: DEFAULT_ROTA_SETTINGS,
  },
  location: {
    id: "location-a",
    name: "Cafe",
    closeTimeByDayId: {},
    closeTimeNextDayByDayId: {},
    estimatedCloseTime: "23:00",
    estimatedCloseTimeNextDay: false,
  },
  days: [],
  zones: [],
  employeeGroups: [],
  employees: [],
  shifts: [],
  assignments: [],
  templates: [],
}

describe("rota route loading", () => {
  let client: QueryClient
  beforeEach(() => {
    vi.clearAllMocks()
    client = new QueryClient()
    vi.mocked(getRotaWorkspaceData).mockResolvedValue(board)
  })
  afterEach(() => {
    client.clear()
  })

  it("deduplicates a preload and navigation, then serves the mounted page from cache", async () => {
    let resolveRequest!: (data: WorkspaceBoardData) => void
    vi.mocked(getRotaWorkspaceData).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )
    const preload = loadRotaWorkspace(client, input)
    const navigation = loadRotaWorkspace(client, input)
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(1)
    resolveRequest(board)
    await Promise.all([preload, navigation])
    const observer = new QueryObserver(
      client,
      rotaWorkspaceQueryOptions(getRotaWorkspaceQueryInput(input))
    )
    const unsubscribe = observer.subscribe(() => {})
    expect(observer.getCurrentResult().data).toEqual(board)
    expect(observer.getCurrentResult().isFetching).toBe(false)
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it("does not refresh stale data during a preload while an editor is mounted", async () => {
    await loadRotaWorkspace(client, input)
    const options = rotaWorkspaceQueryOptions(getRotaWorkspaceQueryInput(input))
    const observer = new QueryObserver(client, options)
    const unsubscribe = observer.subscribe(() => {})
    client.setQueryData(options.queryKey, board, {
      updatedAt: Date.now() - 60_000,
    })
    await loadRotaWorkspace(client, input)
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(1)
    expect(observer.getCurrentResult().data).toEqual(board)
    unsubscribe()
  })

  it("keeps published, working, user, location and week caches separate", async () => {
    await loadRotaWorkspace(client, input)
    await loadRotaWorkspace(client, { ...input, publishedOnly: true })
    await loadRotaWorkspace(client, { ...input, userId: "user-b" })
    await loadRotaWorkspace(client, { ...input, rotaId: "rota-b" })
    await loadRotaWorkspace(client, {
      ...input,
      workspace: { ...input.workspace, id: "location-b" },
    })
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(5)
  })

  it("passes organisation scope and the selected location to the server", async () => {
    await loadRotaWorkspace(client, {
      ...input,
      workspaceType: "organization",
      locationSlug: "cafe",
      workspace: {
        ...input.workspace,
        type: "organization",
        id: "org-a",
        slug: "company",
      },
    })
    expect(getRotaWorkspaceData).toHaveBeenCalledWith({
      data: {
        organizationId: "org-a",
        orgSlug: "company",
        locationId: undefined,
        locationSlug: "cafe",
        userId: input.userId,
        rotaId: input.rotaId,
        publishedOnly: false,
      },
    })
  })

  it("rejects a mismatched workspace before requesting data", async () => {
    await expect(
      loadRotaWorkspace(client, { ...input, workspaceType: "organization" })
    ).rejects.toThrow("organization workspace")
    expect(getRotaWorkspaceData).not.toHaveBeenCalled()
  })

  it("surfaces failures promptly and allows the route to retry", async () => {
    vi.mocked(getRotaWorkspaceData).mockRejectedValueOnce(
      new Error("Unavailable")
    )
    await expect(loadRotaWorkspace(client, input)).rejects.toThrow(
      "Unavailable"
    )
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(1)
    await loadRotaWorkspace(client, input)
    expect(getRotaWorkspaceData).toHaveBeenCalledTimes(2)
  })

  it("does not share query data across server requests", async () => {
    const otherRequest = new QueryClient()
    try {
      await loadRotaWorkspace(client, input)
      await loadRotaWorkspace(otherRequest, input)
      expect(getRotaWorkspaceData).toHaveBeenCalledTimes(2)
    } finally {
      otherRequest.clear()
    }
  })
})
