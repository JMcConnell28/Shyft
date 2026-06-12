"use client"

import * as React from "react"
import { ClockIcon, MapPinIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import { useEmployeeClockMutation } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useEmployeeClockQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import type {
  ClockShiftSegment,
  EmployeeClockPageData,
  GpsCoordinates,
} from "@/features/time-clock/types"
import {
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"

type GpsState =
  | { status: "idle"; coordinates: null }
  | { status: "checking"; coordinates: null }
  | { status: "ready"; coordinates: GpsCoordinates }
  | { status: "error"; coordinates: null }

function EmployeeClockPage({
  initialData,
  token,
  userId,
}: {
  initialData: EmployeeClockPageData
  token: string
  userId: string
}) {
  const query = useEmployeeClockQuery({ token, userId })
  const data = query.data ?? initialData
  const mutation = useEmployeeClockMutation({ token, userId })
  const liveNow = useLiveNow(Boolean(data.openEntry))
  const [gps, setGps] = React.useState<GpsState>({
    status: "idle",
    coordinates: null,
  })

  React.useEffect(() => {
    if (!data.isClockingEnabled || data.nextAction === "clock_out") {
      return
    }

    if (!("geolocation" in navigator)) {
      setGps({
        status: "error",
        coordinates: null,
      })
      return
    }

    setGps({
      status: "checking",
      coordinates: null,
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          status: "ready",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
          },
        })
      },
      () => {
        setGps({
          status: "error",
          coordinates: null,
        })
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 15000,
      },
    )
  }, [data.isClockingEnabled, data.nextAction])

  const canSubmit =
    data.isClockingEnabled && !mutation.isPending
  const isSplitClockIn =
    data.nextAction === "clock_in" && data.matchedShift?.shiftType === "split"
  const splitSegmentStates =
    isSplitClockIn && data.matchedShift
      ? getSplitSegmentStates({
          completedSegments: data.completedShiftSegments,
          segments: data.matchedShift.segments,
        })
      : []

  function submitClock(shiftSegment?: ClockShiftSegment) {
    mutation.mutate({
      action: data.nextAction,
      gps:
        data.nextAction === "clock_in" && gps.status === "ready"
          ? gps.coordinates
          : null,
      shiftSegment,
    })
  }

  return (
    <div className="min-h-dvh bg-[#f7f9ff] px-4 py-5 text-[#080d23]">
      <main className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md flex-col gap-4">
        <header className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#075cff] text-white shadow-sm">
            <ClockIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{data.location.name}</p>
            <p className="truncate text-xs text-[#687087]">{data.clockLabel}</p>
          </div>
        </header>

        {data.setupMessage ? (
          <Alert className="rounded-xl border-[#dbe3ff] bg-white">
            <AlertTitle>{data.setupMessage}</AlertTitle>
            <AlertDescription>
              A manager can finish setup or use an override if you need to start
              work now.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-[#dbe3ff] bg-white shadow-[0_16px_40px_rgba(27,42,89,0.10)]">
          <CardHeader>
            <CardTitle className="text-base">Time clock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-[#687087]">
                Team member
              </p>
              <p className="mt-1 text-xl font-semibold">{data.employee.name}</p>
            </div>

            <div className="rounded-xl border border-[#dbe3ff] bg-[#f4f7ff] p-4">
              <p className="text-xs font-medium uppercase text-[#687087]">
                Current status
              </p>
              <p className="mt-1 text-lg font-semibold">
                {data.openEntry ? "Clocked in" : "Not clocked in"}
              </p>
              {data.openEntry ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-[#687087]">
                    Since {formatDateTime(data.openEntry.clockedInAt)}
                  </p>
                  <span className="rounded-lg bg-white px-2 py-1 font-mono text-sm font-semibold text-[#080d23]">
                    {formatElapsedTime(
                      getElapsedMilliseconds(
                        data.openEntry.clockedInAt,
                        liveNow,
                      ),
                    )}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-[#dbe3ff] bg-white p-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 text-[#075cff]" />
                <div>
                  <p className="text-sm font-semibold">
                    {data.matchedShift ? "Matched shift" : "No matched shift"}
                  </p>
                  <p className="mt-1 text-xs text-[#687087]">
                    {data.matchedShift
                      ? `${data.matchedShift.dateLabel}, ${data.matchedShift.timeLabel} - ${data.matchedShift.zoneName}`
                      : "Clocking is allowed, but this entry will need manager review."}
                  </p>
                </div>
              </div>
            </div>

            {isSplitClockIn && data.matchedShift ? (
              <div className="grid gap-2">
                {splitSegmentStates.map(({ disabled, label, segment }) => {
                  return (
                    <Button
                      key={segment.key}
                      size="lg"
                      className="h-auto min-h-14 w-full rounded-xl py-3 text-base"
                      disabled={!canSubmit || disabled}
                      onClick={() => submitClock(segment.key)}
                    >
                      {mutation.isPending ? <Spinner /> : null}
                      <span className="flex flex-col items-center gap-0.5">
                        <span>{label}</span>
                        <span className="text-xs font-medium opacity-80">
                          {segment.timeLabel}
                        </span>
                      </span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <Button
                size="lg"
                className="h-14 w-full rounded-xl text-base"
                disabled={!canSubmit}
                onClick={() => submitClock(data.matchedShift?.segments[0]?.key)}
              >
                {mutation.isPending ? <Spinner /> : null}
                {data.nextAction === "clock_in" ? "Clock in" : "Clock out"}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function getSplitSegmentStates({
  completedSegments,
  segments,
}: {
  completedSegments: ClockShiftSegment[]
  segments: NonNullable<EmployeeClockPageData["matchedShift"]>["segments"]
}) {
  const firstComplete = completedSegments.includes("split_first")
  const secondComplete = completedSegments.includes("split_second")

  return segments.map((segment) => {
    if (segment.key === "split_first") {
      return {
        disabled: firstComplete || secondComplete,
        label: firstComplete ? "First half complete" : "Clock in - First half",
        segment,
      }
    }

    if (segment.key === "split_second") {
      const isLocked = !firstComplete

      return {
        disabled: isLocked || secondComplete,
        label: secondComplete
          ? "Second half complete"
          : isLocked
            ? "Second half"
            : "Clock in - Second half",
        segment,
      }
    }

    return {
      disabled: completedSegments.includes(segment.key),
      label: `Clock in - ${segment.label}`,
      segment,
    }
  })
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value))
}

export { EmployeeClockPage }
