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
        "overflow-hidden rounded-lg border border-slate-200 bg-white",
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  )
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
      {children}
    </thead>
  )
}

function TableCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>
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
    <tr className={cn("border-b border-slate-100 last:border-0", className)}>
      {children}
    </tr>
  )
}

export { DataTable, TableCell, TableHead, TableHeaderCell, TableRow }
