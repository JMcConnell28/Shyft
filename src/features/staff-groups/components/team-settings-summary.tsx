import { Layers3Icon, UserRoundCheckIcon, UserRoundXIcon, UsersIcon } from "lucide-react"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"
import { getTeamSettingsSummary } from "@/features/staff-groups/utils/team-settings"

function TeamSettingsSummary({
  employees,
  groups,
}: {
  employees: Array<StaffGroupSettingsEmployee>
  groups: Array<StaffGroupSettingsGroup>
}) {
  const summary = getTeamSettingsSummary(employees, groups)

  return (
    <section className="grid overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_5px_18px_rgba(30,50,96,0.04)] sm:grid-cols-2 lg:grid-cols-4">
      <SummaryItem
        icon={UsersIcon}
        label="Total employees"
        value={summary.totalEmployees}
        detail="Active at this location"
        tone="blue"
      />
      <SummaryItem
        icon={UserRoundCheckIcon}
        label="Active employees"
        value={summary.activeEmployees}
        detail="Currently active"
        tone="green"
      />
      <SummaryItem
        icon={Layers3Icon}
        label="Groups in use"
        value={summary.groupsInUse}
        detail={`${groups.length} available`}
        tone="purple"
      />
      <SummaryItem
        icon={UserRoundXIcon}
        label="Inactive employees"
        value={summary.inactiveEmployees}
        detail="Still assigned here"
        tone="orange"
      />
    </section>
  )
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof UsersIcon
  label: string
  value: number
  detail: string
  tone: "blue" | "green" | "purple" | "orange"
}) {
  const toneClassName = {
    blue: "bg-[#eef4ff] text-[#0968f5]",
    green: "bg-[#eefaf1] text-[#16a34a]",
    purple: "bg-[#f4efff] text-[#7c3aed]",
    orange: "bg-[#fff4eb] text-[#f97316]",
  }[tone]

  return (
    <div className="flex items-center gap-3 border-b border-[#e8ecf4] p-4 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-child(n+3)]:border-b-0 lg:border-r lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${toneClassName}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#61709a]">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-[-0.03em] text-[#10204b]">
          {value}
        </p>
        <p className="truncate text-[11px] text-[#7c87a8]">{detail}</p>
      </div>
    </div>
  )
}

export { TeamSettingsSummary }
