"use client"

import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { useEventsQuery } from "@/features/events/hooks/use-events-query"
import { formatDateTime } from "@/lib/utils"

function EventsPage() {
  const query = useEventsQuery()

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-slate-500">
          Major product actions captured from the app.
        </p>
      </header>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Event</TableHeaderCell>
            <TableHeaderCell>Target</TableHeaderCell>
            <TableHeaderCell>Actor</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.events ?? []).map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.eventType}</TableCell>
              <TableCell>
                {event.targetType ?? "workspace"} {event.targetId ?? ""}
              </TableCell>
              <TableCell>{event.actorUserId ?? "system"}</TableCell>
              <TableCell>{formatDateTime(event.createdAt)}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { EventsPage }
