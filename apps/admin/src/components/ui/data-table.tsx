import * as React from "react"

import { cn } from "@/lib/utils"

function DataTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "min-w-0 xl:overflow-hidden xl:rounded-lg xl:border xl:border-slate-200 xl:bg-white",
        className
      )}
    >
      <table className="block w-full border-collapse text-left text-sm xl:table [&_tbody]:block xl:[&_tbody]:table-row-group">
        {children}
      </table>
    </div>
  )
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="hidden border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase xl:table-header-group">
      {children}
    </thead>
  )
}

function TableCell({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <td
      className={cn(
        "grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] gap-2 px-1 py-2 align-top xl:table-cell xl:px-4 xl:py-3",
        className
      )}
    >
      <span className="pt-0.5 text-xs font-semibold text-slate-500 xl:hidden">
        {label}
      </span>
      <div className="min-w-0 break-words xl:contents">{children}</div>
    </td>
  )
}

function TableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <th className={cn("px-4 py-3", className)}>{children}</th>
}

function TableRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <tr
      className={cn(
        "mb-3 block rounded-lg border border-slate-200 bg-white p-3 last:mb-0 xl:table-row xl:rounded-none xl:border-0 xl:border-b xl:border-slate-100 xl:p-0 xl:last:border-0",
        className
      )}
    >
      {children}
    </tr>
  )
}

export { DataTable, TableCell, TableHead, TableHeaderCell, TableRow }
