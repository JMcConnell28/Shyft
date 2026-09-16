import { LockKeyholeIcon } from "lucide-react"
import type { ReactNode } from "react"

function WorkplaceSettingRow({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <div className="grid min-h-[3.75rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5">
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

function WorkplaceReadOnlyValue({ value }: { value: string }) {
  return (
    <span className="flex max-w-48 items-center justify-end gap-1.5 text-right text-xs font-bold text-[#46577d] sm:max-w-64">
      <LockKeyholeIcon className="size-3.5 shrink-0 text-[#9aa6bf]" />
      <span className="truncate">{value}</span>
    </span>
  )
}

export { WorkplaceReadOnlyValue, WorkplaceSettingRow }
