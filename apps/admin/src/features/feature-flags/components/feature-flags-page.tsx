"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useFeatureFlagMutations } from "@/features/feature-flags/hooks/use-feature-flag-mutations"
import { useFeatureFlagsQuery } from "@/features/feature-flags/hooks/use-feature-flags-query"
import { formatDateTime } from "@/lib/utils"

function FeatureFlagsPage() {
  const query = useFeatureFlagsQuery()
  const { createMutation, updateMutation } = useFeatureFlagMutations()
  const [name, setName] = React.useState("")
  const [key, setKey] = React.useState("")

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Feature flags
        </h1>
        <p className="text-sm text-slate-500">
          Roll out product capabilities globally or to selected workspaces.
        </p>
      </header>
      <form
        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault()
          createMutation.mutate({
            defaultValue: false,
            key,
            name,
          })
          setName("")
          setKey("")
        }}
      >
        <label className="space-y-1 text-sm font-medium">
          <span>Name</span>
          <input
            className="h-9 w-full rounded-md border border-slate-200 px-3"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Key</span>
          <input
            className="h-9 w-full rounded-md border border-slate-200 px-3 font-mono text-sm"
            onChange={(event) => setKey(event.target.value)}
            placeholder="rota.new_toolbar"
            value={key}
          />
        </label>
        <Button className="self-end" disabled={!name || !key}>
          Create flag
        </Button>
      </form>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Flag</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Targets</TableHeaderCell>
            <TableHeaderCell>Updated</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.flags ?? []).map((flag) => (
            <TableRow key={flag.id}>
              <TableCell>
                <p className="font-medium">{flag.name}</p>
                <p className="font-mono text-xs text-slate-500">{flag.key}</p>
              </TableCell>
              <TableCell>
                <StatusBadge tone={flag.isEnabled ? "good" : "neutral"}>
                  {flag.isEnabled ? "enabled" : "disabled"}
                </StatusBadge>
              </TableCell>
              <TableCell>{flag.targets.length}</TableCell>
              <TableCell>{formatDateTime(flag.updatedAt)}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    updateMutation.mutate({
                      id: flag.id,
                      isEnabled: !flag.isEnabled,
                    })
                  }
                  variant="secondary"
                >
                  {flag.isEnabled ? "Disable" : "Enable"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { FeatureFlagsPage }
