"use client"

import { Link } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { getSupportCategoryLabel } from "@/features/support/constants"
import { useSupportQuery } from "@/features/support/hooks/use-support-query"
import { formatDateTime } from "@/lib/utils"

function SupportPage() {
  const [page, setPage] = useState(0)
  const query = useSupportQuery(page)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-sm text-slate-500">
          Customer questions, issues, and suggestions.
        </p>
      </header>
      <DataTable className="overflow-x-auto">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Thread</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Workplace</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Updated</TableHeaderCell>
            <TableHeaderCell>Conversation</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.threads ?? []).map((thread) => (
            <TableRow key={thread.id}>
              <TableCell>
                <p className="flex items-center gap-2 font-medium">
                  {thread.unread ? (
                    <span
                      className="size-2 rounded-full bg-blue-600"
                      aria-label="Unread"
                    />
                  ) : null}
                  {thread.subject}
                </p>
                <p className="text-xs text-slate-500">
                  {getSupportCategoryLabel(thread.category)}
                </p>
              </TableCell>
              <TableCell>{thread.customerName ?? "Unknown customer"}</TableCell>
              <TableCell>
                <p className="font-medium">
                  {thread.organizationName ?? "Unknown organisation"}
                </p>
                <p className="text-xs text-slate-500">
                  {thread.locationName ?? "All locations"}
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={thread.status === "open" ? "warning" : "neutral"}
                >
                  {thread.status}
                </StatusBadge>
              </TableCell>
              <TableCell>{formatDateTime(thread.updatedAt)}</TableCell>
              <TableCell>
                <Link
                  to="/support/$threadId"
                  params={{ threadId: thread.id }}
                  className="font-medium text-blue-700 hover:underline"
                >
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
      {query.isPending ? (
        <p className="text-sm text-slate-500">Loading support requests…</p>
      ) : null}
      {query.isError ? (
        <p role="alert" className="text-sm text-red-700">
          We could not load support requests.
        </p>
      ) : null}
      {query.data?.threads.length === 0 ? (
        <p className="text-sm text-slate-500">
          {page === 0
            ? "No support requests yet."
            : "No more support requests."}
        </p>
      ) : null}
      {query.data ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={page === 0 || query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500">Page {page + 1}</span>
          <Button
            variant="secondary"
            disabled={!query.data.hasMore || query.isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export { SupportPage }
