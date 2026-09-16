import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

function SettingsSection({
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
    <section className="grid overflow-hidden rounded-xl border border-[#dce3ef] bg-white shadow-[0_3px_12px_rgba(31,51,91,0.035)] md:grid-cols-[12.5rem_minmax(0,1fr)]">
      <header className="border-b border-[#e9edf5] p-3.5 md:border-r md:border-b-0 md:p-4">
        <div className="flex items-center gap-3">
          <Icon className="size-[18px] shrink-0 text-blue-600" />
          <h2 className="text-sm font-bold tracking-[-0.015em] text-[#10204b]">
            {title}
          </h2>
        </div>
        <p className="mt-1.5 text-[11px] leading-[1.15rem] font-medium text-[#7180a2]">
          {description}
        </p>
      </header>
      <div className="divide-y divide-[#e9edf5] px-3.5 sm:px-4">{children}</div>
    </section>
  )
}

export { SettingsSection }
