"use client"

import * as React from "react"

import type { ClockSettingsLocation } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ClockSettingRow,
  ClockSettingSwitch,
  ClockSettingValue,
} from "@/features/time-clock/components/clock-setting-row"

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
  const [open, setOpen] = React.useState(false)
  const isActive = location.timeAttendanceEnabled
  const canActivate =
    !isActive && location.hardwareEntitlementStatus === "claimed"

  return (
    <>
      <ClockSettingRow
        description={getActivationMessage(location)}
        title="Activate clock-in station"
      >
        <div className="flex items-center gap-3">
          <ClockSettingValue tone={isActive ? "positive" : "default"}>
            {getActivationLabel(location)}
          </ClockSettingValue>
          <ClockSettingSwitch
            checked={isActive}
            disabled={isPending || (!isActive && !canActivate)}
            label="Activate clock-in station"
            onCheckedChange={(checked) => {
              if (checked && canActivate) setOpen(true)
            }}
          />
        </div>
      </ClockSettingRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activate this clock-in station?</DialogTitle>
            <DialogDescription>
              This turns on Time &amp; Attendance for {location.name}. Billing
              starts when you confirm activation.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-[#46577d]">
            Activate only after the physical NFC station has arrived and is
            ready for staff to use.
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() => {
                onActivate(location.id)
                setOpen(false)
              }}
            >
              {isPending ? "Activating..." : "Confirm activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getActivationLabel(location: ClockSettingsLocation) {
  if (location.timeAttendanceEnabled) return "Active"
  if (location.hardwareEntitlementStatus === "claimed") return "Ready"
  return "Inactive"
}

function getActivationMessage(location: ClockSettingsLocation) {
  if (location.timeAttendanceEnabled) {
    return "Time & Attendance is active and this location can accept station taps."
  }
  if (location.hardwareEntitlementStatus === "claimed") {
    return "Turn on clocking after the physical NFC station has arrived."
  }
  if (location.hardwareEntitlementStatus === "available") {
    return "Claim a physical NFC station before activating clocking here."
  }
  return "Clock-in station activation is not available for this location yet."
}

export { ClockStationActivationPanel }
