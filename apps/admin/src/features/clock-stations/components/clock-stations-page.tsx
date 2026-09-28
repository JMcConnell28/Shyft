"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClockStationLocationSection } from "@/features/clock-stations/components/clock-station-location"
import { useClockStationMutations } from "@/features/clock-stations/hooks/use-clock-station-mutations"
import { useClockStationsQuery } from "@/features/clock-stations/hooks/use-clock-stations-query"
import type { ClockStationTag } from "@/features/clock-stations/types"

function ClockStationsPage() {
  const [locationId, setLocationId] = React.useState("")
  const query = useClockStationsQuery()
  const { generateTagMutation } = useClockStationMutations()
  const data = query.data

  React.useEffect(() => {
    setLocationId((current) =>
      data?.locations.some((location) => location.id === current)
        ? current
        : (data?.locations[0]?.id ?? ""),
    )
  }, [data?.locations])

  const tagsByLocation = new Map<string, ClockStationTag[]>()
  for (const tag of data?.tags ?? []) {
    const tags = tagsByLocation.get(tag.locationId) ?? []
    tags.push(tag)
    tagsByLocation.set(tag.locationId, tags)
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Clock stations</h1>
        <p className="text-sm text-slate-500">
          Generate NTAG setup data and monitor deployed station tags.
        </p>
      </header>

      {query.isPending && <p className="text-sm text-slate-500">Loading clock stations…</p>}
      {query.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load clock stations. <Button onClick={() => query.refetch()} variant="secondary">Try again</Button>
        </div>
      )}

      {data && (
        <>
          <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
            <label className="flex-1 space-y-1 text-sm font-medium">
              <span>Location</span>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3"
                onChange={(event) => setLocationId(event.target.value)}
                value={locationId}
              >
                {data.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}{location.organizationName ? ` - ${location.organizationName}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={!locationId || generateTagMutation.isPending}
              onClick={() => generateTagMutation.mutate({ locationId })}
            >
              <PlusIcon className="size-4" />
              {generateTagMutation.isPending ? "Generating…" : "Generate tag data"}
            </Button>
          </section>

          {generateTagMutation.isError && (
            <p role="alert" className="text-sm text-red-600">
              {generateTagMutation.error instanceof Error
                ? generateTagMutation.error.message
                : "Could not generate tag setup data."}
            </p>
          )}
          {!data.appBaseUrl && (
            <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Set APP_BASE_URL to the main app URL in the admin deployment to show copyable setup URLs.
            </p>
          )}
          {data.locations.length === 0 ? (
            <p className="text-sm text-slate-500">No locations are available yet.</p>
          ) : (
            <div className="grid gap-4">
              {data.locations.map((location) => (
                <ClockStationLocationSection
                  appBaseUrl={data.appBaseUrl}
                  key={location.id}
                  location={location}
                  tags={tagsByLocation.get(location.id) ?? []}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { ClockStationsPage }
