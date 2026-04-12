import { cn } from "@/lib/utils"

type LocationTab = {
  id: string
  name: string
  slug: string
  hasUnreadPublished: boolean
}

function LocationTabs({
  locations,
  selectedLocationId,
  onLocationChange,
}: {
  locations: Array<LocationTab>
  selectedLocationId: string | undefined
  onLocationChange: (locationSlug: string) => void
}) {
  if (locations.length <= 1) {
    return null
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {locations.map((location) => {
        const isActive = location.id === selectedLocationId

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onLocationChange(location.slug)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-foreground/15 bg-foreground/5 text-foreground"
                : "border-border/70 bg-background hover:bg-muted/40",
            )}
          >
            <span>{location.name}</span>
            {location.hasUnreadPublished ? (
              <span className="size-2 rounded-full bg-rose-500" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export { LocationTabs }
