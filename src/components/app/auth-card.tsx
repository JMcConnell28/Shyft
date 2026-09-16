import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const authButtonClassName =
  "h-10 w-full rounded-lg text-sm font-bold shadow-none"

function AuthCard({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#dce3ef] bg-white shadow-[0_5px_18px_rgba(30,50,96,0.045)]">
      <header className="flex items-start gap-3 border-b border-[#edf0f6] px-4 py-4 sm:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-blue-600">
          <Icon className="size-[18px]" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-sm font-bold tracking-[-0.015em] text-[#10204b]">
            {title}
          </h2>
          <p className="mt-1 text-[11px] leading-[1.15rem] font-medium text-[#7180a2]">
            {description}
          </p>
        </div>
      </header>
      <div className="p-4 sm:p-5 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:font-bold [&_[data-slot=field-label]]:text-[#26365f] [&_[data-slot=input]]:h-10 [&_[data-slot=input]]:rounded-lg [&_[data-slot=input]]:border-[#dfe4ef] [&_[data-slot=input]]:bg-white [&_[data-slot=input]]:px-3 [&_[data-slot=input]]:text-sm [&_[data-slot=input]]:text-[#10204b] [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:placeholder:text-[#9aa4ba] [&_[data-slot=input]]:focus-visible:border-[#236cff] [&_[data-slot=input]]:focus-visible:ring-blue-100">
        {children}
      </div>
    </section>
  )
}

function AuthStatusMessage({
  children,
  tone = "success",
}: {
  children: ReactNode
  tone?: "success" | "neutral"
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border px-3.5 py-3 text-xs leading-5 font-medium",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-[#dfe4ef] bg-[#f8faff] text-[#657398]"
      )}
    >
      {children}
    </div>
  )
}

export { AuthCard, AuthStatusMessage, authButtonClassName }
