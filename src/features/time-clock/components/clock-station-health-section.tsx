import { formatDistanceToNowStrict } from "date-fns"
import { Link } from "@tanstack/react-router"
import { ActivityIcon, ExternalLinkIcon } from "lucide-react"

import type { ClockSettingsLocation } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import { ClockSettingsSection } from "@/features/time-clock/components/clock-settings-section"
import { cn } from "@/lib/utils"

function ClockStationHealthSection({
  location,
  workspaceSlug,
}: {
  location: ClockSettingsLocation
  workspaceSlug: string
}) {
  const { stationHealth } = location

  return (
    <ClockSettingsSection
      description="A quick operational view of the NFC stations assigned to this location."
      icon={ActivityIcon}
      title="Station health"
    >
      <div className="py-4">
        <div className="grid grid-cols-3 divide-x divide-[#edf0f6]">
          <HealthMetric
            label="Registered"
            value={stationHealth.registeredStations.toString()}
          />
          <HealthMetric
            label="Last tap"
            value={formatLastTap(stationHealth.lastSuccessfulTapAt)}
          />
          <HealthMetric
            label="Failed today"
            tone={stationHealth.failedTapsToday > 0 ? "warning" : "positive"}
            value={stationHealth.failedTapsToday.toString()}
          />
        </div>
        <Button
          className="mt-4 h-9 w-full rounded-lg border-[#cbd9f8] bg-white text-[#1769ff] shadow-none hover:bg-blue-50"
          nativeButton={false}
          render={
            <Link
              params={{ workspaceSlug }}
              to="/app/$workspaceSlug/time-clock"
            />
          }
          variant="outline"
        >
          View time tracking
          <ExternalLinkIcon className="size-3.5" />
        </Button>
      </div>
    </ClockSettingsSection>
  )
}

function HealthMetric({
  label,
  tone = "default",
  value,
}: {
  label: string
  tone?: "default" | "positive" | "warning"
  value: string
}) {
  return (
    <div className="min-w-0 px-2 text-center sm:px-4">
      <p className="truncate text-[10px] font-semibold text-[#7180a2] sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-xs font-bold sm:text-sm",
          tone === "default" && "text-[#14214a]",
          tone === "positive" && "text-emerald-600",
          tone === "warning" && "text-orange-600"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function formatLastTap(value: string | null) {
  if (!value) return "No taps yet"
  return `${formatDistanceToNowStrict(new Date(value))} ago`
}

export { ClockStationHealthSection }
