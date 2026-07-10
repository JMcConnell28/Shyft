"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ClockStationActivationPanel } from "@/features/time-clock/components/clock-station-activation-panel"
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
  const [timezone, setTimezone] = React.useState(location.timezone)
  const [earlyClockInGraceMinutes, setEarlyClockInGraceMinutes] =
    React.useState(location.earlyClockInGraceMinutes.toString())
  const [earlyStartReviewMinutes, setEarlyStartReviewMinutes] = React.useState(
    location.earlyStartReviewMinutes.toString()
  )
  const [lateClockInGraceMinutes, setLateClockInGraceMinutes] = React.useState(
    location.lateClockInGraceMinutes.toString()
  )
  const [lateStartReviewMinutes, setLateStartReviewMinutes] = React.useState(
    location.lateStartReviewMinutes.toString()
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
  const isActivatingStation =
    mutations.activateStationMutation.isPending &&
    mutations.activateStationMutation.variables?.locationId === location.id
  const getSettingsPayload = React.useCallback(
    () => ({
      earlyClockInGraceMinutes: Number(earlyClockInGraceMinutes),
      earlyStartReviewMinutes: Number(earlyStartReviewMinutes),
      forgottenClockOutAlertMinutes: Number(forgottenClockOutAlertMinutes),
      hardReviewAfterMinutes: Number(hardReviewAfterMinutes),
      isEnabled,
      lateClockInGraceMinutes: Number(lateClockInGraceMinutes),
      lateClockOutGraceMinutes: Number(lateClockOutGraceMinutes),
      lateFinishReviewMinutes: Number(lateFinishReviewMinutes),
      lateStartReviewMinutes: Number(lateStartReviewMinutes),
      latitude: location.latitude,
      locationId: location.id,
      longitude: location.longitude,
      maxAccuracyMeters: location.maxAccuracyMeters,
      radiusMeters: location.radiusMeters,
      timezone,
    }),
    [
      earlyClockInGraceMinutes,
      earlyStartReviewMinutes,
      forgottenClockOutAlertMinutes,
      hardReviewAfterMinutes,
      isEnabled,
      lateClockInGraceMinutes,
      lateClockOutGraceMinutes,
      lateFinishReviewMinutes,
      lateStartReviewMinutes,
      location.latitude,
      location.id,
      location.longitude,
      location.maxAccuracyMeters,
      location.radiusMeters,
      timezone,
    ]
  )

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-sm">{location.name}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure clock station access and payable time rules.
          </p>
        </div>
        <Badge variant={isEnabled ? "default" : "outline"}>
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-0 py-0!">
        <ClockStationActivationPanel
          isPending={isActivatingStation}
          location={location}
          onActivate={(activateLocationId) =>
            mutations.activateStationMutation.mutate({
              locationId: activateLocationId,
            })
          }
        />

        <div className="flex min-h-18 items-center justify-between border-b border-border/70 py-4">
          <div>
            <p className="text-sm font-medium">Allow employee clocking</p>
            <p className="text-xs text-muted-foreground">
              Employees clock in by tapping an assigned clock station.
            </p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>

        <div className="grid gap-4 border-b border-border/70 py-5 md:grid-cols-2">
          <SettingsField
            label="Timezone"
            helper="Used when matching station taps to scheduled shifts."
            value={timezone}
            onChange={setTimezone}
            placeholder="Europe/London"
          />
        </div>

        <div className="border-b border-border/70 py-5">
          <div className="mb-3">
            <p className="text-sm font-medium">Clocking rules</p>
            <p className="text-xs text-muted-foreground">
              Set how early or late a station tap can be before it needs a
              manager to check it.
            </p>
          </div>
          <div className="grid gap-3">
            <RuleGroup
              description="Controls how station taps are handled around the scheduled start and finish."
              title="Shift timing"
            >
              <div className="grid gap-3">
                <SettingsField
                  helper="Minutes before the shift start that clocking in is accepted normally."
                  label="Clock in early allowance"
                  suffix="min"
                  value={earlyClockInGraceMinutes}
                  onChange={setEarlyClockInGraceMinutes}
                  placeholder="10"
                />
                <SettingsField
                  helper="Earlier than this asks the employee for a reason."
                  label="Ask reason if earlier than"
                  suffix="min"
                  value={earlyStartReviewMinutes}
                  onChange={setEarlyStartReviewMinutes}
                  placeholder="15"
                />
                <SettingsField
                  helper="Minutes after the shift start that clocking in is accepted normally."
                  label="Clock in late allowance"
                  suffix="min"
                  value={lateClockInGraceMinutes}
                  onChange={setLateClockInGraceMinutes}
                  placeholder="5"
                />
                <SettingsField
                  helper="Later than this asks the employee for a reason."
                  label="Ask reason if later than"
                  suffix="min"
                  value={lateStartReviewMinutes}
                  onChange={setLateStartReviewMinutes}
                  placeholder="15"
                />
                <SettingsField
                  helper="Minutes after the shift finish that clocking out is accepted normally."
                  label="Clock out late allowance"
                  suffix="min"
                  value={lateClockOutGraceMinutes}
                  onChange={setLateClockOutGraceMinutes}
                  placeholder="10"
                />
                <SettingsField
                  helper="Later clock-outs are marked for manager review."
                  label="Review clock-out after"
                  suffix="min"
                  value={lateFinishReviewMinutes}
                  onChange={setLateFinishReviewMinutes}
                  placeholder="15"
                />
              </div>
            </RuleGroup>

            <RuleGroup
              description="Flags open entries so managers can catch missed clock-outs quickly."
              title="Open entry checks"
            >
              <div className="grid gap-3">
                <SettingsField
                  helper="Show a warning when someone has been clocked in this long after their scheduled finish."
                  label="Warn after missed clock-out"
                  suffix="min"
                  value={forgottenClockOutAlertMinutes}
                  onChange={setForgottenClockOutAlertMinutes}
                  placeholder="120"
                />
                <SettingsField
                  helper="Force the entry into manager review if it stays open this long."
                  label="Require review after"
                  suffix="min"
                  value={hardReviewAfterMinutes}
                  onChange={setHardReviewAfterMinutes}
                  placeholder="720"
                />
              </div>
            </RuleGroup>
          </div>
        </div>

        <Button
          className="my-5"
          onClick={() =>
            mutations.updateSettingsMutation.mutate(getSettingsPayload())
          }
        >
          Save clock settings
        </Button>
      </CardContent>
    </Card>
  )
}

function SettingsField({
  helper,
  label,
  onChange,
  placeholder,
  suffix,
  value,
}: {
  helper?: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  suffix?: string
  value: string
}) {
  return (
    <label className="block rounded-xl border border-[#edf0f6] bg-[#fbfcff] p-3">
      <span className="text-xs font-semibold text-[#11245a]">{label}</span>
      {helper ? (
        <span className="mt-1 block min-h-8 text-xs leading-4 text-muted-foreground">
          {helper}
        </span>
      ) : null}
      <span className="mt-3 flex items-center rounded-lg border border-[#dfe5f0] bg-white focus-within:ring-2 focus-within:ring-primary/15">
        <Input
          className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {suffix ? (
          <span className="pr-3 text-xs font-semibold text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  )
}

function RuleGroup({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-xl border border-[#dfe5f0] bg-white p-3">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#11245a]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

export { ClockSettingsPage }
