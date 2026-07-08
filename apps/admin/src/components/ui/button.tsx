import * as React from "react"

import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
}

function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-slate-950 text-white hover:bg-slate-800",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export { Button }
