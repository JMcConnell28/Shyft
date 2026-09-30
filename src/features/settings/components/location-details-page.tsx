"use client"

import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { LocationDetailsForm } from "@/features/settings/components/location-details-form"
import { LocationZonesSection } from "@/features/settings/components/location-zones-section"
import { useLocationSettingsQuery } from "@/features/settings/hooks/use-location-settings-query"

function LocationDetailsPage({
  organizationId,
  userId,
  workspaceSlug,
  locationSlug,
}: {
  organizationId: string
  userId: string
  workspaceSlug: string
  locationSlug: string
}) {
  const query = useLocationSettingsQuery({ organizationId, userId })
  if (query.isPending)
    return (
      <p className="py-6 text-sm text-muted-foreground">Loading location...</p>
    )
  if (query.isError)
    return (
      <p role="alert" className="py-6 text-sm text-destructive">
        We could not load this location.
      </p>
    )

  const location = query.data.locations.find(
    (item) => item.slug === locationSlug
  )
  if (!location)
    return (
      <p role="alert" className="py-6 text-sm text-destructive">
        Location not found.
      </p>
    )

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/app/$workspaceSlug/settings/locations"
          params={{ workspaceSlug }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeftIcon className="size-3.5" /> Locations
        </Link>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-[#10204b]">
          {location.name}
        </h2>
      </div>
      <LocationZonesSection
        location={location}
        organizationId={organizationId}
        userId={userId}
      />
      <LocationDetailsForm
        location={location}
        organizationId={organizationId}
        userId={userId}
      />
    </div>
  )
}

export { LocationDetailsPage }
