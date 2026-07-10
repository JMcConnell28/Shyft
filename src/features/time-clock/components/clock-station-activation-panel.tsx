"use client"

import * as React from "react"
import { PowerIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ClockSettingsPageData } from "@/features/time-clock/types"

type ClockSettingsLocation = ClockSettingsPageData["locations"][number]

type ClockStationActivationPanelProps = {
  isPending: boolean
  location: ClockSettingsLocation
  onActivate: (locationId: string) => void
}

function ClockStationActivationPanel({
  isPending,
  location,
  onActivate,
}: ClockStationActivationPanelProps) {
  const [confirmed, setConfirmed] = React.useState(false)
  const isActive = location.timeAttendanceEnabled
  const canActivate =
    !isActive && location.hardwareEntitlementStatus === "claimed"

  React.useEffect(() => {
    if (isActive) setConfirmed(false)
  }, [isActive])

  return (
    <section className="border-b border-border/70 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">Clock-in station activation</h3>
            <ClockStationStatusBadge location={location} />
          </div>
          <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
            {getActivationMessage(location)}
          </p>
        </div>
        {isActive ? null : (
          <Button
            type="button"
            className="shrink-0"
            disabled={isPending || !confirmed || !canActivate}
            onClick={() => onActivate(location.id)}
          >
            <PowerIcon className="size-4" />
            {isPending ? "Activating..." : "Activate station"}
          </Button>
        )}
      </div>

      {isActive ? null : (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
          <Checkbox
            className="mt-0.5"
            checked={confirmed}
            disabled={!canActivate || isPending}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <span className="text-xs leading-5 text-muted-foreground">
            I confirm that we have received this clock-in station and understand
            that Time & Attendance billing starts now.
          </span>
        </label>
      )}
    </section>
  )
}

function ClockStationStatusBadge({
  location,
}: {
  location: ClockSettingsLocation
}) {
  if (location.timeAttendanceEnabled) {
    return <Badge>Active</Badge>
  }

  if (location.hardwareEntitlementStatus === "claimed") {
    return <Badge variant="outline">Ready to activate</Badge>
  }

  return <Badge variant="outline">Inactive</Badge>
}

function getActivationMessage(location: ClockSettingsLocation) {
  if (location.timeAttendanceEnabled) {
    return "Time & Attendance is active for this location. Used employees in this location can be included in Time & Attendance billing for the period."
  }

  if (location.hardwareEntitlementStatus === "available") {
    return "Request the physical clock-in station before activating this location. Once it has arrived, come back here to confirm receipt and start the add-on."
  }

  if (location.hardwareEntitlementStatus === "void") {
    return "This location does not currently have an available clock-in station entitlement."
  }

  if (!location.hardwareEntitlementStatus) {
    return "Clock-in station activation is not ready for this location yet."
  }

  return "Only activate this after the physical clock-in station has arrived. Activating turns on the Time & Attendance add-on for this location and increases billing."
}

export { ClockStationActivationPanel }
