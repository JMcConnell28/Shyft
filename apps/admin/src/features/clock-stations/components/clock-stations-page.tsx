"use client"

import * as React from "react"
import { CopyIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useClockStationMutations } from "@/features/clock-stations/hooks/use-clock-station-mutations"
import { useClockStationsQuery } from "@/features/clock-stations/hooks/use-clock-stations-query"

const piccPlaceholder = "00000000000000000000000000000000"
const cmacPlaceholder = "0000000000000000"

function ClockStationsPage() {
  const [locationId, setLocationId] = React.useState("")
  const [origin, setOrigin] = React.useState("")
  const query = useClockStationsQuery()
  const { generateTagMutation } = useClockStationMutations()
  const data = query.data

  React.useEffect(() => {
    setOrigin(window.location.origin.replace("admin.", "app."))
  }, [])

  React.useEffect(() => {
    setLocationId((current) => current || data?.locations[0]?.id || "")
  }, [data?.locations])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Clock stations
        </h1>
        <p className="text-sm text-slate-500">
          Generate NTAG setup data and monitor deployed station tags.
        </p>
      </header>
      <section className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="flex-1 space-y-1 text-sm font-medium">
          <span>Location</span>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3"
            onChange={(event) => setLocationId(event.target.value)}
            value={locationId}
          >
            {(data?.locations ?? []).map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
                {location.organizationName
                  ? ` - ${location.organizationName}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={!locationId || generateTagMutation.isPending}
          onClick={() => generateTagMutation.mutate({ locationId })}
        >
          <PlusIcon className="size-4" />
          Generate tag
        </Button>
      </section>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Tag</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Last counter</TableHeaderCell>
            <TableHeaderCell>Setup URL</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(data?.tags ?? []).map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>
                <p className="font-medium">{tag.label}</p>
                <p className="text-xs text-slate-500">{tag.publicId}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {tag.aesKeyHex}
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge tone={tag.isActive ? "good" : "neutral"}>
                  {tag.isActive ? "active" : "inactive"}
                </StatusBadge>
              </TableCell>
              <TableCell>{tag.lastSeenCounter}</TableCell>
              <TableCell>
                {tag.publicId ? (
                  <CopyButton
                    value={`${origin}/clock?tag=${tag.publicId}&picc=${piccPlaceholder}&cmac=${cmacPlaceholder}`}
                  />
                ) : (
                  "Legacy tag"
                )}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  return (
    <Button
      aria-label="Copy setup URL"
      onClick={() => navigator.clipboard.writeText(value)}
      variant="secondary"
    >
      <CopyIcon className="size-4" />
      Copy URL
    </Button>
  )
}

export { ClockStationsPage }
