"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Clock3Icon, MapPinIcon } from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import { Button } from "@/components/ui/button"
import {
  LocationAddressFields,
  getLocationAddressDraft,
  toLocationAddress,
} from "@/features/locations/components/location-address-fields"
import { locationAddressSchema } from "@/features/locations/schemas/location-address-schema"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { WeeklyClosingTimes } from "@/features/settings/components/weekly-closing-times"
import { useUpdateLocationSettings } from "@/features/settings/hooks/use-update-location-settings"

function getLocationDefaults(location: LocationSettingsItem) {
  return {
    address: getLocationAddressDraft(location.address),
    daySettings: location.daySettings,
    estimatedClosingTime: location.estimatedClosingTime,
    estimatedClosingTimeNextDay: location.estimatedClosingTimeNextDay,
  }
}

function LocationDetailsForm({
  location,
  organizationId,
  userId,
}: {
  location: LocationSettingsItem
  organizationId: string
  userId: string
}) {
  const [addressError, setAddressError] = React.useState<string | null>(null)
  const { isSaving, saveLocationSettings } = useUpdateLocationSettings({
    organizationId,
    userId,
  })
  const form = useForm({
    defaultValues: getLocationDefaults(location),
    onSubmit: async ({ value }) => {
      const address = toLocationAddress(value.address)
      const parsed = address ? locationAddressSchema.safeParse(address) : null
      if (parsed && !parsed.success) {
        setAddressError(parsed.error.issues[0]?.message ?? "Check the address.")
        return
      }
      setAddressError(null)
      await saveLocationSettings({
        locationId: location.id,
        ...value,
        address: parsed?.data ?? null,
      })
    },
  })

  React.useEffect(() => {
    form.reset(getLocationDefaults(location))
  }, [form, location.id])

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <>
            <SettingsSection
              icon={MapPinIcon}
              title="Address"
              description="Used for time and attendance. You can leave this blank."
            >
              <div className="py-4">
                <LocationAddressFields
                  idPrefix={`location-${location.id}`}
                  value={values.address}
                  onChange={(address) => {
                    setAddressError(null)
                    form.setFieldValue("address", address)
                  }}
                />
                {addressError ? (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {addressError}
                  </p>
                ) : null}
              </div>
            </SettingsSection>
            <SettingsSection
              icon={Clock3Icon}
              title="Closing times"
              description="Set the usual closing time for each day to support shift estimates."
            >
              <WeeklyClosingTimes
                days={values.daySettings}
                fallbackTime={values.estimatedClosingTime}
                fallbackNextDay={values.estimatedClosingTimeNextDay}
                onFallbackTimeChange={(time) =>
                  form.setFieldValue("estimatedClosingTime", time)
                }
                onFallbackNextDayChange={(nextDay) =>
                  form.setFieldValue("estimatedClosingTimeNextDay", nextDay)
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
                onDayChange={(index, change) =>
                  form.setFieldValue("daySettings", (days) =>
                    days.map((day, dayIndex) =>
                      dayIndex === index ? { ...day, ...change } : day
                    )
                  )
                }
              />
            </SettingsSection>
          </>
        )}
      </form.Subscribe>
      <div className="flex justify-end">
        <Button type="submit" disabled={form.state.isSubmitting || isSaving}>
          {form.state.isSubmitting || isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

export { LocationDetailsForm }
