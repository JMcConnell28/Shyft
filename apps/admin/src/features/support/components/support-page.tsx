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
import { useSupportMutations } from "@/features/support/hooks/use-support-mutations"
import { useSupportQuery } from "@/features/support/hooks/use-support-query"
import { formatDateTime } from "@/lib/utils"

function SupportPage() {
  const query = useSupportQuery()
  const { updateStatusMutation } = useSupportMutations()

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-sm text-slate-500">
          Manager and owner support messages from the main app.
        </p>
      </header>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Thread</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Updated</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.threads ?? []).map((thread) => (
            <TableRow key={thread.id}>
              <TableCell>
                <p className="font-medium">{thread.subject}</p>
                <p className="text-xs text-slate-500">
                  {thread.createdByEmail ?? "Unknown user"} · {thread.category}
                </p>
              </TableCell>
              <TableCell>{thread.priority}</TableCell>
              <TableCell>
                <StatusBadge tone={thread.status === "open" ? "warning" : "neutral"}>
                  {thread.status}
                </StatusBadge>
              </TableCell>
              <TableCell>{formatDateTime(thread.updatedAt)}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: thread.id,
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

export { SupportPage }
