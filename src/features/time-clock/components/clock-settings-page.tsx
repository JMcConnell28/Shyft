"use client"

import * as React from "react"
import { CopyIcon, LocateFixedIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useClockSettingsMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useClockSettingsQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import type { ClockSettingsPageData } from "@/features/time-clock/types"

function ClockSettingsPage({
  initialData,
  organizationId,
  locationId,
  userId,
}: {
  initialData: ClockSettingsPageData
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const input = { organizationId, locationId, userId }
  const query = useClockSettingsQuery(input)
  const data = query.data ?? initialData
  const mutations = useClockSettingsMutations(input)

  return (
    <div className="space-y-4">
      {data.locations.map((location) => (
        <ClockLocationSettingsCard
          key={location.id}
          location={location}
          mutations={mutations}
        />
      ))}
    </div>
  )
}

function ClockLocationSettingsCard({
  location,
  mutations,
}: {
  location: ClockSettingsPageData["locations"][number]
  mutations: ReturnType<typeof useClockSettingsMutations>
}) {
  const [isEnabled, setIsEnabled] = React.useState(location.isEnabled)
  const [latitude, setLatitude] = React.useState(location.latitude)
  const [longitude, setLongitude] = React.useState(location.longitude)
  const [radiusMeters, setRadiusMeters] = React.useState(
    location.radiusMeters.toString()
  )
  const [maxAccuracyMeters, setMaxAccuracyMeters] = React.useState(
    location.maxAccuracyMeters.toString()
  )
  const [timezone, setTimezone] = React.useState(location.timezone)
  const [earlyClockInGraceMinutes, setEarlyClockInGraceMinutes] =
    React.useState(location.earlyClockInGraceMinutes.toString())
  const [earlyStartReviewMinutes, setEarlyStartReviewMinutes] = React.useState(
    location.earlyStartReviewMinutes.toString()
  )
  const [lateClockOutGraceMinutes, setLateClockOutGraceMinutes] =
    React.useState(location.lateClockOutGraceMinutes.toString())
  const [lateFinishReviewMinutes, setLateFinishReviewMinutes] = React.useState(
    location.lateFinishReviewMinutes.toString()
  )
  const [forgottenClockOutAlertMinutes, setForgottenClockOutAlertMinutes] =
    React.useState(location.forgottenClockOutAlertMinutes.toString())
  const [hardReviewAfterMinutes, setHardReviewAfterMinutes] = React.useState(
    location.hardReviewAfterMinutes.toString()
  )
  const [locationMessage, setLocationMessage] = React.useState(
    location.latitude !== null && location.longitude !== null
      ? "Venue location is set."
      : "Venue location has not been set yet."
  )
  const clockUrl = getClockUrl(location.id)
  const getSettingsPayload = React.useCallback(
    (coordinates: { latitude: number | null; longitude: number | null }) => ({
      earlyClockInGraceMinutes: Number(earlyClockInGraceMinutes),
      earlyStartReviewMinutes: Number(earlyStartReviewMinutes),
      forgottenClockOutAlertMinutes: Number(forgottenClockOutAlertMinutes),
      hardReviewAfterMinutes: Number(hardReviewAfterMinutes),
      isEnabled,
      lateClockOutGraceMinutes: Number(lateClockOutGraceMinutes),
      lateFinishReviewMinutes: Number(lateFinishReviewMinutes),
      latitude: coordinates.latitude,
      locationId: location.id,
      longitude: coordinates.longitude,
      maxAccuracyMeters: Number(maxAccuracyMeters),
      radiusMeters: Number(radiusMeters),
      timezone,
    }),
    [
      earlyClockInGraceMinutes,
      earlyStartReviewMinutes,
      forgottenClockOutAlertMinutes,
      hardReviewAfterMinutes,
      isEnabled,
      lateClockOutGraceMinutes,
      lateFinishReviewMinutes,
      location.id,
      maxAccuracyMeters,
      radiusMeters,
      timezone,
    ]
  )

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-sm">{location.name}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure geofence validation and NFC tag URLs.
          </p>
        </div>
        <Badge variant={isEnabled ? "default" : "outline"}>
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-0 py-0!">
        <div className="flex min-h-18 items-center justify-between border-b border-border/70 py-4">
          <div>
            <p className="text-sm font-medium">Allow employee clocking</p>
            <p className="text-xs text-muted-foreground">
              Employees need their own signed-in account to use the clock.
            </p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>

        <div className="border-b border-border/70 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Venue location</p>
              <p className="text-xs text-muted-foreground">{locationMessage}</p>
              {latitude !== null && longitude !== null ? (
                <p className="font-mono text-[0.68rem] text-muted-foreground">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!("geolocation" in navigator)) {
                    setLocationMessage("This browser cannot share location.")
                    return
                  }

                  setLocationMessage("Getting this device's location...")
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const capturedLatitude = position.coords.latitude
                      const capturedLongitude = position.coords.longitude
                      const capturedAccuracy = position.coords.accuracy
                      const allowedAccuracy = Number(maxAccuracyMeters)

                      if (
                        !Number.isFinite(allowedAccuracy) ||
                        capturedAccuracy > allowedAccuracy
                      ) {
                        setLocationMessage(
                          `Location was only accurate to about ${Math.round(
                            capturedAccuracy
                          )}m, so it was not saved. Try again at the venue or increase max GPS accuracy.`
                        )
                        return
                      }

                      setLatitude(capturedLatitude)
                      setLongitude(capturedLongitude)
                      setLocationMessage(
                        `Location captured and saved, accurate to about ${Math.round(
                          capturedAccuracy
                        )}m.`
                      )
                      mutations.updateSettingsMutation.mutate(
                        getSettingsPayload({
                          latitude: capturedLatitude,
                          longitude: capturedLongitude,
                        })
                      )
                    },
                    () => {
                      setLocationMessage(
                        "Location permission was denied. Try again at the venue."
                      )
                    },
                    {
                      enableHighAccuracy: true,
                      maximumAge: 15000,
                      timeout: 15000,
                    }
                  )
                }}
              >
                <LocateFixedIcon className="size-3" />
                Use current location
              </Button>
              {latitude !== null && longitude !== null ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLatitude(null)
                    setLongitude(null)
                    setLocationMessage("Venue location has been cleared.")
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border/70 py-5 md:grid-cols-2">
          <SettingsField
            label="Radius metres"
            value={radiusMeters}
            onChange={setRadiusMeters}
            placeholder="75"
          />
          <SettingsField
            label="Max GPS accuracy"
            value={maxAccuracyMeters}
            onChange={setMaxAccuracyMeters}
            placeholder="150"
          />
          <SettingsField
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            placeholder="Europe/London"
          />
        </div>

        <div className="border-b border-border/70 py-5">
          <div className="mb-3">
            <p className="text-sm font-medium">Pay and review rules</p>
            <p className="text-xs text-muted-foreground">
              Actual clock times are always kept; these rules set payable time
              and review thresholds.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SettingsField
              label="Early paid grace"
              value={earlyClockInGraceMinutes}
              onChange={setEarlyClockInGraceMinutes}
              placeholder="10"
            />
            <SettingsField
              label="Review early over"
              value={earlyStartReviewMinutes}
              onChange={setEarlyStartReviewMinutes}
              placeholder="15"
            />
            <SettingsField
              label="Late paid grace"
              value={lateClockOutGraceMinutes}
              onChange={setLateClockOutGraceMinutes}
              placeholder="10"
            />
            <SettingsField
              label="Review late over"
              value={lateFinishReviewMinutes}
              onChange={setLateFinishReviewMinutes}
              placeholder="15"
            />
            <SettingsField
              label="Forgotten alert"
              value={forgottenClockOutAlertMinutes}
              onChange={setForgottenClockOutAlertMinutes}
              placeholder="120"
            />
            <SettingsField
              label="Hard review after"
              value={hardReviewAfterMinutes}
              onChange={setHardReviewAfterMinutes}
              placeholder="720"
            />
          </div>
        </div>

        <Button
          className="my-5"
          onClick={() =>
            mutations.updateSettingsMutation.mutate(
              getSettingsPayload({ latitude, longitude })
            )
          }
        >
          Save clock settings
        </Button>

        <div className="border-t border-border/70 py-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">NFC tag URL</p>
            <p className="text-xs text-muted-foreground">
              Write this URL to the NFC tag as a website record.
            </p>
            <p className="font-mono text-xs break-all text-muted-foreground">
              {clockUrl}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(clockUrl)
              }}
            >
              <CopyIcon className="size-3" />
              Copy URL
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="space-y-1 text-xs font-medium">
      <span>{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function getClockUrl(token: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin

  return `${origin}/clock/${token}`
}

export { ClockSettingsPage }
