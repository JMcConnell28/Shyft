import { Building2Icon, Clock3Icon, MapPinIcon, UsersIcon } from "lucide-react"

import type { TimeAttendanceAddressValue } from "@/features/billing/components/time-attendance-address-fields"

function ReviewStep({
  organizationName,
  locationName,
  zoneNames,
  addonEnabled,
  address,
  onEdit,
}: {
  organizationName: string
  locationName: string
  zoneNames: Array<string>
  addonEnabled: boolean
  address: TimeAttendanceAddressValue
  onEdit: (step: number) => void
}) {
  return (
    <section>
      <div className="mx-auto mb-5 max-w-[540px] text-center">
        <h1 className="font-heading text-2xl font-extrabold tracking-[-0.05em] text-[#111f45] sm:text-[2rem]">
          Review and create
        </h1>
        <p className="mt-1.5 text-xs leading-5 text-[#56698d] sm:text-sm">
          Take a final look at your setup. Then you’ll head to your workspace.
        </p>
      </div>
      <div className="mx-auto max-w-[540px] divide-y divide-[#dce5f4] rounded-xl border border-[#dce5f4] px-3 sm:px-4">
        <ReviewRow
          icon={Building2Icon}
          label="Organisation"
          value={organizationName}
        />
        <ReviewRow
          icon={MapPinIcon}
          label="First location"
          value={locationName}
          onEdit={() => onEdit(0)}
        />
        <ReviewRow
          icon={UsersIcon}
          label="Zones"
          value={zoneNames.join(", ")}
          onEdit={() => onEdit(1)}
        />
        <ReviewRow
          icon={Clock3Icon}
          label="Time & Attendance"
          value={addonEnabled ? "Enabled" : "Not now"}
          detail={
            addonEnabled
              ? [address.line1, address.city, address.postcode]
                  .filter(Boolean)
                  .join(", ")
              : undefined
          }
          onEdit={() => onEdit(2)}
        />
      </div>
    </section>
  )
}

function ReviewRow({
  icon: Icon,
  label,
  value,
  detail,
  onEdit,
}: {
  icon: typeof Building2Icon
  label: string
  value: string
  detail?: string
  onEdit?: () => void
}) {
  return (
    <div className="flex min-h-[62px] items-center gap-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff] text-[#1264e9]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#657797]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#152750]">{value}</p>
        {detail ? (
          <p className="truncate text-xs text-[#657797]">{detail}</p>
        ) : null}
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="min-h-10 shrink-0 px-1 text-sm font-semibold text-[#075fe6] underline underline-offset-4"
        >
          Edit
        </button>
      ) : null}
    </div>
  )
}

export { ReviewStep }
