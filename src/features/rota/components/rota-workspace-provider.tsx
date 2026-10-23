"use client"

import * as React from "react"

import type {
  WorkspaceBoardData,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"
import { useRotaWorkspaceState } from "@/features/rota/hooks/use-rota-workspace-state"

const RotaWorkspaceContext = React.createContext<ReturnType<
  typeof useRotaWorkspaceState
> | null>(null)

function RotaWorkspaceProvider({
  children,
  boardData,
  mode,
  demoEmployees,
}: {
  children: React.ReactNode
  boardData: WorkspaceBoardData
  mode?: "default" | "demo"
  demoEmployees?: Array<WorkspaceEmployee>
}) {
  const value = useRotaWorkspaceState({
    boardData,
    mode,
    demoEmployees,
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
    throw new Error(
      "useRotaWorkspace must be used within a RotaWorkspaceProvider."
    )
  }

  return context
}

export { RotaWorkspaceProvider, useRotaWorkspace }
