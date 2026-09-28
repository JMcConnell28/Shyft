"use client"

import { StatusBadge } from "@/components/ui/status-badge"
import { CopyableValue } from "@/features/clock-stations/components/copyable-value"
import type { ClockStationLocation, ClockStationTag } from "@/features/clock-stations/types"
import { createClockTagSetupUrl } from "@/features/clock-stations/utils/setup-url"

function ClockStationLocationSection({
  appBaseUrl,
  location,
  tags,
}: {
  appBaseUrl: string | null
  location: ClockStationLocation
  tags: ClockStationTag[]
}) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="font-semibold text-slate-900">{location.name}</h2>
        {location.organizationName && (
          <p className="text-sm text-slate-500">{location.organizationName}</p>
        )}
      </div>
      {tags.length === 0 ? (
        <p className="text-sm text-slate-500">No NTAG setup data has been generated yet.</p>
      ) : (
        tags.map((tag) => (
          <div key={tag.id} className="space-y-3 rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{tag.label}</h3>
              <StatusBadge tone={tag.isActive ? "good" : "neutral"}>
                {tag.isActive ? "active" : "inactive"}
              </StatusBadge>
            </div>
            {tag.publicId && <CopyableValue label="Tag ID" value={tag.publicId} />}
            {tag.aesKeyHex && <CopyableValue label="AES key" value={tag.aesKeyHex} />}
            {appBaseUrl && tag.publicId && (
              <CopyableValue
                label="Setup URL"
                value={createClockTagSetupUrl(appBaseUrl, tag.publicId)}
              />
            )}
            <p className="text-xs text-slate-500">Last seen counter: {tag.lastSeenCounter}</p>
          </div>
        ))
      )}
    </section>
  )
}

export { ClockStationLocationSection }
