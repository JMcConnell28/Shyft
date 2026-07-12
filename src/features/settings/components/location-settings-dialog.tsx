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
  const { isSaving, saveLocationSettings } = useUpdateLocationSettings({
    organizationId,
    locationId,
    userId,
  })
  const form = useForm({
    defaultValues: getLocationDefaults(location),
    onSubmit: async ({ value }) => {
      await saveLocationSettings({ locationId: location.id, ...value })
      setOpen(false)
    },
  })

  React.useEffect(() => {
    if (!open) form.reset(getLocationDefaults(location))
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
            Update opening and closing times for this location.
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
    daySettings: location.daySettings,
    estimatedClosingTime: location.estimatedClosingTime,
    estimatedClosingTimeNextDay: location.estimatedClosingTimeNextDay,
  }
}

export { LocationSettingsDialog }
