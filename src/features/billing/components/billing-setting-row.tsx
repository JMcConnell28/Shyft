import type { ReactNode } from "react"

import type { BillingSettingsStatus } from "@/features/billing/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/panelui/badge"

function BillingSettingRow({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <div className="grid min-h-[3.5rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#14214a]">{title}</p>
        <p className="mt-0.5 text-[10px] leading-3.5 font-medium text-[#7180a2] sm:text-[11px]">
          {description}
        </p>
      </div>
      <div className="flex min-w-0 items-center justify-end">{children}</div>
    </div>
  )
}

function BillingSettingValue({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "positive" | "warning"
}) {
  return (
    <span
      className={cn(
        "text-right text-xs font-bold",
        tone === "default" && "text-[#46577d]",
        tone === "positive" && "text-emerald-600",
        tone === "warning" && "text-orange-600"
      )}
    >
      {children}
    </span>
  )
}

const billingBadgeVariants = {
  positive: "success",
  warning: "warning",
  danger: "destructive",
  neutral: "info",
} as const

function BillingStatusPill({
  label,
  tone,
}: {
  label: string
  tone: BillingSettingsStatus["tone"]
}) {
  return (
    <Badge variant={billingBadgeVariants[tone]} className="capitalize">
      {label}
    </Badge>
  )
}

export { BillingSettingRow, BillingSettingValue, BillingStatusPill }
