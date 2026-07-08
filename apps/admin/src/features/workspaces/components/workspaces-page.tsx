"use client"

import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatDateTime } from "@/lib/utils"
import { useWorkspacesQuery } from "@/features/workspaces/hooks/use-workspaces-query"

function WorkspacesPage() {
  const query = useWorkspacesQuery()
  const workspaces = query.data?.workspaces ?? []

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
        <p className="text-sm text-slate-500">
          Customer organizations, locations, billing state, and trial coverage.
        </p>
      </header>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Location</TableHeaderCell>
            <TableHeaderCell>Organization</TableHeaderCell>
            <TableHeaderCell>Billing</TableHeaderCell>
            <TableHeaderCell>Employees</TableHeaderCell>
            <TableHeaderCell>Trial ends</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {workspaces.map((workspace) => (
            <TableRow key={workspace.locationId}>
              <TableCell>
                <p className="font-medium">{workspace.locationName}</p>
                <p className="text-xs text-slate-500">{workspace.locationId}</p>
              </TableCell>
              <TableCell>{workspace.organizationName ?? "Standalone"}</TableCell>
              <TableCell>
                <StatusBadge>{workspace.billingStatus ?? "unknown"}</StatusBadge>
              </TableCell>
              <TableCell>{workspace.activeEmployees}</TableCell>
              <TableCell>{formatDateTime(workspace.trialEndsAt)}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { WorkspacesPage }
