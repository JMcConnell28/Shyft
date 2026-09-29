"use client"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useErrorMutations } from "@/features/errors/hooks/use-error-mutations"
import { useErrorsQuery } from "@/features/errors/hooks/use-errors-query"
import { formatDateTime } from "@/lib/utils"

function ErrorsPage() {
  const query = useErrorsQuery()
  const { updateStatusMutation } = useErrorMutations()

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Errors</h1>
        <p className="text-sm text-slate-500">
          Grouped client and server errors captured by RocketRota.
        </p>
      </header>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Error</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Seen</TableHeaderCell>
            <TableHeaderCell>Last seen</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.errors ?? []).map((error) => (
            <TableRow key={error.id}>
              <TableCell label="Error">
                <p className="font-medium">{error.message}</p>
                <p className="text-xs text-slate-500">{error.routePath}</p>
              </TableCell>
              <TableCell label="Status">
                <StatusBadge
                  tone={error.status === "open" ? "danger" : "neutral"}
                >
                  {error.status}
                </StatusBadge>
              </TableCell>
              <TableCell label="Seen">{error.occurrenceCount}</TableCell>
              <TableCell label="Last seen">
                {formatDateTime(error.lastSeenAt)}
              </TableCell>
              <TableCell label="Action">
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: error.id,
                      status: "resolved",
                    })
                  }
                  variant="secondary"
                >
                  Resolve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { ErrorsPage }
