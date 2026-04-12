"use client"

import * as React from "react"

import { useRotaWorkspaceState } from "@/features/rota/hooks/use-rota-workspace-state"

const RotaWorkspaceContext = React.createContext<
  ReturnType<typeof useRotaWorkspaceState> | null
>(null)

function RotaWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const value = useRotaWorkspaceState()

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
