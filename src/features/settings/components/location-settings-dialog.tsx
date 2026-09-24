"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { PencilIcon } from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WeeklyClosingTimes } from "@/features/settings/components/weekly-closing-times"
import {
  LocationAddressFields,
  getLocationAddressDraft,
  toLocationAddress,
} from "@/features/locations/components/location-address-fields"
import { locationAddressSchema } from "@/features/locations/schemas/location-address-schema"
import { useUpdateLocationSettings } from "@/features/settings/hooks/use-update-location-settings"

function LocationSettingsDialog({
  location,
  organizationId,
  locationId,
  userId,
}: {
  location: LocationSettingsItem
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const [open, setOpen] = React.useState(false)
  const [addressError, setAddressError] = React.useState<string | null>(null)
  const { isSaving, saveLocationSettings } = useUpdateLocationSettings({
    organizationId,
    locationId,
    userId,
  })
  const form = useForm({
    defaultValues: getLocationDefaults(location),
    onSubmit: async ({ value }) => {
      const address = toLocationAddress(value.address)
      const parsedAddress = address
        ? locationAddressSchema.safeParse(address)
        : null
      if (parsedAddress && !parsedAddress.success) {
        setAddressError(
          parsedAddress.error.issues[0]?.message ?? "Check the address."
        )
        return
      }
      setAddressError(null)
      await saveLocationSettings({
        locationId: location.id,
        ...value,
        address: parsedAddress?.data ?? null,
      })
      setOpen(false)
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset(getLocationDefaults(location))
      setAddressError(null)
    }
  }, [form, location, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-9 gap-2 rounded-lg px-3 text-[#0968f5]"
          />
        }
      >
        <PencilIcon className="size-4" /> Edit
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{location.name}</DialogTitle>
          <DialogDescription>
            Update the location address and closing times.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <>
                <div className="mb-5 space-y-3 rounded-xl border border-[#dfe5f0] p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#14214a]">
                      Location address
                    </h3>
                    <p className="mt-1 text-xs text-[#61709a]">
                      Used for Time & Attendance. You can leave it blank until
                      you need it.
                    </p>
                  </div>
                  <LocationAddressFields
                    idPrefix={`location-${location.id}`}
                    value={values.address}
                    onChange={(address) => {
                      setAddressError(null)
                      form.setFieldValue("address", address)
                    }}
                  />
                  {addressError ? (
                    <p role="alert" className="text-xs text-destructive">
                      {addressError}
                    </p>
                  ) : null}
                </div>
                <WeeklyClosingTimes
                  days={values.daySettings}
                  fallbackTime={values.estimatedClosingTime}
                  fallbackNextDay={values.estimatedClosingTimeNextDay}
                  onFallbackTimeChange={(value) =>
                    form.setFieldValue("estimatedClosingTime", value)
                  }
                  onFallbackNextDayChange={(value) =>
                    form.setFieldValue("estimatedClosingTimeNextDay", value)
                  }
                  onApplyFallback={() =>
                    form.setFieldValue("daySettings", (days) =>
                      days.map((day) => ({
                        ...day,
                        closeTime: values.estimatedClosingTime,
                        closeTimeNextDay: values.estimatedClosingTimeNextDay,
                      }))
                    )
                  }
                  onDayChange={(index, value) =>
                    form.setFieldValue("daySettings", (days) =>
                      days.map((day, dayIndex) =>
                        dayIndex === index ? { ...day, ...value } : day
                      )
                    )
                  }
                />
                <DialogFooter className="mt-4">
                  <Button
                    type="submit"
                    className="h-10 rounded-lg px-4"
                    disabled={form.state.isSubmitting || isSaving}
                  >
                    {form.state.isSubmitting || isSaving
                      ? "Saving..."
                      : "Save changes"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getLocationDefaults(location: LocationSettingsItem) {
  return {
    address: getLocationAddressDraft(location.address),
    daySettings: location.daySettings,
    estimatedClosingTime: location.estimatedClosingTime,
    estimatedClosingTimeNextDay: location.estimatedClosingTimeNextDay,
  }
}

export { LocationSettingsDialog }
