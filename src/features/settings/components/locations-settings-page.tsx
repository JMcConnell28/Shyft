"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import {
  Building2Icon,
  CalendarClockIcon,
  Clock3Icon,
  HashIcon,
} from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import { Button } from "@/components/ui/button"
import { CreateLocationDialog } from "@/features/settings/components/create-location-dialog"
import { WeeklyClosingTimes } from "@/features/settings/components/weekly-closing-times"
import { useLocationSettingsQuery } from "@/features/settings/hooks/use-location-settings-query"
import { useLocationSettingsMutations } from "@/features/settings/hooks/use-location-settings-mutations"
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
  const mutations = useLocationSettingsMutations({
    organizationId,
    locationId,
    userId,
  })
  const canCreateLocation = Boolean(organizationId)

  if (settingsQuery.isPending) {
    return <LocationsSettingsState message="Loading location settings..." />
  }

  if (settingsQuery.isError) {
    return (
      <LocationsSettingsState message="We could not load location settings right now." />
    )
  }

  if (settingsQuery.data.locations.length === 0) {
    return (
      <div className="space-y-4 text-[#11245a]">
        {canCreateLocation ? (
          <LocationsManagementPanel
            locationCount={0}
            pending={mutations.createMutation.isPending}
            onCreate={async (values) => {
              await mutations.createMutation.mutateAsync(values)
            }}
          />
        ) : null}
        <LocationsSettingsState message="No manageable locations found." />
      </div>
    )
  }

  return (
    <div className="space-y-4 text-[#11245a]">
      {canCreateLocation ? (
        <LocationsManagementPanel
          locationCount={settingsQuery.data.locations.length}
          pending={mutations.createMutation.isPending}
          onCreate={async (values) => {
            await mutations.createMutation.mutateAsync(values)
          }}
        />
      ) : null}

      {settingsQuery.data.locations.map((location) => (
        <LocationSettingsForm
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

function LocationsManagementPanel({
  locationCount,
  pending,
  onCreate,
}: {
  locationCount: number
  pending: boolean
  onCreate: React.ComponentProps<typeof CreateLocationDialog>["onSubmit"]
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.035em]">
            Locations
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#61709a]">
            {locationCount} location{locationCount === 1 ? "" : "s"} in this
            organisation.
          </p>
        </div>
        <CreateLocationDialog pending={pending} onSubmit={onCreate} />
      </div>
    </section>
  )
}

function LocationSettingsForm({
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
  }, [
    form,
    location.daySettings,
    location.estimatedClosingTime,
    location.estimatedClosingTimeNextDay,
  ])

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <LocationDetailsPanel location={location} />

      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <>
            <WeeklyClosingTimes
              days={values.daySettings}
              fallbackTime={values.estimatedClosingTime}
              fallbackNextDay={values.estimatedClosingTimeNextDay}
              onFallbackTimeChange={(estimatedClosingTime) =>
                form.setFieldValue("estimatedClosingTime", estimatedClosingTime)
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

            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-10 rounded-xl px-4 text-sm font-extrabold"
                disabled={
                  !hasLocationSettingsChanges(location, values) ||
                  form.state.isSubmitting ||
                  isSaving
                }
              >
                {isSaving || form.state.isSubmitting
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </form.Subscribe>
    </form>
  )
}

function LocationDetailsPanel({
  location,
}: {
  location: LocationSettingsItem
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div>
        <h2 className="text-lg font-extrabold tracking-[-0.035em]">
          Location details
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#61709a]">
          Review your location information.
        </p>
      </div>

      <div className="mt-4 divide-y divide-[#edf0f6]">
        <LocationDetailRow
          icon={Building2Icon}
          label="Location name"
          value={location.name}
        />
        <LocationDetailRow
          icon={HashIcon}
          label="URL slug"
          value={location.slug}
        />
        <LocationDetailRow
          icon={Clock3Icon}
          label="Default close"
          value={`${location.estimatedClosingTime}${
            location.estimatedClosingTimeNextDay ? " next day" : ""
          }`}
        />
        <LocationDetailRow
          icon={CalendarClockIcon}
          label="Configured days"
          value={`${location.daySettings.length} days`}
        />
      </div>
    </section>
  )
}

function LocationDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2Icon
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-[#11245a]">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-[#61709a]">
          {value}
        </span>
      </span>
    </div>
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

    return (
      daySetting.weekday !== initialDaySetting.weekday ||
      daySetting.closeTime !== initialDaySetting.closeTime ||
      daySetting.closeTimeNextDay !== initialDaySetting.closeTimeNextDay
    )
  })
}

function LocationsSettingsState({ message }: { message: string }) {
  return (
    <section className="rounded-xl bg-white p-4 text-sm font-semibold text-[#61709a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      {message}
    </section>
  )
}

export { LocationsSettingsPage }
