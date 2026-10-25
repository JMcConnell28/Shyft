import { StationRequestCard } from "./station-request"
import type { ClockStationTag } from "@/features/clock-stations/types"
import type { CustomerLocation } from "../types"
import { LocationFeatureFlags } from "@/features/feature-flags/components/location-feature-flags"
import { ClockStationLocationSection } from "@/features/clock-stations/components/clock-station-location"
import { formatDateTime } from "@/lib/utils"

function CustomerLocationSection({
  location,
  customerName,
  canManage,
  canManageFlags = false,
  tags,
  appBaseUrl,
  tagError,
  tagsLoading,
}: {
  location: CustomerLocation
  customerName: string
  canManageFlags?: boolean
  canManage: boolean
  tags: Array<ClockStationTag>
  appBaseUrl: string | null
  tagError: boolean
  tagsLoading: boolean
}) {
  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">{location.name}</h2>
      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-500">Billing</p>
          <p>{location.billingStatus ?? "Not subscribed"}</p>
          <p className="mt-1 text-xs text-slate-500">
            Trial ends {formatDateTime(location.trialEndsAt)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Time & Attendance</p>
          <p>{location.addonStatus ?? "Not enabled"}</p>
        </div>
        <div>
          <p className="text-slate-500">Subscription payment</p>
          <p>
            {location.paymentConfirmedAt
              ? formatDateTime(location.paymentConfirmedAt)
              : "Awaiting payment after trial"}
          </p>
          {location.invoiceId && (
            <p className="text-xs break-all text-slate-500">
              {location.invoiceId}
            </p>
          )}
        </div>
      </div>
      {canManageFlags && <LocationFeatureFlags locationId={location.id} />}
      {location.requests.map((request) => (
        <StationRequestCard
          key={request.id}
          request={request}
          canManage={canManage}
          tags={tags.filter(
            (tag) =>
              !location.requests.some((item) => item.clockTagId === tag.id)
          )}
          tagsUnavailable={tagsLoading || tagError}
        />
      ))}
      {location.requests.length === 0 && (
        <p className="text-sm text-slate-500">
          No stations requested for this location yet.
        </p>
      )}
      {canManage && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h3 className="font-semibold">NFC tag setup</h3>
          {tagsLoading ? (
            <p role="status" className="text-sm text-slate-500">
              Loading NFC setup…
            </p>
          ) : tagError ? (
            <p role="alert" className="text-sm text-red-700">
              Could not load NFC setup. Refresh to try again.
            </p>
          ) : (
            <ClockStationLocationSection
              appBaseUrl={appBaseUrl}
              location={{
                id: location.id,
                name: location.name,
                organizationName: customerName,
              }}
              tags={tags}
            />
          )}
        </div>
      )}
    </section>
  )
}
export { CustomerLocationSection }
