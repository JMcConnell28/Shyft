"use client"

import * as React from "react"

import { useRotaWorkspaceState } from "@/features/rota/hooks/use-rota-workspace-state"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"

const RotaWorkspaceContext = React.createContext<
  ReturnType<typeof useRotaWorkspaceState> | null
>(null)

function RotaWorkspaceProvider({
  children,
  boardData,
  mode,
}: {
  children: React.ReactNode
  boardData: WorkspaceBoardData
  mode?: "default" | "demo"
}) {
  const value = useRotaWorkspaceState({
    boardData,
    mode,
  })

  return (
    <RotaWorkspaceContext.Provider value={value}>
      {children}
    </RotaWorkspaceContext.Provider>
  )
}

function useRotaWorkspace() {
  const context = React.useContext(RotaWorkspaceContext)

  if (!context) {
    throw new Error("useRotaWorkspace must be used within a RotaWorkspaceProvider.")
  }

  return context
}

export { RotaWorkspaceProvider, useRotaWorkspace }
