"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"

import type { LocationSettingsItem } from "@/features/settings/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeeklyClosingTimes } from "@/features/settings/components/weekly-closing-times"
import { useLocationSettingsQuery } from "@/features/settings/hooks/use-location-settings-query"
import { useUpdateLocationSettings } from "@/features/settings/hooks/use-update-location-settings"

function LocationsSettingsPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const settingsQuery = useLocationSettingsQuery({
    organizationId,
    locationId,
    userId,
  })

  if (settingsQuery.isPending) {
    return <LocationsSettingsState message="Loading location settings..." />
  }

  if (settingsQuery.isError) {
    return (
      <LocationsSettingsState message="We could not load location settings right now." />
    )
  }

  return (
    <div className="space-y-4">
      {settingsQuery.data.locations.map((location) => (
        <LocationSettingsCard
          key={location.id}
          location={location}
          organizationId={organizationId}
          workspaceLocationId={locationId}
          userId={userId}
        />
      ))}
    </div>
  )
}

function LocationSettingsCard({
  location,
  organizationId,
  workspaceLocationId,
  userId,
}: {
  location: LocationSettingsItem
  organizationId?: string
  workspaceLocationId?: string
  userId: string
}) {
  const { isSaving, saveLocationSettings } = useUpdateLocationSettings({
    organizationId,
    locationId: workspaceLocationId,
    userId,
  })
  const form = useForm({
    defaultValues: {
      daySettings: location.daySettings,
      estimatedClosingTime: location.estimatedClosingTime,
      estimatedClosingTimeNextDay: location.estimatedClosingTimeNextDay,
    },
    onSubmit: async ({ value }) => {
      await saveLocationSettings({
        daySettings: value.daySettings,
        locationId: location.id,
        estimatedClosingTime: value.estimatedClosingTime,
        estimatedClosingTimeNextDay: value.estimatedClosingTimeNextDay,
      })
    },
  })

  React.useEffect(() => {
    form.reset({
      daySettings: location.daySettings,
      estimatedClosingTime: location.estimatedClosingTime,
      estimatedClosingTimeNextDay: location.estimatedClosingTimeNextDay,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.daySettings,
    location.estimatedClosingTime,
    location.estimatedClosingTimeNextDay,
  ])

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-1">
        <CardTitle className="text-sm">{location.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Weekly close times are used first. The fallback only applies when a
          day has not been configured yet.
        </p>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <WeeklyClosingTimes
                days={values.daySettings}
                fallbackTime={values.estimatedClosingTime}
                fallbackNextDay={values.estimatedClosingTimeNextDay}
                onFallbackTimeChange={(estimatedClosingTime) =>
                  form.setFieldValue(
                    "estimatedClosingTime",
                    estimatedClosingTime
                  )
                }
                onFallbackNextDayChange={(estimatedClosingTimeNextDay) =>
                  form.setFieldValue(
                    "estimatedClosingTimeNextDay",
                    estimatedClosingTimeNextDay
                  )
                }
                onApplyFallback={() => {
                  form.setFieldValue("daySettings", (current) =>
                    current.map((entry) => ({
                      ...entry,
                      closeTime: values.estimatedClosingTime,
                      closeTimeNextDay: values.estimatedClosingTimeNextDay,
                    }))
                  )
                }}
                onDayChange={(index, nextValue) => {
                  form.setFieldValue("daySettings", (current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, ...nextValue } : entry
                    )
                  )
                }}
              />
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    !hasLocationSettingsChanges(location, values) ||
                    form.state.isSubmitting ||
                    isSaving
                  }
                >
                  Save location
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}

function hasLocationSettingsChanges(
  location: LocationSettingsItem,
  values: {
    daySettings: Array<{
      closeTime: string
      closeTimeNextDay: boolean
      weekday: number
    }>
    estimatedClosingTime: string
    estimatedClosingTimeNextDay: boolean
  }
) {
  if (values.estimatedClosingTime !== location.estimatedClosingTime) {
    return true
  }

  if (
    values.estimatedClosingTimeNextDay !== location.estimatedClosingTimeNextDay
  ) {
    return true
  }

  return values.daySettings.some((daySetting, index) => {
    const initialDaySetting = location.daySettings[index]

    if (!initialDaySetting) {
      return true
    }

    return (
      daySetting.weekday !== initialDaySetting.weekday ||
      daySetting.closeTime !== initialDaySetting.closeTime ||
      daySetting.closeTimeNextDay !== initialDaySetting.closeTimeNextDay
    )
  })
}

function LocationsSettingsState({ message }: { message: string }) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

export { LocationsSettingsPage }
