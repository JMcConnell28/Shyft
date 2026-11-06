import { Checkbox } from "@/components/ui/checkbox"

function InviteLocationSelector({
  locations,
  selectedIds,
  onChange,
  disabled = false,
}: {
  locations: ReadonlyArray<{ id: string; name: string }>
  selectedIds: Array<string>
  onChange: (ids: Array<string>) => void
  disabled?: boolean
}) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">
        Locations after approval
      </legend>
      <p className="text-xs text-muted-foreground">
        Choose one or more locations, or leave all unchecked to join the
        organization without any active locations.
      </p>
      <div className="max-h-48 divide-y overflow-y-auto rounded-lg border">
        {locations.map((location) => (
          <label
            key={location.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm"
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
            <span className="min-w-0 break-words">{location.name}</span>
          </label>
        ))}
        {locations.length === 0 && (
          <p className="p-3 text-sm text-muted-foreground">
            No locations yet. Employees can still request to join the
            organization.
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedIds.length
          ? `${selectedIds.length} location${selectedIds.length === 1 ? "" : "s"} selected`
          : "No active locations selected"}
      </p>
    </fieldset>
  )
}

export { InviteLocationSelector }
