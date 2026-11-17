import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const locationSearchThreshold = 6

function InviteLocationSelector({
  locations,
  selectedIds,
  onChange,
  disabled = false,
  layout = "list",
}: {
  locations: ReadonlyArray<{ id: string; name: string }>
  selectedIds: Array<string>
  onChange: (ids: Array<string>) => void
  disabled?: boolean
  layout?: "list" | "grid"
}) {
  const [search, setSearch] = useState("")
  const isGrid = layout === "grid"
  const showSearch = isGrid && locations.length > locationSearchThreshold
  const filter = search.trim().toLowerCase()
  const visibleLocations =
    showSearch && filter
      ? locations.filter((location) =>
          location.name.toLowerCase().includes(filter)
        )
      : locations

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-2">
      <legend
        className={cn(
          "mb-1 text-sm font-semibold",
          isGrid &&
            "flex w-full flex-wrap items-baseline justify-between gap-x-2"
        )}
      >
        <span>Locations after approval</span>
        {isGrid ? (
          <span
            className="text-xs font-medium text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
        ) : null}
      </legend>
      {!isGrid ? (
        <p className="text-xs text-muted-foreground">
          Choose one or more locations, or leave all unchecked to join the
          organization without any active locations.
        </p>
      ) : null}
      {showSearch ? (
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search locations"
            placeholder="Search locations"
            className="h-11 rounded-lg pl-9 text-base md:h-8 md:text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      ) : null}
      <div
        className={
          isGrid
            ? "grid gap-2 sm:grid-cols-2"
            : "max-h-48 divide-y overflow-y-auto rounded-lg border"
        }
      >
        {visibleLocations.map((location) => (
          <label
            key={location.id}
            className={cn(
              "flex min-h-11 min-w-0 cursor-pointer items-center gap-3 px-3 py-2 text-sm",
              isGrid &&
                "rounded-lg border border-border bg-card hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 md:min-h-9"
            )}
          >
            <Checkbox
              disabled={disabled}
              checked={selectedIds.includes(location.id)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selectedIds, location.id]
                    : selectedIds.filter((id) => id !== location.id)
                )
              }
            />
            <span className="min-w-0 wrap-anywhere">{location.name}</span>
          </label>
        ))}
        {!isGrid && locations.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            No locations yet. Employees can still request to join the
            organization.
          </p>
        ) : null}
      </div>
      {isGrid ? (
        <>
          {showSearch && visibleLocations.length === 0 ? (
            <p role="status" className="py-1 text-sm text-muted-foreground">
              No matching locations.
            </p>
          ) : null}
          {selectedIds.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Staff can join without location access.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length
            ? `${selectedIds.length} location${selectedIds.length === 1 ? "" : "s"} selected`
            : "No active locations selected"}
        </p>
      )}
    </fieldset>
  )
}

export { InviteLocationSelector }
