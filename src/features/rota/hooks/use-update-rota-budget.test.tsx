// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useUpdateRotaBudget } from "./use-update-rota-budget"
import type * as React from "react"

import { standaloneDemoBoard } from "@/features/rota-demo/data/standalone-demo-board"
import {
  RotaWorkspaceProvider,
  useRotaWorkspace,
} from "@/features/rota/components/rota-workspace-provider"

const { updateBudget } = vi.hoisted(() => ({
  updateBudget: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => updateBudget }))
vi.mock("@/features/rota/server-fns", () => ({ updateRotaBudget: vi.fn() }))
vi.mock("@/features/rota/hooks/use-touch-input", () => ({
  useTouchInput: () => false,
}))
vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderBudgetEditor(mode: "demo" | "default") {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return renderHook(
    () => ({ editor: useUpdateRotaBudget(), workspace: useRotaWorkspace() }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          <RotaWorkspaceProvider boardData={standaloneDemoBoard} mode={mode}>
            {children}
          </RotaWorkspaceProvider>
        </QueryClientProvider>
      ),
    }
  )
}

describe("rota budget persistence boundary", () => {
  it("updates demo budget entirely locally without calling the server", async () => {
    const { result } = renderBudgetEditor("demo")
    await act(async () => {
      await result.current.editor.saveBudget(180000)
    })
    expect(result.current.workspace.meta.budgetPence).toBe(180000)
    expect(updateBudget).not.toHaveBeenCalled()
  })

  it("continues to persist real workspace budgets", async () => {
    const { result } = renderBudgetEditor("default")
    await act(async () => {
      await result.current.editor.saveBudget(180000)
    })
    expect(updateBudget).toHaveBeenCalledWith({
      data: { rotaId: standaloneDemoBoard.meta.rotaId, budgetPence: 180000 },
    })
  })
})
